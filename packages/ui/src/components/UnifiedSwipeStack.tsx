/**
 * 💎 UNIFIED SWIPE STACK COMPONENT
 * Advanced swipe stack with fluid animations and premium interactions
 * Features: Smooth stack transitions, 3D effects, and haptic feedback
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useRef, useCallback, useEffect } from 'react';

import { ANIMATIONS } from '../theme/design-tokens';
import { UnifiedSwipeCard } from './UnifiedSwipeCard';

interface SwipeCardData {
  id: string;
  name: string;
  age?: number;
  breed?: string;
  images: string[];
  description?: string;
  distance?: number;
  [key: string]: any;
}

interface UnifiedSwipeStackProps {
  data: SwipeCardData[];
  onSwipeLeft?: (data: SwipeCardData) => void;
  onSwipeRight?: (data: SwipeCardData) => void;
  onSwipeUp?: (data: SwipeCardData) => void;
  onSwipeDown?: (data: SwipeCardData) => void;
  onCardClick?: (data: SwipeCardData) => void;
  onLoadMore?: () => void;
  
  // Visual customization
  variant?: 'default' | 'glass' | 'elevated' | 'gradient' | 'neon' | 'holographic';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  
  // Interactive features
  enable3DTilt?: boolean;
  enableMagnetic?: boolean;
  enableHaptic?: boolean;
  enableSound?: boolean;
  enableGlow?: boolean;
  
  // Stack behavior
  maxVisibleCards?: number;
  loadMoreThreshold?: number;
  isLoading?: boolean;
  
  // Swipe behavior
  swipeThreshold?: number;
  velocityThreshold?: number;
  
  // Accessibility
  'aria-label'?: string;
  className?: string;
}

export function UnifiedSwipeStack({
  data,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onCardClick,
  onLoadMore,
  variant = 'glass',
  size = 'md',
  enable3DTilt = true,
  enableMagnetic = true,
  enableHaptic = true,
  enableSound = true,
  enableGlow = true,
  maxVisibleCards = 3,
  loadMoreThreshold = 2,
  isLoading = false,
  swipeThreshold = 100,
  velocityThreshold = 500,
  'aria-label': ariaLabel,
  className = '',
}: UnifiedSwipeStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipedCards, setSwipedCards] = useState<Set<string>>(new Set());
  const [isAnimating, setIsAnimating] = useState(false);
  const stackRef = useRef<HTMLDivElement>(null);

  // Load more cards when running low
  useEffect(() => {
    if (currentIndex >= data.length - loadMoreThreshold && onLoadMore && !isLoading) {
      onLoadMore();
    }
  }, [currentIndex, data.length, loadMoreThreshold, onLoadMore, isLoading]);

  // Handle swipe actions
  const handleSwipeLeft = useCallback((cardData: SwipeCardData) => {
    if (isAnimating || swipedCards.has(cardData.id)) return;
    
    setSwipedCards(prev => new Set(prev).add(cardData.id));
    setIsAnimating(true);
    
    onSwipeLeft?.(cardData);
    
    // Move to next card after animation
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setIsAnimating(false);
    }, 300);
  }, [isAnimating, swipedCards, onSwipeLeft]);

  const handleSwipeRight = useCallback((cardData: SwipeCardData) => {
    if (isAnimating || swipedCards.has(cardData.id)) return;
    
    setSwipedCards(prev => new Set(prev).add(cardData.id));
    setIsAnimating(true);
    
    onSwipeRight?.(cardData);
    
    // Move to next card after animation
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setIsAnimating(false);
    }, 300);
  }, [isAnimating, swipedCards, onSwipeRight]);

  const handleSwipeUp = useCallback((cardData: SwipeCardData) => {
    if (isAnimating || swipedCards.has(cardData.id)) return;
    
    setSwipedCards(prev => new Set(prev).add(cardData.id));
    setIsAnimating(true);
    
    onSwipeUp?.(cardData);
    
    // Move to next card after animation
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setIsAnimating(false);
    }, 300);
  }, [isAnimating, swipedCards, onSwipeUp]);

  const handleSwipeDown = useCallback((cardData: SwipeCardData) => {
    if (isAnimating || swipedCards.has(cardData.id)) return;
    
    setSwipedCards(prev => new Set(prev).add(cardData.id));
    setIsAnimating(true);
    
    onSwipeDown?.(cardData);
    
    // Move to next card after animation
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setIsAnimating(false);
    }, 300);
  }, [isAnimating, swipedCards, onSwipeDown]);

  // Get visible cards
  const getVisibleCards = () => {
    return data.slice(currentIndex, currentIndex + maxVisibleCards);
  };

  const visibleCards = getVisibleCards();

  // Get container styles based on size
  const getContainerStyles = () => {
    const sizes = {
      sm: { maxWidth: '320px', height: '440px' },
      md: { maxWidth: '360px', height: '520px' },
      lg: { maxWidth: '400px', height: '580px' },
      xl: { maxWidth: '440px', height: '640px' },
    };

    return sizes[size];
  };

  const containerStyle = getContainerStyles();

  return (
    <div 
      ref={stackRef}
      className={`relative w-full mx-auto ${className}`}
      style={{ 
        ...containerStyle,
        perspective: '1000px',
      }}
      aria-label={ariaLabel || 'Swipeable card stack'}
      role="region"
    >
      <AnimatePresence mode="popLayout">
        {visibleCards.map((cardData, stackIndex) => {
          const actualIndex = currentIndex + stackIndex;
          const isCurrentCard = stackIndex === 0;
          const isExiting = swipedCards.has(cardData.id);
          
          return (
            <UnifiedSwipeCard
              key={`${cardData.id}-${actualIndex}`}
              data={cardData}
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
              onSwipeUp={handleSwipeUp}
              onSwipeDown={handleSwipeDown}
              onCardClick={onCardClick}
              variant={variant}
              size={size}
              enable3DTilt={enable3DTilt}
              enableMagnetic={enableMagnetic}
              enableHaptic={enableHaptic}
              enableSound={enableSound}
              enableGlow={enableGlow}
              swipeThreshold={swipeThreshold}
              velocityThreshold={velocityThreshold}
              dragConstraints={stackRef}
              stackIndex={stackIndex}
              isCurrentCard={isCurrentCard}
              isExiting={isExiting}
              aria-label={`${cardData.name} profile card`}
            />
          );
        })}
      </AnimatePresence>

      {/* Loading indicator */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-3xl"
          style={{ borderRadius: '1.5rem' }}
        >
          <div className="flex flex-col items-center gap-3">
            <motion.div
              className="w-8 h-8 border-2 border-white border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear",
              }}
            />
            <p className="text-white text-sm font-medium">Loading more cards...</p>
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {visibleCards.length === 0 && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="text-center text-white">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">No more cards</h3>
            <p className="text-white/80">Check back later for new matches!</p>
          </div>
        </motion.div>
      )}

      {/* Stack progress indicator */}
      {data.length > 0 && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30">
          <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm rounded-full px-3 py-1">
            <span className="text-white text-sm font-medium">
              {currentIndex + 1} / {data.length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
