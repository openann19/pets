const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer = null;
let isTestConnection = false;

/**
 * Setup MongoDB connection for tests
 * Handles existing connections gracefully
 */
async function setupTestDatabase() {
  // If already connected to a test database, don't reconnect
  if (mongoose.connection.readyState === 1 && isTestConnection) {
    return;
  }

  // If connected to production database, disconnect first
  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }

  // Create memory server for tests
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
  });
  
  isTestConnection = true;
}

/**
 * Cleanup MongoDB connection after tests
 */
async function cleanupTestDatabase() {
  if (mongoServer && isTestConnection) {
    await mongoose.disconnect();
    await mongoServer.stop();
    mongoServer = null;
    isTestConnection = false;
  }
}

/**
 * Clear all collections for test isolation
 */
async function clearTestDatabase() {
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  }
}

module.exports = {
  setupTestDatabase,
  cleanupTestDatabase,
  clearTestDatabase
};
