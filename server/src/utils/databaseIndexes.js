/**
 * Database Indexes for Optimized Performance
 * Creates indexes for all frequently queried fields to eliminate N+1 queries
 */

const User = require('./models/User');
const Pet = require('./models/Pet');
const Match = require('./models/Match');
const Message = require('./models/Message');
const AuditLog = require('./models/AuditLog');
const logger = require('./utils/logger');

const createIndexes = async () => {
  try {
    logger.info('Creating database indexes...');

    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ role: 1 });
    await User.collection.createIndex({ status: 1 });
    await User.collection.createIndex({ isVerified: 1 });
    await User.collection.createIndex({ createdAt: -1 });
    await User.collection.createIndex({ 'firstName': 'text', 'lastName': 'text', 'email': 'text' });
    await User.collection.createIndex({ 'location.coordinates': '2dsphere' });

    // Pet indexes
    await Pet.collection.createIndex({ owner: 1 });
    await Pet.collection.createIndex({ species: 1 });
    await Pet.collection.createIndex({ createdAt: -1 });

    // Match indexes
    await Match.collection.createIndex({ user1: 1 });
    await Match.collection.createIndex({ user2: 1 });
    await Match.collection.createIndex({ pet1: 1 });
    await Match.collection.createIndex({ pet2: 1 });
    await Match.collection.createIndex({ status: 1 });
    await Match.collection.createIndex({ isBlocked: 1 });
    await Match.collection.createIndex({ createdAt: -1 });
    await Match.collection.createIndex({ user1: 1, user2: 1 });
    await Match.collection.createIndex({ pet1: 1, pet2: 1 });

    // Message indexes (critical for chat performance)
    await Message.collection.createIndex({ matchId: 1 });
    await Message.collection.createIndex({ sender: 1 });
    await Message.collection.createIndex({ receiver: 1 });
    await Message.collection.createIndex({ createdAt: -1 });
    await Message.collection.createIndex({ matchId: 1, createdAt: -1 });

    // AuditLog indexes
    await AuditLog.collection.createIndex({ adminId: 1 });
    await AuditLog.collection.createIndex({ userId: 1 });
    await AuditLog.collection.createIndex({ action: 1 });
    await AuditLog.collection.createIndex({ resourceType: 1 });
    await AuditLog.collection.createIndex({ createdAt: -1 });
    await AuditLog.collection.createIndex({ adminId: 1, createdAt: -1 });
    await AuditLog.collection.createIndex({ userId: 1, createdAt: -1 });

    // Compound indexes for complex queries
    await User.collection.createIndex({ role: 1, status: 1 });
    await User.collection.createIndex({ isVerified: 1, createdAt: -1 });
    await Match.collection.createIndex({ status: 1, createdAt: -1 });
    await Message.collection.createIndex({ matchId: 1, read: 1, createdAt: -1 });

    logger.info('Database indexes created successfully');
  } catch (error) {
    logger.error('Error creating database indexes:', error);
    throw error;
  }
};

const dropIndexes = async () => {
  try {
    logger.info('Dropping database indexes...');

    const collections = [User, Pet, Match, Message, AuditLog];

    for (const Model of collections) {
      const indexes = await Model.collection.indexes();
      for (const index of indexes) {
        if (index.name !== '_id_') { // Keep the default _id index
          await Model.collection.dropIndex(index.name);
        }
      }
    }

    logger.info('Database indexes dropped successfully');
  } catch (error) {
    logger.error('Error dropping database indexes:', error);
    throw error;
  }
};

const getIndexStats = async () => {
  try {
    const stats = {};

    const collections = [
      { model: User, name: 'users' },
      { model: Pet, name: 'pets' },
      { model: Match, name: 'matches' },
      { model: Message, name: 'messages' },
      { model: AuditLog, name: 'auditlogs' }
    ];

    for (const { model, name } of collections) {
      const indexes = await model.collection.indexes();
      stats[name] = indexes.length;
    }

    return stats;
  } catch (error) {
    logger.error('Error getting index stats:', error);
    throw error;
  }
};

module.exports = {
  createIndexes,
  dropIndexes,
  getIndexStats
};
