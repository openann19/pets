/**
 * 💎 PREMIUM BUTTON - MOBILE
 * Advanced button component for React Native with haptics and animations
 * Matches web premium experience with native mobile optimizations
 */

import { logger } from '@pawfectmatch/core';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ViewStyle,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { MOBILE_TYPOGRAPHY, MOBILE_VARIANTS } from '../../constants/design-tokens';

interface PremiumButtonProps {
  title: string;
  onPress: () => void;
  variant?: keyof typeof MOBILE_VARIANTS.button;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  haptic?: boolean;
  glow?: boolean;
  style?: ViewStyle;
}

export const PremiumButton: React.FC<PremiumButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  haptic = true,
  glow = false,
  style,
}) => {
  // Animation state
  const animatedScale = useSharedValue(1);
  const animatedGlow = useSharedValue(0);

  const triggerHaptic = useCallback(async (type: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (!haptic) return;
    try {
      switch (type) {
        case 'light':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          setTimeout(() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { });
          }, 100);
          break;
      }
    } catch {
      // no-op
    }
  }, [haptic]);

  const handlePressIn = useCallback(() => {
    triggerHaptic('light').catch(err => logger.error('PremiumButton light haptic error', { err }));
    animatedScale.value = withSpring(0.95, { stiffness: 300, damping: 30 });
    if (glow) animatedGlow.value = withSpring(1, { stiffness: 300, damping: 30 });
  }, [glow, triggerHaptic]);

  const handlePressOut = useCallback(() => {
    animatedScale.value = withSpring(1, { stiffness: 300, damping: 30 });
    if (glow) animatedGlow.value = withSpring(0, { stiffness: 300, damping: 30 });
  }, [glow]);

  const handlePress = useCallback(() => {
    if (disabled || loading) return;
    triggerHaptic('medium').catch(err => logger.error('PremiumButton medium haptic error', { err }));
    onPress();
  }, [disabled, loading, onPress, triggerHaptic]);

  const variantStyle = MOBILE_VARIANTS.button[variant];
  const sizeStyle = (() => {
    switch (size) {
      case 'sm': return { height: 36, paddingHorizontal: 16, fontSize: MOBILE_TYPOGRAPHY.fontSizes.sm };
      case 'lg': return { height: 52, paddingHorizontal: 32, fontSize: MOBILE_TYPOGRAPHY.fontSizes.lg };
      case 'md':
      default: return { height: 44, paddingHorizontal: 24, fontSize: MOBILE_TYPOGRAPHY.fontSizes.base };
    }
  })();

  // Base button container style (non-animated)
  const radius = size === 'sm' ? 10 : size === 'lg' ? 14 : 12;
  const buttonStyle: ViewStyle = {
    height: sizeStyle.height,
    paddingHorizontal: sizeStyle.paddingHorizontal,
    borderRadius: radius,
    backgroundColor: (variantStyle as any).backgroundColor,
    borderWidth: variantStyle.borderColor ? StyleSheet.hairlineWidth : 0,
    borderColor: variantStyle.borderColor,
    alignSelf: fullWidth ? 'stretch' : 'auto',
    justifyContent: 'center',
  };
  if (style) Object.assign(buttonStyle, style);

  // Animated styles
  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: animatedScale.value }],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glow ? animatedGlow.value * 0.3 : 0,
    borderRadius: radius,
    backgroundColor: variantStyle.shadowColor,
  }));

  const ButtonContent = (): React.JSX.Element => (
    <View style={[styles.content, { height: sizeStyle.height }]}>
      {icon !== undefined && iconPosition === 'left' ? (
        <Text style={{ fontSize: sizeStyle.fontSize + 2, color: variantStyle.textColor, marginRight: 8 }}>
          {icon !== '' ? icon : '📱'}
        </Text>
      ) : null}

      <Text
        style={[
          styles.text,
          {
            color: variantStyle.textColor,
            fontSize: sizeStyle.fontSize,
            opacity: loading ? 0 : 1,
          },
        ]}
        numberOfLines={1}
      >
        {title}
      </Text>

      {icon !== undefined && iconPosition === 'right' ? (
        <Text style={{ fontSize: sizeStyle.fontSize + 2, color: variantStyle.textColor, marginLeft: 8 }}>
          {icon !== '' ? icon : '📱'}
        </Text>
      ) : null}

      {loading ? (
        <View style={styles.loadingContainer}>
          <View style={styles.loadingDot}>
            <Text style={{ fontSize: 20, color: variantStyle.textColor }}>🐾</Text>
          </View>
        </View>
      ) : null}
    </View>
  );

  // Glass variant is fully rendered here
  if (variant === 'glass') {
    return (
      <Animated.View
        style={[
          buttonStyle,
          animatedButtonStyle,
          {
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: glow ? 8 : 4 },
            shadowOpacity: glow ? 0.25 : 0.15,
            shadowRadius: glow ? 14 : 8,
            elevation: glow ? 8 : 4,
          },
        ]}
      >
        <BlurView intensity={20} style={StyleSheet.absoluteFillObject} />
        <TouchableOpacity
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          style={styles.touchable}
          activeOpacity={0.8}
        >
          <ButtonContent />
        </TouchableOpacity>
        {glow ? (
          <Animated.View
            style={[
              StyleSheet.absoluteFillObject,
              animatedGlowStyle,
            ]}
            pointerEvents="none"
          />
        ) : null}
      </Animated.View>
    );
  }

  // Default variants open container; remainder of JSX (gradient, touchable, glow) follows below
  return (
    <Animated.View
      style={[
        buttonStyle,
        animatedButtonStyle,
        {
          shadowColor: variantStyle.shadowColor,
          shadowOffset: { width: 0, height: glow ? 8 : 4 },
          shadowOpacity: glow ? 0.4 : 0.2,
          shadowRadius: glow ? 16 : 8,
          elevation: glow ? 8 : 4,
        },
      ]}
    >
      {/* FIX: Add a type guard to ensure `variantStyle.colors` is a valid array before rendering LinearGradient */}
      {Array.isArray(variantStyle.colors) && variantStyle.colors.length >= 2 ? (
        <LinearGradient
          colors={variantStyle.colors as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFillObject, { borderRadius: buttonStyle.borderRadius }]}
        />
      ) : null}

      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={styles.touchable}
        activeOpacity={0.8}
      >
        <ButtonContent />
      </TouchableOpacity>

      {glow ? <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          animatedGlowStyle,
        ]}
        pointerEvents="none"
      /> : null}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  touchable: {
    flex: 1,
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingDot: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PremiumButton;
