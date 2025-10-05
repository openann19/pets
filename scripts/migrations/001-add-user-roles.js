#!/usr/bin/env node

/**
 * Migration: Add role field to existing users
 * 
 * This migration adds a 'role' field to all existing users that don't have one
 * Default role is 'user'
 * 
 * Usage: node scripts/migrations/001-add-user-roles.js
 */

const path = require('path');

// Change to server directory to resolve modules correctly
const serverDir = path.join(__dirname, '../../server');
process.chdir(serverDir);

const mongoose = require(path.join(serverDir, 'node_modules/mongoose'));
const dotenv = require(path.join(serverDir, 'node_modules/dotenv'));
dotenv.config({ path: path.join(serverDir, '.env') });

const User = require(path.join(serverDir, 'src/models/User'));
const logger = console;

async function up() {
  try {
    logger.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pawfectmatch');
    logger.log('✅ Connected to MongoDB\n');

    logger.log('📊 Running migration: Add user roles...');
    
    // Count users without role field
    const usersWithoutRole = await User.countDocuments({ role: { $exists: false } });
    logger.log(`Found ${usersWithoutRole} users without role field`);

    if (usersWithoutRole === 0) {
      logger.log('✅ All users already have role field. Nothing to do.');
      return;
    }

    // Add role field to users without it
    const result = await User.updateMany(
      { role: { $exists: false } },
      { $set: { role: 'user' } }
    );

    logger.log(`✅ Migration complete: Updated ${result.modifiedCount} users`);
    
    // Optionally create an admin user
    logger.log('\n📝 Creating admin user (optional)...');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@pawfectmatch.com';
    const adminExists = await User.findOne({ email: adminEmail });
    
    if (adminExists) {
      logger.log(`Admin user already exists: ${adminEmail}`);
      
      // Update to admin role if not already
      if (adminExists.role !== 'admin') {
        adminExists.role = 'admin';
        await adminExists.save();
        logger.log(`✅ Updated ${adminEmail} to admin role`);
      }
    } else {
      logger.log('⚠️  No admin user found. To create one, run:');
      logger.log(`   node scripts/create-admin-user.js ${adminEmail} <password>`);
    }

  } catch (error) {
    logger.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    await mongoose.disconnect();
    logger.log('\n👋 Disconnected from MongoDB');
  }
}

async function down() {
  try {
    logger.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pawfectmatch');
    logger.log('✅ Connected to MongoDB\n');

    logger.log('📊 Rolling back migration: Remove user roles...');
    
    const result = await User.updateMany(
      {},
      { $unset: { role: '' } }
    );

    logger.log(`✅ Rollback complete: Removed role from ${result.modifiedCount} users`);

  } catch (error) {
    logger.error('❌ Rollback failed:', error.message);
    throw error;
  } finally {
    await mongoose.disconnect();
    logger.log('\n👋 Disconnected from MongoDB');
  }
}

// Parse command
const command = process.argv[2];

if (command === 'down') {
  down()
    .then(() => process.exit(0))
    .catch((err) => {
      logger.error(err);
      process.exit(1);
    });
} else {
  up()
    .then(() => process.exit(0))
    .catch((err) => {
      logger.error(err);
      process.exit(1);
    });
}

module.exports = { up, down };

