const mongoose = require('mongoose');
const logger = require('../utils/logger');

// MongoDB connection configuration with robust error handling
class DatabaseConnection {
  constructor() {
    this.isConnected = false;
    this.connectionRetries = 0;
    this.maxRetries = 5;
    this.retryDelay = 5000;
    this.reconnectInterval = null;
  }

  async connect() {
    // Skip if already connected
    if (this.isConnected) {
      logger.info('📊 MongoDB already connected');
      return;
    }

    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      logger.error('❌ MONGODB_URI not provided in environment variables');
      throw new Error('MongoDB URI is required');
    }

    // Validate URI format
    try {
      new URL(mongoUri);
    } catch (error) {
      logger.error('❌ Invalid MONGODB_URI format:', mongoUri);
      throw new Error('Invalid MongoDB URI format');
    }

    // Configure mongoose options for better reliability
    const mongooseOptions = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4
      maxPoolSize: 10,
      minPoolSize: 2,
      retryWrites: true,
      w: 'majority',
    };

    try {
      await this.attemptConnection(mongoUri, mongooseOptions);
      this.setupEventHandlers();
      this.isConnected = true;
      this.connectionRetries = 0;
    } catch (error) {
      await this.handleConnectionError(error, mongoUri, mongooseOptions);
    }
  }

  async attemptConnection(uri, options) {
    logger.info('🔄 Attempting MongoDB connection...');
    
    const conn = await mongoose.connect(uri, options);
    
    logger.info(`✅ MongoDB Connected Successfully`);
    logger.info(`📍 Host: ${conn.connection.host}`);
    logger.info(`📊 Database: ${conn.connection.name}`);
    logger.info(`🔌 Port: ${conn.connection.port}`);
    
    return conn;
  }

  async handleConnectionError(error, uri, options) {
    this.connectionRetries++;
    
    logger.error(`❌ MongoDB connection attempt ${this.connectionRetries}/${this.maxRetries} failed`);
    logger.error(`📝 Error: ${error.message}`);
    
    if (this.connectionRetries >= this.maxRetries) {
      logger.error('❌ All MongoDB connection attempts exhausted');
      throw new Error('Failed to connect to MongoDB after maximum retries');
    }
    
    logger.info(`⏳ Retrying connection in ${this.retryDelay / 1000} seconds...`);
    
    await new Promise(resolve => setTimeout(resolve, this.retryDelay));
    
    // Exponential backoff for retry delay
    this.retryDelay = Math.min(this.retryDelay * 1.5, 30000);
    
    // Recursive retry
    await this.connect();
  }

  setupEventHandlers() {
    // Connection event handlers
    mongoose.connection.on('connected', () => {
      logger.info('✅ Mongoose connected to MongoDB');
      this.isConnected = true;
      this.clearReconnectInterval();
    });

    mongoose.connection.on('error', (err) => {
      logger.error('❌ Mongoose connection error:', err);
      this.isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️  Mongoose disconnected from MongoDB');
      this.isConnected = false;
      this.scheduleReconnect();
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('✅ Mongoose reconnected to MongoDB');
      this.isConnected = true;
      this.clearReconnectInterval();
    });

    // Process event handlers
    process.on('SIGINT', async () => {
      await this.gracefulShutdown('SIGINT');
    });

    process.on('SIGTERM', async () => {
      await this.gracefulShutdown('SIGTERM');
    });
  }

  scheduleReconnect() {
    if (this.reconnectInterval) return;
    
    this.reconnectInterval = setInterval(async () => {
      if (!this.isConnected) {
        logger.info('🔄 Attempting to reconnect to MongoDB...');
        try {
          await this.connect();
        } catch (error) {
          logger.error('❌ Reconnection failed:', error.message);
        }
      }
    }, 10000); // Try every 10 seconds
  }

  clearReconnectInterval() {
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = null;
    }
  }

  async gracefulShutdown(signal) {
    logger.info(`📴 ${signal} received: closing MongoDB connection`);
    
    this.clearReconnectInterval();
    
    try {
      await mongoose.connection.close();
      logger.info('✅ MongoDB connection closed gracefully');
      process.exit(0);
    } catch (error) {
      logger.error('❌ Error during graceful shutdown:', error);
      process.exit(1);
    }
  }

  async disconnect() {
    if (this.isConnected) {
      await mongoose.connection.close();
      this.isConnected = false;
      logger.info('📊 MongoDB disconnected');
    }
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name,
      models: Object.keys(mongoose.connection.models),
    };
  }

  // Health check method
  async healthCheck() {
    if (!this.isConnected) {
      throw new Error('Database not connected');
    }

    try {
      // Ping the database
      await mongoose.connection.db.admin().ping();
      
      return {
        status: 'healthy',
        responseTime: Date.now(),
        connection: this.getConnectionStatus()
      };
    } catch (error) {
      throw new Error(`Database health check failed: ${error.message}`);
    }
  }
}

// Create singleton instance
const databaseConnection = new DatabaseConnection();

module.exports = databaseConnection;