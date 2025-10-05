/**
 * 💎 PREMIUM BUTTON - MOBILE
 * Advanced button component for React Native with haptics and animations
 * Matches web premium experience with native mobile optimizations
 */

import React, { useRef, useState } from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PremiumButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'glass' | 'gradient' | 'neon' | 'ghost';
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
  const animatedScale = useRef(new Animated.Value(1)).current;
  const animatedGlow = useRef(new Animated.Value(0)).current;
  const [isPressed, setIsPressed] = useState(false);

  // Enhanced haptic feedback with optimized patterns
  const triggerHaptic = async (type: 'light' | 'medium' | 'heavy' = 'medium') => {
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
          // Enhanced heavy haptic with pattern
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          setTimeout(async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }, 100);
          break;
      }
    } catch (error) {
      console.debug('Haptic feedback not available');
    }
  };

  // Enhanced press animations with optimized spring physics
  const handlePressIn = () => {
    setIsPressed(true);
    triggerHaptic('light');
    
    Animated.parallel([
      Animated.spring(animatedScale, {
        toValue: 0.95,
        useNativeDriver: true,
        tension: 400, // Increased for more responsive feel
        friction: 8,  // Reduced for smoother animation
      }),
      glow && Animated.timing(animatedGlow, {
        toValue: 1,
        duration: 120, // Faster response
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    
    Animated.parallel([
      Animated.spring(animatedScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 400, // Increased for more responsive feel
        friction: 6,  // Reduced for smoother animation
      }),
      glow && Animated.timing(animatedGlow, {
        toValue: 0,
        duration: 180, // Faster response
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handlePress = () => {
    if (disabled || loading) return;
    
    triggerHaptic('medium');
    onPress();
  };

  // Get variant styles
  const getVariantStyles = () => {
    const variants = {
      primary: {
        colors: ['#ec4899', '#f472b6'],
        textColor: '#ffffff',
        shadowColor: '#ec4899',
      },
      secondary: {
        colors: ['#0ea5e9', '#38bdf8'],
        textColor: '#ffffff',
        shadowColor: '#0ea5e9',
      },
      glass: {
        colors: ['transparent', 'transparent'],
        textColor: '#374151',
        shadowColor: '#000000',
        blur: true,
      },
      gradient: {
        colors: ['#667eea', '#764ba2', '#f093fb', '#f5576c'],
        textColor: '#ffffff',
        shadowColor: '#667eea',
      },
      neon: {
        colors: ['#1a1a1a', '#1a1a1a'],
        textColor: '#ec4899',
        shadowColor: '#ec4899',
        border: true,
      },
      ghost: {
        colors: ['transparent', 'transparent'],
        textColor: '#6b7280',
        shadowColor: 'transparent',
        border: true,
        borderColor: '#d1d5db',
      },
    };
    
    return variants[variant];
  };

  // Get size styles
  const getSizeStyles = () => {
    const sizes = {
      sm: { height: 36, paddingHorizontal: 16, fontSize: 14 },
      md: { height: 44, paddingHorizontal: 24, fontSize: 16 },
      lg: { height: 52, paddingHorizontal: 32, fontSize: 18 },
    };
    
    return sizes[size];
  };

  const variantStyle = getVariantStyles();
  const sizeStyle = getSizeStyles();

  const ButtonContent = () => (
    <View style={[styles.content, { height: sizeStyle.height }]}>
      {icon && iconPosition === 'left' && (
        <Ionicons 
          name={icon as any} 
          size={sizeStyle.fontSize + 2} 
          color={variantStyle.textColor}
          style={{ marginRight: 8 }}
        />
      )}
      
      <Text
        style={[
          styles.text,
          { 
            color: variantStyle.textColor, 
            fontSize: sizeStyle.fontSize,
            opacity: loading ? 0 : 1,
          },
        ]}
      >
        {title}
      </Text>
      
      {icon && iconPosition === 'right' && (
        <Ionicons 
          name={icon as any} 
          size={sizeStyle.fontSize + 2} 
          color={variantStyle.textColor}
          style={{ marginLeft: 8 }}
        />
      )}
      
      {loading && (
        <View style={styles.loadingContainer}>
          <Animated.View
            style={[
              styles.loadingDot,
              {
                transform: [{
                  rotate: animatedGlow.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                }],
              },
            ]}
          >
            <Ionicons name="paw" size={20} color={variantStyle.textColor} />
          </Animated.View>
        </View>
      )}
    </View>
  );

  const buttonStyle: ViewStyle = {
    width: fullWidth ? '100%' : 'auto',
    minWidth: fullWidth ? undefined : 120,
    height: sizeStyle.height,
    paddingHorizontal: sizeStyle.paddingHorizontal,
    borderRadius: sizeStyle.height / 2,
    opacity: disabled ? 0.5 : 1,
    ...(variantStyle.border && {
      borderWidth: 2,
      borderColor: variantStyle.borderColor || variantStyle.shadowColor,
    }),
    ...style,
  };

  // Glass morphism variant
  if (variant === 'glass') {
    return (
      <Animated.View
        style={[
          buttonStyle,
          {
            transform: [{ scale: animatedScale }],
            overflow: 'hidden',
          },
        ]}
      >
        <BlurView intensity={20} style={StyleSheet.absoluteFillObject} />
        <TouchableOpacity
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          style={[styles.touchable, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}
          activeOpacity={0.8}
        >
          <ButtonContent />
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // Gradient variants
  if (variant === 'primary' || variant === 'secondary' || variant === 'gradient') {
    return (
      <Animated.View
        style={[
          buttonStyle,
          {
            transform: [{ scale: animatedScale }],
            shadowColor: variantStyle.shadowColor,
            shadowOffset: { width: 0, height: glow ? 8 : 4 },
            shadowOpacity: glow ? 0.4 : 0.2,
            shadowRadius: glow ? 16 : 8,
            elevation: glow ? 8 : 4,
          },
        ]}
      >
        <LinearGradient
          colors={variantStyle.colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFillObject, { borderRadius: buttonStyle.borderRadius }]}
        />
        
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

        {/* Glow effect */}
        {glow && (
          <Animated.View
            style={[
              StyleSheet.absoluteFillObject,
              {
                borderRadius: buttonStyle.borderRadius,
                backgroundColor: variantStyle.shadowColor,
                opacity: animatedGlow.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.3],
                }),
              },
            ]}
            pointerEvents="none"
          />
        )}
      </Animated.View>
    );
  }

  // Default and other variants
  return (
    <Animated.View
      style={[
        buttonStyle,
        {
          transform: [{ scale: animatedScale }],
          backgroundColor: variant === 'neon' ? '#1a1a1a' : 'transparent',
          shadowColor: variantStyle.shadowColor,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        },
      ]}
    >
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
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  touchable: {
    flex: 1,
    justifyContent: 'center',
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
