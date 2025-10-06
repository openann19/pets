const session = require('express-session');
const Redis = require('ioredis');
const RedisStore = require('connect-redis')(session);

const logger = require('../utils/logger');

/**
 * Redis Session Store Service
 * Provides scalable session management for production
 */

let redisClient = null;
let sessionStore = null;

/**
 * Initialize Redis client and session store
 */
function initializeRedisSessionStore() {
  try {
    // Create Redis client
    redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
      lazyConnect: true,
      keepAlive: 30000,
      family: 4, // Force IPv4
      db: 0, // Use database 0 for sessions
    });

    // Redis event handlers
    redisClient.on('connect', () => {
      logger.info('Redis connected for session store');
    });

    redisClient.on('ready', () => {
      logger.info('Redis ready for session operations');
    });

    redisClient.on('error', (err) => {
      logger.error('Redis session store error:', err);
    });

    redisClient.on('close', () => {
      logger.warn('Redis connection closed');
    });

    redisClient.on('reconnecting', () => {
      logger.info('Redis reconnecting...');
    });

    // Create session store
    sessionStore = new RedisStore({
      client: redisClient,
      prefix: 'pawfectmatch:sess:',
      ttl: 24 * 60 * 60, // 24 hours default TTL
      disableTouch: false, // Enable touch to extend session
      serializer: {
        stringify: JSON.stringify,
        parse: JSON.parse
      }
    });

    logger.info('Redis session store initialized successfully');
    return { redisClient, sessionStore };

  } catch (error) {
    logger.error('Failed to initialize Redis session store:', error);
    throw error;
  }
}

/**
 * Get session configuration
 */
function getSessionConfig() {
  if (!sessionStore) {
    throw new Error('Redis session store not initialized');
  }

  return {
    store: sessionStore,
    secret: process.env.SESSION_SECRET || process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    name: 'pawfectmatch.sid',
    cookie: {
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      httpOnly: true, // Prevent XSS attacks
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'strict' // CSRF protection
    },
    rolling: true, // Extend session on each request
    genid: () => {
      // Generate secure session IDs
      return require('crypto').randomBytes(32).toString('hex');
    }
  };
}

/**
 * Session middleware factory
 */
function createSessionMiddleware(options = {}) {
  const config = {
    ...getSessionConfig(),
    ...options
  };

  return session(config);
}

/**
 * Get session by ID
 */
async function getSession(sessionId) {
  try {
    if (!redisClient) {
      throw new Error('Redis client not initialized');
    }

    const sessionData = await redisClient.get(`pawfectmatch:sess:${sessionId}`);
    return sessionData ? JSON.parse(sessionData) : null;

  } catch (error) {
    logger.error('Error getting session:', error);
    return null;
  }
}

/**
 * Set session data
 */
async function setSession(sessionId, sessionData, ttl = 24 * 60 * 60) {
  try {
    if (!redisClient) {
      throw new Error('Redis client not initialized');
    }

    await redisClient.setex(
      `pawfectmatch:sess:${sessionId}`,
      ttl,
      JSON.stringify(sessionData)
    );

    return true;

  } catch (error) {
    logger.error('Error setting session:', error);
    return false;
  }
}

/**
 * Delete session
 */
async function deleteSession(sessionId) {
  try {
    if (!redisClient) {
      throw new Error('Redis client not initialized');
    }

    await redisClient.del(`pawfectmatch:sess:${sessionId}`);
    return true;

  } catch (error) {
    logger.error('Error deleting session:', error);
    return false;
  }
}

/**
 * Extend session TTL
 */
async function extendSession(sessionId, ttl = 24 * 60 * 60) {
  try {
    if (!redisClient) {
      throw new Error('Redis client not initialized');
    }

    await redisClient.expire(`pawfectmatch:sess:${sessionId}`, ttl);
    return true;

  } catch (error) {
    logger.error('Error extending session:', error);
    return false;
  }
}

/**
 * Get all active sessions for a user
 */
async function getUserSessions(userId) {
  try {
    if (!redisClient) {
      throw new Error('Redis client not initialized');
    }

    const keys = await redisClient.keys('pawfectmatch:sess:*');
    const sessions = [];

    for (const key of keys) {
      const sessionData = await redisClient.get(key);
      if (sessionData) {
        const parsed = JSON.parse(sessionData);
        if (parsed.userId === userId) {
          sessions.push({
            sessionId: key.replace('pawfectmatch:sess:', ''),
            data: parsed,
            ttl: await redisClient.ttl(key)
          });
        }
      }
    }

    return sessions;

  } catch (error) {
    logger.error('Error getting user sessions:', error);
    return [];
  }
}

/**
 * Invalidate all sessions for a user
 */
async function invalidateUserSessions(userId) {
  try {
    if (!redisClient) {
      throw new Error('Redis client not initialized');
    }

    const sessions = await getUserSessions(userId);
    const sessionIds = sessions.map(s => s.sessionId);

    if (sessionIds.length > 0) {
      await redisClient.del(...sessionIds.map(id => `pawfectmatch:sess:${id}`));
    }

    logger.info(`Invalidated ${sessionIds.length} sessions for user ${userId}`);
    return sessionIds.length;

  } catch (error) {
    logger.error('Error invalidating user sessions:', error);
    return 0;
  }
}

/**
 * Get session statistics
 */
async function getSessionStats() {
  try {
    if (!redisClient) {
      throw new Error('Redis client not initialized');
    }

    const keys = await redisClient.keys('pawfectmatch:sess:*');
    const totalSessions = keys.length;
    
    // Get memory usage
    const info = await redisClient.info('memory');
    const memoryMatch = info.match(/used_memory_human:(.+)/);
    const memoryUsage = memoryMatch ? memoryMatch[1].trim() : 'Unknown';

    // Get TTL distribution
    const ttlDistribution = {
      '0-1h': 0,
      '1-6h': 0,
      '6-12h': 0,
      '12-24h': 0,
      '24h+': 0
    };

    for (const key of keys.slice(0, 100)) { // Sample first 100 sessions
      const ttl = await redisClient.ttl(key);
      if (ttl <= 3600) ttlDistribution['0-1h']++;
      else if (ttl <= 21600) ttlDistribution['1-6h']++;
      else if (ttl <= 43200) ttlDistribution['6-12h']++;
      else if (ttl <= 86400) ttlDistribution['12-24h']++;
      else ttlDistribution['24h+']++;
    }

    return {
      totalSessions,
      memoryUsage,
      ttlDistribution,
      uptime: await redisClient.info('server').then(info => {
        const uptimeMatch = info.match(/uptime_in_seconds:(\d+)/);
        return uptimeMatch ? parseInt(uptimeMatch[1]) : 0;
      })
    };

  } catch (error) {
    logger.error('Error getting session stats:', error);
    return null;
  }
}

/**
 * Cleanup expired sessions
 */
async function cleanupExpiredSessions() {
  try {
    if (!redisClient) {
      throw new Error('Redis client not initialized');
    }

    // Redis automatically handles TTL expiration, but we can force cleanup
    const keys = await redisClient.keys('pawfectmatch:sess:*');
    let cleaned = 0;

    for (const key of keys) {
      const ttl = await redisClient.ttl(key);
      if (ttl === -1) { // No TTL set, remove it
        await redisClient.del(key);
        cleaned++;
      }
    }

    logger.info(`Cleaned up ${cleaned} sessions without TTL`);
    return cleaned;

  } catch (error) {
    logger.error('Error cleaning up sessions:', error);
    return 0;
  }
}

/**
 * Health check for Redis session store
 */
async function healthCheck() {
  try {
    if (!redisClient) {
      return { status: 'error', message: 'Redis client not initialized' };
    }

    // Test connection
    await redisClient.ping();
    
    // Test session operations
    const testKey = 'pawfectmatch:health:test';
    await redisClient.setex(testKey, 10, 'test');
    const testValue = await redisClient.get(testKey);
    await redisClient.del(testKey);

    if (testValue !== 'test') {
      return { status: 'error', message: 'Session operations failed' };
    }

    return { 
      status: 'healthy', 
      message: 'Redis session store is working properly',
      uptime: await redisClient.info('server').then(info => {
        const uptimeMatch = info.match(/uptime_in_seconds:(\d+)/);
        return uptimeMatch ? parseInt(uptimeMatch[1]) : 0;
      })
    };

  } catch (error) {
    logger.error('Redis session store health check failed:', error);
    return { 
      status: 'error', 
      message: error.message 
    };
  }
}

/**
 * Graceful shutdown
 */
async function shutdown() {
  try {
    if (redisClient) {
      await redisClient.quit();
      logger.info('Redis session store connection closed');
    }
  } catch (error) {
    logger.error('Error during Redis session store shutdown:', error);
  }
}

// Handle process termination
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

module.exports = {
  initializeRedisSessionStore,
  getSessionConfig,
  createSessionMiddleware,
  getSession,
  setSession,
  deleteSession,
  extendSession,
  getUserSessions,
  invalidateUserSessions,
  getSessionStats,
  cleanupExpiredSessions,
  healthCheck,
  shutdown,
  redisClient: () => redisClient,
  sessionStore: () => sessionStore
};
