const { cacheGet, cacheSet, cacheDel, cacheDelPattern, isRedisReady } = require('../config/redis');
const logger = require('../utils/logger');

/**
 * Cache middleware with automatic Redis/in-memory fallback
 * @param {number} ttl - Time to live in seconds
 * @param {function} keyGenerator - Function to generate cache key from request
 */
function cacheMiddleware(ttl = 300, keyGenerator = null) {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }
    
    // Generate cache key
    const cacheKey = keyGenerator 
      ? keyGenerator(req)
      : `cache:${req.originalUrl}:${req.userId || 'anonymous'}`;
    
    try {
      // Try to get from cache
      const cachedData = await cacheGet(cacheKey);
      
      if (cachedData) {
        logger.debug(`Cache HIT: ${cacheKey}`);
        return res.json(cachedData);
      }
      
      logger.debug(`Cache MISS: ${cacheKey}`);
      
      // Override res.json to cache the response
      const originalJson = res.json.bind(res);
      res.json = function(data) {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cacheSet(cacheKey, data, ttl).catch(err => {
            logger.error('Failed to cache response:', err.message);
          });
        }
        return originalJson(data);
      };
      
      next();
      
    } catch (error) {
      logger.error('Cache middleware error:', error.message);
      next();
    }
  };
}

/**
 * Invalidate cache by pattern
 */
async function invalidateCachePattern(pattern) {
  try {
    const count = await cacheDelPattern(pattern);
    logger.info(`Invalidated ${count} cache keys matching pattern: ${pattern}`);
    return count;
  } catch (error) {
    logger.error('Cache invalidation error:', error.message);
    return 0;
  }
}

/**
 * Invalidate specific cache key
 */
async function invalidateCacheKey(key) {
  try {
    await cacheDel(key);
    logger.info(`Invalidated cache key: ${key}`);
    return true;
  } catch (error) {
    logger.error('Cache key invalidation error:', error.message);
    return false;
  }
}

/**
 * Invalidate user-specific cache
 */
async function invalidateUserCache(userId) {
  return invalidateCachePattern(`cache:*:${userId}`);
}

/**
 * Cache key generators for common patterns
 */
const cacheKeyGenerators = {
  // Pet discovery cache key
  petDiscovery: (req) => {
    const { species, intent, limit, skip } = req.query;
    return `cache:pets:discover:${species || 'all'}:${intent || 'all'}:${limit || 20}:${skip || 0}:${req.userId}`;
  },
  
  // User profile cache key
  userProfile: (req) => {
    return `cache:user:profile:${req.params.id || req.userId}`;
  },
  
  // Pet details cache key
  petDetails: (req) => {
    return `cache:pet:${req.params.id}`;
  },
  
  // Matches list cache key
  matchesList: (req) => {
    return `cache:matches:${req.userId}`;
  },
  
  // Breeds list cache key
  breedsList: (req) => {
    const { species } = req.query;
    return `cache:breeds:${species || 'all'}`;
  }
};

/**
 * Middleware to invalidate cache after mutations
 */
function invalidateCacheAfter(patterns) {
  return async (req, res, next) => {
    // Store original send
    const originalSend = res.send.bind(res);
    
    // Override send
    res.send = function(data) {
      // Only invalidate on successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Invalidate patterns
        Promise.all(
          patterns.map(pattern => {
            // Replace :userId with actual userId
            const resolvedPattern = pattern.replace(':userId', req.userId || '*');
            return invalidateCachePattern(resolvedPattern);
          })
        ).catch(err => {
          logger.error('Cache invalidation after mutation failed:', err.message);
        });
      }
      
      return originalSend(data);
    };
    
    next();
  };
}

module.exports = {
  cacheMiddleware,
  invalidateCachePattern,
  invalidateCacheKey,
  invalidateUserCache,
  invalidateCacheAfter,
  cacheKeyGenerators
};

