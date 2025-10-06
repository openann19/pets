/**
 * Pact Contract Tests - Pets API
 * Defines contracts for pet management endpoints
 */
const provider = require('./pact-setup');
const { eachLike, like, term } = require('@pact-foundation/pact').Matchers;

describe('Pets API Contract', () => {
  beforeAll(() => provider.setup());
  afterEach(() => provider.verify());
  afterAll(() => provider.finalize());

  describe('GET /api/pets', () => {
    beforeEach(() => {
      const interaction = {
        state: 'user has pets',
        uponReceiving: 'a request for user pets',
        withRequest: {
          method: 'GET',
          path: '/api/pets',
          headers: {
            'Authorization': 'Bearer valid-access-token',
          },
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            success: true,
            data: {
              pets: eachLike({
                id: like('507f1f77bcf86cd799439011'),
                name: like('Buddy'),
                species: like('dog'),
                breed: like('Golden Retriever'),
                age: like(3),
                gender: like('male'),
                size: like('large'),
                bio: like('Friendly and energetic dog'),
                photos: eachLike('https://example.com/photo.jpg'),
                location: {
                  type: 'Point',
                  coordinates: eachLike(-122.4194),
                },
                ownerId: like('507f1f77bcf86cd799439011'),
                createdAt: term({
                  matcher: '\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z',
                  generate: '2024-01-01T00:00:00.000Z',
                }),
              }),
            },
            message: 'Pets retrieved successfully',
          },
        },
      };

      return provider.addInteraction(interaction);
    });

    it('should return user pets', async () => {
      const response = await fetch('http://localhost:1234/api/pets', {
        headers: {
          'Authorization': 'Bearer valid-access-token',
        },
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data.pets)).toBe(true);
      expect(data.data.pets[0]).toHaveProperty('id');
      expect(data.data.pets[0]).toHaveProperty('name');
      expect(data.data.pets[0]).toHaveProperty('species');
    });
  });

  describe('POST /api/pets', () => {
    beforeEach(() => {
      const interaction = {
        state: 'user authenticated',
        uponReceiving: 'a request to create a new pet',
        withRequest: {
          method: 'POST',
          path: '/api/pets',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer valid-access-token',
          },
          body: {
            name: 'Max',
            species: 'dog',
            breed: 'Labrador',
            age: 2,
            gender: 'male',
            size: 'large',
            bio: 'Friendly and energetic dog',
            location: {
              type: 'Point',
              coordinates: [-122.4194, 37.7749],
            },
          },
        },
        willRespondWith: {
          status: 201,
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            success: true,
            data: {
              pet: {
                id: like('507f1f77bcf86cd799439011'),
                name: 'Max',
                species: 'dog',
                breed: 'Labrador',
                age: 2,
                gender: 'male',
                size: 'large',
                bio: 'Friendly and energetic dog',
                photos: [],
                location: {
                  type: 'Point',
                  coordinates: [-122.4194, 37.7749],
                },
                ownerId: like('507f1f77bcf86cd799439011'),
                createdAt: term({
                  matcher: '\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z',
                  generate: '2024-01-01T00:00:00.000Z',
                }),
              },
            },
            message: 'Pet created successfully',
          },
        },
      };

      return provider.addInteraction(interaction);
    });

    it('should create a new pet', async () => {
      const response = await fetch('http://localhost:1234/api/pets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-access-token',
        },
        body: JSON.stringify({
          name: 'Max',
          species: 'dog',
          breed: 'Labrador',
          age: 2,
          gender: 'male',
          size: 'large',
          bio: 'Friendly and energetic dog',
          location: {
            type: 'Point',
            coordinates: [-122.4194, 37.7749],
          },
        }),
      });

      const data = await response.json();
      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.pet.name).toBe('Max');
      expect(data.data.pet.species).toBe('dog');
    });
  });

  describe('GET /api/pets/discover', () => {
    beforeEach(() => {
      const interaction = {
        state: 'pets available for discovery',
        uponReceiving: 'a request for discoverable pets',
        withRequest: {
          method: 'GET',
          path: '/api/pets/discover',
          headers: {
            'Authorization': 'Bearer valid-access-token',
          },
          query: {
            page: '1',
            limit: '10',
            species: 'dog',
            ageMin: '1',
            ageMax: '5',
          },
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            success: true,
            data: {
              pets: eachLike({
                id: like('507f1f77bcf86cd799439011'),
                name: like('Buddy'),
                species: 'dog',
                breed: like('Golden Retriever'),
                age: like(3),
                gender: like('male'),
                size: like('large'),
                bio: like('Friendly and energetic dog'),
                photos: eachLike('https://example.com/photo.jpg'),
                location: {
                  type: 'Point',
                  coordinates: eachLike(-122.4194),
                },
                owner: {
                  id: like('507f1f77bcf86cd799439011'),
                  name: like('John Doe'),
                },
                distance: like(2.5),
              }),
              pagination: {
                page: 1,
                limit: 10,
                total: like(25),
                pages: like(3),
              },
            },
            message: 'Discoverable pets retrieved successfully',
          },
        },
      };

      return provider.addInteraction(interaction);
    });

    it('should return discoverable pets with filters', async () => {
      const response = await fetch('http://localhost:1234/api/pets/discover?page=1&limit=10&species=dog&ageMin=1&ageMax=5', {
        headers: {
          'Authorization': 'Bearer valid-access-token',
        },
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data.pets)).toBe(true);
      expect(data.data.pagination).toBeDefined();
      expect(data.data.pagination.page).toBe(1);
    });
  });

  describe('POST /api/pets/:id/like', () => {
    beforeEach(() => {
      const interaction = {
        state: 'pet exists and user authenticated',
        uponReceiving: 'a request to like a pet',
        withRequest: {
          method: 'POST',
          path: '/api/pets/507f1f77bcf86cd799439011/like',
          headers: {
            'Authorization': 'Bearer valid-access-token',
          },
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            success: true,
            data: {
              isMatch: like(false),
              match: null,
            },
            message: 'Pet liked successfully',
          },
        },
      };

      return provider.addInteraction(interaction);
    });

    it('should like a pet', async () => {
      const response = await fetch('http://localhost:1234/api/pets/507f1f77bcf86cd799439011/like', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-access-token',
        },
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(typeof data.data.isMatch).toBe('boolean');
    });
  });

  describe('POST /api/pets/:id/pass', () => {
    beforeEach(() => {
      const interaction = {
        state: 'pet exists and user authenticated',
        uponReceiving: 'a request to pass on a pet',
        withRequest: {
          method: 'POST',
          path: '/api/pets/507f1f77bcf86cd799439011/pass',
          headers: {
            'Authorization': 'Bearer valid-access-token',
          },
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            success: true,
            data: {},
            message: 'Pet passed successfully',
          },
        },
      };

      return provider.addInteraction(interaction);
    });

    it('should pass on a pet', async () => {
      const response = await fetch('http://localhost:1234/api/pets/507f1f77bcf86cd799439011/pass', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-access-token',
        },
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });
});
