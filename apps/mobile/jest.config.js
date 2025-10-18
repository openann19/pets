const base = require('../../jest.config.base.js');

module.exports = {
  ...base,
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '^@pawfectmatch/core$': '<rootDir>/../../packages/core/src',
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '@react-native/js-polyfills/error-guard': '<rootDir>/src/__mocks__/error-guard.js',
    '^expo-modules-core$': '<rootDir>/src/__mocks__/expo-modules-core.js',
    '^@expo/modules-core$': '<rootDir>/src/__mocks__/expo-modules-core.js',
    '^react-native$': '<rootDir>/src/__mocks__/react-native.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-.*|@react-navigation|expo|@expo|@unimodules|unimodules|sentry-expo|native-base|react-native-svg|@react-native/js-polyfills|@react-native/.*|jest-expo|@babel|@jest)/)'
  ],
};