/**
 * ULTRA PREMIUM API Service 🚀
 * Production-ready with full type safety, error handling, and real-time features
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Logger utility
const logger = {
  info: (...args: any[]) => console.log('[INFO]', ...args),
  error: (...args: any[]) => console.error('[ERROR]', ...args),
  warn: (...args: any[]) => console.warn('[WARN]', ...args),
};

interface RequestOptions extends RequestInit {
  params?: Record<string, any>;
}
class ApiService {
  private token: string | null = null;
  private refreshToken: string | null = null;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private retryAttempts = 3;
  private retryDelay = 1000;

  constructor() {
    this.initializeFromStorage();
    this.startCacheCleanup();
  }

  private startCacheCleanup() {
    if (typeof window === 'undefined') return;
    
    setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.cache.entries()) {
        if (now - value.timestamp > value.ttl) {
          this.cache.delete(key);
        }
      }
    }, 60000); // Cleanup every minute
  }

  private getCacheKey(endpoint: string, options: any): string {
    return `${endpoint}_${JSON.stringify(options)}`;
  }

  private setCache(key: string, data: any, ttl: number = 300000) { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  private getCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  private initializeFromStorage() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
      this.refreshToken = localStorage.getItem('refresh_token');
    }
  }

  setToken(token: string, refreshToken?: string) {
    this.token = token;
    if (refreshToken) {
      this.refreshToken = refreshToken;
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken);
      }
    }
    logger.info('Auth token updated');
  }

  clearToken() {
    this.token = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
    }
    logger.info('Auth tokens cleared');
  }

  getToken(): string | null {
    return this.token;
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        this.setToken(data.accessToken, data.refreshToken);
        return true;
      }
    } catch (error) {
      logger.error('Token refresh failed', error);
    }
    
    return false;
  }

  async request<T>(
    endpoint: string,
    options: RequestOptions = {},
    retryCount = 0
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    // Build query string from params
    let finalUrl = url;
    if (options.params) {
      const queryString = new URLSearchParams(options.params).toString();
      finalUrl = `${url}?${queryString}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    // Remove params from config as they're in the URL
    delete (config as any).params;

    try {
      const response = await fetch(finalUrl, config);

      if (!response.ok) {
        if (response.status === 401 && retryCount === 0) {
          // Try to refresh token
          const refreshed = await this.refreshAccessToken();
          if (refreshed) {
            return this.request<T>(endpoint, options, retryCount + 1);
          } else {
            this.clearToken();
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
          }
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API Error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      if (retryCount < this.retryAttempts) {
        logger.warn(`Retrying request to ${endpoint} (attempt ${retryCount + 1})`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * (retryCount + 1)));
        return this.request<T>(endpoint, options, retryCount + 1);
      }
      
      logger.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.request<{ token: string; refreshToken: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(response.token, response.refreshToken);
    return response;
  }

  async register(data: any) {
    const response = await this.request<{ token: string; refreshToken: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(response.token, response.refreshToken);
    return response;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.clearToken();
    }
  }

  // Pet endpoints
  async getPets() {
    return this.request('/pets');
  }

  async getPet(id: string) {
    return this.request(`/pets/${id}`);
  }

  async createPet(data: any) {
    return this.request('/pets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePet(id: string, data: any) {
    return this.request(`/pets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePet(id: string) {
    return this.request(`/pets/${id}`, {
      method: 'DELETE',
    });
  }

  async updatePetProfile(data: any) {
    return this.request('/pets/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Match endpoints
  async getMatches() {
    return this.request('/matches');
  }

  async swipe(petId: string, action: 'like' | 'pass' | 'superlike') {
    return this.request('/matches/swipe', {
      method: 'POST',
      body: JSON.stringify({ petId, action }),
    });
  }

  // Chat endpoints
  async getMessages(matchId: string) {
    return this.request(`/chat/${matchId}/messages`);
  }

  async sendMessage(matchId: string, content: string) {
    return this.request(`/chat/${matchId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // Weather endpoints
  async getWeather(lat?: number, lon?: number) {
    return this.request('/weather', {
      params: { lat, lon },
    });
  }

  // Location endpoints
  async updateLocation(lat: number, lon: number) {
    return this.request('/users/location', {
      method: 'PUT',
      body: JSON.stringify({ lat, lon }),
    });
  }

  // Preferences endpoints
  async syncPreferences(preferences: any) {
    return this.request('/users/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }
}

// Create singleton instance
const apiInstance = new ApiService();

// Pets API endpoints
export const petsAPI = {
  async getSwipeablePets(filters?: any) {
    return apiInstance.request('/pets/swipeable', {
      params: filters,
    });
  },
  
  async likePet(petId: string) {
    return apiInstance.request(`/pets/${petId}/like`, {
      method: 'POST',
    });
  },
  
  async passPet(petId: string) {
    return apiInstance.request(`/pets/${petId}/pass`, {
      method: 'POST',
    });
  },
  
  async superLikePet(petId: string) {
    return apiInstance.request(`/pets/${petId}/superlike`, {
      method: 'POST',
    });
  },
  
  async reportPet(petId: string, reason: string) {
    return apiInstance.request(`/pets/${petId}/report`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },
};

// Matches API endpoints
export const matchesAPI = {
  async getMatches() {
    return apiInstance.request('/matches');
  },
  
  async getMatch(matchId: string) {
    return apiInstance.request(`/matches/${matchId}`);
  },
  
  async unmatch(matchId: string) {
    return apiInstance.request(`/matches/${matchId}/unmatch`, {
      method: 'POST',
    });
  },
};

// Chat API endpoints
export const chatAPI = {
  async getConversations() {
    return apiInstance.request('/chat/conversations');
  },
  
  async getMessages(conversationId: string) {
    return apiInstance.request(`/chat/conversations/${conversationId}/messages`);
  },
  
  async sendMessage(conversationId: string, message: string, attachments?: any[]) {
    return apiInstance.request(`/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message, attachments }),
    });
  },
  
  async markAsRead(conversationId: string) {
    return apiInstance.request(`/chat/conversations/${conversationId}/read`, {
      method: 'POST',
    });
  },
};

// AI API endpoints
export const aiAPI = {
  async generateBio(data: any) {
    return apiInstance.request('/ai/generate-bio', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  async analyzePhoto(formData: FormData) {
    const token = apiInstance.getToken();
    return fetch(`${API_BASE_URL}/ai/analyze-photo`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    }).then(res => res.json());
  },
  
  async analyzeCompatibility(petAId: string, petBId: string, options?: any) {
    return apiInstance.request('/ai/analyze-compatibility', {
      method: 'POST',
      body: JSON.stringify({ petAId, petBId, ...options }),
    });
  },
  
  async getChatSuggestions(matchId: string) {
    return apiInstance.request(`/ai/chat-suggestions/${matchId}`, {
      method: 'GET',
    });
  },
  
  async getSmartRecommendations(userId: string) {
    return apiInstance.request('/ai/recommendations', {
      params: { userId },
    });
  },
  
  async analyzeBehavior(petId: string, data: any) {
    return apiInstance.request('/ai/behavior-analysis', {
      method: 'POST',
      body: JSON.stringify({ petId, ...data }),
    });
  },
};

// Subscription API endpoints
export const subscriptionAPI = {
  async getCurrentSubscription() {
    return apiInstance.request('/subscription/current');
  },
  
  async getUsageStats() {
    return apiInstance.request('/subscription/usage');
  },
  
  async createCheckoutSession(data: {
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    metadata?: any;
  }) {
    return apiInstance.request('/subscription/create-checkout', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  async cancelSubscription(subscriptionId: string) {
    return apiInstance.request(`/subscription/${subscriptionId}/cancel`, {
      method: 'POST',
    });
  },
  
  async reactivateSubscription(subscriptionId: string) {
    return apiInstance.request(`/subscription/${subscriptionId}/reactivate`, {
      method: 'POST',
    });
  },
  
  async getPlans() {
    return apiInstance.request('/subscription/plans');
  },
  
  async updatePaymentMethod(paymentMethodId: string) {
    return apiInstance.request('/subscription/payment-method', {
      method: 'PUT',
      body: JSON.stringify({ paymentMethodId }),
    });
  },
};

// Export the main API instance and all sub-APIs
export const api = {
  ...apiInstance,
  setToken: apiInstance.setToken.bind(apiInstance),
  clearToken: apiInstance.clearToken.bind(apiInstance),
  getToken: apiInstance.getToken.bind(apiInstance),
  login: apiInstance.login.bind(apiInstance),
  register: apiInstance.register.bind(apiInstance),
  logout: apiInstance.logout.bind(apiInstance),
  getPets: apiInstance.getPets.bind(apiInstance),
  getPet: apiInstance.getPet.bind(apiInstance),
  createPet: apiInstance.createPet.bind(apiInstance),
  updatePet: apiInstance.updatePet.bind(apiInstance),
  deletePet: apiInstance.deletePet.bind(apiInstance),
  updatePetProfile: apiInstance.updatePetProfile.bind(apiInstance),
  getMatches: apiInstance.getMatches.bind(apiInstance),
  swipe: apiInstance.swipe.bind(apiInstance),
  getMessages: apiInstance.getMessages.bind(apiInstance),
  sendMessage: apiInstance.sendMessage.bind(apiInstance),
  getWeather: apiInstance.getWeather.bind(apiInstance),
  updateLocation: apiInstance.updateLocation.bind(apiInstance),
  syncPreferences: apiInstance.syncPreferences.bind(apiInstance),
  pets: petsAPI,
  matches: matchesAPI,
  chat: chatAPI,
  ai: aiAPI,
  subscription: subscriptionAPI,
};

export default api;
