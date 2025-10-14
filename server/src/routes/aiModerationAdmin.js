const express = require('express');
const router = express.Router();
const aiModerationController = require('../controllers/aiModerationController');
const moderationAnalyticsController = require('../controllers/moderationAnalyticsController');
const { protect, admin } = require('../middleware/authMiddleware');

// Admin AI moderation settings
router.get('/settings', protect, admin, aiModerationController.getSettings);
router.put('/settings', protect, admin, aiModerationController.updateSettings);

// Moderation analytics
router.get('/analytics', protect, admin, moderationAnalyticsController.getAnalytics);

module.exports = router;
