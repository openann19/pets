"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._useAnalyticsStore = void 0;
const zustand_1 = require("zustand");
const hooks_1 = require("../api/hooks");
exports._useAnalyticsStore = (0, zustand_1.create)()((set, get) => ({
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
            };
            set({ userAnalytics: analyticsData, isLoading: false });
        }
        catch {
            set({ error: 'Failed to fetch user analytics', isLoading: false });
        }
    },
    trackUserEvent: async (_eventType, _metadata) => {
        try {
            await (0, hooks_1.useTrackUserEvent)();
            // Refresh user analytics after tracking event
            get().fetchUserAnalytics();
        }
        catch {
            set({ error: 'Failed to track user event' });
        }
    },
    // Pet analytics
    fetchPetAnalytics: async (petId) => {
        set({ isLoading: true, error: null });
        try {
            // Mock analytics data since the API call doesn't return proper data
            const petData = {
                id: `pet-analytics-${petId}`,
                timestamp: new Date().toISOString(),
                data: { views: 89, likes: 34, superlikes: 12 }
            };
            set({
                petAnalytics: {
                    ...get().petAnalytics,
                    [petId]: petData
                },
                isLoading: false
            });
        }
        catch {
            set({ error: `Failed to fetch pet analytics for ${petId}`, isLoading: false });
        }
    },
    trackPetEvent: async (petId, _eventType, _metadata) => {
        try {
            await (0, hooks_1.useTrackPetEvent)();
            // Refresh pet analytics after tracking event
            get().fetchPetAnalytics(petId);
        }
        catch {
            set({ error: `Failed to track pet event for ${petId}` });
        }
    },
    // Match analytics
    fetchMatchAnalytics: async (matchId) => {
        set({ isLoading: true, error: null });
        try {
            // Mock analytics data since the API call doesn't return proper data
            const matchData = {
                id: `match-analytics-${matchId}`,
                timestamp: new Date().toISOString(),
                data: { messageCount: 42, responseTime: 15, lastActivity: new Date().toISOString() }
            };
            set({
                matchAnalytics: {
                    ...get().matchAnalytics,
                    [matchId]: matchData
                },
                isLoading: false
            });
        }
        catch {
            set({ error: `Failed to fetch match analytics for ${matchId}`, isLoading: false });
        }
    },
    trackMatchEvent: async (matchId, _eventType, _metadata) => {
        try {
            await (0, hooks_1.useTrackMatchEvent)();
            // Refresh match analytics after tracking event
            get().fetchMatchAnalytics(matchId);
        }
        catch {
            set({ error: `Failed to track match event for ${matchId}` });
        }
    },
}));
