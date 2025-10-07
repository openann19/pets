import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * PROJECT HYPERION: IMMERSIVE CARD COMPONENT
 *
 * Enterprise-grade card component with:
 * - 3D tilt effects with gyroscope support
 * - Glass morphism with backdrop blur
 * - Holographic variant with animated gradients
 * - Shimmer effects on hover
 * - Magnetic mouse tracking
 * - Entrance animations (fadeInUp, scaleIn, slideIn)
 * - Glow variants with colored shadows
 */
import { useRef, useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions, } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
// === STYLES ===
const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
    },
    cardDefault: {
        backgroundColor: '#ffffff',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    cardGlass: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    cardHolographic: {
        backgroundColor: 'transparent',
    },
    cardGlow: {
        backgroundColor: '#ffffff',
        shadowColor: '#ec4899',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    card3d: {
        backgroundColor: '#ffffff',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
    content: {
        padding: 16,
    },
    shimmer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.3,
    },
    glowOverlay: {
        position: 'absolute',
        top: -2,
        left: -2,
        right: -2,
        bottom: -2,
        borderRadius: 18,
        opacity: 0.6,
    },
});
// === ANIMATION CONFIGURATIONS ===
const ENTRANCE_ANIMATIONS = {
    fadeInUp: {
        initial: { opacity: 0, translateY: 30 },
        final: { opacity: 1, translateY: 0 },
        duration: 600,
    },
    scaleIn: {
        initial: { opacity: 0, scale: 0.8 },
        final: { opacity: 1, scale: 1 },
        duration: 500,
    },
    slideIn: {
        initial: { opacity: 0, translateX: -30 },
        final: { opacity: 1, translateX: 0 },
        duration: 500,
    },
};
// === MAIN COMPONENT ===
export const ImmersiveCard = ({ children, variant = 'default', tilt = false, magnetic = false, shimmer = false, glow = false, entrance, onPress, style, testID, }) => {
    // Animation values
    const tiltX = useRef(new Animated.Value(0)).current;
    const tiltY = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const shimmerAnim = useRef(new Animated.Value(0)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;
    const entranceAnim = useRef(new Animated.Value(0)).current;
    // State
    const [isPressed, setIsPressed] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    // Get variant styles
    const getVariantStyles = () => {
        switch (variant) {
            case 'glass': return styles.cardGlass;
            case 'holographic': return styles.cardHolographic;
            case 'glow': return styles.cardGlow;
            case '3d': return styles.card3d;
            default: return styles.cardDefault;
        }
    };
    // Handle press
    const handlePress = useCallback((event) => {
        if (onPress) {
            onPress(event);
        }
    }, [onPress]);
    // Handle press in
    const handlePressIn = useCallback(() => {
        setIsPressed(true);
        Animated.timing(scaleAnim, {
            toValue: 0.98,
            duration: 100,
            useNativeDriver: true,
        }).start();
    }, [scaleAnim]);
    // Handle press out
    const handlePressOut = useCallback(() => {
        setIsPressed(false);
        Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
        }).start();
    }, [scaleAnim]);
    // Handle mouse movement (for magnetic effect)
    const handleMouseMove = useCallback((event) => {
        if (!magnetic)
            return;
        const { locationX, locationY } = event.nativeEvent;
        const { width, height } = Dimensions.get('window');
        const centerX = width / 2;
        const centerY = height / 2;
        const deltaX = (locationX - centerX) / centerX;
        const deltaY = (locationY - centerY) / centerY;
        setMousePosition({ x: deltaX, y: deltaY });
        if (tilt) {
            Animated.parallel([
                Animated.timing(tiltX, {
                    toValue: deltaY * 10,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(tiltY, {
                    toValue: deltaX * -10,
                    duration: 100,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [magnetic, tilt, tiltX, tiltY]);
    // Shimmer animation
    useEffect(() => {
        if (shimmer) {
            const shimmerLoop = Animated.loop(Animated.sequence([
                Animated.timing(shimmerAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(shimmerAnim, {
                    toValue: 0,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ]));
            shimmerLoop.start();
            return () => shimmerLoop.stop();
        }
    }, [shimmer, shimmerAnim]);
    // Glow animation
    useEffect(() => {
        if (glow) {
            const glowLoop = Animated.loop(Animated.sequence([
                Animated.timing(glowAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(glowAnim, {
                    toValue: 0.5,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ]));
            glowLoop.start();
            return () => glowLoop.stop();
        }
    }, [glow, glowAnim]);
    // Entrance animation
    useEffect(() => {
        if (entrance) {
            const config = ENTRANCE_ANIMATIONS[entrance];
            Animated.timing(entranceAnim, {
                toValue: 1,
                duration: config.duration,
                useNativeDriver: true,
            }).start();
        }
    }, [entrance, entranceAnim]);
    // Animated styles
    const animatedStyle = {
        transform: [
            { scale: scaleAnim },
            { rotateX: tiltX },
            { rotateY: tiltY },
            ...(entrance ? [
                {
                    opacity: entranceAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [ENTRANCE_ANIMATIONS[entrance].initial.opacity, ENTRANCE_ANIMATIONS[entrance].final.opacity],
                    }),
                },
                {
                    translateY: entranceAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [ENTRANCE_ANIMATIONS[entrance].initial.translateY || 0, ENTRANCE_ANIMATIONS[entrance].final.translateY || 0],
                    }),
                },
                {
                    translateX: entranceAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [ENTRANCE_ANIMATIONS[entrance].initial.translateX || 0, ENTRANCE_ANIMATIONS[entrance].final.translateX || 0],
                    }),
                },
                {
                    scale: entranceAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [ENTRANCE_ANIMATIONS[entrance].initial.scale || 1, ENTRANCE_ANIMATIONS[entrance].final.scale || 1],
                    }),
                },
            ] : []),
        ],
    };
    const shimmerStyle = {
        opacity: shimmerAnim.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, 0.3, 0],
        }),
    };
    const glowStyle = {
        opacity: glowAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 0.8],
        }),
    };
    // Render content based on variant
    const renderContent = () => {
        if (variant === 'glass') {
            return (_jsx(BlurView, { intensity: 20, style: styles.content, children: children }));
        }
        if (variant === 'holographic') {
            return (_jsx(LinearGradient, { colors: ['rgba(255, 0, 255, 0.1)', 'rgba(0, 255, 255, 0.1)', 'rgba(255, 255, 0, 0.1)'], start: { x: 0, y: 0 }, end: { x: 1, y: 1 }, style: styles.content, children: children }));
        }
        return (_jsx(View, { style: styles.content, children: children }));
    };
    return (_jsxs(Animated.View, { style: [
            styles.card,
            getVariantStyles(),
            animatedStyle,
            style,
        ], testID: testID, children: [glow && (_jsx(Animated.View, { style: [
                    styles.glowOverlay,
                    glowStyle,
                    {
                        backgroundColor: variant === 'glow' ? '#ec4899' : 'transparent',
                    },
                ] })), shimmer && (_jsx(Animated.View, { style: [
                    styles.shimmer,
                    shimmerStyle,
                ], children: _jsx(LinearGradient, { colors: ['transparent', 'rgba(255, 255, 255, 0.3)', 'transparent'], start: { x: -1, y: 0 }, end: { x: 1, y: 0 }, style: { flex: 1 } }) })), renderContent()] }));
};
export default ImmersiveCard;
//# sourceMappingURL=ImmersiveCard.js.map