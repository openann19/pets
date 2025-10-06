/**
 * Stripe Payment Service
 * Comprehensive payment processing for PawfectMatch Premium subscriptions
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const logger = require('../utils/logger');

// Stripe configuration
const STRIPE_CONFIG = {
  currency: 'usd',
  paymentMethods: ['card'],
  subscriptionIntervals: {
    monthly: 'month',
    yearly: 'year'
  },
  plans: {
    basic: {
      monthly: 'price_basic_monthly',
      yearly: 'price_basic_yearly',
      features: ['unlimited_likes', 'basic_filters']
    },
    premium: {
      monthly: 'price_premium_monthly', 
      yearly: 'price_premium_yearly',
      features: ['unlimited_likes', 'super_likes', 'advanced_filters', 'boost_profile', 'see_who_liked']
    },
    elite: {
      monthly: 'price_elite_monthly',
      yearly: 'price_elite_yearly', 
      features: ['unlimited_likes', 'super_likes', 'advanced_filters', 'boost_profile', 'see_who_liked', 'ai_recommendations', 'priority_support']
    }
  }
};

/**
 * Create Stripe customer
 * @param {Object} userData - User data
 * @returns {Promise<Object>} Stripe customer
 */
const createCustomer = async (userData) => {
  try {
    const customer = await stripe.customers.create({
      email: userData.email,
      name: userData.name,
      metadata: {
        userId: userData.id,
        platform: 'pawfectmatch'
      }
    });

    logger.info(`Stripe customer created: ${customer.id}`);
    return customer;
  } catch (error) {
    logger.error('Failed to create Stripe customer:', error);
    throw error;
  }
};

/**
 * Create checkout session for subscription
 * @param {Object} options - Checkout options
 * @returns {Promise<Object>} Checkout session
 */
const createCheckoutSession = async (options) => {
  try {
    const { userId, plan, interval, successUrl, cancelUrl, customerId } = options;
    
    const priceId = STRIPE_CONFIG.plans[plan]?.[interval];
    if (!priceId) {
      throw new Error(`Invalid plan or interval: ${plan}/${interval}`);
    }

    const sessionConfig = {
      customer: customerId,
      payment_method_types: STRIPE_CONFIG.paymentMethods,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        plan,
        interval
      },
      subscription_data: {
        metadata: {
          userId,
          plan,
          interval
        }
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      tax_id_collection: {
        enabled: true,
      },
    };

    const session = await stripe.checkout.sessions.create(sessionConfig);
    
    logger.info(`Checkout session created: ${session.id} for user ${userId}`);
    return session;
  } catch (error) {
    logger.error('Failed to create checkout session:', error);
    throw error;
  }
};

/**
 * Create subscription directly
 * @param {Object} options - Subscription options
 * @returns {Promise<Object>} Stripe subscription
 */
const createSubscription = async (options) => {
  try {
    const { customerId, priceId, paymentMethodId } = options;

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        platform: 'pawfectmatch'
      }
    });

    logger.info(`Subscription created: ${subscription.id}`);
    return subscription;
  } catch (error) {
    logger.error('Failed to create subscription:', error);
    throw error;
  }
};

/**
 * Cancel subscription
 * @param {string} subscriptionId - Stripe subscription ID
 * @param {boolean} immediately - Cancel immediately or at period end
 * @returns {Promise<Object>} Updated subscription
 */
const cancelSubscription = async (subscriptionId, immediately = false) => {
  try {
    let subscription;
    
    if (immediately) {
      subscription = await stripe.subscriptions.cancel(subscriptionId);
    } else {
      subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true
      });
    }

    logger.info(`Subscription ${immediately ? 'cancelled' : 'scheduled for cancellation'}: ${subscriptionId}`);
    return subscription;
  } catch (error) {
    logger.error('Failed to cancel subscription:', error);
    throw error;
  }
};

/**
 * Reactivate subscription
 * @param {string} subscriptionId - Stripe subscription ID
 * @returns {Promise<Object>} Updated subscription
 */
const reactivateSubscription = async (subscriptionId) => {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false
    });

    logger.info(`Subscription reactivated: ${subscriptionId}`);
    return subscription;
  } catch (error) {
    logger.error('Failed to reactivate subscription:', error);
    throw error;
  }
};

/**
 * Update subscription plan
 * @param {string} subscriptionId - Stripe subscription ID
 * @param {string} newPriceId - New price ID
 * @returns {Promise<Object>} Updated subscription
 */
const updateSubscriptionPlan = async (subscriptionId, newPriceId) => {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: subscription.items.data[0].id,
        price: newPriceId,
      }],
      proration_behavior: 'create_prorations',
    });

    logger.info(`Subscription plan updated: ${subscriptionId}`);
    return updatedSubscription;
  } catch (error) {
    logger.error('Failed to update subscription plan:', error);
    throw error;
  }
};

/**
 * Get subscription details
 * @param {string} subscriptionId - Stripe subscription ID
 * @returns {Promise<Object>} Subscription details
 */
const getSubscription = async (subscriptionId) => {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['latest_invoice', 'customer', 'items.data.price']
    });

    return subscription;
  } catch (error) {
    logger.error('Failed to get subscription:', error);
    throw error;
  }
};

/**
 * Get customer's subscriptions
 * @param {string} customerId - Stripe customer ID
 * @returns {Promise<Array>} Customer subscriptions
 */
const getCustomerSubscriptions = async (customerId) => {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      expand: ['data.latest_invoice', 'data.items.data.price']
    });

    return subscriptions.data;
  } catch (error) {
    logger.error('Failed to get customer subscriptions:', error);
    throw error;
  }
};

/**
 * Create payment intent for one-time payments
 * @param {Object} options - Payment options
 * @returns {Promise<Object>} Payment intent
 */
const createPaymentIntent = async (options) => {
  try {
    const { amount, currency = 'usd', customerId, metadata = {} } = options;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      customer: customerId,
      metadata: {
        platform: 'pawfectmatch',
        ...metadata
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    logger.info(`Payment intent created: ${paymentIntent.id}`);
    return paymentIntent;
  } catch (error) {
    logger.error('Failed to create payment intent:', error);
    throw error;
  }
};

/**
 * Create setup intent for saving payment methods
 * @param {string} customerId - Stripe customer ID
 * @returns {Promise<Object>} Setup intent
 */
const createSetupIntent = async (customerId) => {
  try {
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: STRIPE_CONFIG.paymentMethods,
      usage: 'off_session',
    });

    logger.info(`Setup intent created: ${setupIntent.id}`);
    return setupIntent;
  } catch (error) {
    logger.error('Failed to create setup intent:', error);
    throw error;
  }
};

/**
 * Get customer's payment methods
 * @param {string} customerId - Stripe customer ID
 * @returns {Promise<Array>} Payment methods
 */
const getPaymentMethods = async (customerId) => {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

    return paymentMethods.data;
  } catch (error) {
    logger.error('Failed to get payment methods:', error);
    throw error;
  }
};

/**
 * Update default payment method
 * @param {string} customerId - Stripe customer ID
 * @param {string} paymentMethodId - Payment method ID
 * @returns {Promise<Object>} Updated customer
 */
const updateDefaultPaymentMethod = async (customerId, paymentMethodId) => {
  try {
    const customer = await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    logger.info(`Default payment method updated for customer: ${customerId}`);
    return customer;
  } catch (error) {
    logger.error('Failed to update default payment method:', error);
    throw error;
  }
};

/**
 * Get billing history
 * @param {string} customerId - Stripe customer ID
 * @param {number} limit - Number of invoices to retrieve
 * @returns {Promise<Array>} Billing history
 */
const getBillingHistory = async (customerId, limit = 10) => {
  try {
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit,
      expand: ['data.payment_intent']
    });

    return invoices.data;
  } catch (error) {
    logger.error('Failed to get billing history:', error);
    throw error;
  }
};

/**
 * Create coupon
 * @param {Object} couponData - Coupon data
 * @returns {Promise<Object>} Created coupon
 */
const createCoupon = async (couponData) => {
  try {
    const coupon = await stripe.coupons.create({
      id: couponData.id,
      percent_off: couponData.percentOff,
      duration: couponData.duration, // 'once', 'repeating', 'forever'
      duration_in_months: couponData.durationInMonths,
      max_redemptions: couponData.maxRedemptions,
      metadata: {
        platform: 'pawfectmatch'
      }
    });

    logger.info(`Coupon created: ${coupon.id}`);
    return coupon;
  } catch (error) {
    logger.error('Failed to create coupon:', error);
    throw error;
  }
};

/**
 * Verify webhook signature
 * @param {string} payload - Raw webhook payload
 * @param {string} signature - Webhook signature
 * @returns {Object} Parsed event
 */
const verifyWebhookSignature = (payload, signature) => {
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    return event;
  } catch (error) {
    logger.error('Webhook signature verification failed:', error);
    throw error;
  }
};

/**
 * Handle successful payment
 * @param {Object} event - Stripe event
 * @returns {Promise<void>}
 */
const handleSuccessfulPayment = async (event) => {
  try {
    const paymentIntent = event.data.object;
    
    // Update user subscription status in database
    // This would typically update your database with the successful payment
    logger.info(`Payment successful: ${paymentIntent.id}`);
    
    // Send confirmation email, update user status, etc.
  } catch (error) {
    logger.error('Failed to handle successful payment:', error);
    throw error;
  }
};

/**
 * Handle subscription events
 * @param {Object} event - Stripe event
 * @returns {Promise<void>}
 */
const handleSubscriptionEvent = async (event) => {
  try {
    const subscription = event.data.object;
    const eventType = event.type;

    switch (eventType) {
      case 'customer.subscription.created':
        logger.info(`Subscription created: ${subscription.id}`);
        break;
      case 'customer.subscription.updated':
        logger.info(`Subscription updated: ${subscription.id}`);
        break;
      case 'customer.subscription.deleted':
        logger.info(`Subscription cancelled: ${subscription.id}`);
        break;
      case 'invoice.payment_succeeded':
        logger.info(`Invoice payment succeeded: ${subscription.id}`);
        break;
      case 'invoice.payment_failed':
        logger.error(`Invoice payment failed: ${subscription.id}`);
        break;
    }

    // Update database with subscription status
    // Send notifications, update user permissions, etc.
  } catch (error) {
    logger.error('Failed to handle subscription event:', error);
    throw error;
  }
};

module.exports = {
  // Customer management
  createCustomer,
  
  // Subscription management
  createCheckoutSession,
  createSubscription,
  cancelSubscription,
  reactivateSubscription,
  updateSubscriptionPlan,
  getSubscription,
  getCustomerSubscriptions,
  
  // Payment management
  createPaymentIntent,
  createSetupIntent,
  getPaymentMethods,
  updateDefaultPaymentMethod,
  getBillingHistory,
  
  // Coupons and promotions
  createCoupon,
  
  // Webhook handling
  verifyWebhookSignature,
  handleSuccessfulPayment,
  handleSubscriptionEvent,
  
  // Configuration
  STRIPE_CONFIG
};
