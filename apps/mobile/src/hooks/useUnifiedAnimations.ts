/**
 * PROJECT HYPERION: UNIFIED ANIMATION HOOKS
 * 
 * Centralized animation system using react-native-reanimated exclusively.
 * Replaces all legacy Animated API usage with performant, UI-thread animations.
 * 
 * Features:
 * - All animations run on UI thread for 60fps performance
 * - Consistent spring physics across the app
 * - Accessibility-aware (respects reduced motion)
 * - Composable and reusable hooks
 */

import { useEffect, useCallback, useState } from 'react';
import { Dimensions, AccessibilityInfo } from 'react-native';
import type { PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

import { Theme } from '../theme/unified-theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// === ACCESSIBILITY AWARE ANIMATION CONFIG ===
let prefersReducedMotion = false;

// Initialize reduced motion preference
AccessibilityInfo.isReduceMotionEnabled().then((isEnabled) => {
  prefersReducedMotion = isEnabled;
});

// === 1. SPRING ANIMATION HOOK ===
export const useSpringAnimation = (
  initialValue = 0,
  config: keyof typeof Theme.motion.springs = 'standard'
) => {
  const animatedValue = useSharedValue(initialValue);

  const animate = useCallback(
    (toValue: number, customConfig?: Partial<typeof Theme.motion.springs.standard>) => {
      const springConfig = {
        ...Theme.motion.springs[config],
        ...customConfig,
      };

      // Respect reduced motion preference
      if (prefersReducedMotion) {
        animatedValue.value = withTiming(toValue, {
          duration: Theme.motion.timings.standard,
        });
      } else {
        animatedValue.value = withSpring(toValue, springConfig);
      }
    },
    [animatedValue, config]
  );

  const reset = useCallback(() => {
    animatedValue.value = withSpring(initialValue, Theme.motion.springs[config]);
  }, [animatedValue, initialValue, config]);

  return {
    value: animatedValue,
    animate,
    reset,
  };
};

// === 2. ENTRANCE ANIMATION HOOK ===
export const useEntranceAnimation = (
  type: 'fadeInUp' | 'scaleIn' | 'slideInLeft' | 'slideInRight' | 'fadeIn' = 'fadeInUp',
  delay = 0,
  config: keyof typeof Theme.motion.springs = 'standard'
) => {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  const start = useCallback(() => {
    const springConfig = Theme.motion.springs[config];

    if (prefersReducedMotion) {
      opacity.value = withTiming(1, { duration: Theme.motion.timings.standard });
      return;
    }

    switch (type) {
      case 'fadeInUp':
        opacity.value = withDelay(delay, withSpring(1, springConfig));
        translateY.value = withDelay(delay, withSpring(0, springConfig));
        break;
      case 'scaleIn':
        opacity.value = withDelay(delay, withSpring(1, springConfig));
        scale.value = withDelay(delay, withSpring(1, springConfig));
        break;
      case 'slideInLeft':
        opacity.value = withDelay(delay, withSpring(1, springConfig));
        translateX.value = withDelay(delay, withSpring(0, springConfig));
        break;
      case 'slideInRight':
        opacity.value = withDelay(delay, withSpring(1, springConfig));
        translateX.value = withDelay(delay, withSpring(0, springConfig));
        break;
      case 'fadeIn':
        opacity.value = withDelay(delay, withSpring(1, springConfig));
        break;
    }
  }, [type, delay, config, opacity, translateX, translateY, scale]);

  const animatedStyle = useAnimatedStyle(() => {
    const initialValues = {
      fadeInUp: { translateY: 30, translateX: 0, scale: 1 },
      scaleIn: { translateY: 0, translateX: 0, scale: 0.8 },
      slideInLeft: { translateY: 0, translateX: -50, scale: 1 },
      slideInRight: { translateY: 0, translateX: 50, scale: 1 },
      fadeIn: { translateY: 0, translateX: 0, scale: 1 },
    };

    const initial = initialValues[type];

    return {
      opacity: opacity.value,
      transform: [
        { translateX: translateX.value + initial.translateX },
        { translateY: translateY.value + initial.translateY },
        { scale: scale.value * initial.scale },
      ] as const,
    };
  });

  return {
    start,
    animatedStyle,
  };
};

// === 3. STAGGERED LIST ANIMATION HOOK ===
export const useStaggeredAnimation = (
  itemCount: number,
  delay = 100,
  config: keyof typeof Theme.motion.springs = 'gentle'
) => {
  const animatedValues = Array.from({ length: itemCount }, () => ({
    opacity: useSharedValue(0),
    translateY: useSharedValue(30),
  }));

  const start = useCallback(() => {
    const springConfig = Theme.motion.springs[config];

    animatedValues.forEach((item, index) => {
      const itemDelay = index * delay;

      if (prefersReducedMotion) {
        item.opacity.value = withTiming(1, { duration: Theme.motion.timings.standard });
        item.translateY.value = withTiming(0, { duration: Theme.motion.timings.standard });
      } else {
        item.opacity.value = withDelay(itemDelay, withSpring(1, springConfig));
        item.translateY.value = withDelay(itemDelay, withSpring(0, springConfig));
      }
    });
  }, [animatedValues, delay, config]);

  const getAnimatedStyle = useCallback(
    (index: number) => {
      const item = animatedValues[index];
      if (!item) return {};

      return useAnimatedStyle(() => ({
        opacity: item.opacity.value,
        transform: [{ translateY: item.translateY.value }],
      }));
    },
    [animatedValues]
  );

  return {
    start,
    getAnimatedStyle,
  };
};

// === 4. PRESS ANIMATION HOOK ===
export const usePressAnimation = (
  config: keyof typeof Theme.motion.springs = 'snappy'
) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    if (prefersReducedMotion) return;

    scale.value = withSpring(0.96, Theme.motion.springs[config]);
    opacity.value = withSpring(0.8, Theme.motion.springs[config]);
  }, [scale, opacity, config]);

  const handlePressOut = useCallback(() => {
    if (prefersReducedMotion) return;

    scale.value = withSpring(1, Theme.motion.springs[config]);
    opacity.value = withSpring(1, Theme.motion.springs[config]);
  }, [scale, opacity, config]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return {
    handlePressIn,
    handlePressOut,
    animatedStyle,
  };
};

// === 5. GLOW ANIMATION HOOK ===
export const useGlowAnimation = (
  color: string = Theme.colors.primary[500],
  intensity = 1,
  duration = 2000
) => {
  const glowIntensity = useSharedValue(0);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const animate = () => {
      glowIntensity.value = withSequence(
        withTiming(intensity, { duration: duration / 2 }),
        withTiming(0, { duration: duration / 2 })
      );
    };

    const interval = setInterval(animate, duration);
    animate(); // Start immediately

    return () => clearInterval(interval);
  }, [glowIntensity, intensity, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: interpolate(
      glowIntensity.value,
      [0, 1],
      [0.1, 0.8],
      Extrapolate.CLAMP
    ),
    shadowRadius: interpolate(
      glowIntensity.value,
      [0, 1],
      [4, 16],
      Extrapolate.CLAMP
    ),
    elevation: interpolate(
      glowIntensity.value,
      [0, 1],
      [2, 12],
      Extrapolate.CLAMP
    ),
  }));

  return {
    animatedStyle,
  };
};

// === 6. MAGNETIC EFFECT HOOK ===
export const useMagneticEffect = (
  sensitivity = 0.3,
  maxDistance = 30
) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const handleTouchStart = useCallback(
    (touchX: number, touchY: number, centerX: number, centerY: number) => {
      if (prefersReducedMotion) return;

      const deltaX = touchX - centerX;
      const deltaY = touchY - centerY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance < maxDistance) {
        translateX.value = withSpring(deltaX * sensitivity, Theme.motion.springs.gentle);
        translateY.value = withSpring(deltaY * sensitivity, Theme.motion.springs.gentle);
      } else {
        const angle = Math.atan2(deltaY, deltaX);
        translateX.value = withSpring(
          Math.cos(angle) * maxDistance * sensitivity,
          Theme.motion.springs.gentle
        );
        translateY.value = withSpring(
          Math.sin(angle) * maxDistance * sensitivity,
          Theme.motion.springs.gentle
        );
      }
    },
    [translateX, translateY, sensitivity, maxDistance]
  );

  const handleTouchEnd = useCallback(() => {
    if (prefersReducedMotion) return;

    translateX.value = withSpring(0, Theme.motion.springs.gentle);
    translateY.value = withSpring(0, Theme.motion.springs.gentle);
  }, [translateX, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ] as const,
  }));

  return {
    handleTouchStart,
    handleTouchEnd,
    animatedStyle,
  };
};

// === 7. SWIPE GESTURE HOOK ===
export const useSwipeGesture = (
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  onSwipeUp?: () => void,
  threshold = 120
) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onStart: () => {
      // Optional: Add haptic feedback on start
    },
    onActive: (event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    },
    onEnd: (event) => {
      const { translationX, translationY, velocityX, velocityY } = event;
      const absX = Math.abs(translationX);
      const absY = Math.abs(translationY);

      // Determine swipe direction
      if (absX > threshold && absX > absY) {
        // Horizontal swipe
        if (translationX > 0) {
          // Swipe right
          translateX.value = withTiming(SCREEN_WIDTH + 100, {
            duration: Theme.motion.timings.standard,
          });
          opacity.value = withTiming(0, { duration: Theme.motion.timings.standard });
          if (onSwipeRight) runOnJS(onSwipeRight)();
        } else {
          // Swipe left
          translateX.value = withTiming(-SCREEN_WIDTH - 100, {
            duration: Theme.motion.timings.standard,
          });
          opacity.value = withTiming(0, { duration: Theme.motion.timings.standard });
          if (onSwipeLeft) runOnJS(onSwipeLeft)();
        }
      } else if (absY > threshold && translationY < 0) {
        // Swipe up
        translateY.value = withTiming(-SCREEN_HEIGHT - 100, {
          duration: Theme.motion.timings.standard,
        });
        opacity.value = withTiming(0, { duration: Theme.motion.timings.standard });
        if (onSwipeUp) runOnJS(onSwipeUp)();
      } else {
        // Return to center
        translateX.value = withSpring(0, Theme.motion.springs.standard);
        translateY.value = withSpring(0, Theme.motion.springs.standard);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    const rotation = interpolate(
      translateX.value,
      [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      [-10, 0, 10],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotation}deg` },
      ] as const,
      opacity: opacity.value,
    };
  });

  return {
    gestureHandler,
    animatedStyle,
    translateX,
    translateY,
  };
};

// === 8. RIPPLE EFFECT HOOK ===
export const useRippleEffect = () => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  const startRipple = useCallback(() => {
    if (prefersReducedMotion) return;

    scale.value = 0;
    opacity.value = 0.6;

    scale.value = withTiming(2, { duration: Theme.motion.timings.standard });
    opacity.value = withTiming(0, { duration: Theme.motion.timings.standard });
  }, [scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return {
    startRipple,
    animatedStyle,
  };
};

// === 9. SHIMMER EFFECT HOOK ===
export const useShimmerEffect = (duration = 2000) => {
  const translateX = useSharedValue(-100);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const animate = () => {
      translateX.value = withSequence(
        withTiming(100, { duration: duration / 2 }),
        withDelay(500, withTiming(-100, { duration: 0 }))
      );
    };

    const interval = setInterval(animate, duration);
    animate(); // Start immediately

    return () => clearInterval(interval);
  }, [translateX, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return {
    animatedStyle,
  };
};

// === 10. SCROLL TRIGGERED ANIMATION HOOK ===
export const useScrollAnimation = (
  triggerPoint = 0.8,
  config: keyof typeof Theme.motion.springs = 'gentle'
) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);
  const [isVisible, setIsVisible] = useState(false);

  const checkVisibility = useCallback(
    (scrollY: number, elementY: number, elementHeight: number) => {
      const windowHeight = SCREEN_HEIGHT;
      const triggerY = elementY + elementHeight * triggerPoint;

      if (scrollY + windowHeight > triggerY && !isVisible) {
        setIsVisible(true);
        if (!prefersReducedMotion) {
          opacity.value = withSpring(1, Theme.motion.springs[config]);
          translateY.value = withSpring(0, Theme.motion.springs[config]);
        } else {
          opacity.value = withTiming(1, { duration: Theme.motion.timings.standard });
          translateY.value = withTiming(0, { duration: Theme.motion.timings.standard });
        }
      }
    },
    [opacity, translateY, triggerPoint, config, isVisible]
  );

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return {
    isVisible,
    checkVisibility,
    animatedStyle,
  };
};

// === EXPORT ALL HOOKS ===
export const UnifiedAnimations = {
  useSpringAnimation,
  useEntranceAnimation,
  useStaggeredAnimation,
  usePressAnimation,
  useGlowAnimation,
  useMagneticEffect,
  useSwipeGesture,
  useRippleEffect,
  useShimmerEffect,
  useScrollAnimation,
};

export default UnifiedAnimations;
