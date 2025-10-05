#!/usr/bin/env node

/**
 * Script to create an admin user
 * 
 * Usage: 
 *   node scripts/create-admin-user.js <email> <password>
 *   node scripts/create-admin-user.js admin@example.com SecurePassword123!
 */

const path = require('path');

// Change to server directory to resolve modules correctly
const serverDir = path.join(__dirname, '../server');
process.chdir(serverDir);

const mongoose = require(path.join(serverDir, 'node_modules/mongoose'));
const dotenv = require(path.join(serverDir, 'node_modules/dotenv'));
dotenv.config({ path: path.join(serverDir, '.env') });

const User = require(path.join(serverDir, 'src/models/User'));
const logger = console;

async function createAdminUser(email, password) {
  try {
    logger.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pawfectmatch');
    logger.log('✅ Connected to MongoDB\n');

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      logger.log(`⚠️  User with email ${email} already exists`);
      
      if (existingUser.role === 'admin') {
        logger.log('✅ User is already an admin');
      } else {
        logger.log('Promoting user to admin...');
        existingUser.role = 'admin';
        await existingUser.save();
        logger.log('✅ User promoted to admin successfully');
      }
      
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Create admin user
    logger.log(`Creating admin user: ${email}...`);
    
    const adminUser = await User.create({
      email,
      password,
      firstName: 'Admin',
      lastName: 'User',
      dateOfBirth: new Date('1990-01-01'),
      role: 'admin',
      isEmailVerified: true,
      isActive: true,
      location: {
        type: 'Point',
        coordinates: [0, 0],
        address: {
          city: 'N/A',
          country: 'US'
        }
      }
    });

    logger.log('✅ Admin user created successfully!\n');
    logger.log('📋 Admin Details:');
    logger.log(`   Email: ${adminUser.email}`);
    logger.log(`   Role: ${adminUser.role}`);
    logger.log(`   ID: ${adminUser._id}`);
    logger.log('\n⚠️  IMPORTANT: Store these credentials securely!');
    logger.log('   You can now login to /admin routes with this account.');

  } catch (error) {
    logger.error('❌ Error creating admin user:', error.message);
    throw error;
  } finally {
    await mongoose.disconnect();
    logger.log('\n👋 Disconnected from MongoDB');
  }
}

// Parse arguments
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  logger.error('❌ Usage: node scripts/create-admin-user.js <email> <password>');
  logger.error('Example: node scripts/create-admin-user.js admin@example.com SecurePassword123!');
  process.exit(1);
}

// Validate email format
const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
if (!emailRegex.test(email)) {
  logger.error('❌ Invalid email format');
  process.exit(1);
}

createAdminUser(email, password)
  .then(() => process.exit(0))
  .catch((err) => {
    logger.error(err);
    process.exit(1);
  });

