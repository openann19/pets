/**
 * 💎 PHASE 3: Premium Feature Hooks
 * React hooks for video calls, analytics, and premium tier management
 */

// @ts-nocheck
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback, useRef } from 'react';

import type { UserAnalytics, MatchAnalytics } from '../lib/analytics-service';
import { analyticsService } from '../lib/analytics-service';
import { premiumTierService } from '../lib/premium-tier-service';
import type { PremiumTier, UserSubscription } from '../lib/premium-tier-service';
import { videoCallService } from '../lib/video-communication';
import type { VideoCallConfig } from '../lib/video-communication';

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

  const startCall = useCallback(async (config: Omit<VideoCallConfig, 'roomId' | 'userId'>) => {
    try {
      const stream = await videoCallService.initializeCall({
        roomId,
        userId,
        ...config,
      });
      setLocalStream(stream);
      setIsConnected(true);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Failed to start call:', err);
    }
  }, [roomId, userId]);

  const endCall = useCallback(() => {
    videoCallService.endCall();
    setLocalStream(null);
    setIsConnected(false);
    setIsVideoEnabled(true);
    setIsAudioEnabled(true);
    setIsScreenSharing(false);
  }, []);

  const toggleVideo = useCallback(() => {
    videoCallService.toggleVideo(!isVideoEnabled);
    setIsVideoEnabled(prev => !prev);
  }, [isVideoEnabled]);

  const toggleAudio = useCallback(() => {
    videoCallService.toggleAudio(!isAudioEnabled);
    setIsAudioEnabled(prev => !prev);
  }, [isAudioEnabled]);

  const startScreenShare = useCallback(async () => {
    try {
      await videoCallService.startScreenShare();
      setIsScreenSharing(true);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  const stopScreenShare = useCallback(async () => {
    await videoCallService.stopScreenSharing();
    setIsScreenSharing(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isConnected) {
        videoCallService.endCall();
      }
    };
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

  const { data: subscription, isLoading } = useQuery<UserSubscription>({
    queryKey: ['subscription', userId],
    queryFn: async () => {
      // Fetch from API
      const response = await fetch(`/api/subscriptions/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch subscription');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const upgradeMutation = useMutation({
    mutationFn: async (newTier: PremiumTier) => {
      const response = await fetch(`/api/subscriptions/${userId}/upgrade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: newTier }),
      });
      if (!response.ok) throw new Error('Upgrade failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', userId] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/subscriptions/${userId}/cancel`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Cancellation failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', userId] });
    },
  });

  const currentTier = subscription?.tier || 'free';
  const plan = premiumTierService.getPlan(currentTier);
  const allPlans = premiumTierService.getAllPlans();

  const hasFeature = useCallback((feature: string) => {
    return premiumTierService.hasFeatureAccess(currentTier, feature as any);
  }, [currentTier]);

  const getLimit = useCallback((limit: string) => {
    return premiumTierService.getFeatureLimit(currentTier, limit as any);
  }, [currentTier]);

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
export function useUserAnalytics(userId: string, period: 'day' | 'week' | 'month' | 'year' = 'week') {
  const { data: analytics, isLoading, error, refetch } = useQuery<UserAnalytics>({
    queryKey: ['analytics', userId, period],
    queryFn: () => analyticsService.getUserAnalytics(userId, period),
    staleTime: 10 * 60 * 1000, // 10 minutes
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
export function useMatchAnalytics(userId: string) {
  const { data, isLoading, error } = useQuery<MatchAnalytics>({
    queryKey: ['matchAnalytics', userId],
    queryFn: () => analyticsService.getMatchAnalytics(userId),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  return {
    matchAnalytics: data,
    isLoading,
    error,
  };
}

/**
 * Hook for event tracking
 */
export function useEventTracking(userId: string) {
  const trackEvent = useCallback(async (eventType: string, metadata?: Record<string, any>) => {
    await analyticsService.trackEvent({
      userId,
      eventType,
      metadata,
    });
  }, [userId]);

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
export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = useState({
    responseTime: 0,
    activeUsers: 0,
    serverLoad: 0,
    uptime: 100,
    errorRate: 0,
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      const data = await analyticsService.getPerformanceMetrics();
      setMetrics(data);
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return { metrics };
}

/**
 * Hook for usage tracking and limits
 */
export function useUsageLimits(userId: string) {
  const { currentTier, getLimit } = usePremiumTier(userId);
  const [usage, setUsage] = useState({
    dailySwipes: 0,
    videoCallMinutes: 0,
    photoUploads: 0,
  });

  const checkLimit = useCallback((limitType: string, currentValue: number) => {
    const limit = getLimit(limitType);
    if (limit === -1) return { reached: false, remaining: Infinity };
    
    const remaining = limit - currentValue;
    return {
      reached: remaining <= 0,
      remaining: Math.max(0, remaining),
      limit,
    };
  }, [getLimit]);

  const incrementUsage = useCallback((type: keyof typeof usage) => {
    setUsage(prev => ({
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
