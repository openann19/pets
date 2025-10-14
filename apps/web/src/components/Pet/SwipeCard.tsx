'use client';

import { DraggableMotionDiv, MotionButton, MotionDiv } from '@/components/ui/motion-helper';
import { SPRING_CONFIG } from '@/constants/animations';
import type { Pet } from '@/types';
import type { SwipePet } from '@/types/pet-types';
import { createComponent } from '@/types/react-types';
import { HeartIcon, MapPinIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, SparklesIcon } from '@heroicons/react/24/solid';
import type { PanInfo } from 'framer-motion';
import { useMotionValue, useTransform } from 'framer-motion';
import React, { memo, useState } from 'react';
import { LazyImage } from '../Performance/LazyImage';
import { withErrorBoundary } from '../providers/AppErrorBoundary';

interface SwipeCardProps {
  pet: Pet | SwipePet;
  onSwipe: (direction: 'like' | 'pass' | 'superlike') => void;
  onCardClick?: () => void;
  isLiked?: boolean;
  isPassed?: boolean;
  style?: React.CSSProperties;
  dragConstraints?:
  | false
  | Partial<{ top: number; right: number; bottom: number; left: number }>
  | React.RefObject<Element>;
  hapticFeedback?: boolean;
  soundEffects?: boolean;
  premiumEffects?: boolean;
  accessibilityEnabled?: boolean;
  isLoading?: boolean;
  ariaLabel?: string;
}

const SwipeCardBase = ({
  pet,
  onSwipe,
  onCardClick,
  style,
  dragConstraints,
  premiumEffects = true,
  ariaLabel,
}: SwipeCardProps) => {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [isExiting, setIsExiting] = useState(false);
  const [showParticles] = useState(false);

  // Motion values
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-15, 15]);
  const opacity = useTransform(x, [-300, -150, 0, 150, 300], [0, 1, 1, 1, 0]);

  // Overlay opacities derived from motion values
  const likeOverlayOpacity = useTransform(x, [60, 140], [0, 1]);
  const passOverlayOpacity = useTransform(x, [-140, -60], [1, 0]);

  // Cleanup for timers
  const swipeTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  React.useEffect(() => {
    return () => {
      if (swipeTimeoutRef.current) {
        clearTimeout(swipeTimeoutRef.current);
        swipeTimeoutRef.current = null;
      }
    };
  }, []);

  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'medium'): void => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30, 10, 30],
      } as const;
      navigator.vibrate(patterns[type]);
    }
  };

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ): void => {
    const threshold = 100;
    const superThreshold = 120;
    const velocity = info.velocity.x;
    const offset = info.offset.x;
    const yOffset = info.offset.y;

    if (swipeTimeoutRef.current) {
      clearTimeout(swipeTimeoutRef.current);
      swipeTimeoutRef.current = null;
    }

    if (yOffset < -superThreshold && Math.abs(offset) < 50) {
      triggerHaptic('heavy');
      setIsExiting(true);
      swipeTimeoutRef.current = setTimeout(() => {
        onSwipe('superlike');
        swipeTimeoutRef.current = null;
      }, 200);
    } else if (Math.abs(velocity) > 500 || Math.abs(offset) > threshold) {
      triggerHaptic('medium');
      setIsExiting(true);

      if (offset > 0 || velocity > 0) {
        swipeTimeoutRef.current = setTimeout(() => {
          onSwipe('like');
          swipeTimeoutRef.current = null;
        }, 200);
      } else {
        swipeTimeoutRef.current = setTimeout(() => {
          onSwipe('pass');
          swipeTimeoutRef.current = null;
        }, 200);
      }
    } else {
      triggerHaptic('light');
      x.set(0);
      y.set(0);
    }
  };

  const handleButtonClick = (action: 'like' | 'pass' | 'superlike'): void => {
    if (swipeTimeoutRef.current) {
      clearTimeout(swipeTimeoutRef.current);
      swipeTimeoutRef.current = null;
    }

    if (action === 'superlike') {
      triggerHaptic('heavy');
    } else {
      triggerHaptic('medium');
    }

    setIsExiting(true);
    swipeTimeoutRef.current = setTimeout(() => {
      onSwipe(action);
      swipeTimeoutRef.current = null;
    }, 200);
  };

  const primaryPhoto = pet.photos.find((photo) => photo.isPrimary === true) || pet.photos[0];
  const photoUrl = primaryPhoto?.url || 'https://via.placeholder.com/400x500?text=No+Photo';

  const ageText = pet.age < 1 ? `${Math.round(pet.age * 12)} months` : `${pet.age} years`;

  // optional info / placeholder distance
  const distanceText = (pet as any)?.distance ? `${Math.round((pet as any).distance)} km away` : 'Nearby';

  const motionStyle: Record<string, unknown> = {
    ...(style || {}),
    x,
    y,
    rotate,
    opacity,
  };

  return (
    <div className="relative">
      {premiumEffects !== undefined && showParticles && (
        <div className="absolute inset-0 pointer-events-none z-50">
          {[...Array(8)].map((_, i) => (
            <MotionDiv
              key={i}
              className="absolute w-3 h-3 rounded-full"
              style={{
                background: 'linear-gradient(135deg, rgba(14,165,233,0.8), rgba(56,189,248,0.6))',
              }}
              initial={{ x: '50%', y: '50%', opacity: 1, scale: 0 }}
              animate={{
                x: `${50 + (Math.random() - 0.5) * 300}%`,
                y: `${50 + (Math.random() - 0.5) * 300}%`,
                opacity: 0,
                scale: 1,
              }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
            />
          ))}
        </div>
      )}

      <DraggableMotionDiv
        ref={cardRef as React.RefObject<HTMLDivElement>}
        drag={true}
        dragConstraints={
          (dragConstraints as
            | false
            | Partial<{ top: number; right: number; bottom: number; left: number }>
            | React.RefObject<Element>
            | undefined)
        }
        dragElastic={0.15}
        onDragEnd={handleDragEnd as unknown as (
          event: MouseEvent | TouchEvent | PointerEvent,
          info: PanInfo,
        ) => void}
        className="absolute inset-0"
        style={motionStyle as React.CSSProperties}
        animate={{ scale: isExiting ? 0.8 : 1, opacity: isExiting ? 0 : 1 }}
        transition={SPRING_CONFIG}
        whileTap={{ scale: 0.98 }}
        whileHover={
          premiumEffects
            ? ({
              scale: 1.02,
              y: -5,
              // rotateY is a valid motion transform but not in CSSProperties types
              ...({ rotateY: 2 } as unknown as React.CSSProperties),
              transition: { type: 'spring', stiffness: 400, damping: 25 },
            } as unknown as React.CSSProperties)
            : {}
        }
      >
        <div
          className="w-full h-full rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing relative transform-gpu"
          onClick={onCardClick}
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            backdropFilter: 'blur(12px) saturate(140%)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 20px 40px -16px rgba(0, 0, 0, 0.35)',
          }}
          role="article"
          aria-label={
            ariaLabel ?? `${pet.name}${pet.breed ? `, ${pet.breed}` : ''} — ${ageText}`
          }
          tabIndex={0}
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.stopPropagation();
              onCardClick?.();
            }
          }}
        >
          <MotionDiv
            className="absolute top-6 left-6 z-20 px-5 py-2 rounded-full font-bold text-sm shadow-lg backdrop-blur-md border border-white/10 bg-white/10 text-white"
            style={{ opacity: likeOverlayOpacity as unknown as number }}
          >
            <div className="flex items-center gap-2">
              <HeartSolidIcon className="w-5 h-5" />
              <span>LIKE</span>
            </div>
          </MotionDiv>

          <MotionDiv
            className="absolute top-6 right-6 z-20 px-5 py-2 rounded-full font-bold text-sm shadow-lg backdrop-blur-md border border-white/10 bg-white/10 text-white"
            style={{ opacity: passOverlayOpacity as unknown as number }}
          >
            <div className="flex items-center gap-2">
              <XMarkIcon className="w-5 h-5" />
              <span>PASS</span>
            </div>
          </MotionDiv>

          <div className="relative h-2/3">
            <LazyImage
              src={photoUrl}
              alt={pet.name}
              width={480}
              height={640}
              className="object-cover w-full h-full"
              priority={false}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {(pet as Pet & { featured?: { isFeatured: boolean } }).featured?.isFeatured && (
              <div className="absolute top-4 left-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1 shadow-lg">
                <SparklesIcon className="w-4 h-4" />
                <span>Featured</span>
              </div>
            )}

            {pet.photos.length > 1 && (
              <div className="absolute top-4 right-4 flex space-x-1">
                {pet.photos.map((_, index: number) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-white' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            )}

            <div className="absolute bottom-4 left-4 right-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-2xl font-bold">{pet.name}</h3>
                  <p className="text-lg opacity-90">{ageText}</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl">
                    {(pet as Pet & { species?: string }).species === 'dog'
                      ? '🐕'
                      : (pet as Pet & { species?: string }).species === 'cat'
                        ? '🐱'
                        : '🐾'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="h-1/3 p-6 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Breed</p>
                  <p className="font-semibold text-white">{pet.breed || 'Mixed'}</p>
                </div>
                <div>
                  <p className="text-white/70 text-sm">Size</p>
                  <p className="font-semibold capitalize text-white">{pet.size || 'Medium'}</p>
                </div>
                <div>
                  <p className="text-white/70 text-sm">Age</p>
                  <p className="font-semibold text-white">{ageText}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-white/70">
                <MapPinIcon className="w-4 h-4" />
                <span className="text-sm">{distanceText}</span>
              </div>

              {(pet.description || (pet as Pet & { bio?: string }).bio) && (
                <div>
                  <p className="text-white/85 text-sm leading-relaxed">
                    {pet.description || (pet as Pet & { bio?: string }).bio}
                  </p>
                </div>
              )}

              {(pet as Pet & { personalityTags?: string[] }).personalityTags?.length > 0 && (
                <div>
                  <p className="text-white/70 text-sm mb-2">Personality</p>
                  <div className="flex flex-wrap gap-2">
                    {(pet as Pet & { personalityTags?: string[] }).personalityTags
                      .slice(0, 4)
                      .map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="border border-white/10 bg-white/5 text-white/90 px-3 py-1 rounded-full text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    {(pet as Pet & { personalityTags?: string[] }).personalityTags.length > 4 && (
                      <span className="border border-white/10 bg-white/5 text-white/80 px-3 py-1 rounded-full text-xs">
                        +{(pet as Pet & { personalityTags?: string[] }).personalityTags.length - 4}{' '}
                        more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {(pet as Pet & { healthInfo?: { vaccinated: boolean; spayedNeutered: boolean } }).healthInfo && (
                <div className="flex items-center space-x-4 text-sm text-white/70">
                  {(pet as Pet & { healthInfo?: { vaccinated: boolean; spayedNeutered: boolean } }).healthInfo
                    ?.vaccinated && (
                      <span className="flex items-center space-x-1">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                        <span>Vaccinated</span>
                      </span>
                    )}
                  {(pet as Pet & { healthInfo?: { vaccinated: boolean; spayedNeutered: boolean } }).healthInfo
                    ?.spayedNeutered && (
                      <span className="flex items-center space-x-1">
                        <span className="w-2 h-2 bg-sky-400 rounded-full"></span>
                        <span>Spayed/Neutered</span>
                      </span>
                    )}
                </div>
              )}
            </div>
          </div>

          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
            <MotionButton
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                handleButtonClick('pass');
              }}
              aria-label="Pass"
              className="w-14 h-14 bg-white/10 border border-white/20 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-white/20 transition-colors"
              role="button"
              tabIndex={0}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  handleButtonClick('pass');
                }
              }}
            >
              <XMarkIcon className="w-7 h-7" />
            </MotionButton>

            <MotionButton
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                handleButtonClick('superlike');
              }}
              aria-label="Super Like"
              className="w-12 h-12 bg-white/10 border border-white/20 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-white/20 transition-colors"
              role="button"
              tabIndex={0}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  handleButtonClick('superlike');
                }
              }}
            >
              <SparklesIcon className="w-6 h-6" />
            </MotionButton>

            <MotionButton
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                handleButtonClick('like');
              }}
              aria-label="Like"
              className="w-14 h-14 bg-white/10 border border-white/20 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-white/20 transition-colors"
              role="button"
              tabIndex={0}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  handleButtonClick('like');
                }
              }}
            >
              <HeartIcon className="w-7 h-7" />
            </MotionButton>
          </div>
        </div>
      </DraggableMotionDiv>
    </div>
  );
};

const MemoSwipeCard = memo(SwipeCardBase);
MemoSwipeCard.displayName = 'SwipeCard';

// First wrap with error boundary, then apply createComponent helper
const SwipeCardWithErrorBoundary = withErrorBoundary(MemoSwipeCard);

// Export using createComponent to ensure proper React 19 compatibility
export default createComponent(SwipeCardWithErrorBoundary);
export { MemoSwipeCard as SwipeCard };
