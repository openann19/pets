const express = require('express');
const { body } = require('express-validator');
const multer = require('multer');
const { validate } = require('../middleware/validation');
const { requirePremiumFeature } = require('../middleware/auth');
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
router.post('/', upload.array('photos', 10), createPetValidation, validate, createPet);
router.get('/discover', discoverPets);
router.get('/my-pets', getMyPets);
router.get('/:id', getPet);
router.put('/:id', upload.array('photos', 10), updatePet);
router.delete('/:id', deletePet);
router.post('/:petId/swipe', swipeValidation, validate, swipePet);

// Premium features
router.get('/discover/premium', requirePremiumFeature('advancedFilters'), discoverPets);

module.exports = router;