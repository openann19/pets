module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  setupFilesAfterEnv: ['./tests/setup.js'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
  ],
  testTimeout: 30000, // 30 seconds for database operations
  maxWorkers: 1, // Run tests sequentially to avoid database conflicts
  forceExit: true, // Force exit after tests complete
  detectOpenHandles: true, // Detect open handles
};
