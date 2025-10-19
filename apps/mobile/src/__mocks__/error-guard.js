// Mock for @react-native/js-polyfills/error-guard to prevent Flow/TypeScript parsing issues
module.exports = {
  ErrorUtils: {
    setGlobalHandler: jest.fn(),
    getGlobalHandler: jest.fn(() => jest.fn()),
    reportFatalError: jest.fn(),
    reportSoftError: jest.fn(),
  },
};

// Also export as default for ES modules
module.exports.default = module.exports;