/**
 * Stripe Webhook Controller Unit Tests
 * Tests the webhook controller logic without full server setup
 */

const { verifyWebhookSignature, handleWebhook } = require('../../src/controllers/stripeWebhookController');
const stripe = require('stripe');

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn(() => ({
    webhooks: {
      constructEvent: jest.fn()
    }
  }));
});

// Mock User model
jest.mock('../../src/models/User', () => ({
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn()
}));

// Mock logger
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
}));

describe('Stripe Webhook Controller Unit Tests', () => {
  let mockStripe;
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockStripe = stripe();
    mockStripe.webhooks.constructEvent.mockClear();

    mockReq = {
      headers: {},
      body: 'test body',
      stripeEvent: null
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };

    mockNext = jest.fn();

    // Set up environment variables
    process.env.STRIPE_WEBHOOK_SECRET = 'test_webhook_secret';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('verifyWebhookSignature', () => {
    it('should verify valid webhook signature', () => {
      const mockEvent = { id: 'evt_test', type: 'test.event' };
      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent);
      mockReq.headers['stripe-signature'] = 'valid_signature';

      verifyWebhookSignature(mockReq, mockRes, mockNext);

      expect(mockStripe.webhooks.constructEvent).toHaveBeenCalledWith(
        'test body',
        'valid_signature',
        'test_webhook_secret'
      );
      expect(mockReq.stripeEvent).toEqual(mockEvent);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject webhook without signature header', () => {
      verifyWebhookSignature(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith('Missing signature header');
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject webhook with invalid signature', () => {
      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('Invalid signature');
      });
      mockReq.headers['stripe-signature'] = 'invalid_signature';

      verifyWebhookSignature(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith('Webhook signature verification failed: Invalid signature');
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('handleWebhook', () => {
    beforeEach(() => {
      mockReq.stripeEvent = {
        id: 'evt_test_123',
        type: 'customer.subscription.created',
        data: {
          object: {
            id: 'sub_test_123',
            customer: 'cus_test_123',
            status: 'active'
          }
        }
      };
    });

    it('should handle customer.subscription.created event', async () => {
      const User = require('../../src/models/User');
      User.findOne.mockResolvedValue({ _id: 'user123' });
      User.findOneAndUpdate.mockResolvedValue({ _id: 'user123', premium: true });

      await handleWebhook(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        eventType: 'customer.subscription.created',
        message: 'Subscription created successfully'
      });
    });

    it('should handle customer.subscription.updated event', async () => {
      mockReq.stripeEvent.type = 'customer.subscription.updated';
      const User = require('../../src/models/User');
      User.findOne.mockResolvedValue({ _id: 'user123' });
      User.findOneAndUpdate.mockResolvedValue({ _id: 'user123', premium: true });

      await handleWebhook(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        eventType: 'customer.subscription.updated',
        message: 'Subscription updated successfully'
      });
    });

    it('should handle customer.subscription.deleted event', async () => {
      mockReq.stripeEvent.type = 'customer.subscription.deleted';
      const User = require('../../src/models/User');
      User.findOne.mockResolvedValue({ _id: 'user123' });
      User.findOneAndUpdate.mockResolvedValue({ _id: 'user123', premium: false });

      await handleWebhook(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        eventType: 'customer.subscription.deleted',
        message: 'Subscription cancelled successfully'
      });
    });

    it('should handle invoice.payment_succeeded event', async () => {
      mockReq.stripeEvent.type = 'invoice.payment_succeeded';
      mockReq.stripeEvent.data.object = {
        id: 'in_test_123',
        customer: 'cus_test_123',
        subscription: 'sub_test_123',
        amount_paid: 999,
        status: 'paid'
      };

      const User = require('../../src/models/User');
      User.findOne.mockResolvedValue({ _id: 'user123' });

      await handleWebhook(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        eventType: 'invoice.payment_succeeded',
        message: 'Payment processed successfully'
      });
    });

    it('should handle invoice.payment_failed event', async () => {
      mockReq.stripeEvent.type = 'invoice.payment_failed';
      mockReq.stripeEvent.data.object = {
        id: 'in_test_123',
        customer: 'cus_test_123',
        subscription: 'sub_test_123',
        amount_due: 999,
        status: 'open',
        attempt_count: 3
      };

      const User = require('../../src/models/User');
      User.findOne.mockResolvedValue({ _id: 'user123' });

      await handleWebhook(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        eventType: 'invoice.payment_failed',
        message: 'Payment failure handled'
      });
    });

    it('should handle unknown event types', async () => {
      mockReq.stripeEvent.type = 'customer.unknown_event';

      await handleWebhook(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        eventType: 'customer.unknown_event',
        message: 'Unhandled event type: customer.unknown_event'
      });
    });

    it('should handle errors gracefully', async () => {
      const User = require('../../src/models/User');
      User.findOne.mockRejectedValue(new Error('Database error'));

      await handleWebhook(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Webhook processing failed',
        error: 'Database error'
      });
    });

    it('should handle missing stripe event', async () => {
      mockReq.stripeEvent = null;

      await handleWebhook(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'No Stripe event found in request'
      });
    });
  });

  describe('Webhook Security', () => {
    it('should require webhook secret configuration', () => {
      delete process.env.STRIPE_WEBHOOK_SECRET;
      mockReq.headers['stripe-signature'] = 'test_signature';

      verifyWebhookSignature(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith('Missing signature header');
    });

    it('should handle webhook secret validation errors', () => {
      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('No webhook secret configured');
      });
      mockReq.headers['stripe-signature'] = 'test_signature';

      verifyWebhookSignature(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith('Webhook signature verification failed: No webhook secret configured');
    });
  });

  describe('Event Processing Logic', () => {
    it('should process subscription events with proper data extraction', async () => {
      mockReq.stripeEvent = {
        id: 'evt_sub_created',
        type: 'customer.subscription.created',
        data: {
          object: {
            id: 'sub_123',
            customer: 'cus_456',
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

      const User = require('../../src/models/User');
      User.findOne.mockResolvedValue({ _id: 'user123' });
      User.findOneAndUpdate.mockResolvedValue({ 
        _id: 'user123', 
        premium: true,
        subscriptionId: 'sub_123',
        subscriptionStatus: 'active'
      });

      await handleWebhook(mockReq, mockRes);

      expect(User.findOne).toHaveBeenCalledWith({ stripeCustomerId: 'cus_456' });
      expect(User.findOneAndUpdate).toHaveBeenCalledWith(
        { stripeCustomerId: 'cus_456' },
        {
          $set: {
            premium: true,
            subscriptionId: 'sub_123',
            subscriptionStatus: 'active',
            subscriptionStartDate: expect.any(Date),
            subscriptionEndDate: expect.any(Date),
            lastPaymentDate: expect.any(Date)
          }
        },
        { new: true }
      );
    });

    it('should handle payment events with proper data extraction', async () => {
      mockReq.stripeEvent = {
        id: 'evt_payment_succeeded',
        type: 'invoice.payment_succeeded',
        data: {
          object: {
            id: 'in_123',
            customer: 'cus_456',
            subscription: 'sub_789',
            amount_paid: 999,
            status: 'paid',
            created: Math.floor(Date.now() / 1000)
          }
        }
      };

      const User = require('../../src/models/User');
      User.findOne.mockResolvedValue({ _id: 'user123' });

      await handleWebhook(mockReq, mockRes);

      expect(User.findOne).toHaveBeenCalledWith({ stripeCustomerId: 'cus_456' });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        eventType: 'invoice.payment_succeeded',
        message: 'Payment processed successfully'
      });
    });
  });
});
