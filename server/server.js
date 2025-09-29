const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Validate environment variables before starting
require('./src/utils/validateEnv')();

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

// Initialize Sentry
initSentry(app);

// Sentry request handler (must be first)
if (process.env.SENTRY_DSN) {
  app.use(sentryRequestHandler());
  app.use(sentryTracingHandler());
}

// Import routes
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const petRoutes = require('./src/routes/pets');
const matchRoutes = require('./src/routes/matches');
const chatRoutes = require('./src/routes/chat');
const aiRoutes = require('./src/routes/ai');
const premiumRoutes = require('./src/routes/premium');

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
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 API requests per windowMs
  message: 'Too many API requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/api/health', // Skip rate limiting for health checks
});

// Apply different rate limits to different routes (disabled in test env)
if (!isTestEnv) {
  app.use('/api/auth', authLimiter);
  app.use('/api/', apiLimiter);
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

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // mobile apps / curl
    if (devAllowedOrigins.includes(origin)) return callback(null, true);
    if (/^http:\/\/localhost:3\d{3}$/.test(origin) || /^http:\/\/127\.0\.0\.1:3\d{3}$/.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing & compression
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('combined'));

// Database connection with fallback to in-memory server
const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;
  
  if (!mongoUri) {
    logger.error('MONGODB_URI not configured! Cannot start server.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info(`🚀 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

// Health check routes (public - no auth required)
const healthRoutes = require('./src/routes/health');
app.use('/health', healthRoutes);
app.use('/api/health', healthRoutes); // Also available under /api prefix

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/pets', authenticateToken, petRoutes);
app.use('/api/matches', authenticateToken, matchRoutes);
app.use('/api/chat', authenticateToken, chatRoutes);
app.use('/api/ai', authenticateToken, aiRoutes);
app.use('/api/premium', authenticateToken, premiumRoutes);

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
  app.use(sentryErrorHandler());
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
  
  const PORT = process.env.PORT || 5000;
  
  const listen = (portToTry) => {
    httpServer.listen(portToTry, () => {
      logger.info(`🌟 PawfectMatch Premium Server running on port ${portToTry}`);
      logger.info(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
    }).on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        logger.warn(`⚠️ Port ${portToTry} in use, trying ${portToTry + 1}`);
        listen(portToTry + 1);
      } else {
        throw err;
      }
    });
  };

  listen(PORT);
};

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('👋 SIGTERM received, shutting down gracefully');
  httpServer.close(() => {
    logger.info('✅ Process terminated');
  });
});

// Start the server only if this file is run directly (not when imported by tests)
if (require.main === module) {
  startServer().catch((error) => {
    logger.error('Failed to start server:', error);
    process.exit(1);
  });
}

// Export for testing
module.exports = app;