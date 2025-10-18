// Mock for @react-native/js-polyfills/error-guard to prevent Flow/TypeScript parsing issues
export default {
    setGlobalHandler: jest.fn(),
    getGlobalHandler: jest.fn(() => jest.fn()),
};