const baseConfig = require('../../jest.config.base.js');

module.exports = {
  ...baseConfig,
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.test.(ts|tsx|js)',
    '**/*.(test|spec).(ts|tsx|js)'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@pawfectmatch/core$': '<rootDir>/../core/src/index.ts',
    '^@pawfectmatch/core/(.*)$': '<rootDir>/../core/src/$1'
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts']
};
