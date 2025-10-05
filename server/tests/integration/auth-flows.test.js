/**
 * Authentication Flows Integration Tests
 * 
 * Tests password reset, email verification, and token refresh
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { app, httpServer } = require('../../server');
const User = require('../../src/models/User');

let mongoServer;

describe('Authentication Flows Tests', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  }, 30000);

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
    if (httpServer && httpServer.listening) {
      httpServer.close();
    }
  }, 30000);

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/auth/refresh-token', () => {
    let refreshToken;
    let accessToken;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: `refresh${Date.now()}@example.com`,
          password: 'Pass123!',
          firstName: 'Refresh',
          lastName: 'User',
          dateOfBirth: '1990-01-01'
        });
      
      refreshToken = res.body.data.refreshToken;
      accessToken = res.body.data.accessToken;
    });

    // Refresh test
    it('should refresh access token with valid refresh token (200)', async () => {
      // Login to get tokens
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password' });
      const oldAccessToken = loginRes.body.data.accessToken;
      const refreshToken = loginRes.body.data.refreshToken;

      // Refresh
      const res = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).not.toBe(oldAccessToken); // New token different
      expect(res.body.data.refreshToken).not.toBe(refreshToken); // Rotated refresh

      // Reuse old refresh - should 401
      const res2 = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken })
        .expect(401);

      expect(res2.body.success).toBe(false);
      expect(res2.body.message).toBe('Invalid refresh token');
    });

    it('should reject without refresh token (400)', async () => {
      const res = await request(app)
        .post('/api/auth/refresh-token')
        .send({})
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Refresh token');
    });

    it('should reject invalid refresh token (401)', async () => {
      const res = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken: 'invalid-token-123' })
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it('should reject expired refresh token (401)', async () => {
      // Create a user with expired token
      const user = await User.create({
        email: `expired${Date.now()}@example.com`,
        password: 'Pass123!',
        firstName: 'Expired',
        lastName: 'User',
        dateOfBirth: '1990-01-01'
      });

      // Add an old refresh token (this is a simplification - in real scenario would use JWT with past expiry)
      user.refreshTokens.push('expired-token');
      await user.save();

      const res = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken: 'expired-token' })
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it('should invalidate old refresh token after use (token rotation)', async () => {
      // Get new tokens
      const res1 = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken })
        .expect(200);

      const newRefreshToken = res1.body.data.refreshToken;

      // Try to use old refresh token again
      const res2 = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken })
        .expect(401);

      expect(res2.body.success).toBe(false);

      // New refresh token should work
      await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken: newRefreshToken })
        .expect(200);
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'reset@example.com',
          password: 'OldPass123!',
          firstName: 'Reset',
          lastName: 'User',
          dateOfBirth: '1990-01-01'
        });
    });

    it('should send password reset email for existing user (200)', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'reset@example.com' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('reset');

      // Verify reset token was created
      const user = await User.findOne({ email: 'reset@example.com' });
      expect(user.passwordResetToken).toBeDefined();
      expect(user.passwordResetExpires).toBeDefined();
      expect(new Date(user.passwordResetExpires).getTime()).toBeGreaterThan(Date.now());
    });

    it('should return success even for non-existent email (security)', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('reset');
    });

    it('should reject invalid email format (400)', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'invalid-email' })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    // Forgot without email - 400
    it('should reject without email (400)', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({})
        .expect(400); // Now 400 with validation

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('email');
    });
  });

  describe('POST /api/auth/reset-password', () => {
    let resetToken;
    let userId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: `reset${Date.now()}@example.com`,
          password: 'OldPass123!',
          firstName: 'Reset',
          lastName: 'User',
          dateOfBirth: '1990-01-01'
        });

      userId = res.body.data.user._id;

      // Request password reset to get token
      await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: res.body.data.user.email });

      // Get the reset token from database
      const user = await User.findById(userId);
      resetToken = user.passwordResetToken;
    });

    // Reset valid - 200
    it('should reset password with valid token (200)', async () => {
      const newPassword = 'NewPass123!';

      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          password: newPassword
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('reset');

      // Verify can login with new password
      const user = await User.findById(userId);
      await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: newPassword
        })
        .expect(200);
    });

    it('should clear reset token after successful reset', async () => {
      await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          password: 'NewPass123!'
        })
        .expect(200);

      const user = await User.findById(userId);
      expect(user.passwordResetToken).toBeUndefined();
      expect(user.passwordResetExpires).toBeUndefined();
    });

    // Invalid token - 400
    it('should reject invalid token (400)', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'invalid',
          password: 'NewPass123!'
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid');
    });

    // Expired token - 400 (set expires in past)
    it('should reject expired token (400)', async () => {
      // Manually expire the token
      const user = await User.findById(userId);
      user.passwordResetExpires = new Date(Date.now() - 1000); // 1 second ago
      await user.save();

      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          password: 'NewPass123!'
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('expired');
    });

    // Weak password - 400
    it('should reject weak password (400)', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          password: '123' // Too short
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    // No password - 400
    it('should reject without password (400)', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('New password required');
    });
  });

  describe('POST /api/auth/verify-email', () => {
    let verificationToken;
    let userEmail;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: `verify${Date.now()}@example.com`,
          password: 'Pass123!',
          firstName: 'Verify',
          lastName: 'User',
          dateOfBirth: '1990-01-01'
        });

      userEmail = res.body.data.user.email;

      // Get verification token from database
      const user = await User.findOne({ email: userEmail });
      verificationToken = user.emailVerificationToken;
    });

    it('should verify email with valid token (200)', async () => {
      const res = await request(app)
        .post('/api/auth/verify-email')
        .send({ token: verificationToken })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('verified');

      // Verify user is now verified
      const user = await User.findOne({ email: userEmail });
      expect(user.isEmailVerified).toBe(true);
      expect(user.emailVerificationToken).toBeUndefined();
    });

    it('should reject invalid token (400)', async () => {
      const res = await request(app)
        .post('/api/auth/verify-email')
        .send({ token: 'invalid-token-123' })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid');
    });

    it('should reject expired token (400)', async () => {
      // Manually expire the token
      const user = await User.findOne({ email: userEmail });
      user.emailVerificationExpires = new Date(Date.now() - 1000);
      await user.save();

      const res = await request(app)
        .post('/api/auth/verify-email')
        .send({ token: verificationToken })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('expired');
    });

    it('should handle already verified email gracefully', async () => {
      // Verify once
      await request(app)
        .post('/api/auth/verify-email')
        .send({ token: verificationToken })
        .expect(200);

      // Try to verify again
      const res = await request(app)
        .post('/api/auth/verify-email')
        .send({ token: verificationToken })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should reject without token (400)', async () => {
      const res = await request(app)
        .post('/api/auth/verify-email')
        .send({})
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });
});

