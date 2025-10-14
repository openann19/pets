import { act, renderHook } from '@testing-library/react';
import { petsAPI } from '../services/api';
import type { Pet } from '../types';
import { useSwipe } from './useSwipe';


jest.mock('../services/api', () => ({
  petsAPI: {
    getSwipeablePets: jest.fn(),
    likePet: jest.fn(),
    passPet: jest.fn(),
    superLikePet: jest.fn(),
  },
}));

const mockPet1: Pet = {
  _id: 'pet1',
  name: 'Buddy',
  species: 'dog',
  breed: 'Golden Retriever',
  age: 3,
  gender: 'male',
  size: 'large',
  intent: 'playdate',
  photos: [],
  personalityTags: [],
  healthInfo: { vaccinated: true, spayedNeutered: true, microchipped: false },
  location: { type: 'Point', coordinates: [0, 0] },
  featured: { isFeatured: false, boostCount: 0 },
  analytics: { views: 0, likes: 0, matches: 0, messages: 0 },
  isActive: true,
  status: 'active',
  availability: { isAvailable: true },
  isVerified: true,
  listedAt: '',
  createdAt: '',
  updatedAt: '',
  owner: 'user1',
};
const mockPet2: Pet = { ...mockPet1, _id: 'pet2', name: 'Lucy' };

describe('useSwipe Hook', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    (petsAPI.getSwipeablePets as jest.Mock).mockClear();
    (petsAPI.likePet as jest.Mock).mockClear();
    (petsAPI.passPet as jest.Mock).mockClear();
    (petsAPI.superLikePet as jest.Mock).mockClear();

    // Default mock return values for all tests - plain objects matching petsAPI
    (petsAPI.getSwipeablePets as jest.Mock).mockResolvedValue({
      pets: [mockPet1, mockPet2],
      pagination: { hasMore: true },
    });
    (petsAPI.likePet as jest.Mock).mockResolvedValue({ isMatch: false, action: 'like' });
    (petsAPI.passPet as jest.Mock).mockResolvedValue({ isMatch: false, action: 'pass' });
    (petsAPI.superLikePet as jest.Mock).mockResolvedValue({ isMatch: false, action: 'superlike' });
  });

  it('should fetch and store pets on initial load', async () => {
    (petsAPI.getSwipeablePets as jest.Mock).mockResolvedValueOnce({
      pets: [mockPet1, mockPet2],
      pagination: { hasMore: true },
    });

    const { result } = renderHook(() => useSwipe());

    await act(async () => {
      await result.current.loadPets();
    });

    expect(result.current.pets).toHaveLength(2);
    expect(result.current.pets[0]?.name).toBe('Buddy');
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle swiping a pet and remove it from the list', async () => {
    (petsAPI.getSwipeablePets as jest.Mock).mockResolvedValueOnce({
      pets: [mockPet1, mockPet2],
      pagination: { hasMore: true },
    });
    (petsAPI.likePet as jest.Mock).mockResolvedValueOnce({ isMatch: false, action: 'like' });

    const { result } = renderHook(() => useSwipe());

    await act(async () => {
      await result.current.loadPets();
    });

    expect(result.current.pets).toHaveLength(2);

    await act(async () => {
      await result.current.swipePet('pet1', 'like');
    });

    expect(petsAPI.likePet).toHaveBeenCalledWith('pet1');
    expect(result.current.pets).toHaveLength(1);
    expect(result.current.pets[0]?.name).toBe('Lucy');
  });

  it('should handle loading more pets', async () => {
    (petsAPI.getSwipeablePets as jest.Mock)
      .mockResolvedValueOnce({ pets: [mockPet1], pagination: { hasMore: true } })
      .mockResolvedValueOnce({ pets: [mockPet2], pagination: { hasMore: false } });

    const { result } = renderHook(() => useSwipe());

    await act(async () => {
      await result.current.loadPets();
    });

    expect(result.current.pets).toHaveLength(1);
    expect(result.current.hasMore).toBe(true);

    await act(async () => {
      await result.current.loadPets();
    });

    expect(result.current.pets).toHaveLength(2);
    expect(result.current.hasMore).toBe(false);
  });
});
