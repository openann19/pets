/**
 * Enhanced Auth Routes with Social Login Support
 * Handles Google, Apple, and other OAuth providers
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { logger } = require('../utils/logger');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Social login rate limiting (more lenient)
const socialLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: 'Too many social login attempts, please try again later.',
});

/**
 * Social Login Endpoint
 * Handles Google, Apple, and other OAuth providers
 */
router.post('/social-login', socialLimiter, [
  body('provider').isIn(['google', 'apple', 'facebook', 'twitter']).withMessage('Invalid provider'),
  body('providerId').notEmpty().withMessage('Provider ID is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('name').notEmpty().withMessage('Name is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { provider, providerId, email, name, image, socialAccessToken } = req.body;

    logger.info('Social login attempt', { provider, email });

    // Check if user exists with this email
    let user = await User.findOne({ email });

    if (user) {
      // User exists, check if they have this social provider linked
      const existingProvider = user.socialProviders?.find(p => p.provider === provider);
      
      if (existingProvider) {
        // Update provider info
        existingProvider.providerId = providerId;
        existingProvider.accessToken = socialAccessToken;
        existingProvider.lastLogin = new Date();
      } else {
        // Add new provider
        if (!user.socialProviders) user.socialProviders = [];
        user.socialProviders.push({
          provider,
          providerId,
          accessToken: socialAccessToken,
          lastLogin: new Date()
        });
      }

      user.lastActive = new Date();
      await user.save();
    } else {
      // Create new user
      const nameParts = name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      user = new User({
        email,
        firstName,
        lastName,
        profilePicture: image,
        isEmailVerified: true, // Social logins are pre-verified
        socialProviders: [{
          provider,
          providerId,
          accessToken: socialAccessToken,
          lastLogin: new Date()
        }],
        lastActive: new Date(),
        onboardingCompleted: false, // Will need to complete pet profile setup
      });

      await user.save();
      logger.info('New user created via social login', { userId: user._id, provider });
    }

    // Generate JWT tokens
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data (excluding sensitive info)
    const userResponse = {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profilePicture: user.profilePicture,
      isEmailVerified: user.isEmailVerified,
      premium: user.premium,
      onboardingCompleted: user.onboardingCompleted,
      createdAt: user.createdAt,
      lastActive: user.lastActive,
    };

    res.json({
      success: true,
      message: 'Social login successful',
      data: {
        user: userResponse,
        accessToken: socialAccessToken,
        refreshToken,
        isNewUser: !user.onboardingCompleted
      }
    });

  } catch (error) {
    logger.error('Social login error', error);
    res.status(500).json({
      success: false,
      message: 'Social login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * Link Social Provider to Existing Account
 */
router.post('/link-social', authLimiter, [
  body('provider').isIn(['google', 'apple', 'facebook', 'twitter']).withMessage('Invalid provider'),
  body('providerId').notEmpty().withMessage('Provider ID is required'),
  body('socialAccessToken').notEmpty().withMessage('Social access token is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { provider, providerId, socialAccessToken } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if provider is already linked
    const existingProvider = user.socialProviders?.find(p => p.provider === provider);
    if (existingProvider) {
      return res.status(400).json({
        success: false,
        message: `${provider} account is already linked`
      });
    }

    // Add new provider
    if (!user.socialProviders) user.socialProviders = [];
    user.socialProviders.push({
      provider,
      providerId,
      accessToken: socialAccessToken,
      linkedAt: new Date()
    });

    await user.save();

    res.json({
      success: true,
      message: `${provider} account linked successfully`,
      data: {
        linkedProviders: user.socialProviders.map(p => p.provider)
      }
    });

  } catch (error) {
    logger.error('Link social provider error', error);
    res.status(500).json({
      success: false,
      message: 'Failed to link social provider',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * Unlink Social Provider
 */
router.delete('/unlink-social/:provider', authLimiter, async (req, res) => {
  try {
    const { provider } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has password (can't unlink if it's the only auth method)
    const hasPassword = user.password;
    const socialProviders = user.socialProviders || [];
    
    if (!hasPassword && socialProviders.length <= 1) {
      return res.status(400).json({
        success: false,
        message: 'Cannot unlink the only authentication method. Please set a password first.'
      });
    }

    // Remove provider
    user.socialProviders = socialProviders.filter(p => p.provider !== provider);
    await user.save();

    res.json({
      success: true,
      message: `${provider} account unlinked successfully`,
      data: {
        linkedProviders: user.socialProviders.map(p => p.provider)
      }
    });

  } catch (error) {
    logger.error('Unlink social provider error', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unlink social provider',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * Get Linked Social Providers
 */
router.get('/social-providers', async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const user = await User.findById(userId).select('socialProviders');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const linkedProviders = (user.socialProviders || []).map(p => ({
      provider: p.provider,
      linkedAt: p.linkedAt,
      lastLogin: p.lastLogin
    }));

    res.json({
      success: true,
      data: {
        linkedProviders,
        hasPassword: !!user.password
      }
    });

  } catch (error) {
    logger.error('Get social providers error', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get social providers',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;