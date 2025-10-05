/**
 * Caching Middleware
 * Implements intelligent caching for API responses
 */

const NodeCache = require('node-cache');
const logger = require('../utils/logger');

// Create cache instance with default TTL of 5 minutes
const cache = new NodeCache({
  stdTTL: 300, // 5 minutes
  checkperiod: 60, // Check for expired keys every 60 seconds
  useClones: false // Don't clone objects (better performance)
});

// Track cache statistics
const stats = {
  hits: 0,
  misses: 0,
  sets: 0,
  deletes: 0
};

/**
 * Generate cache key from request
 */
const generateCacheKey = (req) => {
  const base = `${req.method}:${req.baseUrl}${req.path}`;
  const query = JSON.stringify(req.query);
  const userId = req.userId || 'anonymous';
  return `${base}:${userId}:${query}`;
};

/**
 * Cache middleware factory
 * @param {number} ttl - Time to live in seconds (optional)
 * @param {function} keyGenerator - Custom key generator function (optional)
 */
const cacheMiddleware = (ttl = 300, keyGenerator = null) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }
    
    // Generate cache key
    const cacheKey = keyGenerator ? keyGenerator(req) : generateCacheKey(req);
    
    // Try to get from cache
    const cachedResponse = cache.get(cacheKey);
    
    if (cachedResponse) {
      stats.hits++;
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('X-Cache-Key', cacheKey);
      
      logger.debug('Cache hit', { cacheKey, requestId: req.id });
      
      return res.json(cachedResponse);
    }
    
    stats.misses++;
    res.setHeader('X-Cache', 'MISS');
    
    logger.debug('Cache miss', { cacheKey, requestId: req.id });
    
    // Store original json method
    const originalJson = res.json.bind(res);
    
    // Override json method to cache response
    res.json = (data) => {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(cacheKey, data, ttl);
        stats.sets++;
        
        logger.debug('Response cached', { cacheKey, ttl, requestId: req.id });
      }
      
      return originalJson(data);
    };
    
    next();
  };
};

/**
 * Invalidate cache by pattern
 * @param {string} pattern - Pattern to match (e.g., 'GET:/api/pets*')
 */
const invalidateCache = (pattern) => {
  const keys = cache.keys();
  let deletedCount = 0;
  
  keys.forEach(key => {
    if (key.includes(pattern)) {
      cache.del(key);
      deletedCount++;
      stats.deletes++;
    }
  });
  
  logger.info('Cache invalidated', { pattern, deletedCount });
  
  return deletedCount;
};

/**
 * Invalidate user-specific cache
 * @param {string} userId - User ID
 */
const invalidateUserCache = (userId) => {
  return invalidateCache(`:${userId}:`);
};

/**
 * Clear all cache
 */
const clearCache = () => {
  const keys = cache.keys();
  cache.flushAll();
  stats.deletes += keys.length;
  
  logger.info('Cache cleared', { keysDeleted: keys.length });
  
  return keys.length;
};

/**
 * Get cache statistics
 */
const getCacheStats = () => {
  const keys = cache.keys();
  const totalRequests = stats.hits + stats.misses;
  const hitRate = totalRequests > 0 ? ((stats.hits / totalRequests) * 100).toFixed(2) : 0;
  
  return {
    ...stats,
    totalRequests,
    hitRate: `${hitRate}%`,
    currentKeys: keys.length,
    cacheKeys: keys
  };
};

/**
 * Middleware to invalidate cache on mutations
 */
const invalidateOnMutation = (pattern) => {
  return (req, res, next) => {
    // Only for non-GET requests
    if (req.method !== 'GET') {
      const originalJson = res.json.bind(res);
      
      res.json = (data) => {
        // Invalidate cache after successful mutation
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const deletedCount = invalidateCache(pattern);
          logger.debug('Cache invalidated after mutation', {
            method: req.method,
            path: req.path,
            pattern,
            deletedCount
          });
        }
        
        return originalJson(data);
      };
    }
    
    next();
  };
};

module.exports = {
  cacheMiddleware,
  invalidateCache,
  invalidateUserCache,
  clearCache,
  getCacheStats,
  invalidateOnMutation
};

