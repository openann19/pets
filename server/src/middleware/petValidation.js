/**
 * Pet Validation Middleware
 * Comprehensive validation for pet creation and updates
 */

const { body, validationResult } = require('express-validator');

// Pet creation validation rules
const validatePetCreation = [
  // Basic information
  body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Pet name must be between 1 and 50 characters')
    .matches(/^[a-zA-Z\s\-'\.]+$/)
    .withMessage('Pet name can only contain letters, spaces, hyphens, apostrophes, and periods'),

  body('species')
    .isIn(['dog', 'cat', 'bird', 'fish', 'rabbit', 'hamster', 'other'])
    .withMessage('Species must be one of: dog, cat, bird, fish, rabbit, hamster, other'),

  body('breed')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Breed must be between 1 and 100 characters'),

  body('age')
    .isInt({ min: 0, max: 30 })
    .withMessage('Age must be between 0 and 30 years'),

  body('gender')
    .isIn(['male', 'female', 'unknown'])
    .withMessage('Gender must be male, female, or unknown'),

  body('size')
    .isIn(['small', 'medium', 'large', 'extra-large'])
    .withMessage('Size must be small, medium, large, or extra-large'),

  // Physical characteristics
  body('weight')
    .optional()
    .isFloat({ min: 0.1, max: 200 })
    .withMessage('Weight must be between 0.1 and 200 kg'),

  body('color')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Color must be between 1 and 100 characters'),

  body('coatLength')
    .optional()
    .isIn(['short', 'medium', 'long'])
    .withMessage('Coat length must be short, medium, or long'),

  // Personality and behavior
  body('personality')
    .optional()
    .isArray({ min: 1, max: 10 })
    .withMessage('Personality traits must be an array with 1-10 items'),

  body('personality.*')
    .isIn([
      'friendly', 'shy', 'energetic', 'calm', 'playful', 'independent',
      'loyal', 'protective', 'social', 'curious', 'gentle', 'active',
      'quiet', 'vocal', 'affectionate', 'reserved'
    ])
    .withMessage('Invalid personality trait'),

  body('energyLevel')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Energy level must be between 1 and 5'),

  body('goodWithKids')
    .optional()
    .isBoolean()
    .withMessage('Good with kids must be true or false'),

  body('goodWithPets')
    .optional()
    .isBoolean()
    .withMessage('Good with pets must be true or false'),

  body('houseTrained')
    .optional()
    .isBoolean()
    .withMessage('House trained must be true or false'),

  // Health and care
  body('vaccinated')
    .optional()
    .isBoolean()
    .withMessage('Vaccinated must be true or false'),

  body('spayedNeutered')
    .optional()
    .isBoolean()
    .withMessage('Spayed/neutered must be true or false'),

  body('specialNeeds')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Special needs description must be less than 500 characters'),

  body('medicalHistory')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Medical history must be less than 1000 characters'),

  // Location and availability
  body('location')
    .isObject()
    .withMessage('Location must be an object'),

  body('location.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Location coordinates must be an array with 2 elements [longitude, latitude]'),

  body('location.coordinates.*')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid coordinate value'),

  body('location.city')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('City must be between 1 and 100 characters'),

  body('location.state')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('State must be between 1 and 100 characters'),

  body('location.country')
    .optional()
    .trim()
    .isLength({ min: 2, max: 2 })
    .withMessage('Country must be a 2-letter country code'),

  body('availableForAdoption')
    .optional()
    .isBoolean()
    .withMessage('Available for adoption must be true or false'),

  body('adoptionFee')
    .optional()
    .isFloat({ min: 0, max: 10000 })
    .withMessage('Adoption fee must be between 0 and 10000'),

  // Description and media
  body('bio')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Bio must be between 10 and 1000 characters'),

  body('photos')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Maximum 10 photos allowed'),

  body('photos.*')
    .isURL()
    .withMessage('Photo must be a valid URL'),

  body('videos')
    .optional()
    .isArray({ max: 3 })
    .withMessage('Maximum 3 videos allowed'),

  body('videos.*')
    .isURL()
    .withMessage('Video must be a valid URL'),

  // Contact information
  body('contactInfo')
    .optional()
    .isObject()
    .withMessage('Contact info must be an object'),

  body('contactInfo.preferredContact')
    .optional()
    .isIn(['email', 'phone', 'message'])
    .withMessage('Preferred contact must be email, phone, or message'),

  body('contactInfo.phone')
    .optional()
    .isMobilePhone()
    .withMessage('Phone number must be valid'),

  body('contactInfo.email')
    .optional()
    .isEmail()
    .withMessage('Email must be valid'),

  // Additional preferences
  body('preferences')
    .optional()
    .isObject()
    .withMessage('Preferences must be an object'),

  body('preferences.activityLevel')
    .optional()
    .isIn(['low', 'moderate', 'high'])
    .withMessage('Activity level must be low, moderate, or high'),

  body('preferences.homeType')
    .optional()
    .isIn(['apartment', 'house', 'farm', 'any'])
    .withMessage('Home type must be apartment, house, farm, or any'),

  body('preferences.yardRequired')
    .optional()
    .isBoolean()
    .withMessage('Yard required must be true or false'),

  // Validation middleware
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(error => ({
          field: error.path,
          message: error.msg,
          value: error.value
        }))
      });
    }
    next();
  }
];

// Pet update validation (more lenient)
const validatePetUpdate = [
  // Only validate fields that are provided
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Pet name must be between 1 and 50 characters'),

  body('age')
    .optional()
    .isInt({ min: 0, max: 30 })
    .withMessage('Age must be between 0 and 30 years'),

  body('weight')
    .optional()
    .isFloat({ min: 0.1, max: 200 })
    .withMessage('Weight must be between 0.1 and 200 kg'),

  body('bio')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Bio must be between 10 and 1000 characters'),

  body('photos')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Maximum 10 photos allowed'),

  body('photos.*')
    .optional()
    .isURL()
    .withMessage('Photo must be a valid URL'),

  body('location.coordinates')
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage('Location coordinates must be an array with 2 elements'),

  body('location.coordinates.*')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid coordinate value'),

  // Validation middleware
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(error => ({
          field: error.path,
          message: error.msg,
          value: error.value
        }))
      });
    }
    next();
  }
];

// Pet search/filter validation
const validatePetSearch = [
  body('species')
    .optional()
    .isIn(['dog', 'cat', 'bird', 'fish', 'rabbit', 'hamster', 'other'])
    .withMessage('Invalid species'),

  body('breed')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Breed must be between 1 and 100 characters'),

  body('ageMin')
    .optional()
    .isInt({ min: 0, max: 30 })
    .withMessage('Minimum age must be between 0 and 30'),

  body('ageMax')
    .optional()
    .isInt({ min: 0, max: 30 })
    .withMessage('Maximum age must be between 0 and 30'),

  body('size')
    .optional()
    .isIn(['small', 'medium', 'large', 'extra-large'])
    .withMessage('Invalid size'),

  body('gender')
    .optional()
    .isIn(['male', 'female', 'unknown'])
    .withMessage('Invalid gender'),

  body('radius')
    .optional()
    .isInt({ min: 1, max: 500 })
    .withMessage('Search radius must be between 1 and 500 km'),

  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),

  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),

  body('personality')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Maximum 10 personality traits'),

  body('personality.*')
    .optional()
    .isIn([
      'friendly', 'shy', 'energetic', 'calm', 'playful', 'independent',
      'loyal', 'protective', 'social', 'curious', 'gentle', 'active',
      'quiet', 'vocal', 'affectionate', 'reserved'
    ])
    .withMessage('Invalid personality trait'),

  // Validation middleware
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(error => ({
          field: error.path,
          message: error.msg,
          value: error.value
        }))
      });
    }
    next();
  }
];

module.exports = {
  validatePetCreation,
  validatePetUpdate,
  validatePetSearch
};
