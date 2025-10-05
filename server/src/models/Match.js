const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  // Match Participants
  pet1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    required: [true, 'First pet is required']
  },
  pet2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    required: [true, 'Second pet is required']
  },
  user1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'First user is required']
  },
  user2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Second user is required']
  },
  
  // Match Details
  matchType: {
    type: String,
    enum: ['adoption', 'mating', 'playdate', 'general'],
    required: [true, 'Match type is required']
  },
  compatibilityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  aiRecommendationReason: {
    type: String,
    maxlength: [500, 'AI reason cannot exceed 500 characters']
  },
  
  // Match Status
  status: {
    type: String,
    enum: ['active', 'archived', 'blocked', 'deleted', 'completed'],
    default: 'active'
  },
  
  // Communication
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'location', 'system'],
      default: 'text'
    },
    attachments: [{
      type: String, // URL to attachment
      fileType: String,
      fileName: String
    }],
    readBy: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      readAt: {
        type: Date,
        default: Date.now
      }
    }],
    sentAt: {
      type: Date,
      default: Date.now
    },
    editedAt: Date,
    isEdited: {
      type: Boolean,
      default: false
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  }],
  
  // Meeting Planning
  meetings: [{
    proposedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true,
      maxlength: [100, 'Meeting title cannot exceed 100 characters']
    },
    description: {
      type: String,
      maxlength: [500, 'Meeting description cannot exceed 500 characters']
    },
    proposedDate: {
      type: Date,
      required: true
    },
    location: {
      name: String,
      address: String,
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere'
      }
    },
    status: {
      type: String,
      enum: ['proposed', 'accepted', 'declined', 'completed', 'cancelled'],
      default: 'proposed'
    },
    responses: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      response: {
        type: String,
        enum: ['accepted', 'declined', 'maybe']
      },
      respondedAt: {
        type: Date,
        default: Date.now
      },
      note: String
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Activity Tracking
  lastActivity: {
    type: Date,
    default: Date.now
  },
  lastMessageAt: Date,
  messageCount: {
    type: Number,
    default: 0
  },
  
  // User Actions
  userActions: {
    user1: {
      isArchived: { type: Boolean, default: false },
      isBlocked: { type: Boolean, default: false },
      isFavorite: { type: Boolean, default: false },
      muteNotifications: { type: Boolean, default: false },
      lastSeen: Date
    },
    user2: {
      isArchived: { type: Boolean, default: false },
      isBlocked: { type: Boolean, default: false },
      isFavorite: { type: Boolean, default: false },
      muteNotifications: { type: Boolean, default: false },
      lastSeen: Date
    }
  },
  
  // Outcome Tracking (for analytics)
  outcome: {
    result: {
      type: String,
      enum: ['pending', 'met', 'adopted', 'mated', 'no-show', 'incompatible']
    },
    completedAt: Date,
    rating: {
      user1Rating: { type: Number, min: 1, max: 5 },
      user2Rating: { type: Number, min: 1, max: 5 }
    },
    feedback: {
      user1Feedback: String,
      user2Feedback: String
    }
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
matchSchema.index({ user1: 1, user2: 1 }); // User pair lookup
matchSchema.index({ pet1: 1, pet2: 1 }, { unique: true }); // Unique pet match
matchSchema.index({ status: 1 }); // Status filtering
matchSchema.index({ lastActivity: -1 }); // Recent activity
matchSchema.index({ matchType: 1 }); // Type filtering
matchSchema.index({ compatibilityScore: -1 }); // Sorting by score
matchSchema.index({ 'messages.sender': 1, 'messages.sentAt': -1 }); // Message queries

// Compound index for active matches query
matchSchema.index({ 
  status: 1, 
  lastActivity: -1 
}, { name: 'active_matches_index' });

// Virtual for getting the other user
matchSchema.virtual('getOtherUser').get(function() {
  return function(currentUserId) {
    return this.user1.toString() === currentUserId.toString() ? this.user2 : this.user1;
  };
});

// Virtual for getting the other pet
matchSchema.virtual('getOtherPet').get(function() {
  return function(currentUserId) {
    return this.user1.toString() === currentUserId.toString() ? this.pet2 : this.pet1;
  };
});

// Virtual for unread message count
matchSchema.virtual('getUnreadCount').get(function() {
  return function(userId) {
    return this.messages.filter(message => 
      message.sender.toString() !== userId.toString() &&
      !message.readBy.some(read => read.user.toString() === userId.toString())
    ).length;
  };
});

// Pre-save middleware
matchSchema.pre('save', function(next) {
  // Ensure userActions are properly initialized (preserve existing values)
  if (!this.userActions) {
    this.userActions = {};
  }
  if (!this.userActions.user1) {
    this.userActions.user1 = {};
  }
  if (!this.userActions.user2) {
    this.userActions.user2 = {};
  }
  
  // Set defaults only for missing properties (preserve existing values)
  ['isArchived', 'isBlocked', 'isFavorite', 'muteNotifications'].forEach(prop => {
    if (this.userActions.user1[prop] === undefined) {
      this.userActions.user1[prop] = false;
    }
    if (this.userActions.user2[prop] === undefined) {
      this.userActions.user2[prop] = false;
    }
  });
  
  // Update message count
  this.messageCount = this.messages.length;
  
  // Update last message timestamp
  if (this.messages.length > 0) {
    this.lastMessageAt = this.messages[this.messages.length - 1].sentAt;
  }
  
  // Update last activity
  if (this.isModified() && !this.isNew) {
    this.lastActivity = new Date();
  }
  
  next();
});

// Instance methods
matchSchema.methods.addMessage = function(senderId, content, messageType = 'text', attachments = []) {
  const message = {
    sender: senderId,
    content,
    messageType,
    attachments,
    sentAt: new Date()
  };
  
  this.messages.push(message);
  this.lastActivity = new Date();
  this.lastMessageAt = new Date();
  
  return this.save();
};

matchSchema.methods.markMessagesAsRead = function(userId) {
  const unreadMessages = this.messages.filter(message => 
    message.sender.toString() !== userId.toString() &&
    !message.readBy.some(read => read.user.toString() === userId.toString())
  );
  
  unreadMessages.forEach(message => {
    message.readBy.push({
      user: userId,
      readAt: new Date()
    });
  });
  
  // Update user's last seen
  const userKey = this.user1.toString() === userId.toString() ? 'user1' : 'user2';
  this.userActions[userKey].lastSeen = new Date();
  
  return this.save();
};

matchSchema.methods.isUserBlocked = function(userId) {
  const userKey = this.user1.toString() === userId.toString() ? 'user1' : 'user2';
  const otherUserKey = userKey === 'user1' ? 'user2' : 'user1';
  
  return this.userActions[userKey].isBlocked || this.userActions[otherUserKey].isBlocked;
};

matchSchema.methods.toggleArchive = function(userId) {
  const userKey = this.user1.toString() === userId.toString() ? 'user1' : 'user2';
  const currentArchived = this.userActions[userKey]?.isArchived || false;
  const newArchived = !currentArchived;
  
  // Use direct MongoDB update for reliable persistence
  return this.constructor.updateOne(
    { _id: this._id },
    { 
      $set: {
        [`userActions.${userKey}.isArchived`]: newArchived,
        [`userActions.${userKey}.lastSeen`]: new Date()
      }
    }
  ).then(() => {
    // Update the in-memory document for consistency
    this.userActions[userKey] = this.userActions[userKey] || {};
    this.userActions[userKey].isArchived = newArchived;
    return this;
  });
};

matchSchema.methods.toggleFavorite = function(userId) {
  const userKey = this.user1.toString() === userId.toString() ? 'user1' : 'user2';
  const currentFavorite = this.userActions[userKey]?.isFavorite || false;
  const newFavorite = !currentFavorite;
  
  // Use direct MongoDB update for reliable persistence
  return this.constructor.updateOne(
    { _id: this._id },
    { 
      $set: {
        [`userActions.${userKey}.isFavorite`]: newFavorite,
        [`userActions.${userKey}.lastSeen`]: new Date()
      }
    }
  ).then(() => {
    // Update the in-memory document for consistency
    this.userActions[userKey] = this.userActions[userKey] || {};
    this.userActions[userKey].isFavorite = newFavorite;
    return this;
  });
};

// Static methods
matchSchema.statics.findActiveMatchesForUser = function(userId) {
  return this.find({
    $or: [{ user1: userId }, { user2: userId }],
    status: 'active',
    $or: [
      { 'userActions.user1.isArchived': false, user1: userId },
      { 'userActions.user2.isArchived': false, user2: userId }
    ]
  }).populate('pet1 pet2 user1 user2', '-password -refreshTokens');
};

matchSchema.statics.findByPets = function(pet1Id, pet2Id) {
  return this.findOne({
    $or: [
      { pet1: pet1Id, pet2: pet2Id },
      { pet1: pet2Id, pet2: pet1Id }
    ]
  });
};

module.exports = mongoose.model('Match', matchSchema);