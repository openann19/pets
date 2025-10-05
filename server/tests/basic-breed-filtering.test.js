const request = require('supertest');
const { app } = require('../server');

describe('Basic Breed Filtering System Tests', () => {
  
  describe('Server Health Check', () => {
    it('should respond to health check', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Basic Pet Discovery Endpoints', () => {
    it('should get pets with basic filtering', async () => {
      const response = await request(app)
        .get('/api/pets/discover?limit=5')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.pets).toBeDefined();
      expect(Array.isArray(response.body.data.pets)).toBe(true);
    });

    it('should filter pets by species', async () => {
      const response = await request(app)
        .get('/api/pets/discover?species=dog&limit=3')
        .expect(200);

      expect(response.body.success).toBe(true);
      if (response.body.data.pets.length > 0) {
        expect(response.body.data.pets.every(pet => pet.species === 'dog')).toBe(true);
      }
    });

    it('should handle breed filtering', async () => {
      const response = await request(app)
        .get('/api/pets/discover?breed=golden')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.pets).toBeDefined();
    });

    it('should handle multiple breed filtering', async () => {
      const response = await request(app)
        .get('/api/pets/discover?breed=golden retriever,labrador retriever')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.pets).toBeDefined();
    });

    it('should sort pets by different criteria', async () => {
      const sortOptions = ['newest', 'oldest', 'age_asc', 'age_desc'];
      
      for (const sortBy of sortOptions) {
        const response = await request(app)
          .get(`/api/pets/discover?sortBy=${sortBy}&limit=3`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.pets).toBeDefined();
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid query parameters gracefully', async () => {
      const response = await request(app)
        .get('/api/pets/discover?invalidParam=test&sortBy=invalidSort')
        .expect(200);

      expect(response.body.success).toBe(true);
      // Should not crash and return some pets
      expect(response.body.data.pets).toBeDefined();
    });

    it('should handle empty breed search', async () => {
      const response = await request(app)
        .get('/api/pets/discover?breed=')
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should handle very large pagination limits', async () => {
      const response = await request(app)
        .get('/api/pets/discover?limit=1000')
        .expect(200);

      expect(response.body.success).toBe(true);
      // Should cap the limit appropriately
      expect(response.body.data.pets.length).toBeLessThanOrEqual(100);
    });
  });

  describe('Performance Tests', () => {
    it('should respond to queries quickly', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/pets/discover?species=dog&limit=10')
        .expect(200);

      const responseTime = Date.now() - startTime;
      
      expect(response.body.success).toBe(true);
      expect(responseTime).toBeLessThan(2000); // Should respond within 2 seconds
    });

    it('should handle complex queries efficiently', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/pets/discover?species=dog&breed=golden&size=large&limit=20')
        .expect(200);

      const responseTime = Date.now() - startTime;
      
      expect(response.body.success).toBe(true);
      expect(responseTime).toBeLessThan(2000);
    });
  });

  describe('Filter Combinations', () => {
    it('should combine multiple filters', async () => {
      const response = await request(app)
        .get('/api/pets/discover?species=dog&size=large&limit=5')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.pets).toBeDefined();
    });

    it('should apply age filtering', async () => {
      const response = await request(app)
        .get('/api/pets/discover?maxAge=5&limit=5')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.pets).toBeDefined();
    });

    it('should apply size filtering', async () => {
      const response = await request(app)
        .get('/api/pets/discover?size=large&limit=5')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.pets).toBeDefined();
    });
  });

  describe('Pet API Metadata', () => {
    it('should include pagination information', async () => {
      const response = await request(app)
        .get('/api/pets/discover?limit=10&page=1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('pagination');
      expect(response.body.data.pagination).toHaveProperty('page');
      expect(response.body.data.pagination).toHaveProperty('limit');
      expect(response.body.data.pagination).toHaveProperty('total');
    });

    it('should include total counts', async () => {
      const response = await request(app)
        .get('/api/pets/discover?limit=5')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalPets');
      expect(typeof response.body.data.totalPets).toBe('number');
    });
  });
});
