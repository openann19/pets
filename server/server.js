const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');

// Load environment-specific .env file
if (process.env.NODE_ENV === 'development') {
  require('dotenv').config({ path: path.join(__dirname, '.env.development') });
} else {
  require('dotenv').config();
}

// Validate environment variables before starting
require('./src/utils/validateEnv')();

// Validate production-specific configuration
const { validateProductionEnv, getProductionConfig } = require('./src/config/production');
validateProductionEnv();

// Use centralized logger
const logger = require('./src/utils/logger');

// Initialize Sentry (must be before other imports)
const { 
  initSentry, 
  sentryRequestHandler, 
  sentryTracingHandler,
  sentryErrorHandler 
} = require('./src/config/sentry');

const app = express();

// Initialize Sentry (disabled for demo)
// initSentry(app);

// Sentry request handler (must be first) - disabled for demo
// if (process.env.SENTRY_DSN) {
//   app.use(sentryRequestHandler());
//   app.use(sentryTracingHandler());
// }

// Import routes
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const petRoutes = require('./src/routes/pets');
const matchRoutes = require('./src/routes/matches');
const chatRoutes = require('./src/routes/chat');
const aiRoutes = require('./src/routes/ai');
const premiumRoutes = require('./src/routes/premium');
const breedRoutes = require('./src/routes/breeds');
const adminRoutes = require('./src/routes/admin');

// Import middleware
const errorHandler = require('./src/middleware/errorHandler');
const { authenticateToken } = require('./src/middleware/auth');

const httpServer = createServer(app);

// Socket.io setup with CORS
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Security middleware - Tightened for production
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", process.env.CLIENT_URL || "http://localhost:3000"],
      mediaSrc: ["'self'", "blob:"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }
}));

// Additional security headers
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self), payment=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  next();
});

// Enhanced rate limiting with different limits for different endpoints
const isTestEnv = process.env.NODE_ENV === 'test';
const isProd = process.env.NODE_ENV === 'production';
const prodConfig = getProductionConfig();

const authLimiter = rateLimit({
  windowMs: prodConfig.rateLimiting.auth.windowMs,
  max: prodConfig.rateLimiting.auth.max,
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded for auth', {
      ip: req.ip,
      path: req.path
    });
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts, please try again later.',
      retryAfter: Math.ceil(prodConfig.rateLimiting.auth.windowMs / 1000)
    });
  }
});

const apiLimiter = rateLimit({
  windowMs: prodConfig.rateLimiting.api.windowMs,
  max: prodConfig.rateLimiting.api.max,
  message: 'Too many API requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/api/health' || req.path === '/health', // Skip rate limiting for health checks
  skipSuccessfulRequests: false, // Count all requests in production
  handler: (req, res) => {
    logger.warn('Rate limit exceeded for API', {
      ip: req.ip,
      path: req.path,
      userId: req.userId
    });
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later.',
      retryAfter: Math.ceil(prodConfig.rateLimiting.api.windowMs / 1000)
    });
  }
});

// Apply different rate limits to different routes (disabled in test env)
if (!isTestEnv) {
  app.use('/api/auth', authLimiter);
  if (isProd) {
    app.use('/api/', apiLimiter); // Only enforce strict API limits in production
  }
}

// CORS configuration (allow common localhost dev ports)
const devAllowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3002',
];

// Production allowed origins (comma-separated list from env)
const prodAllowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : [];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    // In development, allow all localhost origins
    if (process.env.NODE_ENV === 'development') {
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
    }
    
    // Check against allowed origins
    if (devAllowedOrigins.includes(origin)) return callback(null, true);
    if (/^http:\/\/localhost:3\d{3}$/.test(origin) || /^http:\/\/127\.0\.0\.1:3\d{3}$/.test(origin)) {
      return callback(null, true);
    }
    
    // In production, check against whitelist
    if (process.env.NODE_ENV === 'production') {
      if (prodAllowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      logger.warn(`CORS blocked origin: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    }
    
    // Default allow in development
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600 // Cache preflight for 10 minutes
}));

// Body parsing & compression
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request tracking and metrics
const { requestIdMiddleware, metricsMiddleware } = require('./src/middleware/requestTracking');
app.use(requestIdMiddleware);
app.use(metricsMiddleware);

// Logging
app.use(morgan('combined'));

// Redis connection (optional, for production caching)
const { initRedis, closeRedis } = require('./src/config/redis');

// Database connection
const connectDB = async (retries = 5, delay = 5000) => {
  const mongoUri = process.env.MONGODB_URI;
  
  if (!mongoUri) {
    logger.error('❌ MONGODB_URI not provided in environment variables');
    process.exit(1);
  }

  // Validate URI format
  try {
    new URL(mongoUri);
  } catch {
    logger.error('❌ Invalid MONGODB_URI format');
    process.exit(1);
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      logger.info(`🚀 MongoDB Connected: ${conn.connection.host}`);
      
      // Handle connection events
      mongoose.connection.on('disconnected', () => {
        logger.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
      });
      
      mongoose.connection.on('reconnected', () => {
        logger.info('✅ MongoDB reconnected successfully');
      });
      
      return; // Connection successful
    } catch (error) {
      logger.error(`❌ Database connection attempt ${attempt}/${retries} failed:`, error.message);
      
      if (attempt === retries) {
        logger.error('❌ All database connection attempts failed. Exiting...');
        process.exit(1);
      }
      
      logger.info(`⏳ Retrying in ${delay / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Health check routes (public - no auth required)
const healthRoutes = require('./src/routes/health');
app.use('/health', healthRoutes);
app.use('/api/health', healthRoutes); // Also available under /api prefix

// Caching middleware (for public routes)
const { cacheMiddleware, invalidateOnMutation } = require('./src/middleware/caching');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/pets', invalidateOnMutation('/api/pets'), petRoutes);
app.use('/api/matches', authenticateToken, matchRoutes);
app.use('/api/chat', authenticateToken, chatRoutes);
app.use('/api/ai', authenticateToken, aiRoutes);
app.use('/api/premium', authenticateToken, premiumRoutes);
app.use('/api/breeds', cacheMiddleware(600), breedRoutes); // Cache breeds for 10 minutes
app.use('/api/admin', authenticateToken, adminRoutes); // Admin endpoints (add admin-only middleware in production)

// Error reporting routes
app.use('/api/errors', require('./src/routes/errorRoutes'));

// Legacy health check (deprecated - use /health instead)
app.get('/api/health/legacy', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV 
  });
});

// Socket.io for real-time chat
const chatSocket = require('./src/services/chatSocket');
chatSocket(io);

// Socket.io for pulse
const pulseSocket = require('./src/sockets/pulse');
pulseSocket(io);

// Socket.io for suggestions
try {
  const suggestionsSocket = require('./src/sockets/suggestions');
  suggestionsSocket(io);
} catch (error) {
  console.log('⚠️ Suggestions socket module not found or failed to load');
}

// Socket.io for WebRTC calling
try {
  const webrtcSocket = require('./src/sockets/webrtc');
  const webrtcService = webrtcSocket(io);
  console.log('✅ WebRTC signaling service initialized');
  
  // Make WebRTC service available globally for admin functions
  global.webrtcService = webrtcService;
} catch (error) {
  console.log('⚠️ WebRTC socket module not found or failed to load:', error.message);
}

// Socket.io for Map tracking
try {
  const MapSocketServer = require('./src/sockets/mapSocket');
  const mapSocketServer = new MapSocketServer(httpServer);
  console.log('🗺️ Map socket server initialized');
  
  // Make map service available globally
  global.mapSocketServer = mapSocketServer;
} catch (error) {
  console.log('⚠️ Map socket module not found or failed to load:', error.message);
}

// Sentry error handler (must be before other error handlers)
if (process.env.SENTRY_DSN) {
  // app.use(sentryErrorHandler()); // Disabled for demo
}

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler (generic middleware, no path-to-regexp)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Start server function
const startServer = async () => {
  await connectDB();
  
  // Initialize Redis (optional, won't fail if not configured)
  await initRedis().catch(err => {
    logger.warn('Redis initialization skipped:', err.message);
  });
  
  const PORT = process.env.PORT || 5001;

  httpServer
    .listen(PORT, () => {
      logger.info(`🌟 PawfectMatch Premium Server running on port ${PORT}`);
      logger.info(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`