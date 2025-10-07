/**
 * Staggered Animation Hook
 * Provides staggered animations for lists
 */

import { useRef, useCallback } from 'react';
import { Animated } from 'react-native';

export const useStaggeredAnimation = (
  itemCount: number,
  delay: number = 100,
  duration: number = 300
) => {
  const animatedValues = useRef(
    Array.from({ length: itemCount }, () => new Animated.Value(0))
  ).current;

  const start = useCallback(() => {
    const animations = animatedValues.map((value, index) =>
      Animated.timing(value, {
        toValue: 1,
        duration,
        delay: index * delay,
        useNativeDriver: true,
      })
    );

    Animated.stagger(delay, animations).start();
  }, [animatedValues, duration, delay]);

  const reset = useCallback(() => {
    animatedValues.forEach(value => value.setValue(0));
  }, [animatedValues]);

  const getAnimatedStyle = useCallback((index: number) => {
    return {
      opacity: animatedValues[index],
      transform: [
        {
          translateY: animatedValues[index].interpolate({
            inputRange: [0, 1],
            outputRange: [30, 0],
          }),
        },
      ],
    };
  }, [animatedValues]);

  return {
    animatedValues,
    start,
    reset,
    getAnimatedStyle,
  };
};
