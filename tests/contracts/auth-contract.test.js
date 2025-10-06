/**
 * Pact Contract Tests - Authentication API
 * Defines contracts for authentication endpoints
 */
const provider = require('./pact-setup');
const { eachLike, like, term } = require('@pact-foundation/pact').Matchers;

describe('Authentication API Contract', () => {
  beforeAll(() => provider.setup());
  afterEach(() => provider.verify());
  afterAll(() => provider.finalize());

  describe('POST /api/auth/register', () => {
    beforeEach(() => {
      const interaction = {
        state: 'no existing user',
        uponReceiving: 'a registration request',
        withRequest: {
          method: 'POST',
          path: '/api/auth/register',
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            email: 'test@example.com',
            password: 'SecurePassword123!',
            name: 'Test User',
            agreeToTerms: true,
          },
        },
        willRespondWith: {
          status: 201,
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            success: true,
            data: {
              user: {
                id: like('507f1f77bcf86cd799439011'),
                email: 'test@example.com',
                name: 'Test User',
                isPremium: false,
                createdAt: term({
                  matcher: '\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z',
                  generate: '2024-01-01T00:00:00.000Z',
                }),
              },
              token: like('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'),
              refreshToken: like('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'),
            },
            message: 'User registered successfully',
          },
        },
      };

      return provider.addInteraction(interaction);
    });

    it('should register a new user', async () => {
      const response = await fetch('http://localhost:1234/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'SecurePassword123!',
          name: 'Test User',
          agreeToTerms: true,
        }),
      });

      const data = await response.json();
      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.user.email).toBe('test@example.com');
      expect(data.data.token).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(() => {
      const interaction = {
        state: 'user exists',
        uponReceiving: 'a login request',
        withRequest: {
          method: 'POST',
          path: '/api/auth/login',
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            email: 'test@example.com',
            password: 'SecurePassword123!',
          },
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            success: true,
            data: {
              user: {
                id: like('507f1f77bcf86cd799439011'),
                email: 'test@example.com',
                name: 'Test User',
                isPremium: false,
                lastActive: term({
                  matcher: '\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z',
                  generate: '2024-01-01T00:00:00.000Z',
                }),
              },
              token: like('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'),
              refreshToken: like('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'),
            },
            message: 'Login successful',
          },
        },
      };

      return provider.addInteraction(interaction);
    });

    it('should login with valid credentials', async () => {
      const response = await fetch('http://localhost:1234/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'SecurePassword123!',
        }),
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.user.email).toBe('test@example.com');
      expect(data.data.token).toBeDefined();
    });
  });

  describe('POST /api/auth/login - Invalid Credentials', () => {
    beforeEach(() => {
      const interaction = {
        state: 'user exists',
        uponReceiving: 'a login request with invalid credentials',
        withRequest: {
          method: 'POST',
          path: '/api/auth/login',
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            email: 'test@example.com',
            password: 'WrongPassword',
          },
        },
        willRespondWith: {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            success: false,
            error: {
              code: 'INVALID_CREDENTIALS',
              message: 'Invalid email or password',
            },
          },
        },
      };

      return provider.addInteraction(interaction);
    });

    it('should return 401 for invalid credentials', async () => {
      const response = await fetch('http://localhost:1234/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'WrongPassword',
        }),
      });

      const data = await response.json();
      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('POST /api/auth/refresh', () => {
    beforeEach(() => {
      const interaction = {
        state: 'valid refresh token',
        uponReceiving: 'a token refresh request',
        withRequest: {
          method: 'POST',
          path: '/api/auth/refresh',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer valid-refresh-token',
          },
          body: {
            refreshToken: 'valid-refresh-token',
          },
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            success: true,
            data: {
              token: like('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'),
              refreshToken: like('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'),
            },
            message: 'Token refreshed successfully',
          },
        },
      };

      return provider.addInteraction(interaction);
    });

    it('should refresh access token', async () => {
      const response = await fetch('http://localhost:1234/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-refresh-token',
        },
        body: JSON.stringify({
          refreshToken: 'valid-refresh-token',
        }),
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.token).toBeDefined();
      expect(data.data.refreshToken).toBeDefined();
    });
  });
});
