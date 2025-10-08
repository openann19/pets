/**
 * 📰 POST MODEL
 * MongoDB schema for Instagram-style feed posts
 */

const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['photo', 'video'],
    required: true
  },
  url: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String
  },
  duration: {
    type: Number // in seconds, for videos
  }
}, { _id: false });

const likeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const commentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const postSchema = new mongoose.Schema({
  petId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    required: true
  },
  type: {
    type: String,
    enum: ['photo', 'video', 'carousel'],
    required: true
  },
  media: [mediaSchema],
  caption: {
    type: String,
    maxlength: 2000,
    default: ''
  },
  tags: [{
    type: String,
    maxlength: 50
  }],
  sentiment: {
    type: String,
    enum: ['happy', 'training', 'adventure', 'relaxed', 'playful'],
    default: 'happy'
  },
  location: {
    type: String,
    maxlength: 100
  },
  likes: [likeSchema],
  comments: [commentSchema],
  shares: {
    type: Number,
    default: 0
  },
  bookmarks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
postSchema.index({ petId: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ 'likes.userId': 1 });
postSchema.index({ 'comments.userId': 1 });
postSchema.index({ bookmarks: 1 });
postSchema.index({ sentiment: 1 });
postSchema.index({ tags: 1 });
postSchema.index({ isActive: 1, createdAt: -1 });

// Virtual for like count
postSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count
postSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Virtual for bookmark count
postSchema.virtual('bookmarkCount').get(function() {
  return this.bookmarks.length;
});

// Static method to get posts for user's feed
postSchema.statics.getFeedPosts = function(matchedPetIds, limit = 10, skip = 0, filters = {}) {
  let query = {
    petId: { $in: matchedPetIds },
    isActive: true,
    ...filters
  };

  return this.find(query)
    .populate('petId', 'name avatar breed')
    .populate('likes.userId', 'name avatar')
    .populate('comments.userId', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to get posts by pet
postSchema.statics.getPostsByPet = function(petId, limit = 10, skip = 0) {
  return this.find({ petId, isActive: true })
    .populate('petId', 'name avatar breed')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to get trending posts
postSchema.statics.getTrendingPosts = function(limit = 10) {
  return this.find({ isActive: true })
    .populate('petId', 'name avatar breed')
    .sort({ 
      likes: -1, 
      comments: -1, 
      shares: -1,
      createdAt: -1 
    })
    .limit(limit);
};

// Instance method to add a like
postSchema.methods.addLike = function(userId) {
  const existingLike = this.likes.find(like => 
    like.userId.toString() === userId.toString()
  );

  if (existingLike) {
    // Unlike
    this.likes = this.likes.filter(like => 
      like.userId.toString() !== userId.toString()
    );
    return this.save().then(() => false); // Return false for unliked
  } else {
    // Like
    this.likes.push({
      userId,
      timestamp: new Date()
    });
    return this.save().then(() => true); // Return true for liked
  }
};

// Instance method to add a comment
postSchema.methods.addComment = function(userId, message) {
  this.comments.push({
    userId,
    message,
    timestamp: new Date()
  });
  
  return this.save();
};

// Instance method to add a bookmark
postSchema.methods.addBookmark = function(userId) {
  const isBookmarked = this.bookmarks.includes(userId);

  if (isBookmarked) {
    // Unbookmark
    this.bookmarks = this.bookmarks.filter(id => 
      id.toString() !== userId.toString()
    );
    return this.save().then(() => false); // Return false for unbookmarked
  } else {
    // Bookmark
    this.bookmarks.push(userId);
    return this.save().then(() => true); // Return true for bookmarked
  }
};

// Instance method to check if user has liked
postSchema.methods.hasLiked = function(userId) {
  return this.likes.some(like => 
    like.userId.toString() === userId.toString()
  );
};

// Instance method to check if user has bookmarked
postSchema.methods.hasBookmarked = function(userId) {
  return this.bookmarks.some(id => 
    id.toString() === userId.toString()
  );
};

// Instance method to increment shares
postSchema.methods.incrementShares = function() {
  this.shares += 1;
  return this.save();
};

// Instance method to delete post and clean up media
postSchema.methods.deleteWithMedia = async function() {
  const fs = require('fs').promises;
  const path = require('path');
  
  // Delete media files
  for (const media of this.media) {
    try {
      const filePath = path.join(__dirname, '../../uploads/posts', path.basename(media.url));
      await fs.unlink(filePath);
      
      if (media.thumbnail) {
        const thumbnailPath = path.join(__dirname, '../../uploads/posts', path.basename(media.thumbnail));
        await fs.unlink(thumbnailPath);
      }
    } catch (error) {
      console.warn('Could not delete media file:', error.message);
    }
  }
  
  // Delete from database
  return this.deleteOne();
};

// Pre-save middleware to validate media
postSchema.pre('save', function(next) {
  // Validate media array
  if (!this.media || this.media.length === 0) {
    return next(new Error('At least one media item is required'));
  }

  // Validate post type matches media
  if (this.type === 'photo' && this.media.some(m => m.type !== 'photo')) {
    return next(new Error('Photo posts can only contain photos'));
  }

  if (this.type === 'video' && this.media.some(m => m.type !== 'video')) {
    return next(new Error('Video posts can only contain videos'));
  }

  // Validate carousel has multiple media
  if (this.type === 'carousel' && this.media.length < 2) {
    return next(new Error('Carousel posts must have at least 2 media items'));
  }

  next();
});

// Text search index for captions and tags
postSchema.index({
  caption: 'text',
  tags: 'text'
});

module.exports = mongoose.model('Post', postSchema);
