/**
 * Premium Tier Service - Production Implementation
 * Integrates with backend API and Stripe for subscription management
 */

import { errorHandler } from '@pawfectmatch/core';
import { logger } from '../services/logger';

const API_BASE_URL: string = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:5000/api';

/**
 * Get auth token from localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

/**
 * Make an authenticated API request
 */
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const url = `${API_BASE_URL}${endpoint}`;
  const method = options.method || 'GET';

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  };

  const startTime = Date.now();

  try {
    const response: Response = await fetch(url, config);
    const duration = Date.now() - startTime;

    // Log API request using standard logger
    logger.info(`API ${method} ${endpoint} - ${response.status} (${duration}ms)`, {
      component: 'PremiumTierService',
      action: 'api_request',
      method,
      endpoint,
      status: response.status,
      duration
    });

    if (!response.ok) {
      const errorData: unknown = await response.json().catch(() => null);
      const message: string =
        errorData &&
          typeof errorData === 'object' &&
          errorData !== null &&
          ('message' in errorData || 'error' in errorData)
          ? ((errorData as { message?: string; error?: string }).message ??
            (errorData as { message?: string; error?: string }).error ??
            `API Error: ${response.status}`)
          : `API Error: ${response.status}`;

      const error = new Error(message);

      // Handle API error with centralized error handling
      errorHandler.handleApiError(
        error,
        {
          component: 'PremiumTierService',
          action: 'api_request',
          metadata: {
            endpoint,
            method,
            statusCode: response.status,
            duration,
          },
        },
        {
          endpoint,
          method,
          statusCode: response.status,
          showNotification: true,
        },
      );

      throw error;
    }

    return (await response.json()) as T;
  } catch (error) {
    const duration = Date.now() - startTime;

    if (error instanceof Error) {
      // Handle network errors
      if (error.message.includes('fetch') || error.message.includes('network')) {
        errorHandler.handleNetworkError(
          error,
          {
            component: 'PremiumTierService',
            action: 'api_request',
            metadata: {
              endpoint,
              method,
              duration,
            },
          },
          {
            showNotification: true,
            retryable: true,
          },
        );
      } else {
        // Handle other errors
        errorHandler.handleError(
          error,
          {
            component: 'PremiumTierService',
            action: 'api_request',
            metadata: {
              endpoint,
              method,
              duration,
            },
          },
          {
            showNotification: true,
            severity: 'high',
          },
        );
      }
    }

    throw error;
  }
}

export interface PremiumTier {
  id: string;
  name: string;
  price: number;
  interval?: 'monthly' | 'yearly';
  features: string[];
  isActive: boolean;
  stripeMonthlyPriceId: string;
  stripeYearlyPriceId: string;
}

export interface Subscription {
  id: string;
  userId: string;
  tierId: string;
  status: 'active' | 'cancelled' | 'expired' | 'past_due' | 'trialing';
  startDate: string;
  endDate: string;
  stripeSubscriptionId?: string;
  cancelAtPeriodEnd?: boolean;
  currentPeriodEnd?: string;
}

export interface SubscriptionUsage {
  swipesUsed: number;
  swipesLimit: number;
  superLikesUsed: number;
  superLikesLimit: number;
  boostsUsed: number;
  boostsLimit: number;
  periodStart: string;
  periodEnd: string;
}

export interface CheckoutSession {
  sessionId: string;
  url: string;
}

/**
 * Premium Tier Service
 * Manages premium subscriptions, tiers, and feature access
 */
export class PremiumTierService {
  private readonly tiers: PremiumTier[] = this.validateAndCreateTiers();

  /**
   * Validate environment variables and create tiers
   */
  private validateAndCreateTiers(): PremiumTier[] {
    const requiredEnvVars = [
      'NEXT_PUBLIC_STRIPE_PREMIUM_MONTHLY_PRICE_ID',
      'NEXT_PUBLIC_STRIPE_PREMIUM_YEARLY_PRICE_ID',
      'NEXT_PUBLIC_STRIPE_ULTIMATE_MONTHLY_PRICE_ID',
      'NEXT_PUBLIC_STRIPE_ULTIMATE_YEARLY_PRICE_ID',
    ];

    const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

    if (missingVars.length > 0) {
      // Handle missing environment variables with proper error handler
      const error = new Error(
        `Missing required Stripe environment variables: ${missingVars.join(', ')}`,
      );
      errorHandler.handleError(error, {
        component: 'PremiumTierService',
        action: 'validate_stripe_config',
        severity: 'critical',
        metadata: {
          missingVars,
        },
      });
      throw error;
    }

    return [
      {
        id: 'basic',
        name: 'Basic',
        price: 0,
        features: [
          '5 daily swipes',
          'Basic matching',
          'Standard chat',
          'Weather updates',
          'Community support',
        ],
        isActive: true,
        stripeMonthlyPriceId: '',
        stripeYearlyPriceId: '',
      },
      {
        id: 'premium',
        name: 'Premium',
        price: 9.99,
        interval: 'monthly',
        features: [
          'Unlimited swipes',
          'See who liked you',
          'Advanced filters',
          'Ad-free experience',
          'Advanced matching algorithm',
          'Priority in search results',
          'Read receipts',
          'Video calls',
        ],
        isActive: true,
        stripeMonthlyPriceId: process.env['NEXT_PUBLIC_STRIPE_PREMIUM_MONTHLY_PRICE_ID'] || '',
        stripeYearlyPriceId: process.env['NEXT_PUBLIC_STRIPE_PREMIUM_YEARLY_PRICE_ID'] || '',
      },
      {
        id: 'ultimate',
        name: 'Ultimate',
        price: 19.99,
        interval: 'monthly',
        features: [
          'All Premium features',
          'AI-powered recommendations',
          'Exclusive events access',
          'Priority support',
          'Profile boost',
          'Unlimited Super Likes',
          'Advanced analytics',
          'VIP status',
        ],
        isActive: true,
        stripeMonthlyPriceId: process.env['NEXT_PUBLIC_STRIPE_ULTIMATE_MONTHLY_PRICE_ID'] || '',
        stripeYearlyPriceId: process.env['NEXT_PUBLIC_STRIPE_ULTIMATE_YEARLY_PRICE_ID'] || '',
      },
    ];
  }

  /**
   * Get all available premium tiers
   */
  async getTiers(): Promise<PremiumTier[]> {
    try {
      // Try to fetch from API for dynamic pricing
      const response = await apiRequest<{
        success: boolean;
        data: { features: Record<string, string[]> };
      }>('/premium/features');

      if (
        response.success &&
        response.data !== null &&
        response.data !== undefined &&
        response.data.features
      ) {
        // Merge API features with local tier definitions
        return this.tiers.map((tier) => {
          const apiFeatures = response.data.features[tier.id];
          return {
            ...tier,
            features: apiFeatures ?? tier.features,
          };
        });
      }
    } catch (error) {
      logger.warn('Failed to fetch tiers from API, using local definitions', {
        component: 'PremiumTierService',
        action: 'get_tiers',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
    }

    return [...this.tiers];
  }

  /**
   * Get a specific tier by ID
   */
  async getTier(id: string): Promise<PremiumTier | null> {
    const tiers = await this.getTiers();
    return tiers.find((tier) => tier.id === id) ?? null;
  }

  /**
   * Get current user's subscription
   */
  async getUserSubscription(_userId?: string): Promise<Subscription | null> {
    try {
      const response = await apiRequest<{ success: boolean; data: { subscription: Subscription } }>(
        '/premium/subscription',
      );

      if (
        response.success &&
        response.data !== null &&
        response.data !== undefined &&
        response.data.subscription
      ) {
        return response.data.subscription;
      }

      return null;
    } catch (error) {
      if (error instanceof Error && 'status' in error && (error as { status: number }).status === 404) {
        // No subscription found
        logger.info('No subscription found for user', {
          component: 'PremiumTierService',
          action: 'get_user_subscription',
        });
        return null;
      }

      errorHandler.handleError(
        error instanceof Error ? error : new Error('Failed to fetch user subscription'),
        {
          component: 'PremiumTierService',
          action: 'get_user_subscription',
          severity: 'high',
        },
        {
          showNotification: true,
        },
      );

      throw error;
    }
  }

  /**
   * Get subscription usage statistics
   */
  async getSubscriptionUsage(_userId?: string): Promise<SubscriptionUsage | null> {
    try {
      const response = await apiRequest<{ success: boolean; data: SubscriptionUsage }>(
        '/premium/usage',
      );

      if (response.success && response.data !== null && response.data !== undefined) {
        return response.data;
      }

      return null;
    } catch (error) {
      errorHandler.handleError(
        error instanceof Error ? error : new Error('Failed to fetch subscription usage'),
        {
          component: 'PremiumTierService',
          action: 'get_subscription_usage',
          severity: 'medium',
        },
        {
          showNotification: false, // Don't show notification for usage stats
        },
      );

      return null;
    }
  }

  /**
   * Create a checkout session for subscription upgrade
   */
  async createCheckoutSession(
    tierId: string,
    interval: 'monthly' | 'yearly' = 'monthly',
  ): Promise<CheckoutSession> {
    try {
      const response = await apiRequest<{ success: boolean; data: CheckoutSession }>(
        '/premium/subscribe',
        {
          method: 'POST',
          body: JSON.stringify({
            plan: tierId,
            interval,
          }),
        },
      );

      if (response.success && response.data !== null && response.data !== undefined) {
        return response.data;
      }

      throw new Error('Failed to create checkout session');
    } catch (error) {
      errorHandler.handlePaymentError(
        error instanceof Error ? error : new Error('Failed to create checkout session'),
        {
          component: 'PremiumTierService',
          action: 'create_checkout_session',
          severity: 'high',
          metadata: {
            tierId,
            interval,
          },
        },
        {
          showNotification: true,
        },
      );

      throw error;
    }
  }

  /**
   * Upgrade user subscription
   */
  async upgradeSubscription(
    _userId: string,
    tierId: string,
    interval: 'monthly' | 'yearly' = 'monthly',
  ): Promise<CheckoutSession> {
    return await this.createCheckoutSession(tierId, interval);
  }

  /**
   * Cancel user subscription
   */
  async cancelSubscription(_userId?: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiRequest<{ success: boolean; message: string }>('/premium/cancel', {
        method: 'POST',
      });

      return response;
    } catch (error) {
      errorHandler.handlePaymentError(
        error instanceof Error ? error : new Error('Failed to cancel subscription'),
        {
          component: 'PremiumTierService',
          action: 'cancel_subscription',
          severity: 'high',
        },
        {
          showNotification: true,
        },
      );

      throw error;
    }
  }

  /**
   * Reactivate a cancelled subscription
   */
  async reactivateSubscription(_userId?: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiRequest<{ success: boolean; message: string }>(
        '/premium/reactivate',
        {
          method: 'POST',
        },
      );

      return response;
    } catch (error) {
      errorHandler.handlePaymentError(
        error instanceof Error ? error : new Error('Failed to reactivate subscription'),
        {
          component: 'PremiumTierService',
          action: 'reactivate_subscription',
          severity: 'high',
        },
        {
          showNotification: true,
        },
      );

      throw error;
    }
  }

  /**
   * Boost a pet's profile (premium feature)
   */
  async boostProfile(petId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiRequest<{ success: boolean; message: string }>(
        `/premium/boost/${petId}`,
        {
          method: 'POST',
        },
      );

      return response;
    } catch (error) {
      errorHandler.handleError(
        error instanceof Error ? error : new Error('Failed to boost profile'),
        {
          component: 'PremiumTierService',
          action: 'boost_profile',
          severity: 'high',
          metadata: {
            petId,
          },
        },
        {
          showNotification: true,
        },
      );

      throw error;
    }
  }

  /**
   * Get super likes balance
   */
  async getSuperLikesBalance(): Promise<number> {
    try {
      const response = await apiRequest<{ success: boolean; data: { superLikes: number } }>(
        '/premium/super-likes',
      );

      if (response.success && response.data !== null && response.data !== undefined) {
        return response.data.superLikes;
      }

      return 0;
    } catch (error) {
      errorHandler.handleError(
        error instanceof Error ? error : new Error('Failed to fetch super likes balance'),
        {
          component: 'PremiumTierService',
          action: 'get_super_likes_balance',
          severity: 'medium',
        },
        {
          showNotification: false, // Don't show notification for balance checks
        },
      );

      return 0;
    }
  }

  /**
   * Check if user has access to a specific feature
   */
  async hasFeatureAccess(userId: string, feature: string): Promise<boolean> {
    try {
      const subscription = await this.getUserSubscription(userId);

      if (subscription === null || subscription === undefined || subscription.status !== 'active') {
        return false;
      }

      const tier = await this.getTier(subscription.tierId);

      if (tier === null || tier === undefined) {
        return false;
      }

      // Check if feature is included in tier
      return tier.features.some((f) => f.toLowerCase().includes(feature.toLowerCase()));
    } catch (error) {
      errorHandler.handleError(
        error instanceof Error ? error : new Error('Failed to check feature access'),
        {
          component: 'PremiumTierService',
          action: 'check_feature_access',
          severity: 'medium',
          metadata: {
            userId,
            feature,
          },
        },
        {
          showNotification: false, // Don't show notification for feature checks
        },
      );

      return false;
    }
  }

  /**
   * Get tier by price ID (for webhook processing)
   */
  getTierByPriceId(priceId: string): PremiumTier | null {
    return (
      this.tiers.find(
        (tier) => tier.stripeMonthlyPriceId === priceId || tier.stripeYearlyPriceId === priceId,
      ) ?? null
    );
  }
}

export const premiumTierService = new PremiumTierService();
export default premiumTierService;
