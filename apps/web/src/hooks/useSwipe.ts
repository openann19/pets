import { useCallback, useState } from 'react';
import { petsAPI } from '../services/api';
import { logger } from '../services/logger';
import type { Pet } from '../types';

interface SwipeResult {
  isMatch: boolean;
  action: 'like' | 'pass' | 'superlike';
  matchId?: string;
}

interface UseSwipeReturn {
  pets: Pet[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  loadPets: () => Promise<void>;
  swipePet: (petId: string, action: 'like' | 'pass' | 'superlike') => Promise<SwipeResult>;
  refreshPets: () => Promise<void>;
}

export const useSwipe = (): UseSwipeReturn => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const loadPets = useCallback(async () => {
    if (isLoading || !hasMore) return;

    try {
      setIsLoading(true);
      setError(null);

      // Use API client with filters/pagination
      const data = (await petsAPI.getSwipeablePets({
        // pass page as a filter param if supported
        // fallback: server should handle pagination via internal state
        // include minimal params to avoid type widening
        // ...
      })) as { pets?: Pet[]; pagination?: { hasMore?: boolean } };

      const newPets = data?.pets ?? [];

      setPets((prev) => {
        // Remove duplicates
        const existingIds = new Set(prev.map((p) => p._id));
        const uniqueNewPets = newPets.filter((p: Pet) => !existingIds.has(p._id));
        return [...prev, ...uniqueNewPets];
      });

      setHasMore(Boolean(data?.pagination?.hasMore));
      setPage((prev) => prev + 1);
    } catch (err) {
      logger.error('Failed to load pets', { error: err instanceof Error ? err.message : String(err), page });
      setError('Failed to load pets. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [page, isLoading, hasMore]);

  const swipePet = useCallback(
    async (petId: string, action: 'like' | 'pass' | 'superlike'): Promise<SwipeResult> => {
      try {
        // Use API client for swipe actions
        let data: SwipeResult | undefined;
        switch (action) {
          case 'like': {
            const res = (await petsAPI.likePet(petId)) as SwipeResult;
            data = res;
            break;
          }
          case 'pass': {
            const res = (await petsAPI.passPet(petId)) as SwipeResult;
            data = res;
            break;
          }
          case 'superlike': {
            const res = (await petsAPI.superLikePet(petId)) as SwipeResult;
            data = res;
            break;
          }
          default:
            data = { isMatch: false, action };
        }

        // Remove the swiped pet from the list
        setPets((prev) => prev.filter((p) => p._id !== petId));

        return data ?? { isMatch: false, action };
      } catch (err) {
        logger.error('Failed to swipe pet', { error: err instanceof Error ? err.message : String(err), petId, action });
        throw new Error('Failed to process swipe. Please try again.');
      }
    },
    [],
  );

  const refreshPets = useCallback(async () => {
    setPets([]);
    setPage(1);
    setHasMore(true);
    setError(null);
    await loadPets();
  }, [loadPets]);

  return {
    pets,
    isLoading,
    error,
    hasMore,
    loadPets,
    swipePet,
    refreshPets,
  };
};
