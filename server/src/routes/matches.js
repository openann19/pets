const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validation');
const {
  getMatches,
  getMatch,
  sendMessage,
  getMessages,
  archiveMatch,
  blockMatch,
  favoriteMatch,
  getMatchStats
} = require('../controllers/matchController');

const router = express.Router();

// Validation rules
const messageValidation = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message content is required and must be less than 1000 characters'),
  body('messageType')
    .optional()
    .isIn(['text', 'image', 'location'])
    .withMessage('Invalid message type')
];

// Routes
router.get('/', getMatches);
router.get('/stats', getMatchStats);
router.get('/:matchId', getMatch);
router.get('/:matchId/messages', getMessages);
router.post('/:matchId/messages', messageValidation, validate, sendMessage);
router.patch('/:matchId/archive', archiveMatch);
router.patch('/:matchId/block', blockMatch);
router.patch('/:matchId/favorite', favoriteMatch);

module.exports = router;