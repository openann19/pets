#!/usr/bin/env node

const mongoose = require('mongoose');
require('dotenv').config();
const { comprehensiveBreedData } = require('../data/comprehensive-breed-data');
const BreedProfile = require('../models/BreedProfile');
// Optional larger datasets
let massiveDogBreeds = null;
let ultimateMassiveBreedData = null;
try { massiveDogBreeds = require('../data/massive-dogs-only').massiveDogBreeds; } catch {}
try { ultimateMassiveBreedData = require('../data/ULTIMATE_MASSIVE_BREEDS').ultimateMassiveBreedData; } catch {}

async function seedComprehensiveBreeds() {
  try {
    if (process.env.NODE_ENV !== 'test') {
      console.log('🧬 Starting comprehensive breed database seeding...');
    }
    
    // Connect to MongoDB only if not already connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pawfectmatch');
      if (process.env.NODE_ENV !== 'test') {
        console.log('✅ Connected to MongoDB');
      }
    }

    // Clear existing data
    await BreedProfile.deleteMany({});
    if (process.env.NODE_ENV !== 'test') {
      console.log('🗑️  Cleared existing breed profiles');
    }

    // Track created breeds to prevent duplicates
    const createdBreeds = new Set();

    let totalBreeds = 0;
    
    // Optionally merge massive datasets when enabled
    let mergedData = { ...comprehensiveBreedData };
    if (process.env.SEED_MASSIVE_DATA === 'true') {
      // Merge massive dogs
      if (massiveDogBreeds && Array.isArray(massiveDogBreeds)) {
        mergedData.dogs = [...(mergedData.dogs || []), ...massiveDogBreeds];
      }
      // Merge ultimate dataset species arrays
      if (ultimateMassiveBreedData && typeof ultimateMassiveBreedData === 'object') {
        for (const [species, arr] of Object.entries(ultimateMassiveBreedData)) {
          if (Array.isArray(arr)) {
            mergedData[species] = [...(mergedData[species] || []), ...arr.map(b => ({ species: species.slice(0, -1), ...b }))];
          }
        }
      }
    }

    // Process each species category
    for (const [category, breeds] of Object.entries(mergedData)) {
      if (process.env.NODE_ENV !== 'test') {
        console.log(`\n📊 Processing ${category.toUpperCase()} breeds...`);
      }
      
      for (const breedData of breeds) {
        // Check for duplicates
        if (createdBreeds.has(breedData.name.toLowerCase())) {
          if (process.env.NODE_ENV !== 'test') {
            console.log(`  ⚠️ Skipping duplicate breed: ${breedData.name}`);
          }
          continue;
        }
        
        try {
          // Enhanced breed processing with additional AI-generated characteristics
          const enhancedBreed = {
            ...breedData,
            // Ensure species for merged entries
            species: breedData.species || (category.endsWith('s') ? category.slice(0, -1) : category),
            
            // Add derived characteristics
            characteristics: {
              suitabilityForBeginners: 
                breedData.temperament?.includes('calm') || 
                breedData.temperament?.includes('gentle') ? 'high' : 'moderate',
              
              maintenanceLevel: 
                breedData.groomingNeeds === 'extensive' || 
                breedData.exerciseNeeds === 'extensive' ? 'high' : 'moderate',
              
              adaptabilityScore: 
                breedData.apartmentFriendly && breedData.energyLevel === 'moderate' ? 'high' : 'moderate',
              
              socialCompatibility: 
                breedData.petFriendly === 'excellent' && breedData.strangerFriendly !== 'poor' ? 'high' : 'moderate'
            },
            
            // Add compatibility matrix with other breeds
            breedCompatibility: generateBreedCompatibilityMatrix(breedData, breeds),
            
            // Add searchable tags for advanced filtering
            searchableKeywords: generateSearchableKeywords(breedData),
            
            // Add location preferences
            locationPreferences: {
              habitat: breedData.apartmentFriendly ? 'urban' : 'suburban',
              climateZone: ['temperate', 'moderate'],
              spaceRequirements: breedData.yardRequired ? 'large_yard' : 'flexible'
            }
          };

          const breedProfile = new BreedProfile(enhancedBreed);
          await breedProfile.save();
          createdBreeds.add(breedData.name.toLowerCase());
          totalBreeds++;
          
          // Only log individual successes if not in test mode
          if (process.env.NODE_ENV !== 'test') {
            console.log(`  ✅ ${breedData.name} (${category})`);
          }
          
        } catch (error) {
          console.error(`  ❌ Failed to save ${breedData.name}:`, error.message);
        }
      }
    }

    // Only show detailed output if not in test mode
    if (process.env.NODE_ENV !== 'test') {
      console.log(`\n🎉 Successfully seeded ${totalBreeds} comprehensive breed profiles!`);
      console.log(`   • Total Breeds: ${totalBreeds}`);
      console.log(`   • Dog Breeds: ${Object.keys(comprehensiveBreedData.dogs || {}).length}`);
      console.log(`   • Cat Breeds: ${Object.keys(comprehensiveBreedData.cats || {}).length}`);
      console.log(`   • Bird Breeds: ${Object.keys(comprehensiveBreedData.birds || {}).length}`);
      console.log(`   • Rabbit Breeds: ${Object.keys(comprehensiveBreedData.rabbits || {}).length}`);
      console.log(`   • Other Breeds: ${Object.keys(comprehensiveBreedData).filter(species => !['dogs', 'cats', 'birds', 'rabbits'].includes(species)).length}`);
    } else {
      // Minimal output for test mode
      console.log(`✅ Seeded ${totalBreeds} breed profiles`);
    }
    
    // Create indexes for performance
    if (process.env.NODE_ENV !== 'test') {
      console.log('\n🏗️  Creating indexes for optimal performance...');
    }
    
    await BreedProfile.collection.createIndex({ name: 1, species: 1 });
    await BreedProfile.collection.createIndex({ species: 1, size: 1 });
    await BreedProfile.collection.createIndex({ temperament: 1 });
    await BreedProfile.collection.createIndex({ energyLevel: 1 });
    await BreedProfile.collection.createIndex({ popularity: -1 });
    await BreedProfile.collection.createIndex({ 'characteristics.suitabilityForBeginners': 1 });
    await BreedProfile.collection.createIndex({ 'characteristics.adaptabilityScore': 1 });
    
    if (process.env.NODE_ENV !== 'test') {
      console.log('✅ Database indexes created successfully');
    }
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    // Don't disconnect MongoDB in test mode - tests need the connection
    if (process.env.NODE_ENV !== 'test') {
      await mongoose.disconnect();
      console.log('👋 Disconnected from MongoDB');
    }
  }
}

function generateBreedCompatibilityMatrix(currentBreed, allBreeds) {
  const compatibility = new Map();
  
  // High compatibility with same breed
  compatibility.set(currentBreed.name, 1.0);
  
  allBreeds.forEach(otherBreed => {
    if (otherBreed.name !== currentBreed.name) {
      let score = 0.3; // Base compatibility
      
      // Size compatibility
      if (currentBreed.size === otherBreed.size) score += 0.2;
      
      // Energy level compatibility
      if (currentBreed.energyLevel === otherBreed.energyLevel) score += 0.2;
      
      // Temperament compatibility
      if (currentBreed.temperament && otherBreed.temperament) {
        const currentTraits = new Set(currentBreed.temperament);
        const otherTraits = new Set(otherBreed.temperament);
        const commonTraits = [...currentTraits].filter(trait => otherTraits.has(trait));
        score += (commonTraits.length / Math.max(currentTraits.size, otherTraits.size)) * 0.2;
      }
      
      // Family friendliness
      if (currentBreed.familyFriendly === otherBreed.familyFriendly) score += 0.1;
      
      compatibility.set(otherBreed.name, Math.min(1.0, score));
    }
  });
  
  return compatibility;
}

function generateSearchableKeywords(breedData) {
  const keywords = [];
  
  // Basic breed names
  keywords.push(breedData.name);
  if (breedData.alternateNames) {
    keywords.push(...breedData.alternateNames);
  }
  
  // Size-related keywords
  keywords.push(breedData.size, `${breedData.size} ${breedData.species}`);
  
  // Characteristic keywords
  if (breedData.temperament) {
    keywords.push(...breedData.temperament);
  }
  
  keywords.push(breedData.energyLevel, `${breedData.energyLevel} energy`);
  
  // Lifestyle keywords
  if (breedData.apartmentFriendly) keywords.push('apartment', 'urban', 'small space');
  if (breedData.familyFriendly === 'excellent') keywords.push('family friendly', 'kids', 'children');
  if (breedData.exerciseNeeds === 'minimal') keywords.push('low maintenance', 'easy care');
  
  // Special needs keywords
  if (breedData.specialNeeds) {
    if (Array.isArray(breedData.specialNeeds)) {
      keywords.push(...breedData.specialNeeds.flatMap(need => need.split(' ')));
    } else {
      keywords.push(...breedData.specialNeeds.split(' '));
    }
  }
  
  // Health keywords
  if (breedData.healthConcerns) {
    keywords.push(...breedData.healthConcerns.map(concern => concern.replace(/[^a-zA-Z0-9]/g, ' ').split(' ')).flat());
  }
  
  return [...new Set(keywords)];
}

// Run the seeding script
if (require.main === module) {
  seedComprehensiveBreeds()
    .then(() => {
      console.log('🌟 Breed database seeding completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedComprehensiveBreeds };
