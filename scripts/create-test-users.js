#!/usr/bin/env node

/**
 * Create Test Users Script
 * Creates demo users in MongoDB for testing
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pawfectmatch';

// User Schema (simplified)
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date },
  premium: {
    isActive: { type: Boolean, default: false },
    plan: { type: String, default: 'free' },
    startDate: Date,
    endDate: Date
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Test users to create
const testUsers = [
  {
    email: 'demo@pawfectmatch.com',
    password: 'demo123',
    firstName: 'Demo',
    lastName: 'User',
    dateOfBirth: new Date('1990-01-01'),
    premium: {
      isActive: false,
      plan: 'free'
    }
  },
  {
    email: 'test@pawfectmatch.com',
    password: 'test123',
    firstName: 'Test',
    lastName: 'User',
    dateOfBirth: new Date('1992-05-15'),
    premium: {
      isActive: false,
      plan: 'free'
    }
  },
  {
    email: 'premium@pawfectmatch.com',
    password: 'premium123',
    firstName: 'Premium',
    lastName: 'User',
    dateOfBirth: new Date('1988-08-20'),
    premium: {
      isActive: true,
      plan: 'premium_plus',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    }
  },
  {
    email: 'admin@pawfectmatch.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    dateOfBirth: new Date('1985-03-10'),
    premium: {
      isActive: true,
      plan: 'global_elite',
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
    }
  }
];

async function createTestUsers() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    console.log(`   URI: ${MONGODB_URI}`);
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected to MongoDB\n');
    
    console.log('👥 Creating test users...\n');
    
    for (const userData of testUsers) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: userData.email });
        
        if (existingUser) {
          console.log(`⚠️  User ${userData.email} already exists - skipping`);
          continue;
        }
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        
        // Create user
        const user = new User({
          ...userData,
          password: hashedPassword
        });
        
        await user.save();
        
        console.log(`✅ Created user: ${userData.email}`);
        console.log(`   Name: ${userData.firstName} ${userData.lastName}`);
        console.log(`   Plan: ${userData.premium.plan}`);
        console.log(`   Premium: ${userData.premium.isActive ? 'Yes' : 'No'}`);
        console.log('');
        
      } catch (error) {
        console.error(`❌ Failed to create user ${userData.email}:`, error.message);
      }
    }
    
    console.log('\n✨ Test users setup complete!\n');
    console.log('📝 Test Credentials:');
    console.log('═'.repeat(50));
    console.log('Free User:');
    console.log('  Email: demo@pawfectmatch.com');
    console.log('  Password: demo123');
    console.log('');
    console.log('Test User:');
    console.log('  Email: test@pawfectmatch.com');
    console.log('  Password: test123');
    console.log('');
    console.log('Premium User:');
    console.log('  Email: premium@pawfectmatch.com');
    console.log('  Password: premium123');
    console.log('');
    console.log('Admin User:');
    console.log('  Email: admin@pawfectmatch.com');
    console.log('  Password: admin123');
    console.log('═'.repeat(50));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the script
createTestUsers().catch(console.error);

