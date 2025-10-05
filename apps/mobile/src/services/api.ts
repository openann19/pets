/**
 * API Service for PawfectMatch Mobile App
 * Handles all HTTP requests with proper error handling and typing
 */

interface Message {
  _id: string;
  content: string;
  senderId: string;
  timestamp: string;
  read: boolean;
  type: 'text' | 'image' | 'emoji';
  status?: 'sending' | 'sent' | 'failed';
}

interface Match {
  _id: string;
  petId: string;
  petName: string;
  petPhoto: string;
  ownerName: string;
  lastMessage?: {
    content: string;
    timestamp: string;
    senderId: string;
  };
  isOnline: boolean;
  matchedAt: string;
  unreadCount: number;
}

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiService {
  private async request<T>(
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
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Chat API
  async getMessages(matchId: string): Promise<Message[]> {
    try {
      return await this.request<Message[]>(`/chat/${matchId}/messages`);
    } catch (error) {
      console.error('Failed to get messages:', error);
      return [];
    }
  }

  async sendMessage(matchId: string, content: string): Promise<Message> {
    return await this.request<Message>(`/chat/${matchId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async markAsRead(matchId: string): Promise<void> {
    await this.request(`/chat/${matchId}/read`, {
      method: 'POST',
    });
  }

  // Matches API
  async getMatches(): Promise<Match[]> {
    try {
      return await this.request<Match[]>('/matches');
    } catch (error) {
      console.error('Failed to get matches:', error);
      return [];
    }
  }

  async createMatch(petId: string): Promise<Match> {
    return await this.request<Match>('/matches', {
      method: 'POST',
      body: JSON.stringify({ petId }),
    });
  }

  // User API
  async getUserProfile(userId: string) {
    return await this.request(`/users/${userId}`);
  }

  async updateUserProfile(data: any) {
    return await this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Pet API
  async getPets() {
    return await this.request('/pets');
  }

  async createPet(petData: any) {
    return await this.request('/pets', {
      method: 'POST',
      body: JSON.stringify(petData),
    });
  }

  // AI API
  async generateBio(petData: any) {
    return await this.request('/ai/bio', {
      method: 'POST',
      body: JSON.stringify(petData),
    });
  }

  async analyzePhoto(photoUri: string) {
    return await this.request('/ai/photo', {
      method: 'POST',
      body: JSON.stringify({ photoUri }),
    });
  }

  async getCompatibilityScore(pet1Id: string, pet2Id: string) {
    return await this.request(`/ai/compat/${pet1Id}/${pet2Id}`);
  }
}

// Export singleton instance
export const api = new ApiService();

// Export specific API modules for convenience
export const chatAPI = {
  getMessages: (matchId: string) => api.getMessages(matchId),
  sendMessage: (matchId: string, content: string) => api.sendMessage(matchId, content),
  markAsRead: (matchId: string) => api.markAsRead(matchId),
};

export const matchesAPI = {
  getMatches: () => api.getMatches(),
  createMatch: (petId: string) => api.createMatch(petId),
};

export const userAPI = {
  getProfile: (userId: string) => api.getUserProfile(userId),
  updateProfile: (data: any) => api.updateProfile(data),
};

// ✅ NEW: Adoption API module  
export const adoptionAPI = {
  getListings: async () => {
    return await api.request('/adoption/listings', { method: 'GET' });
  },
  getApplications: async () => {
    return await api.request('/adoption/applications', { method: 'GET' });
  },
  updateListingStatus: async (listingId: string, status: string) => {
    return await api.request(`/adoption/listings/${listingId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
  reviewApplication: async (applicationId: string, status: 'approved' | 'rejected') => {
    return await api.request(`/adoption/applications/${applicationId}/review`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  },
};

// ✅ NEW: AR Trails API module
export const arAPI = {
  getTrails: async (location: { latitude: number; longitude: number }, radius: number = 5) => {
    return await api.request(`/ar/trails?lat=${location.latitude}&lng=${location.longitude}&radius=${radius}`, {
      method: 'GET',
    });
  },
  recordTrailVisit: async (trailId: string) => {
    return await api.request(`/ar/trails/${trailId}/visit`, {
      method: 'POST',
    });
  },
};

export const petAPI = {
  getPets: () => api.getPets(),
  createPet: (petData: any) => api.createPet(petData),
};

export const aiAPI = {
  generateBio: (petData: any) => api.generateBio(petData),
  analyzePhoto: (photoUri: string) => api.analyzePhoto(photoUri),
  getCompatibilityScore: (pet1Id: string, pet2Id: string) => api.getCompatibilityScore(pet1Id, pet2Id),
};

export default api;
