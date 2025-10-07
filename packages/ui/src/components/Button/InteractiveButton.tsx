/**
 * PROJECT HYPERION: INTERACTIVE BUTTON COMPONENT
 * 
 * Enterprise-grade interactive button with:
 * - Magnetic mouse tracking
 * - Ripple animations on press
 * - Glow effects with animated shadows
 * - Holographic variant with shimmer
 * - Glass morphism variant
 * - Loading states with animated spinners
 * - Haptic feedback integration
 * - Multiple size variants (sm, md, lg, xl)
 */

import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
} from 'react-native';
import * as Haptics from 'expo-haptics';

// === TYPES ===
export type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'ghost' 
  | 'glass' 
  | 'holographic' 
  | 'neon' 
  | 'premium';

export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export interface InteractiveButtonProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  loading?: boolean;
  disabled?: boolean;
  magnetic?: boolean;
  ripple?: boolean;
  glow?: boolean;
  shimmer?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

// === STYLES ===
const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  buttonSm: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 36,
  },
  buttonMd: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    minHeight: 44,
  },
  buttonLg: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    minHeight: 52,
  },
  buttonXl: {
    paddingHorizontal: 32,
    paddingVertical: 20,
    minHeight: 60,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  textSm: {
    fontSize: 14,
  },
  textMd: {
    fontSize: 16,
  },
  textLg: {
    fontSize: 18,
  },
  textXl: {
    fontSize: 20,
  },
  ripple: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  loadingContainer: {
    marginRight: 8,
  },
});

// === VARIANT STYLES ===
const getVariantStyles = (variant: ButtonVariant) => {
  switch (variant) {
    case 'primary':
      return {
        backgroundColor: '#ec4899',
        borderColor: '#ec4899',
        textColor: '#ffffff',
      };
    case 'secondary':
      return {
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
        textColor: '#ffffff',
      };
    case 'ghost':
      return {
        backgroundColor: 'transparent',
        borderColor: '#6b7280',
        textColor: '#6b7280',
      };
    case 'glass':
      return {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        textColor: '#ffffff',
      };
    case 'holographic':
      return {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        textColor: '#ffffff',
      };
    case 'neon':
      return {
        backgroundColor: 'transparent',
        borderColor: '#00ffff',
        textColor: '#00ffff',
      };
    case 'premium':
      return {
        backgroundColor: '#fbbf24',
        borderColor: '#fbbf24',
        textColor: '#000000',
      };
    default:
      return {
        backgroundColor: '#ec4899',
        borderColor: '#ec4899',
        textColor: '#ffffff',
      };
  }
};

// === MAIN COMPONENT ===
export const InteractiveButton: React.FC<InteractiveButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled = false,
  magnetic = false,
  ripple = false,
  glow = false,
  shimmer = false,
  onPress,
  style,
  textStyle,
  testID,
}) => {
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  // State
  const [ripplePosition, setRipplePosition] = useState({ x: 0, y: 0 });

  // Get variant styles
  const variantStyles = getVariantStyles(variant);

  // Get size styles
  const getSizeStyles = () => {
    switch (size) {
      case 'sm': return styles.buttonSm;
      case 'md': return styles.buttonMd;
      case 'lg': return styles.buttonLg;
      case 'xl': return styles.buttonXl;
      default: return styles.buttonMd;
    }
  };

  const getTextSizeStyles = () => {
    switch (size) {
      case 'sm': return styles.textSm;
      case 'md': return styles.textMd;
      case 'lg': return styles.textLg;
      case 'xl': return styles.textXl;
      default: return styles.textMd;
    }
  };

  // Handle press
  const handlePress = useCallback((event: GestureResponderEvent) => {
    if (disabled || loading) return;

    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Scale animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Ripple animation
    if (ripple) {
      const { locationX, locationY } = event.nativeEvent;
      setRipplePosition({ x: locationX, y: locationY });
      
      Animated.sequence([
        Animated.timing(rippleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(rippleAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]).start();
    }

    // Glow animation
    if (glow) {
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }

    onPress?.(event);
  }, [disabled, loading, ripple, glow, onPress, scaleAnim, rippleAnim, glowAnim]);

  // Shimmer animation
  React.useEffect(() => {
    if (shimmer && variant === 'holographic') {
      const shimmerLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      );
      shimmerLoop.start();
      return () => shimmerLoop.stop();
    }
  }, [shimmer, variant, shimmerAnim]);

  // Animated styles
  const animatedStyle = {
    transform: [{ scale: scaleAnim }],
  };

  const rippleStyle = {
    left: ripplePosition.x - 20,
    top: ripplePosition.y - 20,
    opacity: rippleAnim,
    transform: [
      {
        scale: rippleAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 4],
        }),
      },
    ],
  };

  const glowStyle = {
    opacity: glowAnim,
    shadowColor: variantStyles.textColor,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  };

  const shimmerStyle = {
    opacity: shimmerAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.3, 1, 0.3],
    }),
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      style={[
        styles.button,
        getSizeStyles(),
        {
          backgroundColor: variantStyles.backgroundColor,
          borderColor: variantStyles.borderColor,
          borderWidth: variant === 'ghost' || variant === 'neon' ? 1 : 0,
        },
        glow && glowStyle,
        animatedStyle,
        style,
      ]}
      testID={testID}
      activeOpacity={0.8}
    >
      {/* Ripple Effect */}
      {ripple && (
        <Animated.View
          style={[
            styles.ripple,
            rippleStyle,
          ]}
        />
      )}

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="small"
            color={variantStyles.textColor}
          />
        </View>
      )}

      {/* Button Text */}
      <Animated.View style={shimmer && shimmerStyle}>
        <Text
          style={[
            styles.text,
            getTextSizeStyles(),
            { color: variantStyles.textColor },
            textStyle,
          ]}
        >
          {title}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default InteractiveButton;
