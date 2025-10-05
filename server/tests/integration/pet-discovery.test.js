/**
 * Pet Discovery & Filtering Integration Tests
 * 
 * Tests advanced discovery with filters, pagination, and distance
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { app, httpServer } = require('../../server');
const User = require('../../src/models/User');
const Pet = require('../../src/models/Pet');

let mongoServer;
let testToken;
let testUserId;

describe('Pet Discovery & Filtering Tests', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    // Create test user
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: `discoverer${Date.now()}@example.com`,
        password: 'Pass123!',
        firstName: 'Discover',
        lastName: 'User',
        dateOfBirth: '1990-01-01'
      });

    testToken = res.body.data.accessToken;
    testUserId = res.body.data.user._id;

    // Create diverse set of pets from other users
    const otherUsers = [];
    for (let i = 0; i < 3; i++) {
      const userRes = await request(app)
        .post('/api/auth/register')
        .send({
          email: `petowner${i}${Date.now()}@example.com`,
          password: 'Pass123!',
          firstName: `Owner`,
          lastName: `${i}`,
          dateOfBirth: '1990-01-01'
        });
      otherUsers.push(userRes.body.data);
    }

    // Create various pets
    const petData = [
      { name: 'YoungDog', species: 'dog', breed: 'Labrador', age: 1, size: 'large', intent: 'playdate', gender: 'male' },
      { name: 'OldDog', species: 'dog', breed: 'Beagle', age: 10, size: 'medium', intent: 'adoption', gender: 'female' },
      { name: 'YoungCat', species: 'cat', breed: 'Persian', age: 2, size: 'small', intent: 'adoption', gender: 'male' },
      { name: 'SmallBird', species: 'bird', breed: 'Parrot', age: 3, size: 'tiny', intent: 'companionship', gender: 'female' },
      { name: 'MiddleAgeDog', species: 'dog', breed: 'Poodle', age: 5, size: 'small', intent: 'playdate', gender: 'male' },
    ];

    for (let i = 0; i < petData.length; i++) {
      await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${otherUsers[i % otherUsers.length].accessToken}`)
        .send(petData[i]);
    }
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

  describe('GET /api/pets/discover with filters', () => {
    it('should discover pets without filters (200)', async () => {
      const res = await request(app)
        .get('/api/pets/discover')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('pets');
      expect(Array.isArray(res.body.data.pets)).toBe(true);
      expect(res.body.data.pets.length).toBeGreaterThan(0);
    });

    it('should filter by species (200)', async () => {
      const res = await request(app)
        .get('/api/pets/discover?species=dog')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      const pets = res.body.data.pets;
      pets.forEach(pet => {
        expect(pet.species).toBe('dog');
      });
    });

    it('should filter by multiple species (200)', async () => {
      const res = await request(app)
        .get('/api/pets/discover?species=dog,cat')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      const pets = res.body.data.pets;
      pets.forEach(pet => {
        expect(['dog', 'cat']).toContain(pet.species);
      });
    });

    it('should filter by size (200)', async () => {
      const res = await request(app)
        .get('/api/pets/discover?size=small')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      const pets = res.body.data.pets;
      pets.forEach(pet => {
        expect(pet.size).toBe('small');
      });
    });

    it('should filter by age range (200)', async () => {
      const res = await request(app)
        .get('/api/pets/discover?minAge=2&maxAge=5')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      const pets = res.body.data.pets;
      pets.forEach(pet => {
        expect(pet.age).toBeGreaterThanOrEqual(2);
        expect(pet.age).toBeLessThanOrEqual(5);
      });
    });

    it('should filter by intent (200)', async () => {
      const res = await request(app)
        .get('/api/pets/discover?intent=adoption')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      const pets = res.body.data.pets;
      pets.forEach(pet => {
        expect(pet.intent).toBe('adoption');
      });
    });

    it('should filter by gender (200)', async () => {
      const res = await request(app)
        .get('/api/pets/discover?gender=male')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      const pets = res.body.data.pets;
      pets.forEach(pet => {
        expect(pet.gender).toBe('male');
      });
    });

    it('should filter by breed (200)', async () => {
      const res = await request(app)
        .get('/api/pets/discover?breed=Labrador')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      const pets = res.body.data.pets;
      if (pets.length > 0) {
        pets.forEach(pet => {
          expect(pet.breed.toLowerCase()).toContain('labrador');
        });
      }
    });

    it('should combine multiple filters (200)', async () => {
      const res = await request(app)
        .get('/api/pets/discover?species=dog&size=large&intent=playdate')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      const pets = res.body.data.pets;
      pets.forEach(pet => {
        expect(pet.species).toBe('dog');
        expect(pet.size).toBe('large');
        expect(pet.intent).toBe('playdate');
      });
    });

    it('should handle pagination with limit (200)', async () => {
      const res = await request(app)
        .get('/api/pets/discover?limit=2')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(res.body.data.pets.length).toBeLessThanOrEqual(2);
    });

    it('should handle pagination with skip (200)', async () => {
      const res1 = await request(app)
        .get('/api/pets/discover?limit=2')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      const res2 = await request(app)
        .get('/api/pets/discover?limit=2&skip=2')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      // Verify different results
      if (res1.body.data.pets.length > 0 && res2.body.data.pets.length > 0) {
        expect(res1.body.data.pets[0]._id).not.toBe(res2.body.data.pets[0]._id);
      }
    });

    it('should return empty array for impossible filters (200)', async () => {
      const res = await request(app)
        .get('/api/pets/discover?species=dragon&size=gigantic')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(res.body.data.pets).toEqual([]);
    });

    it('should exclude user\'s own pets', async () => {
      // Create a pet for the test user
      await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          name: 'MyOwnPet',
          species: 'dog',
          breed: 'Unique Breed XYZ',
          age: 2,
          gender: 'male',
          size: 'medium',
          intent: 'playdate'
        });

      const res = await request(app)
        .get('/api/pets/discover')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      const pets = res.body.data.pets;
      const ownPets = pets.filter(pet => pet.owner === testUserId || pet.owner._id === testUserId);
      expect(ownPets.length).toBe(0);
    });

    it('should exclude already swiped pets', async () => {
      // Get a pet to swipe
      const discoverRes = await request(app)
        .get('/api/pets/discover')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      if (discoverRes.body.data.pets.length > 0) {
        const petToSwipe = discoverRes.body.data.pets[0];
        
        // Create own pet first
        const ownPetRes = await request(app)
          .post('/api/pets')
          .set('Authorization', `Bearer ${testToken}`)
          .send({
            name: 'SwipePet',
            species: 'cat',
            breed: 'Persian',
            age: 2,
            gender: 'male',
            size: 'small',
            intent: 'adoption'
          });

        // Swipe on the pet
        await request(app)
          .post(`/api/pets/${petToSwipe._id}/swipe`)
          .set('Authorization', `Bearer ${testToken}`)
          .send({
            petId: ownPetRes.body.data.pet._id,
            action: 'like'
          });

        // Discover again
        const res2 = await request(app)
          .get('/api/pets/discover')
          .set('Authorization', `Bearer ${testToken}`)
          .expect(200);

        const petIds = res2.body.data.pets.map(p => p._id);
        expect(petIds).not.toContain(petToSwipe._id);
      }
    });

    it('should allow discovery without authentication (200)', async () => {
      // /discover uses optionalAuth, so unauthenticated requests are allowed
      const res = await request(app)
        .get('/api/pets/discover')
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('pets');
    });

    it('should handle invalid query parameters gracefully (200)', async () => {
      const res = await request(app)
        .get('/api/pets/discover?invalidParam=test&age=notANumber')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('pets');
    });
  });

  describe('GET /api/pets/my-pets with filters', () => {
    beforeEach(async () => {
      await Pet.deleteMany({ owner: testUserId });
      
      // Create multiple pets for the user
      const myPets = [
        { name: 'MyDog1', species: 'dog', breed: 'Labrador', age: 2, size: 'large', intent: 'playdate', gender: 'male' },
        { name: 'MyCat1', species: 'cat', breed: 'Persian', age: 1, size: 'small', intent: 'adoption', gender: 'female' },
        { name: 'MyDog2', species: 'dog', breed: 'Beagle', age: 5, size: 'medium', intent: 'playdate', gender: 'male' },
      ];

      for (const petData of myPets) {
        await request(app)
          .post('/api/pets')
          .set('Authorization', `Bearer ${testToken}`)
          .send(petData);
      }
    });

    it('should get all user pets (200)', async () => {
      const res = await request(app)
        .get('/api/pets/my-pets')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.pets.length).toBe(3);
    });

    it('should filter user pets by species (200)', async () => {
      const res = await request(app)
        .get('/api/pets/my-pets?species=dog')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(res.body.data.pets.length).toBe(2);
      res.body.data.pets.forEach(pet => {
        expect(pet.species).toBe('dog');
      });
    });

    it('should reject without authentication (401)', async () => {
      await request(app)
        .get('/api/pets/my-pets')
        .expect(401);
    });
  });
});

