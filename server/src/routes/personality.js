const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const logger = require('../utils/logger');

const router = express.Router();

// Pet personality archetypes
const PERSONALITY_ARCHETYPES = {
  'the-playful-explorer': {
    name: 'The Playful Explorer',
    description: 'Adventurous, curious, and always ready for new experiences',
    icon: '🎯',
    traits: ['energetic', 'playful', 'curious', 'adventurous', 'social'],
    compatibility: ['the-social-butterfly', 'the-energetic-athlete'],
    energyLevel: 'high',
    independence: 'medium',
    sociability: 'high'
  },
  'the-cautious-cuddler': {
    name: 'The Cautious Cuddler',
    description: 'Gentle, loving, and prefers familiar environments',
    icon: '🤗',
    traits: ['calm', 'gentle', 'shy', 'loving', 'good-with-kids'],
    compatibility: ['the-independent-thinker', 'the-social-butterfly'],
    energyLevel: 'low',
    independence: 'low',
    sociability: 'medium'
  },
  'the-social-butterfly': {
    name: 'The Social Butterfly',
    description: 'Outgoing, friendly, and loves meeting new friends',
    icon: '🦋',
    traits: ['friendly', 'social', 'good-with-pets', 'good-with-strangers', 'playful'],
    compatibility: ['the-playful-explorer', 'the-cautious-cuddler'],
    energyLevel: 'medium',
    independence: 'medium',
    sociability: 'high'
  },
  'the-independent-thinker': {
    name: 'The Independent Thinker',
    description: 'Smart, self-reliant, and enjoys their own company',
    icon: '🧠',
    traits: ['intelligent', 'independent', 'calm', 'trained', 'gentle'],
    compatibility: ['the-cautious-cuddler', 'the-energetic-athlete'],
    energyLevel: 'medium',
    independence: 'high',
    sociability: 'low'
  },
  'the-energetic-athlete': {
    name: 'The Energetic Athlete',
    description: 'Active, strong, and always up for physical challenges',
    icon: '🏃',
    traits: ['energetic', 'active', 'athletic', 'playful', 'strong'],
    compatibility: ['the-playful-explorer', 'the-independent-thinker'],
    energyLevel: 'very-high',
    independence: 'high',
    sociability: 'medium'
  }
};

// @desc    Generate pet personality archetype
// @route   POST /api/personality/generate
// @access  Private
router.post('/generate', authenticateToken, [
  body('petId').isMongoId().withMessage('Valid pet ID is required'),
  body('breed').optional().isString().withMessage('Breed must be a string'),
  body('age').optional().isInt({ min: 0 }).withMessage('Age must be a positive integer'),
  body('personalityTags').optional().isArray().withMessage('Personality tags must be an array'),
  body('description').optional().isString().withMessage('Description must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { petId, breed, age, personalityTags = [], description = '' } = req.body;

    // Analyze pet data to determine personality archetype
    const analysisResult = await analyzePetPersonality({
      breed,
      age,
      personalityTags,
      description
    });

    // Generate compatibility insights
    const compatibilityInsights = generateCompatibilityInsights(analysisResult);

    res.json({
      success: true,
      data: {
        petId,
        primaryArchetype: analysisResult.primaryArchetype,
        secondaryArchetype: analysisResult.secondaryArchetype,
        personalityScore: analysisResult.personalityScore,
        description: analysisResult.description,
        compatibilityTips: analysisResult.compatibilityTips,
        compatibilityInsights,
        traits: analysisResult.traits,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Personality generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate personality archetype',
      error: error.message
    });
  }
});

// @desc    Get personality compatibility between two pets
// @route   POST /api/personality/compatibility
// @access  Private
router.post('/compatibility', authenticateToken, [
  body('pet1Id').isMongoId().withMessage('Valid pet1 ID is required'),
  body('pet2Id').isMongoId().withMessage('Valid pet2 ID is required'),
  body('interactionType').optional().isIn(['playdate', 'mating', 'adoption', 'cohabitation']).withMessage('Invalid interaction type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { pet1Id, pet2Id, interactionType = 'playdate' } = req.body;

    // Get personality data for both pets (in real implementation, fetch from database)
    const pet1Personality = await getPetPersonality(pet1Id);
    const pet2Personality = await getPetPersonality(pet2Id);

    if (!pet1Personality || !pet2Personality) {
      return res.status(404).json({
        success: false,
        message: 'Pet personality data not found'
      });
    }

    // Calculate compatibility score
    const compatibilityScore = calculatePersonalityCompatibility(
      pet1Personality,
      pet2Personality,
      interactionType
    );

    // Generate detailed compatibility analysis
    const compatibilityAnalysis = generateDetailedCompatibilityAnalysis(
      pet1Personality,
      pet2Personality,
      interactionType
    );

    res.json({
      success: true,
      data: {
        pet1Id,
        pet2Id,
        interactionType,
        compatibilityScore,
        analysis: compatibilityAnalysis,
        recommendations: generateRecommendations(compatibilityScore, interactionType),
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Personality compatibility error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate personality compatibility',
      error: error.message
    });
  }
});

// @desc    Get all personality archetypes
// @route   GET /api/personality/archetypes
// @access  Private
router.get('/archetypes', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        archetypes: PERSONALITY_ARCHETYPES
      }
    });
  } catch (error) {
    logger.error('Get archetypes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch personality archetypes',
      error: error.message
    });
  }
});

// Helper functions
async function analyzePetPersonality(petData) {
  const { breed, age, personalityTags, description } = petData;
  
  // Score each archetype based on pet data
  const archetypeScores = {};
  
  for (const [key, archetype] of Object.entries(PERSONALITY_ARCHETYPES)) {
    let score = 0;
    
    // Score based on personality tags overlap
    const tagOverlap = personalityTags.filter(tag => 
      archetype.traits.includes(tag)
    ).length;
    score += tagOverlap * 20;
    
    // Score based on breed characteristics (simplified)
    if (breed) {
      const breedScore = getBreedPersonalityScore(breed, archetype.traits);
      score += breedScore * 15;
    }
    
    // Score based on age (younger pets tend to be more energetic)
    if (age !== undefined) {
      if (archetype.energyLevel === 'high' && age < 3) score += 10;
      if (archetype.energyLevel === 'low' && age > 5) score += 10;
    }
    
    // Score based on description keywords
    if (description) {
      const descriptionScore = analyzeDescriptionKeywords(description, archetype.traits);
      score += descriptionScore * 10;
    }
    
    archetypeScores[key] = score;
  }
  
  // Get primary and secondary archetypes
  const sortedArchetypes = Object.entries(archetypeScores)
    .sort(([,a], [,b]) => b - a);
  
  const primaryKey = sortedArchetypes[0][0];
  const secondaryKey = sortedArchetypes[1][0];
  
  const primaryArchetype = PERSONALITY_ARCHETYPES[primaryKey];
  const secondaryArchetype = PERSONALITY_ARCHETYPES[secondaryKey];
  
  // Generate description and compatibility tips
  const description = generatePersonalityDescription(primaryArchetype, secondaryArchetype);
  const compatibilityTips = generateCompatibilityTips(primaryArchetype);
  
  return {
    primaryArchetype: primaryKey,
    secondaryArchetype: secondaryKey,
    personalityScore: {
      energy: getEnergyScore(primaryArchetype.energyLevel),
      independence: getIndependenceScore(primaryArchetype.independence),
      sociability: getSociabilityScore(primaryArchetype.sociability)
    },
    description,
    compatibilityTips,
    traits: primaryArchetype.traits
  };
}

function getBreedPersonalityScore(breed, archetypeTraits) {
  // Simplified breed personality mapping
  const breedTraits = {
    'golden retriever': ['friendly', 'energetic', 'good-with-kids'],
    'labrador': ['friendly', 'energetic', 'good-with-kids'],
    'german shepherd': ['intelligent', 'protective', 'trained'],
    'french bulldog': ['calm', 'friendly', 'good-with-kids'],
    'siamese': ['vocal', 'social', 'intelligent'],
    'persian': ['calm', 'gentle', 'quiet'],
    'maine coon': ['friendly', 'gentle', 'good-with-kids']
  };
  
  const traits = breedTraits[breed.toLowerCase()] || [];
  const overlap = traits.filter(trait => archetypeTraits.includes(trait)).length;
  return overlap / Math.max(traits.length, 1);
}

function analyzeDescriptionKeywords(description, archetypeTraits) {
  const keywords = description.toLowerCase().split(/\s+/);
  const traitKeywords = {
    'energetic': ['active', 'energetic', 'playful', 'bouncy'],
    'calm': ['calm', 'gentle', 'quiet', 'peaceful'],
    'friendly': ['friendly', 'social', 'outgoing', 'loving'],
    'intelligent': ['smart', 'intelligent', 'clever', 'quick'],
    'playful': ['playful', 'fun', 'games', 'toys']
  };
  
  let score = 0;
  for (const trait of archetypeTraits) {
    const traitWords = traitKeywords[trait] || [];
    const matches = keywords.filter(word => traitWords.includes(word)).length;
    score += matches;
  }
  
  return Math.min(score, 5); // Cap at 5
}

function generatePersonalityDescription(primary, secondary) {
  const descriptions = {
    'the-playful-explorer': `${primary.name} - ${primary.description} They're always ready for adventure and love exploring new places and meeting new friends.`,
    'the-cautious-cuddler': `${primary.name} - ${primary.description} They prefer familiar environments but are incredibly loving and gentle with those they trust.`,
    'the-social-butterfly': `${primary.name} - ${primary.description} They thrive on social interaction and make friends wherever they go.`,
    'the-independent-thinker': `${primary.name} - ${primary.description} They're smart and self-reliant, enjoying both their own company and thoughtful interactions.`,
    'the-energetic-athlete': `${primary.name} - ${primary.description} They need plenty of physical activity and excel at athletic challenges and games.`
  };
  
  return descriptions[primary.name.toLowerCase().replace(/\s+/g, '-')] || primary.description;
}

function generateCompatibilityTips(archetype) {
  const tips = {
    'the-playful-explorer': 'Best matches with other energetic pets who love adventure and play.',
    'the-cautious-cuddler': 'Thrives with gentle, patient pets who respect their need for space.',
    'the-social-butterfly': 'Gets along with most pets but especially loves other social, friendly companions.',
    'the-independent-thinker': 'Prefers pets who are calm and don't require constant attention.',
    'the-energetic-athlete': 'Needs active companions who can keep up with their energy level.'
  };
  
  const key = archetype.name.toLowerCase().replace(/\s+/g, '-');
  return tips[key] || 'Compatibility depends on individual personality and circumstances.';
}

function generateCompatibilityInsights(analysisResult) {
  return {
    energyMatch: 'High energy pets need active companions',
    socialMatch: 'Social pets thrive with outgoing friends',
    independenceMatch: 'Independent pets appreciate space and quiet time'
  };
}

async function getPetPersonality(petId) {
  try {
    const Pet = require('../models/Pet');
    const pet = await Pet.findById(petId).lean();
    
    if (!pet || !pet.aiData || !pet.aiData.personalityArchetype) {
      return null;
    }
    
    return {
      petId: pet._id,
      primaryArchetype: pet.aiData.personalityArchetype?.primary || 'the-playful-explorer',
      secondaryArchetype: pet.aiData.personalityArchetype?.secondary || 'the-social-butterfly',
      personalityScore: {
        energy: pet.aiData.personalityScore?.energy || 5,
        independence: pet.aiData.personalityScore?.independence || 5,
        sociability: pet.aiData.personalityScore?.socialness || 5
      },
      traits: pet.personalityTags || []
    };
  } catch (error) {
    logger.error('Error fetching pet personality:', error);
    return null;
  }
}

function calculatePersonalityCompatibility(pet1, pet2, interactionType) {
  const scores = {
    energy: Math.abs(pet1.personalityScore.energy - pet2.personalityScore.energy),
    independence: Math.abs(pet1.personalityScore.independence - pet2.personalityScore.independence),
    sociability: Math.abs(pet1.personalityScore.sociability - pet2.personalityScore.sociability)
  };
  
  // Calculate overall compatibility (lower difference = higher compatibility)
  const avgDifference = (scores.energy + scores.independence + scores.sociability) / 3;
  const compatibilityScore = Math.max(0, 100 - (avgDifference * 10));
  
  return Math.round(compatibilityScore);
}

function generateDetailedCompatibilityAnalysis(pet1, pet2, interactionType) {
  return {
    energyCompatibility: {
      score: Math.max(0, 100 - Math.abs(pet1.personalityScore.energy - pet2.personalityScore.energy) * 10),
      description: 'Energy level compatibility analysis'
    },
    socialCompatibility: {
      score: Math.max(0, 100 - Math.abs(pet1.personalityScore.sociability - pet2.personalityScore.sociability) * 10),
      description: 'Social interaction compatibility analysis'
    },
    independenceCompatibility: {
      score: Math.max(0, 100 - Math.abs(pet1.personalityScore.independence - pet2.personalityScore.independence) * 10),
      description: 'Independence level compatibility analysis'
    }
  };
}

function generateRecommendations(compatibilityScore, interactionType) {
  if (compatibilityScore >= 80) {
    return ['Excellent match! These pets should get along very well.', 'Consider supervised introductions in a neutral environment.'];
  } else if (compatibilityScore >= 60) {
    return ['Good potential match with some considerations.', 'Monitor interactions closely during initial meetings.'];
  } else if (compatibilityScore >= 40) {
    return ['Moderate compatibility - proceed with caution.', 'Consider gradual introduction over multiple sessions.'];
  } else {
    return ['Low compatibility - may not be suitable for this interaction type.', 'Consider alternative matches or different interaction types.'];
  }
}

function getEnergyScore(energyLevel) {
  const scores = { 'low': 2, 'medium': 5, 'high': 8, 'very-high': 10 };
  return scores[energyLevel] || 5;
}

function getIndependenceScore(independence) {
  const scores = { 'low': 2, 'medium': 5, 'high': 8 };
  return scores[independence] || 5;
}

function getSociabilityScore(sociability) {
  const scores = { 'low': 2, 'medium': 5, 'high': 8 };
  return scores[sociability] || 5;
}

module.exports = router;
