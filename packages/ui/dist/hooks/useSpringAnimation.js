/**
 * Spring Animation Hook
 * Provides smooth spring-based animations
 */
import { useRef, useCallback } from 'react';
import { Animated } from 'react-native';
export const useSpringAnimation = (config = {}) => {
    const animatedValue = useRef(new Animated.Value(0)).current;
    const animate = useCallback((toValue, callback) => {
        Animated.spring(animatedValue, {
            toValue,
            useNativeDriver: true,
            ...config,
        }).start(callback);
    }, [animatedValue, config]);
    const reset = useCallback(() => {
        animatedValue.setValue(0);
    }, [animatedValue]);
    return {
        animatedValue,
        animate,
        reset,
    };
};
//# sourceMappingURL=useSpringAnimation.js.map