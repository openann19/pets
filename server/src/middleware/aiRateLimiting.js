const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');
const logger = require('../utils/logger');

/**
 * AI Service Rate Limiting Middleware
 * Implements sophisticated rate limiting for AI endpoints
 */

// Redis client for distributed rate limiting
let redisClient = null;

// Initialize Redis client if available
if (process.env.REDIS_URL) {
  try {
    redisClient = new Redis(process.env.REDIS_URL, {
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
    });
    
    redisClient.on('error', (err) => {
      logger.error('Redis connection error:', err);
    });
    
    redisClient.on('connect', () => {
      logger.info('Redis connected for rate limiting');
    });
  } catch (error) {
    logger.warn('Redis not available for rate limiting, using memory store');
  }
}

/**
 * Create rate limiter with Redis store or memory fallback
 */
function createRateLimiter(options) {
  const store = redisClient ? new RedisStore({
    client: redisClient,
    prefix: 'rl:ai:',
  }) : undefined;
  
  return rateLimit({
    store,
    windowMs: options.windowMs,
    max: options.max,
    message: {
      error: 'Too many requests',
      message: options.message,
      retryAfter: Math.ceil(options.windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        endpoint: req.path,
        userId: req.user?.id
      });
      
      res.status(429).json({
        error: 'Rate limit exceeded',
        message: options.message,
        retryAfter: Math.ceil(options.windowMs / 1000),
        limit: options.max,
        window: options.windowMs / 1000
      });
    },
    skip: (req) => {
      // Skip rate limiting for admin users
      return req.user?.role === 'admin';
    },
    keyGenerator: (req) => {
      // Use user ID if authenticated, otherwise IP
      return req.user?.id || req.ip;
    }
  });
}

/**
 * AI Service Rate Limiters
 */
const aiRateLimiters = {
  // General AI endpoints - 100 requests per 15 minutes
  general: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: 'Too many AI requests. Please wait before making more requests.'
  }),
  
  // Image generation - 20 requests per hour
  imageGeneration: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20,
    message: 'Image generation limit exceeded. Please wait before generating more images.'
  }),
  
  // Text analysis - 200 requests per 15 minutes
  textAnalysis: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    message: 'Text analysis limit exceeded. Please wait before making more requests.'
  }),
  
  // Pet matching suggestions - 50 requests per 10 minutes
  petMatching: createRateLimiter({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 50,
    message: 'Pet matching limit exceeded. Please wait before getting more suggestions.'
  }),
  
  // Premium AI features - 500 requests per hour
  premium: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 500,
    message: 'Premium AI feature limit exceeded. Please wait before using more features.'
  }),
  
  // AI chat - 100 messages per 30 minutes
  aiChat: createRateLimiter({
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: 100,
    message: 'AI chat limit exceeded. Please wait before sending more messages.'
  }),
  
  // Expensive operations - 10 requests per day
  expensive: createRateLimiter({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 10,
    message: 'Daily limit for expensive AI operations exceeded. Please try again tomorrow.'
  })
};

/**
 * Dynamic rate limiter based on user subscription
 */
function getSubscriptionBasedLimiter(req, res, next) {
  const user = req.user;
  
  if (!user) {
    return aiRateLimiters.general(req, res, next);
  }
  
  // Adjust limits based on subscription
  let limiter;
  
  switch (user.subscription?.plan) {
    case 'premium':
      limiter = createRateLimiter({
        windowMs: 15 * 60 * 1000,
        max: 500, // 5x more requests
        message: 'Premium rate limit exceeded. Please wait before making more requests.'
      });
      break;
      
    case 'pro':
      limiter = createRateLimiter({
        windowMs: 15 * 60 * 1000,
        max: 1000, // 10x more requests
        message: 'Pro rate limit exceeded. Please wait before making more requests.'
      });
      break;
      
    default:
      limiter = aiRateLimiters.general;
  }
  
  return limiter(req, res, next);
}

/**
 * Burst protection - prevents rapid-fire requests
 */
const burstProtection = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // Max 20 requests per minute
  message: 'Too many rapid requests. Please slow down.'
});

/**
 * Cost-based rate limiting for expensive AI operations
 */
function createCostBasedLimiter(costMultiplier = 1) {
  return createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: Math.floor(100 / costMultiplier), // Adjust based on cost
    message: `Cost-based rate limit exceeded. This operation costs ${costMultiplier}x normal requests.`
  });
}

/**
 * Adaptive rate limiting based on system load
 */
function createAdaptiveLimiter(baseLimit = 100) {
  return (req, res, next) => {
    // Check system load (simplified)
    const loadAverage = process.cpuUsage();
    const memoryUsage = process.memoryUsage();
    
    // Adjust limit based on system load
    let adjustedLimit = baseLimit;
    
    if (memoryUsage.heapUsed > 0.8 * memoryUsage.heapTotal) {
      adjustedLimit = Math.floor(baseLimit * 0.5); // Reduce by 50% if high memory usage
    }
    
    const limiter = createRateLimiter({
      windowMs: 15 * 60 * 1000,
      max: adjustedLimit,
      message: 'System load-based rate limit exceeded. Please try again later.'
    });
    
    return limiter(req, res, next);
  };
}

/**
 * Rate limiting middleware factory
 */
function createRateLimitingMiddleware(type, options = {}) {
  const limiter = aiRateLimiters[type];
  
  if (!limiter) {
    throw new Error(`Unknown rate limiter type: ${type}`);
  }
  
  return (req, res, next) => {
    // Apply burst protection first
    burstProtection(req, res, (err) => {
      if (err) return next(err);
      
      // Apply specific rate limiter
      limiter(req, res, next);
    });
  };
}

/**
 * Rate limiting status endpoint
 */
async function getRateLimitStatus(req, res) {
  try {
    const userId = req.user?.id || req.ip;
    const key = `rl:ai:general:${userId}`;
    
    if (redisClient) {
      const current = await redisClient.get(key);
      const ttl = await redisClient.ttl(key);
      
      res.json({
        current: current ? parseInt(current) : 0,
        limit: 100,
        window: 15 * 60, // 15 minutes in seconds
        resetIn: ttl > 0 ? ttl : 0,
        remaining: Math.max(0, 100 - (current ? parseInt(current) : 0))
      });
    } else {
      res.json({
        current: 0,
        limit: 100,
        window: 15 * 60,
        resetIn: 0,
        remaining: 100,
        note: 'Using memory store - limits reset on server restart'
      });
    }
  } catch (error) {
    logger.error('Error getting rate limit status:', error);
    res.status(500).json({ error: 'Failed to get rate limit status' });
  }
}

/**
 * Reset rate limits for a user (admin only)
 */
async function resetRateLimits(req, res) {
  try {
    const { userId } = req.params;
    
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    if (redisClient) {
      const pattern = `rl:ai:*:${userId}`;
      const keys = await redisClient.keys(pattern);
      
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
      
      res.json({
        message: 'Rate limits reset successfully',
        keysDeleted: keys.length
      });
    } else {
      res.json({
        message: 'Rate limits will reset on server restart (memory store)'
      });
    }
  } catch (error) {
    logger.error('Error resetting rate limits:', error);
    res.status(500).json({ error: 'Failed to reset rate limits' });
  }
}

module.exports = {
  aiRateLimiters,
  getSubscriptionBasedLimiter,
  burstProtection,
  createCostBasedLimiter,
  createAdaptiveLimiter,
  createRateLimitingMiddleware,
  getRateLimitStatus,
  resetRateLimits
};
