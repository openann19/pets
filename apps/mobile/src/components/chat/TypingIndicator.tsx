import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';

interface TypingIndicatorProps {
  isVisible: boolean;
  typingUsers?: string[];
}

/**
 * Animated Typing Indicator Component
 * Shows when other users are typing with smooth animations
 */
export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  isVisible,
  typingUsers = []
}) => {
  const { isDark } = useTheme();
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    if (isVisible) {
      dot1.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 400 }),
          withDelay(600, withTiming(0, { duration: 400 }))
        ),
        -1,
        false
      );
      dot2.value = withRepeat(
        withSequence(
          withDelay(200, withTiming(1, { duration: 400 })),
          withDelay(600, withTiming(0, { duration: 400 }))
        ),
        -1,
        false
      );
      dot3.value = withRepeat(
        withSequence(
          withDelay(400, withTiming(1, { duration: 400 })),
          withDelay(600, withTiming(0, { duration: 400 }))
        ),
        -1,
        false
      );
    } else {
      dot1.value = withTiming(0, { duration: 200 });
      dot2.value = withTiming(0, { duration: 200 });
      dot3.value = withTiming(0, { duration: 200 });
    }
  }, [isVisible, dot1, dot2, dot3]);

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return 'Someone is typing...';
    } else if (typingUsers.length > 1) {
      return `${typingUsers.length} people are typing...`;
    }
    return 'Typing...';
  };

  const animatedStyle1 = useAnimatedStyle(() => ({
    transform: [{ scaleY: 0.6 + (dot1.value * 0.4) }],
  }));

  const animatedStyle2 = useAnimatedStyle(() => ({
    transform: [{ scaleY: 0.6 + (dot2.value * 0.4) }],
  }));

  const animatedStyle3 = useAnimatedStyle(() => ({
    transform: [{ scaleY: 0.6 + (dot3.value * 0.4) }],
  }));

  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      <View style={[styles.bubble, isDark ? styles.bubbleDark : styles.bubbleLight]}>
        <View style={styles.dotsContainer}>
          <Animated.View
            style={[
              styles.dot,
              isDark ? styles.dotDark : styles.dotLight,
              animatedStyle1,
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              isDark ? styles.dotDark : styles.dotLight,
              animatedStyle2,
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              isDark ? styles.dotDark : styles.dotLight,
              animatedStyle3,
            ]}
          />
        </View>
      </View>
      <View style={styles.textContainer}>
        <Text
          style={[
            styles.typingText,
            isDark ? styles.typingTextDark : styles.typingTextLight,
          ]}
        >
          {getTypingText()}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  bubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  bubbleLight: {
    backgroundColor: '#F0F0F0',
  },
  bubbleDark: {
    backgroundColor: '#2C2C2C',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotLight: {
    backgroundColor: '#666',
  },
  dotDark: {
    backgroundColor: '#CCC',
  },
  textContainer: {
    marginLeft: 8,
  },
  typingText: {
    fontSize: 12,
  },
  typingTextLight: {
    color: '#666',
  },
  typingTextDark: {
    color: '#CCC',
  },
});
