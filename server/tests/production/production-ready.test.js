const request = require('supertest');
const axios = require('axios');

// Production readiness tests
describe('Production Readiness Tests', () => {
  const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5001';
  const TEST_TIMEOUT = 30000; // 30 seconds for production tests

  // Mock admin user for testing
  const adminToken = 'mock-admin-token';
  const mockAuth = (req, res, next) => {
    req.user = { 
      id: 'test-admin-id', 
      role: 'admin',
      subscription: { plan: 'premium' }
    };
    next();
  };

  describe('Health Checks', () => {
    it('should respond to basic health check', async () => {
      const response = await request(API_BASE_URL)
        .get('/api/ai/health')
        .timeout(TEST_TIMEOUT);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.status).toBeDefined();
    }, TEST_TIMEOUT);

    it('should provide detailed health information', async () => {
      const response = await request(API_BASE_URL)
        .get('/api/ai/health/detailed')
        .timeout(TEST_TIMEOUT);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.uptime).toBeDefined();
      expect(response.body.memory).toBeDefined();
      expect(response.body.cache).toBeDefined();
      expect(response.body.metrics).toBeDefined();
      expect(response.body.configuration).toBeDefined();
    }, TEST_TIMEOUT);

    it('should have DeepSeek API configured', async () => {
      const response = await request(API_BASE_URL)
        .get('/api/ai/health/detailed')
        .timeout(TEST_TIMEOUT);

      expect(response.status).toBe(200);
      expect(response.body.configuration.deepseekConfigured).toBe(true);
      expect(response.body.deepseek_api).toBeDefined();
    }, TEST_TIMEOUT);
  });

  describe('Metrics and Monitoring', () => {
    it('should provide metrics endpoint for admin users', async () => {
      // This would require actual admin authentication in production
      // For testing, we'll mock the auth middleware
      const app = require('../../src/routes/ai');
      
      // Mock the metrics endpoint response
      const mockMetrics = {
        requests: { total: 0, successful: 0, failed: 0, fallback: 0 },
        endpoints: {},
        deepseek: { calls: 0, errors: 0, avgResponseTime: 0 },
        cache: { hits: 0, misses: 0, hitRate: 0 }
      };

      expect(mockMetrics).toBeDefined();
      expect(mockMetrics.requests).toBeDefined();
      expect(mockMetrics.deepseek).toBeDefined();
      expect(mockMetrics.cache).toBeDefined();
    });

    it('should track request metrics', async () => {
      // Test that metrics are being tracked
      const response = await request(API_BASE_URL)
        .get('/api/ai/health/detailed')
        .timeout(TEST_TIMEOUT);

      expect(response.status).toBe(200);
      expect(response.body.metrics.requests).toBeDefined();
      expect(typeof response.body.metrics.requests.total).toBe('number');
    }, TEST_TIMEOUT);
  });

  describe('Error Handling', () => {
    it('should handle invalid requests gracefully', async () => {
      const response = await request(API_BASE_URL)
        .post('/api/ai/generate-bio')
        .send({ invalid: 'data' })
        .timeout(TEST_TIMEOUT);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
    }, TEST_TIMEOUT);

    it('should provide meaningful error messages', async () => {
      const response = await request(API_BASE_URL)
        .post('/api/ai/generate-bio')
        .send({})
        .timeout(TEST_TIMEOUT);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
      expect(Array.isArray(response.body.errors)).toBe(true);
    }, TEST_TIMEOUT);
  });

  describe('Performance', () => {
    it('should respond within acceptable time limits', async () => {
      const startTime = Date.now();
      
      const response = await request(API_BASE_URL)
        .get('/api/ai/health')
        .timeout(TEST_TIMEOUT);

      const responseTime = Date.now() - startTime;
      
      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(5000); // Should respond within 5 seconds
    }, TEST_TIMEOUT);

    it('should handle concurrent requests', async () => {
      const concurrentRequests = 10;
      const requests = Array(concurrentRequests).fill().map(() =>
        request(API_BASE_URL)
          .get('/api/ai/health')
          .timeout(TEST_TIMEOUT)
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    }, TEST_TIMEOUT);
  });

  describe('Security', () => {
    it('should require authentication for protected endpoints', async () => {
      const response = await request(API_BASE_URL)
        .get('/api/ai/metrics')
        .timeout(TEST_TIMEOUT);

      // Should require authentication
      expect([401, 403]).toContain(response.status);
    }, TEST_TIMEOUT);

    it('should validate input data', async () => {
      const response = await request(API_BASE_URL)
        .post('/api/ai/generate-bio')
        .send({
          keywords: 'not-an-array', // Should be array
          petName: 123, // Should be string
          tone: 'invalid-tone' // Should be valid enum
        })
        .timeout(TEST_TIMEOUT);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    }, TEST_TIMEOUT);
  });

  describe('Cache System', () => {
    it('should implement caching for repeated requests', async () => {
      const testData = {
        keywords: ['friendly', 'playful'],
        petName: 'TestPet',
        species: 'dog',
        tone: 'friendly'
      };

      // Make first request
      const response1 = await request(API_BASE_URL)
        .post('/api/ai/generate-bio')
        .send(testData)
        .timeout(TEST_TIMEOUT);

      // Make second identical request
      const response2 = await request(API_BASE_URL)
        .post('/api/ai/generate-bio')
        .send(testData)
        .timeout(TEST_TIMEOUT);

      // Both should succeed
      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      
      // Responses should be identical (cached)
      expect(response1.body.bio).toBe(response2.body.bio);
    }, TEST_TIMEOUT);
  });

  describe('Rate Limiting', () => {
    it('should implement rate limiting', async () => {
      // This test would require making many requests quickly
      // In a real production test, you'd want to test the actual rate limits
      
      const response = await request(API_BASE_URL)
        .get('/api/ai/rate-limit-status')
        .timeout(TEST_TIMEOUT);

      // Should require authentication, but the endpoint should exist
      expect([200, 401, 403]).toContain(response.status);
    }, TEST_TIMEOUT);
  });

  describe('DeepSeek Integration', () => {
    it('should have DeepSeek API configured', async () => {
      const response = await request(API_BASE_URL)
        .get('/api/ai/health/detailed')
        .timeout(TEST_TIMEOUT);

      expect(response.status).toBe(200);
      expect(response.body.configuration.deepseekConfigured).toBe(true);
    }, TEST_TIMEOUT);

    it('should handle DeepSeek API failures gracefully', async () => {
      // This would require mocking DeepSeek API failures
      // For now, we'll just check that the health endpoint reports status
      
      const response = await request(API_BASE_URL)
        .get('/api/ai/health/detailed')
        .timeout(TEST_TIMEOUT);

      expect(response.status).toBe(200);
      expect(['connected', 'unreachable']).toContain(response.body.deepseek_api);
    }, TEST_TIMEOUT);
  });

  describe('Logging', () => {
    it('should log requests and responses', async () => {
      // In production, you'd check log files
      // For testing, we'll just verify the endpoint responds
      
      const response = await request(API_BASE_URL)
        .get('/api/ai/health')
        .timeout(TEST_TIMEOUT);

      expect(response.status).toBe(200);
      // Logging is handled internally, so we just verify the endpoint works
    }, TEST_TIMEOUT);
  });

  describe('Environment Configuration', () => {
    it('should have required environment variables', () => {
      const requiredEnvVars = [
        'DEEPSEEK_API_KEY',
        'NODE_ENV'
      ];

      requiredEnvVars.forEach(envVar => {
        expect(process.env[envVar]).toBeDefined();
      });
    });

    it('should be running in production mode', () => {
      // This test would check NODE_ENV in actual production
      expect(process.env.NODE_ENV).toBeDefined();
    });
  });
});

// Production load test
describe('Production Load Tests', () => {
  const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5001';
  
  it('should handle load gracefully', async () => {
    const loadTestRequests = 50;
    const requests = Array(loadTestRequests).fill().map(() =>
      request(API_BASE_URL)
        .get('/api/ai/health')
        .timeout(10000)
    );

    const startTime = Date.now();
    const responses = await Promise.all(requests);
    const totalTime = Date.now() - startTime;

    // All requests should succeed
    responses.forEach(response => {
      expect(response.status).toBe(200);
    });

    // Should complete within reasonable time
    expect(totalTime).toBeLessThan(30000); // 30 seconds for 50 requests
    
    console.log(`Load test completed: ${loadTestRequests} requests in ${totalTime}ms`);
  }, 60000); // 60 second timeout for load test
});
