/**
 * Jest Configuration for Detox E2E Tests
 */

module.exports = {
  rootDir: '..',
  testMatch: ['<rootDir>/e2e/**/*.e2e.js'],
  testTimeout: 120000,
  maxWorkers: 1,
  globalSetup: 'detox/runners/jest/globalSetup',
  globalTeardown: 'detox/runners/jest/globalTeardown',
  reporters: ['detox/runners/jest/reporter'],
  testEnvironment: 'detox/runners/jest/testEnvironment',
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/e2e/setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-.*|@react-navigation|@react-native-async-storage|@react-native-community|expo|@expo|expo-.*|@unimodules|unimodules|sentry-expo|@sentry|react-native-vector-icons|react-native-screens|react-native-safe-area-context|react-native-gesture-handler|react-native-reanimated|react-native-maps|react-native-permissions|react-native-webrtc|react-native-biometrics|react-native-screen-recorder|react-native-screen-capture|react-native-incall-manager|react-native-linear-gradient|react-native-svg|react-native-vector-icons)/)'
  ],
  collectCoverage: false,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest'
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@core/(.*)$': '<rootDir>/../packages/core/src/$1',
    '^@ui/(.*)$': '<rootDir>/../packages/ui/src/$1'
  }
};