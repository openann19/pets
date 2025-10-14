import { logger } from '@/services/logger';

interface UsageStats {
  swipesUsed: number;
  swipesLimit: number;
  superLikesUsed: number;
  superLikesLimit: number;
  boostsUsed: number;
  boostsLimit: number;
  profileViews: number;
  messagesSent: number;
  matchRate: number;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}

// Base API URL from environment variable
const API_BASE_URL: string = process.env['NEXT_PUBLIC_API_URL'] ?? '/api';

/**
 * Generic fetch wrapper for usage endpoints
 */
async function fetchUsageApi<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token && token.length > 0) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({ message: undefined }))) as {
      message?: string;
    };
    throw new Error(errorData.message ?? `API error: ${response.status.toString()}`);
  }

  return (await response.json()) as ApiResponse<T>;
}

// Use individual functions instead of class with static methods
export const UsageTrackingService = {
  /**
   * Track a swipe action
   */
  async trackSwipe(
    userId: string,
    petId: string,
    action: 'like' | 'pass' | 'superlike',
  ): Promise<boolean> {
    try {
      const response = await fetchUsageApi<{ success: boolean }>('/usage/swipe', {
        method: 'POST',
        body: JSON.stringify({ userId, petId, action }),
      });
      return response.success;
    } catch (error) {
      logger.error('Failed to track swipe', {
        error: error instanceof Error ? error : new Error('Failed to track swipe'),
        component: 'UsageTrackingService',
        action: 'trackSwipe',
        metadata: { userId, petId, action },
        endpoint: '/usage/swipe',
        method: 'POST',
      });
      return false;
    }
  },

  /**
   * Track a super like action
   */
  async trackSuperLike(userId: string, petId: string): Promise<boolean> {
    try {
      const response = await fetchUsageApi<{ success: boolean }>('/usage/superlike', {
        method: 'POST',
        body: JSON.stringify({ userId, petId }),
      });
      return response.success;
    } catch (error) {
      logger.error('Failed to track super like', {
        error: error instanceof Error ? error : new Error('Failed to track super like'),
        component: 'UsageTrackingService',
        action: 'trackSuperLike',
        metadata: { userId, petId },
        endpoint: '/usage/superlike',
        method: 'POST',
      });
      return false;
    }
  },

  /**
   * Track a boost action
   */
  async trackBoost(userId: string): Promise<boolean> {
    try {
      const response = await fetchUsageApi<{ success: boolean }>('/usage/boost', {
        method: 'POST',
        body: JSON.stringify({ userId }),
      });
      return response.success;
    } catch (error) {
      logger.error('Failed to track boost', {
        error: error instanceof Error ? error : new Error('Failed to track boost'),
        component: 'UsageTrackingService',
        action: 'trackBoost',
        metadata: { userId },
        endpoint: '/usage/boost',
        method: 'POST',
      });
      return false;
    }
  },

  /**
   * Get usage stats for user
   */
  async getUsageStats(userId: string): Promise<UsageStats | null> {
    try {
      const response = await fetchUsageApi<UsageStats>(
        `/usage/stats?userId=${encodeURIComponent(userId)}`,
      );

      if (response.success && response.data) {
        return response.data;
      }

      return null;
    } catch (error) {
      logger.error('Failed to get usage stats', {
        error: error instanceof Error ? error : new Error('Failed to get usage stats'),
        component: 'UsageTrackingService',
        action: 'getUsageStats',
        metadata: { userId },
        endpoint: '/usage/stats',
        method: 'GET',
      });
      return null;
    }
  }
}

export default UsageTrackingService;
