const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Pet = require('../models/Pet');
const Match = require('../models/Match');
const Message = require('../models/Message');
const logger = require('../utils/logger');
const { deleteFromCloudinary } = require('../services/cloudinaryService');

const router = express.Router();

/**
 * GDPR Compliance Routes
 * Handles data export and deletion requests
 */

/**
 * POST /api/gdpr/export
 * Export all user data in GDPR-compliant format
 */
router.post('/export', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    
    // Get user data
    const user = await User.findById(userId).select('-hashedPassword');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's pets
    const pets = await Pet.find({ owner: userId });
    
    // Get user's matches
    const matches = await Match.find({ 
      $or: [{ user1: userId }, { user2: userId }] 
    }).populate('user1 user2', 'name email');
    
    // Get user's messages
    const messages = await Message.find({ 
      $or: [{ senderId: userId }, { recipientId: userId }] 
    });

    // Compile GDPR-compliant data export
    const dataExport = {
      exportDate: new Date().toISOString(),
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        location: user.location,
        bio: user.bio,
        interests: user.interests,
        preferences: user.preferences,
        subscription: user.subscription,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastActive: user.lastActive
      },
      pets: pets.map(pet => ({
        id: pet._id,
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        age: pet.age,
        gender: pet.gender,
        size: pet.size,
        description: pet.description,
        photos: pet.photos,
        location: pet.location,
        personality: pet.personality,
        medicalHistory: pet.medicalHistory,
        careInstructions: pet.careInstructions,
        createdAt: pet.createdAt,
        updatedAt: pet.updatedAt
      })),
      matches: matches.map(match => ({
        id: match._id,
        users: match.users,
        pets: match.pets,
        status: match.status,
        createdAt: match.createdAt,
        lastMessageAt: match.lastMessageAt
      })),
      messages: messages.map(message => ({
        id: message._id,
        matchId: message.matchId,
        senderId: message.senderId,
        recipientId: message.recipientId,
        content: message.content,
        type: message.type,
        timestamp: message.timestamp,
        read: message.read
      })),
      metadata: {
        totalPets: pets.length,
        totalMatches: matches.length,
        totalMessages: messages.length,
        exportFormat: 'GDPR JSON',
        version: '1.0'
      }
    };

    // Log data export request
    logger.info('GDPR data export requested', {
      userId,
      exportDate: dataExport.exportDate,
      dataSize: JSON.stringify(dataExport).length
    });

    res.json({
      success: true,
      message: 'Data export completed successfully',
      data: dataExport
    });

  } catch (error) {
    logger.error('GDPR data export failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export user data'
    });
  }
});

/**
 * POST /api/gdpr/delete
 * Delete all user data (Right to be forgotten)
 */
router.post('/delete', authenticateToken, [
  body('confirmation')
    .equals('DELETE_MY_DATA')
    .withMessage('Confirmation text must be exactly "DELETE_MY_DATA"'),
  body('reason')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Reason must be less than 500 characters')
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

    const userId = req.userId;
    const { reason } = req.body;

    // Get user data for logging
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete user's pets and their images
    const pets = await Pet.find({ owner: userId });
    for (const pet of pets) {
      // Delete pet photos from Cloudinary
      for (const photo of pet.photos) {
        if (photo.publicId) {
          try {
            await deleteFromCloudinary(photo.publicId);
          } catch (error) {
            logger.warn('Failed to delete pet photo from Cloudinary:', error);
          }
        }
      }
    }
    await Pet.deleteMany({ owner: userId });

    // Delete user's avatar
    if (user.avatarPublicId) {
      try {
        await deleteFromCloudinary(user.avatarPublicId);
      } catch (error) {
        logger.warn('Failed to delete user avatar from Cloudinary:', error);
      }
    }

    // Delete user's matches
    await Match.deleteMany({ 
      $or: [{ user1: userId }, { user2: userId }] 
    });

    // Delete user's messages
    await Message.deleteMany({ 
      $or: [{ senderId: userId }, { recipientId: userId }] 
    });

    // Delete user account
    await User.findByIdAndDelete(userId);

    // Log data deletion
    logger.info('GDPR data deletion completed', {
      userId,
      userEmail: user.email,
      reason: reason || 'No reason provided',
      deletedPets: pets.length,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'All user data has been permanently deleted',
      deletedData: {
        user: true,
        pets: pets.length,
        matches: 'all',
        messages: 'all'
      }
    });

  } catch (error) {
    logger.error('GDPR data deletion failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user data'
    });
  }
});

/**
 * GET /api/gdpr/status
 * Get GDPR compliance status for user
 */
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Count user's data
    const petsCount = await Pet.countDocuments({ owner: userId });
    const matchesCount = await Match.countDocuments({ 
      $or: [{ user1: userId }, { user2: userId }] 
    });
    const messagesCount = await Message.countDocuments({ 
      $or: [{ senderId: userId }, { recipientId: userId }] 
    });

    const gdprStatus = {
      userId,
      dataSummary: {
        profile: {
          hasData: true,
          lastUpdated: user.updatedAt
        },
        pets: {
          count: petsCount,
          lastUpdated: petsCount > 0 ? await Pet.findOne({ owner: userId }).sort({ updatedAt: -1 }).then(p => p?.updatedAt) : null
        },
        matches: {
          count: matchesCount,
          lastUpdated: matchesCount > 0 ? await Match.findOne({ 
            $or: [{ user1: userId }, { user2: userId }] 
          }).sort({ updatedAt: -1 }).then(m => m?.updatedAt) : null
        },
        messages: {
          count: messagesCount,
          lastUpdated: messagesCount > 0 ? await Message.findOne({ 
            $or: [{ senderId: userId }, { recipientId: userId }] 
          }).sort({ timestamp: -1 }).then(m => m?.timestamp) : null
        }
      },
      rights: {
        export: true,
        delete: true,
        rectification: true,
        portability: true
      },
      privacySettings: {
        dataProcessing: user.privacySettings?.dataProcessing || true,
        marketing: user.privacySettings?.marketing || false,
        analytics: user.privacySettings?.analytics || true
      }
    };

    res.json({
      success: true,
      data: gdprStatus
    });

  } catch (error) {
    logger.error('GDPR status check failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get GDPR status'
    });
  }
});

/**
 * PUT /api/gdpr/privacy-settings
 * Update user privacy settings
 */
router.put('/privacy-settings', authenticateToken, [
  body('dataProcessing')
    .optional()
    .isBoolean()
    .withMessage('Data processing consent must be boolean'),
  body('marketing')
    .optional()
    .isBoolean()
    .withMessage('Marketing consent must be boolean'),
  body('analytics')
    .optional()
    .isBoolean()
    .withMessage('Analytics consent must be boolean')
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

    const userId = req.userId;
    const { dataProcessing, marketing, analytics } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update privacy settings
    user.privacySettings = {
      ...user.privacySettings,
      dataProcessing: dataProcessing !== undefined ? dataProcessing : user.privacySettings?.dataProcessing,
      marketing: marketing !== undefined ? marketing : user.privacySettings?.marketing,
      analytics: analytics !== undefined ? analytics : user.privacySettings?.analytics,
      updatedAt: new Date()
    };

    await user.save();

    logger.info('Privacy settings updated', {
      userId,
      settings: user.privacySettings
    });

    res.json({
      success: true,
      message: 'Privacy settings updated successfully',
      data: {
        privacySettings: user.privacySettings
      }
    });

  } catch (error) {
    logger.error('Privacy settings update failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update privacy settings'
    });
  }
});

module.exports = router;
