import type { Pet, User } from '../../types';
import {
    calculateAge,
    calculateCompatibilityScore,
    calculateDistance,
    formatDisplayName,
    formatPetAge,
    formatRelativeTime,
    generateId,
    isValidEmail
} from '../index';

describe('utils', () => {
  describe('calculateAge', () => {
    it('should calculate age correctly for past birthday', () => {
      const birthDate = '1990-01-01';
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2023-12-31'));
      
      const age = calculateAge(birthDate);
      expect(age).toBe(33);
      
      jest.useRealTimers();
    });

    it('should calculate age correctly for future birthday this year', () => {
      const birthDate = '1990-12-31';
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2023-06-15'));
      
      const age = calculateAge(birthDate);
      expect(age).toBe(32);
      
      jest.useRealTimers();
    });

    it('should handle leap year correctly', () => {
      const birthDate = '2000-02-29';
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2023-02-28'));
      
      const age = calculateAge(birthDate);
      expect(age).toBe(22);
      
      jest.useRealTimers();
    });
  });

  describe('calculateDistance', () => {
    it('should calculate distance between two points', () => {
      // Distance between New York and Los Angeles (approximately 3944 km)
      const distance = calculateDistance(40.7128, -74.0060, 34.0522, -118.2437);
      expect(distance).toBeCloseTo(3935.75, 0);
    });

    it('should return 0 for same coordinates', () => {
      const distance = calculateDistance(40.7128, -74.0060, 40.7128, -74.0060);
      expect(distance).toBe(0);
    });

    it('should handle negative coordinates', () => {
      const distance = calculateDistance(-40.7128, -74.0060, -34.0522, -118.2437);
      expect(distance).toBeGreaterThan(0);
    });
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });

    it('should generate IDs with correct length', () => {
      const id = generateId();
      expect(id).toHaveLength(8);
    });

    it('should generate alphanumeric IDs', () => {
      const id = generateId();
      expect(id).toMatch(/^[a-zA-Z0-9]+$/);
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name+tag@domain.co.uk')).toBe(true);
      expect(isValidEmail('user123@test-domain.com')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('user@domain')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('calculateCompatibilityScore', () => {
    const mockPet1: Pet = {
      _id: 'pet1',
      owner: 'user1',
      name: 'Buddy',
      species: 'dog',
      breed: 'Golden Retriever',
      age: 3,
      gender: 'male',
      size: 'large',
      intent: 'playdate',
      photos: [],
      personalityTags: ['friendly', 'energetic'],
      healthInfo: {
        vaccinated: true,
        spayedNeutered: true,
        microchipped: false
      },
      location: { type: 'Point', coordinates: [0, 0] },
      featured: { isFeatured: false, boostCount: 0 },
      analytics: { views: 0, likes: 0, matches: 0, messages: 0 },
      isActive: true,
      status: 'active',
      availability: { isAvailable: true },
      isVerified: true,
      listedAt: '',
      createdAt: '',
      updatedAt: ''
    };

    const mockPet2: Pet = {
      ...mockPet1,
      _id: 'pet2',
      owner: 'user2',
      name: 'Lucy',
      species: 'dog',
      breed: 'Labrador',
      age: 2,
      size: 'medium',
      personalityTags: ['friendly', 'calm']
    };

    it('should calculate high compatibility for similar pets', () => {
      const compatibility = calculateCompatibilityScore(mockPet1, mockPet2);
      expect(compatibility).toBeGreaterThan(70);
    });

    it('should calculate lower compatibility for different species', () => {
      const catPet = { ...mockPet2, species: 'cat' as const };
      const compatibility = calculateCompatibilityScore(mockPet1, catPet);
      expect(compatibility).toBeLessThan(60);
    });

    it('should return score between 0 and 100', () => {
      const compatibility = calculateCompatibilityScore(mockPet1, mockPet2);
      expect(compatibility).toBeGreaterThanOrEqual(0);
      expect(compatibility).toBeLessThanOrEqual(100);
    });
  });

  describe('formatDisplayName', () => {
    const mockUser: User = {
      _id: 'user1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1990-01-01',
      age: 33,
      location: { type: 'Point', coordinates: [0, 0] },
      preferences: {
        maxDistance: 50,
        ageRange: { min: 0, max: 20 },
        species: [],
        intents: [],
        notifications: {
          email: true,
          push: true,
          matches: true,
          messages: true
        }
      },
      premium: {
        isActive: false,
        plan: 'basic',
        features: {
          unlimitedLikes: false,
          boostProfile: false,
          seeWhoLiked: false,
          advancedFilters: false
        }
      },
      pets: [],
      analytics: {
        totalSwipes: 0,
        totalLikes: 0,
        totalMatches: 0,
        profileViews: 0,
        lastActive: ''
      },
      isEmailVerified: true,
      isActive: true,
      createdAt: '',
      updatedAt: ''
    };

    it('should format display name correctly', () => {
      expect(formatDisplayName(mockUser)).toBe('John D.');
    });
  });

  describe('formatPetAge', () => {
    it('should format puppy/kitten age', () => {
      expect(formatPetAge(0.5)).toBe('Puppy/Kitten');
    });

    it('should format 1 year old', () => {
      expect(formatPetAge(1)).toBe('1 year old');
    });

    it('should format multiple years', () => {
      expect(formatPetAge(3)).toBe('3 years old');
    });
  });

  describe('formatRelativeTime', () => {
    it('should format "just now" for recent times', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-01T12:00:00Z'));
      
      const recentDate = new Date('2024-01-01T11:59:30Z').toISOString(); // 30 seconds ago
      expect(formatRelativeTime(recentDate)).toBe('Just now');
      
      jest.useRealTimers();
    });

    it('should format minutes ago', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-01T12:00:00Z'));
      
      const minutesAgo = new Date('2024-01-01T11:55:00Z').toISOString(); // 5 minutes ago
      expect(formatRelativeTime(minutesAgo)).toBe('5m ago');
      
      jest.useRealTimers();
    });

    it('should format hours ago', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-01T12:00:00Z'));
      
      const hoursAgo = new Date('2024-01-01T10:00:00Z').toISOString(); // 2 hours ago
      expect(formatRelativeTime(hoursAgo)).toBe('2h ago');
      
      jest.useRealTimers();
    });

    it('should format days ago', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-01T12:00:00Z'));
      
      const daysAgo = new Date('2023-12-29T12:00:00Z').toISOString(); // 3 days ago
      expect(formatRelativeTime(daysAgo)).toBe('3d ago');
      
      jest.useRealTimers();
    });

    it('should format date for older times', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-01T12:00:00Z'));
      
      const oldDate = new Date('2023-01-01').toISOString();
      expect(formatRelativeTime(oldDate)).toBe('1/1/2023');
      
      jest.useRealTimers();
    });
  });
});
