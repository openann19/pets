import { ErrorHandler } from '../ErrorHandler';

// Mock logger
jest.mock('../../utils/logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn()
  }
}));

describe('ErrorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleAPIError', () => {
    it('handles 400 Bad Request error', () => {
      const error = {
        response: {
          status: 400,
          data: { message: 'Invalid input' }
        }
      };

      const result = ErrorHandler.handleAPIError(error, 'test-context');

      expect(result.success).toBe(false);
      expect(result.code).toBe('BAD_REQUEST');
      expect(result.message).toBe('Invalid request. Please check your input.');
      expect(result.details?.status).toBe(400);
      expect(result.details?.context).toBe('test-context');
    });

    it('handles 401 Unauthorized error', () => {
      const error = {
        response: {
          status: 401,
          data: { message: 'Token expired' }
        }
      };

      const result = ErrorHandler.handleAPIError(error);

      expect(result.success).toBe(false);
      expect(result.code).toBe('UNAUTHORIZED');
      expect(result.message).toBe('Authentication required. Please log in.');
    });

    it('handles 500 Internal Server Error', () => {
      const error = {
        response: {
          status: 500,
          data: { message: 'Database connection failed' }
        }
      };

      const result = ErrorHandler.handleAPIError(error);

      expect(result.success).toBe(false);
      expect(result.code).toBe('INTERNAL_SERVER_ERROR');
      expect(result.message).toBe('Server error. Please try again later.');
    });

    it('handles network errors', () => {
      const error = {
        code: 'NETWORK_ERROR',
        message: 'Failed to fetch'
      };

      const result = ErrorHandler.handleAPIError(error);

      expect(result.success).toBe(false);
      expect(result.code).toBe('NETWORK_ERROR');
      expect(result.message).toBe('Network connection failed. Please check your connection and try again.');
    });

    it('handles generic JavaScript errors', () => {
      const error = new Error('Something went wrong');

      const result = ErrorHandler.handleAPIError(error);

      expect(result.success).toBe(false);
      expect(result.code).toBe('CLIENT_ERROR');
      expect(result.message).toBe('Something went wrong');
    });

    it('handles string errors', () => {
      const error = 'Custom error message';

      const result = ErrorHandler.handleAPIError(error);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Custom error message');
    });
  });

  describe('handleValidationError', () => {
    it('handles single validation error', () => {
      const errors = [{ field: 'email', message: 'Email is required' }];

      const result = ErrorHandler.handleValidationError(errors);

      expect(result.success).toBe(false);
      expect(result.code).toBe('VALIDATION_ERROR');
      expect(result.message).toBe('Email is required');
      expect(result.details?.details?.validationErrors).toEqual(errors);
    });

    it('handles multiple validation errors', () => {
      const errors = [
        { field: 'email', message: 'Email is required' },
        { field: 'password', message: 'Password too short' }
      ];

      const result = ErrorHandler.handleValidationError(errors);

      expect(result.success).toBe(false);
      expect(result.code).toBe('VALIDATION_ERROR');
      expect(result.message).toBe('2 validation errors found');
    });
  });

  describe('handleNetworkError', () => {
    it('returns standardized network error', () => {
      const error = new Error('Connection timeout');

      const result = ErrorHandler.handleNetworkError(error, 'api-call');

      expect(result.success).toBe(false);
      expect(result.code).toBe('NETWORK_ERROR');
      expect(result.message).toBe('Network connection failed. Please check your connection and try again.');
      expect(result.details?.context).toBe('api-call');
    });
  });

  describe('handleAuthError', () => {
    it('returns standardized auth error', () => {
      const result = ErrorHandler.handleAuthError('login-form');

      expect(result.success).toBe(false);
      expect(result.code).toBe('AUTH_ERROR');
      expect(result.message).toBe('Authentication failed. Please log in again.');
      expect(result.details?.context).toBe('login-form');
    });
  });

  describe('createErrorResponse', () => {
    it('creates standardized error response', () => {
      const result = ErrorHandler.createErrorResponse(
        'Custom error message',
        'CUSTOM_ERROR',
        422,
        { field: 'email' }
      );

      expect(result.success).toBe(false);
      expect(result.message).toBe('Custom error message');
      expect(result.code).toBe('CUSTOM_ERROR');
      expect(result.details?.status).toBe(422);
      expect(result.details?.details).toEqual({ field: 'email' });
      expect(result.details?.timestamp).toBeDefined();
    });
  });

  describe('isRetryable', () => {
    it('returns true for retryable errors', () => {
      expect(ErrorHandler.isRetryable({ code: 'NETWORK_ERROR' })).toBe(true);
      expect(ErrorHandler.isRetryable({ code: 'TIMEOUT' })).toBe(true);
      expect(ErrorHandler.isRetryable({ status: 500 })).toBe(true);
      expect(ErrorHandler.isRetryable({ status: 502 })).toBe(true);
      expect(ErrorHandler.isRetryable({ status: 503 })).toBe(true);
    });

    it('returns false for non-retryable errors', () => {
      expect(ErrorHandler.isRetryable({ status: 400 })).toBe(false);
      expect(ErrorHandler.isRetryable({ status: 401 })).toBe(false);
      expect(ErrorHandler.isRetryable({ status: 403 })).toBe(false);
      expect(ErrorHandler.isRetryable({ status: 404 })).toBe(false);
    });

    it('returns false for null/undefined errors', () => {
      expect(ErrorHandler.isRetryable(null)).toBe(false);
      expect(ErrorHandler.isRetryable(undefined)).toBe(false);
    });
  });

  describe('getErrorCodeFromStatus', () => {
    // This is a private method, but we can test it indirectly through handleAPIError
    it('maps status codes correctly', () => {
      const testCases = [
        { status: 400, expected: 'BAD_REQUEST' },
        { status: 401, expected: 'UNAUTHORIZED' },
        { status: 403, expected: 'FORBIDDEN' },
        { status: 404, expected: 'NOT_FOUND' },
        { status: 429, expected: 'RATE_LIMITED' },
        { status: 500, expected: 'INTERNAL_SERVER_ERROR' },
        { status: 999, expected: 'UNKNOWN_ERROR' }
      ];

      testCases.forEach(({ status, expected }) => {
        const error = { response: { status, data: { message: 'test' } } };
        const result = ErrorHandler.handleAPIError(error);
        expect(result.code).toBe(expected);
      });
    });
  });
});
