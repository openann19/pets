/**
 * Shared types and interfaces for Swipe functionality
 * Used across web and mobile platforms
 */

export interface Pet {
  _id: string;
  name: string;
  age: number;
  breed: string;
  photos: string[];
  bio: string;
  distance: number;
  compatibility: number;
  isVerified: boolean;
  tags: string[];
  ownerId: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  preferences?: {
    ageRange: [number, number];
    maxDistance: number;
    breeds: string[];
  };
}

export interface SwipeAction {
  type: 'like' | 'pass' | 'superlike';
  petId: string;
  timestamp: Date;
  userId: string;
}

export interface SwipeResult {
  isMatch: boolean;
  matchId?: string | undefined;
  pet: Pet;
  action: SwipeAction;
}

export interface SwipeCardProps {
  pet: Pet;
  onSwipeLeft: (pet: Pet) => void | Promise<void>;
  onSwipeRight: (pet: Pet) => void | Promise<void>;
  onSwipeUp: (pet: Pet) => void | Promise<void>;
  isTopCard?: boolean;
  disabled?: boolean;
  style?: any;
}

export interface SwipeGestureConfig {
  threshold: number;
  rotationMultiplier: number;
  velocityThreshold: number;
  directionalOffset: number;
}

export const DEFAULT_SWIPE_CONFIG: SwipeGestureConfig = {
  threshold: 120,
  rotationMultiplier: 0.1,
  velocityThreshold: 0.3,
  directionalOffset: 80,
};

export interface SwipeAnimationConfig {
  duration: number;
  tension: number;
  friction: number;
  useNativeDriver: boolean;
}

export const DEFAULT_ANIMATION_CONFIG: SwipeAnimationConfig = {
  duration: 300,
  tension: 100,
  friction: 8,
  useNativeDriver: true,
};
