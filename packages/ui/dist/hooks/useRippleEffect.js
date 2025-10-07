/**
 * Ripple Effect Hook
 * Provides ripple animations for touch interactions
 */
import { useRef, useCallback, useState } from 'react';
import { Animated } from 'react-native';
export const useRippleEffect = () => {
    const rippleScale = useRef(new Animated.Value(0)).current;
    const rippleOpacity = useRef(new Animated.Value(0)).current;
    const [ripplePosition, setRipplePosition] = useState({ x: 0, y: 0 });
    const startRipple = useCallback((event) => {
        const { locationX, locationY } = event.nativeEvent;
        setRipplePosition({ x: locationX, y: locationY });
        Animated.parallel([
            Animated.timing(rippleScale, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(rippleOpacity, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start(() => {
            Animated.parallel([
                Animated.timing(rippleOpacity, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                rippleScale.setValue(0);
            });
        });
    }, [rippleScale, rippleOpacity]);
    const getRippleStyle = () => ({
        position: 'absolute',
        left: ripplePosition.x - 20,
        top: ripplePosition.y - 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        transform: [
            {
                scale: rippleScale.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 4],
                }),
            },
        ],
        opacity: rippleOpacity,
    });
    return {
        startRipple,
        getRippleStyle,
    };
};
//# sourceMappingURL=useRippleEffect.js.map