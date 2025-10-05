# 🚀 ПЛАН ЗА PRODUCTION READINESS - PAWFECTMATCH

## Семантичен анализ и критични подобрения за продукционна среда

---

## 📋 СЪДЪРЖАНИЕ

1. [Критични Security Issues](#1-критични-security-issues)
2. [Конфигурационни подобрения](#2-конфигурационни-подобрения)
3. [Database оптимизации](#3-database-оптимизации)
4. [API защита и Rate Limiting](#4-api-защита-и-rate-limiting)
5. [Error Handling & Logging](#5-error-handling--logging)
6. [File Upload & Media Security](#6-file-upload--media-security)
7. [Real-time Communication Security](#7-real-time-communication-security)
8. [Frontend Production Build](#8-frontend-production-build)
9. [Testing & Quality Assurance](#9-testing--quality-assurance)
10. [Monitoring & Alerting](#10-monitoring--alerting)
11. [Deployment Strategy](#11-deployment-strategy)
12. [Backup & Disaster Recovery](#12-backup--disaster-recovery)
13. [Performance Optimization](#13-performance-optimization)
14. [Documentation](#14-documentation)
15. [Production Checklist](#15-production-checklist)

---

## 1. КРИТИЧНИ SECURITY ISSUES

### 🔴 КРИТИЧНО: Admin Routes без защита

**Проблем:** `server/src/routes/admin.js` НЕ използва authentication middleware!

**Текущ код:**
```javascript
router.get('/metrics', (req, res) => { ... });
router.post('/cache/clear', (req, res) => { ... });
```

**Трябва да стане:**
```javascript
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Всички admin routes трябва да имат тези два middleware-а
router.get('/metrics', authenticateToken, requireAdmin, (req, res) => { ... });
router.post('/metrics/reset', authenticateToken, requireAdmin, (req, res) => { ... });
router.post('/cache/clear', authenticateToken, requireAdmin, (req, res) => { ... });
```

**Действие:**
1. Добавете `authenticateToken` и `requireAdmin` към ВСИЧКИ admin routes
2. Създайте admin потребители в базата с role: 'admin'
3. Обновете User model да има `role` поле

---

### 🔴 КРИТИЧНО: JWT Secret в production

**Проблем:** JWT_SECRET може да е слаб или default стойност

**Решение:**
```bash
# Генерирайте силен secret (минимум 64 символа)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# В .env файла:
JWT_SECRET=<generated-strong-secret>
JWT_REFRESH_SECRET=<another-generated-strong-secret>
```

**Валидация при старт:**
```javascript
// server/src/utils/validateEnv.js
function validateEnv() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters in production');
  }
  
  if (process.env.NODE_ENV === 'production' && 
      process.env.JWT_SECRET === 'your-super-secret-jwt-key-change-this-in-production-12345') {
    throw new Error('JWT_SECRET must be changed from default value!');
  }
}
```

---

### 🔴 КРИТИЧНО: Password hashing strength

**Проблем:** bcrypt rounds може да е твърде нисък

**Решение:**
```javascript
// server/src/models/User.js
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  // Production: използвайте 12-14 rounds за по-добра сигурност
  const saltRounds = process.env.NODE_ENV === 'production' ? 12 : 10;
  this.password = await bcrypt.hash(this.password, saltRounds);
  next();
});
```

---

### 🟡 Важно: CORS Configuration

**Проблем:** Development CORS е твърде permissive

**Решение:**
```javascript
// server/server.js
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin && process.env.NODE_ENV !== 'production') {
      return callback(null, true); // Allow Postman/curl in dev only
    }
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  maxAge: 86400 // 24 hours
}));
```

---

### 🟡 Важно: Rate Limiting за Production

**Проблем:** Rate limits са твърде високи за development

**Решение:**
```javascript
// server/server.js
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 5 : 500,
  message: 'Too many authentication attempts',
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  skipSuccessfulRequests: true, // Не брои успешни заявки
});
```

---

### 🟡 Важно: Input Validation

**Проблем:** Не всички endpoints имат валидация

**Решение:** Добавете express-validator към ВСИЧКИ POST/PUT endpoints:

```javascript
// Пример: server/src/routes/pets.js
router.put('/:id', authenticateToken, [
  param('id').isMongoId().withMessage('Invalid pet ID'),
  body('name').optional().trim().isLength({ min: 1, max: 50 }),
  body('age').optional().isInt({ min: 0, max: 30 }),
  body('weight').optional().isFloat({ min: 0, max: 200 }),
], validate, updatePet);
```

---

## 2. КОНФИГУРАЦИОННИ ПОДОБРЕНИЯ

### Environment Variables Validation

**Създайте:** `server/src/config/production.js`

```javascript
const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'CLIENT_URL',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'STRIPE_SECRET_KEY',
  'EMAIL_USER',
  'EMAIL_PASS'
];

function validateProductionEnv() {
  if (process.env.NODE_ENV !== 'production') return;
  
  const missing = requiredEnvVars.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  // Validate formats
  if (!process.env.MONGODB_URI.includes('mongodb://') && 
      !process.env.MONGODB_URI.includes('mongodb+srv://')) {
    throw new Error('Invalid MONGODB_URI format');
  }
  
  if (!process.env.CLIENT_URL.startsWith('https://') && 
      process.env.NODE_ENV === 'production') {
    console.warn('⚠️  CLIENT_URL should use HTTPS in production');
  }
}

module.exports = { validateProductionEnv };
```

**В `server/server.js` добавете:**
```javascript
const { validateProductionEnv } = require('./src/config/production');
validateProductionEnv();
```

---

### MongoDB Production Configuration

**Проблем:** Липсва connection pooling и retry logic

**Решение:**
```javascript
// server/server.js
const mongoOptions = {
  maxPoolSize: 10, // Connection pool
  minPoolSize: 2,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 5000,
  family: 4, // Force IPv4
  retryWrites: true,
  retryReads: true,
  w: 'majority' // Write concern
};

const connectDB = async (retries = 5, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, mongoOptions);
      logger.info('✅ MongoDB connected successfully');
      
      // Setup change streams for real-time updates (optional)
      setupChangeStreams();
      
      return;
    } catch (error) {
      logger.error(`MongoDB connection attempt ${i + 1}/${retries} failed:`, error.message);
      
      if (i === retries - 1) {
        logger.error('❌ Failed to connect to MongoDB after all retries');
        process.exit(1);
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};
```

---

### Redis для Production Caching

**Проблем:** node-cache е in-memory и губи данни при restart

**Решение:** Добавете Redis за production

```javascript
// server/src/config/redis.js
const redis = require('redis');

let redisClient = null;

async function getRedisClient() {
  if (redisClient) return redisClient;
  
  if (process.env.NODE_ENV === 'production' && process.env.REDIS_URL) {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) return new Error('Redis reconnect limit reached');
          return retries * 100;
        }
      }
    });
    
    redisClient.on('error', (err) => logger.error('Redis error:', err));
    redisClient.on('connect', () => logger.info('✅ Redis connected'));
    
    await redisClient.connect();
    return redisClient;
  }
  
  // Fallback to node-cache in development
  return null;
}

module.exports = { getRedisClient };
```

---

## 3. DATABASE ОПТИМИЗАЦИИ

### Indexes за Performance

**Критично важно:** Добавете indexes към моделите

```javascript
// server/src/models/Pet.js
petSchema.index({ owner: 1 });
petSchema.index({ species: 1, intent: 1 });
petSchema.index({ location: '2dsphere' }); // Geospatial
petSchema.index({ breed: 1 });
petSchema.index({ 'stats.views': -1 });
petSchema.index({ createdAt: -1 });
petSchema.index({ isActive: 1, status: 1 });

// Compound index за discover query
petSchema.index({ 
  species: 1, 
  intent: 1, 
  isActive: 1, 
  status: 1 
});

// server/src/models/User.js
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ location: '2dsphere' });
userSchema.index({ 'premium.isActive': 1, 'premium.expiresAt': 1 });

// server/src/models/Match.js
matchSchema.index({ user1: 1, user2: 1 });
matchSchema.index({ pet1: 1, pet2: 1 });
matchSchema.index({ status: 1, lastActivity: -1 });
matchSchema.index({ 'messages.sender': 1, 'messages.sentAt': -1 });
```

**Създайте script за index creation:**
```javascript
// scripts/create-indexes.js
const mongoose = require('mongoose');
require('dotenv').config();

const Pet = require('../server/src/models/Pet');
const User = require('../server/src/models/User');
const Match = require('../server/src/models/Match');

async function createIndexes() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  console.log('Creating indexes...');
  await Pet.createIndexes();
  await User.createIndexes();
  await Match.createIndexes();
  
  console.log('✅ All indexes created');
  await mongoose.disconnect();
}

createIndexes().catch(console.error);
```

---

### Database Migrations

**Създайте:** `scripts/migrations/` директория

```javascript
// scripts/migrations/001-add-user-roles.js
const mongoose = require('mongoose');
const User = require('../../server/src/models/User');

async function up() {
  console.log('Adding role field to all users...');
  await User.updateMany(
    { role: { $exists: false } },
    { $set: { role: 'user' } }
  );
  console.log('✅ Migration complete');
}

async function down() {
  await User.updateMany(
    {},
    { $unset: { role: '' } }
  );
}

module.exports = { up, down };
```

---

### Data Validation на Schema ниво

```javascript
// server/src/models/Pet.js - Добавете custom validators
const petSchema = new mongoose.Schema({
  photos: {
    type: [{
      url: String,
      publicId: String,
      isPrimary: Boolean
    }],
    validate: {
      validator: function(photos) {
        // Минимум 1 снимка за активни pets
        if (this.isActive && photos.length === 0) {
          return false;
        }
        // Максимум 1 primary снимка
        const primaryCount = photos.filter(p => p.isPrimary).length;
        return primaryCount <= 1;
      },
      message: 'Pet must have at least 1 photo and only 1 primary photo'
    }
  }
});
```

---

## 4. API ЗАЩИТА И RATE LIMITING

### Request Size Limits

```javascript
// server/server.js
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    // Store raw body for webhook verification (Stripe)
    req.rawBody = buf.toString();
  }
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb',
  parameterLimit: 1000
}));
```

---

### Advanced Rate Limiting

```javascript
// server/src/middleware/advancedRateLimiting.js
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const { getRedisClient } = require('../config/redis');

async function createRateLimiter(options) {
  const redis = await getRedisClient();
  
  const limiterOptions = {
    windowMs: options.windowMs || 15 * 60 * 1000,
    max: options.max || 100,
    message: options.message || 'Too many requests',
    standardHeaders: true,
    legacyHeaders: false,
    
    // Key generator - по IP + user ID (ако е authenticated)
    keyGenerator: (req) => {
      const ip = req.ip || req.connection.remoteAddress;
      const userId = req.userId || 'anonymous';
      return `${ip}:${userId}`;
    },
    
    // Skip успешни заявки за някои endpoints
    skip: options.skip || ((req, res) => res.statusCode < 400),
    
    // Handler за exceeded limit
    handler: (req, res) => {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        userId: req.userId,
        path: req.path
      });
      
      res.status(429).json({
        success: false,
        message: options.message || 'Too many requests, please try again later',
        retryAfter: Math.ceil(options.windowMs / 1000)
      });
    }
  };
  
  // Използвай Redis store в production
  if (redis) {
    limiterOptions.store = new RedisStore({
      client: redis,
      prefix: 'rl:'
    });
  }
  
  return rateLimit(limiterOptions);
}

module.exports = { createRateLimiter };
```

---

### Per-User Rate Limiting

```javascript
// server/src/middleware/perUserLimiting.js
const userActionLimits = new Map();

function checkUserActionLimit(userId, action, limit, windowMs) {
  const key = `${userId}:${action}`;
  const now = Date.now();
  
  if (!userActionLimits.has(key)) {
    userActionLimits.set(key, []);
  }
  
  const actions = userActionLimits.get(key);
  
  // Remove old actions outside window
  const filtered = actions.filter(timestamp => now - timestamp < windowMs);
  userActionLimits.set(key, filtered);
  
  if (filtered.length >= limit) {
    return false; // Limit exceeded
  }
  
  filtered.push(now);
  userActionLimits.set(key, filtered);
  return true;
}

// Usage example
function swipeLimitMiddleware(req, res, next) {
  const isPremium = req.user?.premium?.isActive;
  const limit = isPremium ? Infinity : 50; // 50 swipes/day for free users
  const windowMs = 24 * 60 * 60 * 1000; // 24 hours
  
  if (!checkUserActionLimit(req.userId, 'swipe', limit, windowMs)) {
    return res.status(429).json({
      success: false,
      message: 'Daily swipe limit reached. Upgrade to Premium for unlimited swipes!',
      code: 'SWIPE_LIMIT_REACHED',
      upgradeUrl: '/premium'
    });
  }
  
  next();
}

module.exports = { swipeLimitMiddleware };
```

---

## 5. ERROR HANDLING & LOGGING

### Centralized Error Handler

```javascript
// server/src/middleware/errorHandler.js
class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

function errorHandler(err, req, res, next) {
  err.statusCode = err.statusCode || 500;
  
  // Log error
  logger.error('Error occurred', {
    message: err.message,
    stack: err.stack,
    statusCode: err.statusCode,
    path: req.path,
    method: req.method,
    userId: req.userId,
    requestId: req.id
  });
  
  // Send to Sentry in production
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    Sentry.captureException(err);
  }
  
  // Don't leak error details in production
  const response = {
    success: false,
    message: err.message,
    ...(err.code && { code: err.code })
  };
  
  // Include stack trace in development only
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }
  
  res.status(err.statusCode).json(response);
}

// Async handler wrapper
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { errorHandler, AppError, asyncHandler };
```

**Обновете всички контролери да използват asyncHandler:**
```javascript
// server/src/controllers/petController.js
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const createPet = asyncHandler(async (req, res) => {
  // Не е нужен try-catch, asyncHandler го прихваща
  const pet = await Pet.create({ ...req.body, owner: req.userId });
  
  if (!pet) {
    throw new AppError('Failed to create pet', 400, 'PET_CREATION_FAILED');
  }
  
  res.status(201).json({ success: true, data: { pet } });
});
```

---

### Winston Logger Configuration

```javascript
// server/src/utils/logger.js
const winston = require('winston');
const path = require('path');

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { 
    service: 'pawfectmatch-api',
    environment: process.env.NODE_ENV 
  },
  transports: [
    // Error log
    new winston.transports.File({ 
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5
    }),
    
    // Combined log
    new winston.transports.File({ 
      filename: path.join(__dirname, '../../logs/combined.log'),
      maxsize: 10485760,
      maxFiles: 10
    })
  ]
});

// Console transport за development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Log rotation
if (process.env.NODE_ENV === 'production') {
  require('winston-daily-rotate-file');
  
  logger.add(new winston.transports.DailyRotateFile({
    filename: 'logs/app-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d'
  }));
}

module.exports = logger;
```

---

## 6. FILE UPLOAD & MEDIA SECURITY

### Cloudinary Security

```javascript
// server/src/services/cloudinaryService.js
const { AppError } = require('../middleware/errorHandler');

// Virus scanning (optional, използвайте external service)
async function scanFileForVirus(buffer) {
  // Integrate with ClamAV or similar
  // Return true if safe, false if infected
  return true;
}

const uploadToCloudinary = async (fileBuffer, folder = 'pawfectmatch', options = {}) => {
  // Size check
  if (fileBuffer.length > 10 * 1024 * 1024) { // 10MB
    throw new AppError('File too large', 400, 'FILE_TOO_LARGE');
  }
  
  // Virus scan (optional)
  const isSafe = await scanFileForVirus(fileBuffer);
  if (!isSafe) {
    throw new AppError('File failed security scan', 400, 'UNSAFE_FILE');
  }
  
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder,
      resource_type: 'auto',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit', quality: 'auto:good' },
        { format: 'webp' }
      ],
      // Security
      invalidate: true, // Invalidate CDN cache
      overwrite: false, // Don't overwrite existing
      unique_filename: true,
      // Add watermark for production
      ...(process.env.NODE_ENV === 'production' && {
        overlay: {
          font_family: 'Arial',
          font_size: 20,
          text: 'PawfectMatch'
        },
        gravity: 'south_east',
        opacity: 50
      }),
      ...options
    };

    cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) {
        logger.error('Cloudinary upload error:', error);
        reject(new AppError('Upload failed', 500, 'UPLOAD_FAILED'));
      } else {
        resolve(result);
      }
    }).end(fileBuffer);
  });
};
```

---

### File Type Validation

```javascript
// server/src/middleware/fileValidation.js
const fileType = require('file-type');

async function validateImageFile(req, res, next) {
  if (!req.files || req.files.length === 0) {
    return next();
  }
  
  for (const file of req.files) {
    // Check magic bytes, not just extension
    const type = await fileType.fromBuffer(file.buffer);
    
    if (!type || !type.mime.startsWith('image/')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Only images are allowed.',
        code: 'INVALID_FILE_TYPE'
      });
    }
    
    // Allowed types
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedMimes.includes(type.mime)) {
      return res.status(400).json({
        success: false,
        message: `File type ${type.mime} not allowed`,
        code: 'UNSUPPORTED_FILE_TYPE'
      });
    }
  }
  
  next();
}

module.exports = { validateImageFile };
```

---

## 7. REAL-TIME COMMUNICATION SECURITY

### WebSocket Authentication Enhancement

```javascript
// server/src/sockets/webrtc.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

nsp.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication error: No token'));
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify user exists and is active
    const user = await User.findById(decoded.userId).select('isActive isBlocked premium');
    
    if (!user || !user.isActive || user.isBlocked) {
      return next(new Error('User not authorized'));
    }
    
    socket.userId = decoded.userId;
    socket.user = user;
    next();
  } catch (err) {
    logger.error('WebSocket auth error:', err);
    next(new Error('Authentication failed'));
  }
});
```

---

### Rate Limiting за Socket Events

```javascript
// server/src/sockets/socketRateLimiter.js
class SocketRateLimiter {
  constructor() {
    this.limits = new Map();
  }
  
  checkLimit(socketId, event, maxRequests = 10, windowMs = 1000) {
    const key = `${socketId}:${event}`;
    const now = Date.now();
    
    if (!this.limits.has(key)) {
      this.limits.set(key, []);
    }
    
    const timestamps = this.limits.get(key);
    const filtered = timestamps.filter(t => now - t < windowMs);
    
    if (filtered.length >= maxRequests) {
      return false; // Limit exceeded
    }
    
    filtered.push(now);
    this.limits.set(key, filtered);
    return true;
  }
  
  reset(socketId) {
    for (const key of this.limits.keys()) {
      if (key.startsWith(socketId)) {
        this.limits.delete(key);
      }
    }
  }
}

const rateLimiter = new SocketRateLimiter();

// Usage
socket.on('send-message', (data) => {
  if (!rateLimiter.checkLimit(socket.id, 'send-message', 5, 1000)) {
    socket.emit('error', { message: 'Too many messages' });
    return;
  }
  
  // Process message...
});
```

---

## 8. FRONTEND PRODUCTION BUILD

### Environment Variables

```bash
# apps/web/.env.production
NEXT_PUBLIC_API_URL=https://api.pawfectmatch.com/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_SENTRY_DSN=https://...
NEXT_PUBLIC_GA_TRACKING_ID=UA-...
NODE_ENV=production
```

---

### Next.js Production Config

```javascript
// apps/web/next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  reactStrictMode: true,
  swcMinify: true,
  
  // Image optimization
  images: {
    domains: ['res.cloudinary.com'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },
  
  // Compression
  compress: true,
  
  // Production optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ];
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
});
```

---

### Service Worker & PWA

```javascript
// apps/web/public/sw.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('pawfectmatch-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/offline.html',
        '/images/logo.png'
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => {
        return caches.match('/offline.html');
      });
    })
  );
});
```

---

## 9. TESTING & QUALITY ASSURANCE

### Backend Tests

```javascript
// server/tests/integration/auth.test.js
const request = require('supertest');
const app = require('../server');
const User = require('../src/models/User');

describe('Authentication', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });
  
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
          dateOfBirth: '1990-01-01'
        });
      
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
    });
    
    it('should reject weak passwords', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: '123', // Too short
          firstName: 'Test',
          lastName: 'User',
          dateOfBirth: '1990-01-01'
        });
      
      expect(res.statusCode).toBe(400);
    });
  });
});
```

---

### Frontend E2E Tests

```javascript
// apps/web/cypress/e2e/swipe.cy.ts
describe('Swipe Feature', () => {
  beforeEach(() => {
    cy.login('test@example.com', 'password123');
    cy.visit('/discover');
  });
  
  it('should display pet cards', () => {
    cy.get('[data-testid="swipe-card"]').should('exist');
  });
  
  it('should like a pet', () => {
    cy.get('[data-testid="like-button"]').click();
    cy.get('[data-testid="swipe-card"]').should('not.exist');
  });
  
  it('should show match modal on mutual like', () => {
    cy.intercept('POST', '/api/pets/*/swipe', {
      statusCode: 200,
      body: { match: true }
    });
    
    cy.get('[data-testid="like-button"]').click();
    cy.get('[data-testid="match-modal"]').should('be.visible');
  });
});
```

---

### Load Testing

```javascript
// scripts/load-test.js
const autocannon = require('autocannon');

async function runLoadTest() {
  const result = await autocannon({
    url: 'http://localhost:5001',
    connections: 100,
    duration: 30,
    requests: [
      {
        method: 'GET',
        path: '/health'
      },
      {
        method: 'GET',
        path: '/api/pets/discover',
        headers: {
          Authorization: 'Bearer <test-token>'
        }
      }
    ]
  });
  
  console.log(result);
}

runLoadTest();
```

---

## 10. MONITORING & ALERTING

### Sentry Setup

```javascript
// server/src/config/sentry.js
const Sentry = require('@sentry/node');

function initSentry(app) {
  if (!process.env.SENTRY_DSN) return;
  
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    beforeSend(event, hint) {
      // Filter sensitive data
      if (event.request) {
        delete event.request.cookies;
        delete event.request.headers?.authorization;
      }
      
      return event;
    },
    
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app })
    ]
  });
}

module.exports = { initSentry };
```

---

### Health Check Endpoint Enhancement

```javascript
// server/src/routes/health.js
router.get('/', async (req, res) => {
  const checks = {
    mongodb: 'unknown',
    redis: 'unknown',
    cloudinary: 'unknown',
    aiService: 'unknown'
  };
  
  // MongoDB
  try {
    await mongoose.connection.db.admin().ping();
    checks.mongodb = 'healthy';
  } catch (err) {
    checks.mongodb = 'unhealthy';
  }
  
  // Redis
  if (redisClient) {
    try {
      await redisClient.ping();
      checks.redis = 'healthy';
    } catch (err) {
      checks.redis = 'unhealthy';
    }
  }
  
  // Cloudinary
  try {
    await cloudinary.api.ping();
    checks.cloudinary = 'healthy';
  } catch (err) {
    checks.cloudinary = 'unhealthy';
  }
  
  // AI Service
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/health`, { timeout: 2000 });
    checks.aiService = response.status === 200 ? 'healthy' : 'unhealthy';
  } catch (err) {
    checks.aiService = 'unhealthy';
  }
  
  const allHealthy = Object.values(checks).every(status => status === 'healthy');
  
  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'healthy' : 'degraded',
    checks,
    timestamp: new Date().toISOString()
  });
});
```

---

### Prometheus Metrics

```javascript
// server/src/middleware/metrics.js
const client = require('prom-client');

const register = new client.Registry();

// Metrics
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

function metricsMiddleware(req, res, next) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    
    httpRequestDuration.observe({
      method: req.method,
      route: req.route?.path || req.path,
      status_code: res.statusCode
    }, duration);
    
    httpRequestTotal.inc({
      method: req.method,
      route: req.route?.path || req.path,
      status_code: res.statusCode
    });
  });
  
  next();
}

// Expose metrics endpoint
router.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

module.exports = { metricsMiddleware };
```

---

## 11. DEPLOYMENT STRATEGY

### Docker Production Configuration

```dockerfile
# server/Dockerfile.production
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Production image
FROM node:18-alpine

# Security: Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy from builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs . .

# Switch to non-root user
USER nodejs

EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s \
  CMD node -e "require('http').get('http://localhost:5001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "server.js"]
```

---

### Docker Compose Production

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  mongodb:
    image: mongo:7
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_USER}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
    volumes:
      - mongodb_data:/data/db
    networks:
      - app-network
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/pawfectmatch --quiet
      interval: 30s
      timeout: 10s
      retries: 3

  redis:
    image: redis:7-alpine
    restart: always
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - app-network

  backend:
    build:
      context: ./server
      dockerfile: Dockerfile.production
    restart: always
    environment:
      NODE_ENV: production
      MONGODB_URI: mongodb://${MONGO_USER}:${MONGO_PASSWORD}@mongodb:27017/pawfectmatch?authSource=admin
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
    env_file:
      - ./server/.env.production
    depends_on:
      - mongodb
      - redis
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:5001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  ai-service:
    build:
      context: ./ai-service
      dockerfile: Dockerfile
    restart: always
    environment:
      PORT: 8000
    env_file:
      - ./ai-service/.env
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - ./logs/nginx:/var/log/nginx
    depends_on:
      - backend
    networks:
      - app-network

volumes:
  mongodb_data:
  redis_data:

networks:
  app-network:
    driver: bridge
```

---

### Nginx Configuration

```nginx
# nginx/nginx.conf
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 2048;
    use epoll;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    access_log /var/log/nginx/access.log main;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_conn_zone $binary_remote_addr zone=addr:10m;

    # Backend upstream
    upstream backend {
        least_conn;
        server backend:5001 max_fails=3 fail_timeout=30s;
    }

    server {
        listen 80;
        server_name pawfectmatch.com www.pawfectmatch.com;
        
        # Redirect to HTTPS
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name pawfectmatch.com www.pawfectmatch.com;

        # SSL
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;

        # Security headers
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;

        # API proxy
        location /api/ {
            limit_req zone=api_limit burst=20 nodelay;
            limit_conn addr 10;
            
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            
            # Timeouts
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # WebSocket proxy
        location /socket.io/ {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_cache_bypass $http_upgrade;
        }

        # Static files caching
        location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

---

## 12. BACKUP & DISASTER RECOVERY

### MongoDB Backup Script

```bash
#!/bin/bash
# scripts/backup-mongodb.sh

BACKUP_DIR="/backups/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)
MONGO_URI="${MONGODB_URI}"

# Create backup
mongodump --uri="${MONGO_URI}" --out="${BACKUP_DIR}/${DATE}" --gzip

# Keep only last 7 days
find ${BACKUP_DIR} -type d -mtime +7 -exec rm -rf {} \;

# Upload to S3 (optional)
if [ ! -z "${AWS_S3_BUCKET}" ]; then
    aws s3 sync ${BACKUP_DIR}/${DATE} s3://${AWS_S3_BUCKET}/mongodb-backups/${DATE}/
fi

echo "Backup completed: ${DATE}"
```

---

### Automated Backups with Cron

```cron
# Run daily at 2 AM
0 2 * * * /path/to/scripts/backup-mongodb.sh >> /var/log/backups.log 2>&1
```

---

### Recovery Procedure

```bash
#!/bin/bash
# scripts/restore-mongodb.sh

BACKUP_DATE=$1
BACKUP_DIR="/backups/mongodb"
MONGO_URI="${MONGODB_URI}"

if [ -z "$BACKUP_DATE" ]; then
    echo "Usage: ./restore-mongodb.sh <backup_date>"
    exit 1
fi

echo "Restoring MongoDB from backup: ${BACKUP_DATE}"
mongorestore --uri="${MONGO_URI}" --gzip "${BACKUP_DIR}/${BACKUP_DATE}"

echo "Restore completed"
```

---

## 13. PERFORMANCE OPTIMIZATION

### Database Query Optimization

```javascript
// Use lean() за read-only queries
const pets = await Pet.find({ species: 'dog' })
  .lean() // Returns plain JavaScript objects, не Mongoose documents
  .select('name breed photos') // Select само нужните полета
  .limit(20);

// Use projection
const user = await User.findById(userId).select('-password -refreshTokens');

// Populate само нужното
const match = await Match.findById(matchId)
  .populate('pet1', 'name photos breed')
  .populate('pet2', 'name photos breed')
  .populate('user1', 'firstName lastName avatar')
  .populate('user2', 'firstName lastName avatar');
```

---

### Caching Strategy

```javascript
// server/src/middleware/cacheMiddleware.js
const redis = require('redis');
const { promisify } = require('util');

const client = redis.createClient({ url: process.env.REDIS_URL });
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.setex).bind(client);

function cache(duration = 300) { // 5 minutes default
  return async (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }
    
    const key = `cache:${req.originalUrl}`;
    
    try {
      const cached = await getAsync(key);
      
      if (cached) {
        return res.json(JSON.parse(cached));
      }
      
      // Override res.json to cache the response
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        setAsync(key, duration, JSON.stringify(body)).catch(console.error);
        return originalJson(body);
      };
      
      next();
    } catch (err) {
      next();
    }
  };
}

// Usage
router.get('/api/breeds', cache(3600), getBreeds); // Cache за 1 час
```

---

### Connection Pooling

```javascript
// server/server.js
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI, {
  maxPoolSize: 10, // Max connections
  minPoolSize: 2,  // Min connections
  maxIdleTimeMS: 30000, // Close idle connections after 30s
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});
```

---

## 14. DOCUMENTATION

### API Documentation с Swagger

```javascript
// server/server.js
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

if (process.env.NODE_ENV !== 'production') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}
```

```json
// server/swagger.json
{
  "openapi": "3.0.0",
  "info": {
    "title": "PawfectMatch API",
    "version": "1.0.0",
    "description": "Pet matching platform API"
  },
  "servers": [
    {
      "url": "http://localhost:5001/api",
      "description": "Development"
    },
    {
      "url": "https://api.pawfectmatch.com/api",
      "description": "Production"
    }
  ],
  "paths": {
    "/auth/register": {
      "post": {
        "summary": "Register new user",
        "tags": ["Authentication"],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/RegisterRequest"
              }
            }
          }
        }
      }
    }
  }
}
```

---

## 15. PRODUCTION CHECKLIST

### ✅ Pre-Deployment Checklist

**Security:**
- [ ] Всички admin routes защитени с authentication + requireAdmin
- [ ] JWT secrets са силни (64+ символа) и различни от defaults
- [ ] bcrypt rounds са 12+ в production
- [ ] CORS е конфигуриран само за production domains
- [ ] Rate limiting е активиран за production
- [ ] Helmet security headers са включени
- [ ] Input validation на всички endpoints
- [ ] File upload validation (magic bytes)
- [ ] SQL/NoSQL injection защита
- [ ] XSS защита

**Configuration:**
- [ ] Всички environment variables са зададени
- [ ] Environment validation при старт
- [ ] MongoDB използва IPv4 (127.0.0.1)
- [ ] Backend port е 5001
- [ ] Client URL е правилен
- [ ] Cloudinary credentials са зададени
- [ ] Stripe keys (live) са зададени
- [ ] Email credentials са зададени
- [ ] Redis URL (production)

**Database:**
- [ ] Indexes създадени за всички models
- [ ] Connection pooling конфигуриран
- [ ] Backup strategy имплементирана
- [ ] Migration system на място

**Performance:**
- [ ] Caching имплементиран (Redis)
- [ ] Database queries оптимизирани
- [ ] Images оптимизирани (WebP)
- [ ] Gzip compression включен
- [ ] CDN за static assets

**Monitoring:**
- [ ] Sentry error tracking
- [ ] Health check endpoints
- [ ] Logging system (Winston)
- [ ] Metrics collection (Prometheus)
- [ ] Alerts configured

**Testing:**
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Load testing done
- [ ] Security testing done

**Deployment:**
- [ ] Docker images built
- [ ] SSL certificates configured
- [ ] Nginx configured
- [ ] Domain DNS configured
- [ ] CI/CD pipeline setup
- [ ] Rollback plan ready

**Documentation:**
- [ ] API documentation (Swagger)
- [ ] README updated
- [ ] Environment variables documented
- [ ] Deployment guide created
- [ ] Troubleshooting guide created

---

## 🎯 ПРИОРИТЕТИ

### Priority 1 (КРИТИЧНО - Направете веднага)
1. Защитете admin routes с authentication
2. Променете JWT secrets на силни стойности
3. Добавете MongoDB indexes
4. Имплементирайте error handling middleware
5. Конфигурирайте production CORS

### Priority 2 (Важно - Преди production deploy)
1. Имплементирайте Redis caching
2. Setup logging system
3. Configure backup strategy
4. Add comprehensive tests
5. Setup monitoring (Sentry)

### Priority 3 (След production deploy)
1. Performance optimization
2. Load balancing
3. Advanced monitoring
4. Documentation
5. CI/CD improvements

---

**Документ създаден:** 2025-01-10  
**Версия:** 1.0  
**Статус:** Production Readiness Plan

*Следвайте тази roadmap стъпка по стъпка за да направите PawfectMatch production-ready!*

