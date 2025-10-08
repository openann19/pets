/**
 * 🔄 Pet Card Data Adapter
 * Converts existing Pet type to new PetCardData structure for SwipeCardV2
 */

import type { PetCardData } from '@/components/Pet/SwipeCardV2';
import type { Pet } from '@/types';

/**
 * Convert Pet to PetCardData for SwipeCardV2
 */
export const adaptPetToCardData = (pet: Pet): PetCardData => {
  // Calculate distance (placeholder - would need actual user location)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const distanceKm = pet.owner?.location !== undefined ? 2.5 : 0; // Placeholder distance
  
  // Get photos array
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
  const photos = pet.photos.map((photo) => photo.url);
  
  // Calculate compatibility score (placeholder - would use AI service)
  const compatibility = Math.floor(Math.random() * 40) + 60; // 60-100% range
  
  return {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    id: pet._id,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    name: pet.name,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    breed: pet.breed ?? 'Mixed',
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    age: pet.age,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    size: pet.size as 'tiny' | 'small' | 'medium' | 'large' | 'extra-large',
    distanceKm,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    bio: pet.description ?? 'Super friendly and loves to play!',
    photos,
    compatibility,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    gender: pet.gender,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    species: pet.species as 'dog' | 'cat' | 'bird' | 'rabbit' | 'other',
  };
};

/**
 * Convert multiple Pet objects to PetCardData array
 */
export const adaptPetsToCardData = (pets: Pet[]): PetCardData[] => {
  return void pets.map(adaptPetToCardData);
};

/**
 * Mock data generator for testing
 */
export const generateMockPetCardData = (): PetCardData => {
  const names = ['Buddy', 'Luna', 'Max', 'Bella', 'Charlie', 'Daisy', 'Rocky', 'Molly'];
  const breeds = ['Golden Retriever', 'Labrador', 'German Shepherd', 'Bulldog', 'Poodle', 'Beagle'];
  const sizes = ['tiny', 'small', 'medium', 'large', 'extra-large'] as const;
  const bios = [
    'Super friendly and loves the water!',
    'Playful and energetic, great with kids!',
    'Calm and gentle, perfect for cuddles!',
    'Adventurous and loves long walks!',
    'Sweet and loyal companion!',
  ];

  return {
    id: Math.random().toString(36).substr(2, 9),
    name: names[Math.floor(Math.random() * names.length)],
    breed: breeds[Math.floor(Math.random() * breeds.length)],
    age: Math.random() * 10 + 1,
    size: sizes[Math.floor(Math.random() * sizes.length)],
    distanceKm: Math.random() * 20 + 1,
    bio: bios[Math.floor(Math.random() * bios.length)],
    photos: [
      'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=500&fit=crop',
    ],
    compatibility: Math.floor(Math.random() * 40) + 60,
    gender: Math.random() > 0.5 ? 'male' : 'female',
    species: 'dog',
  };
};
