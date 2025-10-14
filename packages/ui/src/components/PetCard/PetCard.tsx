import React, { useRef, useCallback, useEffect } from 'react';
import { usePremiumAnimations } from '../../hooks/usePremiumAnimations';
import { useAria } from '../../hooks/useAria';
import { featureFlags } from '@pawfectmatch/core/src/featureFlags';
import { UsageTrackingService } from '@pawfectmatch/web/src/services/usageTracking';

import SkeletonLoader from '../SkeletonLoader';
import LoadingSpinner from '../LoadingSpinner';

export interface PetCardProps {
  id: string;
  name: string;
  photos: string[];
  age: number;
  breed: string;
  distance: number;
  matchScore?: number;
  isFavorite: boolean;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onExpand?: () => void;
  loading?: boolean;
  swipeLoading?: boolean;
}

export const PetCard: React.FC<PetCardProps> = React.memo(({
  id,
  name,
  photos,
  age,
  breed,
  distance,
  matchScore,
  isFavorite,
  onSwipeLeft,
  onSwipeRight,
  onExpand,
  loading,
  swipeLoading
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | null>(null);
  const { triggerAnimation, triggerAnimationFrameAnimation, confetti, glow } = usePremiumAnimations();
  const { prefersReducedMotion, prefersHighContrast } = useAria();
  
  // Cleanup timeouts on unmount
  useEffect(() => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }, []);
  
  // Handle swipe gestures with premium animations (optimized with useCallback)
  const handleSwipe = useCallback(async (direction: 'left' | 'right') => {
    if (!prefersReducedMotion) {
      triggerAnimation(`pet-card-${id}`, {
        type: direction === 'left' ? 'slide-out-left' : 'slide-out-right',
        duration: 300
      });
      
      // Add confetti effect for right swipes (likes)
      if (direction === 'right' && onSwipeRight) {
        confetti(`pet-card-${id}`, {
          duration: 800,
          onComplete: onSwipeRight
        });
      }
    } else {
      // For users with reduced motion preference, still call the handlers
      if (direction === 'left' && onSwipeLeft) {
        onSwipeLeft();
      } else if (direction === 'right' && onSwipeRight) {
        onSwipeRight();
      }
    }
    
    // Call left swipe handler directly if no animation
    if (direction === 'left' && onSwipeLeft) {
      timeoutRef.current = setTimeout(() => {
        onSwipeLeft();
      }, 300);
    }
  }, [id, prefersReducedMotion, onSwipeLeft, onSwipeRight, triggerAnimation, confetti]);
  
  // Handle card hover effect with premium animation (optimized with useCallback)
  const handleHover = useCallback(() => {
    if (!prefersReducedMotion) {
      triggerAnimationFrameAnimation(`pet-card-${id}`, {
        type: 'glow',
        duration: 600
      });
    }
  }, [id, prefersReducedMotion, triggerAnimationFrameAnimation]);
  
  // Handle card click with morph animation (optimized with useCallback)
  const handleClick = useCallback(() => {
    if (!prefersReducedMotion) {
      triggerAnimationFrameAnimation(`pet-card-${id}`, {
        type: 'morph',
        duration: 500
      });
    }
  }, [id, prefersReducedMotion, triggerAnimationFrameAnimation]);
  
  if (loading) {
    return (
      <div className="pet-card-loading">
        <SkeletonLoader height={220} radius={16} className="mb-4" />
        <div className="flex flex-col gap-2 px-4">
          <SkeletonLoader height={24} width={120} />
          <SkeletonLoader height={18} width={80} />
          <SkeletonLoader height={18} width={100} />
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={cardRef}
      id={`pet-card-${id}`}
      className={`pet-card ${prefersHighContrast ? 'high-contrast' : ''}`}
      onMouseEnter={handleHover}
      onClick={handleClick}
    >
      <div className="pet-card-photos">
        <img 
          src={photos[0]} 
          alt={`${name}, ${breed}`} 
          className="pet-photo"
        />
        {swipeLoading ? <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-60 dark:bg-black dark:bg-opacity-40">
            <LoadingSpinner size={36} />
          </div> : null}
      </div>
      
      <div className="pet-card-content">
        <h3>{name}</h3>
        <p>{breed} · {age} years old</p>
        <p>{distance} miles away</p>
        
        {/* Premium features */}
        {featureFlags.isEnabled('animations') && matchScore !== undefined && (
          <div className="match-score-container">
            <span className="match-score">{matchScore}% match</span>
          </div>
        )}
      </div>
      
      <div className="pet-card-actions">
        <button 
          onClick={() => handleSwipe('left')}
          aria-label={`Pass on ${name}`}
        >
          Pass
        </button>
        <button 
          onClick={onExpand}
          aria-label={`View details for ${name}`}
        >
          Details
        </button>
        <button 
          onClick={() => handleSwipe('right')}
          aria-label={`Like ${name}`}
        >
          Like
        </button>
      </div>
    </div>
  );
});

PetCard.displayName = 'PetCard';

export default PetCard;
