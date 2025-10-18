// Mock for expo-modules-core to avoid ES module issues in tests
export default {
    EventEmitter: jest.fn(),
    NativeModule: jest.fn(),
    SharedObject: jest.fn(),
    SharedRef: jest.fn(),
};