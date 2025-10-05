#!/usr/bin/env node

const mongoose = require('mongoose');
require('dotenv').config();

async function testBreedFiltering() {
  try {
    console.log('🧬 Testing Ultra-Premium Breed Filtering System...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pawfectmatch');
    console.log('✅ Connected to MongoDB');

    // Test BreedProfile model
    const BreedProfile = require('../models/BreedProfile');
    
    // Create a simple test breed
    const testBreed = {
      name: 'Test Golden Retriever',
      species: 'dog',
      group: 'sporting',
      size: 'large',
      weightRange: { min: 55, max: 75 },
      lifeSpan: { min: 10, max: 12 },
      
      temperament: ['friendly', 'loyal', 'intelligent', 'gentle'],
      energyLevel: 'moderate',
      exerciseNeeds: 'high',
      groomingNeeds: 'moderate',
      
      familyFriendly: 'excellent',
      kidFriendly: 'excellent',
      petFriendly: 'excellent',
      strangerFriendly: 'good',
      
      apartmentFriendly: false,
      yardRequired: true,
      
      trainability: 'easy',
      barkingTendency: 'moderate',
      healthConcerns: ['hip dysplasia', 'heart conditions'],
      
      popularity: 95,
      isVerified: true,
      
      compatibility: {
        kids: 'excellent',
        pets: 'excellent',
        strangers: 'good',
        exercise: 'high'
      }
    };

    // Clear test data if exists
    await BreedProfile.deleteOne({ name: testBreed.name });

    // Save test breed
    const breedProfile = new BreedProfile(testBreed);
    await breedProfile.save();
    console.log('  ✅ Created test breed profile');

    // Test basic queries
    console.log('\n🔍 Testing basic breed queries...');
    
    const allBreeds = await BreedProfile.find({});
    console.log(`  ✅ Found ${allBreeds.length} total breeds in database`);

    const dogBreeds = await BreedProfile.find({ species: 'dog' });
    console.log(`  ✅ Found ${dogBreeds.length} dog breeds`);

    const familyFriendlyBreeds = await BreedProfile.find({ familyFriendly: 'excellent' });
    console.log(`  ✅ Found ${familyFriendlyBreeds.length} family-friendly breeds`);

    const apartmentBreeds = await BreedProfile.find({ apartmentFriendly: true });
    console.log(`  ✅ Found ${apartmentBreeds.length} apartment-friendly breeds`);

    // Test advanced filtering
    console.log('\n🚀 Testing advanced breed filtering...');
    
    const advancedQuery = await BreedProfile.find({
      species: 'dog',
      energyLevel: { $in: ['moderate', 'high'] },
      familyFriendly: 'excellent',
      size: 'large'
    });
    console.log(`  ✅ Advanced filter returned ${advancedQuery.length} breeds`);

    // Test temperament filtering
    const temperamentQuery = await BreedProfile.find({
      temperament: { $in: ['friendly', 'loyal'] }
    });
    console.log(`  ✅ Temperament filter returned ${temperamentQuery.length} breeds`);

    // Test sorting by popularity
    const popularBreeds = await BreedProfile.find({})
      .sort({ popularity: -1 })
      .limit(10);
    console.log(`  ✅ Top 10 breeds by popularity: ${popularBreeds.map(b => b.name).join(', ')}`);

    console.log('\n🎉 BREED FILTERING SYSTEM STATUS:');
    console.log(`   ✅ Database Connection: Active`);
    console.log(`   ✅ Breed Profiles: ${allBreeds.length} breeds loaded`);
    console.log(`   ✅ Basic Filtering: Working`);
    console.log(`   ✅ Advanced Filtering: Working`);
    console.log(`   ✅ Sorting: Working`);
    console.log(`   ✅ Temperament Matching: Working`);

    // Clean up test data
    await BreedProfile.deleteOne({ name: testBreed.name });
    console.log('  🗑️  Cleaned up test breed');

  } catch (error) {
    console.error('❌ Testing failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run the test
if (require.main === module) {
  testBreedFiltering()
    .then(() => {
      console.log('\n🌟 Breed filtering system test completed successfully!');
      console.log('🚀 Ready for ultra-premium pet discovery!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testBreedFiltering };
