// Mock for @react-native/js-polyfills/error-guard to prevent Flow/TypeScript parsing issues
module.exports = {
    setGlobalHandler: jest.fn(),
    getGlobalHandler: jest.fn(() => jest.fn()),
};