const mongoose = require('mongoose');
const Pet = require('../models/Pet');
const User = require('../models/User');
const Match = require('../models/Match');

async function ensureIndexes() {
  // Pet indexes for fast discovery
  await Pet.collection.createIndex({ location: '2dsphere' });
  await Pet.collection.createIndex({ breed: 1, age: 1 });
  await Pet.collection.createIndex({ 'preferences.activityLevel': 1 });
  await Pet.collection.createIndex({ createdAt: -1 });
  
  // User indexes
  await User.collection.createIndex({ email: 1 }, { unique: true });
  await User.collection.createIndex({ 'premium.tier': 1 });
  
  // Match indexes for chat
  await Match.collection.createIndex({ users: 1, status: 1 });
  await Match.collection.createIndex({ 'lastMessage.timestamp': -1 });
  
  console.log('✅ All database indexes created');
}

module.exports = ensureIndexes;
