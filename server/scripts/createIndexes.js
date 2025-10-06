/**
 * Database Indexes Setup Script
 * Ensures optimal performance with proper database indexes
 */

const mongoose = require('mongoose');
const logger = require('./src/utils/logger');

const createIndexes = async () => {
  try {
    logger.info('🔍 Creating database indexes for optimal performance...');

    const db = mongoose.connection.db;

    // User collection indexes
    await db.collection('users').createIndexes([
      { key: { email: 1 }, unique: true, name: 'email_unique' },
      { key: { 'location.coordinates': '2dsphere' }, name: 'location_2dsphere' },
      { key: { createdAt: -1 }, name: 'created_desc' },
      { key: { isPremium: 1 }, name: 'premium_status' },
      { key: { lastActive: -1 }, name: 'last_active_desc' },
    ]);

    // Pet collection indexes
    await db.collection('pets').createIndexes([
      { key: { 'location.coordinates': '2dsphere' }, name: 'location_2dsphere' },
      { key: { species: 1, breed: 1 }, name: 'species_breed' },
      { key: { age: 1 }, name: 'age_asc' },
      { key: { gender: 1 }, name: 'gender' },
      { key: { size: 1 }, name: 'size' },
      { key: { ownerId: 1 }, name: 'owner_id' },
      { key: { createdAt: -1 }, name: 'created_desc' },
      { key: { availableForAdoption: 1 }, name: 'adoption_status' },
      { key: { personality: 1 }, name: 'personality' },
      { key: { species: 1, age: 1, gender: 1 }, name: 'species_age_gender' },
    ]);

    // Match collection indexes
    await db.collection('matches').createIndexes([
      { key: { users: 1 }, name: 'users' },
      { key: { pets: 1 }, name: 'pets' },
      { key: { createdAt: -1 }, name: 'created_desc' },
      { key: { status: 1 }, name: 'status' },
      { key: { users: 1, status: 1 }, name: 'users_status' },
      { key: { 'users.0': 1, 'users.1': 1 }, unique: true, name: 'unique_match' },
    ]);

    // Message collection indexes
    await db.collection('messages').createIndexes([
      { key: { matchId: 1, createdAt: -1 }, name: 'match_timestamp' },
      { key: { senderId: 1 }, name: 'sender_id' },
      { key: { createdAt: -1 }, name: 'created_desc' },
      { key: { read: 1 }, name: 'read_status' },
      { key: { matchId: 1, read: 1 }, name: 'match_read_status' },
    ]);

    // Swipe collection indexes
    await db.collection('swipes').createIndexes([
      { key: { userId: 1, petId: 1 }, unique: true, name: 'user_pet_unique' },
      { key: { userId: 1, createdAt: -1 }, name: 'user_timestamp' },
      { key: { petId: 1 }, name: 'pet_id' },
      { key: { action: 1 }, name: 'action' },
      { key: { createdAt: -1 }, name: 'created_desc' },
    ]);

    // Subscription collection indexes
    await db.collection('subscriptions').createIndexes([
      { key: { userId: 1 }, unique: true, name: 'user_unique' },
      { key: { stripeCustomerId: 1 }, unique: true, name: 'stripe_customer_unique' },
      { key: { stripeSubscriptionId: 1 }, unique: true, name: 'stripe_subscription_unique' },
      { key: { status: 1 }, name: 'status' },
      { key: { plan: 1 }, name: 'plan' },
      { key: { currentPeriodEnd: 1 }, name: 'period_end' },
    ]);

    // Chat conversation indexes
    await db.collection('conversations').createIndexes([
      { key: { participants: 1 }, name: 'participants' },
      { key: { matchId: 1 }, unique: true, name: 'match_unique' },
      { key: { lastMessageAt: -1 }, name: 'last_message_desc' },
      { key: { createdAt: -1 }, name: 'created_desc' },
    ]);

    // Notification collection indexes
    await db.collection('notifications').createIndexes([
      { key: { userId: 1, createdAt: -1 }, name: 'user_timestamp' },
      { key: { userId: 1, read: 1 }, name: 'user_read_status' },
      { key: { type: 1 }, name: 'type' },
      { key: { createdAt: -1 }, name: 'created_desc' },
    ]);

    // Report collection indexes
    await db.collection('reports').createIndexes([
      { key: { reportedUserId: 1 }, name: 'reported_user' },
      { key: { reportedPetId: 1 }, name: 'reported_pet' },
      { key: { reporterId: 1 }, name: 'reporter_id' },
      { key: { status: 1 }, name: 'status' },
      { key: { createdAt: -1 }, name: 'created_desc' },
    ]);

    // Analytics collection indexes
    await db.collection('analytics').createIndexes([
      { key: { event: 1, timestamp: -1 }, name: 'event_timestamp' },
      { key: { userId: 1, timestamp: -1 }, name: 'user_timestamp' },
      { key: { sessionId: 1 }, name: 'session_id' },
      { key: { timestamp: -1 }, name: 'timestamp_desc' },
    ]);

    // Admin logs indexes
    await db.collection('adminlogs').createIndexes([
      { key: { adminId: 1, timestamp: -1 }, name: 'admin_timestamp' },
      { key: { action: 1 }, name: 'action' },
      { key: { targetType: 1 }, name: 'target_type' },
      { key: { timestamp: -1 }, name: 'timestamp_desc' },
    ]);

    logger.info('✅ All database indexes created successfully');
    
    // Log index statistics
    const collections = await db.listCollections().toArray();
    for (const collection of collections) {
      const indexes = await db.collection(collection.name).listIndexes().toArray();
      logger.info(`📊 ${collection.name}: ${indexes.length} indexes`);
    }

  } catch (error) {
    logger.error('❌ Failed to create database indexes:', error);
    throw error;
  }
};

const dropIndexes = async () => {
  try {
    logger.info('🗑️ Dropping all database indexes...');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    for (const collection of collections) {
      try {
        await db.collection(collection.name).dropIndexes();
        logger.info(`✅ Dropped indexes for ${collection.name}`);
      } catch (error) {
        logger.warn(`⚠️ Could not drop indexes for ${collection.name}:`, error.message);
      }
    }

    logger.info('✅ All indexes dropped successfully');
  } catch (error) {
    logger.error('❌ Failed to drop indexes:', error);
    throw error;
  }
};

const listIndexes = async () => {
  try {
    logger.info('📋 Listing all database indexes...');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    for (const collection of collections) {
      const indexes = await db.collection(collection.name).listIndexes().toArray();
      logger.info(`\n📊 Collection: ${collection.name}`);
      indexes.forEach(index => {
        logger.info(`  - ${index.name}: ${JSON.stringify(index.key)}`);
      });
    }
  } catch (error) {
    logger.error('❌ Failed to list indexes:', error);
    throw error;
  }
};

const analyzePerformance = async () => {
  try {
    logger.info('🔍 Analyzing database performance...');

    const db = mongoose.connection.db;

    // Analyze most used collections
    const collections = ['users', 'pets', 'matches', 'messages', 'swipes'];
    
    for (const collectionName of collections) {
      try {
        const stats = await db.collection(collectionName).stats();
        logger.info(`\n📊 ${collectionName}:`);
        logger.info(`  - Documents: ${stats.count}`);
        logger.info(`  - Size: ${Math.round(stats.size / 1024 / 1024)} MB`);
        logger.info(`  - Indexes: ${stats.nindexes}`);
        logger.info(`  - Index Size: ${Math.round(stats.totalIndexSize / 1024 / 1024)} MB`);
      } catch (error) {
        logger.warn(`⚠️ Could not analyze ${collectionName}:`, error.message);
      }
    }
  } catch (error) {
    logger.error('❌ Failed to analyze performance:', error);
    throw error;
  }
};

// Command line interface
if (require.main === module) {
  const command = process.argv[2];
  
  const runCommand = async () => {
    try {
      // Connect to database
      await mongoose.connect(process.env.MONGODB_URI);
      logger.info('🔗 Connected to database');

      switch (command) {
        case 'create':
          await createIndexes();
          break;
        case 'drop':
          await dropIndexes();
          break;
        case 'list':
          await listIndexes();
          break;
        case 'analyze':
          await analyzePerformance();
          break;
        default:
          logger.info('Usage: node createIndexes.js [create|drop|list|analyze]');
          process.exit(1);
      }

      await mongoose.disconnect();
      logger.info('🔌 Disconnected from database');
      process.exit(0);
    } catch (error) {
      logger.error('❌ Command failed:', error);
      process.exit(1);
    }
  };

  runCommand();
}

module.exports = {
  createIndexes,
  dropIndexes,
  listIndexes,
  analyzePerformance,
};
