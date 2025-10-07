/**
 * Shimmer Effect Hook
 * Provides shimmer animations for loading states
 */
import { useRef, useCallback, useEffect } from 'react';
import { Animated } from 'react-native';
export const useShimmerEffect = (duration = 1500) => {
    const shimmerValue = useRef(new Animated.Value(0)).current;
    const start = useCallback(() => {
        const shimmerLoop = Animated.loop(Animated.sequence([
            Animated.timing(shimmerValue, {
                toValue: 1,
                duration,
                useNativeDriver: true,
            }),
            Animated.timing(shimmerValue, {
                toValue: 0,
                duration,
                useNativeDriver: true,
            }),
        ]));
        shimmerLoop.start();
        return shimmerLoop;
    }, [shimmerValue, duration]);
    const stop = useCallback(() => {
        shimmerValue.stopAnimation();
    }, [shimmerValue]);
    useEffect(() => {
        const animation = start();
        return () => {
            animation.stop();
        };
    }, [start]);
    const getShimmerStyle = () => ({
        opacity: shimmerValue.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0.3, 1, 0.3],
        }),
    });
    return {
        shimmerValue,
        start,
        stop,
        getShimmerStyle,
    };
};
//# sourceMappingURL=useShimmerEffect.js.map