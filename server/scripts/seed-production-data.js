#!/usr/bin/env node

/**
 * Production Database Seed Script
 * Creates comprehensive sample data for testing and demonstration
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');

// Import models
const User = require('../src/models/User');
const Pet = require('../src/models/Pet');
const BreedProfile = require('../src/models/BreedProfile');
const Match = require('../src/models/Match');

// Import breed data
const comprehensiveBreeds = require('../src/data/comprehensive-breed-data');

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

// Enhanced sample user data with realistic profiles
const sampleUsers = [
  {
    email: 'sarah.johnson@example.com',
    password: 'SecurePass123!',
    firstName: 'Sarah',
    lastName: 'Johnson',
    dateOfBirth: new Date('1990-05-15'),
    gender: 'female',
    location: {
      type: 'Point',
      coordinates: [-122.4194, 37.7749], // San Francisco
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102'
    },
    bio: 'Dog lover and outdoor enthusiast! Looking for someone who shares my passion for hiking and beach walks with our furry friends.',
    interests: ['hiking', 'beach', 'coffee', 'photography', 'yoga'],
    preferences: {
      ageRange: { min: 25, max: 40 },
      maxDistance: 25,
      petTypes: ['dog'],
      notifications: {
        matches: true,
        messages: true,
        likes: true
      }
    },
    isActive: true,
    isVerified: true,
    subscription: {
      plan: 'premium',
      status: 'active',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    }
  },
  {
    email: 'mike.chen@example.com',
    password: 'SecurePass123!',
    firstName: 'Mike',
    lastName: 'Chen',
    dateOfBirth: new Date('1988-08-22'),
    gender: 'male',
    location: {
      type: 'Point',
      coordinates: [-74.0060, 40.7128], // New York
      city: 'New York',
      state: 'NY',
      zipCode: '10001'
    },
    bio: 'Software engineer who loves cats and coding. Looking for someone who appreciates both technology and our feline friends.',
    interests: ['technology', 'gaming', 'cooking', 'travel', 'music'],
    preferences: {
      ageRange: { min: 26, max: 35 },
      maxDistance: 30,
      petTypes: ['cat', 'dog'],
      notifications: {
        matches: true,
        messages: true,
        likes: false
      }
    },
    isActive: true,
    isVerified: true,
    subscription: {
      plan: 'basic',
      status: 'active',
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
    }
  },
  {
    email: 'emma.davis@example.com',
    password: 'SecurePass123!',
    firstName: 'Emma',
    lastName: 'Davis',
    dateOfBirth: new Date('1992-12-03'),
    gender: 'female',
    location: {
      type: 'Point',
      coordinates: [-87.6298, 41.8781], // Chicago
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601'
    },
    bio: 'Veterinary student and animal advocate. Passionate about rescue animals and finding them loving homes.',
    interests: ['animals', 'rescue', 'volunteering', 'reading', 'running'],
    preferences: {
      ageRange: { min: 24, max: 32 },
      maxDistance: 20,
      petTypes: ['dog', 'cat', 'rabbit'],
      notifications: {
        matches: true,
        messages: true,
        likes: true
      }
    },
    isActive: true,
    isVerified: true,
    subscription: {
      plan: 'premium',
      status: 'active',
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days from now
    }
  },
  {
    email: 'alex.rodriguez@example.com',
    password: 'SecurePass123!',
    firstName: 'Alex',
    lastName: 'Rodriguez',
    dateOfBirth: new Date('1985-03-18'),
    gender: 'male',
    location: {
      type: 'Point',
      coordinates: [-118.2437, 34.0522], // Los Angeles
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001'
    },
    bio: 'Personal trainer and dog enthusiast. Love staying active and exploring the city with my four-legged workout partner.',
    interests: ['fitness', 'dogs', 'outdoor activities', 'healthy living', 'adventure'],
    preferences: {
      ageRange: { min: 28, max: 40 },
      maxDistance: 35,
      petTypes: ['dog'],
      notifications: {
        matches: true,
        messages: true,
        likes: true
      }
    },
    isActive: true,
    isVerified: true,
    subscription: {
      plan: 'premium',
      status: 'active',
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
    }
  },
  {
    email: 'lisa.wang@example.com',
    password: 'SecurePass123!',
    firstName: 'Lisa',
    lastName: 'Wang',
    dateOfBirth: new Date('1991-07-09'),
    gender: 'female',
    location: {
      type: 'Point',
      coordinates: [-96.7970, 32.7767], // Dallas
      city: 'Dallas',
      state: 'TX',
      zipCode: '75201'
    },
    bio: 'Marketing professional and cat mom. Love cozy nights in with my cats and exploring new coffee shops.',
    interests: ['marketing', 'cats', 'coffee', 'photography', 'travel'],
    preferences: {
      ageRange: { min: 25, max: 35 },
      maxDistance: 25,
      petTypes: ['cat'],
      notifications: {
        matches: true,
        messages: true,
        likes: false
      }
    },
    isActive: true,
    isVerified: true,
    subscription: {
      plan: 'basic',
      status: 'active',
      expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000) // 180 days from now
    }
  }
];

// Enhanced sample pet data with realistic profiles
const samplePets = [
  {
    name: 'Buddy',
    species: 'dog',
    breed: 'Golden Retriever',
    age: 3,
    gender: 'male',
    size: 'large',
    description: 'Friendly and energetic Golden Retriever who loves playing fetch and swimming. Great with kids and other dogs.',
    personality: ['friendly', 'energetic', 'loyal', 'playful'],
    photos: [
      'https://res.cloudinary.com/pawfectmatch/image/upload/v1/pets/buddy-1.jpg',
      'https://res.cloudinary.com/pawfectmatch/image/upload/v1/pets/buddy-2.jpg'
    ],
    isActive: true,
    isVaccinated: true,
    isSpayedNeutered: true,
    medicalHistory: 'Up to date on all vaccinations. No known health issues.',
    careInstructions: 'Needs daily exercise and regular grooming. Loves treats and belly rubs!'
  },
  {
    name: 'Luna',
    species: 'cat',
    breed: 'Maine Coon',
    age: 2,
    gender: 'female',
    size: 'large',
    description: 'Beautiful Maine Coon with a gentle personality. Loves cuddling and watching birds from the window.',
    personality: ['gentle', 'affectionate', 'curious', 'calm'],
    photos: [
      'https://res.cloudinary.com/pawfectmatch/image/upload/v1/pets/luna-1.jpg',
      'https://res.cloudinary.com/pawfectmatch/image/upload/v1/pets/luna-2.jpg'
    ],
    isActive: true,
    isVaccinated: true,
    isSpayedNeutered: true,
    medicalHistory: 'Healthy and up to date on vaccinations.',
    careInstructions: 'Loves high places and needs regular brushing due to long fur.'
  },
  {
    name: 'Max',
    species: 'dog',
    breed: 'German Shepherd',
    age: 4,
    gender: 'male',
    size: 'large',
    description: 'Intelligent and protective German Shepherd. Great guard dog and loyal companion.',
    personality: ['intelligent', 'protective', 'loyal', 'active'],
    photos: [
      'https://res.cloudinary.com/pawfectmatch/image/upload/v1/pets/max-1.jpg',
      'https://res.cloudinary.com/pawfectmatch/image/upload/v1/pets/max-2.jpg'
    ],
    isActive: true,
    isVaccinated: true,
    isSpayedNeutered: true,
    medicalHistory: 'Healthy with no known issues.',
    careInstructions: 'Needs mental stimulation and regular exercise. Responds well to training.'
  },
  {
    name: 'Whiskers',
    species: 'cat',
    breed: 'Persian',
    age: 5,
    gender: 'male',
    size: 'medium',
    description: 'Elegant Persian cat with a laid-back personality. Perfect lap cat for quiet evenings.',
    personality: ['calm', 'affectionate', 'gentle', 'quiet'],
    photos: [
      'https://res.cloudinary.com/pawfectmatch/image/upload/v1/pets/whiskers-1.jpg',
      'https://res.cloudinary.com/pawfectmatch/image/upload/v1/pets/whiskers-2.jpg'
    ],
    isActive: true,
    isVaccinated: true,
    isSpayedNeutered: true,
    medicalHistory: 'Healthy Persian with regular grooming needs.',
    careInstructions: 'Requires daily grooming and prefers quiet environments.'
  },
  {
    name: 'Rocky',
    species: 'dog',
    breed: 'Bulldog',
    age: 2,
    gender: 'male',
    size: 'medium',
    description: 'Adorable Bulldog with a big personality. Loves attention and is great with families.',
    personality: ['friendly', 'loyal', 'calm', 'affectionate'],
    photos: [
      'https://res.cloudinary.com/pawfectmatch/image/upload/v1/pets/rocky-1.jpg',
      'https://res.cloudinary.com/pawfectmatch/image/upload/v1/pets/rocky-2.jpg'
    ],
    isActive: true,
    isVaccinated: true,
    isSpayedNeutered: true,
    medicalHistory: 'Healthy Bulldog with no breathing issues.',
    careInstructions: 'Moderate exercise needs. Sensitive to heat, needs air conditioning.'
  }
];

async function connectToDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pawfectmatch';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    log('✅ Connected to MongoDB', 'green');
  } catch (error) {
    log(`❌ Database connection failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

async function clearExistingData() {
  log('🧹 Clearing existing data...', 'yellow');
  
  try {
    await User.deleteMany({});
    await Pet.deleteMany({});
    await BreedProfile.deleteMany({});
    await Match.deleteMany({});
    
    log('✅ Existing data cleared', 'green');
  } catch (error) {
    log(`❌ Error clearing data: ${error.message}`, 'red');
    throw error;
  }
}

async function seedBreedData() {
  log('🐕 Seeding breed data...', 'blue');
  
  try {
    const breedProfiles = comprehensiveBreeds.map(breed => ({
      name: breed.name,
      species: breed.species,
      size: breed.size,
      temperament: breed.temperament,
      energyLevel: breed.energyLevel,
      groomingNeeds: breed.groomingNeeds,
      exerciseNeeds: breed.exerciseNeeds,
      goodWithChildren: breed.goodWithChildren,
      goodWithOtherPets: breed.goodWithOtherPets,
      lifespan: breed.lifespan,
      description: breed.description,
      characteristics: breed.characteristics,
      careRequirements: breed.careRequirements,
      isActive: true
    }));
    
    await BreedProfile.insertMany(breedProfiles);
    log(`✅ Seeded ${breedProfiles.length} breed profiles`, 'green');
  } catch (error) {
    log(`❌ Error seeding breed data: ${error.message}`, 'red');
    throw error;
  }
}

async function seedUsers() {
  log('👥 Seeding users...', 'blue');
  
  try {
    const hashedUsers = await Promise.all(
      sampleUsers.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 12);
        return {
          ...user,
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      })
    );
    
    const createdUsers = await User.insertMany(hashedUsers);
    log(`✅ Seeded ${createdUsers.length} users`, 'green');
    return createdUsers;
  } catch (error) {
    log(`❌ Error seeding users: ${error.message}`, 'red');
    throw error;
  }
}

async function seedPets(users) {
  log('🐾 Seeding pets...', 'blue');
  
  try {
    const petsWithOwners = samplePets.map((pet, index) => ({
      ...pet,
      owner: users[index % users.length]._id,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    
    const createdPets = await Pet.insertMany(petsWithOwners);
    log(`✅ Seeded ${createdPets.length} pets`, 'green');
    return createdPets;
  } catch (error) {
    log(`❌ Error seeding pets: ${error.message}`, 'red');
    throw error;
  }
}

async function seedMatches(users, pets) {
  log('💕 Creating sample matches...', 'blue');
  
  try {
    const matches = [];
    
    // Create some matches between users
    for (let i = 0; i < users.length - 1; i++) {
      for (let j = i + 1; j < users.length; j++) {
        // Randomly decide if users should match (70% chance)
        if (Math.random() < 0.7) {
          const user1 = users[i];
          const user2 = users[j];
          const user1Pet = pets.find(pet => pet.owner.toString() === user1._id.toString());
          const user2Pet = pets.find(pet => pet.owner.toString() === user2._id.toString());
          
          if (user1Pet && user2Pet) {
            const match = new Match({
              user1: user1._id,
              user2: user2._id,
              pet1: user1Pet._id,
              pet2: user2Pet._id,
              status: 'active',
              matchedAt: new Date(),
              lastActivity: new Date(),
              messages: [
                {
                  sender: user1._id,
                  content: `Hi! I love your ${user2Pet.species} ${user2Pet.name}! They look so adorable.`,
                  messageType: 'text',
                  sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
                  readBy: [{
                    user: user2._id,
                    readAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
                  }]
                },
                {
                  sender: user2._id,
                  content: `Thank you! ${user1Pet.name} is absolutely gorgeous too! Would you like to meet up for a playdate?`,
                  messageType: 'text',
                  sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
                  readBy: [{
                    user: user1._id,
                    readAt: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
                  }]
                }
              ],
              userActions: {
                user1: {
                  isBlocked: false,
                  isArchived: false,
                  isFavorited: Math.random() < 0.3
                },
                user2: {
                  isBlocked: false,
                  isArchived: false,
                  isFavorited: Math.random() < 0.3
                }
              },
              createdAt: new Date(),
              updatedAt: new Date()
            });
            
            matches.push(match);
          }
        }
      }
    }
    
    await Match.insertMany(matches);
    log(`✅ Created ${matches.length} matches`, 'green');
  } catch (error) {
    log(`❌ Error creating matches: ${error.message}`, 'red');
    throw error;
  }
}

async function createIndexes() {
  log('📊 Creating database indexes...', 'blue');
  
  try {
    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ 'location.coordinates': '2dsphere' });
    await User.collection.createIndex({ isActive: 1 });
    await User.collection.createIndex({ createdAt: -1 });
    
    // Pet indexes
    await Pet.collection.createIndex({ owner: 1 });
    await Pet.collection.createIndex({ species: 1 });
    await Pet.collection.createIndex({ breed: 1 });
    await Pet.collection.createIndex({ isActive: 1 });
    
    // Match indexes
    await Match.collection.createIndex({ user1: 1, user2: 1 });
    await Match.collection.createIndex({ status: 1 });
    await Match.collection.createIndex({ lastActivity: -1 });
    
    // Breed indexes
    await BreedProfile.collection.createIndex({ species: 1 });
    await BreedProfile.collection.createIndex({ name: 1 });
    
    log('✅ Database indexes created', 'green');
  } catch (error) {
    log(`❌ Error creating indexes: ${error.message}`, 'red');
    throw error;
  }
}

async function main() {
  try {
    log('🚀 Starting production data seeding...', 'bright');
    
    // Load environment variables
    require('dotenv').config({ path: path.join(__dirname, '..', '.env.production') });
    
    await connectToDatabase();
    
    const shouldClear = process.argv.includes('--clear');
    if (shouldClear) {
      await clearExistingData();
    }
    
    await seedBreedData();
    const users = await seedUsers();
    const pets = await seedPets(users);
    await seedMatches(users, pets);
    await createIndexes();
    
    log('\n🎉 Production data seeding completed successfully!', 'green');
    log('\n📋 Summary:', 'bright');
    log(`• ${comprehensiveBreeds.length} breed profiles`, 'cyan');
    log(`• ${users.length} users`, 'cyan');
    log(`• ${pets.length} pets`, 'cyan');
    log('• Sample matches with messages', 'cyan');
    log('• Database indexes created', 'cyan');
    
    log('\n🔑 Test Accounts:', 'bright');
    users.forEach((user, index) => {
      log(`${index + 1}. ${user.email} / SecurePass123!`, 'yellow');
    });
    
  } catch (error) {
    log(`❌ Seeding failed: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    log('👋 Database connection closed', 'blue');
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  seedBreedData,
  seedUsers,
  seedPets,
  seedMatches,
  createIndexes
};
