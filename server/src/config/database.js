const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Database Configuration and Connection Management
 * Provides optimized MongoDB connection with pooling and monitoring
 */

// Production-optimized connection options
const getConnectionOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    // Connection Pool Settings
    maxPoolSize: isProduction ? 20 : 10, // Maximum number of connections
    minPoolSize: isProduction ? 5 : 2,   // Minimum number of connections
    maxIdleTimeMS: 30000,                // Close connections after 30 seconds of inactivity
    serverSelectionTimeoutMS: 5000,      // How long to try selecting a server
    socketTimeoutMS: 45000,              // How long a send or receive on a socket can take
    family: 4,                           // Use IPv4, skip trying IPv6
    
    // Write Concern Settings
    w: 'majority',                       // Write to majority of replica set members
    j: true,                             // Wait for journal write
    wtimeout: 10000,                     // Write concern timeout
    
    // Read Preference
    readPreference: 'primaryPreferred',  // Prefer primary, fallback to secondary
    
    // Retry Settings
    retryWrites: true,                   // Retry writes on transient errors
    retryReads: true,                    // Retry reads on transient errors
    
    // Buffer Settings
    bufferMaxEntries: 0,                 // Disable mongoose buffering
    bufferCommands: false,               // Disable mongoose buffering
    
    // Compression
    compressors: ['zlib'],               // Enable compression
    
    // SSL/TLS
    ssl: isProduction,                   // Use SSL in production
    sslValidate: isProduction,           // Validate SSL certificates in production
    
    // Monitoring
    monitorCommands: isProduction,       // Enable command monitoring in production
  };
};

/**
 * Initialize database connection with optimized settings
 */
async function connectDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pawfectmatch';
    const options = getConnectionOptions();
    
    logger.info('Connecting to MongoDB...', {
      uri: mongoUri.replace(/\/\/.*@/, '//***:***@'), // Hide credentials in logs
      options: {
        maxPoolSize: options.maxPoolSize,
        minPoolSize: options.minPoolSize,
        ssl: options.ssl
      }
    });
    
    await mongoose.connect(mongoUri, options);
    
    logger.info('✅ MongoDB connected successfully', {
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name,
      readyState: mongoose.connection.readyState
    });
    
    // Set up connection event listeners
    setupConnectionListeners();
    
    return mongoose.connection;
    
  } catch (error) {
    logger.error('❌ MongoDB connection failed:', error);
    throw error;
  }
}

/**
 * Set up database connection event listeners
 */
function setupConnectionListeners() {
  const connection = mongoose.connection;
  
  connection.on('connected', () => {
    logger.info('📡 MongoDB connection established');
  });
  
  connection.on('error', (error) => {
    logger.error('❌ MongoDB connection error:', error);
  });
  
  connection.on('disconnected', () => {
    logger.warn('⚠️ MongoDB connection lost');
  });
  
  connection.on('reconnected', () => {
    logger.info('🔄 MongoDB reconnected');
  });
  
  // Monitor slow operations in production
  if (process.env.NODE_ENV === 'production') {
    mongoose.set('debug', (collectionName, method, query, doc) => {
      logger.debug('MongoDB Query:', {
        collection: collectionName,
        method: method,
        query: JSON.stringify(query),
        doc: doc ? JSON.stringify(doc) : undefined
      });
    });
  }
}

/**
 * Create database indexes for optimal performance
 */
async function createIndexes() {
  try {
    logger.info('📊 Creating database indexes...');
    
    const User = require('../models/User');
    const Pet = require('../models/Pet');
    const Match = require('../models/Match');
    const BreedProfile = require('../models/BreedProfile');
    
    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ 'location.coordinates': '2dsphere' });
    await User.collection.createIndex({ isActive: 1 });
    await User.collection.createIndex({ createdAt: -1 });
    await User.collection.createIndex({ 'subscription.status': 1 });
    await User.collection.createIndex({ 'subscription.plan': 1 });
    
    // Pet indexes
    await Pet.collection.createIndex({ owner: 1 });
    await Pet.collection.createIndex({ species: 1 });
    await Pet.collection.createIndex({ breed: 1 });
    await Pet.collection.createIndex({ isActive: 1 });
    await Pet.collection.createIndex({ age: 1 });
    await Pet.collection.createIndex({ size: 1 });
    await Pet.collection.createIndex({ createdAt: -1 });
    
    // Compound indexes for common queries
    await Pet.collection.createIndex({ owner: 1, isActive: 1 });
    await Pet.collection.createIndex({ species: 1, breed: 1 });
    await Pet.collection.createIndex({ species: 1, age: 1, size: 1 });
    
    // Match indexes
    await Match.collection.createIndex({ user1: 1, user2: 1 });
    await Match.collection.createIndex({ status: 1 });
    await Match.collection.createIndex({ lastActivity: -1 });
    await Match.collection.createIndex({ matchedAt: -1 });
    await Match.collection.createIndex({ 'userActions.user1.isBlocked': 1 });
    await Match.collection.createIndex({ 'userActions.user2.isBlocked': 1 });
    
    // Compound indexes for match queries
    await Match.collection.createIndex({ user1: 1, status: 1 });
    await Match.collection.createIndex({ user2: 1, status: 1 });
    await Match.collection.createIndex({ status: 1, lastActivity: -1 });
    
    // Breed profile indexes
    await BreedProfile.collection.createIndex({ species: 1 });
    await BreedProfile.collection.createIndex({ name: 1 });
    await BreedProfile.collection.createIndex({ isActive: 1 });
    await BreedProfile.collection.createIndex({ species: 1, name: 1 });
    
    logger.info('✅ Database indexes created successfully');
    
  } catch (error) {
    logger.error('❌ Error creating database indexes:', error);
    throw error;
  }
}

/**
 * Get database connection statistics
 */
async function getConnectionStats() {
  try {
    const connection = mongoose.connection;
    const admin = connection.db.admin();
    
    const stats = await admin.serverStatus();
    const dbStats = await connection.db.stats();
    
    return {
      connection: {
        readyState: connection.readyState,
        host: connection.host,
        port: connection.port,
        name: connection.name
      },
      pool: {
        maxPoolSize: connection.config.maxPoolSize,
        minPoolSize: connection.config.minPoolSize,
        currentConnections: stats.connections?.current || 0,
        availableConnections: stats.connections?.available || 0
      },
      database: {
        collections: dbStats.collections,
        dataSize: dbStats.dataSize,
        storageSize: dbStats.storageSize,
        indexes: dbStats.indexes,
        indexSize: dbStats.indexSize
      },
      operations: {
        insert: stats.opcounters?.insert || 0,
        query: stats.opcounters?.query || 0,
        update: stats.opcounters?.update || 0,
        delete: stats.opcounters?.delete || 0
      }
    };
    
  } catch (error) {
    logger.error('Error getting database stats:', error);
    return null;
  }
}

/**
 * Health check for database connection
 */
async function healthCheck() {
  try {
    const connection = mongoose.connection;
    
    if (connection.readyState !== 1) {
      return {
        status: 'error',
        message: 'Database not connected',
        readyState: connection.readyState
      };
    }
    
    // Test basic operations
    await connection.db.admin().ping();
    
    const stats = await getConnectionStats();
    
    return {
      status: 'healthy',
      message: 'Database connection is healthy',
      stats: stats
    };
    
  } catch (error) {
    logger.error('Database health check failed:', error);
    return {
      status: 'error',
      message: error.message
    };
  }
}

/**
 * Graceful database shutdown
 */
async function disconnectDatabase() {
  try {
    await mongoose.disconnect();
    logger.info('📡 MongoDB connection closed');
  } catch (error) {
    logger.error('Error disconnecting from MongoDB:', error);
  }
}

/**
 * Query optimization utilities
 */
const queryOptimization = {
  /**
   * Add pagination to queries
   */
  paginate: (query, page = 1, limit = 20) => {
    const skip = (page - 1) * limit;
    return query.skip(skip).limit(limit);
  },
  
  /**
   * Add sorting to queries
   */
  sort: (query, sortBy = 'createdAt', order = 'desc') => {
    const sortOrder = order === 'asc' ? 1 : -1;
    return query.sort({ [sortBy]: sortOrder });
  },
  
  /**
   * Add text search to queries
   */
  search: (query, searchTerm, searchFields) => {
    if (!searchTerm) return query;
    
    const searchRegex = new RegExp(searchTerm, 'i');
    const searchConditions = searchFields.map(field => ({
      [field]: { $regex: searchRegex }
    }));
    
    return query.or(searchConditions);
  },
  
  /**
   * Add date range filtering
   */
  dateRange: (query, dateField, startDate, endDate) => {
    const dateFilter = {};
    
    if (startDate) {
      dateFilter.$gte = new Date(startDate);
    }
    
    if (endDate) {
      dateFilter.$lte = new Date(endDate);
    }
    
    if (Object.keys(dateFilter).length > 0) {
      query.where(dateField, dateFilter);
    }
    
    return query;
  },
  
  /**
   * Add geospatial filtering
   */
  near: (query, locationField, coordinates, maxDistance) => {
    return query.where(locationField).near({
      center: coordinates,
      maxDistance: maxDistance * 1609.34, // Convert miles to meters
      spherical: true
    });
  }
};

// Handle process termination
process.on('SIGTERM', disconnectDatabase);
process.on('SIGINT', disconnectDatabase);

module.exports = {
  connectDatabase,
  createIndexes,
  getConnectionStats,
  healthCheck,
  disconnectDatabase,
  queryOptimization,
  getConnectionOptions
};
