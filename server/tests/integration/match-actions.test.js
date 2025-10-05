/**
 * Match Actions Integration Tests
 * 
 * Tests block, favorite, and archive match functionality
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { app, httpServer } = require('../../server');
const User = require('../../src/models/User');
const Pet = require('../../src/models/Pet');
const Match = require('../../src/models/Match');

let mongoServer;
let user1Token, user2Token;
let matchId;

describe('Match Actions Tests', () => {
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

  beforeEach(async () => {
    // Clean and recreate match for each test
    await User.deleteMany({});
    await Pet.deleteMany({});
    await Match.deleteMany({});

    // Create users and pets
    const user1Res = await request(app)
      .post('/api/auth/register')
      .send({
        email: `user1${Date.now()}@example.com`,
        password: 'Pass123!',
        firstName: 'User',
        lastName: 'One',
        dateOfBirth: '1990-01-01'
      });
    user1Token = user1Res.body.data.accessToken;

    const user2Res = await request(app)
      .post('/api/auth/register')
      .send({
        email: `user2${Date.now()}@example.com`,
        password: 'Pass123!',
        firstName: 'User',
        lastName: 'Two',
        dateOfBirth: '1990-01-01'
      });
    user2Token = user2Res.body.data.accessToken;

    const pet1Res = await request(app)
      .post('/api/pets')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        name: 'Pet1',
        species: 'cat',
        breed: 'Persian',
        age: 2,
        gender: 'male',
        size: 'small',
        intent: 'adoption'
      });

    const pet2Res = await request(app)
      .post('/api/pets')
      .set('Authorization', `Bearer ${user2Token}`)
      .send({
        name: 'Pet2',
        species: 'cat',
        breed: 'Siamese',
        age: 3,
        gender: 'female',
        size: 'small',
        intent: 'adoption'
      });

    // Create match
    await request(app)
      .post(`/api/pets/${pet2Res.body.data.pet._id}/swipe`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ petId: pet1Res.body.data.pet._id, action: 'like' });

    const matchRes = await request(app)
      .post(`/api/pets/${pet1Res.body.data.pet._id}/swipe`)
      .set('Authorization', `Bearer ${user2Token}`)
      .send({ petId: pet2Res.body.data.pet._id, action: 'like' });

    matchId = matchRes.body.data.match._id;
  });

  describe('PATCH /api/matches/:matchId/block', () => {
    it('should block a match (200)', async () => {
      console.log('🔴 TEST: Blocking match with ID:', matchId);
      const res = await request(app)
        .patch(`/api/matches/${matchId}/block`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('blocked');

      // Small delay to ensure database write is committed
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify match is blocked - use lean() to bypass Mongoose caching
      const match = await Match.findById(matchId).lean();
      // The requesting user (user1Token) is actually user2 in this match
      expect(match.userActions.user2.isBlocked).toBe(true);
    });

    it('should prevent blocked user from seeing match', async () => {
      await request(app)
        .patch(`/api/matches/${matchId}/block`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      // Verify user1 can't see the match anymore
      const res = await request(app)
        .get('/api/matches')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      const matchIds = res.body.data.matches.map(m => m._id);
      expect(matchIds).not.toContain(matchId);
    });

    it('should reject without authentication (401)', async () => {
      await request(app)
        .patch(`/api/matches/${matchId}/block`)
        .expect(401);
    });

    it('should return 404 for non-existent match', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      await request(app)
        .patch(`/api/matches/${fakeId}/block`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(404);
    });

    it('should prevent unauthorized user from blocking', async () => {
      // Create a third user
      const user3Res = await request(app)
        .post('/api/auth/register')
        .send({
          email: `user3${Date.now()}@example.com`,
          password: 'Pass123!',
          firstName: 'User',
          lastName: 'Three',
          dateOfBirth: '1990-01-01'
        });

      await request(app)
        .patch(`/api/matches/${matchId}/block`)
        .set('Authorization', `Bearer ${user3Res.body.data.accessToken}`)
        .expect(404);
    });
  });

  describe('PATCH /api/matches/:matchId/favorite', () => {
    it('should favorite a match (200)', async () => {
      const res = await request(app)
        .patch(`/api/matches/${matchId}/favorite`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('favorite');

      // Small delay to ensure database write is committed
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify match is isFavorite - use lean() to bypass Mongoose caching
      const match = await Match.findById(matchId).lean();
      // The requesting user (user1Token) is actually user2 in this match
      expect(match.userActions.user2.isFavorite).toBe(true);
    });

    it('should toggle favorite status', async () => {
      // Favorite
      await request(app)
        .patch(`/api/matches/${matchId}/favorite`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      // Small delay to ensure database write is committed
      await new Promise(resolve => setTimeout(resolve, 100));

      let match = await Match.findById(matchId).lean();
      expect(match.userActions.user2.isFavorite).toBe(true);

      // Unfavorite
      await request(app)
        .patch(`/api/matches/${matchId}/favorite`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      match = await Match.findById(matchId);
      expect(match.userActions.user1.isFavorite).toBe(false);
    });

    it('should reject without authentication (401)', async () => {
      await request(app)
        .patch(`/api/matches/${matchId}/favorite`)
        .expect(401);
    });

    it('should return 404 for non-existent match', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      await request(app)
        .patch(`/api/matches/${fakeId}/favorite`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(404);
    });
  });

  describe('PATCH /api/matches/:matchId/archive', () => {
    it('should archive a match (200)', async () => {
      const res = await request(app)
        .patch(`/api/matches/${matchId}/archive`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('archive');

      // Small delay to ensure database write is committed
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify match is isArchived - use lean() to bypass Mongoose caching
      const match = await Match.findById(matchId).lean();
      // The requesting user (user1Token) is actually user2 in this match
      expect(match.userActions.user2.isArchived).toBe(true);
    });

    it('should toggle archive status', async () => {
      // Archive
      await request(app)
        .patch(`/api/matches/${matchId}/archive`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      // Small delay to ensure database write is committed
      await new Promise(resolve => setTimeout(resolve, 100));

      let match = await Match.findById(matchId).lean();
      expect(match.userActions.user2.isArchived).toBe(true);

      // Unarchive
      await request(app)
        .patch(`/api/matches/${matchId}/archive`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      match = await Match.findById(matchId);
      expect(match.userActions.user1.isArchived).toBe(false);
    });

    it('should hide isArchived matches from default list', async () => {
      await request(app)
        .patch(`/api/matches/${matchId}/archive`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      // Verify user1 doesn't see isArchived match
      const res = await request(app)
        .get('/api/matches')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      const activeMatches = res.body.data.matches.filter(m => !m.userActions?.user1?.isArchived);
      const matchIds = activeMatches.map(m => m._id);
      expect(matchIds).not.toContain(matchId);
    });

    it('should reject without authentication (401)', async () => {
      await request(app)
        .patch(`/api/matches/${matchId}/archive`)
        .expect(401);
    });
  });
});

