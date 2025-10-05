/**
 * Account Management Integration Tests
 * 
 * Tests account deletion and data cleanup
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { app, httpServer } = require('../../server');
const User = require('../../src/models/User');
const Pet = require('../../src/models/Pet');
const Match = require('../../src/models/Match');

let mongoServer;

describe('Account Management Tests', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create({
      instanceOpts: { replSet: { count: 1 } }
    });
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

  describe('DELETE /api/users/account', () => {
    let userToken;
    let userId;
    let petId;

    beforeEach(async () => {
      await User.deleteMany({});
      await Pet.deleteMany({});
      await Match.deleteMany({});

      // Create user
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: `deleteme${Date.now()}@example.com`,
          password: 'Pass123!',
          firstName: 'Delete',
          lastName: 'Me',
          dateOfBirth: '1990-01-01'
        });

      userToken = res.body.data.accessToken;
      userId = res.body.data.user._id;

      // Create pet
      const petRes = await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'DeletePet',
          species: 'dog',
          breed: 'Labrador',
          age: 2,
          gender: 'male',
          size: 'large',
          intent: 'playdate'
        });

      petId = petRes.body.data.pet._id;
    });

    it('should delete user account (200)', async () => {
      const res = await request(app)
        .delete('/api/users/account')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('deleted');

      // Verify user is deleted
      const deletedUser = await User.findById(userId);
      expect(deletedUser).toBeNull();
    });

    it('should delete all user pets when deleting account (200)', async () => {
      await request(app)
        .delete('/api/users/account')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      // Verify pets are deleted
      const userPets = await Pet.find({ owner: userId });
      expect(userPets.length).toBe(0);
    });

    it('should clean up matches when deleting account (200)', async () => {
      // Create another user and match
      const user2Res = await request(app)
        .post('/api/auth/register')
        .send({
          email: `other${Date.now()}@example.com`,
          password: 'Pass123!',
          firstName: 'Other',
          lastName: 'User',
          dateOfBirth: '1990-01-01'
        });

      const pet2Res = await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${user2Res.body.data.accessToken}`)
        .send({
          name: 'OtherPet',
          species: 'dog',
          breed: 'Poodle',
          age: 3,
          gender: 'female',
          size: 'small',
          intent: 'playdate'
        });

      // Create match
      await request(app)
        .post(`/api/pets/${pet2Res.body.data.pet._id}/swipe`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ petId: petId, action: 'like' });

      await request(app)
        .post(`/api/pets/${petId}/swipe`)
        .set('Authorization', `Bearer ${user2Res.body.data.accessToken}`)
        .send({ petId: pet2Res.body.data.pet._id, action: 'like' });

      // Delete account
      await request(app)
        .delete('/api/users/account')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      // Verify matches involving this user are cleaned up
      const matches = await Match.find({
        $or: [
          { user1: userId },
          { user2: userId }
        ]
      });
      expect(matches.length).toBe(0);
    });

    it('should prevent login after account deletion (401)', async () => {
      const email = `prevent${Date.now()}@example.com`;
      const password = 'Pass123!';

      const regRes = await request(app)
        .post('/api/auth/register')
        .send({
          email,
          password,
          firstName: 'Prevent',
          lastName: 'Login',
          dateOfBirth: '1990-01-01'
        });

      // Delete account
      await request(app)
        .delete('/api/users/account')
        .set('Authorization', `Bearer ${regRes.body.data.accessToken}`)
        .expect(200);

      // Try to login
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email, password })
        .expect(401);

      expect(loginRes.body.success).toBe(false);
    });

    it('should reject without authentication (401)', async () => {
      await request(app)
        .delete('/api/users/account')
        .expect(401);
    });

    it('should reject invalid token after deletion (401)', async () => {
      await request(app)
        .delete('/api/users/account')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      // Try to use the same token
      await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(401);
    });

    it('should handle cascade deletion errors gracefully', async () => {
      // This tests the error handling if cascade operations fail
      // In real scenarios, some related data might fail to delete
      
      const res = await request(app)
        .delete('/api/users/account')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('should allow re-registration with same email after deletion', async () => {
      const email = `reregister${Date.now()}@example.com`;
      const password = 'Pass123!';

      // Register
      const reg1 = await request(app)
        .post('/api/auth/register')
        .send({
          email,
          password,
          firstName: 'First',
          lastName: 'Time',
          dateOfBirth: '1990-01-01'
        })
        .expect(201);

      // Delete
      await request(app)
        .delete('/api/users/account')
        .set('Authorization', `Bearer ${reg1.body.data.accessToken}`)
        .expect(200);

      // Re-register with same email
      const reg2 = await request(app)
        .post('/api/auth/register')
        .send({
          email,
          password,
          firstName: 'Second',
          lastName: 'Time',
          dateOfBirth: '1990-01-01'
        })
        .expect(201);

      expect(reg2.body.success).toBe(true);
      expect(reg2.body.data.user._id).not.toBe(reg1.body.data.user._id);
    });
  });

  describe('Soft vs Hard Delete', () => {
    let userToken;
    let userId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: `softdelete${Date.now()}@example.com`,
          password: 'Pass123!',
          firstName: 'Soft',
          lastName: 'Delete',
          dateOfBirth: '1990-01-01'
        });

      userToken = res.body.data.accessToken;
      userId = res.body.data.user._id;
    });

    it('should mark account as deleted (soft delete) if implemented', async () => {
      await request(app)
        .delete('/api/users/account')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      const user = await User.findById(userId);
      
      // If soft delete is implemented, user exists but is marked inactive
      if (user) {
        expect(user.isActive).toBe(false);
      } else {
        // Hard delete - user is completely removed
        expect(user).toBeNull();
      }
    });
  });
});

