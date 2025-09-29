import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { HeartIcon, XMarkIcon, SparklesIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { SPRING_CONFIG } from '../../constants/animations';
import { Pet } from '../../types';

interface SwipeCardProps {
  pet: Pet;
  onSwipe: (direction: 'like' | 'pass' | 'superlike') => void;
  onCardClick?: () => void;
  isLiked?: boolean;
  isPassed?: boolean;
  style?: React.CSSProperties;
  dragConstraints?: any;
  hapticFeedback?: boolean;
  soundEffects?: boolean;
  premiumEffects?: boolean;
}

const SwipeCard: React.FC<SwipeCardProps> = ({
  pet,
  onSwipe,
  onCardClick,
  isLiked = false,
  isPassed = false,
  style,
  dragConstraints,
  hapticFeedback = true,
  soundEffects = true,
  premiumEffects = true,
}) => {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | 'super' | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const [showParticles, setShowParticles] = useState(false);

  // Enhanced motion values for smooth interactions
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-30, 30]);
  const opacity = useTransform(x, [-300, -150, 0, 150, 300], [0, 1, 1, 1, 0]);

  const handleDrag = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50;
    const superThreshold = 120;
    
    if (info.offset.y < -superThreshold && Math.abs(info.offset.x) < 50) {
      setDragDirection('super'); // Super like on swipe up
    } else if (info.offset.x > threshold) {
      setDragDirection('right'); // Like on swipe right
    } else if (info.offset.x < -threshold) {
      setDragDirection('left'); // Pass on swipe left
    } else {
      setDragDirection(null);
    }
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    const superThreshold = 120;
    const velocity = info.velocity.x;
    const offset = info.offset.x;
    const yOffset = info.offset.y;

    // Check for super like (swipe up)
    if (yOffset < -superThreshold && Math.abs(offset) < 50) {
      setIsExiting(true);
      setTimeout(() => onSwipe('superlike'), 200);
    } 
    // Strong swipe or drag beyond threshold
    else if (Math.abs(velocity) > 500 || Math.abs(offset) > threshold) {
      setIsExiting(true);
      
      if (offset > 0 || velocity > 0) {
        setTimeout(() => onSwipe('like'), 200);
      } else {
        setTimeout(() => onSwipe('pass'), 200);
      }
    } else {
      // Snap back
      setDragDirection(null);
      x.set(0);
      y.set(0);
    }
  };

  const handleButtonClick = (action: 'like' | 'pass' | 'superlike') => {
    setIsExiting(true);
    setTimeout(() => onSwipe(action), 200);
  };

  const getSwipeIndicatorOpacity = () => {
    return dragDirection ? 1 : 0;
  };

  // Get primary photo
  const primaryPhoto = pet.photos.find((photo: { isPrimary: boolean; url: string }) => photo.isPrimary) || pet.photos[0];
  const photoUrl = primaryPhoto?.url || 'https://via.placeholder.com/400x500?text=No+Photo';

  // Calculate age display
  const ageText = pet.age < 1 ? `${Math.round(pet.age * 12)} months` : `${pet.age} years`;
  
  // Get owner info
  const owner = typeof pet.owner === 'object' ? pet.owner : null;
  const distance = owner?.location ? '2.5 km away' : 'Location unknown'; // Placeholder distance

  return (
    <div className="relative">
      {/* Particle effects for premium interactions */}
      {premiumEffects && showParticles && (
        <div className="absolute inset-0 pointer-events-none z-50">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-full"
              style={{
                background: dragDirection === 'right' 
                  ? 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)'
                  : dragDirection === 'super' 
                    ? 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)'
                    : '#ef4444',
              }}
              initial={{
                x: '50%',
                y: '50%',
                opacity: 1,
                scale: 0,
              }}
              animate={{
                x: `${50 + (Math.random() - 0.5) * 300}%`,
                y: `${50 + (Math.random() - 0.5) * 300}%`,
                opacity: 0,
                scale: 1,
              }}
              transition={{
                duration: 0.8,
                delay: i * 0.1,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      )}

      <motion.div
        ref={cardRef}
        drag
        dragConstraints={dragConstraints}
        dragElastic={0.15}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        className="absolute inset-0"
        style={{ 
          x, 
          y, 
          rotate, 
          opacity,
          ...style 
        }}
        animate={{
          scale: isExiting ? 0.8 : 1,
          opacity: isExiting ? 0 : 1,
        }}
        transition={SPRING_CONFIG}
        whileTap={{ scale: 0.98 }}
        whileHover={premiumEffects ? { scale: 1.02, y: -5 } : {}}
      >
        <div 
          className="w-full h-full rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing relative transform-gpu"
          onClick={onCardClick}
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.25)',
          }}
        >
        {/* Swipe Indicators */}
        <motion.div
          className="absolute top-8 left-8 z-20 bg-green-500 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg"
          animate={{ 
            opacity: dragDirection === 'right' ? getSwipeIndicatorOpacity() : 0,
            scale: dragDirection === 'right' ? 1.1 : 0.8,
          }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center space-x-2">
            <HeartSolidIcon className="w-6 h-6" />
            <span>LIKE</span>
          </div>
        </motion.div>

        <motion.div
          className="absolute top-8 right-8 z-20 bg-red-500 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg"
          animate={{ 
            opacity: dragDirection === 'left' ? getSwipeIndicatorOpacity() : 0,
            scale: dragDirection === 'left' ? 1.1 : 0.8,
          }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center space-x-2">
            <XMarkIcon className="w-6 h-6" />
            <span>PASS</span>
          </div>
        </motion.div>

        {/* Main Photo */}
        <div className="relative h-2/3">
          <img
            src={photoUrl}
            alt={pet.name}
            className="w-full h-full object-cover"
            draggable={false}
          />
          
          {/* Photo overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Premium Badge */}
          {(pet as any).featured?.isFeatured && (
            <div className="absolute top-4 left-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1 shadow-lg">
              <SparklesIcon className="w-4 h-4" />
              <span>Featured</span>
            </div>
          )}

          {/* Photo indicators */}
          {pet.photos.length > 1 && (
            <div className="absolute top-4 right-4 flex space-x-1">
              {pet.photos.map((_, index: number) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === 0 ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Basic info overlay */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-2xl font-bold">{pet.name}</h3>
                <p className="text-lg opacity-90">{ageText}</p>
              </div>
              <div className="text-right">
                <span className="text-3xl">{(pet as any).species === 'dog' ? '🐕' : (pet as any).species === 'cat' ? '🐱' : '🐾'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pet Details */}
        <div className="h-1/3 p-6 overflow-y-auto">
          <div className="space-y-4">
            {/* Basic Info */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Breed</p>
                <p className="font-semibold">{pet.breed || 'Mixed'}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Size</p>
                <p className="font-semibold capitalize">{pet.size || 'Medium'}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Age</p>
                <p className="font-semibold">{ageText}</p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center space-x-2 text-gray-600">
              <MapPinIcon className="w-4 h-4" />
              <span className="text-sm">{distance}</span>
            </div>

            {/* Description/Bio */}
            {(pet.description || (pet as any).bio) && (
              <div>
                <p className="text-gray-800 text-sm leading-relaxed">
                  {pet.description || (pet as any).bio}
                </p>
              </div>
            )}

            {/* Personality Tags (with fallback) */}
            {(pet as any).personalityTags?.length > 0 && (
              <div>
                <p className="text-gray-600 text-sm mb-2">Personality</p>
                <div className="flex flex-wrap gap-2">
                  {(pet as any).personalityTags.slice(0, 4).map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                  {(pet as any).personalityTags.length > 4 && (
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs">
                      +{(pet as any).personalityTags.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Health Info (with fallback) */}
            {(pet as any).healthInfo && (
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                {(pet as any).healthInfo.vaccinated && (
                  <span className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Vaccinated</span>
                  </span>
                )}
                {(pet as any).healthInfo.spayedNeutered && (
                  <span className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>Spayed/Neutered</span>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              handleButtonClick('pass');
            }}
            aria-label="Pass button" className="w-14 h-14 bg-white border-2 border-red-500 text-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-50 transition-colors"
          >
            <XMarkIcon className="w-7 h-7" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              handleButtonClick('superlike');
            }}
            aria-label="Superlike button" className="w-12 h-12 bg-white border-2 border-blue-500 text-blue-500 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-50 transition-colors"
          >
            <SparklesIcon className="w-6 h-6" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              handleButtonClick('like');
            }}
            aria-label="Like button" className="w-14 h-14 bg-white border-2 border-green-500 text-green-500 rounded-full flex items-center justify-center shadow-lg hover:bg-green-50 transition-colors"
          >
            <HeartIcon className="w-7 h-7" />
          </motion.button>
        </div>
      </div>
      </motion.div>
    </div>
  );
};

export default SwipeCard;
