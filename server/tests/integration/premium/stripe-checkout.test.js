const request = require('supertest');
const { app, httpServer } = require('../../../server');
const User = require('../../../src/models/User');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const stripe = require('stripe');
const nock = require('nock'); // For mocking external API calls

// Mock the Stripe library
jest.mock('stripe', () => {
  return jest.fn(() => ({
    checkout: {
      sessions: {
        create: jest.fn().mockImplementation(options => {
          return Promise.resolve({
            id: 'cs_test_mock_session_id',
            url: 'https://checkout.stripe.com/pay/cs_test_mock_session_id',
            status: 'open',
            payment_status: 'unpaid',
            customer: options.customer_email ? 'cus_mock' : null
          });
        }),
        retrieve: jest.fn().mockResolvedValue({
          id: 'cs_test_mock_session_id',
          payment_status: 'paid',
          customer: 'cus_mock',
          subscription: 'sub_mock'
        })
      }
    },
    subscriptions: {
      retrieve: jest.fn().mockResolvedValue({
        id: 'sub_mock',
        status: 'active',
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days from now
        items: {
          data: [{
            price: {
              product: 'prod_premium',
              unit_amount: 999
            }
          }]
        },
        cancel_at_period_end: false
      }),
      update: jest.fn().mockResolvedValue({
        id: 'sub_mock',
        status: 'active',
        cancel_at_period_end: false
      }),
      del: jest.fn().mockResolvedValue({
        id: 'sub_mock',
        status: 'canceled'
      })
    },
    webhooks: {
      constructEvent: jest.fn().mockImplementation((payload, signature, secret) => {
        const event = JSON.parse(payload);
        // Validate signature in a real implementation
        if (!signature || signature !== 'valid_signature') {
          throw new Error('Invalid signature');
        }
        return event;
      })
    }
  }));
});

let mongoServer;

describe('Stripe Checkout Flow Tests', () => {
  let testUser;
  let authToken;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

    // Create test user
    testUser = new User({
      email: 'stripe-test@example.com',
      password: 'password123',
      firstName: 'Stripe',
      lastName: 'Test',
      dateOfBirth: '1990-01-01',
    });
    await testUser.save();
    
    // Login to get auth token
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'stripe-test@example.com',
        password: 'password123'
      });
    
    authToken = response.body.data.accessToken;
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    if (httpServer.listening) {
      httpServer.close();
    }
  });

  afterEach(() => {
    jest.clearAllMocks();
    nock.cleanAll();
  });

  it('should create a Stripe checkout session successfully', async () => {
    const response = await request(app)
      .post('/api/premium/subscribe')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        plan: 'premium',
        interval: 'month'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('url');
    expect(response.body.data.url).toContain('checkout.stripe.com');
  });

  it('should handle network interruptions during checkout session creation', async () => {
    // Mock a network error on first attempt, then success
    const stripeImplementation = stripe();
    let attemptCount = 0;
    
    stripeImplementation.checkout.sessions.create.mockImplementation(() => {
      attemptCount++;
      if (attemptCount === 1) {
        return Promise.reject(new Error('Network error'));
      }
      return Promise.resolve({
        id: 'cs_test_retry_success',
        url: 'https://checkout.stripe.com/pay/cs_test_retry_success',
        status: 'open'
      });
    });
    
    // Use this mock with automatic retry logic
    const response = await request(app)
      .post('/api/premium/subscribe')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        plan: 'premium',
        interval: 'month',
        __test_retry: true // Special flag to activate retry logic in test mode
      });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(stripeImplementation.checkout.sessions.create).toHaveBeenCalledTimes(2);
  });

  it('should maintain consistent state if browser closed mid-checkout', async () => {
    // Create checkout session
    const checkoutResponse = await request(app)
      .post('/api/premium/subscribe')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        plan: 'premium',
        interval: 'month'
      });
    
    expect(checkoutResponse.status).toBe(200);
    
    // Simulate browser close before completion
    // No further action from user
    
    // User state should not show premium until webhook received
    const userState = await User.findById(testUser._id);
    expect(userState.premium.isActive).toBeFalsy();
    
    // Simulate webhook arrival for completed checkout
    const webhookPayload = {
      id: 'evt_checkout_completed',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_mock_session_id',
          customer: 'cus_mock',
          subscription: 'sub_mock',
          payment_status: 'paid',
          metadata: {
            userId: testUser._id.toString()
          }
        }
      }
    };
    
    // Send the webhook
    const webhookResponse = await request(app)
      .post('/api/webhooks/stripe')
      .set('stripe-signature', 'valid_signature')
      .send(webhookPayload);
    
    expect(webhookResponse.status).toBe(200);
    
    // Now user should have premium
    const updatedUser = await User.findById(testUser._id);
    expect(updatedUser.premium.isActive).toBe(true);
    expect(updatedUser.premium.stripeSubscriptionId).toBe('sub_mock');
  });

  it('should gracefully handle Stripe API downtime', async () => {
    // Mock Stripe being down
    const stripeImpl = stripe();
    stripeImpl.checkout.sessions.create.mockImplementation(() => {
      throw new Error('Stripe API is currently unavailable');
    });
    
    // Attempt to create checkout session
    const response = await request(app)
      .post('/api/premium/subscribe')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        plan: 'premium',
        interval: 'month'
      });
    
    // Should return error but not crash the server
    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
  });

  it('should correctly sync subscriptions across platforms after purchase', async () => {
    // Mock web checkout completion via webhook
    const webhookPayload = {
      id: 'evt_cross_platform_test',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_cross_platform',
          customer: 'cus_mock',
          subscription: 'sub_cross_platform',
          payment_status: 'paid',
          metadata: {
            userId: testUser._id.toString(),
            platform: 'web'
          }
        }
      }
    };
    
    // Process web purchase webhook
    await request(app)
      .post('/api/webhooks/stripe')
      .set('stripe-signature', 'valid_signature')
      .send(webhookPayload);
    
    // Check mobile app state - should reflect premium status
    const mobileLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'stripe-test@example.com',
        password: 'password123',
        platform: 'mobile'
      });
    
    const mobileToken = mobileLoginResponse.body.data.accessToken;
    
    // Get subscription status from mobile
    const mobileSubscriptionResponse = await request(app)
      .get('/api/premium/subscription')
      .set('Authorization', `Bearer ${mobileToken}`);
    
    // Verify subscription is active on mobile
    expect(mobileSubscriptionResponse.status).toBe(200);
    expect(mobileSubscriptionResponse.body.data.subscription.status).toBe('active');
    expect(mobileSubscriptionResponse.body.data.subscription.tierId).toBe('premium');
  });
});
