/**
 * File Upload Integration Tests
 * 
 * Tests avatar upload and pet photo uploads
 * Note: Cloudinary is mocked in tests/setup.js
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { app, httpServer } = require('../../server');
const User = require('../../src/models/User');
const Pet = require('../../src/models/Pet');
const path = require('path');

let mongoServer;
let testToken;
let testUserId;

describe('File Upload Tests', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
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
    await User.deleteMany({});
    await Pet.deleteMany({});

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: `uploader${Date.now()}@example.com`,
        password: 'Pass123!',
        firstName: 'Upload',
        lastName: 'User',
        dateOfBirth: '1990-01-01'
      });

    testToken = res.body.data.accessToken;
    testUserId = res.body.data.user._id;
  });

  describe('PUT /api/users/avatar', () => {
    const testImagePath = path.join(__dirname, '../test-image.jpg');

    it('should upload avatar successfully (200)', async () => {
      const res = await request(app)
        .put('/api/users/avatar')
        .set('Authorization', `Bearer ${testToken}`)
        .attach('avatar', testImagePath)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toHaveProperty('avatar');
      expect(res.body.data.user.avatar).toBeTruthy();
    });

    it('should replace existing avatar (200)', async () => {
      // Upload first avatar
      const res1 = await request(app)
        .put('/api/users/avatar')
        .set('Authorization', `Bearer ${testToken}`)
        .attach('avatar', testImagePath)
        .expect(200);

      const firstAvatarUrl = res1.body.data.user.avatar;

      // Upload second avatar
      const res2 = await request(app)
        .put('/api/users/avatar')
        .set('Authorization', `Bearer ${testToken}`)
        .attach('avatar', testImagePath)
        .expect(200);

      expect(res2.body.data.user.avatar).toBeDefined();
      expect(res2.body.data.user.avatar).not.toBe(firstAvatarUrl);
    });

    it('should reject without file (400)', async () => {
      const res = await request(app)
        .put('/api/users/avatar')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('file');
    });

    it('should reject without authentication (401)', async () => {
      await request(app)
        .put('/api/users/avatar')
        .attach('avatar', testImagePath)
        .expect(401);
    });

    it('should reject invalid file type (400)', async () => {
      // Try to upload a non-image file
      const res = await request(app)
        .put('/api/users/avatar')
        .set('Authorization', `Bearer ${testToken}`)
        .attach('avatar', Buffer.from('not an image'), { filename: 'test.txt' })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should reject file too large (400)', async () => {
      // Create a buffer larger than allowed (e.g., 6MB if limit is 5MB)
      const largeBuffer = Buffer.alloc(6 * 1024 * 1024);

      const res = await request(app)
        .put('/api/users/avatar')
        .set('Authorization', `Bearer ${testToken}`)
        .attach('avatar', largeBuffer, { filename: 'large.jpg' })
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/pets with photos', () => {
    const testImagePath = path.join(__dirname, '../test-image.jpg');

    it('should create pet with photo uploads (201)', async () => {
      const res = await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${testToken}`)
        .field('name', 'Photo Pet')
        .field('species', 'dog')
        .field('breed', 'Labrador')
        .field('age', '2')
        .field('gender', 'male')
        .field('size', 'large')
        .field('intent', 'playdate')
        .attach('photos', testImagePath)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.pet.photos).toBeDefined();
      expect(Array.isArray(res.body.data.pet.photos)).toBe(true);
      expect(res.body.data.pet.photos.length).toBeGreaterThan(0);
      expect(res.body.data.pet.photos[0]).toHaveProperty('url');
      expect(res.body.data.pet.photos[0]).toHaveProperty('publicId');
    });

    it('should handle multiple photo uploads (201)', async () => {
      const res = await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${testToken}`)
        .field('name', 'Multi Photo Pet')
        .field('species', 'cat')
        .field('breed', 'Persian')
        .field('age', '1')
        .field('gender', 'female')
        .field('size', 'small')
        .field('intent', 'adoption')
        .attach('photos', testImagePath)
        .attach('photos', testImagePath)
        .attach('photos', testImagePath)
        .expect(201);

      expect(res.body.data.pet.photos.length).toBe(3);
      expect(res.body.data.pet.photos[0].isPrimary).toBe(true);
      expect(res.body.data.pet.photos[1].isPrimary).toBe(false);
    });

    it('should create pet without photos (201)', async () => {
      const res = await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          name: 'No Photo Pet',
          species: 'bird',
          breed: 'Parrot',
          age: 1,
          gender: 'male',
          size: 'tiny',
          intent: 'playdate'
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.pet.photos).toBeDefined();
      expect(res.body.data.pet.photos.length).toBe(0);
    });

    it('should set first photo as primary (201)', async () => {
      const res = await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${testToken}`)
        .field('name', 'Primary Photo Pet')
        .field('species', 'dog')
        .field('breed', 'Beagle')
        .field('age', '3')
        .field('gender', 'male')
        .field('size', 'medium')
        .field('intent', 'playdate')
        .attach('photos', testImagePath)
        .attach('photos', testImagePath)
        .expect(201);

      const photos = res.body.data.pet.photos;
      const primaryPhotos = photos.filter(p => p.isPrimary);
      expect(primaryPhotos.length).toBe(1);
      expect(photos[0].isPrimary).toBe(true);
    });

    it('should reject invalid photo format (400)', async () => {
      const res = await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${testToken}`)
        .field('name', 'Invalid Photo Pet')
        .field('species', 'dog')
        .field('breed', 'Poodle')
        .field('age', '2')
        .field('gender', 'female')
        .field('size', 'small')
        .field('intent', 'playdate')
        .attach('photos', Buffer.from('not an image'), { filename: 'test.txt' })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should limit number of photos (400)', async () => {
      const req = request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${testToken}`)
        .field('name', 'Too Many Photos Pet')
        .field('species', 'dog')
        .field('breed', 'Husky')
        .field('age', '2')
        .field('gender', 'male')
        .field('size', 'large')
        .field('intent', 'playdate');

      // Attach more than allowed (e.g., 11 photos if limit is 10)
      for (let i = 0; i < 11; i++) {
        req.attach('photos', testImagePath);
      }

      const res = await req.expect(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('photo');
    });
  });

  describe('PUT /api/pets/:id with photo updates', () => {
    let petId;
    const testImagePath = path.join(__dirname, '../test-image.jpg');

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          name: 'Updatable Pet',
          species: 'cat',
          breed: 'Siamese',
          age: 2,
          gender: 'female',
          size: 'small',
          intent: 'adoption'
        });

      petId = res.body.data.pet._id;
    });

    it('should add photos to existing pet (200)', async () => {
      const res = await request(app)
        .put(`/api/pets/${petId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .attach('photos', testImagePath)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.pet.photos.length).toBeGreaterThan(0);
    });

    it('should update pet without changing photos (200)', async () => {
      const res = await request(app)
        .put(`/api/pets/${petId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          name: 'Updated Name',
          description: 'Updated description'
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.pet.name).toBe('Updated Name');
    });
  });

  describe('DELETE /api/pets/:id with photo cleanup', () => {
    let petId;
    const testImagePath = path.join(__dirname, '../test-image.jpg');

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${testToken}`)
        .field('name', 'Deletable Pet')
        .field('species', 'dog')
        .field('breed', 'Labrador')
        .field('age', '2')
        .field('gender', 'male')
        .field('size', 'large')
        .field('intent', 'playdate')
        .attach('photos', testImagePath)
        .expect(201);

      petId = res.body.data.pet._id;
    });

    it('should delete pet and clean up photos (200)', async () => {
      const res = await request(app)
        .delete(`/api/pets/${petId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);

      // Verify pet is deleted
      const deletedPet = await Pet.findById(petId);
      expect(deletedPet).toBeNull();
    });
  });
});

