const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Stripe Webhook Controller
 * Handles subscription lifecycle events from Stripe
 */

// Webhook endpoint signature verification
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * Verify webhook signature
 */
function verifyWebhookSignature(req, res, next) {
  const sig = req.headers['stripe-signature'];
  
  if (!sig) {
    logger.error('Stripe webhook: Missing signature header');
    return res.status(400).send('Missing signature header');
  }
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    logger.error('Stripe webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook signature verification failed: ${err.message}`);
  }
  
  req.stripeEvent = event;
  next();
}

/**
 * Handle customer subscription created
 */
async function handleCustomerSubscriptionCreated(event) {
  const subscription = event.data.object;
  const customerId = subscription.customer;
  
  try {
    // Get customer from Stripe to find user
    const customer = await stripe.customers.retrieve(customerId);
    const userEmail = customer.email;
    
    // Find user by email
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      logger.error(`User not found for subscription: ${userEmail}`);
      return;
    }
    
    // Update user subscription
    user.subscription = {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      plan: getPlanFromPriceId(subscription.items.data[0].price.id),
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      createdAt: new Date(subscription.created * 1000),
      updatedAt: new Date()
    };
    
    await user.save();
    
    logger.info(`Subscription created for user: ${userEmail}`, {
      subscriptionId: subscription.id,
      plan: user.subscription.plan
    });
    
  } catch (error) {
    logger.error('Error handling subscription created:', error);
    throw error;
  }
}

/**
 * Handle customer subscription updated
 */
async function handleCustomerSubscriptionUpdated(event) {
  const subscription = event.data.object;
  const customerId = subscription.customer;
  
  try {
    // Get customer from Stripe
    const customer = await stripe.customers.retrieve(customerId);
    const userEmail = customer.email;
    
    // Find user by email
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      logger.error(`User not found for subscription update: ${userEmail}`);
      return;
    }
    
    // Update subscription details
    user.subscription = {
      ...user.subscription,
      plan: getPlanFromPriceId(subscription.items.data[0].price.id),
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      updatedAt: new Date()
    };
    
    await user.save();
    
    logger.info(`Subscription updated for user: ${userEmail}`, {
      subscriptionId: subscription.id,
      status: subscription.status,
      plan: user.subscription.plan
    });
    
  } catch (error) {
    logger.error('Error handling subscription updated:', error);
    throw error;
  }
}

/**
 * Handle customer subscription deleted
 */
async function handleCustomerSubscriptionDeleted(event) {
  const subscription = event.data.object;
  const customerId = subscription.customer;
  
  try {
    // Get customer from Stripe
    const customer = await stripe.customers.retrieve(customerId);
    const userEmail = customer.email;
    
    // Find user by email
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      logger.error(`User not found for subscription deletion: ${userEmail}`);
      return;
    }
    
    // Update subscription to cancelled
    user.subscription = {
      ...user.subscription,
      status: 'cancelled',
      cancelledAt: new Date(),
      updatedAt: new Date()
    };
    
    await user.save();
    
    logger.info(`Subscription cancelled for user: ${userEmail}`, {
      subscriptionId: subscription.id
    });
    
  } catch (error) {
    logger.error('Error handling subscription deleted:', error);
    throw error;
  }
}

/**
 * Handle invoice payment succeeded
 */
async function handleInvoicePaymentSucceeded(event) {
  const invoice = event.data.object;
  const customerId = invoice.customer;
  
  try {
    // Get customer from Stripe
    const customer = await stripe.customers.retrieve(customerId);
    const userEmail = customer.email;
    
    // Find user by email
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      logger.error(`User not found for payment success: ${userEmail}`);
      return;
    }
    
    // Update subscription with payment info
    if (user.subscription) {
      user.subscription = {
        ...user.subscription,
        lastPaymentDate: new Date(),
        nextPaymentDate: invoice.period_end ? new Date(invoice.period_end * 1000) : null,
        updatedAt: new Date()
      };
      
      await user.save();
    }
    
    logger.info(`Payment succeeded for user: ${userEmail}`, {
      invoiceId: invoice.id,
      amount: invoice.amount_paid
    });
    
  } catch (error) {
    logger.error('Error handling payment succeeded:', error);
    throw error;
  }
}

/**
 * Handle invoice payment failed
 */
async function handleInvoicePaymentFailed(event) {
  const invoice = event.data.object;
  const customerId = invoice.customer;
  
  try {
    // Get customer from Stripe
    const customer = await stripe.customers.retrieve(customerId);
    const userEmail = customer.email;
    
    // Find user by email
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      logger.error(`User not found for payment failure: ${userEmail}`);
      return;
    }
    
    // Update subscription with payment failure info
    if (user.subscription) {
      user.subscription = {
        ...user.subscription,
        paymentFailed: true,
        lastPaymentFailure: new Date(),
        updatedAt: new Date()
      };
      
      await user.save();
    }
    
    logger.warn(`Payment failed for user: ${userEmail}`, {
      invoiceId: invoice.id,
      amount: invoice.amount_due
    });
    
  } catch (error) {
    logger.error('Error handling payment failed:', error);
    throw error;
  }
}

/**
 * Handle customer created
 */
async function handleCustomerCreated(event) {
  const customer = event.data.object;
  
  try {
    // Find user by email
    const user = await User.findOne({ email: customer.email });
    if (!user) {
      logger.error(`User not found for customer creation: ${customer.email}`);
      return;
    }
    
    // Update user with Stripe customer ID
    user.stripeCustomerId = customer.id;
    await user.save();
    
    logger.info(`Stripe customer created for user: ${customer.email}`, {
      customerId: customer.id
    });
    
  } catch (error) {
    logger.error('Error handling customer created:', error);
    throw error;
  }
}

/**
 * Handle customer updated
 */
async function handleCustomerUpdated(event) {
  const customer = event.data.object;
  
  try {
    // Find user by email
    const user = await User.findOne({ email: customer.email });
    if (!user) {
      logger.error(`User not found for customer update: ${customer.email}`);
      return;
    }
    
    // Update user email if changed in Stripe
    if (user.email !== customer.email) {
      user.email = customer.email;
      await user.save();
      
      logger.info(`User email updated via Stripe: ${customer.email}`, {
        customerId: customer.id
      });
    }
    
  } catch (error) {
    logger.error('Error handling customer updated:', error);
    throw error;
  }
}

/**
 * Map Stripe price ID to plan name
 */
function getPlanFromPriceId(priceId) {
  const priceMap = {
    'price_basic_monthly': 'basic',
    'price_basic_yearly': 'basic',
    'price_premium_monthly': 'premium',
    'price_premium_yearly': 'premium',
    'price_pro_monthly': 'pro',
    'price_pro_yearly': 'pro'
  };
  
  return priceMap[priceId] || 'basic';
}

/**
 * Main webhook handler
 */
async function handleWebhook(req, res) {
  const event = req.stripeEvent;
  
  logger.info(`Received Stripe webhook: ${event.type}`, {
    eventId: event.id,
    type: event.type
  });
  
  try {
    switch (event.type) {
      case 'customer.subscription.created':
        await handleCustomerSubscriptionCreated(event);
        break;
        
      case 'customer.subscription.updated':
        await handleCustomerSubscriptionUpdated(event);
        break;
        
      case 'customer.subscription.deleted':
        await handleCustomerSubscriptionDeleted(event);
        break;
        
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event);
        break;
        
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event);
        break;
        
      case 'customer.created':
        await handleCustomerCreated(event);
        break;
        
      case 'customer.updated':
        await handleCustomerUpdated(event);
        break;
        
      default:
        logger.info(`Unhandled webhook event type: ${event.type}`);
    }
    
    res.status(200).json({ received: true });
    
  } catch (error) {
    logger.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
}

/**
 * Get webhook events for debugging
 */
async function getWebhookEvents(req, res) {
  try {
    const events = await stripe.events.list({
      limit: 50,
      types: [
        'customer.subscription.created',
        'customer.subscription.updated',
        'customer.subscription.deleted',
        'invoice.payment_succeeded',
        'invoice.payment_failed'
      ]
    });
    
    res.json({
      events: events.data.map(event => ({
        id: event.id,
        type: event.type,
        created: new Date(event.created * 1000),
        data: event.data.object
      }))
    });
    
  } catch (error) {
    logger.error('Error fetching webhook events:', error);
    res.status(500).json({ error: 'Failed to fetch webhook events' });
  }
}

/**
 * Test webhook endpoint
 */
async function testWebhook(req, res) {
  try {
    // Create a test event
    const testEvent = {
      id: 'evt_test_webhook',
      type: 'customer.subscription.created',
      data: {
        object: {
          id: 'sub_test',
          customer: 'cus_test',
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
    
    await handleCustomerSubscriptionCreated({ data: testEvent.data });
    
    res.json({ message: 'Test webhook processed successfully' });
    
  } catch (error) {
    logger.error('Test webhook error:', error);
    res.status(500).json({ error: 'Test webhook failed' });
  }
}

module.exports = {
  verifyWebhookSignature,
  handleWebhook,
  getWebhookEvents,
  testWebhook,
  handleCustomerSubscriptionCreated,
  handleCustomerSubscriptionUpdated,
  handleCustomerSubscriptionDeleted,
  handleInvoicePaymentSucceeded,
  handleInvoicePaymentFailed,
  handleCustomerCreated,
  handleCustomerUpdated
};
