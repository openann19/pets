import { featureFlags } from '@pawfectmatch/core';
import React, { useEffect, useState } from 'react';
import { useAria } from '../../hooks/useAria';
import { usePremiumAnimations } from '../../hooks/usePremiumAnimations';
import { PetCard } from '../PetCard/PetCard';

interface Pet {
  id: string;
  name: string;
  photos: string[];
  age: number;
  breed: string;
  distance: number;
  matchScore: number;
}

interface PetMatchingProps {
  userId: string;
  onMatch?: (pet: Pet) => void;
  onPass?: (pet: Pet) => void;
  onSuperLike?: (pet: Pet) => void;
  onBoost?: () => void;
}

export const PetMatching: React.FC<PetMatchingProps> = ({
  userId,
  onMatch,
  onPass,
  onSuperLike,
  onBoost
}) => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { premiumAnimations } = usePremiumAnimations();
  const { prefersReducedMotion } = useAria();

  // Load pets for matching
  useEffect(() => {
    loadPets();
  }, []);

  const loadPets = async () => {
    setIsLoading(true);
    try {
      // Fetch pets from API with real implementation
      const response = await fetch(`/api/pets/recommendations?userId=${userId}&limit=10`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch pets: ${response.status}`);
      }

      const data = await response.json() as { pets: Array<Record<string, unknown>> };
      const fetchedPets: Pet[] = data.pets.map((pet) => ({
        id: String((pet as any)['_id'] ?? (pet as any)['id'] ?? ''),
        name: String((pet as any)['name'] ?? ''),
        photos: Array.isArray((pet as any)['photos']) ? (pet as any)['photos'] as string[] : [],
        age: Number((pet as any)['age'] ?? 0),
        breed: String((pet as any)['breed'] ?? ''),
        distance: Number((pet as any)['distance'] ?? 0),
        matchScore: Number((pet as any)['matchScore'] ?? 0),
      }));

      setPets(fetchedPets);

      // Animate pet cards on load
      if (!prefersReducedMotion && featureFlags.isEnabled('animations')) {
        setTimeout(() => {
          fetchedPets.forEach((pet, index) => {
            premiumAnimations['flip']?.(`pet-card-${pet.id}`, { delay: index * 100, duration: 800 });
          });
        }, 100);
      }
    } catch (error) {
      console.error('Failed to load pets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwipe = async (petId: string, action: 'like' | 'pass' | 'superlike') => {
    const pet = pets.find(p => p.id === petId);
    if (!pet) return;

    // Track usage with real usage tracking service
    // TODO: integrate UsageTrackingService when available

    // Handle action with premium animations
    switch (action) {
      case 'like':
        premiumAnimations['confetti']?.(`pet-card-${petId}`, { duration: 800, onComplete: () => onMatch?.(pet) });
        break;
      case 'pass':
        onPass?.(pet);
        break;
      case 'superlike':
        premiumAnimations['confetti']?.(`pet-card-${petId}`, { duration: 1000, onComplete: () => onSuperLike?.(pet) });
        break;
    }

    // Move to next pet
    setCurrentIndex(prev => prev + 1);
  };

  const handleBoost = async () => {
    onBoost?.();

    // Animate boost effect with premium animation
    if (!prefersReducedMotion && featureFlags.isEnabled('animations')) {
      premiumAnimations['glow']?.('boost-button', { duration: 800 });
    }
  };

  if (isLoading !== null && isLoading !== undefined) {
    return <div className="pet-matching-loading">Loading pets...</div>;
  }

  if (currentIndex >= pets.length) {
    return <div className="pet-matching-complete">No more pets to match!</div>;
  }

  const currentPet = pets[currentIndex] as Pet | undefined;

  return (
    <div className="pet-matching-container">
      <div className="pet-matching-header">
        <h1>Find Your Perfect Pet Match</h1>
        <p>Swipe right to like, left to pass</p>
      </div>

      <div className="pet-matching-cards">
        {currentPet && (
          <PetCard
            id={currentPet.id}
            name={currentPet.name}
            photos={currentPet.photos}
            age={currentPet.age}
            breed={currentPet.breed}
            distance={currentPet.distance}
            matchScore={currentPet.matchScore ?? 0}
            onSwipeLeft={() => handleSwipe(currentPet.id, 'pass')}
            onSwipeRight={() => handleSwipe(currentPet.id, 'like')}
            onExpand={() => { console.log('View pet details'); }}
          />)}
      </div>

      <div className="pet-matching-actions">
        <button
          id="boost-button"
          onClick={handleBoost}
          className="boost-button"
          aria-label="Boost your profile"
        >
          Boost Profile
        </button>
      </div>
    </div>
  );
};

export default PetMatching;
