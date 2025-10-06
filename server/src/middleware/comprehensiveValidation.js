const { body, param, query, validationResult } = require('express-validator');

const logger = require('../utils/logger');

/**
 * Comprehensive Input Validation Middleware
 * Provides validation for all API endpoints with detailed error messages
 */

/**
 * Handle validation errors
 */
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value,
      location: error.location
    }));
    
    logger.warn('Validation errors:', {
      path: req.path,
      method: req.method,
      errors: errorMessages,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Please check your input and try again',
      details: errorMessages
    });
  }
  
  next();
}

/**
 * Authentication Validation
 */
const authValidation = {
  register: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address')
      .isLength({ max: 100 })
      .withMessage('Email must be less than 100 characters'),
    
    body('password')
      .isLength({ min: 8, max: 128 })
      .withMessage('Password must be between 8 and 128 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    
    body('firstName')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('First name must be between 1 and 50 characters')
      .matches(/^[a-zA-Z\s'-]+$/)
      .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),
    
    body('lastName')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Last name must be between 1 and 50 characters')
      .matches(/^[a-zA-Z\s'-]+$/)
      .withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes'),
    
    body('dateOfBirth')
      .isISO8601()
      .withMessage('Please provide a valid date of birth')
      .custom((value) => {
        const age = new Date().getFullYear() - new Date(value).getFullYear();
        if (age < 18) {
          throw new Error('You must be at least 18 years old');
        }
        if (age > 100) {
          throw new Error('Please provide a valid date of birth');
        }
        return true;
      }),
    
    body('gender')
      .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
      .withMessage('Gender must be one of: male, female, other, prefer_not_to_say'),
    
    body('location.city')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('City must be between 1 and 100 characters'),
    
    body('location.state')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('State must be between 2 and 50 characters'),
    
    body('location.zipCode')
      .trim()
      .matches(/^\d{5}(-\d{4})?$/)
      .withMessage('Please provide a valid ZIP code'),
    
    body('bio')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Bio must be less than 500 characters'),
    
    body('interests')
      .optional()
      .isArray({ max: 10 })
      .withMessage('You can have at most 10 interests')
      .custom((interests) => {
        if (interests) {
          interests.forEach(interest => {
            if (typeof interest !== 'string' || interest.length > 50) {
              throw new Error('Each interest must be a string with maximum 50 characters');
            }
          });
        }
        return true;
      })
  ],
  
  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    
    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 1, max: 128 })
      .withMessage('Password must be between 1 and 128 characters')
  ],
  
  refreshToken: [
    body('refreshToken')
      .notEmpty()
      .withMessage('Refresh token is required')
      .isJWT()
      .withMessage('Invalid refresh token format')
  ]
};

/**
 * User Validation
 */
const userValidation = {
  updateProfile: [
    body('firstName')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('First name must be between 1 and 50 characters')
      .matches(/^[a-zA-Z\s'-]+$/)
      .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),
    
    body('lastName')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Last name must be between 1 and 50 characters')
      .matches(/^[a-zA-Z\s'-]+$/)
      .withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes'),
    
    body('bio')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Bio must be less than 500 characters'),
    
    body('interests')
      .optional()
      .isArray({ max: 10 })
      .withMessage('You can have at most 10 interests'),
    
    body('location.city')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('City must be between 1 and 100 characters'),
    
    body('location.state')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('State must be between 2 and 50 characters'),
    
    body('location.zipCode')
      .optional()
      .trim()
      .matches(/^\d{5}(-\d{4})?$/)
      .withMessage('Please provide a valid ZIP code'),
    
    body('preferences.ageRange.min')
      .optional()
      .isInt({ min: 18, max: 100 })
      .withMessage('Minimum age must be between 18 and 100'),
    
    body('preferences.ageRange.max')
      .optional()
      .isInt({ min: 18, max: 100 })
      .withMessage('Maximum age must be between 18 and 100'),
    
    body('preferences.maxDistance')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Maximum distance must be between 1 and 100 miles'),
    
    body('preferences.petTypes')
      .optional()
      .isArray()
      .withMessage('Pet types must be an array')
      .custom((petTypes) => {
        const validTypes = ['dog', 'cat', 'rabbit', 'bird', 'fish', 'reptile', 'other'];
        if (petTypes) {
          petTypes.forEach(type => {
            if (!validTypes.includes(type)) {
              throw new Error(`Invalid pet type: ${type}. Valid types: ${validTypes.join(', ')}`);
            }
          });
        }
        return true;
      })
  ],
  
  getUserById: [
    param('id')
      .isMongoId()
      .withMessage('Invalid user ID format')
  ]
};

/**
 * Pet Validation
 */
const petValidation = {
  create: [
    body('name')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Pet name must be between 1 and 50 characters')
      .matches(/^[a-zA-Z\s'-]+$/)
      .withMessage('Pet name can only contain letters, spaces, hyphens, and apostrophes'),
    
    body('species')
      .isIn(['dog', 'cat', 'rabbit', 'bird', 'fish', 'reptile', 'other'])
      .withMessage('Species must be one of: dog, cat, rabbit, bird, fish, reptile, other'),
    
    body('breed')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Breed must be between 1 and 100 characters'),
    
    body('age')
      .isInt({ min: 0, max: 30 })
      .withMessage('Age must be between 0 and 30 years'),
    
    body('gender')
      .isIn(['male', 'female', 'unknown'])
      .withMessage('Gender must be one of: male, female, unknown'),
    
    body('size')
      .isIn(['small', 'medium', 'large', 'extra_large'])
      .withMessage('Size must be one of: small, medium, large, extra_large'),
    
    body('description')
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Description must be between 10 and 1000 characters'),
    
    body('personality')
      .isArray({ min: 1, max: 10 })
      .withMessage('You must provide 1-10 personality traits')
      .custom((traits) => {
        traits.forEach(trait => {
          if (typeof trait !== 'string' || trait.length > 50) {
            throw new Error('Each personality trait must be a string with maximum 50 characters');
          }
        });
        return true;
      }),
    
    body('isVaccinated')
      .isBoolean()
      .withMessage('Vaccination status must be true or false'),
    
    body('isSpayedNeutered')
      .isBoolean()
      .withMessage('Spay/neuter status must be true or false'),
    
    body('medicalHistory')
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage('Medical history must be less than 2000 characters'),
    
    body('careInstructions')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Care instructions must be less than 1000 characters')
  ],
  
  update: [
    param('id')
      .isMongoId()
      .withMessage('Invalid pet ID format'),
    
    body('name')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Pet name must be between 1 and 50 characters'),
    
    body('description')
      .optional()
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Description must be between 10 and 1000 characters'),
    
    body('personality')
      .optional()
      .isArray({ max: 10 })
      .withMessage('You can have at most 10 personality traits')
  ],
  
  getPetById: [
    param('id')
      .isMongoId()
      .withMessage('Invalid pet ID format')
  ]
};

/**
 * Match Validation
 */
const matchValidation = {
  swipe: [
    body('petId')
      .isMongoId()
      .withMessage('Invalid pet ID format'),
    
    body('action')
      .isIn(['like', 'pass', 'super_like'])
      .withMessage('Action must be one of: like, pass, super_like')
  ],
  
  getMatchById: [
    param('id')
      .isMongoId()
      .withMessage('Invalid match ID format')
  ],
  
  sendMessage: [
    param('matchId')
      .isMongoId()
      .withMessage('Invalid match ID format'),
    
    body('content')
      .trim()
      .isLength({ min: 1, max: 1000 })
      .withMessage('Message content must be between 1 and 1000 characters'),
    
    body('messageType')
      .optional()
      .isIn(['text', 'image', 'emoji'])
      .withMessage('Message type must be one of: text, image, emoji'),
    
    body('attachments')
      .optional()
      .isArray({ max: 5 })
      .withMessage('You can attach at most 5 files')
  ]
};

/**
 * Chat Validation
 */
const chatValidation = {
  getMessages: [
    param('matchId')
      .isMongoId()
      .withMessage('Invalid match ID format'),
    
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
  ]
};

/**
 * AI Service Validation
 */
const aiValidation = {
  generatePetDescription: [
    body('petData')
      .isObject()
      .withMessage('Pet data must be an object'),
    
    body('petData.species')
      .isIn(['dog', 'cat', 'rabbit', 'bird', 'fish', 'reptile', 'other'])
      .withMessage('Invalid species'),
    
    body('petData.breed')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Breed must be between 1 and 100 characters'),
    
    body('petData.age')
      .isInt({ min: 0, max: 30 })
      .withMessage('Age must be between 0 and 30 years')
  ],
  
  analyzePetCompatibility: [
    body('pet1Id')
      .isMongoId()
      .withMessage('Invalid pet 1 ID format'),
    
    body('pet2Id')
      .isMongoId()
      .withMessage('Invalid pet 2 ID format')
  ]
};

/**
 * Premium Validation
 */
const premiumValidation = {
  createSubscription: [
    body('priceId')
      .notEmpty()
      .withMessage('Price ID is required')
      .matches(/^price_/)
      .withMessage('Invalid price ID format'),
    
    body('paymentMethodId')
      .notEmpty()
      .withMessage('Payment method ID is required')
      .matches(/^pm_/)
      .withMessage('Invalid payment method ID format')
  ],
  
  updateSubscription: [
    body('subscriptionId')
      .notEmpty()
      .withMessage('Subscription ID is required')
      .matches(/^sub_/)
      .withMessage('Invalid subscription ID format')
  ]
};

/**
 * File Upload Validation
 */
const fileValidation = {
  uploadImage: [
    body('type')
      .isIn(['profile', 'pet', 'chat', 'thumbnail'])
      .withMessage('Image type must be one of: profile, pet, chat, thumbnail')
  ]
};

/**
 * Query Parameter Validation
 */
const queryValidation = {
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    
    query('sort')
      .optional()
      .isIn(['createdAt', 'updatedAt', 'name', 'age'])
      .withMessage('Sort field must be one of: createdAt, updatedAt, name, age'),
    
    query('order')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Sort order must be asc or desc')
  ],
  
  search: [
    query('q')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Search query must be between 1 and 100 characters'),
    
    query('species')
      .optional()
      .isIn(['dog', 'cat', 'rabbit', 'bird', 'fish', 'reptile', 'other'])
      .withMessage('Invalid species filter'),
    
    query('ageMin')
      .optional()
      .isInt({ min: 0, max: 30 })
      .withMessage('Minimum age must be between 0 and 30'),
    
    query('ageMax')
      .optional()
      .isInt({ min: 0, max: 30 })
      .withMessage('Maximum age must be between 0 and 30')
  ]
};

/**
 * Sanitization middleware
 */
const sanitizeInput = (req, res, next) => {
  // Remove any potential XSS attempts
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      return obj.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }
    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        obj[key] = sanitize(obj[key]);
      }
    }
    return obj;
  };
  
  if (req.body) {
    req.body = sanitize(req.body);
  }
  if (req.query) {
    req.query = sanitize(req.query);
  }
  
  next();
};

module.exports = {
  handleValidationErrors,
  sanitizeInput,
  authValidation,
  userValidation,
  petValidation,
  matchValidation,
  chatValidation,
  aiValidation,
  premiumValidation,
  fileValidation,
  queryValidation
};
