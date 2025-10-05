const express = require('express');
const { body } = require('express-validator');
const multer = require('multer');
const { validate } = require('../middleware/validation');
const { requirePremiumFeature, optionalAuth, authenticateToken } = require('../middleware/auth');
const {
  createPet,
  discoverPets,
  swipePet,
  getMyPets,
  getPet,
  updatePet,
  deletePet
} = require('../controllers/petController');

const router = express.Router();

// Configure multer for memory storage (Cloudinary upload)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Max 10 files
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Multer error handling middleware
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer-specific errors
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds limit (5MB maximum)'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 10 photos allowed'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field'
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`
    });
  } else if (err) {
    // Other errors (e.g., from fileFilter)
    if (err.message === 'Only image files are allowed') {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
  }
  next(err);
};

// Validation rules
const createPetValidation = [
  body('name').trim().isLength({ min: 1, max: 50 }).withMessage('Pet name is required and must be less than 50 characters'),
  body('species').isIn(['dog', 'cat', 'bird', 'rabbit', 'other']).withMessage('Invalid species'),
  body('breed').trim().isLength({ min: 1, max: 100 }).withMessage('Breed is required and must be less than 100 characters'),
  body('age').isInt({ min: 0, max: 30 }).withMessage('Age must be between 0 and 30 years'),
  body('gender').isIn(['male', 'female']).withMessage('Gender must be male or female'),
  body('size').isIn(['tiny', 'small', 'medium', 'large', 'extra-large']).withMessage('Invalid size'),
  body('intent').isIn(['adoption', 'mating', 'playdate', 'all']).withMessage('Invalid intent'),
  body('weight').optional().isFloat({ min: 0, max: 200 }).withMessage('Weight must be between 0 and 200kg'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters')
];

const swipeValidation = [
  body('action').isIn(['like', 'pass', 'superlike']).withMessage('Invalid swipe action')
];

// Routes
router.post('/', authenticateToken, upload.array('photos', 10), handleMulterError, createPetValidation, validate, createPet);
router.get('/discover', optionalAuth, discoverPets);
router.get('/my-pets', authenticateToken, getMyPets);
router.get('/:id', optionalAuth, getPet);
router.put('/:id', authenticateToken, upload.array('photos', 10), handleMulterError, updatePet);
router.delete('/:id', authenticateToken, deletePet);
router.post('/:petId/swipe', authenticateToken, swipeValidation, validate, swipePet);

// Premium features
router.get('/discover/premium', requirePremiumFeature('advancedFilters'), discoverPets);

// Ultra-Premium Advanced Discovery Routes (enabled for testing)
const { advancedDiscoverPets, advancedPetMatching } = require('../controllers/advancedPetController');
router.get('/discover/advanced', authenticateToken, advancedDiscoverPets);
router.post('/match-advanced', authenticateToken, advancedPetMatching);

module.exports = router;