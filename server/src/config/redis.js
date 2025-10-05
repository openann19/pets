const logger = require('../utils/logger');

let redisClient = null;
let isRedisAvailable = false;

/**
 * Initialize Redis client (production only)
 */
async function initRedis() {
  // Only use Redis in production or if explicitly enabled
  if (process.env.NODE_ENV !== 'production' && !process.env.REDIS_URL) {
    logger.info('Redis not configured - using in-memory cache for development');
    return null;
  }

  try {
    const redis = require('redis');
    
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error('Redis reconnect limit reached');
            return new Error('Redis reconnect limit reached');
          }
          // Exponential backoff: 100ms, 200ms, 400ms, etc.
          return Math.min(retries * 100, 3000);
        },
        connectTimeout: 5000
      },
      // Password if configured
      ...(process.env.REDIS_PASSWORD && { password: process.env.REDIS_PASSWORD })
    });
    
    // Event handlers
    redisClient.on('error', (err) => {
      logger.error('Redis error:', err);
      isRedisAvailable = false;
    });
    
    redisClient.on('connect', () => {
      logger.info('🔗 Redis connecting...');
    });
    
    redisClient.on('ready', () => {
      logger.info('✅ Redis connected and ready');
      isRedisAvailable = true;
    });
    
    redisClient.on('reconnecting', () => {
      logger.warn('⚠️  Redis reconnecting...');
      isRedisAvailable = false;
    });
    
    redisClient.on('end', () => {
      logger.warn('Redis connection ended');
      isRedisAvailable = false;
    });
    
    // Connect
    await redisClient.connect();
    
    // Test connection
    await redisClient.ping();
    
    return redisClient;
    
  } catch (error) {
    logger.error('Failed to initialize Redis:', error.message);
    logger.warn('Continuing without Redis - falling back to in-memory cache');
    return null;
  }
}

/**
 * Get Redis client instance
 */
function getRedisClient() {
  return redisClient;
}

/**
 * Check if Redis is available
 */
function isRedisReady() {
  return isRedisAvailable && redisClient && redisClient.isReady;
}

/**
 * Cache wrapper with automatic fallback
 */
async function cacheGet(key) {
  if (!isRedisReady()) return null;
  
  try {
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    logger.error('Redis GET error:', error.message);
    return null;
  }
}

/**
 * Set cache with TTL
 */
async function cacheSet(key, value, ttlSeconds = 300) {
  if (!isRedisReady()) return false;
  
  try {
    await redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
    return true;
  } catch (error) {
    logger.error('Redis SET error:', error.message);
    return false;
  }
}

/**
 * Delete cache key
 */
async function cacheDel(key) {
  if (!isRedisReady()) return false;
  
  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    logger.error('Redis DEL error:', error.message);
    return false;
  }
}

/**
 * Delete keys by pattern
 */
async function cacheDelPattern(pattern) {
  if (!isRedisReady()) return 0;
  
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
    return keys.length;
  } catch (error) {
    logger.error('Redis DEL pattern error:', error.message);
    return 0;
  }
}

/**
 * Get cache stats
 */
async function getCacheStats() {
  if (!isRedisReady()) {
    return {
      available: false,
      type: 'in-memory',
      keys: 0
    };
  }
  
  try {
    const info = await redisClient.info('stats');
    const dbSize = await redisClient.dbSize();
    
    return {
      available: true,
      type: 'redis',
      keys: dbSize,
      info: info
    };
  } catch (error) {
    logger.error('Redis stats error:', error.message);
    return {
      available: false,
      error: error.message
    };
  }
}

/**
 * Clear all cache
 */
async function clearCache() {
  if (!isRedisReady()) return 0;
  
  try {
    await redisClient.flushDb();
    logger.info('Redis cache cleared');
    return 1;
  } catch (error) {
    logger.error('Redis FLUSHDB error:', error.message);
    return 0;
  }
}

/**
 * Graceful shutdown
 */
async function closeRedis() {
  if (redisClient) {
    try {
      await redisClient.quit();
      logger.info('✅ Redis connection closed gracefully');
    } catch (error) {
      logger.error('Error closing Redis:', error.message);
      await redisClient.disconnect();
    }
  }
}

module.exports = {
  initRedis,
  getRedisClient,
  isRedisReady,
  cacheGet,
  cacheSet,
  cacheDel,
  cacheDelPattern,
  getCacheStats,
  clearCache,
  closeRedis
};

