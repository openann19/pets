/**
 * Premium Service for PawfectMatch
 * Handles subscription status checking and premium feature gating
 */
import { logger } from '@pawfectmatch/core';
import { api } from './api';

export interface SubscriptionStatus {
  isActive: boolean;
  plan: string;
  features: string[];
  expiresAt?: string;
  autoRenew: boolean;
}

export interface PremiumLimits {
  swipesPerDay: number;
  likesPerDay: number;
  superLikesPerDay: number;
  canUndoSwipes: boolean;
  canSeeWhoLiked: boolean;
  canBoostProfile: boolean;
  advancedFilters: boolean;
  priorityMatching: boolean;
}

class PremiumService {
  private static readonly SUBSCRIPTION_CACHE_KEY = 'premium_subscription_cache';
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Check if user has active premium subscription
   */
  async hasActiveSubscription(): Promise<boolean> {
    try {
      const status = await this.getSubscriptionStatus();
      return status.isActive;
    } catch (error) {
      logger.error('Failed to check premium status', { error });
      return false; // Default to free tier on error
    }
  }

  /**
   * Get detailed subscription status
   */
  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    try {
      // Check cache first
      const cached = await this.getCachedStatus();
      if (cached && this.isCacheValid(cached.timestamp)) {
        return cached.status;
      }

      // Fetch from API
      const response = await api.request('/subscription/status');

      const status: SubscriptionStatus = {
        isActive: response.isActive || false,
        plan: response.plan || 'free',
        features: response.features || [],
        expiresAt: response.expiresAt,
        autoRenew: response.autoRenew || false,
      };

      // Cache the result
      await this.cacheStatus(status);

      logger.info('Subscription status fetched', { plan: status.plan, isActive: status.isActive });
      return status;
    } catch (error) {
      logger.error('Failed to get subscription status', { error });

      // Return free tier as fallback
      return {
        isActive: false,
        plan: 'free',
        features: [],
        autoRenew: false,
      };
    }
  }

  /**
   * Get premium limits based on subscription status
   */
  async getPremiumLimits(): Promise<PremiumLimits> {
    try {
      const status = await this.getSubscriptionStatus();

      if (status.isActive) {
        // Premium user limits
        return {
          swipesPerDay: -1, // unlimited
          likesPerDay: -1, // unlimited
          superLikesPerDay: -1, // unlimited
          canUndoSwipes: true,
          canSeeWhoLiked: true,
          canBoostProfile: true,
          advancedFilters: true,
          priorityMatching: true,
        };
      } else {
        // Free user limits
        return {
          swipesPerDay: 50,
          likesPerDay: 25,
          superLikesPerDay: 3,
          canUndoSwipes: false,
          canSeeWhoLiked: false,
          canBoostProfile: false,
          advancedFilters: false,
          priorityMatching: false,
        };
      }
    } catch (error) {
      logger.error('Failed to get premium limits', { error });

      // Return conservative free limits on error
      return {
        swipesPerDay: 25, // Reduced on error
        likesPerDay: 10,
        superLikesPerDay: 1,
        canUndoSwipes: false,
        canSeeWhoLiked: false,
        canBoostProfile: false,
        advancedFilters: false,
        priorityMatching: false,
      };
    }
  }

  /**
   * Check if specific feature is available
   */
  async canUseFeature(feature: keyof PremiumLimits): Promise<boolean> {
    try {
      const limits = await this.getPremiumLimits();

      // For unlimited features (-1), always return true for premium users
      if (limits[feature] === -1) {
        const status = await this.getSubscriptionStatus();
        return status.isActive;
      }

      // For limited features, check usage against limits
      // This would need additional API calls to check current usage
      // For now, just return based on subscription status
      const status = await this.getSubscriptionStatus();
      return status.isActive;
    } catch (error) {
      logger.error('Failed to check feature access', { feature, error });
      return false; // Conservative approach
    }
  }

  /**
   * Track premium feature usage
   */
  async trackUsage(feature: string, metadata?: Record<string, unknown>): Promise<void> {
    try {
      await api.request('/analytics/premium-usage', {
        method: 'POST',
        body: JSON.stringify({
          feature,
          timestamp: new Date().toISOString(),
          metadata,
        }),
      });
    } catch (error) {
      logger.error('Failed to track premium usage', { feature, error });
      // Don't throw - tracking failures shouldn't break features
    }
  }

  /**
   * Clear cached subscription status
   */
  async clearCache(): Promise<void> {
    try {
      // This would need to be implemented with AsyncStorage or similar
      // For now, just log the intent
      logger.info('Premium cache cleared');
    } catch (error) {
      logger.error('Failed to clear premium cache', { error });
    }
  }

  // Private helper methods

  private async getCachedStatus(): Promise<{ status: SubscriptionStatus; timestamp: number } | null> {
    try {
      // This would use AsyncStorage or similar in React Native
      // For web, could use localStorage
      // Implementation depends on platform
      return null; // Not implemented yet
    } catch (error) {
      return null;
    }
  }

  private async cacheStatus(status: SubscriptionStatus): Promise<void> {
    try {
      // Implementation depends on platform (AsyncStorage for mobile, localStorage for web)
      // For now, just log the intent
      logger.debug('Subscription status cached', { plan: status.plan });
    } catch (error) {
      logger.error('Failed to cache subscription status', { error });
    }
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < PremiumService.CACHE_DURATION;
  }
}

// Export singleton instance
export const premiumService = new PremiumService();
export default premiumService;
