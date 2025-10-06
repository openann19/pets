module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.tsx'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native' +
      '|@react-native' +
      '|expo-linear-gradient' +
      '|expo-status-bar' +
      '|expo-blur' +
      '|expo-haptics' +
      '|@expo/vector-icons' +
      '|@pawfectmatch' +
      '|socket.io-client' +
      '|@react-navigation)/'
  ],
  testMatch: [
    '**/__tests__/**/*.(js|jsx|ts|tsx)',
    '**/*.(test|spec).(js|jsx|ts|tsx)'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^@pawfectmatch/core$': '<rootDir>/../../packages/core/src',
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/setupTests.js',
    '!src/**/__tests__/**',
    '!src/**/*.test.{js,jsx,ts,tsx}',
    '!src/**/*.spec.{js,jsx,ts,tsx}'
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage'
};
