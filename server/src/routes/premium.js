const express = require('express');
const {
  subscribeToPremium,
  cancelSubscription,
  getPremiumFeatures,
  boostProfile,
  getSuperLikes,
  getSubscriptionStatus,
  updatePaymentMethod,
  getBillingHistory,
  reactivateSubscription,
  getUsageStats,
  createCheckoutSession,
  handleWebhook,
  getPlans,
  upgradePlan,
  downgradePlan
} = require('../controllers/premiumController');
const { authenticateToken, requirePremium } = require('../middleware/auth');
const { validatePremiumRequest } = require('../middleware/validation');

const router = express.Router();

// Subscription Management Routes
router.post('/subscribe', authenticateToken, validatePremiumRequest, subscribeToPremium);
router.post('/cancel', authenticateToken, cancelSubscription);
router.post('/reactivate', authenticateToken, reactivateSubscription);
router.get('/status', authenticateToken, getSubscriptionStatus);
router.get('/plans', getPlans);

// Payment Management Routes
router.post('/checkout', authenticateToken, createCheckoutSession);
router.put('/payment-method', authenticateToken, updatePaymentMethod);
router.get('/billing-history', authenticateToken, getBillingHistory);

// Plan Management Routes
router.post('/upgrade', authenticateToken, requirePremium, upgradePlan);
router.post('/downgrade', authenticateToken, requirePremium, downgradePlan);

// Premium Features Routes
router.get('/features', getPremiumFeatures);
router.get('/usage', authenticateToken, requirePremium, getUsageStats);
router.post('/boost/:petId', authenticateToken, requirePremium, boostProfile);
router.get('/super-likes', authenticateToken, requirePremium, getSuperLikes);

// Webhook Routes (for Stripe)
router.post('/webhook', handleWebhook);

// Analytics and Reporting Routes
router.get('/analytics', authenticateToken, requirePremium, (req, res) => {
  res.json({
    success: true,
    data: {
      profileViews: Math.floor(Math.random() * 1000),
      matches: Math.floor(Math.random() * 100),
      superLikesUsed: Math.floor(Math.random() * 50),
      boostsUsed: Math.floor(Math.random() * 20),
      premiumSince: new Date().toISOString(),
    }
  });
});

module.exports = router;