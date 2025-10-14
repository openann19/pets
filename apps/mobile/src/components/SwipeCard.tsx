/**
 * Professional SwipeCard Component for React Native
 * Enterprise-grade implementation with proper architecture
 *
 * Features:
 * - Gesture-based swiping with haptic feedback
 * - Smooth animations with spring physics
 * - Photo carousel with navigation
 * - Real-time swipe overlays
 * - Accessibility support
 * - Performance optimized
 * - TypeScript strict mode
 */

import { Ionicons } from '@expo/vector-icons';
import { logger } from '@pawfectmatch/core';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Dimensions, PanResponder, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { api } from '../services/api';
import { haptics } from '../utils/haptics';
import OptimizedImage from './OptimizedImage';

// Local types until core package is properly configured
interface Pet {
  _id: string;
  name: string;
  age: number;
  breed: string;
  photos: string[];
  bio: string;
  distance: number;
  compatibility: number;
  isVerified: boolean;
  tags: string[];
}

// React Native StyleSheet types for SwipeCard
interface SwipeCardStyle {
  card?: {
    position?: 'absolute' | 'relative';
    width?: number | string;
    height?: number | string;
    borderRadius?: number;
    backgroundColor?: string;
    shadowColor?: string;
    shadowOffset?: { width: number; height: number };
    shadowOpacity?: number;
    shadowRadius?: number;
    elevation?: number;
  };
  cardDisabled?: {
    opacity?: number;
  };
  photoContainer?: {
    flex?: number;
    borderRadius?: number;
    overflow?: 'hidden' | 'visible';
    position?: 'absolute' | 'relative';
  };
  photo?: {
    width?: number | string;
    height?: number | string;
  };
  photoIndicators?: {
    position?: 'absolute';
    top?: number;
    left?: number;
    right?: number;
    flexDirection?: 'row';
    gap?: number;
  };
  photoDot?: {
    flex?: number;
    height?: number;
    borderRadius?: number;
    backgroundColor?: string;
  };
  photoNavigation?: {
    position?: 'absolute';
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
    flexDirection?: 'row';
  };
  photoNavLeft?: {
    flex?: number;
  };
  photoNavRight?: {
    flex?: number;
  };
  verifiedBadge?: {
    position?: 'absolute';
    top?: number;
    right?: number;
    backgroundColor?: string;
    borderRadius?: number;
    padding?: number;
  };
  distanceBadge?: {
    position?: 'absolute';
    bottom?: number;
    right?: number;
    backgroundColor?: string;
    paddingHorizontal?: number;
    paddingVertical?: number;
    borderRadius?: number;
  };
  distanceText?: {
    color?: string;
    fontSize?: number;
    fontWeight?: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | 'normal' | 'bold';
  };
  overlay?: {
    position?: 'absolute';
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
    justifyContent?: 'center';
    alignItems?: 'center';
    borderRadius?: number;
  };
  likeOverlay?: {
    backgroundColor?: string;
  };
  nopeOverlay?: {
    backgroundColor?: string;
  };
  superLikeOverlay?: {
    backgroundColor?: string;
  };
  overlayText?: {
    color?: string;
    fontSize?: number;
    fontWeight?: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | 'normal' | 'bold';
    textAlign?: 'center';
    textShadowColor?: string;
    textShadowOffset?: { width: number; height: number };
    textShadowRadius?: number;
  };
  infoGradient?: {
    position?: 'absolute';
    bottom?: number;
    left?: number;
    right?: number;
    height?: number;
    borderBottomLeftRadius?: number;
    borderBottomRightRadius?: number;
  };
  infoContainer?: {
    flex?: number;
    justifyContent?: 'flex-end';
    padding?: number;
  };
  nameRow?: {
    flexDirection?: 'row';
    alignItems?: 'baseline';
    marginBottom?: number;
  };
  name?: {
    fontSize?: number;
    fontWeight?: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | 'normal' | 'bold';
    color?: string;
    marginRight?: number;
  };
  age?: {
    fontSize?: number;
    fontWeight?: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | 'normal' | 'bold';
    color?: string;
  };
  breed?: {
    fontSize?: number;
    color?: string;
    marginBottom?: number;
  };
  compatibilityContainer?: {
    flexDirection?: 'row';
    alignItems?: 'center';
    marginBottom?: number;
  };
  compatibilityBar?: {
    flex?: number;
    height?: number;
    backgroundColor?: string;
    borderRadius?: number;
    marginRight?: number;
  };
  compatibilityFill?: {
    height?: number | string;
    borderRadius?: number;
    backgroundColor?: string;
  };
  compatibilityText?: {
    color?: string;
    fontSize?: number;
    fontWeight?: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | 'normal' | 'bold';
  };
  tagsContainer?: {
    flexDirection?: 'row';
    marginBottom?: number;
    gap?: number;
  };
  tag?: {
    paddingHorizontal?: number;
    paddingVertical?: number;
    borderRadius?: number;
    backgroundColor?: string;
  };
  tagText?: {
    fontSize?: number;
    fontWeight?: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | 'normal' | 'bold';
    color?: string;
  };
  bio?: {
    fontSize?: number;
    color?: string;
    lineHeight?: number;
  };
  [key: string]: unknown; // Allow additional style properties
}

interface SwipeCardProps {
  pet: Pet;
  onSwipeLeft: (pet: Pet) => void;
  onSwipeRight: (pet: Pet) => void;
  onSwipeUp: (pet: Pet) => void;
  isTopCard?: boolean;
  disabled?: boolean;
  style?: SwipeCardStyle;
}

const DEFAULT_SWIPE_CONFIG = {
  threshold: 120,
  rotationMultiplier: 0.1,
  velocityThreshold: 0.3,
  directionalOffset: 80,
};

const DEFAULT_ANIMATION_CONFIG = {
  duration: 300,
  tension: 100,
  friction: 8,
  useNativeDriver: false, // Set to false for transform animations
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const SwipeCard: React.FC<SwipeCardProps> = React.memo(({
  pet,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  isTopCard = false,
  disabled = false,
  style,
}) => {
  const { colors } = useTheme();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isAccessibilityEnabled, setIsAccessibilityEnabled] = useState(false);

  // Swipe processing state
  const [isProcessing, setIsProcessing] = useState(false);

  // Swipe handlers
  const handleLike = useCallback(async (pet: Pet) => {
    setIsProcessing(true);
    try {
      await api.swipePet(pet._id, 'like');
    } catch (error) {
      logger.error('Error liking pet:', { error });
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handlePass = useCallback(async (pet: Pet) => {
    setIsProcessing(true);
    try {
      await api.swipePet(pet._id, 'pass');
    } catch (error) {
      logger.error('Error passing pet:', { error });
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleSuperLike = useCallback(async (pet: Pet) => {
    setIsProcessing(true);
    try {
      await api.swipePet(pet._id, 'superlike');
    } catch (error) {
      logger.error('Error super liking pet:', { error });
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Animation values - memoized for performance
  const animationValues = useMemo(() => ({
    panX: new Animated.Value(0),
    panY: new Animated.Value(0),
    scale: new Animated.Value(isTopCard ? 1 : 0.95),
    opacity: new Animated.Value(isTopCard ? 1 : 0.8),
    likeOpacity: new Animated.Value(0),
    nopeOpacity: new Animated.Value(0),
    superLikeOpacity: new Animated.Value(0),
  }), [isTopCard]);

  const { panX, panY, scale, opacity, likeOpacity, nopeOpacity, superLikeOpacity } = animationValues;

  // Create opacity interpolations for overlay styles
  const likeOverlayOpacity = likeOpacity.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  }) as any;

  const nopeOverlayOpacity = nopeOpacity.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  }) as any;

  const superLikeOverlayOpacity = superLikeOpacity.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  }) as any;

  // Check accessibility settings
  React.useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setIsAccessibilityEnabled);
  }, []);

  // Pan responder for gesture handling
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => !disabled,
      onPanResponderGrant: () => {
        // Haptic feedback on touch
        void haptics.light();
      },
      onPanResponderMove: (_, gestureState) => {
        // Update pan values
        panX.setValue(gestureState.dx);
        panY.setValue(gestureState.dy);

        // Show appropriate overlay based on swipe direction
        if (gestureState.dx > 50) {
          // Swiping right - show like
          const progress = Math.min(gestureState.dx / DEFAULT_SWIPE_CONFIG.threshold, 1);
          likeOpacity.setValue(progress);
          nopeOpacity.setValue(0);
          superLikeOpacity.setValue(0);
        } else if (gestureState.dx < -50) {
          // Swiping left - show nope
          const progress = Math.min(Math.abs(gestureState.dx) / DEFAULT_SWIPE_CONFIG.threshold, 1);
          nopeOpacity.setValue(progress);
          likeOpacity.setValue(0);
          superLikeOpacity.setValue(0);
        } else if (gestureState.dy < -50) {
          // Swiping up - show super like
          const progress = Math.min(Math.abs(gestureState.dy) / DEFAULT_SWIPE_CONFIG.threshold, 1);
          superLikeOpacity.setValue(progress);
          likeOpacity.setValue(0);
          nopeOpacity.setValue(0);
        } else {
          // Reset all overlays
          likeOpacity.setValue(0);
          nopeOpacity.setValue(0);
          superLikeOpacity.setValue(0);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const { dx, dy } = gestureState;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);

        // Determine swipe direction and trigger appropriate action
        if (absDx > DEFAULT_SWIPE_CONFIG.threshold && absDx > absDy) {
          // Horizontal swipe
          if (dx > 0) {
            // Swipe right - like
            animateSwipeRight();
          } else {
            // Swipe left - pass
            animateSwipeLeft();
          }
        } else if (absDy > DEFAULT_SWIPE_CONFIG.threshold && dy < 0) {
          // Swipe up - super like
          animateSwipeUp();
        } else {
          // Return to center
          animateReturn();
        }
      },
    })
  ).current;

  const animateSwipeRight = useCallback(() => {
    if (disabled || isProcessing) return;

    void haptics.medium();

    // Run animations sequentially to avoid type issues
    Animated.timing(panX, {
      toValue: SCREEN_WIDTH + 100,
      duration: isAccessibilityEnabled ? 150 : DEFAULT_ANIMATION_CONFIG.duration,
      useNativeDriver: DEFAULT_ANIMATION_CONFIG.useNativeDriver,
    }).start();

    Animated.timing(panY, {
      toValue: 0,
      duration: isAccessibilityEnabled ? 150 : DEFAULT_ANIMATION_CONFIG.duration,
      useNativeDriver: DEFAULT_ANIMATION_CONFIG.useNativeDriver,
    }).start();

    Animated.timing(opacity, {
      toValue: 0,
      duration: isAccessibilityEnabled ? 150 : DEFAULT_ANIMATION_CONFIG.duration,
      useNativeDriver: DEFAULT_ANIMATION_CONFIG.useNativeDriver,
    }).start(async () => {
      try {
        await handleLike(pet);
        onSwipeRight(pet);
      } catch (error) {
        logger.error('Error handling like:', error);
      }
    });
  }, [disabled, isProcessing, isAccessibilityEnabled, pet, handleLike, onSwipeRight, panX, panY, opacity]);

  const animateSwipeLeft = useCallback(() => {
    if (disabled || isProcessing) return;

    void haptics.medium();

    // Run animations sequentially
    Animated.timing(panX, {
      toValue: -SCREEN_WIDTH - 100,
      duration: isAccessibilityEnabled ? 150 : DEFAULT_ANIMATION_CONFIG.duration,
      useNativeDriver: DEFAULT_ANIMATION_CONFIG.useNativeDriver,
    }).start();

    Animated.timing(panY, {
      toValue: 0,
      duration: isAccessibilityEnabled ? 150 : DEFAULT_ANIMATION_CONFIG.duration,
      useNativeDriver: DEFAULT_ANIMATION_CONFIG.useNativeDriver,
    }).start();

    Animated.timing(opacity, {
      toValue: 0,
      duration: isAccessibilityEnabled ? 150 : DEFAULT_ANIMATION_CONFIG.duration,
      useNativeDriver: DEFAULT_ANIMATION_CONFIG.useNativeDriver,
    }).start(async () => {
      try {
        await handlePass(pet);
        onSwipeLeft(pet);
      } catch (error) {
        logger.error('Error handling pass:', error);
      }
    });
  }, [disabled, isProcessing, isAccessibilityEnabled, pet, handlePass, onSwipeLeft, panX, panY, opacity]);

  const animateSwipeUp = useCallback(() => {
    if (disabled || isProcessing) return;

    void haptics.heavy();

    // Run animations sequentially
    Animated.timing(panX, {
      toValue: 0,
      duration: isAccessibilityEnabled ? 200 : 400,
      useNativeDriver: DEFAULT_ANIMATION_CONFIG.useNativeDriver,
    }).start();

    Animated.timing(panY, {
      toValue: -SCREEN_HEIGHT - 100,
      duration: isAccessibilityEnabled ? 200 : 400,
      useNativeDriver: DEFAULT_ANIMATION_CONFIG.useNativeDriver,
    }).start();

    Animated.timing(opacity, {
      toValue: 0,
      duration: isAccessibilityEnabled ? 200 : 400,
      useNativeDriver: DEFAULT_ANIMATION_CONFIG.useNativeDriver,
    }).start();

    Animated.timing(scale, {
      toValue: 1.1,
      duration: isAccessibilityEnabled ? 100 : 200,
      useNativeDriver: DEFAULT_ANIMATION_CONFIG.useNativeDriver,
    }).start(async () => {
      try {
        await handleSuperLike(pet);
        onSwipeUp(pet);
      } catch (error) {
        logger.error('Error handling super like:', { error });
      }
    });
  }, [disabled, isProcessing, isAccessibilityEnabled, pet, handleSuperLike, onSwipeUp, panX, panY, opacity, scale]);

  const animateReturn = useCallback(() => {
    // Run animations sequentially
    Animated.spring(panX, {
      toValue: 0,
      useNativeDriver: DEFAULT_ANIMATION_CONFIG.useNativeDriver,
      tension: DEFAULT_ANIMATION_CONFIG.tension,
      friction: DEFAULT_ANIMATION_CONFIG.friction,
    }).start();

    Animated.spring(panY, {
      toValue: 0,
      useNativeDriver: DEFAULT_ANIMATION_CONFIG.useNativeDriver,
      tension: DEFAULT_ANIMATION_CONFIG.tension,
      friction: DEFAULT_ANIMATION_CONFIG.friction,
    }).start();

    Animated.timing(likeOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: DEFAULT_ANIMATION_CONFIG.useNativeDriver,
    }).start();

    Animated.timing(nopeOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: DEFAULT_ANIMATION_CONFIG.useNativeDriver,
    }).start();

    Animated.timing(superLikeOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: DEFAULT_ANIMATION_CONFIG.useNativeDriver,
    }).start();
  }, [panX, panY, likeOpacity, nopeOpacity, superLikeOpacity]);

  // Calculate rotation based on pan position - memoized for performance
  const rotate = useMemo(() =>
    panX.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: ['-10deg', '0deg', '10deg'],
      extrapolate: 'clamp',
    }) as any, [panX]
  );

  // Create transform interpolations
  const translateX = panX as any;
  const translateY = panY as any;
  const cardScale = scale as any;
  const cardOpacity = opacity as any;

  const nextPhoto = useCallback(() => {
    if (currentPhotoIndex < pet.photos.length - 1) {
      setCurrentPhotoIndex(prev => prev + 1);
      void haptics.light();
    }
  }, [currentPhotoIndex, pet.photos.length]);

  const prevPhoto = useCallback(() => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(prev => prev - 1);
      void haptics.light();
    }
  }, [currentPhotoIndex]);

  return (
    <Animated.View
      style={[
        styles.card,
        {
          transform: [
            { translateX },
            { translateY },
            { rotate },
            { scale: cardScale },
          ],
          opacity: cardOpacity,
        },
        disabled && styles.cardDisabled,
        style as any,
      ]}
      {...(!disabled ? panResponder.panHandlers : {})}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`Pet profile for ${pet.name}, ${pet.age} years old ${pet.breed}`}
      accessibilityHint="Swipe right to like, left to pass, or up for super like"
    >
      {/* Photo Section */}
      <View style={styles.photoContainer}>
        <OptimizedImage
          source={{ uri: pet.photos[currentPhotoIndex] }}
          style={styles.photo}
          resizeMode="cover"
          priority="high"
          enableCache={true}
        />

        {/* Photo Navigation Dots */}
        <View style={styles.photoIndicators}>
          {pet.photos.map((_, index) => (
            <View
              key={index}
              style={[
                styles.photoDot,
                {
                  backgroundColor: index === currentPhotoIndex ? '#fff' : 'rgba(255,255,255,0.4)',
                },
              ]}
            />
          ))}
        </View>

        {/* Photo Navigation Areas */}
        <View style={styles.photoNavigation}>
          <View style={styles.photoNavLeft} onTouchEnd={prevPhoto} />
          <View style={styles.photoNavRight} onTouchEnd={nextPhoto} />
        </View>

        {/* Verification Badge */}
        {pet.isVerified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
          </View>
        )}

        {/* Distance Badge */}
        <View style={styles.distanceBadge}>
          <Text style={styles.distanceText}>{pet.distance}km away</Text>
        </View>

        {/* Swipe Overlays */}
        <Animated.View style={[styles.overlay, styles.likeOverlay, { opacity: likeOverlayOpacity }]}>
          <Text style={styles.overlayText}>LIKE</Text>
        </Animated.View>

        <Animated.View style={[styles.overlay, styles.nopeOverlay, { opacity: nopeOverlayOpacity }]}>
          <Text style={styles.overlayText}>NOPE</Text>
        </Animated.View>

        <Animated.View style={[styles.overlay, styles.superLikeOverlay, { opacity: superLikeOverlayOpacity }]}>
          <Text style={styles.overlayText}>SUPER LIKE</Text>
        </Animated.View>
      </View>

      {/* Info Section */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.infoGradient}
      >
        <View style={styles.infoContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{pet.name}</Text>
            <Text style={styles.age}>{pet.age}</Text>
          </View>

          <Text style={styles.breed}>{pet.breed}</Text>

          {/* Compatibility Score */}
          <View style={styles.compatibilityContainer}>
            <View style={styles.compatibilityBar}>
              <View
                style={[
                  styles.compatibilityFill,
                  { width: `${pet.compatibility}%`, backgroundColor: colors.primary }
                ]}
              />
            </View>
            <Text style={styles.compatibilityText}>{pet.compatibility}% match</Text>
          </View>

          {/* Tags */}
          <View style={styles.tagsContainer}>
            {pet.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={[styles.tag, { backgroundColor: `${colors.primary}20` }]}>
                <Text style={[styles.tagText, { color: colors.primary }]}>{tag}</Text>
              </View>
            ))}
          </View>

          {/* Bio Preview */}
          <Text style={styles.bio} numberOfLines={2}>
            {pet.bio}
          </Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: SCREEN_WIDTH - 40,
    height: SCREEN_HEIGHT * 0.75,
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  cardDisabled: {
    opacity: 0.6,
  },
  photoContainer: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoIndicators: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    gap: 8,
  },
  photoDot: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },
  photoNavigation: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  photoNavLeft: {
    flex: 1,
  },
  photoNavRight: {
    flex: 1,
  },
  verifiedBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    padding: 4,
  },
  distanceBadge: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  distanceText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  likeOverlay: {
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
  },
  nopeOverlay: {
    backgroundColor: 'rgba(244, 67, 54, 0.8)',
  },
  superLikeOverlay: {
    backgroundColor: 'rgba(33, 150, 243, 0.8)',
  },
  overlayText: {
    color: '#fff',
    fontSize: 48,
    fontWeight: '800',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  infoGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginRight: 8,
  },
  age: {
    fontSize: 24,
    fontWeight: '400',
    color: '#fff',
  },
  breed: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
  },
  compatibilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  compatibilityBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    marginRight: 8,
  },
  compatibilityFill: {
    height: '100%',
    borderRadius: 2,
  },
  compatibilityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bio: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 18,
  },
});

// Display name for debugging
SwipeCard.displayName = 'SwipeCard';

// Export as default
export default SwipeCard;
