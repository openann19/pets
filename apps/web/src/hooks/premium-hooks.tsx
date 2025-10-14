/**
 * 💎 PHASE 3: Premium Feature Hooks
 * React hooks for video calls, analytics, and premium tier management
 */

import { useState, useCallback, useEffect } from 'react'
import { logger } from '@pawfectmatch/core';
;
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { _videoCallService } from '../lib/video-communication';
import type { VideoCallConfig } from '../lib/video-communication';
import { PremiumTierService } from '../lib/premium-tier-service';
import analyticsService from '../services/AnalyticsService';

// Types
interface Subscription {
  id: string;
  tierId: string;
  tier?: string;
  status: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

interface PremiumTier {
  id: string;
  name: string;
  interval?: 'monthly' | 'yearly';
  features: string[];
  price?: number;
}

// Create service instance
const premiumTierService = new PremiumTierService();

/**
 * Hook for video call management
 */
export function useVideoCall(roomId: string, userId: string) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCall = useCallback(
    async (config: Omit<VideoCallConfig, 'roomId' | 'userId'>) => {
      try {
        const stream = await _videoCallService.initializeCall({
          roomId,
          userId,
          ...config,
        });
        setLocalStream(stream);
        setIsConnected(true);
        setError(null);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to start call';
        setError(message);
        logger.error('Failed to start call:', { error });
      }
    },
    [roomId, userId],
  );

  const endCall = useCallback(() => {
    _videoCallService.endCall();
    setLocalStream(null);
    setIsConnected(false);
    setIsVideoEnabled(true);
    setIsAudioEnabled(true);
    setIsScreenSharing(false);
  }, []);

  const toggleVideo = useCallback(() => {
    _videoCallService.toggleVideo(!isVideoEnabled);
    setIsVideoEnabled((prev) => !prev);
  }, [isVideoEnabled]);

  const toggleAudio = useCallback(() => {
    _videoCallService.toggleAudio(!isAudioEnabled);
    setIsAudioEnabled((prev) => !prev);
  }, [isAudioEnabled]);

  const startScreenShare = useCallback(async () => {
    try {
      await _videoCallService.startScreenSharing();
      setIsScreenSharing(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to share screen';
      setError(message);
    }
  }, []);

  const stopScreenShare = useCallback(async () => {
    await _videoCallService.stopScreenSharing();
    setIsScreenSharing(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => () => {
      if (isConnected) {
        _videoCallService.endCall();
      }
    }, [isConnected]);

  return {
    localStream,
    isConnected,
    isVideoEnabled,
    isAudioEnabled,
    isScreenSharing,
    error,
    startCall,
    endCall,
    toggleVideo,
    toggleAudio,
    startScreenShare,
    stopScreenShare,
  };
}

/**
 * Hook for premium tier management
 */
export function usePremiumTier(userId: string) {
  const queryClient = useQueryClient();

  const { data: subscription, isLoading } = useQuery<Subscription | null>({
    queryKey: ['subscription', userId],
    queryFn: async () => {
      // Fetch from backend API
      const API_URL = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:5000';
      const token = localStorage.getItem('auth_token');

      const response = await fetch(`${API_URL}/api/premium/subscription`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Return free tier if no subscription found
        if (response.status === 404) {
          return { tier: 'free', status: 'inactive' };
        }
        throw new Error('Failed to fetch subscription');
      }

      const data = await response.json();
      return data.data?.subscription || { tier: 'free', status: 'inactive' };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const upgradeMutation = useMutation({
    mutationFn: async (newTier: PremiumTier) => {
      const API_URL = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:5000';
      const token = localStorage.getItem('auth_token');

      // Create Stripe checkout session
      const response = await fetch(`${API_URL}/api/premium/subscribe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: newTier.id,
          interval: newTier.interval || 'monthly',
        }),
      });

      if (!response.ok) throw new Error('Upgrade failed');

      const data = await response.json();

      // Redirect to Stripe checkout
      if (data.data?.url) {
        window.location.href = data.data.url;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', userId] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      const API_URL = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:5000';
      const token = localStorage.getItem('auth_token');

      const response = await fetch(`${API_URL}/api/premium/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Cancellation failed');
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', userId] });
    },
  });

  const currentTier = subscription?.tierId || 'free';
  const [plan, setplan] = useState<PremiumTier | null>(null);
  const [allPlans, setAllPlans] = useState<PremiumTier[]>([]);

  useEffect(() => {
    premiumTierService.getTier(currentTier).then(setplan);
    premiumTierService.getTiers().then(setAllPlans);
  }, [currentTier]);

  const hasFeature = useCallback(
    (feature: string) => premiumTierService.hasFeatureAccess(
        currentTier,
        feature as
          | 'video_calls'
          | 'priority_support'
          | 'advanced_analytics'
          | 'unlimited_matches'
          | 'profile_boost',
      ),
    [currentTier],
  );

  const getLimit = useCallback((_limit: string) => 
    // Feature limits would be defined in tier features
     -1 // Unlimited for now
  , []);

  return {
    subscription,
    currentTier,
    plan,
    allPlans,
    isLoading,
    hasFeature,
    getLimit,
    upgrade: upgradeMutation.mutate,
    cancel: cancelMutation.mutate,
    isUpgrading: upgradeMutation.isPending,
    isCancelling: cancelMutation.isPending,
  };
}

/**
 * Hook for user analytics
 */
export function useUserAnalytics(
  userId: string,
  period: 'day' | 'week' | 'month' | 'year' = 'week',
) {
  const {
    data: analytics,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['userAnalytics', userId, period],
    queryFn: () => analyticsService.getUserAnalytics(userId, period),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    analytics,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook for match analytics
 */
export function useMatchAnalytics(
  userId: string,
  period: 'day' | 'week' | 'month' | 'year' = 'week',
) {
  const {
    data: analytics,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['matchAnalytics', userId, period],
    queryFn: () => analyticsService.getMatchAnalytics(userId, period),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    analytics,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook for tracking events
 */
export function useTrackEvent() {
  return useCallback((eventName: string, properties?: Record<string, unknown>) => {
    analyticsService.trackEvent(eventName, properties);
  }, []);
}

/**
 * Hook for event tracking with user context
 */
export function useEventTracking(userId: string) {
  const trackEvent = useCallback(
    async (eventType: string, metadata?: Record<string, unknown>) => {
      analyticsService.trackEvent(eventType, {
        ...metadata,
        user_id: userId,
      });
    },
    [userId],
  );

  return { trackEvent };
}

/**
 * Hook for feature gating based on premium tier
 */
export function useFeatureGate(userId: string, requiredFeature: string) {
  const { hasFeature, currentTier, plan } = usePremiumTier(userId);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const checkAccess = useCallback(() => {
    const hasAccess = hasFeature(requiredFeature);
    if (!hasAccess) {
      setShowUpgradeModal(true);
    }
    return hasAccess;
  }, [hasFeature, requiredFeature]);

  const closeModal = useCallback(() => {
    setShowUpgradeModal(false);
  }, []);

  return {
    hasAccess: hasFeature(requiredFeature),
    checkAccess,
    showUpgradeModal,
    closeModal,
    currentTier,
    plan,
  };
}

/**
 * Hook for real-time performance monitoring
 */
export function usePerformanceMonitoring(refreshInterval: number = 30000) {
  const { data: metrics, refetch } = useQuery({
    queryKey: ['performanceMetrics'],
    queryFn: () => analyticsService.getPerformanceMetrics(),
    staleTime: refreshInterval / 2,
    refetchInterval: refreshInterval,
  });

  // Default metrics if none are available yet
  const safeMetrics = metrics || {
    responseTime: 0,
    activeUsers: 0,
    serverLoad: 0,
    uptime: 100,
    errorRate: 0,
  };

  return { metrics: safeMetrics, refetch };
}

/**
 * Hook for usage limits tracking
 */
export function useUsageLimits(userId: string) {
  const { currentTier, getLimit } = usePremiumTier(userId);
  const [usage, setUsage] = useState({
    dailySwipes: 0,
    videoCallMinutes: 0,
    photoUploads: 0,
  });

  const checkLimit = useCallback(
    (limitType: string, currentValue: number) => {
      const limit = getLimit(limitType);
      if (limit === -1) return { reached: false, remaining: Infinity };

      const remaining = limit - currentValue;
      return {
        reached: remaining <= 0,
        remaining: Math.max(0, remaining),
        limit,
      };
    },
    [getLimit],
  );

  const incrementUsage = useCallback((type: keyof typeof usage) => {
    setUsage((prev) => ({
      ...prev,
      [type]: prev[type] + 1,
    }));
  }, []);

  return {
    usage,
    checkLimit,
    incrementUsage,
    currentTier,
  };
}
