/**
 * Spring Animation Hook
 * Provides smooth spring-based animations
 */

import { useRef, useCallback } from 'react';
import { Animated } from 'react-native';

export interface SpringConfig {
  tension?: number;
  friction?: number;
  mass?: number;
}

export const useSpringAnimation = (config: SpringConfig = {}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  const animate = useCallback((toValue: number, callback?: () => void) => {
    Animated.spring(animatedValue, {
      toValue,
      useNativeDriver: true,
      ...config,
    }).start(callback);
  }, [animatedValue, config]);

  const reset = useCallback(() => {
    animatedValue.setValue(0);
  }, [animatedValue]);

  return {
    animatedValue,
    animate,
    reset,
  };
};
