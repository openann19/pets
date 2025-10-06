const winston = require('winston');
const { Logtail } = require('@logtail/node');
const { LogtailTransport } = require('@logtail/winston');

// Enhanced logging configuration for production
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'pawfectmatch-api' },
  transports: [
    // File transport for errors
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // File transport for all logs
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Add Logtail transport for production (BetterStack)
if (process.env.LOGTAIL_SOURCE_TOKEN) {
  const logtail = new Logtail(process.env.LOGTAIL_SOURCE_TOKEN);
  logger.add(new LogtailTransport(logtail));
}

// Console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Performance monitoring
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.startTime = Date.now();
  }

  startOperation(operationName) {
    const startTime = process.hrtime();
    this.metrics.set(operationName, { startTime });
    return operationName;
  }

  endOperation(operationName) {
    const metric = this.metrics.get(operationName);
    if (!metric) return null;

    const [seconds, nanoseconds] = process.hrtime(metric.startTime);
    const duration = seconds * 1000 + nanoseconds / 1000000; // Convert to milliseconds

    logger.info('Performance metric', {
      operation: operationName,
      duration: duration.toFixed(2),
      unit: 'ms'
    });

    this.metrics.delete(operationName);
    return duration;
  }

  getUptime() {
    return Date.now() - this.startTime;
  }

  getMetrics() {
    return {
      uptime: this.getUptime(),
      activeOperations: this.metrics.size,
      memoryUsage: process.memoryUsage(),
      timestamp: new Date().toISOString()
    };
  }
}

const performanceMonitor = new PerformanceMonitor();

// Health check monitoring
class HealthMonitor {
  constructor() {
    this.checks = new Map();
    this.lastCheck = new Date();
  }

  registerCheck(name, checkFunction, interval = 30000) {
    this.checks.set(name, {
      function: checkFunction,
      interval,
      lastRun: null,
      status: 'unknown',
      lastError: null
    });
  }

  async runChecks() {
    const results = {};
    
    for (const [name, check] of this.checks) {
      try {
        await check.function();
        check.status = 'healthy';
        check.lastError = null;
        results[name] = { status: 'healthy' };
      } catch (error) {
        check.status = 'unhealthy';
        check.lastError = error.message;
        results[name] = { 
          status: 'unhealthy', 
          error: error.message 
        };
        logger.error(`Health check failed: ${name}`, { error: error.message });
      }
      check.lastRun = new Date();
    }

    this.lastCheck = new Date();
    return results;
  }

  getStatus() {
    const status = {
      overall: 'healthy',
      checks: {},
      lastCheck: this.lastCheck,
      uptime: performanceMonitor.getUptime()
    };

    for (const [name, check] of this.checks) {
      status.checks[name] = {
        status: check.status,
        lastRun: check.lastRun,
        lastError: check.lastError
      };
      
      if (check.status === 'unhealthy') {
        status.overall = 'unhealthy';
      }
    }

    return status;
  }
}

const healthMonitor = new HealthMonitor();

// Database health check
healthMonitor.registerCheck('database', async () => {
  const mongoose = require('mongoose');
  if (mongoose.connection.readyState !== 1) {
    throw new Error('Database connection not ready');
  }
  
  // Test with a simple query
  await mongoose.connection.db.admin().ping();
});

// Redis health check (if configured)
if (process.env.REDIS_URL) {
  healthMonitor.registerCheck('redis', async () => {
    const { getRedisClient, isRedisReady } = require('./redis');
    if (!isRedisReady()) {
      throw new Error('Redis connection not ready');
    }
    
    const client = getRedisClient();
    await client.ping();
  });
}

// External service health checks
healthMonitor.registerCheck('ai-service', async () => {
  const axios = require('axios');
  const aiServiceUrl = process.env.AI_SERVICE_URL || 'https://ai.pawfectmatch.com';
  
  try {
    const response = await axios.get(`${aiServiceUrl}/health`, { timeout: 5000 });
    if (response.status !== 200) {
      throw new Error(`AI service returned status ${response.status}`);
    }
  } catch (error) {
    throw new Error(`AI service unavailable: ${error.message}`);
  }
});

// Stripe health check
if (process.env.STRIPE_SECRET_KEY) {
  healthMonitor.registerCheck('stripe', async () => {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    try {
      await stripe.balance.retrieve();
    } catch (error) {
      throw new Error(`Stripe API unavailable: ${error.message}`);
    }
  });
}

// Cloudinary health check
if (process.env.CLOUDINARY_CLOUD_NAME) {
  healthMonitor.registerCheck('cloudinary', async () => {
    // Cloudinary doesn't have a direct health endpoint, but we can verify configuration
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
      throw new Error('Cloudinary configuration incomplete');
    }
  });
}

// Error tracking middleware
const errorTrackingMiddleware = (err, req, res, next) => {
  const errorInfo = {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.userId || 'anonymous'
  };

  logger.error('Unhandled error', errorInfo);

  // Send to external error tracking service if configured
  if (process.env.SENTRY_DSN) {
    // Sentry integration would go here
  }

  next(err);
};

// Request logging middleware
const requestLoggingMiddleware = (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    logger.info('HTTP request', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.userId || 'anonymous'
    });

    // Log slow requests
    if (duration > 1000) {
      logger.warn('Slow request', {
        method: req.method,
        url: req.url,
        duration,
        threshold: 1000
      });
    }
  });

  next();
};

module.exports = {
  logger,
  performanceMonitor,
  healthMonitor,
  errorTrackingMiddleware,
  requestLoggingMiddleware
};
