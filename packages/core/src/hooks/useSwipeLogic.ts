/**
 * Shared swipe logic hook for both web and mobile platforms
 * Handles swipe actions, analytics, and state management
 * 
 * ✅ PRODUCTION READY - Real API Integration
 */

import { useState, useCallback } from 'react';
import { Pet, SwipeAction, SwipeResult } from '../types/swipe';
import { useAuthStore } from '../stores/useAuthStore';
import { apiClient } from '../api/client';

export interface UseSwipeLogicProps {
  onMatch?: (result: SwipeResult) => void;
  onSwipeComplete?: (action: SwipeAction) => void;
  analyticsEnabled?: boolean;
}

export const useSwipeLogic = ({
  onMatch,
  onSwipeComplete,
  analyticsEnabled = true,
}: UseSwipeLogicProps = {}) => {
  const { user } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [swipeHistory, setSwipeHistory] = useState<SwipeAction[]>([]);

  const createSwipeAction = useCallback((
    type: 'like' | 'pass' | 'superlike',
    pet: Pet
  ): SwipeAction => ({
    type,
    petId: pet._id,
    timestamp: new Date(),
    userId: user?._id || '',
  }), [user?._id]);

  const processSwipe = useCallback(async (
    action: SwipeAction,
    pet: Pet
  ): Promise<SwipeResult> => {
    setIsProcessing(true);

    try {
      // Add to local history
      setSwipeHistory((prev: SwipeAction[]) => [...prev, action]);

      // Send to analytics if enabled
      if (analyticsEnabled) {
        // Track swipe action
        console.log('Swipe Analytics:', {
          action: action.type,
          petId: pet._id,
          userId: user?._id,
          timestamp: action.timestamp,
        });
      }

      // ✅ REAL API CALL - Check for mutual match with backend
      const response = await apiClient.post<{
        success: boolean;
        action: string;
        isMatch: boolean;
        match?: {
          _id: string;
          pet1: string;
          pet2: string;
          createdAt: string;
        };
      }>(`/pets/${pet._id}/swipe`, { action: action.type });

      // Parse real match status from backend response
      const isMatch = response.data?.isMatch || false;
      const matchId = response.data?.match?._id;

      const result: SwipeResult = {
        isMatch,
        matchId,
        pet,
        action,
      };

      // Notify callbacks
      onSwipeComplete?.(action);
      if (result.isMatch) {
        onMatch?.(result);
      }

      return result;
    } catch (error: any) {
      console.error('Error processing swipe:', error);
      
      // Re-throw with user-friendly message
      throw new Error(
        error.message || 
        'Failed to process swipe. Please check your connection and try again.'
      );
    } finally {
      setIsProcessing(false);
    }
  }, [user?._id, analyticsEnabled, onMatch, onSwipeComplete]);

  const handleLike = useCallback(async (pet: Pet) => {
    const action = createSwipeAction('like', pet);
    return await processSwipe(action, pet);
  }, [createSwipeAction, processSwipe]);

  const handlePass = useCallback(async (pet: Pet) => {
    const action = createSwipeAction('pass', pet);
    return await processSwipe(action, pet);
  }, [createSwipeAction, processSwipe]);

  const handleSuperLike = useCallback(async (pet: Pet) => {
    const action = createSwipeAction('superlike', pet);
    return await processSwipe(action, pet);
  }, [createSwipeAction, processSwipe]);

  const getSwipeStats = useCallback(() => {
    const total = swipeHistory.length;
    const likes = swipeHistory.filter((s: SwipeAction) => s.type === 'like').length;
    const passes = swipeHistory.filter((s: SwipeAction) => s.type === 'pass').length;
    const superLikes = swipeHistory.filter((s: SwipeAction) => s.type === 'superlike').length;

    return {
      total,
      likes,
      passes,
      superLikes,
      likeRate: total > 0 ? (likes / total) * 100 : 0,
    };
  }, [swipeHistory]);

  return {
    handleLike,
    handlePass,
    handleSuperLike,
    isProcessing,
    swipeHistory,
    getSwipeStats,
  };
};
