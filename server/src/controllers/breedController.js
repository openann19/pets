const BreedProfile = require('../models/BreedProfile');
const Pet = require('../models/Pet');
const logger = require('../utils/logger');
const { validatePagination, sanitizeSearchQuery } = require('../utils/validation');

// @desc    Get all breeds with filtering
// @route   GET /api/breeds
// @access  Public
const getBreeds = async (req, res) => {
  try {
    // Validate pagination
    const { page, limit, skip } = validatePagination(req.query.page, req.query.limit, 100);
    
    // Sanitize search query
    const searchQuery = sanitizeSearchQuery(req.query.search);
    
    const {
      species,
      size,
      energyLevel,
      exerciseNeeds,
      familyFriendly,
      apartmentFriendly,
      temperament
    } = req.query;

    let query = {};

    // Basic filters
    if (species) query.species = species;
    if (size) query.size = size;
    if (energyLevel) query.energyLevel = energyLevel;
    if (exerciseNeeds) query.exerciseNeeds = exerciseNeeds;
    if (familyFriendly) query.familyFriendly = familyFriendly;
    if (apartmentFriendly !== undefined) query.apartmentFriendly = apartmentFriendly === 'true';

    // Temperament filter (array)
    if (temperament) {
      const temperamentArray = Array.isArray(temperament) ? temperament : [temperament];
      query.temperament = { $in: temperamentArray };
    }

    // Search filter (using sanitized search query)
    if (searchQuery) {
      const searchRegex = new RegExp(searchQuery, 'i');
      query.$or = [
        { name: searchRegex },
        { alternateNames: { $in: [searchRegex] } }
      ];
    }

    const breeds = await BreedProfile.find(query)
      .select('name species size energyLevel temperament popularity')
      .sort({ popularity: -1 })
      .skip(skip)
      .limit(limit)
      .maxTimeMS(5000); // 5 second query timeout

    const total = await BreedProfile.countDocuments(query);

    // Get pet counts for each breed
    const breedCounts = await Pet.aggregate([
      { $match: { isActive: true, status: 'active' } },
      { $group: {
        _id: '$breed',
        count: { $sum: 1 }
      }}
    ]);

    const breedCountMap = breedCounts.reduce((acc, breed) => {
      acc[breed._id.toLowerCase()] = breed.count;
      return acc;
    }, {});

    // Add pet counts to breed data
    const breedsWithCounts = breeds.map(breed => ({
      ...breed.toObject(),
      availablePets: breedCountMap[breed.name.toLowerCase()] || 0
    }));

    res.json({
      success: true,
      data: {
        breeds: breedsWithCounts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    logger.error('Get breeds error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get breeds',
      error: error.message
    });
  }
};

// @desc    Get single breed with detailed info
// @route   GET /api/breeds/:name
// @access  Public
const getBreed = async (req, res) => {
  try {
    const { name } = req.params;
    
    const breed = await BreedProfile.findOne({
      $or: [
        { name: name.toLowerCase() },
        { alternateNames: { $in: [new RegExp(name, 'i')] } }
      ]
    });

    if (!breed) {
      return res.status(404).json({
        success: false,
        message: 'Breed not found'
      });
    }

    // Get similar breeds
    const similarBreeds = await BreedProfile.find({
      _id: { $ne: breed._id },
      species: breed.species,
      $or: [
        { temperament: { $in: breed.temperament } },
        { energyLevel: breed.energyLevel },
        { size: breed.size }
      ]
    })
    .select('name species size energyLevel temperament popularity')
    .limit(5)
    .sort({ popularity: -1 });

    // Get available pets of this breed
    const availablePets = await Pet.find({
      breed: { $regex: breed.name, $options: 'i' },
      isActive: true,
      status: 'active'
    })
    .countDocuments();

    res.json({
      success: true,
      data: {
        breed,
        similarBreeds,
        availablePets
      }
    });

  } catch (error) {
    logger.error('Get breed error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get breed details',
      error: error.message
    });
  }
};

// @desc    Get breed suggestions based on user preferences
// @route   POST /api/breeds/suggestions
// @access  Private
const getBreedSuggestions = async (req, res) => {
  try {
    const {
      species,
      livingSpace,
      familySize,
      energyPreference,
      groomingTime,
      exerciseLevel,
      experienceLevel
    } = req.body;

    let query = {};
    let priority = {};

    // Basic species filter
    if (species) query.species = species;

    // Living space consideration
    if (livingSpace === 'apartment') {
      query.apartmentFriendly = true;
      priority.apartmentFriendly = 5;
    }

    // Family considerations
    if (familySize === 'with_children') {
      query.kidFriendly = { $in: ['excellent', 'good'] };
      priority.kidFriendly = 5;
    }

    // Energy matching
    if (energyPreference === 'low') query.energyLevel = 'low';
    if (energyPreference === 'moderate') query.energyLevel = { $in: ['low', 'moderate'] };
    if (energyPreference === 'high') query.energyLevel = { $in: ['moderate', 'high'] };
    if (energyPreference === 'very-high') query.energyLevel = 'high';

    // Grooming time consideration
    if (groomingTime === 'minimal') query.groomingNeeds = 'minimal';
    if (groomingTime === 'moderate') query.groomingNeeds = { $in: ['minimal', 'moderate'] };
    if (groomingTime === 'extensive') query.groomingNeeds = { $in: ['moderate', 'high', 'extensive'] };

    // Exercise level matching
    if (exerciseLevel === 'minimal') query.exerciseNeeds = 'minimal';
    if (exerciseLevel === 'moderate') query.exerciseNeeds = { $in: ['minimal', 'moderate'] };
    if (exerciseLevel === 'high') query.exerciseNeeds = { $in: ['moderate', 'high'] };
    if (exerciseLevel === 'extensive') query.exerciseNeeds = { $in: ['high', 'extensive'] };

    // Experience level consideration
    if (experienceLevel === 'beginner') {
      query.trainability = 'easy';
      priority.trainability = 5;
    }

    const suggestions = await BreedProfile.find(query)
      .limit(20)
      .sort({ popularity: -1 });

    // Calculate suggestion scores based on preferences
    const scoredSuggestions = suggestions.map(breed => {
      let score = breed.popularity || 50;

      // Add bonus points based on priority matches
      if (priority.apartmentFriendly && breed.apartmentFriendly) score += 20;
      if (priority.kidFriendly && ['excellent', 'good'].includes(breed.kidFriendly)) score += 20;
      if (priority.trainability && breed.trainability === 'easy') score += 20;

      // Bonus for exact energy matches
      if (energyPreference && breed.energyLevel === energyPreference) score += 10;

      return {
        ...breed.toObject(),
        suggestionScore: Math.min(100, score)
      };
    });

    // Sort by suggestion score
    scoredSuggestions.sort((a, b) => b.suggestionScore - a.suggestionScore);

    res.json({
      success: true,
      data: {
        suggestions: scoredSuggestions.slice(0, 10),
        preferences: {
          species,
          livingSpace,
          familySize,
          energyPreference,
          groomingTime,
          exerciseLevel,
          experienceLevel
        }
      }
    });

  } catch (error) {
    logger.error('Get breed suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get breed suggestions',
      error: error.message
    });
  }
};

// @desc    Search breeds with autocomplete
// @route   GET /api/breeds/search/autocomplete
// @access  Public
const autocompleteBreeds = async (req, res) => {
  const { q, species, limit = 10 } = req.query;
  let fuzzyTerms = [];
  
  try {
    if (!q || q.length < 2) {
      return res.json({
        success: true,
        data: { suggestions: [] }
      });
    }

    // Enhanced fuzzy search logic - simple but effective approach
    const searchRegex = new RegExp(q, 'i');
    
    // Create fuzzy variations for common typos/missing letters
    fuzzyTerms = [q];
    
    // Handle common breed name variations
    if (q.includes('retriv')) {
      fuzzyTerms.push('retriever');
      fuzzyTerms.push('golden retriever');
      fuzzyTerms.push('labrador retriever');
    }
    if (q.includes('shepher')) {
      fuzzyTerms.push('german shepherd');
    }
    if (q.includes('shiba')) {
      fuzzyTerms.push('shiba inu');
    }
    
    // Create regex patterns for each fuzzy term
    const complexOrQueries = [
      { name: searchRegex }
    ];
    
    // Add fuzzy terms as regex for name field
    fuzzyTerms.forEach(term => {
      complexOrQueries.push({ name: { $regex: term, $options: 'i' } });
    });
    
    // Add alternateNames searches
    fuzzyTerms.forEach(term => {
      complexOrQueries.push({ alternateNames: { $elemMatch: { $regex: term, $options: 'i' } } });
    });
    
    let query = {
      $or: complexOrQueries
    };

    if (species) query.species = species;

    const suggestions = await BreedProfile.find(query)
      .select('name species size energyLevel popularity')
      .limit(parseInt(limit))
      .sort({ popularity: -1 });

    // Also search in pet breeds for breeds not in BreedProfile
    const petBreeds = await Pet.aggregate([
      { $match: { isActive: true, status: 'active', breed: searchRegex } },
      { $group: {
        _id: '$breed',
        count: { $sum: 1 }
      }},
      { $project: {
        _id: 0,
        breed: '$_id',
        count: 1
      }},
      { $limit: parseInt(limit) }
    ]);

    // Combine and deduplicate suggestions
    const suggestionsMap = new Map();
    
    suggestions.forEach(breed => {
      suggestionsMap.set(breed.name.toLowerCase(), {
        name: breed.name,
        species: breed.species,
        size: breed.size,
        energyLevel: breed.energyLevel,
        popularity: breed.popularity,
        isVerified: true,
        availablePets: 0
      });
    });

    petBreeds.forEach(breed => {
      const breedName = breed.breed.toLowerCase();
      if (!suggestionsMap.has(breedName)) {
        suggestionsMap.set(breedName, {
          name: breed.breed,
          species: species || 'unknown',
          size: 'unknown',
          energyLevel: 'unknown',
          popularity: 25,
          isVerified: false,
          availablePets: breed.count
        });
      }
    });

    const finalSuggestions = Array.from(suggestionsMap.values())
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: {
        suggestions: finalSuggestions
      }
    });

  } catch (error) {
    logger.error('Autocomplete breeds error:', error);
    logger.debug('Autocomplete query', { query: q, fuzzyTerms: fuzzyTerms || [] });
    res.status(500).json({
      success: false,
      message: 'Failed to autocomplete breeds',
      error: error.message
    });
  }
};

// @desc    Get breed stats for dashboard
// @route   GET /api/breeds/stats
// @access  Public
const getBreedStats = async (req, res) => {
  try {
    // Top breeds by pet count
    const topBreedsByCount = await Pet.aggregate([
      { $match: { isActive: true, status: 'active' } },
      { $group: {
        _id: '$breed',
        count: { $sum: 1 }
      }},
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Breeds by species
    const breedsBySpecies = await Pet.aggregate([
      { $match: { isActive: true, status: 'active' } },
      { $group: {
        _id: {
          species: '$species',
          breed: '$breed'
        },
        count: { $sum: 1 }
      }},
      { $group: {
        _id: '$_id.species',
        breeds: {
          $push: {
            breed: '$_id.breed',
            count: '$count'
          }
        }
      }},
      { $project: {
        _id: 0,
        species: '$_id',
        breeds: { $slice: ['$breeds', 5] }
      }}
    ]);

    // Average popularity
    const avgPopularity = await BreedProfile.aggregate([
      { $group: {
        _id: null,
        avgPopularity: { $avg: '$popularity' }
      }}
    ]);

    res.json({
      success: true,
      data: {
        topBreedsByCount,
        breedsBySpecies,
        averagePopularity: avgPopularity[0]?.avgPopularity || 50
      }
    });

  } catch (error) {
    logger.error('Get breed stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get breed stats',
      error: error.message
    });
  }
};

module.exports = {
  getBreeds,
  getBreed,
  getBreedSuggestions,
  autocompleteBreeds,
  getBreedStats
};
