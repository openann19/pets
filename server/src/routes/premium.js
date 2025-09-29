const express = require('express');
const {
  subscribeToPremium,
  cancelSubscription,
  getPremiumFeatures,
  boostProfile,
  getSuperLikes
} = require('../controllers/premiumController');

const router = express.Router();

// Routes
router.post('/subscribe', subscribeToPremium);
router.post('/cancel', cancelSubscription);
router.get('/features', getPremiumFeatures);
router.post('/boost/:petId', boostProfile);
router.get('/super-likes', getSuperLikes);

module.exports = router;