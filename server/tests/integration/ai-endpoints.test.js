/**
 * AI Endpoints Integration Tests
 * Tests all AI-powered features including bio generation, photo analysis, and compatibility
 * 
 * CRITICAL: These endpoints are completely untested (0/8 coverage)
 * Business Impact: AI features are production-critical
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { app, httpServer } = require('../../server');
const User = require('../../src/models/User');
const Pet = require('../../src/models/Pet');

let mongoServer;
let testUser;
let testToken;
let testPet;

// Mock AI service responses
jest.mock('axios', () => ({
  post: jest.fn().mockImplementation((url, data) => {
    if (url.includes('generate-bio')) {
      return Promise.resolve({
        data: {
          bio: 'A friendly and energetic dog who loves to play!',
          tone: data.tone || 'friendly',
          length: data.length || 'medium',
          generated_at: new Date().toISOString(),
          ai_confidence: 0.95
        }
      });
    }
    if (url.includes('analyze-photo')) {
      return Promise.resolve({
        data: {
          analysis: 'Great photo quality with good lighting',
          detected_traits: ['Friendly', 'Energetic'],
          confidence: 0.88,
          breed_indicators: ['Golden Retriever characteristics'],
          health_assessment: 'Appears healthy and well-groomed'
        }
      });
    }
    if (url.includes('enhanced-compatibility')) {
      return Promise.resolve({
        data: {
          compatibility_score: 85,
          confidence: 0.92,
          breakdown: {
            species_match: 1.0,
            age_compatibility: 0.8,
            size_compatibility: 0.9,
            personality_match: 0.75
          },
          insights: ['Great match for playdates', 'Similar energy levels'],
          recommendations: ['Supervise first meeting', 'Introduce in neutral space'],
          risk_factors: [],
          interaction_suitability: 'Highly suitable'
        }
      });
    }
    return Promise.reject(new Error('Unknown endpoint'));
  })
}));

describe('AI Endpoints Integration Tests', () => {
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

    // Create test user
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: `test${Date.now()}@example.com`,
        password: 'Test123!@#',
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: '1990-01-01'
      });

    testUser = res.body.data.user;
    testToken = res.body.data.accessToken;

    // Create test pet
    const petRes = await request(app)
      .post('/api/pets')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        name: 'Buddy',
        species: 'dog',
        breed: 'Golden Retriever',
        age: 3,
        gender: 'male',
        size: 'large',
        intent: 'playdate'
      });

    testPet = petRes.body.data.pet;
  });

  describe('POST /api/ai/generate-bio', () => {
    it('should generate bio with default settings (200)', async () => {
      const res = await request(app)
        .post('/api/ai/generate-bio')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          keywords: ['friendly', 'playful'],
          petName: 'Buddy',
          species: 'dog'
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.bio).toBeDefined();
      expect(typeof res.body.bio).toBe('string');
      expect(res.body.metadata).toHaveProperty('tone');
      expect(res.body.metadata).toHaveProperty('length');
    });

    it('should accept tone parameter (200)', async () => {
      const res = await request(app)
        .post('/api/ai/generate-bio')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          keywords: ['energetic'],
          petName: 'Max',
          tone: 'playful',
          length: 'short'
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.metadata.tone).toBe('playful');
    });

    it('should accept length parameter (200)', async () => {
      const res = await request(app)
        .post('/api/ai/generate-bio')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          keywords: ['calm', 'gentle'],
          petName: 'Luna',
          tone: 'professional',
          length: 'long'
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.metadata.length).toBe('long');
    });

    it('should reject without keywords (400)', async () => {
      const res = await request(app)
        .post('/api/ai/generate-bio')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          petName: 'Buddy'
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('keywords');
    });

    it('should reject without petName (400)', async () => {
      const res = await request(app)
        .post('/api/ai/generate-bio')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          keywords: ['friendly']
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should reject without authentication (401)', async () => {
      await request(app)
        .post('/api/ai/generate-bio')
        .send({
          keywords: ['friendly'],
          petName: 'Buddy'
        })
        .expect(401);
    });

    it('should handle AI service unavailable (503)', async () => {
      // Mock AI service failure
      const axios = require('axios');
      axios.post.mockRejectedValueOnce(new Error('AI service unavailable'));

      const res = await request(app)
        .post('/api/ai/generate-bio')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          keywords: ['friendly'],
          petName: 'Buddy'
        })
        .expect(503);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('AI service');
    });
  });

  describe('POST /api/ai/analyze-photos', () => {
    it('should analyze single photo (200)', async () => {
      const res = await request(app)
        .post('/api/ai/analyze-photos')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          photoUrls: ['https://example.com/photo1.jpg'],
          petName: 'Buddy'
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0]).toHaveProperty('analysis');
      expect(res.body.results[0]).toHaveProperty('confidence');
      expect(res.body.results[0]).toHaveProperty('scores');
    });

    it('should analyze multiple photos (200)', async () => {
      const res = await request(app)
        .post('/api/ai/analyze-photos')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          photoUrls: [
            'https://example.com/photo1.jpg',
            'https://example.com/photo2.jpg',
            'https://example.com/photo3.jpg'
          ],
          petName: 'Buddy'
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.results).toHaveLength(3);
      expect(res.body.bestPhoto).toBeDefined();
      expect(res.body.summary).toHaveProperty('total_photos', 3);
    });

    it('should detect breed from photo', async () => {
      const res = await request(app)
        .post('/api/ai/analyze-photos')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          photoUrls: ['https://example.com/golden-retriever.jpg'],
          petName: 'Buddy'
        })
        .expect(200);

      expect(res.body.results[0].breed_indicators).toContain('Golden Retriever characteristics');
    });

    it('should provide quality scores', async () => {
      const res = await request(app)
        .post('/api/ai/analyze-photos')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          photoUrls: ['https://example.com/photo.jpg'],
          petName: 'Buddy'
        })
        .expect(200);

      expect(res.body.results[0].scores).toHaveProperty('quality');
      expect(res.body.results[0].scores).toHaveProperty('lighting');
      expect(res.body.results[0].scores).toHaveProperty('composition');
    });

    it('should reject invalid URLs (400)', async () => {
      const res = await request(app)
        .post('/api/ai/analyze-photos')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          photoUrls: ['not-a-valid-url']
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should reject without authentication (401)', async () => {
      await request(app)
        .post('/api/ai/analyze-photos')
        .send({
          photoUrls: ['https://example.com/photo.jpg']
        })
        .expect(401);
    });

    it('should handle AI service errors gracefully', async () => {
      const axios = require('axios');
      axios.post.mockRejectedValueOnce(new Error('AI analysis failed'));

      const res = await request(app)
        .post('/api/ai/analyze-photos')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          photoUrls: ['https://example.com/photo.jpg']
        })
        .expect(503);

      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/ai/enhanced-compatibility', () => {
    it('should analyze pet compatibility (200)', async () => {
      const res = await request(app)
        .post('/api/ai/enhanced-compatibility')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          pet1: {
            id: testPet._id,
            name: 'Buddy',
            species: 'dog',
            breed: 'Golden Retriever',
            age: 3,
            size: 'large',
            personality_tags: ['friendly', 'energetic']
          },
          pet2: {
            id: 'other-pet-id',
            name: 'Max',
            species: 'dog',
            breed: 'Labrador',
            age: 4,
            size: 'large',
            personality_tags: ['playful', 'gentle']
          },
          interaction_type: 'playdate'
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.compatibility_score).toBeGreaterThanOrEqual(0);
      expect(res.body.compatibility_score).toBeLessThanOrEqual(100);
      expect(res.body.breakdown).toBeDefined();
      expect(res.body.insights).toBeInstanceOf(Array);
      expect(res.body.recommendations).toBeInstanceOf(Array);
    });

    it('should provide detailed breakdown', async () => {
      const res = await request(app)
        .post('/api/ai/enhanced-compatibility')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          pet1: {
            id: testPet._id,
            name: 'Buddy',
            species: 'dog',
            breed: 'Golden Retriever',
            age: 3,
            size: 'large',
            personality_tags: ['friendly']
          },
          pet2: {
            id: 'other-pet-id',
            name: 'Max',
            species: 'dog',
            breed: 'Labrador',
            age: 4,
            size: 'large',
            personality_tags: ['playful']
          },
          interaction_type: 'playdate'
        })
        .expect(200);

      expect(res.body.breakdown).toHaveProperty('species_match');
      expect(res.body.breakdown).toHaveProperty('age_compatibility');
      expect(res.body.breakdown).toHaveProperty('size_compatibility');
      expect(res.body.breakdown).toHaveProperty('personality_match');
    });

    it('should support different interaction types', async () => {
      const interactionTypes = ['playdate', 'mating', 'adoption', 'all'];

      for (const type of interactionTypes) {
        const res = await request(app)
          .post('/api/ai/enhanced-compatibility')
          .set('Authorization', `Bearer ${testToken}`)
          .send({
            pet1: {
              id: testPet._id,
              name: 'Buddy',
              species: 'dog',
              breed: 'Golden Retriever',
              age: 3,
              size: 'large',
              personality_tags: ['friendly']
            },
            pet2: {
              id: 'other-pet-id',
              name: 'Max',
              species: 'dog',
              breed: 'Labrador',
              age: 4,
              size: 'large',
              personality_tags: ['playful']
            },
            interaction_type: type
          })
          .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.interaction_type).toBe(type);
      }
    });

    it('should reject invalid pet data (400)', async () => {
      const res = await request(app)
        .post('/api/ai/enhanced-compatibility')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          pet1: { name: 'Buddy' }, // Missing required fields
          pet2: { name: 'Max' }
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should reject without authentication (401)', async () => {
      await request(app)
        .post('/api/ai/enhanced-compatibility')
        .send({
          pet1: { id: 'pet1', name: 'Buddy', species: 'dog' },
          pet2: { id: 'pet2', name: 'Max', species: 'dog' }
        })
        .expect(401);
    });
  });

  describe('POST /api/ai/compatibility', () => {
    it('should provide legacy compatibility score (200)', async () => {
      const res = await request(app)
        .post('/api/ai/compatibility')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          pet1: testPet._id,
          pet2: 'other-pet-id'
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.compatibility_score).toBeGreaterThanOrEqual(0);
      expect(res.body.compatibility_score).toBeLessThanOrEqual(100);
    });

    it('should fallback to enhanced analysis', async () => {
      const res = await request(app)
        .post('/api/ai/compatibility')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          pet1: testPet._id,
          pet2: 'other-pet-id'
        })
        .expect(200);

      expect(res.body.analysis_type).toBe('enhanced');
    });
  });

  describe('POST /api/ai/assist-application', () => {
    it('should generate adoption application (200)', async () => {
      const res = await request(app)
        .post('/api/ai/assist-application')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          petId: testPet._id,
          applicantInfo: {
            name: 'John Doe',
            experience: 'experienced',
            homeType: 'house',
            hasOtherPets: false
          }
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.application).toBeDefined();
      expect(res.body.application).toHaveProperty('personal_statement');
      expect(res.body.application).toHaveProperty('experience_description');
    });

    it('should personalize based on user profile', async () => {
      const res = await request(app)
        .post('/api/ai/assist-application')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          petId: testPet._id,
          applicantInfo: {
            name: testUser.firstName + ' ' + testUser.lastName,
            experience: 'first-time',
            homeType: 'apartment',
            hasOtherPets: true
          }
        })
        .expect(200);

      expect(res.body.application.personal_statement).toContain(testUser.firstName);
    });

    it('should reject without authentication (401)', async () => {
      await request(app)
        .post('/api/ai/assist-application')
        .send({
          petId: testPet._id,
          applicantInfo: { name: 'John Doe' }
        })
        .expect(401);
    });
  });

  describe('GET /api/ai/health', () => {
    it('should return health status (200)', async () => {
      const res = await request(app)
        .get('/api/ai/health')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.status).toBe('healthy');
      expect(res.body.cache).toBeDefined();
      expect(res.body.endpoints).toBeDefined();
    });

    it('should check AI service connection', async () => {
      const res = await request(app)
        .get('/api/ai/health')
        .expect(200);

      expect(res.body.services).toHaveProperty('ai_service');
      expect(res.body.services.ai_service).toHaveProperty('status');
    });

    it('should report fallback availability', async () => {
      const res = await request(app)
        .get('/api/ai/health')
        .expect(200);

      expect(res.body.fallback).toBeDefined();
      expect(res.body.fallback).toHaveProperty('available');
    });
  });

  describe('GET /api/ai/cache/stats', () => {
    it('should return cache statistics (200)', async () => {
      const res = await request(app)
        .get('/api/ai/cache/stats')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.stats).toHaveProperty('entry_count');
      expect(res.body.stats).toHaveProperty('memory_usage');
      expect(res.body.stats).toHaveProperty('hit_rate');
    });

    it('should show memory usage', async () => {
      const res = await request(app)
        .get('/api/ai/cache/stats')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(res.body.stats.memory_usage).toHaveProperty('used');
      expect(res.body.stats.memory_usage).toHaveProperty('total');
    });

    it('should require authentication (401)', async () => {
      await request(app)
        .get('/api/ai/cache/stats')
        .expect(401);
    });
  });

  describe('POST /api/ai/cache/clear', () => {
    it('should clear cache (200)', async () => {
      const res = await request(app)
        .post('/api/ai/cache/clear')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.cleared_count).toBeGreaterThanOrEqual(0);
    });

    it('should return cleared count', async () => {
      const res = await request(app)
        .post('/api/ai/cache/clear')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(typeof res.body.cleared_count).toBe('number');
    });

    it('should require authentication (401)', async () => {
      await request(app)
        .post('/api/ai/cache/clear')
        .expect(401);
    });
  });
});
