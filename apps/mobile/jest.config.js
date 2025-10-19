const base = require('../../jest.config.base.js');

module.exports = {
  ...base,
  preset: 'jest-expo',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@pawfectmatch/core$': '<rootDir>/../../packages/core/src/index.ts',
    '^@pawfectmatch/core/(.*)$': '<rootDir>/../../packages/core/src/$1',
    '^@pawfectmatch/design-tokens$': '<rootDir>/../../packages/design-tokens/src/index.ts',
    '^@pawfectmatch/design-tokens/(.*)$': '<rootDir>/../../packages/design-tokens/src/$1'
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@sentry/.*))'
  ],
};
