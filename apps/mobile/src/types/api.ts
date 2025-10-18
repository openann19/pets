/**
 * ULTRA PREMIUM MOBILE API TYPES 🚀
 * Production-ready type definitions for mobile app
 * Uses unified types from packages/core for consistency
 */

// Re-export core types
export * from '@pawfectmatch/core';
import type { Pet as CorePet, User as CoreUser, Match as CoreMatch, Message as CoreMessage, CallData as CoreCallData, AdoptionApplication as CoreAdoptionApplication, AdoptionListing as CoreAdoptionListing, ApiService as CoreApiService, ApiResponse } from '@pawfectmatch/core';

// Mobile-specific extensions
export interface Pet extends Omit<CorePet, 'photos' | 'owner'> {
  id?: string;
  photos: Array<{
    url: string;
    publicId?: string;
    caption?: string;
    isPrimary?: boolean;
  }>;
  owner: {
    _id: string;
    name: string;
    email: string;
  };
  applications?: AdoptionApplication[] | number;
}

// Mobile-specific type extensions
export type AdoptionApplication = CoreAdoptionApplication

export type AdoptionListing = CoreAdoptionListing

export interface User extends Omit<CoreUser, 'location'> {
  // Mobile-specific extensions
  name: string; // Alias for firstName + lastName
  location: {
    city: string;
    state: string;
    country: string;
  };
  preferences: {
    species: string[];
    breeds: string[];
    ageRange: {
      min: number;
      max: number;
    };
    distance: number;
  };
}

export interface Match extends Omit<CoreMatch, 'status'> {
  // Mobile-specific extensions
  users: string[];
  pets: string[];
  status: 'pending' | 'accepted' | 'rejected';
}

export interface Message extends CoreMessage {
  // Mobile-specific extensions
  senderId: string;
  receiverId?: string;
  matchId?: string;
  type: 'text' | 'image' | 'video' | 'location' | 'emoji';
  mediaUrl?: string;
  read: boolean;
  timestamp: string;
  status?: 'sending' | 'sent' | 'failed';
}

export type CallData = CoreCallData

// API Service Interface - extends core interface with mobile-specific methods
export interface ApiService extends CoreApiService {
  // Mobile-specific methods
  getMyPets(): Promise<ApiResponse<Pet[]>>;
  updatePetAnalytics(petId: string, action: 'view' | 'like' | 'match' | 'message'): Promise<ApiResponse<void>>;
  boostPet(petId: string): Promise<ApiResponse<Pet>>;
  pausePet(petId: string): Promise<ApiResponse<Pet>>;
  activatePet(petId: string): Promise<ApiResponse<Pet>>;
}
