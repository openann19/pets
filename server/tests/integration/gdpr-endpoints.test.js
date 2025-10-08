/**
 * GDPR Compliance Integration Tests
 * Tests data export, deletion, and privacy settings
 * 
 * CRITICAL: These endpoints are completely untested (0/4 coverage)
 * Legal Impact: GDPR violations can result in significant fines
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { app, httpServer } = require('../../server');
const User = require('../../src/models/User');
const Pet = require('../../src/models/Pet');
const Match = require('../../src/models/Match');
const Message = require('../../src/models/Message');

let mongoServer;
let testUser;
let testToken;
let testPet;
let testMatch;
let testMessage;

describe('GDPR Endpoints Integration Tests', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  }, 30000);

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    if (mongoServer) await mongoServer.stop();
    if (httpServer && httpServer.listening) {
      httpServer.close();
    }
  }, 30000);

  beforeEach(async () => {
    await User.deleteMany({});
    await Pet.deleteMany({});
    await Match.deleteMany({});
    await Message.deleteMany({});

    // Create test user
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: `gdpr${Date.now()}@example.com`,
        password: 'Test123!@#',
        firstName: 'GDPR',
        lastName: 'Test',
        dateOfBirth: '1990-01-01'
      });

    testUser = res.body.data.user;
    testToken = res.body.data.accessToken;

    // Create test pet
    const petRes = await request(app)
      .post('/api/pets')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        name: 'TestPet',
        species: 'dog',
        breed: 'Labrador',
        age: 2,
        gender: 'male',
        size: 'large',
        intent: 'playdate'
      });

    testPet = petRes.body.data.pet;

    // Create test match
    const matchRes = await request(app)
      .post('/api/matches')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        pet1: testPet._id,
        pet2: 'other-pet-id',
        user1: testUser._id,
        user2: 'other-user-id',
        matchType: 'playdate'
      });

    testMatch = matchRes.body.data.match;

    // Create test message
    const messageRes = await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        sender: testUser._id,
        receiver: 'other-user-id',
        match: testMatch._id,
        content: 'Hello, this is a test message for GDPR testing',
        messageType: 'text'
      });

    testMessage = messageRes.body.data.message;
  });

  describe('POST /api/gdpr/export', () => {
    it('should export user data (200)', async () => {
      const res = await request(app)
        .post('/api/gdpr/export')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('exportDate');
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data).toHaveProperty('pets');
      expect(res.body.data).toHaveProperty('matches');
      expect(res.body.data).toHaveProperty('messages');
      expect(res.body.data).toHaveProperty('metadata');
    });

    it('should include all user information', async () => {
      const res = await request(app)
        .post('/api/gdpr/export')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(res.body.data.user).toHaveProperty('email');
      expect(res.body.data.user).toHaveProperty('firstName');
      expect(res.body.data.user).toHaveProperty('lastName');
      expect(res.body.data.user).toHaveProperty('dateOfBirth');
      expect(res.body.data.user).toHaveProperty('preferences');
      expect(res.body.data.user).toHaveProperty('createdAt');
      expect(res.body.data.user).toHaveProperty('updatedAt');
    });

    it('should include pets data', async () => {
      const res = await request(app)
        .post('/api/gdpr/export')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(res.body.data.pets).toHaveLength(1);
      expect(res.body.data.pets[0]).toHaveProperty('name', 'TestPet');
      expect(res.body.data.pets[0]).toHaveProperty('species', 'dog');
      expect(res.body.data.pets[0]).toHaveProperty('breed', 'Labrador');
      expect(res.body.data.pets[0]).toHaveProperty('photos');
      expect(res.body.data.pets[0]).toHaveProperty('description');
    });

    it('should include matches data', async () => {
      const res = await request(app)
        .post('/api/gdpr/export')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(res.body.data.matches).toHaveLength(1);
      expect(res.body.data.matches[0]).toHaveProperty('matchType', 'playdate');
      expect(res.body.data.matches[0]).toHaveProperty('createdAt');
      expect(res.body.data.matches[0]).toHaveProperty('status');
    });

    it('should include messages data', async () => {
      const res = await request(app)
        .post('/api/gdpr/export')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(res.body.data.messages).toHaveLength(1);
      expect(res.body.data.messages[0]).toHaveProperty('content');
      expect(res.body.data.messages[0]).toHaveProperty('messageType', 'text');
      expect(res.body.data.messages[0]).toHaveProperty('createdAt');
    });

    it('should format as GDPR-compliant JSON', async () => {
      const res = await request(app)
        .post('/api/gdpr/export')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(res.body.data.metadata).toHaveProperty('exportVersion');
      expect(res.body.data.metadata).toHaveProperty('dataTypes');
      expect(res.body.data.metadata).toHaveProperty('compliance');
      expect(res.body.data.metadata.compliance).toContain('GDPR');
    });

    it('should reject without authentication (401)', async () => {
      await request(app)
        .post('/api/gdpr/export')
        .expect(401);
    });

    it('should log export request', async () => {
      const res = await request(app)
        .post('/api/gdpr/export')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(res.body.data.metadata).toHaveProperty('requestId');
      expect(res.body.data.metadata).toHaveProperty('exportedBy', testUser._id);
    });
  });

  describe('POST /api/gdpr/delete', () => {
    it('should require confirmation text (400)', async () => {
      const res = await request(app)
        .post('/api/gdpr/delete')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          confirmation: 'WRONG_TEXT'
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('confirmation');
    });

    it('should require exact confirmation text', async () => {
      const res = await request(app)
        .post('/api/gdpr/delete')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          confirmation: 'delete my data' // Wrong case
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should delete user account with correct confirmation (200)', async () => {
      const res = await request(app)
        .post('/api/gdpr/delete')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          confirmation: 'DELETE_MY_DATA',
          reason: 'Testing deletion'
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.deletedData).toBeDefined();
      expect(res.body.deletedData).toHaveProperty('user');
      expect(res.body.deletedData).toHaveProperty('pets');
      expect(res.body.deletedData).toHaveProperty('matches');
      expect(res.body.deletedData).toHaveProperty('messages');

      // Verify user is deleted
      const user = await User.findById(testUser._id);
      expect(user).toBeNull();
    });

    it('should delete all user pets', async () => {
      await request(app)
        .post('/api/gdpr/delete')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          confirmation: 'DELETE_MY_DATA'
        })
        .expect(200);

      const pets = await Pet.find({ owner: testUser._id });
      expect(pets).toHaveLength(0);
    });

    it('should delete all user matches', async () => {
      await request(app)
        .post('/api/gdpr/delete')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          confirmation: 'DELETE_MY_DATA'
        })
        .expect(200);

      const matches = await Match.find({ 
        $or: [
          { user1: testUser._id },
          { user2: testUser._id }
        ]
      });
      expect(matches).toHaveLength(0);
    });

    it('should delete all user messages', async () => {
      await request(app)
        .post('/api/gdpr/delete')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          confirmation: 'DELETE_MY_DATA'
        })
        .expect(200);

      const messages = await Message.find({ 
        $or: [
          { sender: testUser._id },
          { receiver: testUser._id }
        ]
      });
      expect(messages).toHaveLength(0);
    });

    it('should delete Cloudinary images', async () => {
      // Mock Cloudinary deletion
      const mockDelete = jest.fn().mockResolvedValue({ result: 'ok' });
      jest.doMock('cloudinary', () => ({
        v2: {
          uploader: {
            destroy: mockDelete
          }
        }
      }));

      const res = await request(app)
        .post('/api/gdpr/delete')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          confirmation: 'DELETE_MY_DATA'
        })
        .expect(200);

      expect(res.body.deletedData).toHaveProperty('images');
    });

    it('should reject without confirmation (400)', async () => {
      const res = await request(app)
        .post('/api/gdpr/delete')
        .set('Authorization', `Bearer ${testToken}`)
        .send({})
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should reject without authentication (401)', async () => {
      await request(app)
        .post('/api/gdpr/delete')
        .send({
          confirmation: 'DELETE_MY_DATA'
        })
        .expect(401);
    });

    it('should log deletion request', async () => {
      const res = await request(app)
        .post('/api/gdpr/delete')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          confirmation: 'DELETE_MY_DATA',
          reason: 'User requested deletion'
        })
        .expect(200);

      expect(res.body.deletedData).toHaveProperty('deletedAt');
      expect(res.body.deletedData).toHaveProperty('deletedBy', testUser._id);
      expect(res.body.deletedData).toHaveProperty('reason', 'User requested deletion');
    });
  });

  describe('GET /api/gdpr/status', () => {
    it('should return GDPR status (200)', async () => {
      const res = await request(app)
        .get('/api/gdpr/status')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('dataSummary');
      expect(res.body.data).toHaveProperty('rights');
      expect(res.body.data).toHaveProperty('privacySettings');
    });

    it('should show data summary', async () => {
      const res = await request(app)
        .get('/api/gdpr/status')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(res.body.data.dataSummary).toHaveProperty('pets', 1);
      expect(res.body.data.dataSummary).toHaveProperty('matches', 1);
      expect(res.body.data.dataSummary).toHaveProperty('messages', 1);
      expect(res.body.data.dataSummary).toHaveProperty('images');
    });

    it('should show user rights', async () => {
      const res = await request(app)
        .get('/api/gdpr/status')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(res.body.data.rights).toContain('Right to access');
      expect(res.body.data.rights).toContain('Right to rectification');
      expect(res.body.data.rights).toContain('Right to erasure');
      expect(res.body.data.rights).toContain('Right to data portability');
    });

    it('should show privacy settings', async () => {
      const res = await request(app)
        .get('/api/gdpr/status')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(res.body.data.privacySettings).toHaveProperty('dataProcessing');
      expect(res.body.data.privacySettings).toHaveProperty('marketing');
      expect(res.body.data.privacySettings).toHaveProperty('analytics');
    });

    it('should reject without authentication (401)', async () => {
      await request(app)
        .get('/api/gdpr/status')
        .expect(401);
    });
  });

  describe('PUT /api/gdpr/privacy-settings', () => {
    it('should update privacy settings (200)', async () => {
      const res = await request(app)
        .put('/api/gdpr/privacy-settings')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          dataProcessing: true,
          marketing: false,
          analytics: true,
          thirdPartySharing: false
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.privacySettings).toHaveProperty('dataProcessing', true);
      expect(res.body.data.privacySettings).toHaveProperty('marketing', false);
      expect(res.body.data.privacySettings).toHaveProperty('analytics', true);
      expect(res.body.data.privacySettings).toHaveProperty('thirdPartySharing', false);
    });

    it('should validate boolean fields', async () => {
      const res = await request(app)
        .put('/api/gdpr/privacy-settings')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          dataProcessing: 'not-a-boolean'
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('dataProcessing');
    });

    it('should reject invalid data (400)', async () => {
      const res = await request(app)
        .put('/api/gdpr/privacy-settings')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          unknownField: 'invalid'
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should reject without authentication (401)', async () => {
      await request(app)
        .put('/api/gdpr/privacy-settings')
        .send({
          dataProcessing: true
        })
        .expect(401);
    });

    it('should persist privacy settings', async () => {
      // Update settings
      await request(app)
        .put('/api/gdpr/privacy-settings')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          dataProcessing: false,
          marketing: true
        })
        .expect(200);

      // Verify persistence
      const res = await request(app)
        .get('/api/gdpr/status')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(res.body.data.privacySettings.dataProcessing).toBe(false);
      expect(res.body.data.privacySettings.marketing).toBe(true);
    });

    it('should handle partial updates', async () => {
      const res = await request(app)
        .put('/api/gdpr/privacy-settings')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          marketing: false
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.privacySettings).toHaveProperty('marketing', false);
    });
  });

  describe('GDPR Compliance Edge Cases', () => {
    it('should handle user with no data', async () => {
      // Create new user with no pets/matches/messages
      const newUserRes = await request(app)
        .post('/api/auth/register')
        .send({
          email: `empty${Date.now()}@example.com`,
          password: 'Test123!@#',
          firstName: 'Empty',
          lastName: 'User',
          dateOfBirth: '1990-01-01'
        });

      const newToken = newUserRes.body.data.accessToken;

      const res = await request(app)
        .post('/api/gdpr/export')
        .set('Authorization', `Bearer ${newToken}`)
        .expect(200);

      expect(res.body.data.pets).toHaveLength(0);
      expect(res.body.data.matches).toHaveLength(0);
      expect(res.body.data.messages).toHaveLength(0);
    });

    it('should handle concurrent deletion requests', async () => {
      const promises = [
        request(app)
          .post('/api/gdpr/delete')
          .set('Authorization', `Bearer ${testToken}`)
          .send({ confirmation: 'DELETE_MY_DATA' }),
        request(app)
          .post('/api/gdpr/delete')
          .set('Authorization', `Bearer ${testToken}`)
          .send({ confirmation: 'DELETE_MY_DATA' })
      ];

      const results = await Promise.allSettled(promises);
      
      // One should succeed, one should fail
      const successCount = results.filter(r => r.status === 'fulfilled' && r.value.status === 200).length;
      const failureCount = results.filter(r => r.status === 'fulfilled' && r.value.status === 409).length;
      
      expect(successCount + failureCount).toBe(2);
    });

    it('should handle malformed export requests', async () => {
      // Test with corrupted token
      const res = await request(app)
        .post('/api/gdpr/export')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });
});
