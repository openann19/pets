/**
 * Magnetic Effect Hook
 * Provides magnetic mouse tracking for interactive elements
 */
import { useRef, useCallback } from 'react';
import { Animated, Dimensions } from 'react-native';
export const useMagneticEffect = (strength = 0.3) => {
    const magneticX = useRef(new Animated.Value(0)).current;
    const magneticY = useRef(new Animated.Value(0)).current;
    const handleMouseMove = useCallback((event) => {
        const { locationX, locationY } = event.nativeEvent;
        const { width, height } = Dimensions.get('window');
        const centerX = width / 2;
        const centerY = height / 2;
        const deltaX = (locationX - centerX) / centerX;
        const deltaY = (locationY - centerY) / centerY;
        Animated.parallel([
            Animated.timing(magneticX, {
                toValue: deltaX * strength,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(magneticY, {
                toValue: deltaY * strength,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
    }, [magneticX, magneticY, strength]);
    const reset = useCallback(() => {
        Animated.parallel([
            Animated.timing(magneticX, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(magneticY, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();
    }, [magneticX, magneticY]);
    const getAnimatedStyle = () => ({
        transform: [
            { translateX: magneticX },
            { translateY: magneticY },
        ],
    });
    return {
        magneticX,
        magneticY,
        handleMouseMove,
        reset,
        getAnimatedStyle,
    };
};
//# sourceMappingURL=useMagneticEffect.js.map