#!/usr/bin/env node

/**
 * Production Environment Setup Script
 * Generates secure secrets and validates production configuration
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function generateSecureSecret(length = 64) {
  return crypto.randomBytes(length).toString('hex');
}

function generateProductionEnv() {
  log('🚀 Setting up production environment configuration...', 'cyan');
  
  const envPath = path.join(__dirname, '..', '.env.production');
  const templatePath = path.join(__dirname, '..', 'env.production.template');
  
  // Check if .env.production already exists
  if (fs.existsSync(envPath)) {
    log('⚠️  .env.production already exists!', 'yellow');
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    return new Promise((resolve) => {
      rl.question('Do you want to overwrite it? (y/N): ', (answer) => {
        rl.close();
        if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
          log('❌ Setup cancelled.', 'red');
          return;
        }
        createEnvFile();
        resolve();
      });
    });
  }
  
  createEnvFile();
  
  function createEnvFile() {
    log('📝 Generating secure production environment file...', 'blue');
    
    // Generate secure secrets
    const jwtSecret = generateSecureSecret(64);
    const jwtRefreshSecret = generateSecureSecret(64);
    const sessionSecret = generateSecureSecret(32);
    
    // Read template
    let template = fs.readFileSync(templatePath, 'utf8');
    
    // Replace placeholders with generated values
    const replacements = {
      'REPLACE_WITH_64_CHAR_HEX_STRING_FROM_CRYPTO_RANDOM_BYTES': jwtSecret,
      'REPLACE_WITH_DIFFERENT_64_CHAR_HEX_STRING': jwtRefreshSecret,
      'your-cloud-name': 'pawfectmatch-prod',
      'your-api-key': 'YOUR_CLOUDINARY_API_KEY',
      'your-api-secret': 'YOUR_CLOUDINARY_API_SECRET',
      'sk_live_YOUR_STRIPE_SECRET_KEY': 'YOUR_STRIPE_SECRET_KEY',
      'pk_live_YOUR_STRIPE_PUBLISHABLE_KEY': 'YOUR_STRIPE_PUBLISHABLE_KEY',
      'whsec_YOUR_WEBHOOK_SECRET': 'YOUR_STRIPE_WEBHOOK_SECRET',
      'your-email-app-password': 'YOUR_EMAIL_APP_PASSWORD',
      'http://localhost:8000': 'https://ai-service.pawfectmatch.com',
      'USERNAME:PASSWORD@cluster.mongodb.net': 'YOUR_MONGODB_ATLAS_CREDENTIALS'
    };
    
    Object.entries(replacements).forEach(([placeholder, value]) => {
      template = template.replace(new RegExp(placeholder, 'g'), value);
    });
    
    // Write production environment file
    fs.writeFileSync(envPath, template);
    
    log('✅ Production environment file created successfully!', 'green');
    log(`📁 File location: ${envPath}`, 'blue');
    
    // Display next steps
    log('\n📋 NEXT STEPS:', 'bright');
    log('1. Update the following values in .env.production:', 'yellow');
    log('   • MONGODB_URI - Your MongoDB Atlas connection string', 'yellow');
    log('   • CLOUDINARY_* - Your Cloudinary credentials', 'yellow');
    log('   • STRIPE_* - Your Stripe live keys', 'yellow');
    log('   • EMAIL_* - Your email service credentials', 'yellow');
    log('   • CLIENT_URL - Your production frontend URL', 'yellow');
    log('   • AI_SERVICE_URL - Your AI service production URL', 'yellow');
    
    log('\n2. Generate additional secrets if needed:', 'yellow');
    log('   node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"', 'cyan');
    
    log('\n3. Validate configuration:', 'yellow');
    log('   node scripts/validate-production-env.js', 'cyan');
    
    log('\n4. Create database indexes:', 'yellow');
    log('   node scripts/createIndexes.js', 'cyan');
    
    log('\n5. Seed production data:', 'yellow');
    log('   node scripts/seed-production-data.js', 'cyan');
    
    // Security warnings
    log('\n🔒 SECURITY REMINDERS:', 'red');
    log('• NEVER commit .env.production to version control', 'red');
    log('• Use strong, unique passwords for all services', 'red');
    log('• Enable 2FA on all service accounts', 'red');
    log('• Regularly rotate secrets and API keys', 'red');
    log('• Monitor logs for suspicious activity', 'red');
    
    // Save secrets to a secure location for reference
    const secretsPath = path.join(__dirname, '..', '.secrets.backup');
    const secrets = {
      generated_at: new Date().toISOString(),
      jwt_secret: jwtSecret,
      jwt_refresh_secret: jwtRefreshSecret,
      session_secret: sessionSecret
    };
    
    fs.writeFileSync(secretsPath, JSON.stringify(secrets, null, 2));
    log(`\n💾 Secrets backup saved to: ${secretsPath}`, 'magenta');
    log('⚠️  Keep this file secure and delete it after setup!', 'yellow');
  }
}

function validateProductionEnv() {
  log('🔍 Validating production environment...', 'cyan');
  
  const envPath = path.join(__dirname, '..', '.env.production');
  
  if (!fs.existsSync(envPath)) {
    log('❌ .env.production file not found!', 'red');
    log('Run this script first to generate it.', 'yellow');
    return false;
  }
  
  // Load environment variables
  require('dotenv').config({ path: envPath });
  
  const requiredVars = [
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
  
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    log(`❌ Missing required variables: ${missing.join(', ')}`, 'red');
    return false;
  }
  
  // Check for placeholder values
  const placeholders = [
    'YOUR_CLOUDINARY_API_KEY',
    'YOUR_CLOUDINARY_API_SECRET',
    'YOUR_STRIPE_SECRET_KEY',
    'YOUR_STRIPE_PUBLISHABLE_KEY',
    'YOUR_STRIPE_WEBHOOK_SECRET',
    'YOUR_EMAIL_APP_PASSWORD',
    'YOUR_MONGODB_ATLAS_CREDENTIALS'
  ];
  
  const foundPlaceholders = placeholders.filter(placeholder => 
    Object.values(process.env).some(value => value && value.includes(placeholder))
  );
  
  if (foundPlaceholders.length > 0) {
    log(`⚠️  Found placeholder values that need to be updated:`, 'yellow');
    foundPlaceholders.forEach(placeholder => {
      log(`   • ${placeholder}`, 'yellow');
    });
    return false;
  }
  
  // Validate JWT secret strength
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    log('❌ JWT_SECRET is too short (minimum 32 characters)', 'red');
    return false;
  }
  
  // Validate MongoDB URI format
  if (!process.env.MONGODB_URI.includes('mongodb://') && 
      !process.env.MONGODB_URI.includes('mongodb+srv://')) {
    log('❌ Invalid MONGODB_URI format', 'red');
    return false;
  }
  
  // Validate CLIENT_URL is HTTPS in production
  if (process.env.NODE_ENV === 'production' && 
      !process.env.CLIENT_URL.startsWith('https://')) {
    log('⚠️  CLIENT_URL should use HTTPS in production', 'yellow');
  }
  
  log('✅ Production environment validation passed!', 'green');
  return true;
}

// Main execution
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'generate':
    case 'setup':
      generateProductionEnv();
      break;
      
    case 'validate':
      validateProductionEnv();
      break;
      
    default:
      log('🚀 Production Environment Setup', 'bright');
      log('Usage:', 'blue');
      log('  node setup-production-env.js generate  - Generate .env.production', 'cyan');
      log('  node setup-production-env.js validate  - Validate configuration', 'cyan');
      break;
  }
}

module.exports = {
  generateProductionEnv,
  validateProductionEnv,
  generateSecureSecret
};
