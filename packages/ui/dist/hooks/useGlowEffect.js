/**
 * Glow Effect Hook
 * Provides glow animations for interactive elements
 */
import { useRef, useCallback } from 'react';
import { Animated } from 'react-native';
export const useGlowEffect = (color = '#ec4899', intensity = 1) => {
    const glowValue = useRef(new Animated.Value(0)).current;
    const start = useCallback(() => {
        const glowLoop = Animated.loop(Animated.sequence([
            Animated.timing(glowValue, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(glowValue, {
                toValue: 0.5,
                duration: 1000,
                useNativeDriver: true,
            }),
        ]));
        glowLoop.start();
        return glowLoop;
    }, [glowValue]);
    const stop = useCallback(() => {
        glowValue.stopAnimation();
    }, [glowValue]);
    const pulse = useCallback(() => {
        Animated.sequence([
            Animated.timing(glowValue, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(glowValue, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();
    }, [glowValue]);
    const getGlowStyle = () => ({
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: glowValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, intensity * 0.8],
        }),
        shadowRadius: glowValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 20 * intensity],
        }),
        elevation: glowValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 10 * intensity],
        }),
    });
    return {
        glowValue,
        start,
        stop,
        pulse,
        getGlowStyle,
    };
};
//# sourceMappingURL=useGlowEffect.js.map