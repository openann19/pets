const Pet = require('../models/Pet');
const User = require('../models/User');
const BreedProfile = require('../models/BreedProfile');
const logger = require('../utils/logger');

// @desc    Ultra-comprehensive pet discovery with all filtering options
// @route   GET /api/pets/discover/advanced
// @access  Private
const advancedDiscoverPets = async (req, res) => {
  try {
    const {
      // Basic filters
      species,
      breeds,
      intent,
      ageRange,
      sizes,
      gender,
      
      // Advanced physical characteristics
      colors,
      coatTypes,
      weightRange,
      
      // Temperament & behavior
      temperaments,
      energyLevels,
      trainability,
      barkingTendency,
      
      // Compatibility filters
      familyFriendly,
      kidFriendly,
      petFriendly,
      strangerFriendly,
      apartmentFriendly,
      
      // Health & care
      healthConcerns,
      groomingNeeds,
      exerciseNeeds,
      specialNeeds,
      
      // Location & availability
      maxDistance,
      availableNow,
      daysOfWeek,
      timeSlots,
      
      // Advanced sorting
      sortBy = 'relevance',
      sortDirection = 'desc',
      
      // Premium features
      boostFeature,
      popularityThreshold,
      verifiedOnly,
      
      // Search preferences
      searchQuery,
      nearMeFirst,
      
      pagination: { page = 1, limit = 20 } = {}
    } = req.query;

    const user = await User.findById(req.userId);
    
    // Get swiped pets
    const swipedPetIds = user.swipedPets.map(swipe => swipe.petId);
    
    // Build comprehensive query
    let query = {
      owner: { $ne: req.userId },
      _id: { $nin: swipedPetIds },
      isActive: true,
      status: 'active'
    };

    // Apply all filters with AI-enhanced matching
    if (species && species.length > 0) {
      query.species = { $in: Array.isArray(species) ? species : [species] };
    }

    if (breeds && breeds.length > 0) {
      const breedList = Array.isArray(breeds) ? breeds : [breeds];
      query.breed = { 
        $in: breedList.map(breed => new RegExp(breed, 'i'))
      };
    }

    if (intent) {
      query.intent = { $in: Array.isArray(intent) ? intent : [intent, 'all'] };
    }

    // Age filtering
    if (ageRange) {
      const [minAge, maxAge] = ageRange.split('-').map(a => parseInt(a));
      query.age = { $gte: minAge || 0, $lte: maxAge || 20 };
    }

    if (sizes && sizes.length > 0) {
      query.size = { $in: Array.isArray(sizes) ? sizes : [sizes] };
    }

    if (gender && gender.length > 0) {
      query.gender = { $in: Array.isArray(gender) ? gender : [gender] };
    }

    // Advanced breed characteristic filtering using AI data
    // Build array of aiData conditions
    const aiDataConditions = [];
    
    if (temperaments && temperaments.length > 0) {
      const temperamentList = Array.isArray(temperaments) ? temperaments : [temperaments];
      aiDataConditions.push({ 'aiData.breedCharacteristics.temperament': { $in: temperamentList } });
    }

    if (energyLevels && energyLevels.length > 0) {
      const energyList = Array.isArray(energyLevels) ? energyLevels : [energyLevels];
      aiDataConditions.push({ 'aiData.breedCharacteristics.energyLevel': { $in: energyList } });
    }

    if (familyFriendly) {
      aiDataConditions.push({ 'aiData.breedCharacteristics.familyFriendly': familyFriendly });
    }

    if (apartmentFriendly === 'true') {
      aiDataConditions.push({ 'aiData.breedCharacteristics.apartmentFriendly': true });
    }

    // Health concerns filtering
    if (healthConcerns && healthConcerns.length > 0) {
      const concerns = Array.isArray(healthConcerns) ? healthConcerns : [healthConcerns];
      query['healthInfo.healthConditions'] = { $nin: concerns };
    }

    // Availability filtering
    if (availableNow === 'true') {
      query['availability.isAvailable'] = true;
      query['availability.schedule'] = { $exists: true, $ne: null };
    }

    // Build $or conditions array to combine multiple OR filters
    const orConditions = [];

    // Add aiData conditions if they exist
    if (aiDataConditions.length > 0) {
      orConditions.push({
        $or: [
          { 'aiData.breedCharacteristics': { $exists: false } },
          { $and: aiDataConditions }
        ]
      });
    }

    // Add search query conditions if they exist
    if (searchQuery) {
      const searchRegex = new RegExp(searchQuery, 'i');
      orConditions.push({
        $or: [
          { name: searchRegex },
          { breed: searchRegex },
          { description: searchRegex },
          { 'personalityTags': { $in: [searchRegex] } }
        ]
      });
    }

    // Combine all OR conditions with $and if multiple exist
    if (orConditions.length > 0) {
      if (orConditions.length === 1) {
        // Single OR condition - flatten it
        Object.assign(query, orConditions[0]);
      } else {
        // Multiple OR conditions - wrap in $and
        query.$and = orConditions;
      }
    }

    // Premium features
    if (verifiedOnly === 'true') {
      query.isVerified = true;
    }

    if (boostFeature) {
      query['featured.isFeatured'] = true;
      query['featured.featuredUntil'] = { $gt: new Date() };
    }

    // Create aggregation pipeline for enhanced results
    let aggregationPipeline = [
      { $match: query },
      {
        $lookup: {
          from: 'users',
          localField: 'owner',
          foreignField: '_id',
          as: 'owner',
          pipeline: [
            { $limit: 1 },
            { $project: { 
              firstName: 1, 
              lastName: 1, 
              avatar: 1, 
              premium: 1,
              isVerified: 1,
              preferences: 1
            }}
          ]
        }
      },
      { $unwind: '$owner' },
      
      // Add breed compatibility scoring
      {
        $lookup: {
          from: 'breedprofiles',
          localField: 'breed',
          foreignField: 'name',
          as: 'breedProfile',
          pipeline: [{ $limit: 1 }]
        }
      },
      {
        $unwind: {
          path: '$breedProfile',
          preserveNullAndEmptyArrays: true
        }
      }
    ];

    // Enhanced location filtering with distance calculation
    if (maxDistance && user.location && user.location.coordinates[0] !== 0) {
      aggregationPipeline.push({
        $geoNear: {
          near: user.location,
          distanceField: 'distance',
          maxDistance: maxDistance * 1000,
          spherical: true,
          query: query
        }
      });
    }

    // Advanced scoring and relevance algorithm
    aggregationPipeline.push({
      $addFields: {
        relevanceScore: {
          $add: [
            // Base score
            50,
            
            // Featured pets get boost
            { $cond: ['$featured.isFeatured', 20, 0] },
            
            // Premium users get boost
            { $cond: ['$owner.premium.isActive', 15, 0] },
            
            // Verified pets get boost
            { $cond: ['$isVerified', 10, 0] },
            
            // Recent pets get slight boost
            {
              $multiply: [
                {
                  $divide: [
                    {
                      $subtract: [new Date(), '$createdAt']
                    },
                    { $multiply: [1000 * 60 * 60 * 24, 30] } // 30 days
                  ]
                },
                -5
              ]
            },
            
            // Breed popularity boost
            { $ifNull: ['$breedProfile.popularity', 0] },
            
            // Analytics boost (popular pets)
            { $multiply: ['$analytics.views', 0.1] },
            { $multiply: ['$analytics.likes', 0.2] },
            { $multiply: ['$analytics.matches', 0.5] }
          ]
        }
      }
    });

    // Add breed compatibility score with user preferences
    if (user.preferences && user.preferences.breedPreference) {
      aggregationPipeline.push({
        $addFields: {
          breedMatchScore: {
            $cond: {
              if: { $in: ['$breed', user.preferences.breedPreference] },
              then: 30,
              else: {
                $ifNull: ['$breedProfile.popularity', 0]
              }
            }
          }
        }
      });
    }

    // Final scoring combination
    aggregationPipeline.push({
      $addFields: {
        finalScore: {
          $add: [
            '$relevanceScore',
            { $ifNull: ['$breedMatchScore', 0] }
          ]
        }
      }
    });

    // Add sorting logic
    let sortStage = {};
    switch (sortBy) {
      case 'relevance':
        sortStage = { finalScore: -1, createdAt: -1 };
        break;
      case 'newest':
        sortStage = { createdAt: -1 };
        break;
      case 'popularity':
        sortStage = { 'analytics.views': -1, 'analytics.likes': -1 };
        break;
      case 'distance':
        if (maxDistance && user.location) {
          sortStage = { distance: 1, finalScore: -1 };
        } else {
          sortStage = { finalScore: -1 };
        }
        break;
      case 'breed_match':
        sortStage = { breedMatchScore: -1, relevanceScore: -1 };
        break;
      case 'age':
        sortStage = { age: 1, finalScore: -1 };
        break;
      case 'featured':
        sortStage = { 'featured.isFeatured': -1, 'featured.lastBoosted': -1 };
        break;
      default:
        sortStage = { finalScore: -1, createdAt: -1 };
    }

    aggregationPipeline.push({ $sort: sortStage });

    // Add pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    aggregationPipeline.push(
      { $skip: skip },
      { $limit: parseInt(limit) }
    );

    // Execute aggregation
    const pets = await Pet.aggregate(aggregationPipeline);

    // Get total count for pagination
    const countPipeline = aggregationPipeline.slice(0, -2); // Remove skip and limit
    countPipeline.push({ $count: 'total' });
    const countResult = await Pet.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    // AI-powered recommendations for premium users
    let recommendations = [];
    if (user.premium.isActive && pets.length > 0) {
      try {
        const aiRecommendations = await getAIRecommendations(user._id, pets.map(p => p._id));
        recommendations = aiRecommendations;
      } catch (aiError) {
        logger.error('AI recommendations error:', aiError);
      }
    }

    // Advanced analytics for the results
    const resultAnalytics = {
      appliedFilters: {
        species: species ? (Array.isArray(species) ? species : [species]) : null,
        breeds: breeds ? (Array.isArray(breeds) ? breeds : [breeds]) : null,
        temperaments,
        energyLevels,
        familyFriendly,
        apartmentFriendly
      },
      userPreferences: user.preferences,
      location: user.location ? 'provided' : 'not provided',
      premiumFeatures: user.premium.isActive
    };

    res.json({
      success: true,
      data: {
        pets,
        recommendations,
        analytics: resultAnalytics,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
          hasMore: skip + pets.length < total
        },
        appliedFilters: Object.keys(query).length,
        performanceMetrics: {
          queryTime: Date.now() - req.startTime,
          resultsCount: pets.length,
          scoredResults: pets.filter(p => p.finalScore > 0).length
        }
      }
    });

  } catch (error) {
    logger.error('Advanced discover pets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to discover pets with advanced filters',
      error: error.message
    });
  }
};

// @desc    Get pets with comprehensive matching algorithm
// @route   POST /api/pets/match-advanced
// @access  Private  
const advancedPetMatching = async (req, res) => {
  try {
    const {
      userPreferences,
      lifestyleFactors,
      matchingCriteria,
      personalityAssessment
    } = req.body;

    const user = await User.findById(req.userId).populate('pets');
    
    // Multi-dimensional matching algorithm
    const matchingWeights = {
      breedMatch: 0.25,
      temperamentMatch: 0.20,
      lifestyleMatch: 0.20,
      energyLevelMatch: 0.15,
      trainingMatch: 0.10,
      healthMatch: 0.10
    };

    // Create comprehensive query with scoring
    let aggregationPipeline = [
      {
        $match: {
          owner: { $ne: req.userId },
          isActive: true,
          status: 'active'
        }
      },
      {
        $lookup: {
          from: 'breedprofiles',
          localField: 'breed',
          foreignField: 'name',
          as: 'breedProfile'
        }
      },
      {
        $unwind: {
          path: '$breedProfile',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {
          matchScore: {
            $add: [
              // Breed compatibility score
              {
                $multiply: [
                  {
                    $cond: {
                      if: { $in: ['$breed', userPreferences.breedPreference || []] },
                      then: 100,
                      else: { $ifNull: ['$breedProfile.popularity', 25] }
                    }
                  },
                  matchingWeights.breedMatch
                ]
              },
              
              // Temperament match score
              {
                $multiply: [
                  {
                    $size: {
                      $setIntersection: [
                        '$personalityTags',
                        userPreferences.temperamentPreference || []
                      ]
                    }
                  },
                  matchingWeights.temperamentMatch * 20
                ]
              },
              
              // Energy level match
              {
                $multiply: [
                  {
                    $cond: {
                      if: { $eq: ['$aiData.breedCharacteristics.energyLevel', lifestyleFactors.desiredEnergyLevel] },
                      then: 100,
                      else: 50
                    }
                  },
                  matchingWeights.energyLevelMatch
                ]
              },
              
              // Lifestyle compatibility
              {
                $multiply: [
                  {
                    $cond: {
                      if: { $eq: ['$aiData.breedCharacteristics.apartmentFriendly', lifestyleFactors.livingSpace === 'apartment'] },
                      then: 100,
                      else: 70
                    }
                  },
                  matchingWeights.lifestyleMatch
                ]
              },
              
              // Training compatibility
              {
                $multiply: [
                  {
                    $cond: {
                      if: { $eq: ['$aiData.breedCharacteristics.trainability', personalityAssessment.experienceLevel] },
                      then: 100,
                      else: 60
                    }
                  },
                  matchingWeights.trainingMatch
                ]
              },
              
              // Health considerations
              {
                $multiply: [
                  {
                    $cond: {
                      if: { $eq: ['$healthInfo.vaccinated', true] },
                      then: 30,
                      else: 0
                    }
                  },
                  matchingWeights.healthMatch
                ]
              },
              
              // Base compatibility score
              20
            ]
          },
          
          // Calculate individual factor scores for transparency
          factorScores: {
            breed: '$breedProfile.popularity',
            temperament: { $size: { $setIntersection: ['$personalityTags', []] } },
            energy: '$aiData.breedCharacteristics.energyLevel',
            lifestyle: '$aiData.breedCharacteristics.apartmentFriendly',
            training: '$aiData.breedCharacteristics.trainability',
            health: '$healthInfo.vaccinated'
          }
        }
      },
      {
        $sort: { matchScore: -1 }
      },
      {
        $limit: 50
      },
      {
        $lookup: {
          from: 'users',
          localField: 'owner',
          foreignField: '_id',
          as: 'owner',
          pipeline: [
            { $limit: 1 },
            { $project: { firstName: 1, lastName: 1, avatar: 1, premium: 1 } }
          ]
        }
      },
      { $unwind: '$owner' },
      {
        $project: {
          _id: 1,
          name: 1,
          breed: 1,
          age: 1,
          size: 1,
          photos: 1,
          gender: 1,
          location: 1,
          matchScore: 1,
          factorScores: 1,
          compatibilityExplanation: {
            breedMatch: { $gte: ['$factorScores.breed', 70] },
            temperamentMatch: 'Compatible temperament traits',
            energyMatch: { $eq: ['$factorScores.energy', lifestyleFactors.desiredEnergyLevel] },
            lifestyleMatch: { $eq: ['$factorScores.lifestyle', lifestyleFactors.livingSpace === 'apartment'] }
          },
          reasons: {
            $concat: [
              'This ',
              '$breed',
              ' matches your preferences for ',
              {
                $cond: {
                  if: { $gt: ['$factorScores.breed', 80] },
                  then: 'an ideal breed, ',
                  else: 'a compatible breed, '
                }
              },
              {
                $cond: {
                  if: { $gt: ['$matchScore', 85] },
                  then: 'and is an excellent match overall.',
                  else: 'and could be a good fit with some consideration.'
                }
              }
            ]
          },
          owner: 1,
          analytics: 1,
          featured: 1,
          healthInfo: 1
        }
      }
    ];

    const matchedPets = await Pet.aggregate(aggregationPipeline);
    
    // Add personalized match explanations
    const enhancedMatches = matchedPets.map((pet, index) => ({
      ...pet,
      rankScore: 100 - index,
      matchPercentage: Math.round(pet.matchScore),
      personalizedInsights: generatePersonalizedInsights(pet, userPreferences, lifestyleFactors),
      compatibilityFactors: {
        strengthFactors: getStrengthFactors(pet),
        considerationFactors: getConsiderationFactors(pet)
      }
    }));

    res.json({
      success: true,
      data: {
        matches: enhancedMatches,
        matchingSummary: {
          totalPetsConsidered: matchedPets.length,
          highCompatibilityCount: enhancedMatches.filter(m => m.matchPercentage > 80).length,
          queryMetrics: {
            userPreferenceAlignment: calculatePreferenceAlignment(userPreferences),
            lifestyleCompatibility: calculateLifestyleScore(lifestyleFactors),
            personalityFit: assessPersonalityFit(personalityAssessment)
          }
        },
        recommendations: {
          topMatches: enhancedMatches.slice(0, 5),
          alternativeMatches: enhancedMatches.slice(5, 10),
          exploreOptions: enhancedMatches.slice(10, 20)
        }
      }
    });

  } catch (error) {
    logger.error('Advanced matching error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform advanced pet matching',
      error: error.message
    });
  }
};

// Helper functions
const generatePersonalizedInsights = (pet, preferences, lifestyle) => {
  const insights = [];
  
  if (pet.matchScore > 85) {
    insights.push("Excellent match for your lifestyle and preferences!");
  } else if (pet.matchScore > 70) {
    insights.push("Strong compatibility with your preferences");
  } else {
    insights.push("Good potential with some considerations");
  }
  
  return insights;
};

const getStrengthFactors = (pet) => {
  const strengths = [];
  if (pet.factorScores.breed > 80) strengths.push("Popular breed");
  if (pet.factorScores.health) strengths.push("Vaccinated & healthy");
  if (pet.breedProfile?.familyCompatibility === 'excellent') strengths.push("Family-friendly");
  return strengths;
};

const getConsiderationFactors = (pet) => {
  const considerations = [];
  if (!pet.breedProfile?.apartmentFriendly) considerations.push("May need outdoor space");
  if (pet.breedProfile?.energyLevel === 'very-high') considerations.push("High exercise needs");
  return considerations;
};

const calculatePreferenceAlignment = (preferences) => {
  // Calculate how well user preferences align with available options
  return Math.min(100, Object.keys(preferences).length * 15);
};

const calculateLifestyleScore = (lifestyle) => {
  // Calculate lifestyle compatibility score
  let score = 50;
  if (lifestyle.experienceLevel === 'beginner') score += 20;
  if (lifestyle.livingSpace === 'house') score += 15;
  if (lifestyle.timeAvailability === 'high') score += 15;
  return Math.min(100, score);
};

const assessPersonalityFit = (personality) => {
  // Assess personality compatibility
  return Math.min(100, Object.values(personality).reduce((sum, val) => sum + 20, 50));
};

const getAIRecommendations = async (userId, petIds) => {
  // Enhanced AI recommendation system
  try {
    const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    const user = await User.findById(userId);
    const pets = await Pet.find({ _id: { $in: petIds } });
    
    const requestData = {
      user_profile: {
        preferences: user.preferences,
        lifestyle: user.profile?.lifestyle || {},
        behavior_patterns: user.analytics?.behaviorPatterns || {}
      },
      candidate_pets: pets.map(pet => ({
        ...pet.toObject(),
        breed_characteristics: pet.breedProfile?.toObject() || {}
      })),
      matching_context: {
        session_type: 'discovery',
        user_intent: 'finding_companion',
        search_depth: 'comprehensive'
      }
    };

    const response = await axios.post(`${AI_SERVICE_URL}/api/recommend/enhanced`, requestData);
    return response.data.recommendations || [];
  } catch (error) {
    logger.error('AI Service Error:', error);
    return [];
  }
};

module.exports = {
  advancedDiscoverPets,
  advancedPetMatching
};
