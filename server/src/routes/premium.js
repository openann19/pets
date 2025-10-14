const express = require('express');
const {
  subscribeToPremium,
  cancelSubscription,
  getPremiumFeatures,
  boostProfile,
  getSuperLikes,
  getSubscription,
  getUsage,
  reactivateSubscription,
} = require('../controllers/premiumController');

const router = express.Router();

// Subscription management routes
router.post('/subscribe', subscribeToPremium);
router.post('/cancel', cancelSubscription);
router.post('/reactivate', reactivateSubscription);
router.get('/subscription', getSubscription);
router.get('/usage', getUsage);

// Premium features routes
router.get('/features', getPremiumFeatures);
router.post('/boost/:petId', boostProfile);
router.get('/super-likes', getSuperLikes);

module.exports = router;