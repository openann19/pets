import { motion, AnimatePresence } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';
import { logger } from '../../services/logger';
import type { Pet, SwipeResult } from '../../types';
import { useSwipeRateLimit } from '../../hooks/useSwipeRateLimit';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import SwipeCard from './SwipeCard';
import SwipeStackSkeleton from './SwipeStackSkeleton';

interface SwipeStackProps {
  pets: Pet[];
  onSwipe: (petId: string, action: 'like' | 'pass' | 'superlike') => Promise<SwipeResult>;
  onMatch?: (matchId: string) => void;
  onLoadMore?: () => void;
  isLoading?: boolean;
  onCardClick?: (pet: Pet) => void;
}

const SwipeStack = ({
  pets,
  onSwipe,
  onMatch,
  onLoadMore,
  isLoading = false,
  onCardClick,
}: SwipeStackProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipedPets, setSwipedPets] = useState<Set<string>>(new Set());
  const [isAnimating, setIsAnimating] = useState(false);
  const stackRef = useRef<HTMLDivElement>(null);
  const { executeWithRateLimit, cleanup } = useSwipeRateLimit({
    maxRequests: 10,
    windowMs: 1000,
    debounceMs: 300,
  });

  // Load more pets when running low
  useEffect(() => {
    if (currentIndex >= pets.length - 2 && onLoadMore && !isLoading) {
      onLoadMore();
    }
  }, [currentIndex, pets.length, onLoadMore, isLoading]);

  // Ref for managing timeout cleanup
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSwipe = async (direction: 'like' | 'pass' | 'superlike') => {
    if (isAnimating || currentIndex >= pets.length) return;

    const currentPet = pets[currentIndex];
    if (!currentPet || swipedPets.has(currentPet._id)) return;

    // Clear any existing timeout to prevent memory leaks
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }

    setIsAnimating(true);
    setSwipedPets((prev) => new Set(prev).add(currentPet._id));

    // Execute swipe with rate limiting
    const result = await executeWithRateLimit(async () => {
      try {
        return await onSwipe(currentPet._id, direction);
      } catch (error) {
        logger.error('Swipe error', { error, petId: currentPet._id, action: direction });
        // Remove from swiped if there was an error
        setSwipedPets((prev) => {
          const newSet = new Set(prev);
          newSet.delete(currentPet._id);
          return newSet;
        });
        throw error;
      }
    });

    // Check for match
    if (result && result.isMatch && result.matchId && onMatch) {
      onMatch(result.matchId);
    }

    // Move to next pet after animation using the ref for cleanup
    animationTimeoutRef.current = setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setIsAnimating(false);
      animationTimeoutRef.current = null;
    }, 300);
  };

  // Enhanced cleanup on unmount
  useEffect(() => {
    // Clear all timeouts on component unmount
    return () => {
      // Clear rate limit cleanup
      cleanup();

      // Clear animation timeout to prevent memory leaks
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
        animationTimeoutRef.current = null;
      }
    };
  }, [cleanup]);

  const getVisiblePets = (): Pet[] => {
    return pets.slice(currentIndex, currentIndex + 3);
  };

  const visiblePets = getVisiblePets();

  if (isLoading !== null && isLoading !== undefined) {
    return <SwipeStackSkeleton />;
  }

  if (pets.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🐾</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No pets to discover</h3>
          <p className="text-gray-600">Check back later for new matches!</p>
        </div>
      </div>
    );
  }

  if (currentIndex >= pets.length) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">You&apos;ve seen all pets!</h3>
          <p className="text-gray-600 mb-4">
            Great job exploring! Check back later for new matches.
          </p>
          <button
            onClick={() => {
              setCurrentIndex(0);
              setSwipedPets(new Set());
            }}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={stackRef}
      className="relative w-full h-full max-w-sm mx-auto"
      style={{ perspective: '1000px' }}
    >
      <AnimatePresence mode="popLayout">
        {visiblePets.map((pet, stackIndex) => {
          const actualIndex = currentIndex + stackIndex;
          const isCurrentCard = stackIndex === 0;

          return (
            <motion.div
              key={`${pet._id}-${actualIndex}`}
              className="absolute inset-0"
              initial={stackIndex > 0 ? false : { scale: 0.8, opacity: 0 }}
              animate={{
                scale: 1 - stackIndex * 0.05,
                y: stackIndex * 8,
                opacity: 1,
              }}
              exit={{
                scale: 0.8,
                opacity: 0,
                transition: { duration: 0.3 },
              }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
                duration: 0.3,
              }}
              style={{
                zIndex: 10 - stackIndex,
                pointerEvents: isCurrentCard ? 'auto' : 'none',
              }}
            >
              <SwipeCard
                pet={pet}
                onSwipe={handleSwipe}
                {...(onCardClick && { onCardClick: () => onCardClick(pet) })}
                dragConstraints={stackRef as React.RefObject<Element>}
                {...(!isCurrentCard && { style: { filter: 'brightness(0.8)' } })}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Loading indicator */}
      {isLoading !== undefined && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 text-gray-600"
        >
          <LoadingSpinner
            size="sm"
          />
          <span className="text-sm">Loading more pets...</span>
        </motion.div>
      )}

      {/* Cards remaining indicator */}
      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 text-center">
        <p className="text-sm text-gray-500">
          {Math.max(0, pets.length - currentIndex)} pets remaining
        </p>
      </div>
    </div>
  );
};

export default SwipeStack;
