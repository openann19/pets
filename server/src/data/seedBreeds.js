const mongoose = require('mongoose');
const BreedProfile = require('../models/BreedProfile');

const breedData = [
  // Popular Dog Breeds
  {
    name: 'golden retriever',
    species: 'dog',
    alternateNames: ['golden', 'goldie'],
    size: 'large',
    weightRange: { min: 55, max: 75 },
    lifeSpan: { min: 10, max: 12 },
    coatTypes: ['medium', 'double'],
    colors: ['gold', 'cream', 'dark golden'],
    temperament: ['friendly', 'intelligent', 'loyal', 'gentle'],
    energyLevel: 'moderate',
    exerciseNeeds: 'high',
    groomingNeeds: 'moderate',
    familyFriendly: 'excellent',
    kidFriendly: 'excellent',
    petFriendly: 'good',
    strangerFriendly: 'excellent',
    apartmentFriendly: false,
    yardRequired: true,
    breedCompatibility: new Map([
      ['labrador retriever', 0.95],
      ['golden retriever', 1.0],
      ['german shepherd', 0.8]
    ]),
    popularity: 95,
    trainability: 'easy',
    barkingTendency: 'moderate'
  },
  {
    name: 'shiba inu',
    species: 'dog',
    alternateNames: ['shiba'],
    size: 'medium',
    weightRange: { min: 15, max: 25 },
    lifeSpan: { min: 12, max: 16 },
    coatTypes: ['medium', 'double'],
    colors: ['red', 'black and tan', 'cream', 'sesame'],
    temperament: ['independent', 'alert', 'loyal', 'confident'],
    energyLevel: 'moderate',
    exerciseNeeds: 'moderate',
    groomingNeeds: 'moderate',
    familyFriendly: 'good',
    kidFriendly: 'good',
    petFriendly: 'fair',
    strangerFriendly: 'fair',
    apartmentFriendly: true,
    yardRequired: false,
    breedCompatibility: new Map([
      ['akita', 0.85],
      ['jindo', 0.8],
      ['boston terrier', 0.7]
    ]),
    popularity: 88,
    trainability: 'moderate',
    barkingTendency: 'moderate',
    healthConcerns: ['patellar luxation', 'hip dysplasia', 'eye problems']
  },
  {
    name: 'french bulldog',
    species: 'dog',
    alternateNames: ['frenchie', 'bulldog francais'],
    size: 'small',
    weightRange: { min: 20, max: 28 },
    lifeSpan: { min: 10, max: 12 },
    coatTypes: ['short'],
    colors: ['brindle', 'fawn', 'white', 'black'],
    temperament: ['calm', 'playful', 'social', 'gentle'],
    energyLevel: 'moderate',
    exerciseNeeds: 'moderate',
    groomingNeeds: 'minimal',
    familyFriendly: 'excellent',
    kidFriendly: 'exExcellent',
    petFriendly: 'good',
    strangerFriendly: 'good',
    apartmentFriendly: true,
    yardRequired: false,
    breedCompatibility: new Map([
      ['boston terrier', 0.9],
      ['english bulldog', 0.85],
      ['pug', 0.8]
    ]),
    popularity: 92,
    trainability: 'easy',
    barkingTendency: 'quiet',
    healthConcerns: ['brachycephalic syndrome', 'skin fold dermatitis', 'spinal issues']
  },
  {
    name: 'german shepherd',
    species: 'dog',
    alternateNames: ['gsd', 'alsatian', 'german sheepdog'],
    size: 'large',
    weightRange: { min: 50, max: 90 },
    lifeSpan: { min: 9, max: 13 },
    coatTypes: ['medium', 'double'],
    colors: ['black and tan', 'sable', 'solid black'],
    temperament: ['loyal', 'protective', 'intelligent', 'confident'],
    energyLevel: 'high',
    exerciseNeeds: 'extensive',
    groomingNeeds: 'moderate',
    familyFriendly: 'good',
    kidFriendly: 'good',
    petFriendly: 'fair',
    strangerFriendly: 'poor',
    apartmentFriendly: false,
    yardRequired: true,
    breedCompatibility: new Map([
      ['belgian malinois', 0.9],
      ['dutch shepherd', 0.85],
      ['golden retriever', 0.8]
    ]),
    popularity: 90,
    trainability: 'easy',
    barkingTendency: 'moderate'
  },
  {
    name: 'labrador retriever',
    species: 'dog',
    alternateNames: ['lab', 'labrador'],
    size: 'large',
    weightRange: { min: 55, max: 80 },
    lifeSpan: { min: 10, max: 12 },
    coatTypes: ['short'],
    colors: ['black', 'yellow', 'chocolate', 'white'],
    temperament: ['friendly', 'energetic', 'intelligent', 'social'],
    energyLevel: 'high',
    exerciseNeeds: 'high',
    groomingNeeds: 'moderate',
    familyFriendly: 'excellent',
    kidFriendly: 'excellent',
    petFriendly: 'good',
    strangerFriendly: 'excellent',
    apartmentFriendly: false,
    yardRequired: true,
    breedCompatibility: new Map([
      ['golden retriever', 0.95],
      ['labrador retriever', 1.0],
      ['goldendoodle', 0.9]
    ]),
    popularity: 98,
    trainability: 'easy',
    barkingTendency: 'moderate'
  },

  // Popular Cat Breeds
  {
    name: 'persian',
    species: 'cat',
    alternateNames: ['persian cat'],
    size: 'medium',
    weightRange: { min: 3.5, max: 7 },
    lifeSpan: { min: 12, max: 17 },
    coatTypes: ['long'],
    colors: ['white', 'black', 'blue', 'cream', 'red', 'tabby'],
    temperament: ['calm', 'docile', 'gentle', 'independe'],
    energyLevel: 'low',
    exerciseNeeds: 'minimal',
    grooming: 'extensive',
    familyFriendly: 'good',
    petFriendly: 'good',
    strangerFriendly: 'fair',
    apartmentFriendly: true,
    yardRequired: false,
    trainability: 'moderate',
    healthConcerns: ['breathing problems', 'eye problems', 'kidney disease']
  },
  {
    name: 'maine coon',
    species: 'cat',
    alternateNames: ['maine coon cat'],
    size: 'large',
    weightRange: { min: 4, max: 8 },
    lifeSpan: { min: 12, max: 15 },
    coatTypes: ['long'],
    colors: ['brown tabby', 'black', 'white', 'silver'],
    temperament: ['friendly', 'gentle', 'social', 'intelligent'],
    energyLevel: 'moderate',
    exerciseNeeds: 'moderate',
    groomingNeeds: 'moderate',
    familyFriendly: 'excellent',
    petFriendly: 'good',
    strangerFriendly: 'good',
    apartmentFriendly: true,
    yardRequired: false,
    trainability: 'easy'
  },
  {
    name: 'british shorthair',
    species: 'cat',
    alternateNames: ['british shorthair cat'],
    size: 'medium',
    weightRange: { min: 3.5, max: 7 },
    lifeSpan: { min: 14, max: 20 },
    coatTypes: ['short'],
    colors: ['blue', 'black', 'white', 'cream', 'red'],
    temperament: ['calm', 'gentle', 'independent', 'loyal'],
    energyLevel: 'moderate',
    exerciseNeeds: 'moderate',
    groomingNeeds: 'minimal',
    familyFriendly: 'good',
    petFriendly: 'good',
    strangerFriendly: 'fair',
    apartmentFriendly: true,
    yardRequired: false,
    trainability: 'moderate'
  }
];

const seedBreeds = async () => {
  try {
    console.log('🌱 Seeding breed data...');
    
    // Clear existing data
    await BreedProfile.deleteMany({});
    
    // Insert breed data
    for (const breed of breedData) {
      const breedProfile = new BreedProfile(breed);
      await breedProfile.save();
    }
    
    console.log(`✅ Seeded ${breedData.length} breed profiles`);
  } catch (error) {
    console.error('❌ Error seeding breeds:', error);
    throw error;
  }
};

module.exports = { seedBreeds, breedData };
