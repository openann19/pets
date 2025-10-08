/**
 * Jest Test Setup
 * Handles cleanup of intervals and connections for proper test execution
 */

const mongoose = require('mongoose');

// Set environment variables for tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/test';
process.env.PORT = 5002;
process.env.DEEPSEEK_API_KEY = 'test-deepseek-key';
process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
process.env.CLOUDINARY_API_KEY = 'test-api-key';
process.env.CLOUDINARY_API_SECRET = 'test-api-secret';

// Global test timeout
jest.setTimeout(30000);

// Mock setInterval globally to prevent hanging tests
const originalSetInterval = global.setInterval;
const mockIntervals = [];

global.setInterval = jest.fn((callback, delay) => {
  // In test environment, return a mock interval ID
  if (process.env.NODE_ENV === 'test') {
    const mockId = Math.random();
    mockIntervals.push(mockId);
    return mockId;
  }
  return originalSetInterval(callback, delay);
});

// Mock clearInterval
const originalClearInterval = global.clearInterval;
global.clearInterval = jest.fn((id) => {
  if (process.env.NODE_ENV === 'test') {
    const index = mockIntervals.indexOf(id);
    if (index > -1) {
      mockIntervals.splice(index, 1);
    }
    return;
  }
  return originalClearInterval(id);
});

// Global cleanup after all tests
afterAll(async () => {
  try {
    // Clear all mock intervals
    mockIntervals.length = 0;
    
    // Close MongoDB connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    
    // Stop any remaining intervals from MapSocket
    try {
      const { MapSocketServer } = require('../src/sockets/mapSocket');
      if (MapSocketServer && MapSocketServer.prototype.stopAllIntervals) {
        MapSocketServer.prototype.stopAllIntervals();
      }
    } catch (error) {
      // Ignore if MapSocket not available
    }
    
    // Clear any remaining timers
    jest.clearAllTimers();
    
    console.log('🧹 Test cleanup completed');
  } catch (error) {
    console.error('❌ Test cleanup error:', error);
  }
});

// Setup before each test
beforeEach(() => {
  // Clear all mocks
  jest.clearAllMocks();
  
  // Reset mock intervals
  mockIntervals.length = 0;
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});