const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { validate } = require('../middleware/validation');
const { authenticateToken, refreshAccessToken } = require('../middleware/auth');
const {
  register,
  login,
  logout,
  getMe,
  verifyEmail,
  forgotPassword,
  resetPassword,
  setup2FA,
  verify2FA,
  validate2FA,
  disable2FA
} = require('../controllers/authController');

const router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test' // Skip in test environment
});

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 requests per hour
  message: 'Too many password reset attempts, please try again later'
});

// Validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
  body('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required'),
  body('dateOfBirth').isISO8601().withMessage('Valid date of birth is required'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number required')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

const emailValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
];

const passwordValidation = [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const twoFactorValidation = [
  body('code').isLength({ min: 6, max: 6 }).isNumeric().withMessage('Valid 6-digit code is required')
];

// Routes with rate limiting
router.post('/register', authLimiter, registerValidation, validate, register);
router.post('/login', authLimiter, loginValidation, validate, login);
router.post('/logout', authenticateToken, logout);
router.get('/me', authenticateToken, getMe);
router.post('/refresh-token', authLimiter, refreshAccessToken);
router.post('/verify-email/:token', verifyEmail);
router.post('/forgot-password', passwordResetLimiter, emailValidation, validate, forgotPassword);
router.post('/reset-password/:token', passwordResetLimiter, passwordValidation, validate, resetPassword);

// 2FA Routes
router.post('/2fa/setup', authenticateToken, setup2FA);
router.post('/2fa/verify', authenticateToken, twoFactorValidation, validate, verify2FA);
router.post('/2fa/validate', twoFactorValidation, validate, validate2FA);
router.post('/2fa/disable', authenticateToken, twoFactorValidation, validate, disable2FA);

module.exports = router;