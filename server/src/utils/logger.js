/**
 * Centralized Logger
 * Uses Winston for structured logging
 */

const winston = require('winston');
const path = require('path');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}] ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'pawfectmatch-api' },
  transports: [
    // Write all logs to combined.log
    new winston.transports.File({ 
      filename: path.join(process.cwd(), 'logs', 'combined.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 5
    }),
    // Write errors to error.log
    new winston.transports.File({ 
      filename: path.join(process.cwd(), 'logs', 'error.log'),
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5
    })
  ],
  // Handle exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({ 
      filename: path.join(process.cwd(), 'logs', 'exceptions.log'),
      maxsize: 10485760,
      maxFiles: 3
    })
  ],
  rejectionHandlers: [
    new winston.transports.File({ 
      filename: path.join(process.cwd(), 'logs', 'rejections.log'),
      maxsize: 10485760,
      maxFiles: 3
    })
  ]
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

// Add convenience methods
logger.request = (req, message) => {
  logger.info(message, {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userId: req.userId
  });
};

logger.apiError = (req, error, statusCode = 500) => {
  logger.error('API Error', {
    method: req.method,
    url: req.url,
    statusCode,
    error: error.message,
    stack: error.stack,
    userId: req.userId
  });
};

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

module.exports = logger;
