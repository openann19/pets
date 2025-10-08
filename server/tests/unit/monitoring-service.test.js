/**
 * Monitoring and Logging Service Unit Tests
 * Tests analytics tracking, error monitoring, health checks, and log formatting
 */

const {
  logger,
  analyticsService,
  healthCheckService,
  AnalyticsService,
  HealthCheckService
} = require('../../src/services/monitoring');

// Mock winston logger
jest.mock('winston', () => {
  const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    add: jest.fn()
  };

  return {
    createLogger: jest.fn(() => mockLogger),
    format: {
      combine: jest.fn(),
      timestamp: jest.fn(),
      errors: jest.fn(),
      json: jest.fn(),
      colorize: jest.fn(),
      simple: jest.fn()
    },
    transports: {
      File: jest.fn(),
      Console: jest.fn()
    }
  };
});

// Mock mongoose
jest.mock('mongoose', () => ({
  connection: {
    readyState: 1
  }
}));

// Mock redis
jest.mock('ioredis', () => {
  return jest.fn(() => ({
    connect: jest.fn(),
    ping: jest.fn(),
    quit: jest.fn()
  }));
});

// Mock axios
jest.mock('axios', () => ({
  get: jest.fn()
}));

describe('Monitoring Service Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('AnalyticsService', () => {
    let analytics;

    beforeEach(() => {
      analytics = new AnalyticsService();
    });

    describe('User Action Tracking', () => {
      it('should track user actions with metadata', () => {
        const userId = 'user123';
        const action = 'pet_liked';
        const metadata = { petId: 'pet456', matchId: 'match789' };

        analytics.trackUserAction(userId, action, metadata);

        const userEvents = analytics.events.get(userId);
        expect(userEvents).toHaveLength(1);
        expect(userEvents[0]).toMatchObject({
          userId,
          action,
          metadata,
          timestamp: expect.any(String)
        });
        expect(userEvents[0]).toHaveProperty('sessionId');
      });

      it('should track multiple actions for the same user', () => {
        const userId = 'user123';

        analytics.trackUserAction(userId, 'pet_liked', { petId: 'pet1' });
        analytics.trackUserAction(userId, 'pet_passed', { petId: 'pet2' });
        analytics.trackUserAction(userId, 'message_sent', { matchId: 'match1' });

        const userEvents = analytics.events.get(userId);
        expect(userEvents).toHaveLength(3);
        expect(userEvents.map(e => e.action)).toEqual(['pet_liked', 'pet_passed', 'message_sent']);
      });

      it('should generate unique session IDs', () => {
        const userId = 'user123';

        analytics.trackUserAction(userId, 'action1');
        analytics.trackUserAction(userId, 'action2');

        const userEvents = analytics.events.get(userId);
        expect(userEvents[0].sessionId).not.toBe(userEvents[1].sessionId);
      });

      it('should update user action metrics', () => {
        const userId = 'user123';
        const action = 'pet_liked';

        analytics.trackUserAction(userId, action);

        const metrics = analytics.metrics.userActions.get(action);
        expect(metrics).toMatchObject({
          count: 1,
          total: 1,
          average: 1,
          lastUpdated: expect.any(String)
        });
      });
    });

    describe('API Call Tracking', () => {
      it('should track API calls with performance data', () => {
        const endpoint = '/api/pets';
        const method = 'GET';
        const statusCode = 200;
        const duration = 150;

        analytics.trackApiCall(endpoint, method, statusCode, duration);

        const metrics = analytics.metrics.apiCalls.get(`${method}-${endpoint}`);
        expect(metrics).toMatchObject({
          count: 1,
          total: 1,
          average: 1,
          lastStatusCode: statusCode,
          lastDuration: duration
        });
      });

      it('should track API errors', () => {
        const endpoint = '/api/pets';
        const method = 'POST';
        const statusCode = 500;
        const duration = 2000;

        analytics.trackApiCall(endpoint, method, statusCode, duration);

        const metrics = analytics.metrics.apiCalls.get(`${method}-${endpoint}`);
        expect(metrics.lastStatusCode).toBe(500);
        expect(metrics.lastDuration).toBe(2000);
      });

      it('should calculate average response times', () => {
        const endpoint = '/api/pets';
        const method = 'GET';

        analytics.trackApiCall(endpoint, method, 200, 100);
        analytics.trackApiCall(endpoint, method, 200, 200);
        analytics.trackApiCall(endpoint, method, 200, 300);

        const metrics = analytics.metrics.apiCalls.get(`${method}-${endpoint}`);
        expect(metrics.count).toBe(3);
        expect(metrics.average).toBe(1); // Average of 1, 1, 1 (normalized)
      });
    });

    describe('Performance Tracking', () => {
      it('should track performance metrics', () => {
        const metric = 'page_load_time';
        const value = 1200;
        const metadata = { page: '/dashboard' };

        analytics.trackPerformance(metric, value, metadata);

        const metrics = analytics.metrics.performance.get(metric);
        expect(metrics).toMatchObject({
          count: 1,
          total: value,
          average: value
        });
      });

      it('should track multiple performance metrics', () => {
        analytics.trackPerformance('page_load_time', 1000);
        analytics.trackPerformance('api_response_time', 200);
        analytics.trackPerformance('database_query_time', 50);

        expect(analytics.metrics.performance.size).toBe(3);
        expect(analytics.metrics.performance.has('page_load_time')).toBe(true);
        expect(analytics.metrics.performance.has('api_response_time')).toBe(true);
        expect(analytics.metrics.performance.has('database_query_time')).toBe(true);
      });
    });

    describe('Error Tracking', () => {
      it('should track errors with context', () => {
        const error = new Error('Test error');
        const context = {
          userId: 'user123',
          url: '/api/pets',
          userAgent: 'Mozilla/5.0'
        };

        analytics.trackError(error, context);

        const metrics = analytics.metrics.errors.get('Error');
        expect(metrics).toMatchObject({
          count: 1,
          total: 1,
          average: 1
        });
      });

      it('should track different error types', () => {
        const validationError = new Error('Validation failed');
        validationError.name = 'ValidationError';
        
        const networkError = new Error('Network timeout');
        networkError.name = 'NetworkError';

        analytics.trackError(validationError);
        analytics.trackError(networkError);

        expect(analytics.metrics.errors.has('ValidationError')).toBe(true);
        expect(analytics.metrics.errors.has('NetworkError')).toBe(true);
        expect(analytics.metrics.errors.size).toBe(2);
      });
    });

    describe('Analytics Data Retrieval', () => {
      beforeEach(() => {
        // Add some test data
        analytics.trackUserAction('user1', 'pet_liked', { petId: 'pet1' });
        analytics.trackUserAction('user1', 'pet_passed', { petId: 'pet2' });
        analytics.trackUserAction('user2', 'message_sent', { matchId: 'match1' });
        analytics.trackApiCall('/api/pets', 'GET', 200, 100);
        analytics.trackPerformance('page_load', 500);
        analytics.trackError(new Error('Test error'));
      });

      it('should get analytics for specific user', () => {
        const data = analytics.getAnalytics('user1');

        expect(data.userEvents).toHaveLength(2);
        expect(data.userEvents.every(e => e.userId === 'user1')).toBe(true);
        expect(data.metrics).toHaveProperty('userActions');
        expect(data.metrics).toHaveProperty('apiCalls');
        expect(data.metrics).toHaveProperty('performance');
        expect(data.metrics).toHaveProperty('errors');
      });

      it('should get analytics for all users', () => {
        const data = analytics.getAnalytics();

        expect(data.userEvents).toHaveLength(3);
        expect(data.summary.totalUsers).toBe(2);
        expect(data.summary.totalEvents).toBe(3);
      });

      it('should filter events by timeframe', () => {
        const data = analytics.getAnalytics(null, '1h');

        expect(data.summary.timeframe).toBe('1h');
        // Events should be filtered by the 1-hour window
        expect(data.userEvents.length).toBeLessThanOrEqual(3);
      });

      it('should generate summary statistics', () => {
        const data = analytics.getAnalytics();

        expect(data.summary).toMatchObject({
          totalUsers: expect.any(Number),
          totalEvents: expect.any(Number),
          totalApiCalls: expect.any(Number),
          totalErrors: expect.any(Number),
          timeframe: '24h',
          generatedAt: expect.any(String)
        });
      });
    });

    describe('Analytics Export', () => {
      beforeEach(() => {
        analytics.trackUserAction('user1', 'pet_liked', { petId: 'pet1' });
      });

      it('should export data for Google Analytics', () => {
        const exported = analytics.exportForAnalytics('google');

        expect(exported).toHaveProperty('events');
        expect(exported).toHaveProperty('metrics');
        expect(exported.events[0]).toMatchObject({
          name: 'user_action',
          params: {
            action: 'pet_liked',
            user_id: 'user1',
            session_id: expect.any(String),
            timestamp: expect.any(String),
            petId: 'pet1'
          }
        });
      });

      it('should export data for Mixpanel', () => {
        const exported = analytics.exportForAnalytics('mixpanel');

        expect(exported).toHaveProperty('events');
        expect(exported.events[0]).toMatchObject({
          event: 'pet_liked',
          properties: {
            distinct_id: 'user1',
            session_id: expect.any(String),
            time: expect.any(Number),
            petId: 'pet1'
          }
        });
      });

      it('should export data for Segment', () => {
        const exported = analytics.exportForAnalytics('segment');

        expect(exported).toHaveProperty('batch');
        expect(exported.batch[0]).toMatchObject({
          type: 'track',
          event: 'pet_liked',
          userId: 'user1',
          timestamp: expect.any(String),
          properties: {
            session_id: expect.any(String),
            petId: 'pet1'
          }
        });
      });

      it('should return raw data for unknown service', () => {
        const exported = analytics.exportForAnalytics('unknown');

        expect(exported).toHaveProperty('userEvents');
        expect(exported).toHaveProperty('metrics');
        expect(exported).toHaveProperty('summary');
      });
    });
  });

  describe('HealthCheckService', () => {
    let healthCheck;

    beforeEach(() => {
      healthCheck = new HealthCheckService();
    });

    describe('Health Check Registration', () => {
      it('should register health checks', () => {
        const checkFunction = jest.fn().mockResolvedValue({ status: 'ok' });

        healthCheck.registerCheck('test-check', checkFunction, {
          timeout: 3000,
          critical: true
        });

        expect(healthCheck.checks.has('test-check')).toBe(true);
        const check = healthCheck.checks.get('test-check');
        expect(check.check).toBe(checkFunction);
        expect(check.timeout).toBe(3000);
        expect(check.critical).toBe(true);
      });

      it('should use default options for health checks', () => {
        const checkFunction = jest.fn().mockResolvedValue({ status: 'ok' });

        healthCheck.registerCheck('test-check', checkFunction);

        const check = healthCheck.checks.get('test-check');
        expect(check.timeout).toBe(5000);
        expect(check.critical).toBe(false);
      });
    });

    describe('Health Check Execution', () => {
      it('should run successful health checks', async () => {
        const checkFunction = jest.fn().mockResolvedValue({ status: 'ok' });
        healthCheck.registerCheck('test-check', checkFunction);

        const results = await healthCheck.runHealthChecks();

        expect(results.status).toBe('healthy');
        expect(results.checks['test-check']).toMatchObject({
          status: 'healthy',
          result: { status: 'ok' },
          duration: expect.any(Number),
          timestamp: expect.any(String)
        });
        expect(checkFunction).toHaveBeenCalled();
      });

      it('should handle health check failures', async () => {
        const checkFunction = jest.fn().mockRejectedValue(new Error('Check failed'));
        healthCheck.registerCheck('failing-check', checkFunction);

        const results = await healthCheck.runHealthChecks();

        expect(results.status).toBe('unhealthy');
        expect(results.checks['failing-check']).toMatchObject({
          status: 'unhealthy',
          error: 'Check failed',
          duration: expect.any(Number),
          timestamp: expect.any(String)
        });
      });

      it('should handle health check timeouts', async () => {
        const checkFunction = jest.fn().mockImplementation(
          () => new Promise(resolve => setTimeout(resolve, 10000))
        );
        healthCheck.registerCheck('slow-check', checkFunction, { timeout: 100 });

        const results = await healthCheck.runHealthChecks();

        expect(results.status).toBe('unhealthy');
        expect(results.checks['slow-check']).toMatchObject({
          status: 'unhealthy',
          error: 'Health check timeout',
          duration: expect.any(Number)
        });
      });

      it('should run multiple health checks in parallel', async () => {
        const check1 = jest.fn().mockResolvedValue({ status: 'ok' });
        const check2 = jest.fn().mockResolvedValue({ status: 'ok' });
        const check3 = jest.fn().mockResolvedValue({ status: 'ok' });

        healthCheck.registerCheck('check1', check1);
        healthCheck.registerCheck('check2', check2);
        healthCheck.registerCheck('check3', check3);

        const results = await healthCheck.runHealthChecks();

        expect(results.status).toBe('healthy');
        expect(Object.keys(results.checks)).toHaveLength(3);
        expect(check1).toHaveBeenCalled();
        expect(check2).toHaveBeenCalled();
        expect(check3).toHaveBeenCalled();
      });
    });

    describe('Overall Health Determination', () => {
      it('should be healthy when all checks pass', async () => {
        const checkFunction = jest.fn().mockResolvedValue({ status: 'ok' });
        healthCheck.registerCheck('check1', checkFunction);
        healthCheck.registerCheck('check2', checkFunction);

        const results = await healthCheck.runHealthChecks();

        expect(results.status).toBe('healthy');
      });

      it('should be unhealthy when critical check fails', async () => {
        const passingCheck = jest.fn().mockResolvedValue({ status: 'ok' });
        const failingCheck = jest.fn().mockRejectedValue(new Error('Critical failure'));

        healthCheck.registerCheck('non-critical', passingCheck, { critical: false });
        healthCheck.registerCheck('critical', failingCheck, { critical: true });

        const results = await healthCheck.runHealthChecks();

        expect(results.status).toBe('unhealthy');
      });

      it('should be degraded when non-critical check fails', async () => {
        const passingCheck = jest.fn().mockResolvedValue({ status: 'ok' });
        const failingCheck = jest.fn().mockRejectedValue(new Error('Non-critical failure'));

        healthCheck.registerCheck('critical', passingCheck, { critical: true });
        healthCheck.registerCheck('non-critical', failingCheck, { critical: false });

        const results = await healthCheck.runHealthChecks();

        expect(results.status).toBe('degraded');
      });
    });

    describe('Health Status Retrieval', () => {
      it('should return current health status', async () => {
        const checkFunction = jest.fn().mockResolvedValue({ status: 'ok' });
        healthCheck.registerCheck('test-check', checkFunction);

        await healthCheck.runHealthChecks();
        const status = healthCheck.getHealthStatus();

        expect(status).toMatchObject({
          status: 'healthy',
          lastCheck: expect.any(String),
          checks: {
            'test-check': {
              status: 'healthy',
              result: { status: 'ok' },
              duration: expect.any(Number)
            }
          }
        });
      });

      it('should return unknown status for unrun checks', () => {
        const checkFunction = jest.fn().mockResolvedValue({ status: 'ok' });
        healthCheck.registerCheck('unrun-check', checkFunction);

        const status = healthCheck.getHealthStatus();

        expect(status.checks['unrun-check']).toMatchObject({
          status: 'unknown'
        });
      });
    });
  });

  describe('Default Health Checks', () => {
    it('should have database health check registered', () => {
      expect(healthCheckService.checks.has('database')).toBe(true);
    });

    it('should have Redis health check registered', () => {
      expect(healthCheckService.checks.has('redis')).toBe(true);
    });

    it('should have AI service health check registered', () => {
      expect(healthCheckService.checks.has('ai-service')).toBe(true);
    });

    it('should run default health checks', async () => {
      const results = await healthCheckService.runHealthChecks();

      expect(results).toHaveProperty('status');
      expect(results).toHaveProperty('checks');
      expect(results.checks).toHaveProperty('database');
      expect(results.checks).toHaveProperty('redis');
      expect(results.checks).toHaveProperty('ai-service');
    });
  });

  describe('Logger Configuration', () => {
    it('should create logger with proper configuration', () => {
      const winston = require('winston');
      
      expect(winston.createLogger).toHaveBeenCalled();
      expect(winston.format.combine).toHaveBeenCalled();
      expect(winston.format.timestamp).toHaveBeenCalled();
      expect(winston.format.errors).toHaveBeenCalled();
      expect(winston.format.json).toHaveBeenCalled();
    });

    it('should add console transport in non-production environment', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      // Re-require to trigger the console transport addition
      delete require.cache[require.resolve('../../src/services/monitoring')];
      require('../../src/services/monitoring');

      const winston = require('winston');
      expect(winston.transports.Console).toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Error Handling', () => {
    it('should handle analytics service errors gracefully', () => {
      const analytics = new AnalyticsService();
      
      // Should not throw when tracking with invalid data
      expect(() => {
        analytics.trackUserAction(null, null);
        analytics.trackApiCall(null, null, null, null);
        analytics.trackPerformance(null, null);
        analytics.trackError(null);
      }).not.toThrow();
    });

    it('should handle health check service errors gracefully', async () => {
      const healthCheck = new HealthCheckService();
      
      // Register a check that throws an error
      healthCheck.registerCheck('error-check', () => {
        throw new Error('Unexpected error');
      });

      const results = await healthCheck.runHealthChecks();
      
      expect(results.checks['error-check']).toMatchObject({
        status: 'unhealthy',
        error: 'Unexpected error'
      });
    });
  });
});
