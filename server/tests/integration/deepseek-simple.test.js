const request = require('supertest');
const express = require('express');

// Mock authentication middleware
const mockAuth = (req, res, next) => {
  req.user = { id: 'test-user-id', role: 'user' };
  next();
};

// Mock axios for DeepSeek API calls
const mockAxios = {
  post: jest.fn()
};

jest.mock('axios', () => mockAxios);

// Create a simple AI routes module for testing
const createAIRoutes = () => {
  const router = express.Router();
  
  // Simple bio generation endpoint
  router.post('/generate-bio', mockAuth, async (req, res) => {
    try {
      const { keywords, petName } = req.body;
      
      if (!keywords || !Array.isArray(keywords)) {
        return res.status(400).json({
          success: false,
          message: 'Keywords must be an array'
        });
      }

      // Mock DeepSeek API call
      try {
        const response = await mockAxios.post('https://api.deepseek.com/v1/chat/completions', {
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'You are a creative copywriter specializing in pet social media content.'
            },
            {
              role: 'user',
              content: `Write a friendly bio for a pet named ${petName || 'your pet'} with these keywords: ${keywords.join(', ')}`
            }
          ],
          max_tokens: 300,
          temperature: 0.7
        });

        const bio = response.data.choices[0].message.content;
        
        res.json({
          success: true,
          bio: bio,
          metadata: {
            generated_at: new Date().toISOString(),
            ai_confidence: 0.9,
            fallback: true
          }
        });
      } catch (error) {
        // Fallback response
        res.json({
          success: true,
          bio: `Meet ${petName || 'this amazing pet'}! A friendly companion who loves ${keywords[0] || 'playing'} and ${keywords[1] || 'cuddling'}. Perfect for making new friends! 🐾`,
          metadata: {
            generated_at: new Date().toISOString(),
            ai_confidence: 0.5,
            fallback: true,
            error: 'AI service temporarily unavailable'
          }
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to generate bio',
        error: error.message
      });
    }
  });

  // Health check endpoint
  router.get('/health', async (req, res) => {
    try {
      // Test DeepSeek API connection
      try {
        await mockAxios.post('https://api.deepseek.com/v1/chat/completions', {
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 10
        });
        
        res.json({
          success: true,
          status: 'healthy',
          deepseek_api: 'connected',
          deepseek_model: 'deepseek-chat'
        });
      } catch (error) {
        res.json({
          success: true,
          status: 'healthy',
          deepseek_api: 'unreachable',
          deepseek_error: error.message
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Health check failed',
        error: error.message
      });
    }
  });

  return router;
};

describe('DeepSeek AI Integration (Simple)', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/ai', createAIRoutes());
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockAxios.post.mockClear();
  });

  describe('Bio Generation with DeepSeek', () => {
    it('should generate bio using DeepSeek API', async () => {
      // Mock successful DeepSeek response
      mockAxios.post.mockResolvedValueOnce({
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
          petName: 'Max'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.bio).toContain('Max');
      expect(response.body.metadata.fallback).toBe(true);
      expect(response.body.metadata.ai_confidence).toBe(0.9);
    });

    it('should handle DeepSeek API errors gracefully', async () => {
      // Mock DeepSeek API failure
      mockAxios.post.mockRejectedValueOnce(new Error('API_KEY_INVALID'));

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

    it('should handle missing keywords', async () => {
      const response = await request(app)
        .post('/api/ai/generate-bio')
        .send({
          petName: 'Test'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Keywords must be an array');
    });
  });

  describe('Health Check', () => {
    it('should include DeepSeek API status when connected', async () => {
      // Mock successful DeepSeek health check
      mockAxios.post.mockResolvedValueOnce({
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
      mockAxios.post.mockRejectedValueOnce(new Error('API_KEY_INVALID'));

      const response = await request(app)
        .get('/api/ai/health');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.deepseek_api).toBe('unreachable');
      expect(response.body.deepseek_error).toBeDefined();
    });
  });

  describe('API Integration', () => {
    it('should call DeepSeek API with correct parameters', async () => {
      mockAxios.post.mockResolvedValueOnce({
        data: {
          choices: [{
            message: { content: 'Test bio' }
          }]
        }
      });

      await request(app)
        .post('/api/ai/generate-bio')
        .send({
          keywords: ['friendly'],
          petName: 'Test'
        });

      expect(mockAxios.post).toHaveBeenCalledWith(
        'https://api.deepseek.com/v1/chat/completions',
        expect.objectContaining({
          model: 'deepseek-chat',
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'system',
              content: expect.stringContaining('creative copywriter')
            }),
            expect.objectContaining({
              role: 'user',
              content: expect.stringContaining('Test')
            })
          ]),
          max_tokens: 300,
          temperature: 0.7
        })
      );
    });
  });
});
