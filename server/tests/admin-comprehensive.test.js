/**
 * ULTRA DEEP COMPREHENSIVE ADMIN SYSTEM TESTS
 * Tests every aspect of the admin panel to catch all errors
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock app setup
let app;
let adminToken;
let moderatorToken;
let supportToken;
let analystToken;
let billingToken;
let userToken;
let mongoServer;

const User = require('../src/models/User');
const AdminActivityLog = require('../src/models/AdminActivityLog');

// Test users
const testUsers = {
  admin: {
    email: 'test-admin@test.com',
    password: 'TestAdmin123!',
    firstName: 'Test',
    lastName: 'Admin',
    role: 'administrator',
    dateOfBirth: new Date('1990-01-01'),
    status: 'active'
  },
  moderator: {
    email: 'test-moderator@test.com',
    password: 'TestMod123!',
    firstName: 'Test',
    lastName: 'Moderator',
    role: 'moderator',
    dateOfBirth: new Date('1991-01-01'),
    status: 'active'
  },
  support: {
    email: 'test-support@test.com',
    password: 'TestSupport123!',
    firstName: 'Test',
    lastName: 'Support',
    role: 'support',
    dateOfBirth: new Date('1992-01-01'),
    status: 'active'
  },
  analyst: {
    email: 'test-analyst@test.com',
    password: 'TestAnalyst123!',
    firstName: 'Test',
    lastName: 'Analyst',
    role: 'analyst',
    dateOfBirth: new Date('1993-01-01'),
    status: 'active'
  },
  billing: {
    email: 'test-billing@test.com',
    password: 'TestBilling123!',
    firstName: 'Test',
    lastName: 'Billing',
    role: 'billing_admin',
    dateOfBirth: new Date('1994-01-01'),
    status: 'active'
  },
  user: {
    email: 'test-user@test.com',
    password: 'TestUser123!',
    firstName: 'Test',
    lastName: 'User',
    role: 'user',
    dateOfBirth: new Date('1995-01-01'),
    status: 'active'
  }
};

jest.setTimeout(30000);

describe('🔍 ULTRA DEEP ADMIN SYSTEM TESTS', () => {

  beforeAll(async () => {
    // Set test environment variables
    process.env.JWT_SECRET = 'test-jwt-secret-for-admin-tests-32-chars-minimum';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-for-admin-tests-32-chars-min';
    process.env.NODE_ENV = 'test';

    // Start in-memory MongoDB for isolated tests
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    // Create test users
    for (const [key, userData] of Object.entries(testUsers)) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await User.create({
        ...userData,
        password: hashedPassword,
        isEmailVerified: true
      });

      // Generate token
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Store tokens
      if (key === 'admin') adminToken = token;
      if (key === 'moderator') moderatorToken = token;
      if (key === 'support') supportToken = token;
      if (key === 'analyst') analystToken = token;
      if (key === 'billing') billingToken = token;
      if (key === 'user') userToken = token;
    }

    // Load express app
    app = require('../server');
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({ email: { $regex: /test-.*@test.com/ } });
    await AdminActivityLog.deleteMany({});
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  // ============================================================================
  // SECTION 1: AUTHENTICATION & AUTHORIZATION TESTS
  // ============================================================================

  describe('🔐 Authentication & Authorization', () => {

    test('Should reject requests without token', async () => {
      const response = await request(app)
        .get('/api/admin/analytics')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access token required');
    });

    test('Should reject requests with invalid token', async () => {
      const response = await request(app)
        .get('/api/admin/analytics')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.message).toBe('Invalid token');
    });

    test('Should reject non-admin users', async () => {
      const response = await request(app)
        .get('/api/admin/analytics')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.message).toBe('Admin access required');
    });

    test('Should accept admin users', async () => {
      const response = await request(app)
        .get('/api/admin/analytics')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  // ============================================================================
  // SECTION 2: RBAC PERMISSION TESTS
  // ============================================================================

  describe('🛡️ RBAC Permission System', () => {

    describe('Administrator Role', () => {
      test('Can access analytics', async () => {
        await request(app)
          .get('/api/admin/analytics')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);
      });

      test('Can access audit logs', async () => {
        await request(app)
          .get('/api/admin/audit-logs')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);
      });

      test('Can access Stripe config', async () => {
        await request(app)
          .get('/api/admin/stripe/config')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);
      });

      test('Can configure Stripe', async () => {
        await request(app)
          .post('/api/admin/stripe/config')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            secretKey: 'sk_test_' + 'x'.repeat(100),
            publishableKey: 'pk_test_' + 'x'.repeat(100)
          })
          .expect(200);
      });
    });

    describe('Moderator Role', () => {
      test('Can access analytics', async () => {
        await request(app)
          .get('/api/admin/analytics')
          .set('Authorization', `Bearer ${moderatorToken}`)
          .expect(200);
      });

      test('Cannot configure Stripe', async () => {
        await request(app)
          .post('/api/admin/stripe/config')
          .set('Authorization', `Bearer ${moderatorToken}`)
          .send({
            secretKey: 'sk_test_xxx',
            publishableKey: 'pk_test_xxx'
          })
          .expect(403);
      });
    });

    describe('Support Role', () => {
      test('Can access analytics (read-only)', async () => {
        await request(app)
          .get('/api/admin/analytics')
          .set('Authorization', `Bearer ${supportToken}`)
          .expect(200);
      });

      test('Cannot access audit logs', async () => {
        await request(app)
          .get('/api/admin/audit-logs')
          .set('Authorization', `Bearer ${supportToken}`)
          .expect(403);
      });

      test('Cannot configure Stripe', async () => {
        await request(app)
          .post('/api/admin/stripe/config')
          .set('Authorization', `Bearer ${supportToken}`)
          .send({})
          .expect(403);
      });
    });

    describe('Analyst Role', () => {
      test('Can access analytics', async () => {
        await request(app)
          .get('/api/admin/analytics')
          .set('Authorization', `Bearer ${analystToken}`)
          .expect(200);
      });

      test('Cannot access Stripe', async () => {
        await request(app)
          .get('/api/admin/stripe/config')
          .set('Authorization', `Bearer ${analystToken}`)
          .expect(403);
      });
    });

    describe('Billing Admin Role', () => {
      test('Can access Stripe config', async () => {
        await request(app)
          .get('/api/admin/stripe/config')
          .set('Authorization', `Bearer ${billingToken}`)
          .expect(200);
      });

      test('Can access analytics', async () => {
        await request(app)
          .get('/api/admin/analytics')
          .set('Authorization', `Bearer ${billingToken}`)
          .expect(200);
      });
    });
  });

  // ============================================================================
  // SECTION 3: ANALYTICS ENDPOINT TESTS
  // ============================================================================

  describe('📊 Analytics Endpoint', () => {

    test('Returns valid analytics structure', async () => {
      const response = await request(app)
        .get('/api/admin/analytics')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('analytics');
      expect(response.body.analytics).toHaveProperty('users');
      expect(response.body.analytics).toHaveProperty('pets');
      expect(response.body.analytics).toHaveProperty('matches');
      expect(response.body.analytics).toHaveProperty('messages');
    });

    test('User stats have correct structure', async () => {
      const response = await request(app)
        .get('/api/admin/analytics')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const { users } = response.body.analytics;
      expect(users).toHaveProperty('total');
      expect(users).toHaveProperty('active');
      expect(users).toHaveProperty('suspended');
      expect(users).toHaveProperty('banned');
      expect(users).toHaveProperty('verified');
      expect(users).toHaveProperty('recent24h');
      expect(users).toHaveProperty('growth');
      expect(users).toHaveProperty('trend');
    });

    test('Returns numeric values', async () => {
      const response = await request(app)
        .get('/api/admin/analytics')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const { users } = response.body.analytics;
      expect(typeof users.total).toBe('number');
      expect(typeof users.active).toBe('number');
      expect(typeof users.growth).toBe('number');
    });

    test('Handles time range parameter', async () => {
      const response = await request(app)
        .get('/api/admin/analytics?timeRange=7d')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  // ============================================================================
  // SECTION 4: AUDIT LOG TESTS
  // ============================================================================

  describe('📝 Audit Logs', () => {

    test('Returns audit logs with pagination', async () => {
      const response = await request(app)
        .get('/api/admin/audit-logs?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('logs');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.logs)).toBe(true);
    });

    test('Pagination has correct structure', async () => {
      const response = await request(app)
        .get('/api/admin/audit-logs')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const { pagination } = response.body;
      expect(pagination).toHaveProperty('page');
      expect(pagination).toHaveProperty('limit');
      expect(pagination).toHaveProperty('total');
      expect(pagination).toHaveProperty('pages');
    });

    test('Filters by action type', async () => {
      const response = await request(app)
        .get('/api/admin/audit-logs?action=VIEW_ANALYTICS')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('Filters by date range', async () => {
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();

      const response = await request(app)
        .get(`/api/admin/audit-logs?startDate=${startDate}&endDate=${endDate}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  // ============================================================================
  // SECTION 5: RATE LIMITING TESTS
  // ============================================================================

  describe('⚡ Rate Limiting', () => {

    test('Allows requests under limit', async () => {
      for (let i = 0; i < 10; i++) {
        await request(app)
          .get('/api/admin/analytics')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);
      }
    });

    test('Blocks requests over limit', async () => {
      // Make 101 requests (limit is 100 per 15 minutes)
      for (let i = 0; i < 101; i++) {
        const response = await request(app)
          .get('/api/admin/analytics')
          .set('Authorization', `Bearer ${adminToken}`);

        if (i < 100) {
          expect(response.status).toBe(200);
        } else {
          expect(response.status).toBe(429);
        }
      }
    }, 30000); // Increase timeout for this test
  });

  // ============================================================================
  // SECTION 6: ERROR HANDLING TESTS
  // ============================================================================

  describe('🚨 Error Handling', () => {

    test('Handles invalid query parameters gracefully', async () => {
      const response = await request(app)
        .get('/api/admin/analytics?timeRange=invalid')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200); // Should default to 30d

      expect(response.body.success).toBe(true);
    });

    test('Handles malformed JSON in request body', async () => {
      await request(app)
        .post('/api/admin/stripe/config')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);
    });

    test('Returns proper error structure', async () => {
      const response = await request(app)
        .get('/api/admin/analytics')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('message');
    });
  });

  // ============================================================================
  // SECTION 7: DATA VALIDATION TESTS
  // ============================================================================

  describe('✅ Data Validation', () => {

    test('Validates Stripe configuration input', async () => {
      const response = await request(app)
        .post('/api/admin/stripe/config')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          secretKey: '', // Empty key
          publishableKey: ''
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('Validates pagination parameters', async () => {
      const response = await request(app)
        .get('/api/admin/audit-logs?page=-1&limit=1000')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200); // Should use defaults

      expect(response.body.success).toBe(true);
    });
  });

  // ============================================================================
  // SECTION 8: SECURITY TESTS
  // ============================================================================

  describe('🔒 Security', () => {

    test('Does not expose sensitive data in responses', async () => {
      const response = await request(app)
        .get('/api/admin/stripe/config')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Secret keys should be masked
      if (response.body.secretKey) {
        expect(response.body.secretKey).toContain('***');
      }
    });

    test('Logs all admin actions', async () => {
      const beforeCount = await AdminActivityLog.countDocuments();

      await request(app)
        .get('/api/admin/analytics')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const afterCount = await AdminActivityLog.countDocuments();
      expect(afterCount).toBeGreaterThan(beforeCount);
    });

    test('Prevents SQL injection in query parameters', async () => {
      const response = await request(app)
        .get('/api/admin/audit-logs?action=\'; DROP TABLE users; --')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('Sanitizes user input', async () => {
      const response = await request(app)
        .post('/api/admin/stripe/config')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          secretKey: '<script>alert("xss")</script>',
          publishableKey: 'pk_test_xxx'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message || '').not.toContain('<script>');
    });
  });

  // ============================================================================
  // SECTION 9: PERFORMANCE TESTS
  // ============================================================================

  describe('⚡ Performance', () => {

    test('Analytics endpoint responds within 2 seconds', async () => {
      const start = Date.now();

      await request(app)
        .get('/api/admin/analytics')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(2000);
    });

    test('Handles concurrent requests', async () => {
      const requests = Array(10).fill().map(() =>
        request(app)
          .get('/api/admin/analytics')
          .set('Authorization', `Bearer ${adminToken}`)
      );

      const responses = await Promise.all(requests);
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });

  // ============================================================================
  // SECTION 10: INTEGRATION TESTS
  // ============================================================================

  describe('🔗 Integration Tests', () => {

    test('Complete admin workflow', async () => {
      // 1. Login
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUsers.admin.email,
          password: testUsers.admin.password
        })
        .expect(200);

      const token = loginResponse.body.token;

      // 2. Access analytics
      const analyticsResponse = await request(app)
        .get('/api/admin/analytics')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(analyticsResponse.body.success).toBe(true);

      // 3. View audit logs
      const auditResponse = await request(app)
        .get('/api/admin/audit-logs')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(auditResponse.body.success).toBe(true);

      // 4. Check that actions were logged
      const logs = auditResponse.body.logs;
      expect(logs.length).toBeGreaterThan(0);
    });
  });
});

// Export for use in other test files
module.exports = {
  testUsers,
  adminToken,
  moderatorToken,
  supportToken,
  analystToken,
  billingToken,
  userToken
};
