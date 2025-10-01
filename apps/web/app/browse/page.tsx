'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  HeartIcon, 
  XMarkIcon, 
  ChatBubbleLeftRightIcon,
  UserIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import PremiumCard from '@/components/UI/PremiumCard';
import PremiumButton from '@/components/UI/PremiumButton';
import PremiumLayout from '@/components/Layout/PremiumLayout';

interface Pet {
  id: string;
  name: string;
  age: number;
  breed: string;
  species: string;
  description: string;
  photos: string[];
  location: string;
  owner: {
    name: string;
    avatar?: string;
  };
}

// Mock data for demo
const mockPets: Pet[] = [
  {
    id: '1',
    name: 'Buddy',
    age: 3,
    breed: 'Golden Retriever',
    species: 'dog',
    description: 'Friendly and playful dog who loves kids and other pets. Great with families!',
    photos: [
      'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&auto=format&fit=crop'
    ],
    location: 'San Francisco, CA',
    owner: {
      name: 'Sarah Johnson',
      avatar: 'SJ'
    }
  },
  {
    id: '2',
    name: 'Luna',
    age: 2,
    breed: 'Maine Coon',
    species: 'cat',
    description: 'Gentle and affectionate cat. Perfect for quiet homes and loves cuddles.',
    photos: [
      'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=400&auto=format&fit=crop'
    ],
    location: 'Los Angeles, CA',
    owner: {
      name: 'Mike Chen',
      avatar: 'MC'
    }
  },
  {
    id: '3',
    name: 'Max',
    age: 4,
    breed: 'Labrador Mix',
    species: 'dog',
    description: 'Energetic and loyal companion. Great for active families who love outdoor adventures.',
    photos: [
      'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400&auto=format&fit=crop'
    ],
    location: 'Seattle, WA',
    owner: {
      name: 'Emily Davis',
      avatar: 'ED'
    }
  }
];

export default function BrowsePage() {
  const [currentPetIndex, setCurrentPetIndex] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [actionType, setActionType] = useState<'like' | 'chat' | null>(null);
  const [likedPets, setLikedPets] = useState<string[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const currentPet = mockPets[currentPetIndex];

  const handleLike = () => {
    setActionType('like');
    setShowLoginModal(true);
  };

  const handlePass = () => {
    setCurrentPetIndex((prev) => (prev + 1) % mockPets.length);
    setCurrentPhotoIndex(0);
  };

  const handleChat = () => {
    setActionType('chat');
    setShowLoginModal(true);
  };

  const handleLoginSuccess = () => {
    if (actionType === 'like') {
      setLikedPets(prev => [...prev, currentPet.id]);
      // Move to next pet after liking
      setTimeout(() => {
        setCurrentPetIndex((prev) => (prev + 1) % mockPets.length);
        setCurrentPhotoIndex(0);
      }, 1000);
    } else if (actionType === 'chat') {
      // Redirect to chat
      window.location.href = `/chat/${currentPet.id}`;
    }
    setShowLoginModal(false);
    setActionType(null);
  };

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % currentPet.photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + currentPet.photos.length) % currentPet.photos.length);
  };

  const handleSwipeEnd = () => {
    if (Math.abs(dragOffset.x) > 100) {
      if (dragOffset.x > 0) {
        // Swiped right - Like
        handleLike();
      } else {
        // Swiped left - Pass
        handlePass();
      }
    }
    setDragOffset({ x: 0, y: 0 });
    setIsDragging(false);
  };

  return (
    <PremiumLayout>
      {/* Page Header */}
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">
            <span className="mr-1">🐾</span>
            <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">Browse Pets</span>
          </h1>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-white/10 backdrop-blur-md">
            <span className="text-sm text-white/70">
              {currentPetIndex + 1} of {mockPets.length}
            </span>
          </div>
        </div>

        {/* Pet Card */}
        <div className="relative">
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragStart={() => setIsDragging(true)}
            onDrag={(_: any, info: any) => setDragOffset({ x: info.offset.x, y: info.offset.y })}
            onDragEnd={handleSwipeEnd}
            animate={{ 
              x: dragOffset.x,
              rotate: dragOffset.x * 0.1,
              scale: isDragging ? 0.95 : 1
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="cursor-grab active:cursor-grabbing"
          >
            <PremiumCard className="overflow-hidden" variant="glass">
            {/* Photo Carousel */}
            <div className="relative h-96 bg-black/20">
              <img
                src={currentPet.photos[currentPhotoIndex]}
                alt={currentPet.name}
                className="w-full h-full object-cover"
              />
              
              {/* Photo Navigation */}
              {currentPet.photos.length > 1 && (
                <>
                  <button
                    onClick={prevPhoto}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-colors"
                  >
                    ←
                  </button>
                  <button
                    onClick={nextPhoto}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-colors"
                  >
                    →
                  </button>
                  
                  {/* Photo Indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {currentPet.photos.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPhotoIndex(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentPhotoIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Like Status */}
              {likedPets.includes(currentPet.id) && (
                <div className="absolute top-4 right-4 bg-white/10 border border-white/20 backdrop-blur text-white px-3 py-1 rounded-full text-sm font-semibold">
                  ❤️ Liked!
                </div>
              )}
            </div>

            {/* Pet Info */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">{currentPet.name}</h2>
                  <p className="text-white/70">
                    {currentPet.age} year old {currentPet.breed}
                  </p>
                  <p className="text-sm text-white/60 flex items-center gap-1">
                    📍 {currentPet.location}
                  </p>
                </div>
                <div className="text-right">
                  <div className="w-12 h-12 bg-white/10 border border-white/10 rounded-full flex items-center justify-center text-white font-bold">
                    {currentPet.owner.avatar}
                  </div>
                  <p className="text-xs text-white/60 mt-1">{currentPet.owner.name}</p>
                </div>
              </div>

              <p className="text-white/80 mb-6">{currentPet.description}</p>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <PremiumButton
                  variant="outline"
                  size="lg"
                  onClick={handlePass}
                  className="flex-1 bg-red-500/20 border-red-500/50 text-white hover:bg-red-500/30 hover:border-red-500/70 backdrop-blur-md"
                  icon={<XMarkIcon className="w-5 h-5" />}
                >
                  Pass
                </PremiumButton>
                
                <PremiumButton
                  variant="outline"
                  size="lg"
                  onClick={handleLike}
                  className="flex-1 bg-pink-500/20 border-pink-500/50 text-white hover:bg-pink-500/30 hover:border-pink-500/70 backdrop-blur-md"
                  icon={likedPets.includes(currentPet.id) ? 
                    <HeartSolid className="w-5 h-5" /> : 
                    <HeartIcon className="w-5 h-5" />
                  }
                >
                  {likedPets.includes(currentPet.id) ? 'Liked' : 'Like'}
                </PremiumButton>
                
                <PremiumButton
                  variant="outline"
                  size="lg"
                  onClick={handleChat}
                  className="flex-1 bg-blue-500/20 border-blue-500/50 text-white hover:bg-blue-500/30 hover:border-blue-500/70 backdrop-blur-md"
                  icon={<ChatBubbleLeftRightIcon className="w-5 h-5" />}
                >
                  Chat
                </PremiumButton>
              </div>
            </div>
            </PremiumCard>
          </motion.div>

          {/* Swipe Indicators */}
          {isDragging && (
            <>
              <motion.div
                className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-red-500/80 text-white px-4 py-2 rounded-full font-bold text-lg backdrop-blur-md"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: dragOffset.x < -50 ? 1 : 0,
                  scale: dragOffset.x < -50 ? 1 : 0.8
                }}
              >
                PASS
              </motion.div>
              <motion.div
                className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-pink-500/80 text-white px-4 py-2 rounded-full font-bold text-lg backdrop-blur-md"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: dragOffset.x > 50 ? 1 : 0,
                  scale: dragOffset.x > 50 ? 1 : 0.8
                }}
              >
                LIKE
              </motion.div>
            </>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 text-center">
          <p className="text-white/70 text-sm">
            💡 <strong>Tip:</strong> Swipe left to pass, right to like, or use buttons below. Login required to like or chat!
          </p>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div>
              <PremiumCard className="max-w-md w-full p-8 text-center" variant="glass">
                <div className="mb-6">
                  {actionType === 'like' ? (
                    <HeartIcon className="w-16 h-16 mx-auto text-white mb-4" />
                  ) : (
                    <ChatBubbleLeftRightIcon className="w-16 h-16 mx-auto text-white mb-4" />
                  )}
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {actionType === 'like' ? 'Like This Pet?' : 'Start Chatting?'}
                  </h3>
                  <p className="text-white/70">
                    {actionType === 'like' 
                      ? 'Create an account to like pets and see who liked you back!'
                      : 'Sign up to start chatting with pet owners and arrange meetups!'
                    }
                  </p>
                </div>

                <div className="space-y-3">
                  <PremiumButton
                    size="lg"
                    onClick={() => window.location.href = '/register'}
                    className="w-full"
                    icon={<UserIcon className="w-5 h-5" />}
                  >
                    Sign Up Free
                  </PremiumButton>
                  
                  <PremiumButton
                    variant="secondary"
                    size="lg"
                    onClick={() => window.location.href = '/login'}
                    className="w-full"
                    icon={<SparklesIcon className="w-5 h-5" />}
                  >
                    Already have an account? Login
                  </PremiumButton>
                  
                  <button
                    onClick={() => setShowLoginModal(false)}
                    className="text-white/50 hover:text-white/70 text-sm transition-colors"
                  >
                    Continue browsing
                  </button>
                </div>
              </PremiumCard>
          </div>
        </div>
      )}
    </PremiumLayout>
  );
}
