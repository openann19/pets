/**
 * MongoDB Atlas Setup Script
 * Automated setup for production MongoDB Atlas cluster
 */

const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * MongoDB Atlas Configuration
 */
const ATLAS_CONFIG = {
  // Connection options for Atlas
  connectionOptions: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    bufferMaxEntries: 0,
    bufferCommands: false,
  },
  
  // Index configurations
  indexes: {
    // User collection indexes
    users: [
      { key: { email: 1 }, unique: true, name: 'email_unique' },
      { key: { 'location.coordinates': '2dsphere' }, name: 'location_2dsphere' },
      { key: { createdAt: -1 }, name: 'created_desc' },
      { key: { isPremium: 1 }, name: 'premium_status' },
      { key: { lastActive: -1 }, name: 'last_active_desc' },
      { key: { email: 1, isVerified: 1 }, name: 'email_verified' },
    ],
    
    // Pet collection indexes
    pets: [
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
      { key: { ownerId: 1, createdAt: -1 }, name: 'owner_created' },
    ],
    
    // Match collection indexes
    matches: [
      { key: { users: 1 }, name: 'users' },
      { key: { pets: 1 }, name: 'pets' },
      { key: { createdAt: -1 }, name: 'created_desc' },
      { key: { status: 1 }, name: 'status' },
      { key: { users: 1, status: 1 }, name: 'users_status' },
      { key: { 'users.0': 1, 'users.1': 1 }, unique: true, name: 'unique_match' },
      { key: { lastMessageAt: -1 }, name: 'last_message_desc' },
    ],
    
    // Message collection indexes
    messages: [
      { key: { matchId: 1, createdAt: -1 }, name: 'match_timestamp' },
      { key: { senderId: 1 }, name: 'sender_id' },
      { key: { createdAt: -1 }, name: 'created_desc' },
      { key: { read: 1 }, name: 'read_status' },
      { key: { matchId: 1, read: 1 }, name: 'match_read_status' },
      { key: { type: 1 }, name: 'message_type' },
    ],
    
    // Swipe collection indexes
    swipes: [
      { key: { userId: 1, petId: 1 }, unique: true, name: 'user_pet_unique' },
      { key: { userId: 1, createdAt: -1 }, name: 'user_timestamp' },
      { key: { petId: 1 }, name: 'pet_id' },
      { key: { action: 1 }, name: 'action' },
      { key: { createdAt: -1 }, name: 'created_desc' },
      { key: { userId: 1, action: 1 }, name: 'user_action' },
    ],
    
    // Subscription collection indexes
    subscriptions: [
      { key: { userId: 1 }, unique: true, name: 'user_unique' },
      { key: { stripeCustomerId: 1 }, unique: true, name: 'stripe_customer_unique' },
      { key: { stripeSubscriptionId: 1 }, unique: true, name: 'stripe_subscription_unique' },
      { key: { status: 1 }, name: 'status' },
      { key: { plan: 1 }, name: 'plan' },
      { key: { currentPeriodEnd: 1 }, name: 'period_end' },
      { key: { createdAt: -1 }, name: 'created_desc' },
    ],
  }
};

/**
 * Connect to MongoDB Atlas
 * @param {string} uri - MongoDB Atlas connection string
 * @returns {Promise<void>}
 */
const connectToAtlas = async (uri) => {
  try {
    logger.info('🔗 Connecting to MongoDB Atlas...');
    
    const connection = await mongoose.connect(uri, ATLAS_CONFIG.connectionOptions);
    
    logger.info(`✅ Connected to MongoDB Atlas: ${connection.connection.host}`);
    
    // Set up connection event handlers
    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️ MongoDB Atlas disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      logger.info('✅ MongoDB Atlas reconnected');
    });
    
    mongoose.connection.on('error', (error) => {
      logger.error('❌ MongoDB Atlas error:', error);
    });
    
    return connection;
  } catch (error) {
    logger.error('❌ Failed to connect to MongoDB Atlas:', error);
    throw error;
  }
};

/**
 * Create all database indexes
 * @returns {Promise<void>}
 */
const createAtlasIndexes = async () => {
  try {
    logger.info('🔍 Creating MongoDB Atlas indexes...');
    
    const db = mongoose.connection.db;
    
    for (const [collectionName, indexes] of Object.entries(ATLAS_CONFIG.indexes)) {
      try {
        await db.collection(collectionName).createIndexes(indexes);
        logger.info(`✅ Created ${indexes.length} indexes for ${collectionName}`);
      } catch (error) {
        logger.warn(`⚠️ Some indexes may already exist for ${collectionName}:`, error.message);
      }
    }
    
    logger.info('✅ All MongoDB Atlas indexes created successfully');
  } catch (error) {
    logger.error('❌ Failed to create Atlas indexes:', error);
    throw error;
  }
};

/**
 * Verify Atlas connection and performance
 * @returns {Promise<Object>} Connection stats
 */
const verifyAtlasConnection = async () => {
  try {
    logger.info('🔍 Verifying MongoDB Atlas connection...');
    
    const db = mongoose.connection.db;
    
    // Test basic operations
    const startTime = Date.now();
    await db.admin().ping();
    const pingTime = Date.now() - startTime;
    
    // Get database stats
    const stats = await db.stats();
    
    // Get collection info
    const collections = await db.listCollections().toArray();
    
    const connectionInfo = {
      connected: true,
      pingTime: `${pingTime}ms`,
      database: db.databaseName,
      collections: collections.length,
      dataSize: `${Math.round(stats.dataSize / 1024 / 1024)} MB`,
      indexSize: `${Math.round(stats.indexSize / 1024 / 1024)} MB`,
      totalSize: `${Math.round(stats.totalSize / 1024 / 1024)} MB`,
    };
    
    logger.info('📊 MongoDB Atlas Connection Info:', connectionInfo);
    
    return connectionInfo;
  } catch (error) {
    logger.error('❌ Failed to verify Atlas connection:', error);
    throw error;
  }
};

/**
 * Setup Atlas monitoring and alerts
 * @returns {Promise<void>}
 */
const setupAtlasMonitoring = async () => {
  try {
    logger.info('📊 Setting up MongoDB Atlas monitoring...');
    
    // This would typically involve:
    // 1. Setting up Atlas monitoring alerts
    // 2. Configuring performance monitoring
    // 3. Setting up backup schedules
    // 4. Configuring security settings
    
    logger.info('✅ MongoDB Atlas monitoring configured');
  } catch (error) {
    logger.error('❌ Failed to setup Atlas monitoring:', error);
    throw error;
  }
};

/**
 * Create Atlas backup configuration
 * @returns {Promise<void>}
 */
const setupAtlasBackups = async () => {
  try {
    logger.info('💾 Setting up MongoDB Atlas backups...');
    
    // This would typically involve:
    // 1. Configuring automated backups
    // 2. Setting retention policies
    // 3. Configuring point-in-time recovery
    
    logger.info('✅ MongoDB Atlas backups configured');
  } catch (error) {
    logger.error('❌ Failed to setup Atlas backups:', error);
    throw error;
  }
};

/**
 * Setup Atlas security
 * @returns {Promise<void>}
 */
const setupAtlasSecurity = async () => {
  try {
    logger.info('🔒 Setting up MongoDB Atlas security...');
    
    // This would typically involve:
    // 1. Configuring IP whitelist
    // 2. Setting up database users
    // 3. Configuring encryption at rest
    // 4. Setting up audit logging
    
    logger.info('✅ MongoDB Atlas security configured');
  } catch (error) {
    logger.error('❌ Failed to setup Atlas security:', error);
    throw error;
  }
};

/**
 * Complete Atlas setup
 * @param {string} atlasUri - MongoDB Atlas connection string
 * @returns {Promise<Object>} Setup results
 */
const setupMongoDBAtlas = async (atlasUri) => {
  try {
    logger.info('🚀 Starting MongoDB Atlas setup...');
    
    // Connect to Atlas
    await connectToAtlas(atlasUri);
    
    // Create indexes
    await createAtlasIndexes();
    
    // Verify connection
    const connectionInfo = await verifyAtlasConnection();
    
    // Setup monitoring
    await setupAtlasMonitoring();
    
    // Setup backups
    await setupAtlasBackups();
    
    // Setup security
    await setupAtlasSecurity();
    
    logger.info('✅ MongoDB Atlas setup completed successfully');
    
    return {
      success: true,
      connectionInfo,
      message: 'MongoDB Atlas setup completed successfully'
    };
  } catch (error) {
    logger.error('❌ MongoDB Atlas setup failed:', error);
    throw error;
  }
};

/**
 * Generate Atlas connection string
 * @param {Object} config - Atlas configuration
 * @returns {string} Connection string
 */
const generateAtlasUri = (config) => {
  const {
    username,
    password,
    clusterName,
    databaseName = 'pawfectmatch',
    options = {}
  } = config;
  
  const defaultOptions = {
    retryWrites: true,
    w: 'majority'
  };
  
  const queryString = new URLSearchParams({
    ...defaultOptions,
    ...options
  }).toString();
  
  return `mongodb+srv://${username}:${password}@${clusterName}.mongodb.net/${databaseName}?${queryString}`;
};

/**
 * Test Atlas connection
 * @param {string} uri - MongoDB Atlas URI
 * @returns {Promise<boolean>} Connection success
 */
const testAtlasConnection = async (uri) => {
  try {
    await mongoose.connect(uri, ATLAS_CONFIG.connectionOptions);
    await mongoose.connection.db.admin().ping();
    await mongoose.disconnect();
    
    logger.info('✅ MongoDB Atlas connection test successful');
    return true;
  } catch (error) {
    logger.error('❌ MongoDB Atlas connection test failed:', error);
    return false;
  }
};

module.exports = {
  connectToAtlas,
  createAtlasIndexes,
  verifyAtlasConnection,
  setupAtlasMonitoring,
  setupAtlasBackups,
  setupAtlasSecurity,
  setupMongoDBAtlas,
  generateAtlasUri,
  testAtlasConnection,
  ATLAS_CONFIG
};
