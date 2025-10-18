import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { logger } from '../services/logger';
import { useAuthStore } from '../stores/useAuthStore';
import { useFilterStore } from '../store/filterStore';
import { Pet } from '../types/api';

export interface SwipeFilters {
  species: string;
  breed: string;
  ageMin: number;
  ageMax: number;
  distance: number;
}

export interface SwipeData {
  pets: Pet[];
  isLoading: boolean;
  error: string | null;
  currentIndex: number;
  filters: SwipeFilters;
  showFilters: boolean;
  showMatchModal: boolean;
  matchedPet: Pet | null;
}

export interface SwipeActions {
  loadPets: () => Promise<void>;
  handleSwipe: (action: 'like' | 'pass' | 'superlike') => Promise<void>;
  handleButtonSwipe: (action: 'like' | 'pass' | 'superlike') => void;
  setCurrentIndex: (index: number) => void;
  setShowFilters: (show: boolean) => void;
  setShowMatchModal: (show: boolean) => void;
  setMatchedPet: (pet: Pet | null) => void;
  setFilters: (filters: SwipeFilters) => void;
  refreshPets: () => void;
}

export function useSwipeData(): SwipeData & SwipeActions {
  const { user } = useAuthStore();
  const { filters: filterStoreFilters, setFilters: setFilterStoreFilters } = useFilterStore();
  
  // State
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedPet, setMatchedPet] = useState<Pet | null>(null);
  
  // Convert filter store to local filters
  const filters: SwipeFilters = {
    species: filterStoreFilters.species ?? '',
    breed: filterStoreFilters.breed ?? '',
    ageMin: filterStoreFilters.ageMin ?? 0,
    ageMax: filterStoreFilters.ageMax ?? 20,
    distance: filterStoreFilters.distance ?? 50,
  };

  // Load pets from API
  const loadPets = useCallback(async () => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Mock API call - replace with real API
      const mockPets: Pet[] = [
        {
          _id: '1',
          name: 'Buddy',
          age: 2,
          breed: 'Golden Retriever',
          species: 'dog',
          description: 'Friendly and energetic dog',
          photos: [
            { url: 'https://via.placeholder.com/400x600', isPrimary: true }
          ],
          location: { latitude: 0, longitude: 0 },
          owner: { _id: 'owner1', name: 'John Doe' },
          featured: { isFeatured: true },
          compatibility: 85,
          distance: 2.5,
          isVerified: true,
        },
        {
          _id: '2',
          name: 'Whiskers',
          age: 1,
          breed: 'Persian',
          species: 'cat',
          description: 'Calm and cuddly cat',
          photos: [
            { url: 'https://via.placeholder.com/400x600', isPrimary: true }
          ],
          location: { latitude: 0, longitude: 0 },
          owner: { _id: 'owner2', name: 'Jane Smith' },
          featured: { isFeatured: false },
          compatibility: 72,
          distance: 1.8,
          isVerified: true,
        },
      ];

      // Apply filters
      let filteredPets = mockPets;
      
      if (filters.species) {
        filteredPets = filteredPets.filter(pet => pet.species === filters.species);
      }
      
      if (filters.breed) {
        filteredPets = filteredPets.filter(pet => pet.breed === filters.breed);
      }
      
      if (filters.ageMin > 0 || filters.ageMax < 20) {
        filteredPets = filteredPets.filter(pet => 
          pet.age >= filters.ageMin && pet.age <= filters.ageMax
        );
      }

      setPets(filteredPets);
      setCurrentIndex(0);
      
      logger.info('Pets loaded successfully', { 
        count: filteredPets.length, 
        filters 
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load pets';
      setError(errorMessage);
      logger.error('Failed to load pets', { error: errorMessage });
    } finally {
      setIsLoading(false);
    }
  }, [user, filters]);

  // Handle swipe actions
  const handleSwipe = useCallback(async (action: 'like' | 'pass' | 'superlike') => {
    const currentPet = pets[currentIndex];
    if (!currentPet) return;

    try {
      // Mock API call - replace with real API
      const result = await new Promise<{ isMatch: boolean }>((resolve) => {
        setTimeout(() => {
          resolve({ isMatch: action === 'like' && Math.random() > 0.7 });
        }, 300);
      });

      if (result.isMatch) {
        setMatchedPet(currentPet);
        setShowMatchModal(true);
      }
      
      // Move to next pet
      setCurrentIndex(prev => prev + 1);
      
      // Load more pets when running low
      if (currentIndex >= pets.length - 2) {
        void loadPets();
      }
      
      logger.info('Swipe action completed', { 
        action, 
        petId: currentPet._id, 
        isMatch: result.isMatch 
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process swipe';
      Alert.alert('Error', errorMessage);
      logger.error('Swipe action failed', { error: errorMessage });
    }
  }, [pets, currentIndex, loadPets]);

  // Handle button swipe (immediate)
  const handleButtonSwipe = useCallback((action: 'like' | 'pass' | 'superlike') => {
    void handleSwipe(action);
  }, [handleSwipe]);

  // Refresh pets
  const refreshPets = useCallback(() => {
    void loadPets();
  }, [loadPets]);

  // Set filters
  const setFilters = useCallback((newFilters: SwipeFilters) => {
    setFilterStoreFilters({
      species: newFilters.species,
      breed: newFilters.breed,
      ageMin: newFilters.ageMin,
      ageMax: newFilters.ageMax,
      distance: newFilters.distance,
    });
  }, [setFilterStoreFilters]);

  // Load pets on component mount
  useEffect(() => {
    void loadPets();
  }, [loadPets]);

  return {
    // Data
    pets,
    isLoading,
    error,
    currentIndex,
    filters,
    showFilters,
    showMatchModal,
    matchedPet,
    
    // Actions
    loadPets,
    handleSwipe,
    handleButtonSwipe,
    setCurrentIndex,
    setShowFilters,
    setShowMatchModal,
    setMatchedPet,
    setFilters,
    refreshPets,
  };
}
