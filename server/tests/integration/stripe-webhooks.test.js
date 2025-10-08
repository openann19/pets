/**
 * Stripe Webhook Integration Tests
 * Tests webhook signature validation, event processing, and error handling
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { app, httpServer } = require('../../server');
const User = require('../../src/models/User');
const stripe = require('stripe');

let mongoServer;
let testUser;
let testToken;

// Mock Stripe for testing
jest.mock('stripe', () => {
  return jest.fn(() => ({
    webhooks: {
      constructEvent: jest.fn()
    },
    events: {
      list: jest.fn()
    }
  }));
});

describe('Stripe Webhook Integration Tests', () => {
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

    // Create test user
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: `stripe${Date.now()}@example.com`,
        password: 'Test123!@#',
        firstName: 'Stripe',
        lastName: 'Test',
        dateOfBirth: '1990-01-01'
      });

    testUser = res.body.data.user;
    testToken = res.body.data.accessToken;

    // Mock Stripe instance
    const mockStripe = stripe();
    mockStripe.webhooks.constructEvent.mockClear();
    mockStripe.events.list.mockClear();
  });

  describe('POST /api/stripe/webhook', () => {
    const validWebhookPayload = JSON.stringify({
      id: 'evt_test_webhook',
      type: 'customer.subscription.created',
      data: {
        object: {
          id: 'sub_test_123',
          customer: 'cus_test_123',
          status: 'active',
          current_period_start: Math.floor(Date.now() / 1000),
          current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
          cancel_at_period_end: false,
          created: Math.floor(Date.now() / 1000),
          items: {
            data: [{
              price: {
                id: 'price_premium_monthly'
              }
            }]
          }
        }
      }
    });

    const validSignature = 't=1234567890,v1=valid_signature_hash';

    it('should process valid webhook with correct signature (200)', async () => {
      const mockStripe = stripe();
      mockStripe.webhooks.constructEvent.mockReturnValue(JSON.parse(validWebhookPayload));

      const res = await request(app)
        .post('/api/stripe/webhook')
        .set('stripe-signature', validSignature)
        .set('content-type', 'application/json')
        .send(validWebhookPayload)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(mockStripe.webhooks.constructEvent).toHaveBeenCalledWith(
        validWebhookPayload,
        validSignature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    });

    it('should reject webhook without signature header (400)', async () => {
      const res = await request(app)
        .post('/api/stripe/webhook')
        .set('content-type', 'application/json')
        .send(validWebhookPayload)
        .expect(400);

      expect(res.text).toContain('Missing signature header');
    });

    it('should reject webhook with invalid signature (400)', async () => {
      const mockStripe = stripe();
      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      const res = await request(app)
        .post('/api/stripe/webhook')
        .set('stripe-signature', 'invalid_signature')
        .set('content-type', 'application/json')
        .send(validWebhookPayload)
        .expect(400);

      expect(res.text).toContain('Webhook signature verification failed');
    });

    it('should handle customer.subscription.created event', async () => {
      const mockStripe = stripe();
      const subscriptionEvent = {
        id: 'evt_subscription_created',
        type: 'customer.subscription.created',
        data: {
          object: {
            id: 'sub_new_123',
            customer: 'cus_test_123',
            status: 'active',
            current_period_start: Math.floor(Date.now() / 1000),
            current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
            items: {
              data: [{
                price: {
                  id: 'price_premium_monthly'
                }
              }]
            }
          }
        }
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(subscriptionEvent);

      const res = await request(app)
        .post('/api/stripe/webhook')
        .set('stripe-signature', validSignature)
        .set('content-type', 'application/json')
        .send(JSON.stringify(subscriptionEvent))
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.eventType).toBe('customer.subscription.created');
    });

    it('should handle customer.subscription.updated event', async () => {
      const mockStripe = stripe();
      const updateEvent = {
        id: 'evt_subscription_updated',
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_test_123',
            customer: 'cus_test_123',
            status: 'active',
            cancel_at_period_end: true,
            items: {
              data: [{
                price: {
                  id: 'price_premium_monthly'
                }
              }]
            }
          }
        }
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(updateEvent);

      const res = await request(app)
        .post('/api/stripe/webhook')
        .set('stripe-signature', validSignature)
        .set('content-type', 'application/json')
        .send(JSON.stringify(updateEvent))
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.eventType).toBe('customer.subscription.updated');
    });

    it('should handle customer.subscription.deleted event', async () => {
      const mockStripe = stripe();
      const deleteEvent = {
        id: 'evt_subscription_deleted',
        type: 'customer.subscription.deleted',
        data: {
          object: {
            id: 'sub_test_123',
            customer: 'cus_test_123',
            status: 'canceled'
          }
        }
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(deleteEvent);

      const res = await request(app)
        .post('/api/stripe/webhook')
        .set('stripe-signature', validSignature)
        .set('content-type', 'application/json')
        .send(JSON.stringify(deleteEvent))
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.eventType).toBe('customer.subscription.deleted');
    });

    it('should handle invoice.payment_succeeded event', async () => {
      const mockStripe = stripe();
      const paymentEvent = {
        id: 'evt_payment_succeeded',
        type: 'invoice.payment_succeeded',
        data: {
          object: {
            id: 'in_test_123',
            customer: 'cus_test_123',
            subscription: 'sub_test_123',
            amount_paid: 999,
            status: 'paid'
          }
        }
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(paymentEvent);

      const res = await request(app)
        .post('/api/stripe/webhook')
        .set('stripe-signature', validSignature)
        .set('content-type', 'application/json')
        .send(JSON.stringify(paymentEvent))
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.eventType).toBe('invoice.payment_succeeded');
    });

    it('should handle invoice.payment_failed event', async () => {
      const mockStripe = stripe();
      const failureEvent = {
        id: 'evt_payment_failed',
        type: 'invoice.payment_failed',
        data: {
          object: {
            id: 'in_test_123',
            customer: 'cus_test_123',
            subscription: 'sub_test_123',
            amount_due: 999,
            status: 'open',
            attempt_count: 3
          }
        }
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(failureEvent);

      const res = await request(app)
        .post('/api/stripe/webhook')
        .set('stripe-signature', validSignature)
        .set('content-type', 'application/json')
        .send(JSON.stringify(failureEvent))
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.eventType).toBe('invoice.payment_failed');
    });

    it('should handle duplicate events gracefully', async () => {
      const mockStripe = stripe();
      const duplicateEvent = {
        id: 'evt_duplicate_123',
        type: 'customer.subscription.created',
        data: {
          object: {
            id: 'sub_duplicate_123',
            customer: 'cus_test_123',
            status: 'active'
          }
        }
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(duplicateEvent);

      // Process the same event twice
      await request(app)
        .post('/api/stripe/webhook')
        .set('stripe-signature', validSignature)
        .set('content-type', 'application/json')
        .send(JSON.stringify(duplicateEvent))
        .expect(200);

      const res = await request(app)
        .post('/api/stripe/webhook')
        .set('stripe-signature', validSignature)
        .set('content-type', 'application/json')
        .send(JSON.stringify(duplicateEvent))
        .expect(200);

      expect(res.body.success).toBe(true);
      // Should handle duplicate gracefully (not fail)
    });

    it('should handle unknown event types', async () => {
      const mockStripe = stripe();
      const unknownEvent = {
        id: 'evt_unknown_123',
        type: 'customer.unknown_event',
        data: {
          object: {
            id: 'obj_unknown_123'
          }
        }
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(unknownEvent);

      const res = await request(app)
        .post('/api/stripe/webhook')
        .set('stripe-signature', validSignature)
        .set('content-type', 'application/json')
        .send(JSON.stringify(unknownEvent))
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('Unhandled event type');
    });
  });

  describe('POST /api/stripe/test-webhook', () => {
    it('should process test webhook successfully (200)', async () => {
      const res = await request(app)
        .post('/api/stripe/test-webhook')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.eventType).toBe('customer.subscription.created');
    });

    it('should handle test webhook errors gracefully (500)', async () => {
      // Mock the handleWebhook function to throw an error
      const originalHandleWebhook = require('../../src/controllers/stripeWebhookController').handleWebhook;
      const mockHandleWebhook = jest.fn().mockRejectedValue(new Error('Test error'));
      
      // Temporarily replace the function
      require('../../src/controllers/stripeWebhookController').handleWebhook = mockHandleWebhook;

      const res = await request(app)
        .post('/api/stripe/test-webhook')
        .expect(500);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Test webhook failed');

      // Restore original function
      require('../../src/controllers/stripeWebhookController').handleWebhook = originalHandleWebhook;
    });
  });

  describe('GET /api/stripe/status', () => {
    it('should return webhook status (200)', async () => {
      const mockStripe = stripe();
      mockStripe.events.list.mockResolvedValue({
        data: [
          {
            id: 'evt_1',
            type: 'customer.subscription.created',
            created: Math.floor(Date.now() / 1000)
          },
          {
            id: 'evt_2',
            type: 'invoice.payment_succeeded',
            created: Math.floor(Date.now() / 1000) - 3600
          }
        ]
      });

      const res = await request(app)
        .get('/api/stripe/status')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.webhook_status).toBe('active');
      expect(res.body.recent_events).toHaveLength(2);
      expect(res.body.configuration).toHaveProperty('webhook_secret_configured');
      expect(res.body.configuration).toHaveProperty('stripe_connected');
      expect(res.body.configuration).toHaveProperty('environment');
    });

    it('should handle Stripe API errors gracefully (500)', async () => {
      const mockStripe = stripe();
      mockStripe.events.list.mockRejectedValue(new Error('Stripe API error'));

      const res = await request(app)
        .get('/api/stripe/status')
        .expect(500);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Failed to check webhook status');
    });
  });

  describe('Webhook Security Tests', () => {
    it('should require raw body for signature verification', async () => {
      const mockStripe = stripe();
      mockStripe.webhooks.constructEvent.mockReturnValue({});

      // Test with JSON body (should fail)
      const res = await request(app)
        .post('/api/stripe/webhook')
        .set('stripe-signature', 'valid_signature')
        .send({ test: 'data' })
        .expect(400);

      expect(res.text).toContain('Missing signature header');
    });

    it('should validate webhook secret configuration', async () => {
      const originalSecret = process.env.STRIPE_WEBHOOK_SECRET;
      
      // Test without webhook secret
      delete process.env.STRIPE_WEBHOOK_SECRET;
      
      const mockStripe = stripe();
      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('No webhook secret configured');
      });

      const res = await request(app)
        .post('/api/stripe/webhook')
        .set('stripe-signature', 'test_signature')
        .set('content-type', 'application/json')
        .send('{"test": "data"}')
        .expect(400);

      expect(res.text).toContain('Webhook signature verification failed');

      // Restore original secret
      process.env.STRIPE_WEBHOOK_SECRET = originalSecret;
    });
  });

  describe('Webhook Event Processing', () => {
    it('should process multiple events in sequence', async () => {
      const mockStripe = stripe();
      const events = [
        {
          id: 'evt_1',
          type: 'customer.subscription.created',
          data: { object: { id: 'sub_1', customer: 'cus_1', status: 'active' } }
        },
        {
          id: 'evt_2',
          type: 'invoice.payment_succeeded',
          data: { object: { id: 'in_1', customer: 'cus_1', status: 'paid' } }
        }
      ];

      for (const event of events) {
        mockStripe.webhooks.constructEvent.mockReturnValue(event);

        const res = await request(app)
          .post('/api/stripe/webhook')
          .set('stripe-signature', 'valid_signature')
          .set('content-type', 'application/json')
          .send(JSON.stringify(event))
          .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.eventType).toBe(event.type);
      }
    });

    it('should handle malformed webhook payload', async () => {
      const mockStripe = stripe();
      mockStripe.webhooks.constructEvent.mockReturnValue(null);

      const res = await request(app)
        .post('/api/stripe/webhook')
        .set('stripe-signature', 'valid_signature')
        .set('content-type', 'application/json')
        .send('invalid json')
        .expect(400);

      expect(res.text).toContain('Webhook signature verification failed');
    });
  });
});
