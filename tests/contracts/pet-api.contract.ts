import { describe, it, expect } from '@jest/globals';

describe('Pet API Contract Tests', () => {
  it('should return pets with required fields', async () => {
    // Contract test for pet API
    const mockPet = {
      id: 'string',
      name: 'string',
      breed: 'string',
      age: 'number',
      photos: 'array',
      location: 'object',
    };

    // Validate contract
    expect(typeof mockPet.id).toBe('string');
    expect(typeof mockPet.name).toBe('string');
    expect(typeof mockPet.breed).toBe('string');
    expect(typeof mockPet.age).toBe('number');
    expect(Array.isArray(mockPet.photos)).toBe(true);
    expect(typeof mockPet.location).toBe('object');
  });
});
