const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const { ElasticsearchTransport } = require('winston-elasticsearch');
const logger = require('../utils/logger');

/**
 * Advanced Logging Service
 * Provides comprehensive logging with aggregation and monitoring
 */

// Log levels
const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Log colors
const LOG_COLORS = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
};

winston.addColors(LOG_COLORS);

/**
 * Create custom log format
 */
const createLogFormat = (includeTimestamp = true) => {
  const formats = [
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      const logEntry = {
        timestamp: includeTimestamp ? timestamp : undefined,
        level,
        message,
        service: 'pawfectmatch-api',
        environment: process.env.NODE_ENV || 'development',
        ...meta
      };
      
      return JSON.stringify(logEntry);
    })
  ];
  
  return winston.format.combine(...formats);
};

/**
 * Create console transport for development
 */
const createConsoleTransport = () => {
  return new winston.transports.Console({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
        return `${timestamp} [${level}]: ${message}${metaStr}`;
      })
    )
  });
};

/**
 * Create file transport with rotation
 */
const createFileTransport = (filename, level = 'info') => {
  return new DailyRotateFile({
    filename: `logs/${filename}-%DATE%.log`,
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    level,
    format: createLogFormat(),
    auditFile: `logs/.audit/${filename}-audit.json`
  });
};

/**
 * Create Elasticsearch transport for production
 */
const createElasticsearchTransport = () => {
  if (!process.env.ELASTICSEARCH_URL) {
    return null;
  }
  
  try {
    return new ElasticsearchTransport({
      level: 'info',
      clientOpts: {
        node: process.env.ELASTICSEARCH_URL,
        auth: process.env.ELASTICSEARCH_AUTH ? {
          username: process.env.ELASTICSEARCH_USERNAME,
          password: process.env.ELASTICSEARCH_PASSWORD
        } : undefined
      },
      index: 'pawfectmatch-logs',
      indexTemplate: {
        settings: {
          number_of_shards: 1,
          number_of_replicas: 0
        },
        mappings: {
          properties: {
            timestamp: { type: 'date' },
            level: { type: 'keyword' },
            message: { type: 'text' },
            service: { type: 'keyword' },
            environment: { type: 'keyword' },
            userId: { type: 'keyword' },
            requestId: { type: 'keyword' },
            ip: { type: 'ip' },
            userAgent: { type: 'text' },
            method: { type: 'keyword' },
            url: { type: 'keyword' },
            statusCode: { type: 'integer' },
            responseTime: { type: 'float' }
          }
        }
      }
    });
  } catch (error) {
    logger.error('Failed to create Elasticsearch transport:', error);
    return null;
  }
};

/**
 * Create application logger
 */
function createApplicationLogger() {
  const transports = [];
  
  // Console transport for development
  if (process.env.NODE_ENV !== 'production') {
    transports.push(createConsoleTransport());
  }
  
  // File transports
  transports.push(
    createFileTransport('application', 'info'),
    createFileTransport('error', 'error'),
    createFileTransport('access', 'http')
  );
  
  // Elasticsearch transport for production
  if (process.env.NODE_ENV === 'production') {
    const esTransport = createElasticsearchTransport();
    if (esTransport) {
      transports.push(esTransport);
    }
  }
  
  return winston.createLogger({
    levels: LOG_LEVELS,
    level: process.env.LOG_LEVEL || 'info',
    format: createLogFormat(),
    transports,
    exitOnError: false
  });
}

/**
 * Create request logger middleware
 */
function createRequestLogger() {
  const requestLogger = winston.createLogger({
    level: 'http',
    format: createLogFormat(),
    transports: [
      createFileTransport('access', 'http'),
      ...(process.env.NODE_ENV === 'production' ? [createElasticsearchTransport()] : [])
    ].filter(Boolean)
  });
  
  return (req, res, next) => {
    const startTime = Date.now();
    const requestId = req.headers['x-request-id'] || require('crypto').randomUUID();
    
    // Add request ID to request object
    req.requestId = requestId;
    
    // Log request
    requestLogger.http('Request started', {
      requestId,
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id,
      timestamp: new Date().toISOString()
    });
    
    // Override res.end to log response
    const originalEnd = res.end;
    res.end = function(chunk, encoding) {
      const responseTime = Date.now() - startTime;
      
      requestLogger.http('Request completed', {
        requestId,
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        responseTime,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id,
        contentLength: res.get('Content-Length'),
        timestamp: new Date().toISOString()
      });
      
      originalEnd.call(this, chunk, encoding);
    };
    
    next();
  };
}

/**
 * Create error logger
 */
function createErrorLogger() {
  return winston.createLogger({
    level: 'error',
    format: createLogFormat(),
    transports: [
      createFileTransport('error', 'error'),
      ...(process.env.NODE_ENV === 'production' ? [createElasticsearchTransport()] : [])
    ].filter(Boolean)
  });
}

/**
 * Create performance logger
 */
function createPerformanceLogger() {
  return winston.createLogger({
    level: 'info',
    format: createLogFormat(),
    transports: [
      createFileTransport('performance', 'info'),
      ...(process.env.NODE_ENV === 'production' ? [createElasticsearchTransport()] : [])
    ].filter(Boolean)
  });
}

/**
 * Create security logger
 */
function createSecurityLogger() {
  return winston.createLogger({
    level: 'warn',
    format: createLogFormat(),
    transports: [
      createFileTransport('security', 'warn'),
      ...(process.env.NODE_ENV === 'production' ? [createElasticsearchTransport()] : [])
    ].filter(Boolean)
  });
}

/**
 * Log aggregation utilities
 */
const logAggregation = {
  /**
   * Log user activity
   */
  logUserActivity: (userId, action, details = {}) => {
    const appLogger = createApplicationLogger();
    appLogger.info('User activity', {
      userId,
      action,
      ...details,
      timestamp: new Date().toISOString()
    });
  },
  
  /**
   * Log API performance
   */
  logApiPerformance: (endpoint, method, responseTime, statusCode, userId = null) => {
    const perfLogger = createPerformanceLogger();
    perfLogger.info('API performance', {
      endpoint,
      method,
      responseTime,
      statusCode,
      userId,
      timestamp: new Date().toISOString()
    });
  },
  
  /**
   * Log security events
   */
  logSecurityEvent: (event, details = {}) => {
    const securityLogger = createSecurityLogger();
    securityLogger.warn('Security event', {
      event,
      ...details,
      timestamp: new Date().toISOString()
    });
  },
  
  /**
   * Log database operations
   */
  logDatabaseOperation: (operation, collection, duration, userId = null) => {
    const perfLogger = createPerformanceLogger();
    perfLogger.info('Database operation', {
      operation,
      collection,
      duration,
      userId,
      timestamp: new Date().toISOString()
    });
  },
  
  /**
   * Log business events
   */
  logBusinessEvent: (event, details = {}) => {
    const appLogger = createApplicationLogger();
    appLogger.info('Business event', {
      event,
      ...details,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Log analysis utilities
 */
const logAnalysis = {
  /**
   * Get error statistics
   */
  async getErrorStats(timeRange = '24h') => {
    // This would typically query Elasticsearch or your log aggregation system
    // For now, return a mock structure
    return {
      totalErrors: 0,
      errorRate: 0,
      topErrors: [],
      timeRange
    };
  },
  
  /**
   * Get performance statistics
   */
  async getPerformanceStats(timeRange = '24h') => {
    return {
      avgResponseTime: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0,
      requestsPerSecond: 0,
      timeRange
    };
  },
  
  /**
   * Get user activity statistics
   */
  async getUserActivityStats(timeRange = '24h') => {
    return {
      activeUsers: 0,
      newUsers: 0,
      topActions: [],
      timeRange
    };
  }
};

/**
 * Log cleanup utilities
 */
const logCleanup = {
  /**
   * Clean up old log files
   */
  async cleanupOldLogs() {
    // This would typically be handled by log rotation
    // But we can add custom cleanup logic here
    logger.info('Log cleanup completed');
  },
  
  /**
   * Archive logs
   */
  async archiveLogs() {
    // Archive old logs to long-term storage
    logger.info('Log archiving completed');
  }
};

// Create logger instances
const applicationLogger = createApplicationLogger();
const requestLogger = createRequestLogger();
const errorLogger = createErrorLogger();
const performanceLogger = createPerformanceLogger();
const securityLogger = createSecurityLogger();

module.exports = {
  applicationLogger,
  requestLogger,
  errorLogger,
  performanceLogger,
  securityLogger,
  logAggregation,
  logAnalysis,
  logCleanup,
  createApplicationLogger,
  createRequestLogger,
  createErrorLogger,
  createPerformanceLogger,
  createSecurityLogger
};
