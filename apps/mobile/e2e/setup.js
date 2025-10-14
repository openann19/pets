import { logger } from '@pawfectmatch/core';

/**
 * Detox E2E Test Setup
 * Global setup and configuration for mobile E2E tests
 */

const { DetoxCircusEnvironment, SpecReporter, WorkerAssignReporter } = require('detox/runners/jest');

// Global test utilities
global.testUtils = {
  // Wait for network to be idle
  waitForNetworkIdle: (timeout = 5000) => {
    return new Promise((resolve) => {
      setTimeout(resolve, timeout);
    });
  },

  // Mock API responses
  mockApiResponse: (endpoint, response) => {
    // Implementation for mocking API responses
    logger.info(`Mocking API response for ${endpoint}:`, { response });
  },

  // Simulate network conditions
  simulateNetworkCondition: (condition) => {
    // Implementation for simulating network conditions
    logger.info(`Simulating network condition: ${condition}`);
  },

  // Generate test data
  generateTestData: (type) => {
    const timestamp = Date.now();
    switch (type) {
      case 'user':
        return {
          email: `test${timestamp}@example.com`,
          password: 'TestPassword123!',
          firstName: 'Test',
          lastName: 'User',
          dateOfBirth: '1990-01-01'
        };
      case 'pet':
        return {
          name: `TestPet${timestamp}`,
          species: 'dog',
          breed: 'Golden Retriever',
          age: 3,
          gender: 'male',
          size: 'large',
          description: 'Friendly test pet'
        };
      default:
        return {};
    }
  },

  // Clean up test data
  cleanupTestData: () => {
    // Implementation for cleaning up test data
    logger.info('Cleaning up test data');
  }
};

// Global error handling
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
});

// Global before hook
beforeAll(async () => {
  // Global setup
  logger.info('Setting up global test environment');
});

// Global after hook
afterAll(async () => {
  // Global cleanup
  logger.info('Cleaning up global test environment');
  await testUtils.cleanupTestData();
});

// Test environment setup
class CustomDetoxEnvironment extends DetoxCircusEnvironment {
  constructor(config, context) {
    super(config, context);
    this.initTimeout = 300000; // 5 minutes
  }

  async setup() {
    await super.setup();
    logger.info('Custom Detox environment setup complete');
  }

  async teardown() {
    await super.teardown();
    logger.info('Custom Detox environment teardown complete');
  }
}

module.exports = CustomDetoxEnvironment;