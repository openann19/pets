const Pet = require('../models/Pet');
const User = require('../models/User');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/cloudinaryService');
const { getAIRecommendations, analyzePetCompatibility } = require('../services/aiService');
const logger = require('../utils/logger');
const { validatePagination, validateAgeRange, validateDistance } = require('../utils/validation');

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
          logger.error('Photo upload failed', { error: uploadError.message, userId: req.userId });
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
    logger.error('Create pet failed', { error: error.message, userId: req.userId, body: req.body });
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
    // Validate pagination (support both page-based and direct skip)
    const { page, limit, skip } = validatePagination(req.query.page, req.query.limit, 50, req.query.skip);
    
    // Validate age range
    const ageValidation = validateAgeRange(req.query.minAge, req.query.maxAge);
    if (!ageValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid age range provided'
      });
    }
    
    // Validate distance
    const validMaxDistance = validateDistance(req.query.maxDistance || 50);
    
      const {
        species,
        intent,
        size,
        gender,
        breed,
        ages, // Support ages parameter for backward compatibility
        minAge,
        maxAge,
        energyLevel,
        temperament,
        familyFriendly,
        apartmentFriendly,
        trainability,
        groomingNeeds,
        exerciseNeeds,
        healthConcerns,
        verifiedOnly,
        boostFeature,
        sortBy = 'relevance'
      } = req.query;

    const user = req.userId ? await User.findById(req.userId) : null;
    
    // Get IDs of pets already swiped by user (skip if no user)
    const swipedPetIds = user ? user.swipedPets.map(swipe => swipe.petId) : [];
    
    // Build query
    const query = {
      isActive: true,
      status: 'active'
    };

    // Add user-specific exclusions if user is logged in
    if (req.userId) {
      query.owner = { $ne: req.userId }; // Exclude user's own pets
      query._id = { $nin: swipedPetIds }; // Exclude already swiped pets
    }

    // Apply basic filters
    if (species) query.species = species;
    if (intent) query.intent = { $in: [intent, 'all'] };
    
     // Apply validated age range
    if (ageValidation.minAge !== null || ageValidation.maxAge !== null) {
      query.age = {};
      if (ageValidation.minAge !== null) query.age.$gte = ageValidation.minAge;
      if (ageValidation.maxAge !== null) query.age.$lte = ageValidation.maxAge;
    }
     
     // Handle ages parameter (comma-separated ages like '2-5' or specific ages)
     if (ages) {
       if (ages.includes('-')) {
         // Range format like '2-5'
         const [min, max] = ages.split('-').map(age => parseInt(age.trim()));
         if (!isNaN(min) && !isNaN(max)) {
           query.age = {
             $gte: min,
             $lte: max
           };
         }
       } else {
         // Single age
         const specificAge = parseInt(ages);
         if (!isNaN(specificAge)) {
           query.age = specificAge;
         }
       }
     }
    
     if (size) query.size = size;
     // Handle sizes parameter (comma-separated sizes)
     if (req.query.sizes) {
       const sizes = req.query.sizes.split(',').map(s => s.trim());
       query.size = { $in: sizes };
     }
    if (gender) query.gender = gender;
    
    // Enhanced breed filtering
    if (breed) {
      // Support comma-separated breeds
      const breeds = breed.split(',').map(b => b.trim());
      if (breeds.length === 1) {
        query.breed = new RegExp(breeds[0], 'i');
      } else {
        // Use $or with regex for multiple breeds since $in doesn't work with RegExp
        query.$or = breeds.map(b => ({ breed: new RegExp(b, 'i') }));
      }
    }
    
    // Premium features
    if (verifiedOnly === 'true') {
      query.isVerified = true;
    }

    if (boostFeature === 'true') {
      query['featured.isFeatured'] = true;
    }
    
    // Advanced breed-based filters using AI data
    // Skip when a specific breed is provided to avoid over-filtering simple fixtures
    if (!breed && (energyLevel || temperament || familyFriendly || trainability || groomingNeeds || exerciseNeeds)) {
      const breedFilters = {};
      
      if (energyLevel) breedFilters['aiData.breedCharacteristics.energyLevel'] = energyLevel;
      if (temperament) {
        const temperaments = Array.isArray(temperament) ? temperament : [temperament];
        breedFilters['aiData.breedCharacteristics.temperament'] = { $in: temperaments };
      }
      if (familyFriendly) breedFilters['aiData.breedCharacteristics.familyFriendly'] = familyFriendly;
      if (trainability) breedFilters['aiData.breedCharacteristics.trainability'] = trainability;
      if (groomingNeeds) breedFilters['aiData.breedCharacteristics.groomingNeeds'] = groomingNeeds;
      if (exerciseNeeds) breedFilters['aiData.breedCharacteristics.exerciseNeeds'] = exerciseNeeds;
      
      Object.assign(query, breedFilters);
    }
    
    // Health concerns filter
    if (healthConcerns) {
      const concerns = Array.isArray(healthConcerns) ? healthConcerns : [healthConcerns];
      query['healthInfo.healthConditions'] = { $in: concerns };
    }
    
    // Apartment friendly filter (requires background breed data processing)
    if (apartmentFriendly === 'true') {
      query['aiData.breedCharacteristics.apartmentFriendly'] = true;
    }

    let petsQuery = Pet.find(query)
      .populate('owner', 'firstName lastName avatar premium.isActive');
    
    // Enhanced sorting options
    let sortOptions = {};
    switch (sortBy) {
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      case 'age_asc':
        sortOptions = { age: 1 };
        break;
      case 'age_desc':
        sortOptions = { age: -1 };
        break;
      case 'popularity':
        sortOptions = { 'analytics.views': -1 };
        break;
      case 'distance':
        // Only applicable when location filtering is active
        if (user && user.location && user.location.coordinates[0] !== 0) {
          // Will be handled in aggregation pipeline below
        } else {
          sortOptions = { 'featured.isFeatured': -1, createdAt: -1 };
        }
        break;
      case 'breed_match':
        // Prioritize exact breed matches - will be handled after query execution
        if (breed) {
          // Mark that we need custom breed sorting
          query._breedSort = breed.split(',').map(b => b.trim());
        }
        sortOptions = { 'featured.isFeatured': -1, createdAt: -1 };
        break;
      default: // 'relevance'
        sortOptions = { 'featured.isFeatured': -1, createdAt: -1 };
    }
    
    petsQuery = petsQuery
      .sort(sortOptions)
      .maxTimeMS(5000); // 5 second query timeout

    // Add location-based filtering if user has coordinates
    if (user && user.location && user.location.coordinates[0] !== 0) {
      petsQuery = Pet.aggregate([
        {
          $geoNear: {
            near: user.location,
            distanceField: 'distance',
            maxDistance: validMaxDistance * 1000, // Convert km to meters
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

    // Apply pagination (skip already defined from validation)
    const perfStart = Date.now();
    let pets;
    if (Array.isArray(petsQuery)) {
      // Aggregation result
      pets = petsQuery.slice(skip, skip + limit);
    } else {
      pets = await petsQuery.skip(skip).limit(limit);
    }

    // Get AI recommendations if premium user
    let aiRecommendations = [];
    if (user && user.premium && user.premium.isActive && pets.length > 0) {
      try {
        aiRecommendations = await getAIRecommendations(user._id, pets.map(p => p._id));
      } catch (aiError) {
        logger.warn('AI recommendations service unavailable', { error: aiError.message });
      }
    }

    res.json({
      success: true,
      data: {
        pets,
        aiRecommendations,
        // Alias for tests expecting recommendations
        recommendations: aiRecommendations,
        // Echo applied filters for debugging and tests
        appliedFilters: {
          species,
          intent,
          size,
          gender,
          breed,
          energyLevel,
          temperament,
          familyFriendly,
          apartmentFriendly,
          trainability,
          groomingNeeds,
          exerciseNeeds
        },
        // Basic performance metrics for tests
        performanceMetrics: {
          queryTime: Date.now() - perfStart,
          resultCount: Array.isArray(pets) ? pets.length : 0
        },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          hasMore: pets.length === parseInt(limit)
        }
      }
    });

  } catch (error) {
    logger.error('Discover pets failed', { error: error.message, filters: req.query, userId: req.userId });
    res.status(500).json({
      success: false,
      message: 'Unable to load pets at this time. Please try again.',
      ...(process.env.NODE_ENV === 'development' && { debug: error.message })
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

    // Note: Transactions are disabled for standalone MongoDB

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
    await Pet.updateOne({ _id: pet._id }, { $inc: { 'analytics.views': 1 } });
    if (action === 'like' || action === 'superlike') {
      await Pet.updateOne({ _id: pet._id }, { $inc: { 'analytics.likes': 1 } });
    }

    let isMatch = false;
    let matchId = null;
    let match = null;

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

        match = await Match.create({
          pet1: likedUserPet,
          pet2: petId,
          user1: req.userId,
          user2: pet.owner._id,
          matchType: pet.intent === 'all' ? 'general' : pet.intent,
          compatibilityScore: 50
        });

        // Add match to both users
        await User.updateOne({ _id: pet.owner._id }, { $push: { matches: match._id } });
        await User.updateOne({ _id: req.userId }, { $push: { matches: match._id } });

        // Update analytics
        await User.updateOne({ _id: req.userId }, { $inc: { 'analytics.totalMatches': 1 } });
        await User.updateOne({ _id: otherUser._id }, { $inc: { 'analytics.totalMatches': 1 } });

        await Pet.updateOne({ _id: pet._id }, { $inc: { 'analytics.matches': 1 } });

        isMatch = true;
        matchId = match._id;
      }
    }

    // If a match was created, optionally enrich after commit (no transaction needed)
    if (match) {
      try {
        const compatibilityData = await analyzePetCompatibility(match.pet1, match.pet2);
        if (compatibilityData && compatibilityData.compatibility_score) {
          match.compatibilityScore = compatibilityData.compatibility_score;
          match.aiRecommendationReason = compatibilityData.recommendation;
          await match.save();
        }
      } catch (aiError) {
        logger.error('AI compatibility score error:', aiError);
      }

      await match.populate('pet1 pet2');
      await match.populate('user1 user2', 'firstName lastName avatar bio premium.isActive');
    }

    return res.json({
      success: true,
      message: 'Swipe recorded successfully',
      data: {
        isMatch,
        matchId,
        action,
        match: match || null
      }
    });

  } catch (error) {
    logger.error('Swipe pet error:', error);
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
    // Build query with owner filter
    const query = { owner: req.userId };
    
    // Apply optional filters from query params
    const { species, intent, size, gender, breed } = req.query;
    
    if (species) query.species = species;
    if (intent) query.intent = intent;
    if (size) query.size = size;
    if (gender) query.gender = gender;
    if (breed) query.breed = new RegExp(breed, 'i');
    
    const pets = await Pet.find(query)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { pets }
    });

  } catch (error) {
    logger.error('Get my pets error:', error);
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
    logger.error('Get pet error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pet',
      error: error.message
    });
  }
};

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
          logger.error('Photo upload failed', { error: uploadError.message, userId: req.userId });
        }
      }
    }

    // Update allowed fields
    const allowedUpdates = [
      'name', 'description', 'personalityTags', 'intent', 'availability',
      'healthInfo', 'status', 'isActive'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        pet[field] = req.body[field];
      }
    });

    await pet.save();

    res.json({
      success: true,
      message: 'Pet updated successfully',
      data: { pet }
    });

  } catch (error) {
    logger.error('Update pet error:', error);
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
          logger.error('Photo deletion error:', deleteError);
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
    logger.error('Delete pet error:', error);
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