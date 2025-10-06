import { apiClient } from '@pawfectmatch/core';

// API service for mobile app
export const matchesAPI = {
  // Get user's matches
  getMatches: async () => {
    try {
      // Use the core API client
      const response = await apiClient.get('/matches');
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch matches');
    } catch (error) {
      console.error('Error fetching matches:', error);
      throw error;
    }
  },

  // Get specific match details
  getMatch: async (matchId: string) => {
    try {
      const response = await apiClient.get(`/matches/${matchId}`);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch match');
    } catch (error) {
      console.error('Error fetching match:', error);
      throw error;
    }
  },

  // Create a new match (like/swipe)
  createMatch: async (petId: string, targetPetId: string) => {
    try {
      const response = await apiClient.post('/matches', { petId, targetPetId });
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to create match');
    } catch (error) {
      console.error('Error creating match:', error);
      throw error;
    }
  },

  // Get chat messages for a match
  getMessages: async (matchId: string) => {
    try {
      const response = await apiClient.get(`/chat/${matchId}`);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch messages');
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  // Send a message
  sendMessage: async (matchId: string, content: string) => {
    try {
      const response = await apiClient.post('/chat', { matchId, content });
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to send message');
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Get pets for swiping
  getPets: async (filters?: any) => {
    try {
      const queryString = filters ? `?${new URLSearchParams(filters).toString()}` : '';
      const response = await apiClient.get(`/pets${queryString}`);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch pets');
    } catch (error) {
      console.error('Error fetching pets:', error);
      throw error;
    }
  },

  // Get user profile
  getUserProfile: async () => {
    try {
      const response = await apiClient.get('/users/me');
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch user profile');
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  // Update user profile
  updateUserProfile: async (profileData: any) => {
    try {
      const response = await apiClient.put('/users/me', profileData);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to update user profile');
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  // Upload pet photos
  uploadPetPhotos: async (petId: string, photos: FormData) => {
    try {
      const response = await apiClient.post(`/pets/${petId}/photos`, photos, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to upload photos');
    } catch (error) {
      console.error('Error uploading photos:', error);
      throw error;
    }
  },

  // Get pet details
  getPet: async (petId: string) => {
    try {
      const response = await apiClient.get(`/pets/${petId}`);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch pet');
    } catch (error) {
      console.error('Error fetching pet:', error);
      throw error;
    }
  },

  // Create pet profile
  createPet: async (petData: any) => {
    try {
      const response = await apiClient.post('/pets', petData);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to create pet');
    } catch (error) {
      console.error('Error creating pet:', error);
      throw error;
    }
  },

  // Update pet profile
  updatePet: async (petId: string, petData: any) => {
    try {
      const response = await apiClient.put(`/pets/${petId}`, petData);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to update pet');
    } catch (error) {
      console.error('Error updating pet:', error);
      throw error;
    }
  },

  // Delete pet profile
  deletePet: async (petId: string) => {
    try {
      const response = await apiClient.delete(`/pets/${petId}`);
      if (response.success) {
        return true;
      }
      throw new Error('Failed to delete pet');
    } catch (error) {
      console.error('Error deleting pet:', error);
      throw error;
    }
  },

  // Get adoption applications
  getAdoptionApplications: async () => {
    try {
      const response = await apiClient.get('/adoption/applications');
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch adoption applications');
    } catch (error) {
      console.error('Error fetching adoption applications:', error);
      throw error;
    }
  },

  // Submit adoption application
  submitAdoptionApplication: async (applicationData: any) => {
    try {
      const response = await apiClient.post('/adoption/applications', applicationData);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to submit adoption application');
    } catch (error) {
      console.error('Error submitting adoption application:', error);
      throw error;
    }
  },

  // Get premium features
  getPremiumFeatures: async () => {
    try {
      const response = await apiClient.get('/premium/features');
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch premium features');
    } catch (error) {
      console.error('Error fetching premium features:', error);
      throw error;
    }
  },

  // Subscribe to premium
  subscribeToPremium: async (subscriptionData: any) => {
    try {
      const response = await apiClient.post('/premium/subscribe', subscriptionData);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to subscribe to premium');
    } catch (error) {
      console.error('Error subscribing to premium:', error);
      throw error;
    }
  },

  // Cancel premium subscription
  cancelPremiumSubscription: async () => {
    try {
      const response = await apiClient.post('/premium/cancel');
      if (response.success) {
        return true;
      }
      throw new Error('Failed to cancel premium subscription');
    } catch (error) {
      console.error('Error canceling premium subscription:', error);
      throw error;
    }
  },

  // Get user settings
  getUserSettings: async () => {
    try {
      const response = await apiClient.get('/users/settings');
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch user settings');
    } catch (error) {
      console.error('Error fetching user settings:', error);
      throw error;
    }
  },

  // Update user settings
  updateUserSettings: async (settings: any) => {
    try {
      const response = await apiClient.put('/users/settings', settings);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to update user settings');
    } catch (error) {
      console.error('Error updating user settings:', error);
      throw error;
    }
  },

  // Get notifications
  getNotifications: async () => {
    try {
      const response = await apiClient.get('/notifications');
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch notifications');
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  // Mark notification as read
  markNotificationAsRead: async (notificationId: string) => {
    try {
      const response = await apiClient.put(`/notifications/${notificationId}/read`);
      if (response.success) {
        return true;
      }
      throw new Error('Failed to mark notification as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  // Delete notification
  deleteNotification: async (notificationId: string) => {
    try {
      const response = await apiClient.delete(`/notifications/${notificationId}`);
      if (response.success) {
        return true;
      }
      throw new Error('Failed to delete notification');
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },

  // Get app statistics
  getAppStatistics: async () => {
    try {
      const response = await apiClient.get('/stats');
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch app statistics');
    } catch (error) {
      console.error('Error fetching app statistics:', error);
      throw error;
    }
  },

  // Report user or content
  reportContent: async (reportData: any) => {
    try {
      const response = await apiClient.post('/reports', reportData);
      if (response.success) {
        return true;
      }
      throw new Error('Failed to submit report');
    } catch (error) {
      console.error('Error submitting report:', error);
      throw error;
    }
  },

  // Block user
  blockUser: async (userId: string) => {
    try {
      const response = await apiClient.post('/users/block', { userId });
      if (response.success) {
        return true;
      }
      throw new Error('Failed to block user');
    } catch (error) {
      console.error('Error blocking user:', error);
      throw error;
    }
  },

  // Unblock user
  unblockUser: async (userId: string) => {
    try {
      const response = await apiClient.post('/users/unblock', { userId });
      if (response.success) {
        return true;
      }
      throw new Error('Failed to unblock user');
    } catch (error) {
      console.error('Error unblocking user:', error);
      throw error;
    }
  },

  // Get blocked users
  getBlockedUsers: async () => {
    try {
      const response = await apiClient.get('/users/blocked');
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch blocked users');
    } catch (error) {
      console.error('Error fetching blocked users:', error);
      throw error;
    }
  },

  // Search pets
  searchPets: async (query: string, filters?: any) => {
    try {
      const params = new URLSearchParams({ q: query, ...filters });
      const response = await apiClient.get(`/search/pets?${params.toString()}`);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to search pets');
    } catch (error) {
      console.error('Error searching pets:', error);
      throw error;
    }
  },

  // Get nearby pets
  getNearbyPets: async (latitude: number, longitude: number, radius?: number) => {
    try {
      const params = new URLSearchParams({
        lat: latitude.toString(),
        lng: longitude.toString(),
        ...(radius && { radius: radius.toString() })
      });
      const response = await apiClient.get(`/pets/nearby?${params.toString()}`);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch nearby pets');
    } catch (error) {
      console.error('Error fetching nearby pets:', error);
      throw error;
    }
  },

  // Get pet compatibility
  getPetCompatibility: async (pet1Id: string, pet2Id: string) => {
    try {
      const response = await apiClient.get(`/compatibility/${pet1Id}/${pet2Id}`);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch pet compatibility');
    } catch (error) {
      console.error('Error fetching pet compatibility:', error);
      throw error;
    }
  },

  // Get user activity
  getUserActivity: async () => {
    try {
      const response = await apiClient.get('/users/activity');
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch user activity');
    } catch (error) {
      console.error('Error fetching user activity:', error);
      throw error;
    }
  },

  // Get app version info
  getAppVersion: async () => {
    try {
      const response = await apiClient.get('/version');
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch app version');
    } catch (error) {
      console.error('Error fetching app version:', error);
      throw error;
    }
  }
};
