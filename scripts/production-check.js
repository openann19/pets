#!/usr/bin/env node

/**
 * Production Readiness Check Script
 * 
 * Validates that all production requirements are met before deployment
 * 
 * Usage: node scripts/production-check.js
 */

const path = require('path');
const fs = require('fs');

// Load environment (optional)
try {
  if (process.env.NODE_ENV === 'production') {
    require('dotenv').config({ path: path.join(__dirname, '../server/.env.production') });
  } else {
    require('dotenv').config({ path: path.join(__dirname, '../server/.env') });
  }
} catch (err) {
  // dotenv not available, will check environment variables from process.env
}

const logger = console;

// Color codes for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function success(msg) {
  logger.log(`${colors.green}✅ ${msg}${colors.reset}`);
}

function error(msg) {
  logger.log(`${colors.red}❌ ${msg}${colors.reset}`);
}

function warning(msg) {
  logger.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`);
}

function info(msg) {
  logger.log(`${colors.cyan}ℹ️  ${msg}${colors.reset}`);
}

function section(title) {
  logger.log(`\n${colors.magenta}${'='.repeat(70)}${colors.reset}`);
  logger.log(`${colors.magenta}${title}${colors.reset}`);
  logger.log(`${colors.magenta}${'='.repeat(70)}${colors.reset}\n`);
}

let errorCount = 0;
let warningCount = 0;

/**
 * Check environment variables
 */
function checkEnvironment() {
  section('🔐 ENVIRONMENT VARIABLES');

  const required = [
    'NODE_ENV',
    'PORT',
    'MONGODB_URI',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'CLIENT_URL',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
  ];

  const recommended = [
    'STRIPE_SECRET_KEY',
    'EMAIL_USER',
    'EMAIL_PASS',
    'SENTRY_DSN',
    'REDIS_URL'
  ];

  // Check required
  required.forEach(key => {
    if (process.env[key]) {
      success(`${key} is set`);
    } else {
      error(`${key} is missing!`);
      errorCount++;
    }
  });

  // Check JWT secret strength
  if (process.env.JWT_SECRET) {
    if (process.env.JWT_SECRET.length < 32) {
      error('JWT_SECRET is too short (minimum 32 characters)');
      errorCount++;
    } else {
      success('JWT_SECRET has sufficient length');
    }

    // Check for weak secrets
    const weakSecrets = [
      'your-super-secret-jwt-key-change-this-in-production-12345',
      'secret',
      'jwt-secret',
      'change-me',
      'test'
    ];

    if (weakSecrets.includes(process.env.JWT_SECRET)) {
      error('JWT_SECRET is using a default/weak value!');
      errorCount++;
    } else {
      success('JWT_SECRET is not using a default value');
    }
  }

  // Check MongoDB URI
  if (process.env.MONGODB_URI) {
    if (process.env.MONGODB_URI.includes('localhost') && process.env.NODE_ENV === 'production') {
      warning('Using localhost MongoDB in production mode');
      warningCount++;
    }
    if (process.env.MONGODB_URI.includes('mongodb://') || 
        process.env.MONGODB_URI.includes('mongodb+srv://')) {
      success('MongoDB URI format is valid');
    } else {
      error('MongoDB URI format is invalid');
      errorCount++;
    }
  }

  // Check CLIENT_URL
  if (process.env.CLIENT_URL && process.env.NODE_ENV === 'production') {
    if (!process.env.CLIENT_URL.startsWith('https://')) {
      warning('CLIENT_URL should use HTTPS in production');
      warningCount++;
    } else {
      success('CLIENT_URL uses HTTPS');
    }
  }

  // Check recommended
  logger.log('');
  info('Checking recommended variables...');
  recommended.forEach(key => {
    if (process.env[key]) {
      success(`${key} is set`);
    } else {
      warning(`${key} is not set (recommended for production)`);
      warningCount++;
    }
  });
}

/**
 * Check file structure
 */
function checkFileStructure() {
  section('📁 FILE STRUCTURE');

  const requiredFiles = [
    'server/server.js',
    'server/src/models/User.js',
    'server/src/models/Pet.js',
    'server/src/models/Match.js',
    'server/src/routes/admin.js',
    'server/src/middleware/auth.js',
    'server/src/middleware/errorHandler.js',
    'server/src/config/production.js'
  ];

  requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
      success(`${file} exists`);
    } else {
      error(`${file} is missing!`);
      errorCount++;
    }
  });

  // Check for scripts
  const scripts = [
    'scripts/create-indexes.js',
    'scripts/create-admin-user.js',
    'scripts/migrations/001-add-user-roles.js'
  ];

  logger.log('');
  info('Checking utility scripts...');
  scripts.forEach(script => {
    const scriptPath = path.join(__dirname, '..', script);
    if (fs.existsSync(scriptPath)) {
      success(`${script} exists`);
    } else {
      warning(`${script} is missing`);
      warningCount++;
    }
  });
}

/**
 * Check security configurations
 */
function checkSecurity() {
  section('🔒 SECURITY CHECKS');

  // Check if admin.js has authentication
  const adminFile = path.join(__dirname, '../server/src/routes/admin.js');
  if (fs.existsSync(adminFile)) {
    const content = fs.readFileSync(adminFile, 'utf8');
    
    if (content.includes('authenticateToken') && content.includes('requireAdmin')) {
      success('Admin routes have authentication middleware');
    } else {
      error('Admin routes are missing authentication!');
      errorCount++;
    }

    if (content.includes('router.use(authenticateToken)') || 
        content.includes('router.use(requireAdmin)')) {
      success('Admin routes use router-level middleware');
    }
  }

  // Check if User model has role field
  const userFile = path.join(__dirname, '../server/src/models/User.js');
  if (fs.existsSync(userFile)) {
    const content = fs.readFileSync(userFile, 'utf8');
    
    if (content.includes('role:') || content.includes('role :')) {
      success('User model has role field');
    } else {
      error('User model is missing role field!');
      errorCount++;
    }
  }

  // Check production config exists
  const prodConfigFile = path.join(__dirname, '../server/src/config/production.js');
  if (fs.existsSync(prodConfigFile)) {
    const content = fs.readFileSync(prodConfigFile, 'utf8');
    
    if (content.includes('validateProductionEnv')) {
      success('Production validation function exists');
    } else {
      warning('Production validation may be incomplete');
      warningCount++;
    }
  }
}

/**
 * Check models for indexes
 */
function checkIndexes() {
  section('📊 DATABASE INDEXES');

  const models = [
    { name: 'User', file: 'server/src/models/User.js' },
    { name: 'Pet', file: 'server/src/models/Pet.js' },
    { name: 'Match', file: 'server/src/models/Match.js' }
  ];

  models.forEach(({ name, file }) => {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const indexCount = (content.match(/\.index\(/g) || []).length;
      
      if (indexCount > 0) {
        success(`${name} model has ${indexCount} index definitions`);
      } else {
        warning(`${name} model has no indexes defined`);
        warningCount++;
      }
    }
  });

  info('Run "node scripts/create-indexes.js" to create indexes in the database');
}

/**
 * Summary
 */
function printSummary() {
  section('📋 SUMMARY');

  logger.log(`Total Errors: ${colors.red}${errorCount}${colors.reset}`);
  logger.log(`Total Warnings: ${colors.yellow}${warningCount}${colors.reset}\n`);

  if (errorCount === 0 && warningCount === 0) {
    success('🎉 All checks passed! Your application is production-ready.');
    logger.log('');
    info('Next steps:');
    logger.log('  1. node scripts/create-indexes.js');
    logger.log('  2. node scripts/migrations/001-add-user-roles.js');
    logger.log('  3. node scripts/create-admin-user.js <email> <password>');
    logger.log('  4. Start the server: NODE_ENV=production node server/server.js');
    logger.log('');
    process.exit(0);
  } else if (errorCount === 0) {
    warning('Some warnings were found. Review them before deploying to production.');
    logger.log('');
    process.exit(0);
  } else {
    error('❌ Critical errors found! Fix them before deploying to production.');
    logger.log('');
    process.exit(1);
  }
}

/**
 * Run all checks
 */
async function runChecks() {
  logger.log(`\n${colors.blue}${'='.repeat(70)}`);
  logger.log(`${colors.blue}      PRODUCTION READINESS CHECK - PAWFECTMATCH`);
  logger.log(`${colors.blue}${'='.repeat(70)}${colors.reset}\n`);

  info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  info(`Checking from: ${__dirname}\n`);

  try {
    checkEnvironment();
    checkFileStructure();
    checkSecurity();
    checkIndexes();
    printSummary();
  } catch (error) {
    logger.error('\n❌ Check failed with error:', error.message);
    process.exit(1);
  }
}

// Run checks
runChecks();

