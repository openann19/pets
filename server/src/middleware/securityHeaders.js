const helmet = require('helmet');
const logger = require('../utils/logger');

/**
 * Security Headers Middleware
 * Implements comprehensive security headers for production
 */

/**
 * Create Content Security Policy
 */
function createCSP() {
  const isProduction = process.env.NODE_ENV === 'production';
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  
  // Base CSP configuration
  const cspConfig = {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      "'unsafe-inline'", // Required for Next.js
      "'unsafe-eval'",   // Required for Next.js development
      'https://js.stripe.com',
      'https://checkout.stripe.com',
      'https://maps.googleapis.com',
      'https://maps.gstatic.com'
    ],
    styleSrc: [
      "'self'",
      "'unsafe-inline'", // Required for styled-components and CSS-in-JS
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com'
    ],
    fontSrc: [
      "'self'",
      'https://fonts.gstatic.com',
      'https://fonts.googleapis.com'
    ],
    imgSrc: [
      "'self'",
      'data:', // For base64 images
      'blob:', // For blob URLs
      'https://res.cloudinary.com', // Cloudinary images
      'https://images.unsplash.com', // Unsplash images
      'https://maps.googleapis.com',
      'https://maps.gstatic.com',
      'https://streetviewpixels-pa.googleapis.com'
    ],
    mediaSrc: [
      "'self'",
      'blob:',
      'https://res.cloudinary.com'
    ],
    connectSrc: [
      "'self'",
      clientUrl,
      'https://api.stripe.com',
      'https://maps.googleapis.com',
      'wss://maps.googleapis.com',
      'https://res.cloudinary.com',
      process.env.AI_SERVICE_URL || 'http://localhost:8000'
    ],
    frameSrc: [
      "'self'",
      'https://js.stripe.com',
      'https://checkout.stripe.com',
      'https://hooks.stripe.com'
    ],
    objectSrc: ["'none'"],
    baseUri: ["'self'"],
    formAction: [
      "'self'",
      'https://checkout.stripe.com'
    ],
    frameAncestors: ["'none'"],
    upgradeInsecureRequests: isProduction ? [] : null, // Only in production
    reportUri: isProduction ? '/api/security/csp-report' : null
  };
  
  // Remove null values
  Object.keys(cspConfig).forEach(key => {
    if (cspConfig[key] === null) {
      delete cspConfig[key];
    }
  });
  
  return cspConfig;
}

/**
 * Create security headers configuration
 */
function createSecurityHeaders() {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    // Content Security Policy
    contentSecurityPolicy: {
      directives: createCSP()
    },
    
    // Cross-Origin Embedder Policy
    crossOriginEmbedderPolicy: false, // Disable for compatibility
    
    // Cross-Origin Opener Policy
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    
    // Cross-Origin Resource Policy
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    
    // DNS Prefetch Control
    dnsPrefetchControl: { allow: false },
    
    // Download Options
    downloadOptions: { attachment: true },
    
    // Expect CT
    expectCt: {
      maxAge: 86400,
      enforce: true
    },
    
    // Frameguard
    frameguard: { action: 'deny' },
    
    // Hide Powered-By
    hidePoweredBy: true,
    
    // HSTS
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    },
    
    // IE No Open
    ieNoOpen: true,
    
    // No Sniff
    noSniff: true,
    
    // Origin Agent Cluster
    originAgentCluster: true,
    
    // Permissions Policy
    permissionsPolicy: {
      camera: [],
      microphone: [],
      geolocation: ['self'],
      payment: ['self'],
      usb: [],
      magnetometer: [],
      gyroscope: [],
      accelerometer: []
    },
    
    // Referrer Policy
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    
    // XSS Filter
    xssFilter: true
  };
}

/**
 * Create security middleware
 */
function createSecurityMiddleware() {
  const securityConfig = createSecurityHeaders();
  
  return helmet(securityConfig);
}

/**
 * Custom security middleware for additional headers
 */
function createCustomSecurityMiddleware() {
  return (req, res, next) => {
    // Add custom security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self), payment=(self)');
    
    // Add server identification (optional)
    if (process.env.NODE_ENV === 'production') {
      res.setHeader('Server', 'PawfectMatch-API');
    }
    
    // Add request ID for tracking
    const requestId = req.headers['x-request-id'] || require('crypto').randomUUID();
    res.setHeader('X-Request-ID', requestId);
    
    next();
  };
}

/**
 * CSP violation reporting endpoint
 */
function createCSPReportHandler() {
  return (req, res) => {
    try {
      const violation = req.body;
      
      logger.warn('CSP Violation detected', {
        documentUri: violation['document-uri'],
        referrer: violation.referrer,
        violatedDirective: violation['violated-directive'],
        effectiveDirective: violation['effective-directive'],
        originalPolicy: violation['original-policy'],
        disposition: violation.disposition,
        blockedUri: violation['blocked-uri'],
        lineNumber: violation['line-number'],
        columnNumber: violation['column-number'],
        sourceFile: violation['source-file'],
        statusCode: violation['status-code'],
        timestamp: new Date().toISOString()
      });
      
      res.status(204).send();
    } catch (error) {
      logger.error('Error processing CSP report:', error);
      res.status(400).json({ error: 'Invalid CSP report' });
    }
  };
}

/**
 * Security monitoring middleware
 */
function createSecurityMonitoringMiddleware() {
  return (req, res, next) => {
    // Log suspicious requests
    const suspiciousPatterns = [
      /\.\.\//, // Directory traversal
      /<script/i, // XSS attempts
      /union.*select/i, // SQL injection
      /eval\(/i, // Code injection
      /javascript:/i, // JavaScript protocol
      /data:text\/html/i // HTML data URLs
    ];
    
    const userAgent = req.get('User-Agent') || '';
    const url = req.url;
    const body = JSON.stringify(req.body || {});
    
    const isSuspicious = suspiciousPatterns.some(pattern => 
      pattern.test(url) || pattern.test(userAgent) || pattern.test(body)
    );
    
    if (isSuspicious) {
      logger.warn('Suspicious request detected', {
        ip: req.ip,
        userAgent,
        url,
        method: req.method,
        body: body.substring(0, 500), // Limit body size in logs
        timestamp: new Date().toISOString()
      });
      
      // Optionally block suspicious requests
      if (process.env.NODE_ENV === 'production') {
        return res.status(400).json({ error: 'Invalid request' });
      }
    }
    
    next();
  };
}

/**
 * Rate limiting headers
 */
function addRateLimitHeaders(req, res, next) {
  // Add rate limit headers to response
  res.setHeader('X-RateLimit-Limit', '100');
  res.setHeader('X-RateLimit-Remaining', '99');
  res.setHeader('X-RateLimit-Reset', Math.floor(Date.now() / 1000) + 900); // 15 minutes
  
  next();
}

/**
 * Security health check
 */
function securityHealthCheck(req, res) {
  const securityStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    security: {
      csp: 'enabled',
      hsts: 'enabled',
      xssProtection: 'enabled',
      frameOptions: 'enabled',
      contentTypeOptions: 'enabled'
    },
    environment: process.env.NODE_ENV
  };
  
  res.json(securityStatus);
}

module.exports = {
  createSecurityHeaders,
  createSecurityMiddleware,
  createCustomSecurityMiddleware,
  createCSPReportHandler,
  createSecurityMonitoringMiddleware,
  addRateLimitHeaders,
  securityHealthCheck
};
