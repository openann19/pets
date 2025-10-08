/**
 * Email Digest API Routes
 * Handles email digest management and testing
 */

const express = require('express');
const rateLimit = require('express-rate-limit');
const emailDigestService = require('../services/email-digest');
const { logger } = require('../utils/logger');
const User = require('../models/User');

const router = express.Router();

// Rate limiting for email digest endpoints
const digestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many email digest requests, please try again later.',
});

/**
 * Send test daily digest email
 */
router.post('/test', digestLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    await emailDigestService.sendTestEmail(email);

    res.json({
      success: true,
      message: 'Test email sent successfully'
    });

  } catch (error) {
    logger.error('Test email send failed', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * Trigger daily digest for all users (admin only)
 */
router.post('/trigger', digestLimiter, async (req, res) => {
  try {
    // Check if user is admin (you might want to add proper admin authentication)
    const isAdmin = req.headers['x-admin-key'] === process.env.ADMIN_KEY;
    
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Trigger daily digest
    await emailDigestService.sendDailyDigests();

    res.json({
      success: true,
      message: 'Daily digest triggered successfully'
    });

  } catch (error) {
    logger.error('Daily digest trigger failed', error);
    res.status(500).json({
      success: false,
      message: 'Failed to trigger daily digest',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * Get email digest status
 */
router.get('/status', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        isRunning: emailDigestService.isRunning,
        lastRun: emailDigestService.lastRun || null,
        nextRun: emailDigestService.nextRun || null
      }
    });
  } catch (error) {
    logger.error('Failed to get email digest status', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * Update user's email digest preferences
 */
router.put('/preferences', async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { emailDigestEnabled, emailFrequency } = req.body;

    const updateData = {};
    if (typeof emailDigestEnabled === 'boolean') {
      updateData.emailDigestEnabled = emailDigestEnabled;
    }
    if (emailFrequency && ['daily', 'weekly', 'never'].includes(emailFrequency)) {
      updateData.emailFrequency = emailFrequency;
    }

    await User.findByIdAndUpdate(userId, updateData);

    res.json({
      success: true,
      message: 'Email digest preferences updated successfully'
    });

  } catch (error) {
    logger.error('Failed to update email digest preferences', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * Get user's email digest preferences
 */
router.get('/preferences', async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const user = await User.findById(userId).select('emailDigestEnabled emailFrequency lastDigestSent');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        emailDigestEnabled: user.emailDigestEnabled !== false, // Default to true
        emailFrequency: user.emailFrequency || 'daily',
        lastDigestSent: user.lastDigestSent || null
      }
    });

  } catch (error) {
    logger.error('Failed to get email digest preferences', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get preferences',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * Unsubscribe from email digest
 */
router.post('/unsubscribe', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Unsubscribe token is required'
      });
    }

    // In a real implementation, you would decode the token to get the user ID
    // For now, we'll use a simple approach
    const userId = token; // This should be properly decoded from JWT

    await User.findByIdAndUpdate(userId, {
      emailDigestEnabled: false,
      unsubscribedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Successfully unsubscribed from email digest'
    });

  } catch (error) {
    logger.error('Failed to unsubscribe from email digest', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unsubscribe',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
