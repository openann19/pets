import { 
  apiClient, 
  type Pet, 
  type User, 
  type Match, 
  type Message, 
  type PetFilters
} from '@pawfectmatch/core';
import { API_BASE_URL, API_TIMEOUT } from '../config/environment';

// Local type definition for adoption application
interface AdoptionApplication {
  _id: string;
  petId: string;
  applicantId: string;
  applicant: User;
  pet: Pet;
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  applicationData: {
    experience: string;
    livingSituation: string;
    otherPets: string;
    timeAlone: string;
    vetReference?: string;
    personalReference?: string;
    additionalInfo?: string;
  };
  submittedAt: string;
}

// API service for mobile app with proper typing
export const matchesAPI = {
  // Get user's matches
  getMatches: async (): Promise<Match[]> => {
    const response = await apiClient.get<Match[]>('/matches');
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error ?? 'Failed to fetch matches');
  },

  // Get specific match details
  getMatch: async (matchId: string): Promise<Match> => {
    const response = await apiClient.get<Match>(`/matches/${matchId}`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error ?? 'Failed to fetch match');
  },

  // Create a new match (like/swipe)
  createMatch: async (petId: string, targetPetId: string): Promise<Match> => {
    const response = await apiClient.post<Match>('/matches', { petId, targetPetId });
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error ?? 'Failed to create match');
  },

  // Get chat messages for a match
  getMessages: async (matchId: string): Promise<Message[]> => {
    const response = await apiClient.get<Message[]>(`/matches/${matchId}/messages`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error ?? 'Failed to fetch messages');
  },

  // Send a message
  sendMessage: async (matchId: string, content: string): Promise<Message> => {
    const response = await apiClient.post<Message>(`/matches/${matchId}/messages`, { content });
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error ?? 'Failed to send message');
  },

  // Get pets for swiping
  getPets: async (filters?: PetFilters): Promise<Pet[]> => {
    const queryString = filters ? `?${new URLSearchParams(filters as Record<string, string>).toString()}` : '';
    const response = await apiClient.get<Pet[]>(`/pets${queryString}`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error ?? 'Failed to fetch pets');
  },

  // Get user profile
  getUserProfile: async (): Promise<User> => {
    const response = await apiClient.get<User>('/users/me');
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error ?? 'Failed to fetch user profile');
  },

  // Update user profile
  updateUserProfile: async (profileData: Partial<User>): Promise<User> => {
    const response = await apiClient.put<User>('/users/me', profileData);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error ?? 'Failed to update user profile');
  },

  // Upload pet photos
  uploadPetPhotos: async (petId: string, photos: FormData): Promise<Pet> => {
    const response = await apiClient.post<Pet>(`/pets/${petId}/photos`, photos, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error ?? 'Failed to upload photos');
  },

  // Get pet details
  getPet: async (petId: string): Promise<Pet> => {
    const response = await apiClient.get<Pet>(`/pets/${petId}`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error ?? 'Failed to fetch pet');
  },

  // Create pet profile
  createPet: async (petData: Partial<Pet>): Promise<Pet> => {
    const response = await apiClient.post<Pet>('/pets', petData);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error ?? 'Failed to create pet');
  },

  // Update pet profile
  updatePet: async (petId: string, petData: Partial<Pet>): Promise<Pet> => {
    const response = await apiClient.put<Pet>(`/pets/${petId}`, petData);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error ?? 'Failed to update pet');
  },

  // Delete pet profile
  deletePet: async (petId: string): Promise<boolean> => {
    const response = await apiClient.delete<boolean>(`/pets/${petId}`);
    if (response.success) {
      return true;
    }
    throw new Error(response.error ?? 'Failed to delete pet');
  },

  // Get adoption applications
  getAdoptionApplications: async (): Promise<AdoptionApplication[]> => {
    const response = await apiClient.get<AdoptionApplication[]>('/adoption/applications');
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error ?? 'Failed to fetch adoption applications');
  },

  // Submit adoption application
  submitAdoptionApplication: async (applicationData: Omit<AdoptionApplication, '_id' | 'submittedAt' | 'applicant' | 'pet'>): Promise<AdoptionApplication> => {
    const response = await apiClient.post<AdoptionApplication>('/adoption/applications', applicationData);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error ?? 'Failed to submit adoption application');
  },

  // Get premium features
  getPremiumFeatures: async (): Promise<Record<string, boolean>> => {
    const response = await apiClient.get<Record<string, boolean>>('/premium/features');
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error ?? 'Failed to fetch premium features');
  },

  // Subscribe to premium
  subscribeToPremium: async (subscriptionData: { plan: 'basic' | 'premium' | 'gold'; paymentMethodId: string }): Promise<{ success: boolean; subscriptionId: string }> => {
    const response = await apiClient.post<{ success: boolean; subscriptionId: string }>('/premium/subscribe', subscriptionData);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error ?? 'Failed to subscribe to premium');
  },

  // Cancel premium subscription
  cancelPremiumSubscription: async (): Promise<boolean> => {
    const response = await apiClient.post<boolean>('/premium/cancel');
    if (response.success) {
      return true;
    }
    throw new Error(response.error ?? 'Failed to cancel premium subscription');
  },

  // Get user settings
  getUserSettings: async (): Promise<User['preferences']> => {
    const response = await apiClient.get<User['preferences']>('/users/settings');
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error ?? 'Failed to fetch user settings');
  },

  // Update user settings
  updateUserSettings: async (settings: User['preferences']): Promise<User['preferences']> => {
    const response = await apiClient.put<User['preferences']>('/users/settings', settings);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error ?? 'Failed to update user settings');
  },

  // Get notifications
  getNotifications: async (): Promise<Array<{ _id: string; type: string; title: string; message: string; read: boolean; createdAt: string }>> => {
    const response = await apiClient.get<Array<{ _id: string; type: string; title: string; message: string; read: boolean; createdAt: string }>>('/notifications');
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error ?? 'Failed to fetch notifications');
  },

  // Mark notification as read
  markNotificationAsRead: async (notificationId: string): Promise<boolean> => {
    const response = await apiClient.put<boolean>(`/notifications/${notificationId}/read`);
    if (response.success) {
      return true;
    }
    throw new Error(response.error ?? 'Failed to mark notification as read');
  },

  // Delete notification
  deleteNotification: async (notificationId: string): Promise<boolean> => {
    const response = await apiClient.delete<boolean>(`/notifications/${notificationId}`);
    if (response.success) {
      return true;
    }
    throw new Error(response.error ?? 'Failed to delete notification');
  },

  // Get app statistics
  getAppStatistics: async (): Promise<Record<string, number>> => {
    const response = await apiClient.get<Record<string, number>>('/stats');
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error ?? 'Failed to fetch app statistics');
  },

  // Report user or content
  reportContent: async (reportData: { type: 'user' | 'pet' | 'message'; targetId: string; reason: string; description?: string }): Promise<boolean> => {
    const response = await apiClient.post<boolean>('/reports', reportData);
    if (response.success) {
      return true;
    }
    throw new Error(response.error ?? 'Failed to submit report');
  },

  // Block user
  blockUser: async (userId: string): Promise<boolean> => {
    const response = await apiClient.post<boolean>('/users/block', { userId });
    if (response.success) {
      return true;
    }
    throw new Error(response.error ?? 'Failed to block user');
  },

  // Unblock user
  unblockUser: async (userId: string): Promise<boolean> => {
    const response = await apiClient.post<boolean>('/users/unblock', { userId });
    if (response.success) {
      return true;
    }
    throw new Error(response.error ?? 'Failed to unblock user');
  },

  // Get blocked users
  getBlockedUsers: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/users/blocked');
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error ?? 'Failed to fetch blocked users');
  },

  // Search pets
  searchPets: async (query: string, filters?: PetFilters): Promise<Pet[]> => {
    const params = new URLSearchParams({ q: query, ...(filters as Record<string, string>) });
    const response = await apiClient.get<Pet[]>(`/search/pets?${params.toString()}`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error ?? 'Failed to search pets');
  },

  // Get nearby pets
  getNearbyPets: async (latitude: number, longitude: number, radius?: number): Promise<Pet[]> => {
    const params = new URLSearchParams({
      lat: latitude.toString(),
      lng: longitude.toString(),
      ...(radius !== undefined && radius !== null && { radius: radius.toString() })
    });
    const response = await apiClient.get<Pet[]>(`/pets/nearby?${params.toString()}`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error ?? 'Failed to fetch nearby pets');
  },

  // Get pet compatibility
  getPetCompatibility: async (pet1Id: string, pet2Id: string): Promise<{ compatibility_score: number; factors: string[]; recommendation: string }> => {
    const response = await apiClient.get<{ compatibility_score: number; factors: string[]; recommendation: string }>(`/compatibility/${pet1Id}/${pet2Id}`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error ?? 'Failed to fetch pet compatibility');
  },

  // Get user activity
  getUserActivity: async (): Promise<Array<{ type: string; description: string; timestamp: string }>> => {
    const response = await apiClient.get<Array<{ type: string; description: string; timestamp: string }>>('/users/activity');
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error ?? 'Failed to fetch user activity');
  },

  // Get app version info
  getAppVersion: async (): Promise<{ version: string; build: string; environment: string }> => {
    const response = await apiClient.get<{ version: string; build: string; environment: string }>('/version');
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error ?? 'Failed to fetch app version');
  }
};

// Export the main API service instance
// AI Service API
export const aiAPI = {
  // Generate AI bio for pet
  generateBio: async (data: {
    petName: string;
    keywords: string[];
    tone?: 'playful' | 'professional' | 'casual' | 'romantic' | 'funny';
    length?: 'short' | 'medium' | 'long';
    petType?: string;
    age?: number;
    breed?: string;
  }): Promise<{
    bio: string;
    keywords: string[];
    sentiment: { score: number; label: string };
    matchScore: number;
  }> => {
    const response = await apiClient.post('/ai/generate-bio', data);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error ?? 'Failed to generate bio');
  },

  // Analyze pet photos
  analyzePhotos: async (photos: string[]): Promise<{
    breed_analysis: {
      primary_breed: string;
      confidence: number;
      secondary_breeds?: Array<{ breed: string; confidence: number }>;
    };
    health_assessment: {
      age_estimate: number;
      health_score: number;
      recommendations: string[];
    };
    photo_quality: {
      overall_score: number;
      lighting_score: number;
      composition_score: number;
      clarity_score: number;
    };
    matchability_score: number;
    ai_insights: string[];
  }> => {
    const response = await apiClient.post('/ai/analyze-photos', { photos });
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error ?? 'Failed to analyze photos');
  },

  // Enhanced compatibility analysis
  analyzeCompatibility: async (data: {
    pet1Id: string;
    pet2Id: string;
  }): Promise<{
    compatibility_score: number;
    ai_analysis: string;
    breakdown: {
      personality_compatibility: number;
      lifestyle_compatibility: number;
      activity_compatibility: number;
      social_compatibility: number;
      environment_compatibility: number;
    };
    recommendations: {
      meeting_suggestions: string[];
      activity_recommendations: string[];
      supervision_requirements: string[];
      success_probability: number;
    };
  }> => {
    const response = await apiClient.post('/ai/enhanced-compatibility', data);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error ?? 'Failed to analyze compatibility');
  },

  // Legacy compatibility (simpler version)
  getCompatibility: async (data: {
    pet1Id: string;
    pet2Id: string;
  }): Promise<{
    score: number;
    analysis: string;
    factors: {
      age_compatibility: boolean;
      size_compatibility: boolean;
      breed_compatibility: boolean;
      personality_match: boolean;
    };
  }> => {
    const response = await apiClient.post('/ai/compatibility', data);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error ?? 'Failed to get compatibility');
  },
};

export const api = {
  ...matchesAPI,
  ai: aiAPI,
};

// Export adoption API (alias for now, can be extended later)
export const adoptionAPI = matchesAPI;
