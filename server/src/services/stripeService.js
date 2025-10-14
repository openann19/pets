const stripe = require('stripe');
const Configuration = require('../models/Configuration');
const { decrypt } = require('../utils/encryption');
const logger = require('../utils/logger');
const { sendAdminNotification } = require('./adminNotificationService');

/**
 * Get a configured Stripe client instance
 * 
 * @returns {Promise<Object>} Stripe client instance
 * @throws {Error} If Stripe is not configured
 */
const getStripeClient = async () => {
  try {
    // First try to get from database
    const configDoc = await Configuration.findOne({ type: 'stripe' });
    let secretKey = null;
    
    // Enhanced null checking and validation
    if (configDoc?.data?.secretKey) {
      try {
        secretKey = decrypt(configDoc.data.secretKey);
      } catch (decryptError) {
        logger.error('Failed to decrypt Stripe secret key from database', {
          error: decryptError.message,
          configId: configDoc._id
        });
        // Fall through to environment variable
      }
    }
    
    // Fall back to environment variable if database key is not available
    if (!secretKey && process.env.STRIPE_SECRET_KEY) {
      secretKey = process.env.STRIPE_SECRET_KEY;
    }
    
    // Validate that we have a secret key
    if (!secretKey || typeof secretKey !== 'string' || secretKey.trim().length === 0) {
      const error = new Error('Stripe is not configured - missing or invalid secret key');
      logger.error('Stripe configuration error', {
        error: error.message,
        hasConfigDoc: !!configDoc,
        hasConfigData: !!(configDoc?.data),
        hasConfigSecretKey: !!(configDoc?.data?.secretKey),
        hasEnvVar: !!process.env.STRIPE_SECRET_KEY,
        envVarLength: process.env.STRIPE_SECRET_KEY?.length || 0
      });
      
      // Send admin notification for critical configuration error
      await sendAdminNotification({
        type: 'error',
        severity: 'critical',
        title: 'Stripe Configuration Error',
        message: 'Stripe payment processing is not configured properly. Payment functionality will not work.',
        metadata: {
          hasConfigDoc: !!configDoc,
          hasEnvVar: !!process.env.STRIPE_SECRET_KEY,
        }
      }).catch(notificationError => {
        logger.error('Failed to send admin notification for Stripe config error', {
          notificationError: notificationError.message
        });
      });
      
      throw error;
    }
    
    // Validate the secret key format
    if (!secretKey.startsWith('sk_')) {
      const error = new Error('Invalid Stripe secret key format');
      logger.error('Stripe secret key validation failed', {
        error: error.message,
        keyPrefix: secretKey.substring(0, 10) + '...',
        keyLength: secretKey.length
      });
      throw error;
    }
    
    // Initialize and return Stripe client
    const client = stripe(secretKey);
    
    // Test the client with a simple API call
    try {
      await client.account.retrieve();
      logger.info('Stripe client initialized successfully');
    } catch (testError) {
      logger.warn('Stripe client test failed', {
        error: testError.message,
        type: testError.type,
        code: testError.code
      });
      
      // Send admin notification for Stripe connectivity issues
      await sendAdminNotification({
        type: 'warning',
        severity: 'high',
        title: 'Stripe Connectivity Issue',
        message: 'Stripe client test failed. Payment processing may be affected.',
        metadata: {
          error: testError.message,
          type: testError.type,
          code: testError.code
        }
      }).catch(notificationError => {
        logger.error('Failed to send admin notification for Stripe connectivity issue', {
          notificationError: notificationError.message
        });
      });
      
      // Don't throw here - the client might still work for other operations
    }
    
    return client;
  } catch (error) {
    logger.error('Failed to initialize Stripe client', {
      error: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Send admin notification for critical Stripe initialization failure
    await sendAdminNotification({
      type: 'error',
      severity: 'critical',
      title: 'Stripe Initialization Failed',
      message: 'Failed to initialize Stripe client. Payment processing is completely unavailable.',
      metadata: {
        error: error.message,
        name: error.name
      }
    }).catch(notificationError => {
      logger.error('Failed to send admin notification for Stripe initialization failure', {
        notificationError: notificationError.message
      });
    });
    
    throw new Error('Failed to initialize Stripe client: ' + error.message);
  }
};

/**
 * Get Stripe publishable key
 * 
 * @returns {Promise<string>} Stripe publishable key
 */
const getPublishableKey = async () => {
  try {
    // First try to get from database
    const configDoc = await Configuration.findOne({ type: 'stripe' });
    let publishableKey = null;
    
    // Enhanced null checking
    if (configDoc?.data?.publishableKey) {
      publishableKey = configDoc.data.publishableKey;
    } else if (process.env.STRIPE_PUBLISHABLE_KEY) {
      // Fall back to environment variable
      publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
    }
    
    // Validate the publishable key format
    if (publishableKey && typeof publishableKey === 'string' && publishableKey.trim().length > 0) {
      if (!publishableKey.startsWith('pk_')) {
        logger.warn('Invalid Stripe publishable key format', {
          keyPrefix: publishableKey.substring(0, 10) + '...',
          keyLength: publishableKey.length
        });
        return null;
      }
      return publishableKey;
    }
    
    logger.warn('Stripe publishable key not found', {
      hasConfigDoc: !!configDoc,
      hasConfigData: !!(configDoc?.data),
      hasConfigPublishableKey: !!(configDoc?.data?.publishableKey),
      hasEnvVar: !!process.env.STRIPE_PUBLISHABLE_KEY
    });
    
    return null;
  } catch (error) {
    logger.error('Failed to get Stripe publishable key', {
      error: error.message,
      stack: error.stack,
      name: error.name
    });
    return null;
  }
};

/**
 * Get Stripe webhook secret
 * 
 * @returns {Promise<string>} Stripe webhook secret
 */
const getWebhookSecret = async () => {
  try {
    // First try to get from database
    const configDoc = await Configuration.findOne({ type: 'stripe' });
    
    if (configDoc && configDoc.data && configDoc.data.webhookSecret) {
      return decrypt(configDoc.data.webhookSecret);
    } else if (process.env.STRIPE_WEBHOOK_SECRET) {
      // Fall back to environment variable
      return process.env.STRIPE_WEBHOOK_SECRET;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to get Stripe webhook secret:', error);
    return null;
  }
};

/**
 * Check if Stripe is in live mode
 * 
 * @returns {Promise<boolean>} True if Stripe is in live mode
 */
const isLiveMode = async () => {
  try {
    // First try to get from database
    const configDoc = await Configuration.findOne({ type: 'stripe' });
    
    if (configDoc && configDoc.data && configDoc.data.isLiveMode !== undefined) {
      return configDoc.data.isLiveMode;
    } else if (process.env.STRIPE_SECRET_KEY) {
      // Fall back to environment variable
      return process.env.STRIPE_SECRET_KEY.startsWith('sk_live_');
    }
    
    return false;
  } catch (error) {
    console.error('Failed to check Stripe mode:', error);
    return false;
  }
};

module.exports = {
  getStripeClient,
  getPublishableKey,
  getWebhookSecret,
  isLiveMode
};
