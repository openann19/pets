const express = require('express');
const { body } = require('express-validator');
const multer = require('multer');
const { validate } = require('../middleware/validation');
const {
  getProfile,
  updateProfile,
  updatePreferences,
  updateLocation,
  getUserStats,
  uploadAvatar,
  deleteAccount,
  updatePrivacy,
  updateFilters
} = require('../controllers/userController');

const router = express.Router();

// Configure multer for avatar upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
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
const profileValidation = [
  body('firstName').optional().trim().isLength({ min: 1, max: 50 }).withMessage('First name must be 1-50 characters'),
  body('lastName').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Last name must be 1-50 characters'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number required')
];

const locationValidation = [
  body('coordinates').isArray({ min: 2, max: 2 }).withMessage('Coordinates must be [longitude, latitude]'),
  body('coordinates.*').isFloat().withMessage('Coordinates must be numbers'),
  body('address').optional().isObject().withMessage('Address must be an object')
];

// Routes
router.get('/profile', getProfile);
router.put('/profile', profileValidation, validate, updateProfile);
router.put('/preferences', updatePreferences);
router.put('/location', locationValidation, validate, updateLocation);
router.get('/stats', getUserStats);
router.post('/avatar', upload.single('avatar'), uploadAvatar);
router.delete('/account', deleteAccount);
router.put('/privacy', updatePrivacy);
router.put('/filters', updateFilters);

module.exports = router;