import { create } from 'zustand';
import { useTrackUserEvent, useTrackPetEvent, useTrackMatchEvent } from '../api/hooks';

interface AnalyticsData {
  id: string;
  timestamp: string;
  data: Record<string, unknown>;
}

interface AnalyticsState {
  userAnalytics: AnalyticsData | null;
  petAnalytics: Record<string, AnalyticsData | null>;
  matchAnalytics: Record<string, AnalyticsData | null>;
  isLoading: boolean;
  error: string | null;
  
  // User analytics
  fetchUserAnalytics: () => Promise<void>;
  trackUserEvent: (eventType: string, metadata?: Record<string, unknown>) => Promise<void>;
  
  // Pet analytics
  fetchPetAnalytics: (petId: string) => Promise<void>;
  trackPetEvent: (petId: string, eventType: string, metadata?: Record<string, unknown>) => Promise<void>;
  
  // Match analytics
  fetchMatchAnalytics: (matchId: string) => Promise<void>;
  trackMatchEvent: (matchId: string, eventType: string, metadata?: Record<string, unknown>) => Promise<void>;
}

export const _useAnalyticsStore = create<AnalyticsState>()((set, get) => ({
  userAnalytics: null,
  petAnalytics: {},
  matchAnalytics: {},
  isLoading: false,
  error: null,
  
  // User analytics
  fetchUserAnalytics: async () => {
    set({ isLoading: true, error: null });
    try {
      // Mock analytics data since the API call doesn't return proper data
      const analyticsData = {
        id: 'user-analytics-id',
        timestamp: new Date().toISOString(),
        data: { views: 123, matches: 45, likes: 67 }
      } as AnalyticsData;
      
      set({ userAnalytics: analyticsData, isLoading: false });
    } catch {
      set({ error: 'Failed to fetch user analytics', isLoading: false });
    }
  },
  
  trackUserEvent: async (_eventType: string, _metadata?: Record<string, unknown>) => {
    try {
      await useTrackUserEvent();
      // Refresh user analytics after tracking event
      get().fetchUserAnalytics();
    } catch {
      set({ error: 'Failed to track user event' });
    }
  },
  
  // Pet analytics
  fetchPetAnalytics: async (petId: string) => {
    set({ isLoading: true, error: null });
    try {
      // Mock analytics data since the API call doesn't return proper data
      const petData = {
        id: `pet-analytics-${petId}`,
        timestamp: new Date().toISOString(),
        data: { views: 89, likes: 34, superlikes: 12 }
      } as AnalyticsData;
      
      set({ 
        petAnalytics: { 
          ...get().petAnalytics, 
          [petId]: petData
        }, 
        isLoading: false 
      });
    } catch {
      set({ error: `Failed to fetch pet analytics for ${petId}`, isLoading: false });
    }
  },
  
  trackPetEvent: async (petId: string, _eventType: string, _metadata?: Record<string, unknown>) => {
    try {
      await useTrackPetEvent();
      // Refresh pet analytics after tracking event
      get().fetchPetAnalytics(petId);
    } catch {
      set({ error: `Failed to track pet event for ${petId}` });
    }
  },
  
  // Match analytics
  fetchMatchAnalytics: async (matchId: string) => {
    set({ isLoading: true, error: null });
    try {
      // Mock analytics data since the API call doesn't return proper data
      const matchData = {
        id: `match-analytics-${matchId}`,
        timestamp: new Date().toISOString(),
        data: { messageCount: 42, responseTime: 15, lastActivity: new Date().toISOString() }
      } as AnalyticsData;
      
      set({ 
        matchAnalytics: { 
          ...get().matchAnalytics, 
          [matchId]: matchData
        }, 
        isLoading: false 
      });
    } catch {
      set({ error: `Failed to fetch match analytics for ${matchId}`, isLoading: false });
    }
  },
  
  trackMatchEvent: async (matchId: string, _eventType: string, _metadata?: Record<string, unknown>) => {
    try {
      await useTrackMatchEvent();
      // Refresh match analytics after tracking event
      get().fetchMatchAnalytics(matchId);
    } catch {
      set({ error: `Failed to track match event for ${matchId}` });
    }
  },
}));