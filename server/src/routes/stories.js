/**
 * 📱 STORIES API ROUTES
 * Instagram-style stories CRUD operations with media upload
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const { authenticateToken, requirePremiumFeature } = require('../middleware/auth');
const Story = require('../models/Story');
const Pet = require('../models/Pet');
const User = require('../models/User');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/stories');
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `story-${uniqueSuffix}${extension}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'));
    }
  }
});

/**
 * GET /api/stories
 * Get stories for the user's feed
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, petId } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    
    // If specific pet requested, get stories from that pet
    if (petId) {
      query.petId = petId;
    } else {
      // Get stories from matched pets
      const user = await User.findById(req.user.id).populate('matches');
      const matchedPetIds = user.matches.map(match => match.petId);
      query.petId = { $in: matchedPetIds };
    }

    // Only get stories from the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    query.createdAt = { $gte: oneDayAgo };

    const stories = await Story.find(query)
      .populate('petId', 'name avatar breed')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Mark stories as viewed for the current user
    const storyIds = stories.map(story => story._id);
    await Story.updateMany(
      { _id: { $in: storyIds } },
      { $addToSet: { viewedBy: req.user.id } }
    );

    res.json({
      success: true,
      stories,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: await Story.countDocuments(query)
      }
    });
  } catch (error) {
    console.error('Error fetching stories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stories',
      error: error.message
    });
  }
});

/**
 * POST /api/stories
 * Create a new story
 */
router.post('/', authenticateToken, upload.single('media'), async (req, res) => {
  try {
    const { petId, caption, stickers, filters, type, duration } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Media file is required'
      });
    }

    // Verify pet belongs to user
    const pet = await Pet.findOne({ _id: petId, ownerId: req.user.id });
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found or not owned by user'
      });
    }

    // Parse stickers and filters if provided
    let parsedStickers = [];
    let parsedFilters = [];
    
    try {
      if (stickers) {
        parsedStickers = typeof stickers === 'string' ? JSON.parse(stickers) : stickers;
      }
      if (filters) {
        parsedFilters = typeof filters === 'string' ? JSON.parse(filters) : filters;
      }
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid stickers or filters format'
      });
    }

    const story = new Story({
      petId,
      type: type || (req.file.mimetype.startsWith('video/') ? 'video' : 'photo'),
      mediaUrl: `/uploads/stories/${req.file.filename}`,
      caption: caption || '',
      stickers: parsedStickers,
      filters: parsedFilters,
      duration: duration ? parseInt(duration) : undefined,
      views: 0,
      reactions: [],
      replies: [],
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });

    await story.save();

    // Populate pet info for response
    await story.populate('petId', 'name avatar breed');

    res.status(201).json({
      success: true,
      message: 'Story created successfully',
      story
    });
  } catch (error) {
    console.error('Error creating story:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create story',
      error: error.message
    });
  }
});

/**
 * GET /api/stories/:id
 * Get a specific story
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id)
      .populate('petId', 'name avatar breed')
      .populate('replies.userId', 'name avatar');

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

    // Check if story has expired
    if (story.expiresAt < new Date()) {
      return res.status(410).json({
        success: false,
        message: 'Story has expired'
      });
    }

    // Mark as viewed
    await Story.findByIdAndUpdate(req.params.id, {
      $addToSet: { viewedBy: req.user.id },
      $inc: { views: 1 }
    });

    res.json({
      success: true,
      story
    });
  } catch (error) {
    console.error('Error fetching story:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch story',
      error: error.message
    });
  }
});

/**
 * POST /api/stories/:id/reactions
 * Add a reaction to a story
 */
router.post('/:id/reactions', authenticateToken, async (req, res) => {
  try {
    const { emoji, position } = req.body;
    
    if (!emoji) {
      return res.status(400).json({
        success: false,
        message: 'Emoji is required'
      });
    }

    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

    // Check if user already reacted
    const existingReaction = story.reactions.find(
      reaction => reaction.userId.toString() === req.user.id
    );

    if (existingReaction) {
      // Update existing reaction
      existingReaction.emoji = emoji;
      existingReaction.position = position || { x: 50, y: 50 };
      existingReaction.timestamp = new Date();
    } else {
      // Add new reaction
      story.reactions.push({
        userId: req.user.id,
        emoji,
        position: position || { x: 50, y: 50 },
        timestamp: new Date()
      });
    }

    await story.save();

    res.json({
      success: true,
      message: 'Reaction added successfully',
      reactions: story.reactions
    });
  } catch (error) {
    console.error('Error adding reaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add reaction',
      error: error.message
    });
  }
});

/**
 * POST /api/stories/:id/replies
 * Add a reply to a story
 */
router.post('/:id/replies', authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

    const reply = {
      userId: req.user.id,
      message: message.trim(),
      timestamp: new Date()
    };

    story.replies.push(reply);
    await story.save();

    // Populate user info for response
    await story.populate('replies.userId', 'name avatar');

    res.json({
      success: true,
      message: 'Reply added successfully',
      reply: story.replies[story.replies.length - 1]
    });
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add reply',
      error: error.message
    });
  }
});

/**
 * DELETE /api/stories/:id
 * Delete a story (only by owner)
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id).populate('petId');
    
    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

    // Check if user owns the pet
    if (story.petId.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this story'
      });
    }

    // Delete media file
    if (story.mediaUrl) {
      const filePath = path.join(__dirname, '../../', story.mediaUrl);
      try {
        await fs.unlink(filePath);
      } catch (fileError) {
        console.warn('Could not delete media file:', fileError.message);
      }
    }

    await Story.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Story deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting story:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete story',
      error: error.message
    });
  }
});

/**
 * GET /api/stories/pet/:petId
 * Get stories for a specific pet
 */
router.get('/pet/:petId', authenticateToken, async (req, res) => {
  try {
    const { petId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Verify pet exists and user has access
    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    // Check if user owns the pet or is matched with it
    const user = await User.findById(req.user.id).populate('matches');
    const isOwner = pet.ownerId.toString() === req.user.id;
    const isMatched = user.matches.some(match => match.petId.toString() === petId);

    if (!isOwner && !isMatched) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this pet\'s stories'
      });
    }

    const stories = await Story.find({ petId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      stories,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: await Story.countDocuments({ petId })
      }
    });
  } catch (error) {
    console.error('Error fetching pet stories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pet stories',
      error: error.message
    });
  }
});

/**
 * POST /api/stories/cleanup
 * Clean up expired stories (admin only)
 */
router.post('/cleanup', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.user.id);
    if (!user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const expiredStories = await Story.find({
      expiresAt: { $lt: new Date() }
    });

    let deletedCount = 0;
    for (const story of expiredStories) {
      // Delete media file
      if (story.mediaUrl) {
        const filePath = path.join(__dirname, '../../', story.mediaUrl);
        try {
          await fs.unlink(filePath);
        } catch (fileError) {
          console.warn('Could not delete media file:', fileError.message);
        }
      }
      deletedCount++;
    }

    // Delete expired stories from database
    const result = await Story.deleteMany({
      expiresAt: { $lt: new Date() }
    });

    res.json({
      success: true,
      message: 'Cleanup completed',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error during cleanup:', error);
    res.status(500).json({
      success: false,
      message: 'Cleanup failed',
      error: error.message
    });
  }
});

module.exports = router;
