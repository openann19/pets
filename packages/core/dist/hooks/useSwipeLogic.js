/**
 * Shared swipe logic hook for both web and mobile platforms
 * Handles swipe actions, analytics, and state management
 *
 * ✅ PRODUCTION READY - Real API Integration
 */
import { useCallback, useState } from 'react';
import { apiClient } from '../api/client';
import { useAuthStore } from '../stores/useAuthStore';
export const useSwipeLogic = ({ onMatch, onSwipeComplete, analyticsEnabled = true, } = {}) => {
    const { user } = useAuthStore();
    const [isProcessing, setIsProcessing] = useState(false);
    const [swipeHistory, setSwipeHistory] = useState([]);
    const createSwipeAction = useCallback((type, pet) => ({
        type,
        petId: pet._id,
        timestamp: new Date(),
        userId: user?._id ?? '',
    }), [user?._id]);
    const processSwipe = useCallback(async (action, pet) => {
        setIsProcessing(true);
        try {
            // Add to local history
            setSwipeHistory((prev) => [...prev, action]);
            // Send to analytics if enabled
            if (analyticsEnabled) {
                // Track swipe action
                // eslint-disable-next-line no-console
                console.log('Swipe Analytics:', {
                    action: action.type,
                    petId: pet._id,
                    userId: user?._id,
                    timestamp: action.timestamp,
                });
            }
            // ✅ REAL API CALL - Check for mutual match with backend
            const response = await apiClient.post(`/pets/${pet._id}/swipe`, { action: action.type });
            // Parse real match status from backend response
            const isMatch = response.data?.isMatch ?? false;
            const matchId = response.data?.match?._id;
            const result = {
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
        }
        catch (error) {
            console.error('Error processing swipe:', error);
            // Re-throw with user-friendly message
            const errorMessage = error instanceof Error
                ? error.message
                : 'Failed to process swipe. Please check your connection and try again.';
            throw new Error(errorMessage);
        }
        finally {
            setIsProcessing(false);
        }
    }, [user?._id, analyticsEnabled, onMatch, onSwipeComplete]);
    const handleLike = useCallback(async (pet) => {
        const action = createSwipeAction('like', pet);
        return await processSwipe(action, pet);
    }, [createSwipeAction, processSwipe]);
    const handlePass = useCallback(async (pet) => {
        const action = createSwipeAction('pass', pet);
        return await processSwipe(action, pet);
    }, [createSwipeAction, processSwipe]);
    const handleSuperLike = useCallback(async (pet) => {
        const action = createSwipeAction('superlike', pet);
        return await processSwipe(action, pet);
    }, [createSwipeAction, processSwipe]);
    const getSwipeStats = useCallback(() => {
        const total = swipeHistory.length;
        const likes = swipeHistory.filter((s) => s.type === 'like').length;
        const passes = swipeHistory.filter((s) => s.type === 'pass').length;
        const superLikes = swipeHistory.filter((s) => s.type === 'superlike').length;
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
