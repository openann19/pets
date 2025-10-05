const request = require('supertest');
const { app } = require('../server');
const { seedComprehensiveBreeds } = require('../src/scripts/seedComprehensiveBreeds');
const BreedProfile = require('../src/models/BreedProfile');
const Pet = require('../src/models/Pet');
const User = require('../src/models/User');

describe('Ultra-Premium Breed Filtering System', () => {
  let testUser;
  let otherUser;
  let token;
  
  beforeAll(async () => {
    // Seed comprehensive breed data
    await seedComprehensiveBreeds();
    
    // Create test user
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Test',
        lastName: 'User',
        email: `test${Date.now()}@example.com`,
        password: 'testpassword123',
        dateOfBirth: '1990-01-01T00:00:00.000Z', // Required field - must be 18+ years old
        preferences: {
          breedPreference: ['golden retriever', 'labrador retriever'],
          temperamentPreference: ['friendly', 'loyal'],
          maxDistance: 25,
          species: ['dog'],
          ageRange: { min: 1, max: 10 }
        }
      });
    
    testUser = userResponse.body.data.user;
    token = userResponse.body.data.accessToken;

    // Create a second user to own test pets (so discovery doesn't exclude them)
    const otherUserResponse = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Other',
        lastName: 'Owner',
        email: `other${Date.now()}@example.com`,
        password: 'testpassword123',
        dateOfBirth: '1990-01-01T00:00:00.000Z'
      });

    otherUser = otherUserResponse.body.data.user;
  });

  afterAll(async () => {
    // Clean up test data
    await BreedProfile.deleteMany({});
    await Pet.deleteMany({});
    await User.deleteMany({});
  });

  describe('Breed Profile API', () => {
    it('should get all breeds with pagination', async () => {
      const response = await request(app)
        .get('/api/breeds?page=1&limit=10')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.breeds).toHaveLength(10);
      expect(response.body.data.pagination.total).toBeGreaterThan(0);
    });

    it('should filter breeds by species', async () => {
      const response = await request(app)
        .get('/api/breeds?species=dog&limit=5')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.breeds.every(breed => breed.species === 'dog')).toBe(true);
    });

    it('should autocomplete breed names', async () => {
      const response = await request(app)
        .get('/api/breeds/search/autocomplete?q=gold')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.suggestions.length).toBeGreaterThan(0);
      expect(response.body.data.suggestions[0].name.toLowerCase()).toContain('gold');
    });

    it('should get breed details with similar breeds', async () => {
      const response = await request(app)
        .get('/api/breeds/golden retriever')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.breed.name).toBe('golden retriever');
      expect(response.body.data.similarBreeds.length).toBeGreaterThan(0);
    });

    it('should provide personalized breed suggestions', async () => {
      const response = await request(app)
        .post('/api/breeds/suggestions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          species: 'dog',
          livingSpace: 'house',
          familySize: 'with_children',
          energyPreference: 'moderate',
          groomingTime: 'moderate',
          exerciseLevel: 'moderate',
          experienceLevel: 'beginner'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.suggestions.length).toBeGreaterThan(0);
      expect(response.body.data.suggestions[0]).toHaveProperty('suggestionScore');
    });
  });

  describe('Advanced Pet Discovery', () => {
    beforeEach(async () => {
      // Create test pets
      const testPets = [
        {
          owner: otherUser._id,
          name: 'Buddy the Golden',
          species: 'dog',
          breed: 'golden retriever',
          age: 3,
          size: 'large',
          gender: 'male',
          intent: 'adoption',
          photos: [{ url: 'https://example.com/buddy.jpg', isPrimary: true }],
          personalityTags: ['friendly', 'energetic', 'loyal'],
          healthInfo: { vaccinated: true, spayedNeutered: true },
          location: { type: 'Point', coordinates: [-73.9857, 40.7484] },
          isActive: true,
          status: 'active'
        },
        {
          owner: otherUser._id,
          name: 'Max the Lab',
          species: 'dog', 
          breed: 'labrador retriever',
          age: 2,
          size: 'large',
          gender: 'male',
          intent: 'playdate',
          photos: [{ url: 'https://example.com/max.jpg', isPrimary: true }],
          personalityTags: ['playful', 'social', 'intelligent'],
          healthInfo: { vaccinated: true, spayedNeutered: false },
          location: { type: 'Point', coordinates: [-73.9857, 40.7484] },
          isActive: true,
          status: 'active'
        }
      ];

      await Pet.insertMany(testPets);
    });

    afterEach(async () => {
      await Pet.deleteMany({ owner: testUser._id });
    });

    it('should discover pets with advanced filters', async () => {
      const response = await request(app)
        .get('/api/pets/discover')
        .set('Authorization', `Bearer ${token}`)
        .query({
          species: 'dog',
          breed: 'golden retriever',
          ages: '2-5',
          sizes: 'large',
          temperament: 'friendly',
          energyLevel: 'moderate',
          apartmentFriendly: 'false',
          sortBy: 'breed_match'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.pets.length).toBeGreaterThan(0);
      expect(response.body.data.pets[0].breed.toLowerCase()).toContain('golden');
    });

    it('should support complex breed filtering', async () => {
      const response = await request(app)
        .get('/api/pets/discover')
        .set('Authorization', `Bearer ${token}`)
        .query({
          breeds: 'golden retriever,labrador retriever',
          familyFriendly: 'excellent',
          exerciseNeeds: 'high',
          trainability: 'easy'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('appliedFilters');
    });

    it('should provide AI-enhanced recommendations for premium users', async () => {
      const response = await request(app)
        .get('/api/pets/discover')
        .set('Authorization', `Bearer ${token}`)
        .query({
          species: 'dog',
          premiumFeatures: JSON.stringify({ featuared: true })
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('recommendations');
    });

    it('should sort pets by multiple criteria', async () => {
      const sortOptions = ['relevance', 'newest', 'popularity', 'distance', 'breed_match'];
      
      for (const sortBy of sortOptions) {
        const response = await request(app)
          .get('/api/pets/discover')
          .set('Authorization', `Bearer ${token}`)
          .query({ sortBy })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.pets.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle large result sets efficiently', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/breeds?limit=100')
        .expect(200);

      const responseTime = Date.now() - startTime;
      
      expect(response.body.success).toBe(true);
      expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
      expect(response.body.data.breeds.length).toBeGreaterThan(50);
    });

    it('should handle invalid breed queries gracefully', async () => {
      const response = await request(app)
        .get('/api/breeds/nonexistent-breed')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    it('should handle malformed filter parameters', async () => {
      const response = await request(app)
        .get('/api/pets/discover')
        .set('Authorization', `Bearer ${token}`)
        .query({
          ages: 'invalid-age-range',
          species: 'invalid-species'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      // Should default to showing available pets rather than error
    });

    it('should maintain performance with complex queries', async () => {
      const complexQuery = {
        species: 'dog',
        breeds: 'golden retriever,labrador retriever,german shepherd',
        temperament: 'friendly,loyal,intelligent',
        energyLevel: 'moderate,high',
        apartmentFriendly: 'false',
        familyFriendly: 'excellent,good',
        exerciseNeeds: 'moderate,high',
        trainability: 'easy,moderate',
        groomingNeeds: 'minimal,moderate',
        sortBy: 'breed_match',
        limit: 50
      };

      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/pets/discover')
        .set('Authorization', `Bearer ${token}`)
        .query(complexQuery)
        .expect(200);

      const responseTime = Date.now() - startTime;
      
      expect(response.body.success).toBe(true);
      expect(responseTime).toBeLessThan(2000); // Should respond within 2 seconds
      expect(response.body.data).toHaveProperty('performanceMetrics');
    });
  });

  describe('Ultra-Premium Features', () => {
    it('should provide comprehensive breed statistics', async () => {
      const response = await request(app)
        .get('/api/breeds/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('topBreedsByCount');
    });

    it('should filter by premium feature flags', async () => {
      // This test would require creating pets with premium features
      const response = await request(app)
        .get('/api/pets/discover')
        .set('Authorization', `Bearer ${token}`)
        .query({
          verifiedOnly: 'true',
          boostFeature: 'true'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should provide advanced matching algorithm', async () => {
      const response = await request(app)
        .post('/api/pets/match-advanced')
        .set('Authorization', `Bearer ${token}`)
        .send({
          userPreferences: {
            breedPreference: ['golden retriever'],
            temperamentPreference: ['friendly', 'loyal']
          },
          lifestyleFactors: {
            livingSpace: 'house',
            experienceLevel: 'beginner',
            desiredEnergyLevel: 'moderate'
          },
          personalityAssessment: {
            experienceLevel: 'beginner',
            timeCommitment: 'moderate',
            activityLevel: 'moderate'
          }
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.matches.length).toBeGreaterThan(0);
      expect(response.body.data.matches[0]).toHaveProperty('matchScore');
    });
  });

  describe('Search Functionality', () => {
    it('should search breeds with fuzzy matching', async () => {
      const searchTerms = ['retriv', 'german shepher', 'shiba'];
      
      for (const term of searchTerms) {
        const response = await request(app)
          .get(`/api/breeds/search/autocomplete?q=${term}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.suggestions.length).toBeGreaterThan(0);
      }
    });

    it('should provide contextual breed suggestions', async () => {
      const response = await request(app)
        .get('/api/breeds/search/autocomplete?q=golden&species=dog')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.suggestions.every(s => s.species === 'dog')).toBe(true);
      expect(response.body.data.suggestions[0].name.toLowerCase()).toContain('golden');
    });
  });

  describe('Data Integrity', () => {
    it('should maintain breed profile data consistency', async () => {
      const breeds = await BreedProfile.find({}).limit(10);
      
      breeds.forEach(breed => {
        expect(breed.name).toBeDefined();
        expect(breed.species).toBeDefined();
        expect(breed.energyLevel).toMatch(/^(low|moderate|high|very-high)$/);
        expect(breed.popularity).toBeGreaterThanOrEqual(0);
        expect(breed.popularity).toBeLessThanOrEqual(100);
        
        if (breed.temperament) {
          expect(Array.isArray(breed.temperament)).toBe(true);
        }
        
        if (breed.breedCompatibility) {
          expect(breed.breedCompatibility instanceof Map).toBe(true);
        }
      });
    });

    it('should have proper indexes for performance', async () => {
      const indexes = await BreedProfile.collection.indexes();
      
      // Extract field names from indexes, handling different index formats
      const indexNames = indexes.map(index => {
        const keyObj = index.key || index.keyObject || {};
        return Object.keys(keyObj);
      }).filter(names => names.length > 0);
      
      // Check for compound index containing name and species
      const hasNameSpeciesIndex = indexNames.some(names => 
        names.includes('name') && names.includes('species')
      );
      
      // Check for individual field indexes
      const hasTemperamentIndex = indexNames.some(names => names.includes('temperament'));
      const hasEnergyLevelIndex = indexNames.some(names => names.includes('energyLevel'));
      
      expect(hasNameSpeciesIndex || hasTemperamentIndex || hasEnergyLevelIndex).toBe(true);
    });
  });
});

describe('Integration Tests', () => {
  it('should handle end-to-end filtering workflow', async () => {
    // Test the complete user journey from breed search to pet discovery
    let response;
    
    // 1. Search for breeds
    response = await request(app)
      .get('/api/breeds/search/autocomplete?q=gold')
      .expect(200);
    
    expect(response.body.data.suggestions.length).toBeGreaterThan(0);
    
    const breedName = response.body.data.suggestions[0].name;
    
    // 2. Get breed details
    response = await request(app)
      .get(`/api/breeds/${breedName}`)
      .expect(200);
    
    expect(response.body.data.breed.name).toBe(breedName);
    
    // 3. Discover pets with breed-specific filters
    response = await request(app)
      .get('/api/pets/discover')
      .query({ breed: breedName, limit: 5 })
      .expect(200);
    
    expect(response.body.success).toBe(true);
  });
});
