'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeData } from '../../../src/hooks/api-hooks';
import SwipeCard from '../../../src/components/Pet/SwipeCard';
import MatchModal from '../../../src/components/Pet/MatchModal';
import { HeartIcon, XMarkIcon, StarIcon, SparklesIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import LoadingSpinner from '../../../src/components/UI/LoadingSpinner';
import PremiumButton from '../../../src/components/UI/PremiumButton';
import PremiumCard from '../../../src/components/UI/PremiumCard';

export default function SwipePage() {
  const { pets, currentPet, swipe, isLoading, lastMatch, clearMatch, isPremium, refetch } = useSwipeData();
  const [showMatchModal, setShowMatchModal] = useState(false);

  useEffect(() => {
    if (lastMatch) {
      setShowMatchModal(true);
    }
  }, [lastMatch]);

  const onSwipe = async (direction: 'like' | 'pass' | 'superlike') => {
    if (!currentPet) return;
    await swipe({
      petId: currentPet.id,
      action: direction,
      timestamp: new Date().toISOString(),
    });
  };

  if (isLoading && !currentPet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <LoadingSpinner size="lg" variant="holographic" />
          <p className="mt-6 text-lg text-gray-600 font-semibold">Finding perfect matches for you...</p>
        </motion.div>
      </div>
    );
  }

  if (!currentPet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white/90 backdrop-blur-xl p-12 rounded-3xl shadow-2xl max-w-lg border border-white/20"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <SparklesIcon className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">No More Pets Right Now!</h2>
          <p className="text-gray-600 mb-8 text-lg">Check back later for more adorable matches, or explore your current matches.</p>
          <PremiumButton
            onClick={() => refetch()}
            variant="gradient"
            size="lg"
            icon={<ArrowPathIcon className="w-5 h-5" />}
            glow
            magneticEffect
            haptic
          >
            Refresh
          </PremiumButton>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col" data-testid="swipe-interface">
      {/* Premium Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-40 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Pet Match
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">Discover your perfect companion</p>
            </div>
            <div className="flex items-center gap-4">
              {isPremium && (
                <span className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold rounded-full">
                  <SparklesIcon className="w-3.5 h-3.5" />
                  PREMIUM
                </span>
              )}
              <div className="text-right">
                <p className="text-xs text-gray-500">Your Queue</p>
                <p className="text-lg font-bold text-gray-900">{pets.length} pets</p>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Swipe Area */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="relative w-full max-w-lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPet?.id}
              initial={{ scale: 0.9, opacity: 0, rotateY: 10 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              exit={{ scale: 0.9, opacity: 0, rotateY: -10 }}
              transition={{ duration: 0.4, type: "spring" }}
            >
              <SwipeCard pet={currentPet} onSwipe={onSwipe} />
            </motion.div>
          </AnimatePresence>

          {/* Premium Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center items-center gap-6 mt-10"
          >
            <PremiumButton
              onClick={() => onSwipe('pass')}
              variant="ghost"
              size="lg"
              icon={<XMarkIcon className="h-6 w-6 text-red-500" />}
              haptic
              className="!w-16 !h-16 !rounded-full !min-h-0 !p-0"
              data-testid="pass-button"
            />
            
            {isPremium && (
              <PremiumButton
                onClick={() => onSwipe('superlike')}
                variant="neon"
                size="lg"
                icon={<StarIcon className="h-8 w-8" />}
                glow
                magneticEffect
                haptic
                sound
                className="!w-20 !h-20 !rounded-full !min-h-0 !p-0 relative"
              >
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <SparklesIcon className="w-3 h-3 text-white" />
                </div>
              </PremiumButton>
            )}
            
            <PremiumButton
              onClick={() => onSwipe('like')}
              variant="gradient"
              size="lg"
              icon={<HeartIcon className="h-6 w-6" />}
              glow
              magneticEffect
              haptic
              sound
              className="!w-16 !h-16 !rounded-full !min-h-0 !p-0"
              data-testid="like-button"
            />
          </motion.div>

          {/* Action Labels */}
          <div className="flex justify-center items-center gap-6 mt-4">
            <span className="text-xs font-semibold text-gray-500 w-16 text-center">PASS</span>
            {isPremium && <span className="text-xs font-semibold text-blue-600 w-20 text-center">SUPER LIKE</span>}
            <span className="text-xs font-semibold text-pink-600 w-16 text-center">LIKE</span>
          </div>
        </div>
      </div>

      {/* Match Modal */}
      {showMatchModal && lastMatch && (
        <MatchModal
          isOpen={showMatchModal}
          onClose={() => {
            setShowMatchModal(false);
            clearMatch();
          }}
          matchId={(lastMatch as any).id}
          currentUserPet={(lastMatch as any).pet1}
          matchedPet={(lastMatch as any).pet2}
          matchedUser={(lastMatch as any).user2}
        />
      )}
    </div>
  );
}
