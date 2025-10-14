/**
 * API Service for PawfectMatch Mobile App
 * Handles all HTTP requests with proper error handling and typing
 */
import type {
  PetFilters
} from '@pawfectmatch/core';
import { logger } from '@pawfectmatch/core';
import type {
  AIBioResponse,
  AICompatibilityResponse,
  AIPhotoAnalysisResponse,
  CheckoutSessionResponse,
  MatchResponse,
  MessageResponse,
  NotificationSettingsResponse,
  PetCreateResponse,
  SubscriptionPlansResponse,
  SubscriptionResponse,
  SwipeResponse,
  UsageStatsResponse,
  UserProfileResponse
} from '@pawfectmatch/core/dist/types/api-responses';

const BASE_URL = process.env['EXPO_PUBLIC_API_URL'] || (__DEV__ ? 'http://localhost:3001/api' : 'https://api.pawfectmatch.com/api');

class ApiService {
  public async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      logger.error(`API request failed: ${endpoint}`, { error });
      throw error;
    }
  }

  // Chat API
  async getMessages(matchId: string): Promise<MessageResponse[]> {
    try {
      return await this.request<MessageResponse[]>(`/chat/${matchId}/messages`);
    } catch (error) {
      if (__DEV__) {
        logger.error('Failed to get messages:', error);
      }
      return [];
    }
  }

  async sendMessage(matchId: string, content: string, messageType: 'text' | 'image' = 'text'): Promise<MessageResponse> {
    const payload: any = { content };
    if (messageType !== 'text') {
      payload.messageType = messageType;
    }
    return await this.request<MessageResponse>(`/chat/${matchId}/messages`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async markAsRead(matchId: string): Promise<void> {
    await this.request(`/chat/${matchId}/read`, {
      method: 'POST',
    });
  }

  // Matches API
  async getMatches(filters?: PetFilters): Promise<MatchResponse[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.species) params.append('species', filters.species);
      if (filters?.minAge) params.append('minAge', filters.minAge.toString());
      if (filters?.maxAge) params.append('maxAge', filters.maxAge.toString());
      if (filters?.size) params.append('size', filters.size);
      if (filters?.intent) params.append('intent', filters.intent);
      if (filters?.maxDistance) params.append('maxDistance', filters.maxDistance.toString());
      if (filters?.personalityTags?.length) {
        params.append('personalityTags', filters.personalityTags.join(','));
      }

      const queryString = params.toString();
      const endpoint = queryString ? `/matches?${queryString}` : '/matches';

      return await this.request<MatchResponse[]>(endpoint);
    } catch (error) {
      logger.error('Failed to get matches', { error });
      return [];
    }
  }

  async createMatch(petId: string): Promise<MatchResponse> {
    return await this.request<MatchResponse>('/matches', {
      method: 'POST',
      body: JSON.stringify({ petId }),
    });
  }

  async swipePet(petId: string, action: 'like' | 'pass' | 'superlike'): Promise<SwipeResponse> {
    return await this.request<SwipeResponse>(`/pets/${petId}/swipe`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
  }

  // Subscription API (matches web implementation)
  async getCurrentSubscription(): Promise<SubscriptionResponse | null> {
    try {
      return await this.request<SubscriptionResponse>('/subscription/current');
    } catch (error) {
      logger.error('Failed to get subscription', { error });
      return null;
    }
  }

  async getUsageStats(): Promise<UsageStatsResponse | null> {
    try {
      return await this.request<UsageStatsResponse>('/subscription/usage');
    } catch (error) {
      logger.error('Failed to get usage stats', { error });
      return null;
    }
  }

  async createCheckoutSession(data: {
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, unknown>;
  }): Promise<CheckoutSessionResponse> {
    return await this.request<CheckoutSessionResponse>('/subscription/create-checkout', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async cancelSubscription(subscriptionId: string): Promise<SubscriptionResponse> {
    return await this.request<SubscriptionResponse>(`/subscription/${subscriptionId}/cancel`, {
      method: 'POST',
    });
  }

  async reactivateSubscription(subscriptionId: string): Promise<SubscriptionResponse> {
    return await this.request<SubscriptionResponse>(`/subscription/${subscriptionId}/reactivate`, {
      method: 'POST',
    });
  }

  async getPlans(): Promise<SubscriptionPlansResponse> {
    try {
      return await this.request<SubscriptionPlansResponse>('/subscription/plans');
    } catch (error) {
      logger.error('Failed to get plans', { error });
      return { plans: [] };
    }
  }

  async updatePaymentMethod(paymentMethodId: string) {
    return await this.request('/subscription/payment-method', {
      method: 'PUT',
      body: JSON.stringify({ paymentMethodId }),
    });
  }

  // Notification Settings
  async getNotificationSettings(): Promise<NotificationSettingsResponse | null> {
    try {
      return await this.request<NotificationSettingsResponse>('/notifications/settings');
    } catch (error) {
      if (__DEV__) {
        logger.error('Failed to get notification settings:', error);
      }
      return null;
    }
  }

  async updateNotificationSettings(settings: Partial<NotificationSettingsResponse>): Promise<NotificationSettingsResponse> {
    return await this.request<NotificationSettingsResponse>('/notifications/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // User API
  async getCurrentUser(): Promise<UserProfileResponse | null> {
    try {
      return await this.request<UserProfileResponse>('/user/me');
    } catch (error) {
      if (__DEV__) {
        logger.error('Failed to get current user:', error);
      }
      return null;
    }
  }

  async updateUserProfile(profileData: Partial<UserProfileResponse>): Promise<UserProfileResponse> {
    return await this.request<UserProfileResponse>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async updateDeviceToken(token: string): Promise<{ success: boolean }> {
    return await this.request<{ success: boolean }>('/user/device-token', {
      method: 'PUT',
      body: JSON.stringify({ token }),
    });
  }

  async getUserProfile(userId: string): Promise<UserProfileResponse | null> {
    try {
      return await this.request<UserProfileResponse>(`/users/${userId}/profile`);
    } catch (error) {
      if (__DEV__) {
        logger.error(`Failed to get profile for user ${userId}:`, error);
      }
      return null;
    }
  }

  // Match Actions
  async performMatchAction(matchId: string, action: string) {
    return await this.request(`/matches/${matchId}/action`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
  }

  // Pets API
  async getPets(): Promise<PetCreateResponse[]> {
    try {
      return await this.request<PetCreateResponse[]>('/pets');
    } catch (error) {
      if (__DEV__) {
        logger.error('Failed to get pets:', error);
      }
      return [];
    }
  }

  async createPet(petData: Record<string, unknown>): Promise<PetCreateResponse> {
    return await this.request<PetCreateResponse>('/pets', {
      method: 'POST',
      body: JSON.stringify(petData),
    });
  }

  // AI Features
  async generateBio(petData: Record<string, unknown>): Promise<AIBioResponse> {
    return await this.request<AIBioResponse>('/ai/generate-bio', {
      method: 'POST',
      body: JSON.stringify(petData),
    });
  }

  async analyzePhoto(photoUri: string): Promise<AIPhotoAnalysisResponse> {
    // This would typically involve a multipart/form-data upload
    // For simplicity, we'll assume a base64 string is sent
    return await this.request<AIPhotoAnalysisResponse>('/ai/analyze-photo', {
      method: 'POST',
      body: JSON.stringify({ photo: photoUri }),
    });
  }

  async getCompatibilityScore(pet1Id: string, pet2Id: string): Promise<AICompatibilityResponse> {
    return await this.request<AICompatibilityResponse>('/ai/compatibility', {
      method: 'POST',
      body: JSON.stringify({ pet1Id, pet2Id }),
    });
  }

  // Analytics
  async trackUserEvent(eventType: string, metadata: Record<string, unknown> = {}) {
    return await this.request('/analytics/event', {
      method: 'POST',
      body: JSON.stringify({ type: 'user', eventType, metadata }),
    });
  }

  async trackPetEvent(petId: string, eventType: string, metadata: Record<string, unknown> = {}) {
    return await this.request('/analytics/event', {
      method: 'POST',
      body: JSON.stringify({ type: 'pet', petId, eventType, metadata }),
    });
  }

  async trackMatchEvent(matchId: string, eventType: string, metadata: Record<string, unknown> = {}) {
    return await this.request('/analytics/event', {
      method: 'POST',
      body: JSON.stringify({ type: 'match', matchId, eventType, metadata }),
    });
  }

  async getUserAnalytics() {
    return await this.request('/analytics/user');
  }

  async getPetAnalytics(petId: string) {
    return await this.request(`/analytics/pet/${petId}`);
  }

  async getMatchAnalytics(matchId: string) {
    return await this.request(`/analytics/match/${matchId}`);
  }
}

// Export singleton instance
export const api = new ApiService();

// Export specific API modules for convenience
export const _chatAPI = {
  getMessages: (matchId: string) => api.getMessages(matchId),
  sendMessage: (matchId: string, content: string, messageType?: 'text' | 'image') => api.sendMessage(matchId, content, messageType),
  markAsRead: (matchId: string) => api.markAsRead(matchId),
};

export const _matchesAPI = {
  getMatches: (filters?: PetFilters) => api.getMatches(filters),
  createMatch: (petId: string) => api.createMatch(petId),
};

export const _subscriptionAPI = {
  getCurrentSubscription: () => api.getCurrentSubscription(),
  getUsageStats: () => api.getUsageStats(),
  createCheckoutSession: (data: {
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, unknown>;
  }) => api.createCheckoutSession(data),
  cancelSubscription: (subscriptionId: string) => api.cancelSubscription(subscriptionId),
  reactivateSubscription: (subscriptionId: string) => api.reactivateSubscription(subscriptionId),
  getPlans: () => api.getPlans(),
  updatePaymentMethod: (paymentMethodId: string) => api.updatePaymentMethod(paymentMethodId),
};

export const _userAPI = {
  getProfile: (userId: string) => api.getUserProfile(userId),
  updateProfile: (data: Record<string, unknown>) => api.updateUserProfile(data),
};

export const _petAPI = {
  getPets: () => api.getPets(),
  createPet: (petData: Record<string, unknown>) => api.createPet(petData),
};

export const _aiAPI = {
  generateBio: (petData: Record<string, unknown>) => api.generateBio(petData),
  analyzePhoto: (photoUri: string) => api.analyzePhoto(photoUri),
  getCompatibilityScore: (pet1Id: string, pet2Id: string) => api.getCompatibilityScore(pet1Id, pet2Id),
  analyzeCompatibility: (pet1Id: string, pet2Id: string, options?: Record<string, unknown>) =>
    api.request(`/ai/compatibility/${pet1Id}/${pet2Id}`, {
      method: 'POST',
      body: JSON.stringify(options || {}),
    }),
};

export const _analyticsAPI = {
  trackUserEvent: (eventType: string, metadata: Record<string, unknown> = {}) => api.trackUserEvent(eventType, metadata),
  trackPetEvent: (petId: string, eventType: string, metadata: Record<string, unknown> = {}) => api.trackPetEvent(petId, eventType, metadata),
  trackMatchEvent: (matchId: string, eventType: string, metadata: Record<string, unknown> = {}) => api.trackMatchEvent(matchId, eventType, metadata),
  getUserAnalytics: () => api.getUserAnalytics(),
  getPetAnalytics: (petId: string) => api.getPetAnalytics(petId),
  getMatchAnalytics: (matchId: string) => api.getMatchAnalytics(matchId),
};

// Admin API namespace
export const _adminAPI = {
  // User Management
  getUsers: async (params: { page?: number; limit?: number; search?: string; sort?: string; order?: string } = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.order) queryParams.append('order', params.order);

    return await api.request(`/admin/users?${queryParams.toString()}`);
  },

  suspendUser: async (userId: string) => await api.request(`/admin/users/${userId}/suspend`, {
    method: 'POST',
  }),

  activateUser: async (userId: string) => await api.request(`/admin/users/${userId}/activate`, {
    method: 'POST',
  }),

  banUser: async (userId: string) => await api.request(`/admin/users/${userId}/ban`, {
    method: 'POST',
  }),

  unbanUser: async (userId: string) => await api.request(`/admin/users/${userId}/unban`, {
    method: 'POST',
  }),

  // Analytics
  getAnalytics: async (params?: { period?: string }) => {
    const query = params?.period ? `?period=${params.period}` : '';
    return await api.request(`/admin/analytics${query}`);
  },

  getSystemHealth: async () => await api.request('/admin/system-health'),

  // Security
  getSecurityAlerts: async (params?: { page?: number; limit?: number; sort?: string; order?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sort) queryParams.append('sort', params.sort);
    if (params?.order) queryParams.append('order', params.order);
    const query = queryParams.toString();
    return await api.request(`/admin/security/alerts${query ? `?${query}` : ''}`);
  },

  getSecurityMetrics: async () => await api.request('/admin/security/metrics'),

  resolveSecurityAlert: async (alertId: string) => await api.request(`/admin/security/alerts/${alertId}/resolve`, {
    method: 'POST',
  }),

  blockIPAddress: async (ipAddress: string) => await api.request('/admin/security/block-ip', {
    method: 'POST',
    body: JSON.stringify({ ipAddress }),
  }),

  // Billing
  getSubscriptions: async (params?: { page?: number; limit?: number; sort?: string; order?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sort) queryParams.append('sort', params.sort);
    if (params?.order) queryParams.append('order', params.order);
    const query = queryParams.toString();
    return await api.request(`/admin/billing/subscriptions${query ? `?${query}` : ''}`);
  },

  getBillingMetrics: async () => await api.request('/admin/billing/metrics'),

  cancelSubscription: async (subscriptionId: string) => await api.request(`/admin/billing/subscriptions/${subscriptionId}/cancel`, {
    method: 'POST',
  }),

  reactivateSubscription: async (subscriptionId: string) => await api.request(`/admin/billing/subscriptions/${subscriptionId}/reactivate`, {
    method: 'POST',
  }),

  // Chat Moderation
  getChatMessages: async (params: { filter?: string; search?: string; limit?: number } = {}) => {
    const queryParams = new URLSearchParams();
    if (params.filter) queryParams.append('filter', params.filter);
    if (params.search) queryParams.append('search', params.search);
    if (params.limit) queryParams.append('limit', params.limit.toString());

    return await api.request(`/admin/chats/messages?${queryParams.toString()}`);
  },

  moderateMessage: async (data: { messageId: string; action: string; reason?: string }) =>
    await api.request('/admin/chats/moderate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Upload Management
  getUploads: async (params: { filter?: string; search?: string; limit?: number } = {}) => {
    const queryParams = new URLSearchParams();
    if (params.filter) queryParams.append('filter', params.filter);
    if (params.search) queryParams.append('search', params.search);
    if (params.limit) queryParams.append('limit', params.limit.toString());

    return await api.request(`/admin/uploads?${queryParams.toString()}`);
  },

  moderateUpload: async (data: { uploadId: string; action: string; reason?: string }) =>
    await api.request('/admin/uploads/moderate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Verification Management
  getVerifications: async (params: { filter?: string; search?: string; limit?: number } = {}) => {
    const queryParams = new URLSearchParams();
    if (params.filter) queryParams.append('filter', params.filter);
    if (params.search) queryParams.append('search', params.search);
    if (params.limit) queryParams.append('limit', params.limit.toString());

    return await api.request(`/admin/verifications?${queryParams.toString()}`);
  },

  processVerification: async (data: { verificationId: string; action: string; reason?: string }) =>
    await api.request('/admin/verifications/process', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Analytics API
export const analyticsAPI = {
  trackUserEvent: async (eventName: string, data: Record<string, unknown>) => {
    try {
      return await api.request('/analytics/events', {
        method: 'POST',
        body: JSON.stringify({ eventName, data }),
      });
    } catch (error) {
      logger.error('Failed to track analytics event', { error, eventName });
    }
  },
};

export default api;
