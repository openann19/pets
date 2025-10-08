/**
 * 📰 FEED API ROUTES
 * Instagram-style feed posts and interactions
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const { authenticateToken, requirePremiumFeature } = require('../middleware/auth');
const Post = require('../models/Post');
const Pet = require('../models/Pet');
const User = require('../models/User');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/posts');
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
    cb(null, `post-${uniqueSuffix}${extension}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
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
 * GET /api/feed
 * Get posts for the user's feed
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, type, sentiment } = req.query;
    const skip = (page - 1) * limit;

    // Get user's matched pets
    const user = await User.findById(req.user.id).populate('matches');
    const matchedPetIds = user.matches.map(match => match.petId);

    let query = {
      petId: { $in: matchedPetIds },
      isActive: true
    };

    // Filter by type if specified
    if (type && ['photo', 'video', 'carousel'].includes(type)) {
      query.type = type;
    }

    // Filter by sentiment if specified
    if (sentiment && ['happy', 'training', 'adventure', 'relaxed', 'playful'].includes(sentiment)) {
      query.sentiment = sentiment;
    }

    const posts = await Post.find(query)
      .populate('petId', 'name avatar breed')
      .populate('likes.userId', 'name avatar')
      .populate('comments.userId', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Add user-specific data (liked, bookmarked, etc.)
    const enrichedPosts = posts.map(post => {
      const postObj = post.toObject();
      postObj.isLiked = post.likes.some(like => 
        like.userId._id.toString() === req.user.id
      );
      postObj.isBookmarked = post.bookmarks.includes(req.user.id);
      postObj.likeCount = post.likes.length;
      postObj.commentCount = post.comments.length;
      return postObj;
    });

    res.json({
      success: true,
      posts: enrichedPosts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: await Post.countDocuments(query)
      }
    });
  } catch (error) {
    console.error('Error fetching feed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feed',
      error: error.message
    });
  }
});

/**
 * POST /api/feed
 * Create a new post
 */
router.post('/', authenticateToken, upload.array('media', 10), async (req, res) => {
  try {
    const { petId, caption, tags, sentiment, type } = req.body;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one media file is required'
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

    // Parse tags if provided
    let parsedTags = [];
    try {
      if (tags) {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      }
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tags format'
      });
    }

    // Determine post type based on media count
    const postType = req.files.length > 1 ? 'carousel' : (type || (req.files[0].mimetype.startsWith('video/') ? 'video' : 'photo'));

    // Create media items
    const mediaItems = req.files.map(file => ({
      id: uuidv4(),
      type: file.mimetype.startsWith('video/') ? 'video' : 'photo',
      url: `/uploads/posts/${file.filename}`,
      thumbnail: file.mimetype.startsWith('video/') ? `/uploads/posts/thumb_${file.filename}` : undefined
    }));

    const post = new Post({
      petId,
      type: postType,
      media: mediaItems,
      caption: caption || '',
      tags: parsedTags,
      sentiment: sentiment || 'happy',
      likes: [],
      comments: [],
      shares: 0,
      bookmarks: [],
      isActive: true
    });

    await post.save();

    // Populate pet info for response
    await post.populate('petId', 'name avatar breed');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create post',
      error: error.message
    });
  }
});

/**
 * GET /api/feed/:id
 * Get a specific post
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('petId', 'name avatar breed')
      .populate('likes.userId', 'name avatar')
      .populate('comments.userId', 'name avatar');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Add user-specific data
    const postObj = post.toObject();
    postObj.isLiked = post.likes.some(like => 
      like.userId._id.toString() === req.user.id
    );
    postObj.isBookmarked = post.bookmarks.includes(req.user.id);

    res.json({
      success: true,
      post: postObj
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch post',
      error: error.message
    });
  }
});

/**
 * POST /api/feed/:id/like
 * Like or unlike a post
 */
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const existingLike = post.likes.find(like => 
      like.userId.toString() === req.user.id
    );

    if (existingLike) {
      // Unlike
      post.likes = post.likes.filter(like => 
        like.userId.toString() !== req.user.id
      );
    } else {
      // Like
      post.likes.push({
        userId: req.user.id,
        timestamp: new Date()
      });
    }

    await post.save();

    res.json({
      success: true,
      message: existingLike ? 'Post unliked' : 'Post liked',
      likeCount: post.likes.length,
      isLiked: !existingLike
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle like',
      error: error.message
    });
  }
});

/**
 * POST /api/feed/:id/comment
 * Add a comment to a post
 */
router.post('/:id/comment', authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment message is required'
      });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const comment = {
      userId: req.user.id,
      message: message.trim(),
      timestamp: new Date()
    };

    post.comments.push(comment);
    await post.save();

    // Populate user info for response
    await post.populate('comments.userId', 'name avatar');

    res.json({
      success: true,
      message: 'Comment added successfully',
      comment: post.comments[post.comments.length - 1],
      commentCount: post.comments.length
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      error: error.message
    });
  }
});

/**
 * POST /api/feed/:id/share
 * Share a post
 */
router.post('/:id/share', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    post.shares += 1;
    await post.save();

    res.json({
      success: true,
      message: 'Post shared successfully',
      shareCount: post.shares
    });
  } catch (error) {
    console.error('Error sharing post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to share post',
      error: error.message
    });
  }
});

/**
 * POST /api/feed/:id/bookmark
 * Bookmark or unbookmark a post
 */
router.post('/:id/bookmark', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const isBookmarked = post.bookmarks.includes(req.user.id);

    if (isBookmarked) {
      // Unbookmark
      post.bookmarks = post.bookmarks.filter(id => 
        id.toString() !== req.user.id
      );
    } else {
      // Bookmark
      post.bookmarks.push(req.user.id);
    }

    await post.save();

    res.json({
      success: true,
      message: isBookmarked ? 'Post unbookmarked' : 'Post bookmarked',
      isBookmarked: !isBookmarked
    });
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle bookmark',
      error: error.message
    });
  }
});

/**
 * DELETE /api/feed/:id
 * Delete a post (only by owner)
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('petId');
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user owns the pet
    if (post.petId.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    // Delete media files
    for (const media of post.media) {
      try {
        const filePath = path.join(__dirname, '../../', media.url);
        await fs.unlink(filePath);
        
        if (media.thumbnail) {
          const thumbnailPath = path.join(__dirname, '../../', media.thumbnail);
          await fs.unlink(thumbnailPath);
        }
      } catch (fileError) {
        console.warn('Could not delete media file:', fileError.message);
      }
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete post',
      error: error.message
    });
  }
});

/**
 * GET /api/feed/pet/:petId
 * Get posts for a specific pet
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
        message: 'Not authorized to view this pet\'s posts'
      });
    }

    const posts = await Post.find({ petId, isActive: true })
      .populate('petId', 'name avatar breed')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: await Post.countDocuments({ petId, isActive: true })
      }
    });
  } catch (error) {
    console.error('Error fetching pet posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pet posts',
      error: error.message
    });
  }
});

module.exports = router;
