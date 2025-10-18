/**
 * E2E Tests for Premium Features and Stripe Integration
 * Comprehensive testing of premium features, subscription management, and payment processing
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let app;
let mongoServer;
let userToken;
let premiumUserToken;

describe('Premium Features and Stripe Integration E2E Tests', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    process.env.MONGODB_URI = mongoUri;
    process.env.JWT_SECRET = 'test-secret-key-for-e2e-tests-only-minimum-32-characters-long';
    process.env.CLIENT_URL = 'http://localhost:3000';
    process.env.NODE_ENV = 'test';
    process.env.STRIPE_SECRET_KEY = 'sk_test_fake_key_for_testing';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_fake_secret';
    process.env.STRIPE_PRICE_MONTHLY = 'price_monthly_test';
    process.env.STRIPE_PRICE_YEARLY = 'price_yearly_test';
    process.env.STRIPE_PRICE_LIFETIME = 'price_lifetime_test';
    
    await mongoose.connect(mongoUri);
    app = require('../../server');
    
    // Create test users
    await setupTestData();
  }, 30000);

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
  }, 30000);

  async function setupTestData() {
    // Create regular user
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: `user${Date.now()}@example.com`,
        password: 'Test123!@#',
        firstName: 'Regular',
        lastName: 'User',
        dateOfBirth: '1990-01-01'
      });
    userToken = userResponse.body.data.accessToken;

    // Create premium user
    const premiumUserResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: `premium${Date.now()}@example.com`,
        password: 'Test123!@#',
        firstName: 'Premium',
        lastName: 'User',
        dateOfBirth: '1985-05-15'
      });
    premiumUserToken = premiumUserResponse.body.data.accessToken;

    // Create premium subscription for premium user
    await mongoose.connection.db.collection('subscriptions').insertOne({
      userId: premiumUserResponse.body.data.user._id,
      stripeSubscriptionId: 'sub_test_premium',
      status: 'active',
      plan: 'premium',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  describe('Subscription Plans', () => {
    it('should get available subscription plans', async () => {
      const response = await request(app)
        .get('/api/premium/plans')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      const plans = response.body.data;
      expect(plans).toContainEqual(expect.objectContaining({
        id: 'monthly',
        name: 'Monthly',
        price: 999,
        interval: 'month'
      }));
      expect(plans).toContainEqual(expect.objectContaining({
        id: 'yearly',
        name: 'Yearly',
        price: 9999,
        interval: 'year'
      }));
      expect(plans).toContainEqual(expect.objectContaining({
        id: 'lifetime',
        name: 'Lifetime',
        price: 29999,
        interval: 'one_time'
      }));
    });

    it('should get plan features', async () => {
      const response = await request(app)
        .get('/api/premium/features')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      const features = response.body.data;
      expect(features).toContainEqual(expect.objectContaining({
        id: 'unlimited_likes',
        name: 'Unlimited Likes',
        description: 'Like as many pets as you want'
      }));
      expect(features).toContainEqual(expect.objectContaining({
        id: 'super_likes',
        name: 'Super Likes',
        description: 'Get 5 super likes per day'
      }));
      expect(features).toContainEqual(expect.objectContaining({
        id: 'boost',
        name: 'Profile Boost',
        description: 'Boost your profile visibility'
      }));
    });
  });

  describe('Stripe Checkout Session Creation', () => {
    it('should create checkout session for monthly plan', async () => {
      const response = await request(app)
        .post('/api/premium/checkout')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          planId: 'monthly',
          successUrl: 'http://localhost:3000/success',
          cancelUrl: 'http://localhost:3000/cancel'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('sessionId');
      expect(response.body.data).toHaveProperty('url');
      expect(response.body.data.planId).toBe('monthly');
    });

    it('should create checkout session for yearly plan', async () => {
      const response = await request(app)
        .post('/api/premium/checkout')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          planId: 'yearly',
          successUrl: 'http://localhost:3000/success',
          cancelUrl: 'http://localhost:3000/cancel'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('sessionId');
      expect(response.body.data).toHaveProperty('url');
      expect(response.body.data.planId).toBe('yearly');
    });

    it('should create checkout session for lifetime plan', async () => {
      const response = await request(app)
        .post('/api/premium/checkout')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          planId: 'lifetime',
          successUrl: 'http://localhost:3000/success',
          cancelUrl: 'http://localhost:3000/cancel'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('sessionId');
      expect(response.body.data).toHaveProperty('url');
      expect(response.body.data.planId).toBe('lifetime');
    });

    it('should not create checkout session for invalid plan', async () => {
      const response = await request(app)
        .post('/api/premium/checkout')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          planId: 'invalid-plan',
          successUrl: 'http://localhost:3000/success',
          cancelUrl: 'http://localhost:3000/cancel'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('plan');
    });

    it('should not create checkout session for existing premium user', async () => {
      const response = await request(app)
        .post('/api/premium/checkout')
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .send({
          planId: 'monthly',
          successUrl: 'http://localhost:3000/success',
          cancelUrl: 'http://localhost:3000/cancel'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('premium');
    });
  });

  describe('Stripe Webhook Handling', () => {
    it('should handle checkout.session.completed webhook', async () => {
      const webhookPayload = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_session',
            customer: 'cus_test_customer',
            subscription: 'sub_test_subscription',
            payment_status: 'paid',
            metadata: {
              userId: 'test_user_id',
              planId: 'monthly'
            }
          }
        }
      };

      const response = await request(app)
        .post('/api/premium/webhook')
        .set('stripe-signature', 'test_signature')
        .send(webhookPayload)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('processed');
    });

    it('should handle invoice.payment_succeeded webhook', async () => {
      const webhookPayload = {
        type: 'invoice.payment_succeeded',
        data: {
          object: {
            id: 'in_test_invoice',
            subscription: 'sub_test_subscription',
            amount_paid: 999,
            status: 'paid'
          }
        }
      };

      const response = await request(app)
        .post('/api/premium/webhook')
        .set('stripe-signature', 'test_signature')
        .send(webhookPayload)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('processed');
    });

    it('should handle invoice.payment_failed webhook', async () => {
      const webhookPayload = {
        type: 'invoice.payment_failed',
        data: {
          object: {
            id: 'in_test_invoice',
            subscription: 'sub_test_subscription',
            amount_due: 999,
            status: 'open'
          }
        }
      };

      const response = await request(app)
        .post('/api/premium/webhook')
        .set('stripe-signature', 'test_signature')
        .send(webhookPayload)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('processed');
    });

    it('should handle customer.subscription.deleted webhook', async () => {
      const webhookPayload = {
        type: 'customer.subscription.deleted',
        data: {
          object: {
            id: 'sub_test_subscription',
            status: 'canceled',
            canceled_at: Math.floor(Date.now() / 1000)
          }
        }
      };

      const response = await request(app)
        .post('/api/premium/webhook')
        .set('stripe-signature', 'test_signature')
        .send(webhookPayload)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('processed');
    });

    it('should handle invalid webhook signature', async () => {
      const webhookPayload = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_session'
          }
        }
      };

      const response = await request(app)
        .post('/api/premium/webhook')
        .set('stripe-signature', 'invalid_signature')
        .send(webhookPayload)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('signature');
    });

    it('should handle unknown webhook type', async () => {
      const webhookPayload = {
        type: 'unknown.webhook.type',
        data: {
          object: {
            id: 'test_object'
          }
        }
      };

      const response = await request(app)
        .post('/api/premium/webhook')
        .set('stripe-signature', 'test_signature')
        .send(webhookPayload)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('ignored');
    });
  });

  describe('Subscription Management', () => {
    it('should get current subscription for premium user', async () => {
      const response = await request(app)
        .get('/api/premium/subscription')
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('status', 'active');
      expect(response.body.data).toHaveProperty('plan', 'premium');
      expect(response.body.data).toHaveProperty('currentPeriodStart');
      expect(response.body.data).toHaveProperty('currentPeriodEnd');
    });

    it('should get subscription history for premium user', async () => {
      const response = await request(app)
        .get('/api/premium/subscription/history')
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should cancel subscription', async () => {
      const response = await request(app)
        .post('/api/premium/subscription/cancel')
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .send({
          reason: 'no_longer_needed'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('canceled');
    });

    it('should reactivate subscription', async () => {
      const response = await request(app)
        .post('/api/premium/subscription/reactivate')
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('reactivated');
    });

    it('should update payment method', async () => {
      const response = await request(app)
        .post('/api/premium/subscription/payment-method')
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .send({
          paymentMethodId: 'pm_test_payment_method'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('updated');
    });

    it('should not allow subscription management for non-premium user', async () => {
      const response = await request(app)
        .get('/api/premium/subscription')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('subscription');
    });
  });

  describe('Premium Features Usage', () => {
    it('should allow unlimited likes for premium user', async () => {
      // Create test pets to like
      const pet1Response = await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .send({
          name: 'Test Pet 1',
          species: 'dog',
          breed: 'Test Breed',
          age: 2,
          gender: 'male',
          size: 'medium',
          description: 'Test pet',
          temperament: ['friendly'],
          vaccinated: true,
          neutered: true,
          location: {
            city: 'Test City',
            state: 'TS',
            coordinates: { latitude: 40.7128, longitude: -74.0060 }
          }
        });

      const pet2Response = await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .send({
          name: 'Test Pet 2',
          species: 'cat',
          breed: 'Test Breed',
          age: 1,
          gender: 'female',
          size: 'small',
          description: 'Test pet',
          temperament: ['calm'],
          vaccinated: true,
          neutered: true,
          location: {
            city: 'Test City',
            state: 'TS',
            coordinates: { latitude: 40.7128, longitude: -74.0060 }
          }
        });

      expect(pet2Response.status).toBe(200);
      expect(pet2Response.body.success).toBe(true);

      // Like multiple pets
      for (let i = 0; i < 10; i++) {
        const response = await request(app)
          .post(`/api/pets/${pet1Response.body.data._id}/swipe`)
          .set('Authorization', `Bearer ${premiumUserToken}`)
          .send({ action: 'like' })
          .expect(200);

        expect(response.body.success).toBe(true);
      }
    });

    it('should limit likes for free user', async () => {
      // Create test pet
      const petResponse = await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Test Pet',
          species: 'dog',
          breed: 'Test Breed',
          age: 2,
          gender: 'male',
          size: 'medium',
          description: 'Test pet',
          temperament: ['friendly'],
          vaccinated: true,
          neutered: true,
          location: {
            city: 'Test City',
            state: 'TS',
            coordinates: { latitude: 40.7128, longitude: -74.0060 }
          }
        });

      // Try to like multiple times (should hit rate limit)
      let rateLimited = false;
      for (let i = 0; i < 10; i++) {
        const response = await request(app)
          .post(`/api/pets/${petResponse.body.data._id}/swipe`)
          .set('Authorization', `Bearer ${userToken}`)
          .send({ action: 'like' });

        if (response.status === 429) {
          rateLimited = true;
          break;
        }
      }

      expect(rateLimited).toBe(true);
    });

    it('should allow super likes for premium user', async () => {
      // Create test pet
      const petResponse = await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .send({
          name: 'Test Pet',
          species: 'dog',
          breed: 'Test Breed',
          age: 2,
          gender: 'male',
          size: 'medium',
          description: 'Test pet',
          temperament: ['friendly'],
          vaccinated: true,
          neutered: true,
          location: {
            city: 'Test City',
            state: 'TS',
            coordinates: { latitude: 40.7128, longitude: -74.0060 }
          }
        });

      const response = await request(app)
        .post(`/api/pets/${petResponse.body.data._id}/swipe`)
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .send({ action: 'superlike' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.action).toBe('superlike');
    });

    it('should allow profile boost for premium user', async () => {
      const response = await request(app)
        .post('/api/premium/boost')
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .send({
          duration: 24 // 24 hours
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('boostId');
      expect(response.body.data).toHaveProperty('expiresAt');
    });

    it('should not allow super likes for free user', async () => {
      // Create test pet
      const petResponse = await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Test Pet',
          species: 'dog',
          breed: 'Test Breed',
          age: 2,
          gender: 'male',
          size: 'medium',
          description: 'Test pet',
          temperament: ['friendly'],
          vaccinated: true,
          neutered: true,
          location: {
            city: 'Test City',
            state: 'TS',
            coordinates: { latitude: 40.7128, longitude: -74.0060 }
          }
        });

      const response = await request(app)
        .post(`/api/pets/${petResponse.body.data._id}/swipe`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ action: 'superlike' })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('premium');
    });

    it('should not allow profile boost for free user', async () => {
      const response = await request(app)
        .post('/api/premium/boost')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          duration: 24
        })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('premium');
    });
  });

  describe('Premium Feature Limits', () => {
    it('should track super like usage', async () => {
      const response = await request(app)
        .get('/api/premium/usage')
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('superLikesUsed');
      expect(response.body.data).toHaveProperty('superLikesRemaining');
      expect(response.body.data).toHaveProperty('boostsUsed');
      expect(response.body.data).toHaveProperty('boostsRemaining');
    });

    it('should reset usage limits daily', async () => {
      // Set usage to maximum
      await mongoose.connection.db.collection('premiumusage').updateOne(
        { userId: premiumUserToken },
        { $set: { superLikesUsed: 5, lastReset: new Date(Date.now() - 25 * 60 * 60 * 1000) } }
      );

      const response = await request(app)
        .get('/api/premium/usage')
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.superLikesRemaining).toBe(5);
    });

    it('should not allow exceeding super like limit', async () => {
      // Set usage to maximum
      await mongoose.connection.db.collection('premiumusage').updateOne(
        { userId: premiumUserToken },
        { $set: { superLikesUsed: 5, lastReset: new Date() } }
      );

      // Create test pet
      const petResponse = await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .send({
          name: 'Test Pet',
          species: 'dog',
          breed: 'Test Breed',
          age: 2,
          gender: 'male',
          size: 'medium',
          description: 'Test pet',
          temperament: ['friendly'],
          vaccinated: true,
          neutered: true,
          location: {
            city: 'Test City',
            state: 'TS',
            coordinates: { latitude: 40.7128, longitude: -74.0060 }
          }
        });

      const response = await request(app)
        .post(`/api/pets/${petResponse.body.data._id}/swipe`)
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .send({ action: 'superlike' })
        .expect(429);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('limit');
    });
  });

  describe('Error Handling', () => {
    it('should handle Stripe API errors gracefully', async () => {
      const response = await request(app)
        .post('/api/premium/checkout')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          planId: 'monthly',
          successUrl: 'http://localhost:3000/success',
          cancelUrl: 'http://localhost:3000/cancel'
        })
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('error');
    });

    it('should handle invalid webhook payload', async () => {
      const response = await request(app)
        .post('/api/premium/webhook')
        .set('stripe-signature', 'test_signature')
        .send('invalid json')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('payload');
    });

    it('should handle missing authorization header', async () => {
      const response = await request(app)
        .get('/api/premium/subscription')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('token');
    });
  });

  describe('Performance', () => {
    it('should handle checkout session creation efficiently', async () => {
      const startTime = Date.now();

      const response = await request(app)
        .post('/api/premium/checkout')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          planId: 'monthly',
          successUrl: 'http://localhost:3000/success',
          cancelUrl: 'http://localhost:3000/cancel'
        })
        .expect(200);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.body.success).toBe(true);
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle webhook processing efficiently', async () => {
      const webhookPayload = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_session',
            customer: 'cus_test_customer',
            subscription: 'sub_test_subscription',
            payment_status: 'paid',
            metadata: {
              userId: 'test_user_id',
              planId: 'monthly'
            }
          }
        }
      };

      const startTime = Date.now();

      const response = await request(app)
        .post('/api/premium/webhook')
        .set('stripe-signature', 'test_signature')
        .send(webhookPayload)
        .expect(200);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.body.success).toBe(true);
      expect(duration).toBeLessThan(500); // Should complete within 500ms
    });
  });
});
