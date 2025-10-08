const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');

// Validate JWT secrets are properly configured
const validateJWTSecrets = () => {
  const accessSecret = process.env.JWT_SECRET;
  const refreshSecret = process.env.JWT_REFRESH_SECRET;
  
  if (!accessSecret || !refreshSecret) {
    throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be configured');
  }
  
  if (accessSecret === refreshSecret) {
    console.warn('⚠️  SECURITY WARNING: JWT_SECRET and JWT_REFRESH_SECRET are identical. This defeats split-secret defense.');
  }
  
  if (accessSecret.length < 64 || refreshSecret.length < 64) {
    console.warn('⚠️  SECURITY WARNING: JWT secrets should be at least 64 characters long for production use.');
  }
  
  return { accessSecret, refreshSecret };
};

// Generate JWT tokens with proper security
const generateTokens = (userId) => {
  const { accessSecret, refreshSecret } = validateJWTSecrets();
  
  // Generate unique JTI (JWT ID) for refresh token rotation
  const jti = crypto.randomBytes(32).toString('hex');
  
  const accessToken = jwt.sign(
    { userId },
    accessSecret,
    { 
      expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m',
      issuer: 'pawfectmatch-api',
      audience: 'pawfectmatch-client'
    }
  );
  
  const refreshToken = jwt.sign(
    { userId },
    refreshSecret,
    { 
      expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d',
      issuer: 'pawfectmatch-api',
      audience: 'pawfectmatch-client',
      jwtid: jti
    }
  );
  
  return { accessToken, refreshToken, jti };
};

// Redis cache for user authentication (5 minute TTL)
let redisClient = null;
try {
  const redis = require('redis');
  redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });
  redisClient.on('error', (err) => {
    console.warn('Redis connection error (auth caching disabled):', err.message);
    redisClient = null;
  });
} catch (error) {
  console.warn('Redis not available (auth caching disabled):', error.message);
}

// Middleware to authenticate JWT tokens with Redis caching
const authenticateToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }
    
    // Verify token
    const { accessSecret } = validateJWTSecrets();
    const decoded = jwt.verify(token, accessSecret, {
      issuer: 'pawfectmatch-api',
      audience: 'pawfectmatch-client'
    });
    
    // Try to get user from Redis cache first
    let user = null;
    const cacheKey = `auth:user:${decoded.userId}`;
    
    if (redisClient) {
      try {
        const cachedUser = await redisClient.get(cacheKey);
        if (cachedUser) {
          user = JSON.parse(cachedUser);
        }
      } catch (cacheError) {
        console.warn('Redis cache read error:', cacheError.message);
      }
    }
    
    // If not in cache, get from database
    if (!user) {
      user = await User.findById(decoded.userId).select('-password -refreshTokens');
      
      // Cache user for 5 minutes if Redis is available
      if (user && redisClient) {
        try {
          await redisClient.setEx(cacheKey, 300, JSON.stringify(user)); // 5 minutes TTL
        } catch (cacheError) {
          console.warn('Redis cache write error:', cacheError.message);
        }
      }
    }
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive'
      });
    }
    
    if (user.isBlocked) {
      return res.status(401).json({
        success: false,
        message: 'Account is blocked'
      });
    }
    
    // Add user to request object
    req.user = user;
    req.userId = user._id;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Middleware to check if user is premium
const requirePremium = (req, res, next) => {
  if (!req.user.premium?.isActive || 
      (req.user.premium.expiresAt && req.user.premium.expiresAt < new Date())) {
    return res.status(403).json({
      success: false,
      message: 'Premium subscription required',
      code: 'PREMIUM_REQUIRED'
    });
  }
  next();
};

// Middleware to check specific premium features with null safety
const requirePremiumFeature = (feature) => {
  return (req, res, next) => {
    // Null-safe checks for premium features
    if (!req.user.premium?.isActive || 
        !req.user.premium?.features?.[feature]) {
      return res.status(403).json({
        success: false,
        message: `Premium feature '${feature}' required`,
        code: 'PREMIUM_FEATURE_REQUIRED',
        requiredFeature: feature
      });
    }
    next();
  };
};

// Middleware for admin-only routes
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

// Refresh token middleware with proper security
const refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }
    
    // Verify refresh token with proper secret validation
    const { refreshSecret } = validateJWTSecrets();
    const decoded = jwt.verify(refreshToken, refreshSecret, {
      issuer: 'pawfectmatch-api',
      audience: 'pawfectmatch-client'
    });
    
    // Get user and check if refresh token exists (using JTI for better security)
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if refresh token exists in user's token list
    const tokenIndex = user.refreshTokens.findIndex(token => {
      try {
        const tokenDecoded = jwt.decode(token);
        return tokenDecoded.jti === decoded.jti;
      } catch {
        return false;
      }
    });
    
    if (tokenIndex === -1) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }
    
    // Generate new tokens with new JTI
    const tokens = generateTokens(user._id);
    
    // Remove old refresh token and add new one (limit to 5 tokens max)
    user.refreshTokens.splice(tokenIndex, 1);
    user.refreshTokens.push(tokens.refreshToken);
    
    // Limit refresh token array to prevent unbounded growth
    if (user.refreshTokens.length > 5) {
      user.refreshTokens = user.refreshTokens.slice(-5); // Keep only last 5 tokens
    }
    
    await user.save();
    
    // Clear user cache on token refresh
    if (redisClient) {
      try {
        await redisClient.del(`auth:user:${user._id}`);
      } catch (cacheError) {
        console.warn('Redis cache clear error:', cacheError.message);
      }
    }
    
    res.json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: user.toJSON()
      }
    });
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }
    
    console.error('Refresh token error:', error);
    return res.status(500).json({
      success: false,
      message: 'Token refresh failed'
    });
  }
};

// Rate limiting for refresh token endpoint
const createRefreshTokenRateLimit = () => {
  const rateLimitMap = new Map();
  const WINDOW_MS = 60 * 1000; // 1 minute
  const MAX_ATTEMPTS = 20; // 20 attempts per minute
  
  return (req, res, next) => {
    const clientId = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!rateLimitMap.has(clientId)) {
      rateLimitMap.set(clientId, { count: 1, resetTime: now + WINDOW_MS });
      return next();
    }
    
    const clientData = rateLimitMap.get(clientId);
    
    if (now > clientData.resetTime) {
      // Reset window
      clientData.count = 1;
      clientData.resetTime = now + WINDOW_MS;
      return next();
    }
    
    if (clientData.count >= MAX_ATTEMPTS) {
      return res.status(429).json({
        success: false,
        message: 'Too many refresh token attempts. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
      });
    }
    
    clientData.count++;
    next();
  };
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;
    
    if (token) {
      const { accessSecret } = validateJWTSecrets();
      const decoded = jwt.verify(token, accessSecret, {
        issuer: 'pawfectmatch-api',
        audience: 'pawfectmatch-client'
      });
      
      // Try cache first, then database
      let user = null;
      const cacheKey = `auth:user:${decoded.userId}`;
      
      if (redisClient) {
        try {
          const cachedUser = await redisClient.get(cacheKey);
          if (cachedUser) {
            user = JSON.parse(cachedUser);
          }
        } catch (cacheError) {
          console.warn('Redis cache read error in optionalAuth:', cacheError.message);
        }
      }
      
      if (!user) {
        user = await User.findById(decoded.userId).select('-password -refreshTokens');
        
        // Cache user for 5 minutes if Redis is available
        if (user && redisClient) {
          try {
            await redisClient.setEx(cacheKey, 300, JSON.stringify(user));
          } catch (cacheError) {
            console.warn('Redis cache write error in optionalAuth:', cacheError.message);
          }
        }
      }
      
      if (user && user.isActive && !user.isBlocked) {
        req.user = user;
        req.userId = user._id;
      }
    }
    
    next();
  } catch (error) {
    // Silently continue without authentication
    next();
  }
};

module.exports = {
  generateTokens,
  authenticateToken,
  requirePremium,
  requirePremiumFeature,
  requireAdmin,
  refreshAccessToken,
  optionalAuth,
  createRefreshTokenRateLimit,
  validateJWTSecrets
};