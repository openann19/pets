/**
 * Jest Setup File for PawfectMatch Tests
 * 
 * This file is run before each test file to set up the testing environment
 */

// Make Jest globals available in test files
/* eslint-disable no-undef */
global.jest = jest;
global.describe = describe;
global.it = it;
global.test = test;
global.expect = expect;
global.beforeAll = beforeAll;
global.afterAll = afterAll;
global.beforeEach = beforeEach;
global.afterEach = afterEach;
/* eslint-enable no-undef */

// Set environment variables for tests
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.STRIPE_SECRET_KEY = 'test_stripe_secret';
process.env.STRIPE_WEBHOOK_SECRET = 'test_webhook_secret';
process.env.CLIENT_URL = 'http://localhost:3000';

// Mock external services
/* eslint-disable no-undef */
jest.mock('../src/services/cloudinaryService');
/* eslint-enable no-undef */

// Helper for JWT tokens in tests
global.generateTestToken = (userId = 'test123', role = 'user') => {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

// Helper for failed assertions
global.fail = (message) => {
  throw new Error(message);
};

// Useful for schema validation tests
global.expectValidationError = async (promise, errorMessage) => {
  try {
    await promise;
    global.fail('Expected validation error but none was thrown');
  } catch (error) {
    if (errorMessage) {
      global.expect(error.message).toContain(errorMessage);
    }
    global.expect(error).toBeDefined();
  }
};

// Clean up resources after tests
/* eslint-disable no-undef */
afterAll(() => {
  jest.clearAllMocks();
});
/* eslint-enable no-undef */
