/**
 * 📱 STORY MODEL
 * MongoDB schema for Instagram-style stories
 */

const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  emoji: {
    type: String,
    required: true,
    maxlength: 10
  },
  position: {
    x: { type: Number, default: 50 },
    y: { type: Number, default: 50 }
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const replySchema = new mongoose.Schema({
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

const stickerSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['emoji', 'text', 'image'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  },
  rotation: {
    type: Number,
    default: 0
  },
  scale: {
    type: Number,
    default: 1
  }
}, { _id: false });

const filterSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  intensity: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.5
  }
}, { _id: false });

const storySchema = new mongoose.Schema({
  petId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    required: true
  },
  type: {
    type: String,
    enum: ['photo', 'video'],
    required: true
  },
  mediaUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String
  },
  caption: {
    type: String,
    maxlength: 500,
    default: ''
  },
  stickers: [stickerSchema],
  filters: [filterSchema],
  duration: {
    type: Number, // in seconds, for videos
    min: 1,
    max: 60
  },
  views: {
    type: Number,
    default: 0
  },
  viewedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  reactions: [reactionSchema],
  replies: [replySchema],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true,
    default: function() {
      return new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
storySchema.index({ petId: 1, createdAt: -1 });
storySchema.index({ expiresAt: 1 });
storySchema.index({ createdAt: -1 });
storySchema.index({ 'reactions.userId': 1 });
storySchema.index({ 'replies.userId': 1 });

// Virtual for reaction count
storySchema.virtual('reactionCount').get(function() {
  return this.reactions.length;
});

// Virtual for reply count
storySchema.virtual('replyCount').get(function() {
  return this.replies.length;
});

// Virtual for view count
storySchema.virtual('viewCount').get(function() {
  return this.viewedBy.length;
});

// Virtual for checking if story is expired
storySchema.virtual('isExpired').get(function() {
  return this.expiresAt < new Date();
});

// Pre-save middleware to handle expiration
storySchema.pre('save', function(next) {
  // If expiresAt is not set, set it to 24 hours from now
  if (!this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  }
  next();
});

// Static method to get active stories for a pet
storySchema.statics.getActiveStories = function(petId) {
  return this.find({
    petId,
    isActive: true,
    expiresAt: { $gt: new Date() }
  }).sort({ createdAt: -1 });
};

// Static method to get stories for user's feed
storySchema.statics.getFeedStories = function(matchedPetIds, limit = 20, skip = 0) {
  return this.find({
    petId: { $in: matchedPetIds },
    isActive: true,
    expiresAt: { $gt: new Date() }
  })
  .populate('petId', 'name avatar breed')
  .sort({ createdAt: -1 })
  .limit(limit)
  .skip(skip);
};

// Instance method to add a reaction
storySchema.methods.addReaction = function(userId, emoji, position = { x: 50, y: 50 }) {
  // Remove existing reaction from this user
  this.reactions = this.reactions.filter(
    reaction => reaction.userId.toString() !== userId.toString()
  );
  
  // Add new reaction
  this.reactions.push({
    userId,
    emoji,
    position,
    timestamp: new Date()
  });
  
  return this.save();
};

// Instance method to add a reply
storySchema.methods.addReply = function(userId, message) {
  this.replies.push({
    userId,
    message,
    timestamp: new Date()
  });
  
  return this.save();
};

// Instance method to mark as viewed
storySchema.methods.markAsViewed = function(userId) {
  if (!this.viewedBy.includes(userId)) {
    this.viewedBy.push(userId);
    this.views += 1;
    return this.save();
  }
  return Promise.resolve(this);
};

// Instance method to check if user has viewed
storySchema.methods.hasViewed = function(userId) {
  return this.viewedBy.some(id => id.toString() === userId.toString());
};

// Instance method to check if user has reacted
storySchema.methods.hasReacted = function(userId) {
  return this.reactions.some(reaction => 
    reaction.userId.toString() === userId.toString()
  );
};

// Instance method to get user's reaction
storySchema.methods.getUserReaction = function(userId) {
  return this.reactions.find(reaction => 
    reaction.userId.toString() === userId.toString()
  );
};

// Instance method to delete story and clean up media
storySchema.methods.deleteWithMedia = async function() {
  const fs = require('fs').promises;
  const path = require('path');
  
  // Delete media file if it exists
  if (this.mediaUrl) {
    try {
      const filePath = path.join(__dirname, '../../uploads/stories', path.basename(this.mediaUrl));
      await fs.unlink(filePath);
    } catch (error) {
      console.warn('Could not delete media file:', error.message);
    }
  }
  
  // Delete thumbnail if it exists
  if (this.thumbnailUrl) {
    try {
      const thumbnailPath = path.join(__dirname, '../../uploads/stories', path.basename(this.thumbnailUrl));
      await fs.unlink(thumbnailPath);
    } catch (error) {
      console.warn('Could not delete thumbnail file:', error.message);
    }
  }
  
  // Delete from database
  return this.deleteOne();
};

// TTL index for automatic cleanup of expired stories
storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Story', storySchema);
