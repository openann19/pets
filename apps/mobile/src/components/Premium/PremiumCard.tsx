/**
 * 💎 PREMIUM CARD - MOBILE
 * Advanced card component for React Native with glass morphism and animations
 * Cross-platform consistency with web premium experience
 */

import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  PanResponder,
  Animated as RNAnimated,
  StyleSheet,
  TouchableOpacity,
  View,
  type ViewStyle
} from 'react-native';
import { MOBILE_RADIUS, MOBILE_SHADOWS, MOBILE_SPACING, MOBILE_VARIANTS } from '../../constants/design-tokens';

interface PremiumCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'elevated' | 'gradient' | 'neon' | 'holographic';
  hover?: boolean;
  tilt?: boolean;
  glow?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  style?: ViewStyle;
  onPress?: () => void;
  disabled?: boolean;
  haptic?: boolean;
}

export const PremiumCard: React.FC<PremiumCardProps> = ({
  children,
  variant = 'default',
  hover: _hover = true,
  tilt = false,
  glow = false,
  padding = 'md',
  style,
  onPress,
  disabled = false,
  haptic = true,
}) => {
  const animatedScale = useRef(new RNAnimated.Value(1)).current;
  const animatedRotateX = useRef(new RNAnimated.Value(0)).current;
  const animatedRotateY = useRef(new RNAnimated.Value(0)).current;
  const animatedElevation = useRef(new RNAnimated.Value(4)).current;
  const animatedGlow = useRef(new RNAnimated.Value(0)).current;

  // Enhanced 3D tilt effect with PanResponder
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => tilt && !disabled,
      onPanResponderGrant: () => {
        if (haptic) {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      },
      onPanResponderMove: (_evt, gestureState) => {
        if (!tilt) return;

        const { dx, dy } = gestureState;
        const maxTilt = 15;

        // Calculate tilt based on gesture
        const tiltX = Math.max(-maxTilt, Math.min(maxTilt, (dy / 100) * maxTilt));
        const tiltY = Math.max(-maxTilt, Math.min(maxTilt, -(dx / 100) * maxTilt));

        animatedRotateX.setValue(tiltX);
        animatedRotateY.setValue(tiltY);

        // Enhance elevation on interaction
        RNAnimated.timing(animatedElevation, {
          toValue: 8,
          duration: 150,
          useNativeDriver: false,
        }).start();
      },
      onPanResponderRelease: () => {
        // Return to center
        // Sequence springs and timing since RNAnimated.parallel typing is problematic under strict types
        RNAnimated.spring(animatedRotateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        }).start();
        RNAnimated.spring(animatedRotateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        }).start();
        RNAnimated.timing(animatedElevation, {
          toValue: 4,
          duration: 200,
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  // Enhanced press handling
  const handlePressIn = (): void => {
    if (disabled) return;

    if (haptic) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const animations = [
      RNAnimated.spring(animatedScale, {
        toValue: 0.98,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
    ];

    if (glow) {
      animations.push(RNAnimated.timing(animatedGlow, {
        toValue: 1,
        duration: 150,
        useNativeDriver: false,
      }));
    }

    // Run animations individually to avoid parallel typing issues
    animations.forEach(a => a.start());
  };

  const handlePressOut = (): void => {
    const animations = [
      RNAnimated.spring(animatedScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 8,
      }),
    ];

    if (glow) {
      animations.push(RNAnimated.timing(animatedGlow, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }));
    }

    animations.forEach(a => a.start());
  };

  const handlePress = (): void => {
    if (disabled) return;

    if (haptic) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    onPress?.();
  };

  // Entrance animation
  useEffect(() => {
    RNAnimated.sequence([
      RNAnimated.timing(animatedScale, {
        toValue: 0.9,
        duration: 0,
        useNativeDriver: true,
      }),
      RNAnimated.spring(animatedScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
    ]).start();
  }, [animatedScale]);

  // Get variant styles - FIXED: Now returns actual style object instead of Promise
  const getVariantStyles = useCallback(() => {
    const styles = (MOBILE_VARIANTS as any).card?.[variant] ?? (MOBILE_VARIANTS as any).card?.default ?? {};
    return styles as any;
  }, [variant]);

  // Get padding values
  const getPaddingValue = useCallback((): number => {
    const paddingValues = {
      none: 0,
      sm: MOBILE_SPACING[3],
      md: MOBILE_SPACING[5],
      lg: MOBILE_SPACING[7],
      xl: MOBILE_SPACING[9],
    };
    return paddingValues[padding];
  }, [padding]);

  // Get variant container style
  const getVariantContainerStyle = useMemo(() => {
    const baseStyle: ViewStyle = {
      borderRadius: MOBILE_RADIUS['2xl'],
      overflow: 'hidden',
      padding: getPaddingValue(),
    };

    const variantStyle = getVariantStyles();

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyle,
          backgroundColor: variantStyle.backgroundColor ?? '#ffffff',
          ...MOBILE_SHADOWS['2xl'],
        };

      case 'neon':
        return {
          ...baseStyle,
          backgroundColor: '#1a1a1a',
          borderWidth: 2,
          borderColor: '#ec4899',
          shadowColor: '#ec4899',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 12,
          elevation: 6,
        };

      case 'gradient':
        return {
          ...baseStyle,
          ...MOBILE_SHADOWS.xl,
        };

      case 'glass':
        return {
          ...baseStyle,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.2)',
          ...MOBILE_SHADOWS.glass,
        };

      default:
        return {
          ...baseStyle,
          backgroundColor: variantStyle.backgroundColor ?? '#ffffff',
          ...MOBILE_SHADOWS.lg,
        };
    }
  }, [variant, getPaddingValue, getVariantStyles]);

  const containerStyle = getVariantContainerStyle as unknown as ViewStyle;
  const variantStyles = getVariantStyles() as any;

  // Glass morphism implementation
  if (variant === 'glass') {
    return (
      <RNAnimated.View
        style={[
          containerStyle as any,
          {
            transform: [
              { scale: animatedScale as any },
              {
                rotateX: (animatedRotateX as any).interpolate({
                  inputRange: [-15, 15],
                  outputRange: ['-15deg', '15deg'],
                })
              },
              {
                rotateY: (animatedRotateY as any).interpolate({
                  inputRange: [-15, 15],
                  outputRange: ['-15deg', '15deg'],
                })
              },
            ],
          },
          style,
        ] as any}
        {...(tilt ? panResponder.panHandlers : {})}
      >
        <BlurView intensity={30} style={StyleSheet.absoluteFillObject} />
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]} />

        {onPress ? (
          <TouchableOpacity
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled}
            style={styles.touchableCard}
            activeOpacity={0.9}
          >
            {children}
          </TouchableOpacity>
        ) : (
          <View style={styles.cardContent}>
            {children}
          </View>
        )}
      </RNAnimated.View>
    );
  }

  // Gradient implementation
  if (variant === 'gradient' || variant === 'holographic') {
    const gradientColors: [string, string, ...string[]] = (variant === 'holographic'
      ? ['#ff6b6b', '#4ecdc4', '#45b7b8', '#96ceb4', '#ffeaa7']
      : (variantStyles.colors ?? ['#667eea', '#764ba2', '#f093fb'])) as [string, string, ...string[]];

    return (
      <RNAnimated.View
        style={[
          containerStyle,
          {
            transform: [
              { scale: animatedScale },
              {
                rotateX: animatedRotateX.interpolate({
                  inputRange: [-15, 15],
                  outputRange: ['-15deg', '15deg'],
                })
              },
              {
                rotateY: animatedRotateY.interpolate({
                  inputRange: [-15, 15],
                  outputRange: ['-15deg', '15deg'],
                })
              },
            ],
          },
          style,
        ] as any}
        {...(tilt ? panResponder.panHandlers : {})}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFillObject, { borderRadius: (containerStyle as any).borderRadius }]}
        />

        {onPress ? (
          <TouchableOpacity
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled}
            style={styles.touchableCard}
            activeOpacity={0.9}
          >
            {children}
          </TouchableOpacity>
        ) : (
          <View style={styles.cardContent}>
            {children}
          </View>
        )}

        {/* Glow overlay */}
        {glow ? <RNAnimated.View
          style={[
            StyleSheet.absoluteFillObject,
            {
              borderRadius: (containerStyle as any).borderRadius,
              backgroundColor: (variantStyles as any).shadowColor ?? '#ec4899',
              opacity: (animatedGlow as any).interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.2],
              }),
            },
          ]}
          pointerEvents="none"
        /> : null}
      </RNAnimated.View>
    );
  }

  // Default implementation
  return (
    <RNAnimated.View
      style={[
        containerStyle as any,
        {
          transform: [
            { scale: animatedScale as any },
            {
              rotateX: (animatedRotateX as any).interpolate({
                inputRange: [-15, 15],
                outputRange: ['-15deg', '15deg'],
              })
            },
            {
              rotateY: (animatedRotateY as any).interpolate({
                inputRange: [-15, 15],
                outputRange: ['-15deg', '15deg'],
              })
            },
          ],
        },
        style,
      ] as any}
      {...(tilt ? panResponder.panHandlers : {})}
    >
      {onPress ? (
        <TouchableOpacity
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          style={styles.touchableCard}
          activeOpacity={0.95}
        >
          {children}
        </TouchableOpacity>
      ) : (
        <View style={styles.cardContent}>
          {children}
        </View>
      )}
    </RNAnimated.View>
  );
};

const styles = StyleSheet.create({
  touchableCard: {
    flex: 1,
  },
  cardContent: {
    flex: 1,
  },
});

export default PremiumCard;