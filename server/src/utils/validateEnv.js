/**
 * Environment Variable Validation
 * Ensures all required environment variables are set before server starts
 */

const requiredEnvVars = [
  'JWT_SECRET',
  'MONGODB_URI',
  'CLIENT_URL'
];

const productionOnlyVars = [
  'STRIPE_SECRET_KEY',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

/**
 * Validates environment variables
 * @throws {Error} If required variables are missing or invalid
 */
function validateEnv() {
  console.log('🔍 Validating environment variables...');
  
  const errors = [];
  
  // Check required vars
  const missing = requiredEnvVars.filter(varName => !process.env[varName]);
  if (missing.length > 0) {
    errors.push(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  // Check production-specific vars
  if (process.env.NODE_ENV === 'production') {
    const missingProd = productionOnlyVars.filter(varName => !process.env[varName]);
    if (missingProd.length > 0) {
      errors.push(`Missing production environment variables: ${missingProd.join(', ')}`);
    }
  }
  
  // Validate JWT_SECRET is not default
  if (process.env.JWT_SECRET === 'your-super-secret-jwt-key-change-this-in-production') {
    errors.push('JWT_SECRET is still using default value! Generate a secure secret.');
  }
  
  // Validate JWT_SECRET strength (minimum 32 characters)
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET is too weak! Must be at least 32 characters.');
  }
  
  // Validate MongoDB URI format
  if (process.env.MONGODB_URI && !process.env.MONGODB_URI.startsWith('mongodb')) {
    errors.push('MONGODB_URI must start with "mongodb://" or "mongodb+srv://"');
  }
  
  // Validate PORT is a number
  if (process.env.PORT && isNaN(parseInt(process.env.PORT))) {
    errors.push('PORT must be a valid number');
  }
  
  // Check if using MongoDB Memory Server in production
  if (process.env.NODE_ENV === 'production' && 
      process.env.MONGODB_URI && 
      process.env.MONGODB_URI.includes('memory')) {
    errors.push('Cannot use MongoDB Memory Server in production!');
  }
  
  // Report errors
  if (errors.length > 0) {
    console.error('\n❌ Environment Validation Failed:\n');
    errors.forEach((error, index) => {
      console.error(`  ${index + 1}. ${error}`);
    });
    console.error('\n💡 Tip: Copy .env.example to .env and fill in the values\n');
    process.exit(1);
  }
  
  console.log('✅ Environment variables validated successfully');
  
  // Log configuration (without sensitive data)
  console.log('\n📋 Configuration:');
  console.log(`  • Node Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  • Port: ${process.env.PORT || 5000}`);
  console.log(`  • Client URL: ${process.env.CLIENT_URL}`);
  console.log(`  • MongoDB: ${process.env.MONGODB_URI ? '✓ Configured' : '✗ Not configured'}`);
  console.log(`  • JWT Secret: ${process.env.JWT_SECRET ? '✓ Set' : '✗ Not set'}`);
  console.log(`  • Redis: ${process.env.REDIS_URL ? '✓ Configured' : '✗ Not configured (optional)'}`);
  console.log(`  • Stripe: ${process.env.STRIPE_SECRET_KEY ? '✓ Configured' : '✗ Not configured (optional)'}`);
  console.log('');
}

module.exports = validateEnv;
