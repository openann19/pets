
// Mock axios completely
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
    postForm: jest.fn(),
    putForm: jest.fn(),
    patchForm: jest.fn(),
    request: jest.fn(),
    head: jest.fn(),
    options: jest.fn(),
    create: jest.fn(),
    defaults: {},
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() }
    },
    getUri: jest.fn(),
  })),
  default: {
    create: jest.fn(() => ({
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      patch: jest.fn(),
      postForm: jest.fn(),
      putForm: jest.fn(),
      patchForm: jest.fn(),
      request: jest.fn(),
      head: jest.fn(),
      options: jest.fn(),
      create: jest.fn(),
      defaults: {},
      interceptors: {
        request: { use: jest.fn(), eject: jest.fn() },
        response: { use: jest.fn(), eject: jest.fn() }
      },
      getUri: jest.fn(),
    }))
  }
}));

// Import after mocking
import { apiClient, useApiMutation, useApiQuery } from '../index';


describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset localStorage mock
    (localStorage.getItem as jest.Mock).mockClear();
    (localStorage.setItem as jest.Mock).mockClear();
    (localStorage.removeItem as jest.Mock).mockClear();
  });

  describe('Basic Functionality', () => {
    it('should have apiClient defined', () => {
      expect(apiClient).toBeDefined();
    });

    it('should have get method', () => {
      expect(typeof apiClient.get).toBe('function');
    });

    it('should have post method', () => {
      expect(typeof apiClient.post).toBe('function');
    });

    it('should have put method', () => {
      expect(typeof apiClient.put).toBe('function');
    });

    it('should have delete method', () => {
      expect(typeof apiClient.delete).toBe('function');
    });

    it('should have uploadFile method', () => {
      expect(typeof apiClient.uploadFile).toBe('function');
    });
  });
});

describe('API Hooks', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    (localStorage.getItem as jest.Mock).mockClear();
    (localStorage.setItem as jest.Mock).mockClear();
    (localStorage.removeItem as jest.Mock).mockClear();
  });

  describe('useApiQuery', () => {
    it('should be defined', () => {
      expect(typeof useApiQuery).toBe('function');
    });
  });

  describe('useApiMutation', () => {
    it('should be defined', () => {
      expect(typeof useApiMutation).toBe('function');
    });
  });
});