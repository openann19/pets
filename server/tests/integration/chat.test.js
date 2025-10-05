const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Match = require('../../src/models/Match');

let app, httpServer;
let mongoServer;
let user1Token, user2Token;
let userId1, userId2;
let pet1Id, pet2Id;
let matchId;

beforeAll(async () => {
  // Import app and httpServer correctly
  ({ app, httpServer } = require('../../server'));
  
  mongoServer = await MongoMemoryServer.create({
    instanceOpts: { replSet: { count: 1 } }
  });
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // Create two users with pets and a match
  const user1Res = await request(app)
    .post('/api/auth/register')
    .send({
      email: `chatter1${Date.now()}@example.com`,
      password: 'Pass123!',
      firstName: 'User',
      lastName: 'One',
      dateOfBirth: '1990-01-01'
    });
  
  user1Token = user1Res.body.data.accessToken;
  userId1 = user1Res.body.data.user._id;

  const user2Res = await request(app)
    .post('/api/auth/register')
    .send({
      email: `chatter2${Date.now()}@example.com`,
      password: 'Pass123!',
      firstName: 'User',
      lastName: 'Two',
      dateOfBirth: '1990-01-01'}); 
  
  user2Token = user2Res.body.data.accessToken;
  userId2 = user2Res.body.data.user._id;

  // Create pets
  const pet1Res = await request(app)
    .post('/api/pets')
    .set('Authorization', `Bearer ${user1Token}`)
    .send({
      name: 'Chatter Pet 1',
      species: 'cat',
      breed: 'Siamese',
      age: 3,
      gender: 'male',
      size: 'small',
      intent: 'adoption',
      location: { coordinates: [-74.006, 40.7128] }
    });
  
  pet1Id = pet1Res.body.data.pet._id;

  const pet2Res = await request(app)
    .post('/api/pets')
    .set('Authorization', `Bearer ${user2Token}`)
    .send({
      name: 'Chatter Pet 2',
      species: 'cat',
      breed: 'Persian',
      age: 2,
      gender: 'female',
      size: 'small',
      intent: 'adoption',
      location: { coordinates: [-74.006, 40.7128] }
    });
  
  pet2Id = pet2Res.body.data.pet._id;

  // Create match manually to avoid transaction issues in test environment
  const manualMatch = new Match({
    pet1: pet1Id,
    pet2: pet2Id,
    user1: userId1,
    user2: userId2,
    matchType: 'general',
    compatibilityScore: 50,
    status: 'active'
  });
  const savedMatch = await manualMatch.save();
  matchId = savedMatch._id;
  
  // Add some test messages to the match
  await savedMatch.addMessage(userId1, 'Hello! Your pet looks amazing!');
  await savedMatch.addMessage(userId2, 'Thank you! Yours too!');
}, 30000);

afterAll(async () => {
  if (httpServer) {
    await httpServer.close();
  }
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe('Chat & Messaging Tests', () => {
  describe('GET /api/chat/history/:matchId', () => {
    it('should get chat history (200)', async () => {
      const res = await request(app)
        .get(`/api/chat/history/${matchId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.messages).toBeDefined();
      expect(Array.isArray(res.body.data.messages)).toBe(true);
    });

    it('should order messages chronologically', async () => {
      const res = await request(app)
        .get(`/api/chat/history/${matchId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      const messages = res.body.data.messages;
      expect(messages.length).toBeGreaterThanOrEqual(2);
      
      // Verify chronological order
      for (let i = 1; i < messages.length; i++) {
        const prev = new Date(messages[i - 1].sentAt);
        const curr = new Date(messages[i].sentAt);
        expect(curr.getTime()).toBeGreaterThanOrEqual(prev.getTime());
      }
    });

    it('should reject without authentication (401)', async () => {
      await request(app)
        .get(`/api/chat/history/${matchId}`)
        .expect(401);
    });

    it('should return 404 for non-existent match', async () => {
      const fakeMatchId = new mongoose.Types.ObjectId();
      await request(app)
        .get(`/api/chat/history/${fakeMatchId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(404);
    });
  });

  describe('POST /api/chat/read/:matchId', () => {
    it('should mark messages as read (200)', async () => {
      const res = await request(app)
        .post(`/api/chat/read/${matchId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('read');
    });

    it('should reject without authentication (401)', async () => {
      await request(app)
        .post(`/api/chat/read/${matchId}`)
        .expect(401);
    });

    it('should return 404 for non-existent match', async () => {
      const fakeMatchId = new mongoose.Types.ObjectId();
      await request(app)
        .post(`/api/chat/read/${fakeMatchId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(404);
    });
  });

  describe('GET /api/chat/online', () => {
    it('should get online users list (200)', async () => {
      const res = await request(app)
        .get('/api/chat/online')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.onlineUsers).toBeDefined();
      expect(Array.isArray(res.body.data.onlineUsers)).toBe(true);
    });

    it('should reject without authentication (401)', async () => {
      await request(app)
        .get('/api/chat/online')
        .expect(401);
    });
  });
});