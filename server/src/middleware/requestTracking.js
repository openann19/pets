/**
 * Request Tracking Middleware
 * Adds request IDs and tracks metrics for monitoring
 */

const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

// In-memory metrics store
const metrics = {
  requests: {
    total: 0,
    successful: 0,
    failed: 0,
    byStatus: {},
    byEndpoint: {}
  },
  performance: {
    totalResponseTime: 0,
    slowRequests: 0, // > 1000ms
    byEndpoint: {}
  },
  errors: {
    total: 0,
    byType: {},
    recent: [] // Keep last 100 errors
  }
};

/**
 * Add unique request ID to each request
 */
const requestIdMiddleware = (req, res, next) => {
  req.id = uuidv4();
  res.setHeader('X-Request-ID', req.id);
  req.startTime = Date.now();
  next();
};

/**
 * Track request metrics
 */
const metricsMiddleware = (req, res, next) => {
  const cleanup = () => {
    const duration = Date.now() - req.startTime;
    const endpoint = `${req.method} ${req.route?.path || req.path}`;
    const status = res.statusCode;
    
    // Update total metrics
    metrics.requests.total++;
    
    // Track by status
    if (status >= 200 && status < 300) {
      metrics.requests.successful++;
    } else if (status >= 400) {
      metrics.requests.failed++;
      
      if (status >= 500) {
        metrics.errors.total++;
        
        // Track error type
        const errorType = `${status}`;
        metrics.errors.byType[errorType] = (metrics.errors.byType[errorType] || 0) + 1;
        
        // Store recent error
        metrics.errors.recent.unshift({
          timestamp: new Date(),
          endpoint,
          status,
          requestId: req.id,
          userId: req.userId,
          duration
        });
        
        // Keep only last 100 errors
        if (metrics.errors.recent.length > 100) {
          metrics.errors.recent.pop();
        }
      }
    }
    
    // Track by status code
    metrics.requests.byStatus[status] = (metrics.requests.byStatus[status] || 0) + 1;
    
    // Track by endpoint
    if (!metrics.requests.byEndpoint[endpoint]) {
      metrics.requests.byEndpoint[endpoint] = {
        count: 0,
        successful: 0,
        failed: 0
      };
    }
    metrics.requests.byEndpoint[endpoint].count++;
    
    if (status >= 200 && status < 300) {
      metrics.requests.byEndpoint[endpoint].successful++;
    } else if (status >= 400) {
      metrics.requests.byEndpoint[endpoint].failed++;
    }
    
    // Track performance
    metrics.performance.totalResponseTime += duration;
    
    if (duration > 1000) {
      metrics.performance.slowRequests++;
      logger.warn('Slow request detected', {
        requestId: req.id,
        endpoint,
        duration: `${duration}ms`,
        userId: req.userId
      });
    }
    
    if (!metrics.performance.byEndpoint[endpoint]) {
      metrics.performance.byEndpoint[endpoint] = {
        count: 0,
        totalTime: 0,
        avgTime: 0,
        minTime: duration,
        maxTime: duration
      };
    }
    
    const endpointMetric = metrics.performance.byEndpoint[endpoint];
    endpointMetric.count++;
    endpointMetric.totalTime += duration;
    endpointMetric.avgTime = Math.round(endpointMetric.totalTime / endpointMetric.count);
    endpointMetric.minTime = Math.min(endpointMetric.minTime, duration);
    endpointMetric.maxTime = Math.max(endpointMetric.maxTime, duration);
    
    // Log request completion
    if (process.env.NODE_ENV === 'development' || duration > 500) {
      logger.info('Request completed', {
        requestId: req.id,
        method: req.method,
        path: req.path,
        status,
        duration: `${duration}ms`,
        userId: req.userId || 'anonymous'
      });
    }
  };
  
  // Attach cleanup to response finish event
  res.on('finish', cleanup);
  res.on('close', cleanup);
  
  next();
};

/**
 * Get current metrics
 */
const getMetrics = () => {
  const avgResponseTime = metrics.requests.total > 0
    ? Math.round(metrics.performance.totalResponseTime / metrics.requests.total)
    : 0;
    
  return {
    ...metrics,
    performance: {
      ...metrics.performance,
      avgResponseTime,
      slowRequestPercentage: metrics.requests.total > 0
        ? ((metrics.performance.slowRequests / metrics.requests.total) * 100).toFixed(2)
        : 0
    },
    successRate: metrics.requests.total > 0
      ? ((metrics.requests.successful / metrics.requests.total) * 100).toFixed(2)
      : 0,
    errorRate: metrics.requests.total > 0
      ? ((metrics.requests.failed / metrics.requests.total) * 100).toFixed(2)
      : 0
  };
};

/**
 * Reset metrics (useful for testing)
 */
const resetMetrics = () => {
  metrics.requests = {
    total: 0,
    successful: 0,
    failed: 0,
    byStatus: {},
    byEndpoint: {}
  };
  metrics.performance = {
    totalResponseTime: 0,
    slowRequests: 0,
    byEndpoint: {}
  };
  metrics.errors = {
    total: 0,
    byType: {},
    recent: []
  };
};

module.exports = {
  requestIdMiddleware,
  metricsMiddleware,
  getMetrics,
  resetMetrics
};

