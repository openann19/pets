import api from '../services/api';

// Re-export the API service as apiClient for compatibility
// Add stub WebSocket methods to prevent runtime errors
const apiClient = {
  ...api,
  // Stub WebSocket methods (will be implemented later)
  connectWebSocket: (userId: string) => {
    console.warn('[WebSocket] Not yet implemented - userId:', userId);
    return null;
  },
  disconnectWebSocket: () => {
    console.warn('[WebSocket] Not yet implemented');
  },
};

export default apiClient;
