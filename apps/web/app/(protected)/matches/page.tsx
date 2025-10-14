'use client';

import { AdvancedPetFilters } from '@/components/Filters/AdvancedPetFilters';
import PremiumLayout from '@/components/Layout/PremiumLayout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import PremiumButton from '@/components/ui/PremiumButton';
import PremiumCard from '@/components/ui/PremiumCard';
import { logger } from '@/services/logger';
import { useFilterStore } from '@/store/filterStore';
import {
  ChatBubbleLeftRightIcon,
  HeartIcon,
  PhoneIcon,
  VideoCameraIcon,
} from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
// ...existing code...
// Memoized PremiumCard for performance
const MemoizedPremiumCard = memo(function MemoizedPremiumCard({ match }: { match: Match }) {
  const handleCardTap = () => {
    if (navigator.vibrate) navigator.vibrate(10);
  };
  return (
    <motion.div
      whileHover={{ scale: 1.03, boxShadow: '0 8px 32px 0 rgba(236,72,153,0.15)' }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      onPointerDown={handleCardTap}
      className="rounded-2xl bg-gradient-to-br from-pink-50 via-white to-purple-50 shadow-xl"
    >
      <PremiumCard
        variant="glass"
        hover
        className="overflow-hidden"
      >
        {/* Pet Photo */}
        <div className="relative h-48 bg-gradient-to-br from-pink-100 to-purple-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={match.pet.photo}
            alt={match.pet.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/images/placeholder-pet.jpg';
            }}
          />
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-semibold text-purple-600">
            Matched {new Date(match.matchedAt).toLocaleDateString()}
          </div>
        </div>
        {/* Match Info */}
        <div className="p-4">
          <div className="mb-3">
            <h3 className="text-lg font-bold text-gray-900">{match.pet.name}</h3>
            <p className="text-sm text-gray-600">
              {match.pet.breed}, {match.pet.age} years old
            </p>
          </div>

          <div className="mb-3">
            <p className="text-sm font-medium text-gray-700">{match.owner.name}</p>
            <p className="text-xs text-gray-500">{match.owner.location}</p>
          </div>

          {/* Last Message */}
          {match.lastMessage && (
            <div className="mb-4 p-2 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 truncate">{match.lastMessage}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <motion.div whileTap={{ scale: 0.92 }}>
              <Link
                href={`/chat/${match.id}`}
                className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-colors"
                aria-label={`Chat with ${match.owner.name}`}
              >
                <ChatBubbleLeftRightIcon className="h-4 w-4" />
                <span className="text-sm font-medium">Chat</span>
              </Link>
            </motion.div>
            <motion.button
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              type="button"
              aria-label="Call"
              whileTap={{ scale: 0.92 }}
              onPointerDown={handleCardTap}
            >
              <PhoneIcon className="h-4 w-4 text-gray-600" />
            </motion.button>
            <motion.button
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              type="button"
              aria-label="Video call"
              whileTap={{ scale: 0.92 }}
              onPointerDown={handleCardTap}
            >
              <VideoCameraIcon className="h-4 w-4 text-gray-600" />
            </motion.button>
          </div>
        </div>
      </div>
    </PremiumCard>
    </motion.div >
  );
});

interface Pet {
  name: string;
  breed: string;
  age: number;
  photo: string;
}

interface Owner {
  name: string;
  location: string;
}

interface Match {
  id: string;
  pet: Pet;
  owner: Owner;
  matchedAt: string;
  lastMessage?: string;
}

// Use shared PetFilters type from core package for strict type compatibility
import type { PetFilters } from '@pawfectmatch/core/types';



export default function MatchesPage() {
  const filters = useFilterStore((s: any) => s.filters);
  const setFilters = useFilterStore((s: any) => s.setFilters);
  const resetFilters = useFilterStore((s: any) => s.resetFilters);
  const [appliedFilters, setAppliedFilters] = useState<PetFilters>(filters);
  const [debouncing, setDebouncing] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleFilterChange = useCallback((newFilters: PetFilters) => {
    setFilters(newFilters);
    setDebouncing(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setAppliedFilters(newFilters);
      setDebouncing(false);
    }, 400);
  }, [setFilters]);

  // Manual apply still available for accessibility
  const handleFilterApply = useCallback((e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setAppliedFilters(filters);
    setDebouncing(false);
  }, [filters]);

  const handleFilterReset = useCallback(() => {
    resetFilters();
    setAppliedFilters({});
    setDebouncing(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, [resetFilters]);

  const {
    data: matches,
    isLoading,
    error,
  } = useQuery<Match[]>({
    queryKey: ['matches', appliedFilters],
    queryFn: async () => {
      try {
        const response = await fetch('/api/matches', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ filters: appliedFilters }),
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch matches: ${response.statusText}`);
        }

        const data = await response.json();
        return data.matches || [];
      } catch (error) {
        logger.error('Error fetching matches', { error });
        throw error;
      }
    },
  });

  if (isLoading) {
    return (
      <PremiumLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </PremiumLayout>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Image src="/images/error-pet.svg" alt="Error" width={96} height={96} className="h-24 w-24" aria-hidden="true" />
          </div>
          <p className="text-xl font-bold text-pink-600 mb-2">Oops! Something went wrong.</p>
          <p className="text-gray-700 mb-4">We couldn't load your matches. Please try again.</p>
          <PremiumButton onClick={() => window.location.reload()} variant="secondary" size="md" aria-label="Retry loading matches">
            Retry
          </PremiumButton>
        </div>
      </div>
    );
  }

  return (
    <PremiumLayout>
      {/* Title */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <h1 className="text-3xl font-bold">
          <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            Your Matches
          </span>
        </h1>
      </div>

      {/* Advanced Filters UI with animation and accessibility */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={JSON.stringify(filters)}
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            aria-label="Advanced pet filters panel"
            role="region"
          >
            <AdvancedPetFilters value={filters} onChange={handleFilterChange} onReset={handleFilterReset} />
            <div className="flex justify-end mt-2">
              <PremiumButton variant="primary" size="md" onClick={handleFilterApply} aria-label="Apply Filters">
                Apply Filters
              </PremiumButton>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Matches Grid with loading shimmer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" aria-live="polite">
        {isLoading || debouncing ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-72 bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl shadow-inner" />
            ))}
          </div>
        ) : matches && matches.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {useMemo(() => matches.map((match) => <MemoizedPremiumCard key={match.id} match={match} />), [matches])}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
              <Image src="/images/empty-matches.svg" alt="No matches yet" width={112} height={112} className="h-28 w-28" aria-hidden="true" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">No matches yet</h2>
            <p className="text-gray-200 mb-4">Try adjusting your filters or start swiping to find your perfect match!</p>
            <Link href="/swipe" passHref legacyBehavior>
              <a>
                <PremiumButton variant="primary" size="lg" aria-label="Start Swiping">
                  Start Swiping
                </PremiumButton>
              </a>
            </Link>
          </div>
        )}
      </div>
    </PremiumLayout>
  );
}

// React 19 JSX compatibility: cast ForwardRef components
