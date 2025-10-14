/* eslint-env jest */
// Jest setup file
import '@testing-library/jest-dom';

// Import test utilities and adapters
import './test/expectAdapters.ts';
import './test/test-utils.tsx';

// Import our WebRTC mocks
import {
  MockRTCIceCandidate,
  MockRTCPeerConnection,
  MockRTCSessionDescription,
  mockMediaDevices,
} from './__mocks__/webrtc';

// Import service worker mocks
import { setupServiceWorkerMocks } from './__mocks__/service-worker';

// Set up global mocks
const mockStorage = {};

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn((key) => mockStorage[key] || null),
    setItem: jest.fn((key, value) => {
      mockStorage[key] = value;
    }),
    removeItem: jest.fn((key) => {
      delete mockStorage[key];
    }),
    clear: jest.fn(() => {
      Object.keys(mockStorage).forEach((key) => {
        delete mockStorage[key];
      });
    }),
  },
  writable: true,
});

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: jest.fn((key) => mockStorage[key] || null),
    setItem: jest.fn((key, value) => {
      mockStorage[key] = value;
    }),
    removeItem: jest.fn((key) => {
      delete mockStorage[key];
    }),
    clear: jest.fn(() => {
      Object.keys(mockStorage).forEach((key) => {
        delete mockStorage[key];
      });
    }),
  },
  writable: true,
});

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

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
    this.elements = [];
  }
  observe(element) {
    this.elements.push(element);
    this.callback(
      [
        {
          isIntersecting: true,
          target: element,
        },
      ],
      this,
    );
  }
  unobserve(element) {
    this.elements = this.elements.filter((el) => el !== element);
  }
  disconnect() {
    this.elements = [];
  }
}

global.IntersectionObserver = MockIntersectionObserver;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
    this.elements = [];
  }
  observe(element) {
    this.elements.push(element);
  }
  unobserve(element) {
    this.elements = this.elements.filter((el) => el !== element);
  }
  disconnect() {
    this.elements = [];
  }
};

// Mock window.URL.createObjectURL
Object.defineProperty(window.URL, 'createObjectURL', {
  writable: true,
  value: jest.fn().mockImplementation(() => {
    return 'mock-object-url';
  }),
});

// Mock window.URL.revokeObjectURL
Object.defineProperty(window.URL, 'revokeObjectURL', {
  writable: true,
  value: jest.fn(),
});

// Mock fetch
global.fetch = jest.fn().mockImplementation(() => {
  return Promise.resolve({
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob()),
    ok: true,
    status: 200,
    headers: {
      get: jest.fn(),
      forEach: jest.fn(),
    },
  });
});

// Mock WebRTC APIs
Object.defineProperty(global, 'RTCPeerConnection', {
  value: MockRTCPeerConnection,
  writable: true,
});

Object.defineProperty(global, 'RTCSessionDescription', {
  value: MockRTCSessionDescription,
  writable: true,
});

Object.defineProperty(global, 'RTCIceCandidate', {
  value: MockRTCIceCandidate,
  writable: true,
});

Object.defineProperty(global.navigator, 'mediaDevices', {
  value: mockMediaDevices,
  writable: true,
});

// Set up service worker mocks
setupServiceWorkerMocks();

// Mock console methods
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args) => {
  if (
    args[0]?.includes?.('Warning:') ||
    args[0]?.includes?.('Error:') ||
    args[0]?.includes?.('React does not recognize') ||
    args[0]?.includes?.('Invalid prop')
  ) {
    return;
  }
  originalConsoleError(...args);
};

console.warn = (...args) => {
  if (
    args[0]?.includes?.('Warning:') ||
    args[0]?.includes?.('React does not recognize') ||
    args[0]?.includes?.('Invalid prop')
  ) {
    return;
  }
  originalConsoleWarn(...args);
};

// Skip act() warnings
const originalError = console.error;
console.error = (message, ...args) => {
  if (typeof message === 'string' && message.includes('inside a test was not wrapped in act')) {
    return;
  }
  originalError(message, ...args);
};

// Mock element.scrollIntoView
Element.prototype.scrollIntoView = jest.fn();
