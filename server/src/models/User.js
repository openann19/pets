const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Info
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  
  // Profile
  avatar: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  phone: {
    type: String,
    match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
  },
  
  // Location
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: 'US' }
    }
  },
  
  // Preferences
  preferences: {
    maxDistance: { type: Number, default: 50 }, // km
    ageRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 20 }
    },
    species: [{ type: String, enum: ['dog', 'cat', 'bird', 'rabbit', 'other'] }],
    intents: [{ type: String, enum: ['adoption', 'mating', 'playdate'] }],
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      matches: { type: Boolean, default: true },
      messages: { type: Boolean, default: true }
    }
  },
  
  // Premium Features
  premium: {
    isActive: { type: Boolean, default: false },
    plan: { type: String, enum: ['basic', 'premium', 'gold'], default: 'basic' },
    expiresAt: Date,
    stripeSubscriptionId: String,
    features: {
      unlimitedLikes: { type: Boolean, default: false },
      boostProfile: { type: Boolean, default: false },
      seeWhoLiked: { type: Boolean, default: false },
      advancedFilters: { type: Boolean, default: false }
    }
  },
  
  // Activity
  pets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet'
  }],
  
  swipedPets: [{
    petId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pet',
      required: true
    },
    action: {
      type: String,
      enum: ['like', 'pass', 'superlike'],
      required: true
    },
    swipedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  matches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match'
  }],
  
  // Analytics
  analytics: {
    totalSwipes: { type: Number, default: 0 },
    totalLikes: { type: Number, default: 0 },
    totalMatches: { type: Number, default: 0 },
    profileViews: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now }
  },
  
  // Account Status
  isEmailVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  isBlocked: { type: Boolean, default: false },
  
  // Security
  refreshTokens: [String],
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailVerificationToken: String,
  emailVerificationExpires: Date
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
userSchema.index({ location: '2dsphere' });
userSchema.index({ email: 1 });
userSchema.index({ 'analytics.lastActive': -1 });
userSchema.index({ 'premium.isActive': 1, 'premium.expiresAt': 1 });

// Virtual for age
userSchema.virtual('age').get(function() {
  return Math.floor((new Date() - this.dateOfBirth) / (365.25 * 24 * 60 * 60 * 1000));
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update lastActive on any update
userSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.analytics.lastActive = new Date();
  }
  next();
});

// Instance methods
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.refreshTokens;
  delete user.passwordResetToken;
  delete user.passwordResetExpires;
  delete user.emailVerificationToken;
  delete user.emailVerificationExpires;
  return user;
};

// Static methods
userSchema.statics.findActiveUsers = function() {
  return this.find({ isActive: true, isBlocked: false });
};

userSchema.statics.findPremiumUsers = function() {
  return this.find({ 
    'premium.isActive': true,
    'premium.expiresAt': { $gt: new Date() }
  });
};

module.exports = mongoose.model('User', userSchema);