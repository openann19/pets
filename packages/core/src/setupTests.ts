import '@testing-library/jest-dom';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

// Mock localStorage
const localStorageMock: Storage = {
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
(global as unknown as { IntersectionObserver: typeof IntersectionObserver }).IntersectionObserver = class MockIntersectionObserver {
  root = null;
  rootMargin = '';
  thresholds: number[] = [];
  // Mock constructor - no implementation needed
  observe(): void {
    // Mock implementation
  }
  disconnect(): void {
    // Mock implementation
  }
  unobserve(): void {
    // Mock implementation
  }
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
};

// Mock ResizeObserver
class MockResizeObserver implements ResizeObserver {
  observe(): void {
    // Mock implementation
  }
  
  disconnect(): void {
    // Mock implementation
  }
  
  unobserve(): void {
    // Mock implementation
  }
}

(global as unknown as { ResizeObserver: typeof ResizeObserver }).ResizeObserver = MockResizeObserver;

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string): MediaQueryList => ({
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
  value: jest.fn() as jest.MockedFunction<typeof window.scrollTo>,
});

// Mock requestAnimationFrame
(global as unknown as { requestAnimationFrame: typeof requestAnimationFrame }).requestAnimationFrame = jest.fn().mockImplementation((cb: FrameRequestCallback): number => {
  setTimeout(cb, 16);
  return 1;
});

(global as unknown as { cancelAnimationFrame: typeof cancelAnimationFrame }).cancelAnimationFrame = jest.fn() as jest.MockedFunction<typeof cancelAnimationFrame>;

// Setup MSW (Mock Service Worker) for API mocking
// import { server } from '../src/__mocks__/server';
// beforeAll(() => server.listen());
// afterEach(() => server.resetHandlers());
// afterAll(() => server.close());
