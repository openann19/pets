const logger = require('../utils/logger');

/**
 * Required environment variables for production
 */
const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'CLIENT_URL',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

/**
 * Optional but recommended environment variables
 */
const recommendedEnvVars = [
  'STRIPE_SECRET_KEY',
  'EMAIL_USER',
  'EMAIL_PASS',
  'SENTRY_DSN',
  'REDIS_URL'
];

/**
 * Validate production environment variables
 */
function validateProductionEnv() {
  // Only enforce strict validation in production
  if (process.env.NODE_ENV !== 'production') {
    logger.info('🔧 Running in development mode - skipping strict validation');
    return;
  }

  logger.info('🔍 Validating production environment variables...');

  const missing = requiredEnvVars.filter(key => !process.env[key]);

  if (missing.length > 0) {
    const error = `❌ Missing required environment variables: ${missing.join(', ')}`;
    logger.error(error);
    throw new Error(error);
  }

  // Validate JWT_SECRET strength
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters in production');
  }

  // Check for default/weak secrets
  const weakSecrets = [
    'your-super-secret-jwt-key-change-this-in-production-12345',
    'secret',
    'jwt-secret',
    'change-me'
  ];

  if (weakSecrets.includes(process.env.JWT_SECRET)) {
    throw new Error('❌ JWT_SECRET must be changed from default/weak value in production!');
  }

  if (weakSecrets.includes(process.env.JWT_REFRESH_SECRET)) {
    throw new Error('❌ JWT_REFRESH_SECRET must be changed from default/weak value in production!');
  }

  // Validate MongoDB URI format
  if (!process.env.MONGODB_URI.includes('mongodb://') && 
      !process.env.MONGODB_URI.includes('mongodb+srv://')) {
    throw new Error('❌ Invalid MONGODB_URI format');
  }

  // Warn if CLIENT_URL is not HTTPS in production
  if (process.env.CLIENT_URL && 
      !process.env.CLIENT_URL.startsWith('https://')) {
    logger.warn('⚠️  CLIENT_URL should use HTTPS in production');
  }

  // Check recommended variables
  const missingRecommended = recommendedEnvVars.filter(key => !process.env[key]);
  if (missingRecommended.length > 0) {
    logger.warn(`⚠️  Missing recommended environment variables: ${missingRecommended.join(', ')}`);
  }

  logger.info('✅ All required environment variables are set');
}

/**
 * Generate strong JWT secrets (for initial setup)
 */
function generateSecrets() {
  const crypto = require('crypto');
  
  return {
    JWT_SECRET: crypto.randomBytes(64).toString('hex'),
    JWT_REFRESH_SECRET: crypto.randomBytes(64).toString('hex')
  };
}

/**
 * Get production-specific configuration
 */
function getProductionConfig() {
  return {
    // MongoDB options
    mongodb: {
      maxPoolSize: 10,
      minPoolSize: 2,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
      family: 4, // Force IPv4
      retryWrites: true,
      retryReads: true,
      w: 'majority' // Write concern
    },

    // Rate limiting
    rateLimiting: {
      auth: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: process.env.NODE_ENV === 'production' ? 5 : 500
      },
      api: {
        windowMs: 15 * 60 * 1000,
        max: process.env.NODE_ENV === 'production' ? 100 : 1000
      },
      upload: {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: process.env.NODE_ENV === 'production' ? 20 : 200
      }
    },

    // CORS
    cors: {
      origin: process.env.NODE_ENV === 'production'
        ? (process.env.ALLOWED_ORIGINS || process.env.CLIENT_URL).split(',').map(o => o.trim())
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
      credentials: true,
      maxAge: 86400 // 24 hours
    },

    // Session/JWT
    jwt: {
      accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
      refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d'
    },

    // File upload limits
    upload: {
      maxFileSize: 10 * 1024 * 1024, // 10MB
      maxFiles: 10
    }
  };
}

module.exports = {
  validateProductionEnv,
  generateSecrets,
  getProductionConfig,
  requiredEnvVars,
  recommendedEnvVars
};

