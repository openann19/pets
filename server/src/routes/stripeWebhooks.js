const express = require('express');
const { verifyWebhookSignature, handleWebhook } = require('../controllers/stripeWebhookController');

const router = express.Router();

// Stripe webhook endpoint - must use raw body
router.post('/webhook', 
  express.raw({ type: 'application/json' }), // Raw body required for signature verification
  verifyWebhookSignature,
  handleWebhook
);

// Webhook testing endpoint (for development)
router.post('/test-webhook', async (req, res) => {
  try {
    // Simulate webhook processing for testing
    const testEvent = {
      id: 'evt_test_webhook',
      type: 'customer.subscription.created',
      data: {
        object: {
          id: 'sub_test_123',
          customer: 'cus_test_123',
          status: 'active',
          current_period_start: Math.floor(Date.now() / 1000),
          current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
          cancel_at_period_end: false,
          created: Math.floor(Date.now() / 1000),
          items: {
            data: [{
              price: {
                id: 'price_premium_monthly'
              }
            }]
          }
        }
      }
    };

    // Process the test event
    await handleWebhook({ stripeEvent: testEvent }, res);
    
  } catch (error) {
    console.error('Test webhook error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Test webhook failed',
      error: error.message 
    });
  }
});

// Webhook status endpoint
router.get('/status', async (req, res) => {
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    // Get recent webhook events
    const events = await stripe.events.list({
      limit: 10,
      types: [
        'customer.subscription.created',
        'customer.subscription.updated',
        'customer.subscription.deleted',
        'invoice.payment_succeeded',
        'invoice.payment_failed'
      ]
    });

    res.json({
      success: true,
      webhook_status: 'active',
      recent_events: events.data.map(event => ({
        id: event.id,
        type: event.type,
        created: new Date(event.created * 1000),
        status: 'processed'
      })),
      configuration: {
        webhook_secret_configured: !!process.env.STRIPE_WEBHOOK_SECRET,
        stripe_connected: !!process.env.STRIPE_SECRET_KEY,
        environment: process.env.NODE_ENV
      }
    });
    
  } catch (error) {
    console.error('Webhook status check error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to check webhook status',
      error: error.message 
    });
  }
});

module.exports = router;
