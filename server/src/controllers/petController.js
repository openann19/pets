const Pet = require('../models/Pet');
const User = require('../models/User');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/cloudinaryService');
const { getAIRecommendations, analyzePetCompatibility } = require('../services/aiService');

// @desc    Create new pet
// @route   POST /api/pets
// @access  Private
const createPet = async (req, res) => {
  try {
    const {
      name, species, breed, age, gender, size, weight, color,
      description, personalityTags, intent, availability,
      healthInfo, specialNeeds
    } = req.body;

    // Handle photo uploads
    let photos = [];
    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        try {
          const uploadResult = await uploadToCloudinary(file.buffer, 'pets');
          photos.push({
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            isPrimary: photos.length === 0 // First photo is primary
          });
        } catch (uploadError) {
          console.error('Photo upload error:', uploadError);
        }
      }
    }

    // Get user's location for pet location
    const user = await User.findById(req.userId);

    const pet = new Pet({
      owner: req.userId,
      name,
      species,
      breed,
      age: parseInt(age),
      gender,
      size,
      weight: weight ? parseFloat(weight) : undefined,
      color: color || {},
      description,
      personalityTags: Array.isArray(personalityTags) ? personalityTags : [],
      intent,
      availability: availability || { isAvailable: true },
      healthInfo: healthInfo || {},
      photos,
      location: user.location || {
        type: 'Point',
        coordinates: [0, 0]
      }
    });

    await pet.save();

    // Add pet to user's pets array
    await User.findByIdAndUpdate(req.userId, {
      $push: { pets: pet._id }
    });

    // Populate owner info
    await pet.populate('owner', 'firstName lastName avatar');

    res.status(201).json({
      success: true,
      message: 'Pet created successfully',
      data: { pet }
    });

  } catch (error) {
    console.error('Create pet error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create pet',
      error: error.message
    });
  }
};

// @desc    Get all pets for discovery (with filters)
// @route   GET /api/pets/discover
// @access  Private
const discoverPets = async (req, res) => {
  try {
    const {
      species,
      intent,
      maxDistance = 50,
      minAge,
      maxAge,
      size,
      gender,
      breed,
      page = 1,
      limit = 10
    } = req.query;

    const user = await User.findById(req.userId);

    // Get IDs of pets already swiped by user
    const swipedPetIds = user.swipedPets.map(swipe => swipe.petId);

    // Build query
    const query = {
      owner: { $ne: req.userId }, // Exclude user's own pets
      _id: { $nin: swipedPetIds }, // Exclude already swiped pets
      isActive: true,
      status: 'active'
    };

    // Apply filters
    if (species) query.species = species;
    if (intent) query.intent = { $in: [intent, 'all'] };
    if (minAge || maxAge) {
      query.age = {};
      if (minAge) query.age.$gte = parseInt(minAge);
      if (maxAge) query.age.$lte = parseInt(maxAge);
    }
    if (size) query.size = size;
    if (gender) query.gender = gender;
    if (breed) query.breed = new RegExp(breed, 'i');

    let petsQuery = Pet.find(query)
      .populate('owner', 'firstName lastName avatar premium.isActive')
      .sort({ 'featured.isFeatured': -1, createdAt: -1 });

    // Add location-based filtering if user has coordinates
    if (user.location && user.location.coordinates[0] !== 0) {
      petsQuery = Pet.aggregate([
        {
          $geoNear: {
            near: user.location,
            distanceField: 'distance',
            maxDistance: maxDistance * 1000, // Convert km to meters
            spherical: true,
            query: query
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'owner',
            foreignField: '_id',
            as: 'owner',
            pipeline: [
              { $project: { firstName: 1, lastName: 1, avatar: 1, 'premium.isActive': 1 } }
            ]
          }
        },
        { $unwind: '$owner' },
        { $sort: { 'featured.isFeatured': -1, createdAt: -1 } }
      ]);
    }

    // Apply pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let pets;
    if (Array.isArray(petsQuery)) {
      // Aggregation result
      pets = petsQuery.slice(skip, skip + parseInt(limit));
    } else {
      pets = await petsQuery.skip(skip).limit(parseInt(limit));
    }

    // Get AI recommendations if premium user
    let aiRecommendations = [];
    if (user.premium.isActive && pets.length > 0) {
      try {
        aiRecommendations = await getAIRecommendations(user._id, pets.map(p => p._id));
      } catch (aiError) {
        console.error('AI recommendations error:', aiError);
      }
    }

    res.json({
      success: true,
      data: {
        pets,
        aiRecommendations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          hasMore: pets.length === parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Discover pets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to discover pets',
      error: error.message
    });
  }
};

// @desc    Swipe on a pet
// @route   POST /api/pets/:petId/swipe
// @access  Private
const swipePet = async (req, res) => {
  try {
    const { petId } = req.params;
    const { action } = req.body; // 'like', 'pass', 'superlike'

    if (!['like', 'pass', 'superlike'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid swipe action'
      });
    }

    const user = await User.findById(req.userId);
    const pet = await Pet.findById(petId).populate('owner');

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    // Check if already swiped
    const alreadySwiped = user.swipedPets.find(swipe =>
      swipe.petId.toString() === petId
    );

    if (alreadySwiped) {
      return res.status(400).json({
        success: false,
        message: 'Already swiped on this pet'
      });
    }

    // Add swipe to user's record
    user.swipedPets.push({
      petId: petId,
      action: action
    });

    // Update analytics
    user.analytics.totalSwipes += 1;
    if (action === 'like' || action === 'superlike') {
      user.analytics.totalLikes += 1;
    }

    await user.save();

    // Update pet analytics
    await pet.updateAnalytics('view');
    if (action === 'like' || action === 'superlike') {
      await pet.updateAnalytics('like');
    }

    let isMatch = false;
    let matchId = null;

    // Check for mutual match if it's a like/superlike
    if (action === 'like' || action === 'superlike') {
      const otherUser = await User.findById(pet.owner._id);
      const mutualLike = otherUser.swipedPets.find(swipe =>
        user.pets.some(userPetId =>
          userPetId.toString() === swipe.petId.toString() &&
          (swipe.action === 'like' || swipe.action === 'superlike')
        )
      );

      if (mutualLike) {
        // Create match
        const Match = require('../models/Match');

        // Find which of user's pets was liked
        const likedUserPet = user.pets.find(userPetId =>
          userPetId.toString() === mutualLike.petId.toString()
        );

        const match = new Match({
          pet1: likedUserPet,
          pet2: petId,
          user1: req.userId,
          user2: pet.owner._id,
          matchType: pet.intent === 'all' ? 'general' : pet.intent,
          compatibilityScore: 50 // Default score, will be updated below
        });

        await match.save();

        // Get real compatibility score from AI service
        try {
          const compatibilityData = await analyzePetCompatibility(likedUserPet, petId);
          if (compatibilityData && compatibilityData.compatibility_score) {
            match.compatibilityScore = compatibilityData.compatibility_score;
            match.aiRecommendationReason = compatibilityData.recommendation;
            await match.save();
          }
        } catch (aiError) {
          console.error('AI compatibility score error:', aiError);
          // Continue without AI score if it fails
        }

        // Add match to both users
        await User.findByIdAndUpdate(pet.owner._id, {
          $push: { matches: match._id }
        });
        await User.findByIdAndUpdate(req.userId, {
          $push: { matches: match._id }
        });

        // Update analytics
        user.analytics.totalMatches += 1;
        otherUser.analytics.totalMatches += 1;
        await user.save();
        await otherUser.save();

        await pet.updateAnalytics('match');

        isMatch = true;
        matchId = match._id;

        // Populate the match with all necessary data to avoid API waterfall
        await match.populate('pet1 pet2');
        await match.populate('user1 user2', 'firstName lastName avatar bio premium.isActive');
      }
    }

    res.json({
      success: true,
      message: 'Swipe recorded successfully',
      data: {
        isMatch,
        matchId,
        action,
        // Include match data to avoid API waterfall on frontend
        match: isMatch ? match : null
      }
    });

  } catch (error) {
    console.error('Swipe pet error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record swipe',
      error: error.message
    });
  }
};

// @desc    Get user's pets
// @route   GET /api/pets/my-pets
// @access  Private
const getMyPets = async (req, res) => {
  try {
    const pets = await Pet.find({ owner: req.userId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { pets }
    });

  } catch (error) {
    console.error('Get my pets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pets',
      error: error.message
    });
  }
};

// @desc    Get single pet
// @route   GET /api/pets/:id
// @access  Private
const getPet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id)
      .populate('owner', 'firstName lastName avatar bio premium.isActive');

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    // Update view analytics if not the owner
    if (pet.owner._id.toString() !== req.userId.toString()) {
      await pet.updateAnalytics('view');
    }

    res.json({
      success: true,
      data: { pet }
    });

  } catch (error) {
    console.error('Get pet error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pet',
      error: error.message
    });
  }
};

const { sanitizeObject } = require('../utils/sanitize');

// @desc    Update pet
// @route   PUT /api/pets/:id
// @access  Private
const updatePet = async (req, res) => {
  try {
    const pet = await Pet.findOne({ _id: req.params.id, owner: req.userId });

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found or you are not the owner'
      });
    }

    // Handle new photo uploads
    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        try {
          const uploadResult = await uploadToCloudinary(file.buffer, 'pets');
          pet.photos.push({
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            isPrimary: pet.photos.length === 0
          });
        } catch (uploadError) {
          console.error('Photo upload error:', uploadError);
        }
      }
    }

    // Sanitize input to prevent XSS
    const sanitizedBody = sanitizeObject(req.body);

    // Update allowed fields
    const allowedUpdates = [
      'name', 'description', 'personalityTags', 'intent', 'availability',
      'healthInfo', 'status', 'isActive'
    ];

    allowedUpdates.forEach(field => {
      if (sanitizedBody[field] !== undefined) {
        pet[field] = sanitizedBody[field];
      }
    });

    await pet.save();

    res.json({
      success: true,
      message: 'Pet updated successfully',
      data: { pet }
    });

  } catch (error) {
    console.error('Update pet error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update pet',
      error: error.message
    });
  }
};

// @desc    Delete pet
// @route   DELETE /api/pets/:id
// @access  Private
const deletePet = async (req, res) => {
  try {
    const pet = await Pet.findOne({ _id: req.params.id, owner: req.userId });

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found or you are not the owner'
      });
    }

    // Delete photos from Cloudinary
    for (let photo of pet.photos) {
      if (photo.publicId) {
        try {
          await deleteFromCloudinary(photo.publicId);
        } catch (deleteError) {
          console.error('Photo deletion error:', deleteError);
        }
      }
    }

    await Pet.findByIdAndDelete(req.params.id);

    // Remove pet from user's pets array
    await User.findByIdAndUpdate(req.userId, {
      $pull: { pets: req.params.id }
    });

    res.json({
      success: true,
      message: 'Pet deleted successfully'
    });

  } catch (error) {
    console.error('Delete pet error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete pet',
      error: error.message
    });
  }
};

module.exports = {
  createPet,
  discoverPets,
  swipePet,
  getMyPets,
  getPet,
  updatePet,
  deletePet
};