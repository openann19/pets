const request = require('supertest');
const express = require('express');
const aiRoutes = require('../../src/routes/ai');
const { authenticateToken } = require('../../src/middleware/auth');

// Mock authentication middleware
jest.mock('../../src/middleware/auth', () => ({
  authenticateToken: (req, res, next) => {
    req.user = { id: 'test-user-id', role: 'user' };
    next();
  }
}));

// Mock axios for DeepSeek API calls
jest.mock('axios', () => ({
  post: jest.fn()
}));

const axios = require('axios');

describe('DeepSeek AI Integration', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/ai', aiRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset axios mock
    axios.post.mockClear();
  });

  describe('Bio Generation with DeepSeek Fallback', () => {
    it('should generate bio using DeepSeek when AI service is unavailable', async () => {
      // Mock AI service failure
      axios.post.mockRejectedValueOnce(new Error('ECONNREFUSED'));

      // Mock successful DeepSeek response
      axios.post.mockResolvedValueOnce({
        data: {
          choices: [{
            message: {
              content: 'Meet Max! A friendly Golden Retriever who loves playing fetch and cuddling on the couch. Perfect for making new friends! 🐾'
            }
          }]
        }
      });

      const response = await request(app)
        .post('/api/ai/generate-bio')
        .send({
          keywords: ['friendly', 'playful', 'loving'],
          petName: 'Max',
          species: 'dog',
          breed: 'Golden Retriever',
          tone: 'friendly',
          length: 'medium'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.bio).toContain('Max');
      expect(response.body.bio).toContain('Golden Retriever');
      expect(response.body.metadata.fallback).toBe(true);
    });

    it('should handle DeepSeek API errors gracefully', async () => {
      // Mock AI service failure
      axios.post.mockRejectedValueOnce(new Error('ECONNREFUSED'));

      // Mock DeepSeek API failure
      axios.post.mockRejectedValueOnce(new Error('API_KEY_INVALID'));

      const response = await request(app)
        .post('/api/ai/generate-bio')
        .send({
          keywords: ['friendly', 'playful'],
          petName: 'Buddy'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.bio).toContain('Buddy');
      expect(response.body.metadata.fallback).toBe(true);
      expect(response.body.metadata.error).toBeDefined();
    });
  });

  describe('Photo Analysis with DeepSeek Fallback', () => {
    it('should analyze photos using DeepSeek when AI service is unavailable', async () => {
      // Mock AI service failure
      axios.post.mockRejectedValueOnce(new Error('TIMEOUT'));

      // Mock successful DeepSeek response
      axios.post.mockResolvedValueOnce({
        data: {
          choices: [{
            message: {
              content: JSON.stringify({
                analysis: 'High-quality photo showing a healthy, friendly dog',
                detected_traits: ['Friendly', 'Energetic', 'Well-groomed'],
                confidence: 0.9,
                recommendations: ['Excellent photo quality', 'Good lighting'],
                scores: { clarity: 9, composition: 8, lighting: 9, engagement: 8 },
                breed_indicators: ['Golden Retriever characteristics'],
                health_assessment: 'Appears healthy and well-cared for',
                personality_indicators: ['Friendly', 'Confident']
              })
            }
          }]
        }
      });

      const response = await request(app)
        .post('/api/ai/analyze-photos')
        .send({
          photoUrls: ['https://example.com/photo1.jpg'],
          petName: 'Max',
          knownBreed: 'Golden Retriever'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.results).toHaveLength(1);
      expect(response.body.results[0].fallback).toBe(true);
      expect(response.body.results[0].analysis).toContain('healthy');
    });
  });

  describe('Enhanced Compatibility with DeepSeek Fallback', () => {
    it('should analyze compatibility using DeepSeek when AI service is unavailable', async () => {
      // Mock AI service failure
      axios.post.mockRejectedValueOnce(new Error('ECONNREFUSED'));

      // Mock successful DeepSeek response
      axios.post.mockResolvedValueOnce({
        data: {
          choices: [{
            message: {
              content: JSON.stringify({
                compatibility_score: 85,
                confidence: 0.9,
                breakdown: {
                  species_match: 1.0,
                  age_compatibility: 0.8,
                  size_compatibility: 0.9,
                  personality_match: 0.8
                },
                insights: 'Both dogs show excellent compatibility with similar energy levels and friendly personalities',
                recommendations: ['Supervised introduction recommended', 'Gradual introduction process'],
                risk_factors: ['Size difference may require supervision'],
                interaction_suitability: 'High'
              })
            }
          }]
        }
      });

      const response = await request(app)
        .post('/api/ai/enhanced-compatibility')
        .send({
          pet1: {
            name: 'Max',
            species: 'dog',
            breed: 'Golden Retriever',
            age: 3,
            size: 'large',
            personality_tags: ['friendly', 'energetic', 'playful']
          },
          pet2: {
            name: 'Buddy',
            species: 'dog',
            breed: 'Labrador',
            age: 2,
            size: 'large',
            personality_tags: ['friendly', 'calm', 'loyal']
          },
          interaction_type: 'playdate'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.compatibility_score).toBe(85);
      expect(response.body.fallback).toBe(true);
      expect(response.body.breakdown).toBeDefined();
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting to AI endpoints', async () => {
      // Mock successful responses
      axios.post.mockResolvedValue({
        data: {
          choices: [{
            message: { content: 'Test response' }
          }]
        }
      });

      // Make multiple requests to test rate limiting
      const requests = Array(25).fill().map(() =>
        request(app)
          .post('/api/ai/generate-bio')
          .send({
            keywords: ['test'],
            petName: 'Test'
          })
      );

      const responses = await Promise.all(requests);
      
      // Some requests should be rate limited (429 status)
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('Health Check', () => {
    it('should include DeepSeek API status in health check', async () => {
      // Mock successful DeepSeek health check
      axios.post.mockResolvedValueOnce({
        data: {
          choices: [{
            message: { content: 'Hello' }
          }]
        }
      });

      const response = await request(app)
        .get('/api/ai/health');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.deepseek_api).toBe('connected');
      expect(response.body.deepseek_model).toBe('deepseek-chat');
    });

    it('should handle DeepSeek API failures in health check', async () => {
      // Mock DeepSeek API failure
      axios.post.mockRejectedValueOnce(new Error('API_KEY_INVALID'));

      const response = await request(app)
        .get('/api/ai/health');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.deepseek_api).toBe('unreachable');
      expect(response.body.deepseek_error).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed requests gracefully', async () => {
      const response = await request(app)
        .post('/api/ai/generate-bio')
        .send({
          // Missing required keywords field
          petName: 'Test'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Validation failed');
    });

    it('should handle network timeouts gracefully', async () => {
      // Mock timeout error
      axios.post.mockRejectedValueOnce(new Error('TIMEOUT'));

      const response = await request(app)
        .post('/api/ai/generate-bio')
        .send({
          keywords: ['test'],
          petName: 'Test'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.metadata.fallback).toBe(true);
    });
  });

  describe('Cache Management', () => {
    it('should provide cache statistics', async () => {
      const response = await request(app)
        .get('/api/ai/cache/stats');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.cache_stats).toBeDefined();
      expect(response.body.cache_stats.total_entries).toBeDefined();
    });

    it('should clear cache successfully', async () => {
      const response = await request(app)
        .post('/api/ai/cache/clear');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Cleared');
    });
  });

  describe('Rate Limit Status', () => {
    it('should provide rate limit status', async () => {
      const response = await request(app)
        .get('/api/ai/rate-limit-status');

      expect(response.status).toBe(200);
      expect(response.body.current).toBeDefined();
      expect(response.body.limit).toBeDefined();
      expect(response.body.remaining).toBeDefined();
    });
  });
});
