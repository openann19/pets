const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

/**
 * Setup MongoDB connection for tests
 * Handles disconnecting existing connections and connecting to test database
 */
async function setupTestDatabase() {
  // Disconnect existing connection if any
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  // Create and start MongoDB memory server
  mongoServer = await MongoMemoryServer.create({
    instanceOpts: { replSet: { count: 1 } }
  });
  
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
  
  return mongoUri;
}

/**
 * Cleanup test database connection
 */
async function cleanupTestDatabase() {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
    }
    
    if (mongoServer) {
      await mongoServer.stop();
    }
  } catch (error) {
    console.error('Error in test database cleanup:', error);
  }
}

/**
 * Get the current MongoDB connection state
 */
function getConnectionState() {
  return mongoose.connection.readyState;
}

module.exports = {
  setupTestDatabase,
  cleanupTestDatabase,
  getConnectionState
};
