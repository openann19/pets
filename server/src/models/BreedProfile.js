const mongoose = require('mongoose');

const temperamentEnum = [
  'affectionate', 'aggressive', 'alert', 'aloof', 'anxious', 'apathetic', 'assertive', 'attached', 'attentive',
  'bold', 'bossy', 'calm', 'cheerful', 'chill', 'clingy', 'confident', 'courageous', 'cuddly', 'curious',
  'dependent', 'dependent', 'destructive', 'detached', 'determined', 'devoted', 'dignified', 'docile', 'dominant',
  'eager', 'easygoing', 'energetic', 'enthusiastic', 'excitable', 'exuberant', 'faithful', 'fearful', 'fierce',
  'finicky', 'friendly', 'frisky', 'gentle', 'good-natured', 'goofy', 'grumpy', 'happy', 'hardworking', 'high-spirited',
  'hyper', 'hypoallergenic', 'impulsive', 'independent', 'intelligent', 'intense', 'intrepid', 'inventive', 'irrepressible',
  'jaunty', 'jolly', 'joyful', 'jumpy', 'laid-back', 'lively', 'loving', 'loyal', 'meek', 'merry', 'mischievous',
  'moody', 'motivated', 'nervous', 'nimble', 'obedience', 'obedient', 'observant', 'obstinate', 'outgoing', 'patient',
  'perceptive', 'persistent', 'personable', 'playful', 'placid', 'pleasant', 'poised', 'polite', 'proud', 'protective',
  'pugnacious', 'purposeful', 'quiet', 'receptive', 'reflective', 'reliable', 'reserved', 'resilient', 'resourceful',
  'responsive', 'restless', 'rugged', 'sagacious', 'salty', 'sassy', 'sedate', 'self-assured', 'self-confident',
  'sensitive', 'sensible', 'serious', 'shy', 'silly', 'smart', 'sociable', 'spunky', 'staid', 'stoic', 'strenuous',
  'strong-willed', 'studious', 'submissive', 'suave', 'suspicious', 'sweet', 'tactful', 'tenacious', 'tense', 'territorial',
  'testy', 'timid', 'tolerant', 'touchy', 'tough', 'tractable', 'trainable', 'tranquil', 'trusting', 'unflappable',
  'unpredictable', 'unruly', 'versatile', 'vigilant', 'vigorous', 'vocal', 'watchful', 'well-mannered', 'willing', 'wiry',
  'witty', 'worrisome', 'zany', 'zealous'
];

const breedProfileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  species: {
    type: String,
    required: true,
    enum: ['dog', 'cat', 'bird', 'rabbit', 'other']
  },
  alternateNames: [String],
  
  // Physical Characteristics
  size: {
    type: String,
    required: true,
    enum: ['tiny', 'small', 'medium', 'small-medium', 'large', 'extra-large', 'giant']
  },
  weightRange: {
    min: Number,
    max: Number
  },
  lifeSpan: {
    min: Number,
    max: Number
  },
  coatTypes: [{
    type: String,
    enum: ['short', 'medium', 'long', 'double', 'wire', 'curly', 'smooth']
  }],
  colors: [String],
  
  // Temperament & Characteristics
  temperament: [{
    type: String,
    enum: temperamentEnum,
    required: true
  }],
  energyLevel: {
    type: String,
    enum: ['low', 'moderate', 'high', 'very-high'],
    required: true
  },
  exerciseNeeds: {
    type: String,
    enum: ['minimal', 'moderate', 'high', 'extensive'],
    required: true
  },
  groomingNeeds: {
    type: String,
    enum: ['minimal', 'moderate', 'high', 'extensive', 'specialized'],
    required: true
  },
  
  // Compatibility
  familyFriendly: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor']
  },
  kidFriendly: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor', 'acceptable']
  },
  petFriendly: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor', 'accepting']
  },
  strangerFriendly: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor', 'reserved', 'suspicious']
  },
  
  // Living Requirements
  apartmentFriendly: Boolean,
  yardRequired: Boolean,
  climateSensitivity: [String],
  
  // Health
  healthConcerns: [String],
  geneticConditionRisk: {
    type: String,
    enum: ['low', 'moderate', 'high']
  },
  
  // Training
  trainability: {
    type: String,
    enum: ['easy', 'moderate', 'difficult', 'stubborn', 'good', 'excellent']
  },
  barkingTendency: {
    type: String,
    enum: ['quiet', 'moderate', 'vocal', 'very-vocal', 'low', 'high', 'minimal']
  },
  
  // Compatibility Matrix with other breeds (0.0 to 1.0)
  breedCompatibility: Map,
  
  // Popularity metrics
  popularity: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  
  // AI Enhancement flags
  aiEnhanced: {
    type: Boolean,
    default: false
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
breedProfileSchema.index({ name: 1, species: 1 });
breedProfileSchema.index({ species: 1, size: 1 });
breedProfileSchema.index({ temperament: 1 });
breedProfileSchema.index({ energyLevel: 1 });
breedProfileSchema.index({ popularity: -1 });

// Virtual for compatibility score with another breed
breedProfileSchema.methods.getCompatibilityScore = function(otherBreedId) {
  if (!this.breedCompatibility) return 0.5;
  return this.breedCompatibility.get(otherBreedId.toString()) || 0.5;
};

// Static methods
breedProfileSchema.statics.findSimilarBreeds = function(breedName, limit = 10) {
  return this.find({
    name: { $ne: breedName },
    $or: [
      { temperament: { $in: this.temperament } },
      { energyLevel: this.energyLevel },
      { size: this.size },
      { exerciseNeeds: this.exerciseNeeds }
    ]
  }).limit(limit).sort({ popularity: -1 });
};

breedProfileSchema.statics.findByFilters = function(filters) {
  const query = {};
  
  if (filters.species) query.species = filters.species;
  if (filters.size) query.size = filters.size;
  if (filters.energyLevel) query.energyLevel = filters.energyLevel;
  if (filters.exerciseNeeds) query.exerciseNeeds = filters.exerciseNeeds;
  if (filters.familyFriendly) query.familyFriendly = filters.familyFriendly;
  if (filters.apartmentFriendly !== undefined) query.apartmentFriendly = filters.apartmentFriendly;
  if (filters.temperament && filters.temperament.length > 0) {
    query.temperament = { $in: filters.temperament };
  }
  
  return this.find(query).sort({ popularity: -1 });
};

module.exports = mongoose.model('BreedProfile', breedProfileSchema);
