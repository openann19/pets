/**
 * Integration tests for admin routes
 * Tests the security enhancements: authentication + admin role requirement
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { app, httpServer } = require('../../server');
const User = require('../../src/models/User');
const { generateTokens } = require('../../src/middleware/auth');

describe('Admin Routes Security', () => {
  let adminUser, regularUser;
  let adminToken, userToken;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pawfectmatch_test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
    if (httpServer && httpServer.listening) {
      httpServer.close();
    }
  });

  beforeEach(async () => {
    // Clear users
    await User.deleteMany({});

    // Create admin user
    adminUser = await User.create({
      email: 'admin@test.com',
      password: 'AdminPass123!',
      firstName: 'Admin',
      lastName: 'User',
      dateOfBirth: new Date('1990-01-01'),
      role: 'admin',
      isActive: true,
      location: {
        type: 'Point',
        coordinates: [0, 0]
      }
    });

    // Create regular user
    regularUser = await User.create({
      email: 'user@test.com',
      password: 'UserPass123!',
      firstName: 'Regular',
      lastName: 'User',
      dateOfBirth: new Date('1990-01-01'),
      role: 'user',
      isActive: true,
      location: {
        type: 'Point',
        coordinates: [0, 0]
      }
    });

    // Generate tokens
    const adminTokens = generateTokens(adminUser._id);
    const userTokens = generateTokens(regularUser._id);

    adminToken = adminTokens.accessToken;
    userToken = userTokens.accessToken;
  });

  describe('GET /api/admin/metrics', () => {
    it('should reject requests without authentication', async () => {
      const res = await request(app)
        .get('/api/admin/metrics')
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('token');
    });

    it('should reject requests from regular users', async () => {
      const res = await request(app)
        .get('/api/admin/metrics')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Admin');
    });

    it('should allow requests from admin users', async () => {
      const res = await request(app)
        .get('/api/admin/metrics')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('requests');
      expect(res.body.data).toHaveProperty('performance');
    });
  });

  describe('POST /api/admin/metrics/reset', () => {
    it('should reject requests without authentication', async () => {
      const res = await request(app)
        .post('/api/admin/metrics/reset')
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it('should reject requests from regular users', async () => {
      const res = await request(app)
        .post('/api/admin/metrics/reset')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Admin');
    });

    it('should allow requests from admin users', async () => {
      const res = await request(app)
        .post('/api/admin/metrics/reset')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('reset');
    });
  });

  describe('GET /api/admin/cache/stats', () => {
    it('should require admin access', async () => {
      // Without token
      await request(app)
        .get('/api/admin/cache/stats')
        .expect(401);

      // With regular user token
      await request(app)
        .get('/api/admin/cache/stats')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      // With admin token
      const res = await request(app)
        .get('/api/admin/cache/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/admin/cache/clear', () => {
    it('should require admin access', async () => {
      // Without token
      await request(app)
        .post('/api/admin/cache/clear')
        .expect(401);

      // With regular user token
      await request(app)
        .post('/api/admin/cache/clear')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      // With admin token
      const res = await request(app)
        .post('/api/admin/cache/clear')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/admin/system/info', () => {
    it('should require admin access', async () => {
      const res = await request(app)
        .get('/api/admin/system/info')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('node');
      expect(res.body.data).toHaveProperty('memory');
      expect(res.body.data).toHaveProperty('cpu');
    });

    it('should reject non-admin users', async () => {
      await request(app)
        .get('/api/admin/system/info')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('Role-based Access Control', () => {
    it('should verify admin role is checked on all admin routes', async () => {
      const adminRoutes = [
        '/api/admin/metrics',
        '/api/admin/cache/stats',
        '/api/admin/system/info'
      ];

      for (const route of adminRoutes) {
        // All should fail for regular users
        const res = await request(app)
          .get(route)
          .set('Authorization', `Bearer ${userToken}`);
        
        expect(res.status).toBe(403);
        expect(res.body.message).toContain('Admin');
      }
    });

    it('should allow admin access to all admin routes', async () => {
      const adminRoutes = [
        '/api/admin/metrics',
        '/api/admin/cache/stats',
        '/api/admin/system/info'
      ];

      for (const route of adminRoutes) {
        const res = await request(app)
          .get(route)
          .set('Authorization', `Bearer ${adminToken}`);
        
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
      }
    });
  });

  describe('User Role Management', () => {
    it('should create users with default user role', async () => {
      const newUser = await User.create({
        email: 'newuser@test.com',
        password: 'NewUserPass123!',
        firstName: 'New',
        lastName: 'User',
        dateOfBirth: new Date('1995-01-01'),
        location: {
          type: 'Point',
          coordinates: [0, 0]
        }
      });

      expect(newUser.role).toBe('user');
    });

    it('should allow creating users with admin role', async () => {
      const newAdmin = await User.create({
        email: 'newadmin@test.com',
        password: 'NewAdminPass123!',
        firstName: 'New',
        lastName: 'Admin',
        dateOfBirth: new Date('1990-01-01'),
        role: 'admin',
        location: {
          type: 'Point',
          coordinates: [0, 0]
        }
      });

      expect(newAdmin.role).toBe('admin');
    });

    it('should only allow valid roles', async () => {
      try {
        await User.create({
          email: 'invalid@test.com',
          password: 'InvalidPass123!',
          firstName: 'Invalid',
          lastName: 'Role',
          dateOfBirth: new Date('1990-01-01'),
          role: 'superadmin', // Invalid role
          location: {
            type: 'Point',
            coordinates: [0, 0]
          }
        });
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.name).toBe('ValidationError');
      }
    });
  });
});

