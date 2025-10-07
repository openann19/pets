import '@testing-library/jest-dom';
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    key: jest.fn(),
    length: 0,
};
Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});
// Mock IntersectionObserver
global.IntersectionObserver = class MockIntersectionObserver {
    root = null;
    rootMargin = '';
    thresholds = [];
    // Mock constructor - no implementation needed
    observe() {
        // Mock implementation
    }
    disconnect() {
        // Mock implementation
    }
    unobserve() {
        // Mock implementation
    }
    takeRecords() {
        return [];
    }
};
// Mock ResizeObserver
class MockResizeObserver {
    observe() {
        // Mock implementation
    }
    disconnect() {
        // Mock implementation
    }
    unobserve() {
        // Mock implementation
    }
}
global.ResizeObserver = MockResizeObserver;
// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});
// Mock scrollTo
Object.defineProperty(window, 'scrollTo', {
    writable: true,
    value: jest.fn(),
});
// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn().mockImplementation((cb) => {
    setTimeout(cb, 16);
    return 1;
});
global.cancelAnimationFrame = jest.fn();
// Setup MSW (Mock Service Worker) for API mocking
// import { server } from '../src/__mocks__/server';
// beforeAll(() => server.listen());
// afterEach(() => server.resetHandlers());
// afterAll(() => server.close());
