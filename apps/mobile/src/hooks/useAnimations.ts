// Mobile Animations for PawfectMatch Premium
// High-impact micro-interactions for React Native

import * as Haptics from 'expo-haptics';
import { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming, 
  withSequence,
  withDelay,
  interpolate,
  Extrapolate,
  runOnJS
} from 'react-native-reanimated';

// Animation configurations
export const AnimationConfigs = {
  spring: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
  springBouncy: {
    damping: 8,
    stiffness: 200,
    mass: 0.8,
  },
  springGentle: {
    damping: 20,
    stiffness: 100,
    mass: 1.2,
  },
  timing: {
    duration: 300,
  },
  timingFast: {
    duration: 150,
  },
  timingSlow: {
    duration: 500,
  },
};

// Hover lift effect for cards
export const useHoverLift = () => {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const shadowOpacity = useSharedValue(0.1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateY: translateY.value },
      ],
      shadowOpacity: shadowOpacity.value,
      shadowRadius: interpolate(
        shadowOpacity.value,
        [0.1, 0.3],
        [4, 20],
        Extrapolate.CLAMP
      ),
    };
  });

  const onPressIn = () => {
    scale.value = withSpring(1.05, AnimationConfigs.springBouncy);
    translateY.value = withSpring(-8, AnimationConfigs.springBouncy);
    shadowOpacity.value = withTiming(0.3, AnimationConfigs.timingFast);
  };

  const onPressOut = () => {
    scale.value = withSpring(1, AnimationConfigs.springGentle);
    translateY.value = withSpring(0, AnimationConfigs.springGentle);
    shadowOpacity.value = withTiming(0.1, AnimationConfigs.timingFast);
  };

  return { animatedStyle, onPressIn, onPressOut };
};

// Pulse animation for premium elements
export const usePulse = () => {
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const startPulse = () => {
    opacity.value = withSequence(
      withTiming(0.8, { duration: 1000 }),
      withTiming(1, { duration: 1000 })
    );
  };

  return { animatedStyle, startPulse };
};

// Swipe animations for pet cards
export const useSwipeAnimations = () => {
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  const swipeRightStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { rotate: `${rotate.value}deg` },
      ],
      opacity: opacity.value,
    };
  });

  const swipeLeftStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { rotate: `${rotate.value}deg` },
      ],
      opacity: opacity.value,
    };
  });

  const animateSwipeRight = (onComplete?: () => void) => {
    translateX.value = withTiming(300, AnimationConfigs.timing);
    rotate.value = withTiming(15, AnimationConfigs.timing);
    opacity.value = withTiming(0, AnimationConfigs.timing, () => {
      if (onComplete) runOnJS(onComplete)();
    });
  };

  const animateSwipeLeft = (onComplete?: () => void) => {
    translateX.value = withTiming(-300, AnimationConfigs.timing);
    rotate.value = withTiming(-15, AnimationConfigs.timing);
    opacity.value = withTiming(0, AnimationConfigs.timing, () => {
      if (onComplete) runOnJS(onComplete)();
    });
  };

  const resetSwipe = () => {
    translateX.value = withSpring(0, AnimationConfigs.springGentle);
    rotate.value = withSpring(0, AnimationConfigs.springGentle);
    opacity.value = withSpring(1, AnimationConfigs.springGentle);
  };

  return {
    swipeRightStyle,
    swipeLeftStyle,
    animateSwipeRight,
    animateSwipeLeft,
    resetSwipe,
  };
};

// Button micro-interactions
export const useButtonMicro = () => {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateY: translateY.value },
      ],
    };
  });

  const onPressIn = () => {
    scale.value = withSpring(0.98, AnimationConfigs.springBouncy);
    translateY.value = withSpring(2, AnimationConfigs.springBouncy);
    
    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const onPressOut = () => {
    scale.value = withSpring(1, AnimationConfigs.springGentle);
    translateY.value = withSpring(0, AnimationConfigs.springGentle);
  };

  const onHover = () => {
    scale.value = withSpring(1.02, AnimationConfigs.springGentle);
    translateY.value = withSpring(-2, AnimationConfigs.springGentle);
  };

  return { animatedStyle, onPressIn, onPressOut, onHover };
};

// Card entrance animation
export const useCardEntrance = (delay = 0) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);
  const scale = useSharedValue(0.95);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  const startEntrance = () => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 600 }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 600 }));
    scale.value = withDelay(delay, withTiming(1, { duration: 600 }));
  };

  return { animatedStyle, startEntrance };
};

// Shimmer loading effect
export const useShimmer = () => {
  const translateX = useSharedValue(-200);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const startShimmer = () => {
    translateX.value = withTiming(200, { duration: 2000 });
  };

  return { animatedStyle, startShimmer };
};

// Bounce animation for notifications
export const useBounceIn = () => {
  const scale = useSharedValue(0.3);
  const opacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const startBounce = () => {
    scale.value = withSequence(
      withTiming(1.05, { duration: 250 }),
      withTiming(0.9, { duration: 100 }),
      withTiming(1, { duration: 150 })
    );
    opacity.value = withTiming(1, { duration: 250 });
  };

  return { animatedStyle, startBounce };
};

// Glow effect for premium elements
export const useGlow = () => {
  const shadowOpacity = useSharedValue(0);
  const shadowRadius = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      shadowOpacity: shadowOpacity.value,
      shadowRadius: shadowRadius.value,
    };
  });

  const startGlow = () => {
    shadowOpacity.value = withTiming(0.4, AnimationConfigs.timing);
    shadowRadius.value = withTiming(20, AnimationConfigs.timing);
  };

  const stopGlow = () => {
    shadowOpacity.value = withTiming(0, AnimationConfigs.timing);
    shadowRadius.value = withTiming(0, AnimationConfigs.timing);
  };

  return { animatedStyle, startGlow, stopGlow };
};

// Scale hover effect
export const useHoverScale = () => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const onHover = () => {
    scale.value = withSpring(1.05, AnimationConfigs.springGentle);
  };

  const onLeave = () => {
    scale.value = withSpring(1, AnimationConfigs.springGentle);
  };

  return { animatedStyle, onHover, onLeave };
};

// Enhanced haptic feedback
export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'medium') => {
  const hapticTypes = {
    light: Haptics.ImpactFeedbackStyle.Light,
    medium: Haptics.ImpactFeedbackStyle.Medium,
    heavy: Haptics.ImpactFeedbackStyle.Heavy,
  };
  
  Haptics.impactAsync(hapticTypes[type]);
};

// Sound feedback (if available)
export const triggerSound = (type: 'hover' | 'press' = 'press') => {
  // Note: Sound feedback would require additional audio setup
  // This is a placeholder for future implementation
  console.log(`Sound feedback: ${type}`);
};
