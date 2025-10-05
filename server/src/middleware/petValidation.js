const { body, validationResult } = require('express-validator');

const createPetValidation = [
  body('name').trim().notEmpty().withMessage('Pet name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('species').isIn(['dog', 'cat', 'bird', 'rabbit', 'other'])
    .withMessage('Invalid species'),
  body('breed').optional().trim(),
  body('age').isInt({ min: 0, max: 30 }).withMessage('Age must be 0-30'),
  body('gender').isIn(['male', 'female']).withMessage('Invalid gender'),
  body('size').isIn(['small', 'medium', 'large']).withMessage('Invalid size'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio max 500 characters'),
  body('temperament').optional().isArray(),
  body('preferences.activityLevel').optional()
    .isIn(['low', 'medium', 'high']).withMessage('Invalid activity level'),
];

const updatePetValidation = [
  body('name').optional().trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('age').optional().isInt({ min: 0, max: 30 }).withMessage('Age must be 0-30'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio max 500 characters'),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  createPetValidation,
  updatePetValidation,
  validate,
};
