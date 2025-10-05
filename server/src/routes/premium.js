const express = require('express');
const {
  subscribeToPremium,
  cancelSubscription,
  getPremiumFeatures,
  boostProfile,
  getSuperLikes
} = require('../controllers/premiumController');
const { authenticateToken, requirePremium } = require('../middleware/auth');

const router = express.Router();

// Routes
router.post('/subscribe', authenticateToken, subscribeToPremium);
router.post('/cancel', authenticateToken, cancelSubscription);
router.get('/features', getPremiumFeatures);
router.post('/boost/:petId', authenticateToken, requirePremium, boostProfile);
router.get('/super-likes', authenticateToken, requirePremium, getSuperLikes);

module.exports = router;