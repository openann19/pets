const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  match: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'system'],
    default: 'text'
  },
  mediaUrl: {
    type: String,
    default: null
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },
  reactions: [{
    type: {
      type: String,
      enum: ['like', 'love', 'laugh', 'wow', 'sad', 'angry'],
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  deletedFor: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Index for efficient querying
messageSchema.index({ match: 1, createdAt: -1 });
messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ isRead: 1 });

// Virtual for checking if message is deleted for a user
messageSchema.virtual('isDeleted').get(function() {
  return this.deletedFor && this.deletedFor.length > 0;
});

// Method to mark message as read
messageSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Method to add reaction
messageSchema.methods.addReaction = function(reactionType, userId) {
  // Remove existing reaction from this user
  this.reactions = this.reactions.filter(r => !r.user.equals(userId));
  
  // Add new reaction
  this.reactions.push({
    type: reactionType,
    user: userId
  });
  
  return this.save();
};

// Method to remove reaction
messageSchema.methods.removeReaction = function(userId) {
  this.reactions = this.reactions.filter(r => !r.user.equals(userId));
  return this.save();
};

// Static method to get unread message count for a user
messageSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({
    receiver: userId,
    isRead: false,
    deletedFor: { $ne: userId }
  });
};

// Static method to get conversation between two users in a match
messageSchema.statics.getConversation = function(matchId, userId, limit = 50, before = null) {
  const query = {
    match: matchId,
    deletedFor: { $ne: userId }
  };
  
  if (before) {
    query.createdAt = { $lt: before };
  }
  
  return this.find(query)
    .populate('sender', 'name profilePicture')
    .populate('reactions.user', 'name profilePicture')
    .sort({ createdAt: -1 })
    .limit(limit)
    .exec();
};

// Pre-save middleware to validate sender and receiver are in the same match
messageSchema.pre('save', async function(next) {
  if (this.isModified('sender') || this.isModified('receiver') || this.isModified('match')) {
    const Match = mongoose.model('Match');
    const match = await Match.findById(this.match);
    
    if (!match) {
      return next(new Error('Match not found'));
    }
    
    const isSenderInMatch = match.users.some(userId => userId.equals(this.sender));
    const isReceiverInMatch = match.users.some(userId => userId.equals(this.receiver));
    
    if (!isSenderInMatch || !isReceiverInMatch) {
      return next(new Error('Sender or receiver not in match'));
    }
  }
  
  next();
});

module.exports = mongoose.model('Message', messageSchema);
