import { useEffect } from 'react';
import { Dimensions } from 'react-native';
import {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const { height: _screenHeight } = Dimensions.get('window');

// Enhanced Animation Hooks and Components using react-native-reanimated

export const useSpringAnimation = (
  initialValue: number = 0,
  toValue: number = 1,
  config: Record<string, unknown> = {},
  customConfig: Record<string, unknown> = {}
) => {
  const animatedValue = useSharedValue(initialValue);

  const animate = () => {
    animatedValue.value = withSpring(toValue, {
      stiffness: 100,
      damping: 8,
      ...config,
      ...customConfig,
    });
  };

  return { animatedValue, animate };
};

export const useSequenceAnimation = (
  animations: (() => void)[] = [],
  delay: number = 100
) => {
  const createSequence = () => {
    // For react-native-reanimated, we need to handle sequences differently
    // This is a simplified version
    return () => {
      animations.forEach((anim, index) => {
        setTimeout(anim, index * delay);
      });
    };
  };

  const createStagger = () => {
    return createSequence();
  };

  return { createSequence, createStagger };
};

export const usePulseAnimation = (duration: number = 1000) => {
  const pulseAnim = useSharedValue(1);

  useEffect(() => {
    const startPulse = () => {
      pulseAnim.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: duration / 2, easing: Easing.inOut(Easing.ease) })
        ),
        -1, // infinite
        true // reverse
      );
    };

    startPulse();
  }, [duration, pulseAnim]);

  const start = () => {
    pulseAnim.value = 1;
  };

  const stop = () => {
    pulseAnim.value = 1; // Reset to stop animation
  };

  return { pulseAnim, start, stop };
};

export const useFloatingAnimation = (duration: number = 2000, amplitude: number = 10) => {
  const floatAnim = useSharedValue(0);

  useEffect(() => {
    const startFloat = () => {
      floatAnim.value = withRepeat(
        withSequence(
          withTiming(1, { duration: duration / 2, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: duration / 2, easing: Easing.inOut(Easing.sin) })
        ),
        -1, // infinite
        true // reverse
      );
    };

    startFloat();
  }, [duration, floatAnim]);

  const animatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(floatAnim.value, [0, 1], [0, -amplitude]);
    return {
      transform: [{ translateY }],
    };
  });

  return animatedStyle;
};

export const useBounceAnimation = (duration: number = 800) => {
  const bounceAnim = useSharedValue(0);

  const animate = () => {
    bounceAnim.value = withSequence(
      withTiming(1, { duration: duration * 0.3, easing: Easing.out(Easing.ease) }),
      withTiming(0.8, { duration: duration * 0.2, easing: Easing.out(Easing.ease) }),
      withTiming(1, { duration: duration * 0.2, easing: Easing.out(Easing.ease) }),
      withTiming(0.9, { duration: duration * 0.15, easing: Easing.out(Easing.ease) }),
      withTiming(1, { duration: duration * 0.15, easing: Easing.out(Easing.ease) })
    );
  };

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(bounceAnim.value, [0, 1], [1, 1.1]);
    return {
      transform: [{ scale }],
    };
  });

  return { animatedStyle, animate };
};

export const useFadeInAnimation = (duration: number = 500, delay: number = 0) => {
  const fadeAnim = useSharedValue(0);

  useEffect(() => {
    if (delay > 0) {
      setTimeout(() => {
        fadeAnim.value = withTiming(1, { duration });
      }, delay);
    } else {
      fadeAnim.value = withTiming(1, { duration });
    }
  }, [duration, delay, fadeAnim]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
  }));

  return animatedStyle;
};

export const useSlideInAnimation = (
  direction: 'up' | 'down' | 'left' | 'right' = 'up',
  distance: number = 50,
  duration: number = 500,
  delay: number = 0
) => {
  const slideAnim = useSharedValue(0);

  useEffect(() => {
    const animate = () => {
      slideAnim.value = withDelay(delay, withTiming(1, { duration, easing: Easing.out(Easing.cubic) }));
    };
    animate();
  }, [duration, delay, slideAnim]);

  const animatedStyle = useAnimatedStyle(() => {
    let translateX = 0;
    let translateY = 0;

    switch (direction) {
      case 'up':
        translateY = interpolate(slideAnim.value, [0, 1], [distance, 0]);
        break;
      case 'down':
        translateY = interpolate(slideAnim.value, [0, 1], [-distance, 0]);
        break;
      case 'left':
        translateX = interpolate(slideAnim.value, [0, 1], [distance, 0]);
        break;
      case 'right':
        translateX = interpolate(slideAnim.value, [0, 1], [-distance, 0]);
        break;
    }

    return {
      transform: [{ translateX }, { translateY }],
      opacity: slideAnim.value,
    };
  });

  return animatedStyle;
};

export const useParallaxScroll = (scrollY: any, speed: number = 0.5) => {
  const animatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(scrollY.value, [0, 1000], [0, -500 * speed]);
    return {
      transform: [{ translateY }],
    };
  });

  return animatedStyle;
};

// Utility functions for creating common animation styles
export const createSpringConfig = (stiffness: number = 300, damping: number = 30) => ({
  stiffness,
  damping,
});

export const createTimingConfig = (duration: number = 300, easing: any = Easing.out(Easing.cubic)) => ({
  duration,
  easing,
});

// Predefined animation presets
export const AnimationPresets = {
  spring: createSpringConfig(),
  bounce: createSpringConfig(400, 20),
  slow: createTimingConfig(800),
  fast: createTimingConfig(200),
  fadeIn: { duration: 500, easing: Easing.out(Easing.cubic) },
  slideUp: { distance: 50, duration: 500, direction: 'up' as const },
  slideDown: { distance: 50, duration: 500, direction: 'down' as const },
};
