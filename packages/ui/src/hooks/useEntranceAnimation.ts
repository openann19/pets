/**
 * Entrance Animation Hook
 * Provides entrance animations for components
 */

import { useRef, useCallback, useEffect } from 'react';
import { Animated } from 'react-native';

export type EntranceType = 'fadeIn' | 'slideIn' | 'scaleIn' | 'bounceIn';

export const useEntranceAnimation = (
  type: EntranceType = 'fadeIn',
  delay: number = 0,
  duration: number = 300
) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  const start = useCallback(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration,
      delay,
      useNativeDriver: true,
    }).start();
  }, [animatedValue, duration, delay]);

  const reset = useCallback(() => {
    animatedValue.setValue(0);
  }, [animatedValue]);

  useEffect(() => {
    start();
  }, [start]);

  const getAnimatedStyle = () => {
    switch (type) {
      case 'fadeIn':
        return {
          opacity: animatedValue,
        };
      case 'slideIn':
        return {
          opacity: animatedValue,
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        };
      case 'scaleIn':
        return {
          opacity: animatedValue,
          transform: [
            {
              scale: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
          ],
        };
      case 'bounceIn':
        return {
          opacity: animatedValue,
          transform: [
            {
              scale: animatedValue.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.3, 1.1, 1],
              }),
            },
          ],
        };
      default:
        return {
          opacity: animatedValue,
        };
    }
  };

  return {
    animatedValue,
    start,
    reset,
    getAnimatedStyle,
  };
};
