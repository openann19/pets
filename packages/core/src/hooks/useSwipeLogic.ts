/**
 * Shared swipe logic hook for both web and mobile platforms
 * Handles swipe actions, analytics, and state management
 */

import { useState, useCallback } from 'react';
import { Pet, SwipeAction, SwipeResult } from '../types/swipe';
import { useAuthStore } from '../stores/authStore';

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
    userId: user?.id || '',
  }), [user?.id]);

  const processSwipe = useCallback(async (
    action: SwipeAction,
    pet: Pet
  ): Promise<SwipeResult> => {
    setIsProcessing(true);

    try {
      // Add to local history
      setSwipeHistory(prev => [...prev, action]);

      // Send to analytics if enabled
      if (analyticsEnabled) {
        // Track swipe action
        console.log('Swipe Analytics:', {
          action: action.type,
          petId: pet._id,
          userId: user?.id,
          timestamp: action.timestamp,
        });
      }

      // Simulate API call to check for match
      // In real implementation, this would be an actual API call
      const isMatch = action.type === 'like' && Math.random() > 0.7; // 30% match rate for demo

      const result: SwipeResult = {
        isMatch,
        matchId: isMatch ? `match_${Date.now()}` : undefined,
        pet,
        action,
      };

      // Notify callbacks
      onSwipeComplete?.(action);
      if (result.isMatch) {
        onMatch?.(result);
      }

      return result;
    } catch (error) {
      console.error('Error processing swipe:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [user?.id, analyticsEnabled, onMatch, onSwipeComplete]);

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
    const likes = swipeHistory.filter(s => s.type === 'like').length;
    const passes = swipeHistory.filter(s => s.type === 'pass').length;
    const superLikes = swipeHistory.filter(s => s.type === 'superlike').length;

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
