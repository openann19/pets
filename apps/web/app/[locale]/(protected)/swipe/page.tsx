'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeData } from '@/hooks/api-hooks';
import SwipeCard from '@/components/Pet/SwipeCard';
import MatchModal from '@/components/Pet/MatchModal';
import { HeartIcon, XMarkIcon, StarIcon, SparklesIcon, ArrowPathIcon, AdjustmentsHorizontalIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import PremiumButton from '@/components/UI/PremiumButton';
import PremiumCard from '@/components/UI/PremiumCard';
import PremiumLayout from '@/components/Layout/PremiumLayout';

export default function SwipePage() {
  const { pets, currentPet, swipe, isLoading, lastMatch, clearMatch, isPremium, refetch } = useSwipeData();
  const [showMatchModal, setShowMatchModal] = useState(false);
  
  // Advanced Filter State
  const [filters, setFilters] = useState({
    breed: '',
    species: '',
    location: '',
    maxDistance: 25,
    minAge: 0,
    maxAge: 20,
    size: '',
    energyLevel: '',
    familyFriendly: false
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (lastMatch) {
      setShowMatchModal(true);
    }
  }, [lastMatch]);

  const onSwipe = async (direction: 'like' | 'pass' | 'superlike') => {
    if (!currentPet) return;
    await swipe(direction as any);
  };

  if (isLoading && !currentPet) {
    return (
      <PremiumLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <LoadingSpinner size="lg" variant="holographic" />
            <p className="mt-6 text-lg text-white/80 font-semibold">Finding perfect matches for you...</p>
          </motion.div>
        </div>
      </PremiumLayout>
    );
  }

  if (!currentPet) {
    return (
      <PremiumLayout>
        <div className="min-h-[60vh] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center glass-light p-12 rounded-3xl shadow-2xl max-w-lg border border-white/20"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <SparklesIcon className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">No More Pets Right Now!</h2>
            <p className="text-white/80 mb-8 text-lg">Check back later for more adorable matches, or explore your current matches.</p>
            <PremiumButton
              onClick={() => refetch()}
              variant="glass"
              size="lg"
              icon={<ArrowPathIcon className="w-5 h-5" />}
              magneticEffect
              haptic
            >
              Refresh
            </PremiumButton>
          </motion.div>
        </div>
      </PremiumLayout>
    );
  }

  return (
    <PremiumLayout>
      <div className="min-h-screen bg-transparent flex flex-col">
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

        {/* Ultra-Premium Filter Panel */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-3"
        >
          <PremiumButton
            onClick={() => setShowFilters(!showFilters)}
            variant={showFilters ? "glass" : "gradient"}
            size="md"
            icon={<AdjustmentsHorizontalIcon className="w-4 h-4" />}
            className="w-full"
            magneticEffect
          >
            {showFilters ? 'Hide Filters' : 'Find Specific Breeds (Shiba Inu, etc.)'}
          </PremiumButton>
        </motion.div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden px-4 pb-4"
            >
              <PremiumCard className="p-6 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <MagnifyingGlassIcon className="w-6 h-6 text-purple-500" />
                  <h3 className="text-lg font-bold text-gray-800">Advanced Breed & Pet Search</h3>
                </div>
                
                {/* Breed Search */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Breed Search</label>
                  <input
                    type="text"
                    placeholder="Search breeds (e.g., Shiba Inu, Golden Retriever)"
                    value={filters.breed}
                    onChange={(e) => setFilters(prev => ({ ...prev, breed: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                {/* Species Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Species</label>
                  <select
                    value={filters.species}
                    onChange={(e) => setFilters(prev => ({ ...prev, species: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">All Species</option>
                    <option value="dog">🐕 Dogs Only</option>
                    <option value="cat">🐱 Cats Only</option>
                    <option value="bird">🦜 Birds Only</option>
                    <option value="rabbit">🐰 Rabbits Only</option>
                    <option value="small-animal">🐭 Small Animals</option>
                  </select>
                </div>

                {/* Quick Breed Presets */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Popular Dog Breeds</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Shiba Inu', 'Golden Retriever', 'Labrador', 'Border Collie'].map(breed => (
                      <button
                        key={breed}
                        onClick={() => setFilters(prev => ({ 
                          ...prev, 
                          breed: prev.breed === breed ? '' : breed,
                          species: 'dog'
                        }))}
                        className={`px-3 py-2 rounded-lg border transition-all duration-200 text-xs ${
                          filters.breed === breed 
                            ? 'bg-purple-500 text-white border-purple-500' 
                            : 'bg-white border-gray-300 hover:border-purple-400'
                        }`}
                      >
                        {breed}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Size</label>
                  <div className="grid grid-cols-4 gap-1">
                    {['small', 'medium', 'large'].map(size => (
                      <button
                        key={size}
                        onClick={() => setFilters(prev => ({ 
                          ...prev, 
                          size: prev.size === size ? '' : size 
                        }))}
                        className={`px-2 py-2 rounded-lg border transition-all duration-200 text-xs ${
                          filters.size === size 
                            ? 'bg-purple-500 text-white border-purple-500' 
                            : 'bg-white border-gray-300 hover:border-purple-400'
                        }`}
                      >
                        {size.charAt(0).toUpperCase() + size.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Apply Filters Button */}
                <div className="flex gap-3">
                  <PremiumButton
                    onClick={() => refetch()}
                    variant="gradient"
                    size="md"
                    className="flex-1"
                    magneticEffect
                  >
                    Apply Filters
                  </PremiumButton>
                  <PremiumButton
                    onClick={() => setFilters({
                      breed: '',
                      species: '',
                      location: '',
                      maxDistance: 25,
                      minAge: 0,
                      maxAge: 20,
                      size: '',
                      energyLevel: '',
                      familyFriendly: false
                    })}
                    variant="glass"
                    size="md"
                  >
                    Reset
                  </PremiumButton>
                </div>
              </PremiumCard>

              {/* Current Active Filters Display */}
              {(filters.breed || filters.species || filters.size) && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 px-3 py-2 bg-purple-100 rounded-lg"
                >
                  <p className="text-sm font-medium text-purple-800">
                    Active Filters: 
                    {(filters.breed || filters.species || filters.size) && 
                      ` ${(filters.breed ? `${filters.breed}${filters.species ? ` (${filters.species})` : ''}` : '')}${(filters.size ? ` - ${filters.size}` : '')}`
                    }
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

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
              className="flex justify-center items-center gap-8 mt-10"
            >
              <div className="flex flex-col items-center gap-2">
                <PremiumButton
                  onClick={() => onSwipe('pass')}
                  variant="ghost"
                  size="lg"
                  haptic
                  className="!w-20 !h-20 !rounded-full !min-h-0 !p-0 bg-white/10 hover:bg-red-500/30 border-2 border-red-500/50 hover:border-red-500 shadow-lg hover:shadow-red-500/50 transition-all duration-200"
                >
                  <XMarkIcon className="h-8 w-8 text-red-500" />
                </PremiumButton>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pass</span>
              </div>
              
              {isPremium && (
                <div className="flex flex-col items-center gap-2">
                  <PremiumButton
                    onClick={() => onSwipe('superlike')}
                    variant="neon"
                    size="lg"
                    glow
                    magneticEffect
                    haptic
                    sound
                    className="!w-24 !h-24 !rounded-full !min-h-0 !p-0 relative bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 border-2 border-blue-400 shadow-xl hover:shadow-blue-500/50 transition-all duration-200"
                  >
                    <StarIcon className="h-10 w-10 text-white" />
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                      <SparklesIcon className="w-4 h-4 text-white" />
                    </div>
                  </PremiumButton>
                  <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Super Like</span>
                </div>
              )}
              
              <div className="flex flex-col items-center gap-2">
                <PremiumButton
                  onClick={() => onSwipe('like')}
                  variant="primary"
                  size="lg"
                  glow
                  magneticEffect
                  haptic
                  sound
                  className="!w-20 !h-20 !rounded-full !min-h-0 !p-0 bg-gradient-to-br from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 border-2 border-pink-400 shadow-lg hover:shadow-pink-500/50 transition-all duration-200"
                >
                  <HeartIcon className="h-8 w-8 text-white" />
                </PremiumButton>
                <span className="text-xs font-semibold text-pink-400 uppercase tracking-wider">Like</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Match Modal */}
        {showMatchModal && lastMatch && (lastMatch as any).pets && (lastMatch as any).users && (
          <MatchModal
            isOpen={showMatchModal}
            onClose={() => {
              setShowMatchModal(false);
              clearMatch();
            }}
            matchId={lastMatch._id}
            currentUserPet={(lastMatch as any).pets[0] as any}
            matchedPet={(lastMatch as any).pets[1] as any}
            matchedUser={(lastMatch as any).users[1] as any}
          />
        )}
      </div>
    </PremiumLayout>
  );
}
