const express = require('express');
const router = express.Router();
const aiModerationController = require('../controllers/aiModerationController');
const { protect } = require('../middleware/authMiddleware');

// AI moderation endpoints - require authentication
router.post('/moderate/text', protect, aiModerationController.moderateText);
router.post('/moderate/image', protect, aiModerationController.moderateImage);

module.exports = router;
