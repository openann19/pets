import { Ionicons } from '@expo/vector-icons';
import { logger } from '@pawfectmatch/core';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import {
  InteractionManager,
  SafeAreaView,
  StatusBar,
  Text,
  View
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { EliteButton } from '../../components/EliteComponents';
import { useTheme } from '../../contexts/ThemeContext';

// Constants for styling
const Colors = {
  success: '#10b981',
  warning: '#f59e0b',
  primary: '#3b82f6',
  secondary: '#ec4899',
  gray800: '#1f2937',
  gray700: '#374151',
  gray600: '#4b5563',
  gray500: '#6b7280',
  glassWhiteLight: 'rgba(255, 255, 255, 0.1)',
  glassWhiteDark: 'rgba(255, 255, 255, 0.2)',
};

const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
};

// Animation configurations for consistent animations across the app
const AnimationConfigs = {
  spring: {
    damping: 15,
    stiffness: 300,
    mass: 1,
    overshootClamping: false,
  } as const,
  springBouncy: {
    damping: 10,
    stiffness: 180,
    mass: 1,
    overshootClamping: false,
  } as const,
  timing: {
    duration: 400,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  } as const,
} as const;

const WelcomeScreen = () => {
  // Theme context
  const { colors, isDark } = useTheme();

  // Animation values
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(30);
  const subtitleOpacity = useSharedValue(0);
  const subtitleTranslateY = useSharedValue(30);
  const featuresOpacity = useSharedValue(0);
  const featuresTranslateY = useSharedValue(30);
  const buttonOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(0.8);
  const confettiScale = useSharedValue(0);

  useEffect(() => {
    StatusBar.setBarStyle('dark-content');

    // Elite staggered entrance animations
    InteractionManager.runAfterInteractions(() => {
      // Logo entrance with bounce
      logoScale.value = withSpring(1, AnimationConfigs.springBouncy);
      logoOpacity.value = withTiming(1, AnimationConfigs.timing);

      // Title with elegant slide-up
      titleOpacity.value = withDelay(300, withTiming(1, AnimationConfigs.timing));
      titleTranslateY.value = withDelay(300, withSpring(0, AnimationConfigs.spring));

      // Subtitle follows smoothly
      subtitleOpacity.value = withDelay(600, withTiming(1, AnimationConfigs.timing));
      subtitleTranslateY.value = withDelay(600, withSpring(0, AnimationConfigs.spring));

      // Features with subtle delay
      featuresOpacity.value = withDelay(900, withTiming(1, AnimationConfigs.timing));
      featuresTranslateY.value = withDelay(900, withSpring(0, AnimationConfigs.spring));

      // Button with satisfying scale
      buttonOpacity.value = withDelay(1200, withTiming(1, AnimationConfigs.timing));
      buttonScale.value = withDelay(1200, withSpring(1, AnimationConfigs.springBouncy));

      // Confetti celebration
      confettiScale.value = withDelay(500, withSequence(
        withSpring(1.3, AnimationConfigs.springBouncy),
        withSpring(1, AnimationConfigs.spring)
      ));
    });
  }, [buttonOpacity, buttonScale, confettiScale, featuresOpacity, featuresTranslateY, logoOpacity, logoScale, subtitleOpacity, subtitleTranslateY, titleOpacity, titleTranslateY]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const subtitleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: subtitleTranslateY.value }],
  }));

  const featuresAnimatedStyle = useAnimatedStyle(() => ({
    opacity: featuresOpacity.value,
    transform: [{ translateY: featuresTranslateY.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ scale: buttonScale.value }],
  }));

  const confettiAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: confettiScale.value }],
  }));

  const handleGetStarted = async () => {
    try {
      // Elite haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      // Mark onboarding as complete
      await AsyncStorage.setItem('onboarding_complete', 'true');

      // Celebration animation before navigation
      confettiScale.value = withSequence(
        withSpring(1.5, AnimationConfigs.springBouncy),
        withSpring(1, AnimationConfigs.spring)
      );

      logger.info('🎉 Onboarding completed! Welcome to PawfectMatch!');

      // Navigate to main app after celebration
      setTimeout(() => {
        // Type-safe reload for development
        if (__DEV__ && require('react-native').DevSettings?.reload) {
          require('react-native').DevSettings.reload();
        }
      }, 800);
    } catch (error) {
      logger.error('Error saving onboarding status', { error });
    }
  };

  // Custom EliteContainer component
  const EliteContainer = ({ children }: { children: React.ReactNode }) => (
    <LinearGradient
      colors={isDark ? ['#1e40af', '#3b82f6'] : ['#10b981', '#059669']}
      style={{ flex: 1, backgroundColor: isDark ? '#1e40af' : '#10b981' }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        {children}
      </SafeAreaView>
    </LinearGradient>
  );

  return (
    <EliteContainer>
      {/* Elite Confetti Background */}
      <Animated.View style={[localStyles.eliteConfettiContainer, confettiAnimatedStyle]}>
        <Text style={[localStyles.eliteConfetti, { top: '10%', left: '20%' }]}>🎉</Text>
        <Text style={[localStyles.eliteConfetti, { top: '15%', right: '25%' }]}>✨</Text>
        <Text style={[localStyles.eliteConfetti, { top: '20%', left: '70%' }]}>🎊</Text>
        <Text style={[localStyles.eliteConfetti, { top: '25%', left: '10%' }]}>💖</Text>
        <Text style={[localStyles.eliteConfetti, { top: '30%', right: '15%' }]}>🐾</Text>
        <Text style={[localStyles.eliteConfetti, { top: '35%', left: '80%' }]}>⭐</Text>
        <Text style={[localStyles.eliteConfetti, { top: '40%', left: '15%' }]}>🌟</Text>
        <Text style={[localStyles.eliteConfetti, { top: '45%', right: '30%' }]}>💕</Text>
      </Animated.View>

      <View style={localStyles.eliteContent}>
        {/* Elite Logo with Glassmorphic Design */}
        <Animated.View style={[localStyles.eliteLogoContainer, logoAnimatedStyle]}>
          <BlurView intensity={30} style={localStyles.eliteLogoBlur}>
            <LinearGradient
              colors={[colors.success, `${colors.success}DD`]}
              style={localStyles.eliteLogoGradient}
            >
              <Text style={localStyles.eliteLogo}>🐾</Text>
            </LinearGradient>
          </BlurView>
        </Animated.View>

        {/* Elite Title */}
        <Animated.View style={titleAnimatedStyle}>
          <Text style={localStyles.title}>You're All Set!</Text>
          <View style={localStyles.eliteTitleAccent} />
        </Animated.View>

        {/* Elite Subtitle */}
        <Animated.View style={subtitleAnimatedStyle}>
          <Text style={[localStyles.subtitle, localStyles.eliteSubtitle, { color: colors.gray600 }]}>
            Welcome to the PawfectMatch community! Your profile is ready and we're excited to help you find amazing connections.
          </Text>
        </Animated.View>

        {/* Elite Features */}
        <Animated.View style={[localStyles.eliteFeaturesContainer, featuresAnimatedStyle]}>
          <BlurView intensity={20} style={localStyles.eliteFeaturesBlur}>
            <View style={localStyles.eliteFeature}>
              <LinearGradient
                colors={[colors.secondary || '#ec4899', `${colors.secondary || '#ec4899'}DD`]}
                style={localStyles.eliteFeatureIconContainer}
              >
                <Ionicons name="heart" size={24} color={colors.white || '#ffffff'} />
              </LinearGradient>
              <View style={localStyles.eliteFeatureText}>
                <Text style={[localStyles.eliteFeatureTitle, { color: colors.gray800 }]}>Smart Matching</Text>
                <Text style={[localStyles.eliteFeatureDescription, { color: colors.gray600 }]}>AI-powered recommendations based on your preferences</Text>
              </View>
            </View>

            <View style={localStyles.eliteFeature}>
              <LinearGradient
                colors={[colors.primary || '#3b82f6', `${colors.primary || '#3b82f6'}DD`]}
                style={localStyles.eliteFeatureIconContainer}
              >
                <Ionicons name="chatbubbles" size={24} color={colors.white || '#ffffff'} />
              </LinearGradient>
              <View style={localStyles.eliteFeatureText}>
                <Text style={[localStyles.eliteFeatureTitle, { color: colors.gray800 }]}>Safe Messaging</Text>
                <Text style={[localStyles.eliteFeatureDescription, { color: colors.gray600 }]}>Connect securely with other pet lovers</Text>
              </View>
            </View>

            <View style={localStyles.eliteFeature}>
              <LinearGradient
                colors={[colors.accent || '#f59e0b', `${colors.accent || '#f59e0b'}DD`]}
                style={localStyles.eliteFeatureIconContainer}
              >
                <Ionicons name="location" size={24} color={colors.white || '#ffffff'} />
              </LinearGradient>
              <View style={localStyles.eliteFeatureText}>
                <Text style={[localStyles.eliteFeatureTitle, { color: colors.gray800 }]}>Local Connections</Text>
                <Text style={[localStyles.eliteFeatureDescription, { color: colors.gray600 }]}>Find pets and owners in your area</Text>
              </View>
            </View>

            <View style={localStyles.eliteFeature}>
              <LinearGradient
                colors={[colors.warning, `${colors.warning}DD`]}
                style={localStyles.eliteFeatureIconContainer}
              >
                <Ionicons name="shield-checkmark" size={24} color={colors.white} />
              </LinearGradient>
              <View style={localStyles.eliteFeatureText}>
                <Text style={[localStyles.eliteFeatureTitle, { color: colors.gray800 }]}>Verified Profiles</Text>
                <Text style={[localStyles.eliteFeatureDescription, { color: colors.gray600 }]}>Trust and safety are our top priorities</Text>
              </View>
            </View>
          </BlurView>
        </Animated.View>

        {/* Elite Pro Tips */}
        <View style={localStyles.eliteTipsContainer}>
          <BlurView intensity={15} style={localStyles.eliteTipsBlur}>
            <View style={localStyles.eliteTipsHeader}>
              <Ionicons name="bulb" size={20} color={colors.warning} />
              <Text style={[localStyles.eliteTipsTitle, { color: colors.gray800 }]}>Pro Tips</Text>
            </View>
            <View style={localStyles.eliteTipsList}>
              <View style={localStyles.eliteTip}>
                <Ionicons name="camera" size={16} color={colors.success} />
                <Text style={[localStyles.eliteTipText, { color: colors.gray700 }]}>Add photos to get 3x more matches</Text>
              </View>
              <View style={localStyles.eliteTip}>
                <Ionicons name="heart" size={16} color={colors.secondary} />
                <Text style={[localStyles.eliteTipText, { color: colors.gray700 }]}>Be honest about your pet's personality</Text>
              </View>
              <View style={localStyles.eliteTip}>
                <Ionicons name="time" size={16} color={colors.primary} />
                <Text style={[localStyles.eliteTipText, { color: colors.gray700 }]}>Respond to messages within 24 hours</Text>
              </View>
            </View>
          </BlurView>
        </View>
      </View>

      {/* Elite Get Started Button */}
      <Animated.View style={[localStyles.eliteButtonContainer, buttonAnimatedStyle]}>
        <EliteButton
          title="Start Matching! 🚀"
          size="large"
          icon="rocket"
          onPress={handleGetStarted}
          gradient={[colors.success, `${colors.success}DD`]}
          style={localStyles.eliteGetStartedButton}
        />

        <Text style={[localStyles.eliteFooterText, { color: colors.gray500 }]}>
          You can update your preferences anytime in settings
        </Text>
      </Animated.View>
    </EliteContainer>
  );
};

const localStyles = {
  title: {
    fontSize: 40,
    fontWeight: 'bold' as const,
    color: '#fff',
    textAlign: 'center' as const,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 18,
    color: '#f0f0f0',
    textAlign: 'center' as const,
  },
  // === ELITE WELCOME STYLES ===
  eliteContent: {
    flex: 1,
    justifyContent: 'center' as const,
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing['4xl'],
  },

  // === ELITE CONFETTI ===
  eliteConfettiContainer: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  eliteConfetti: {
    position: 'absolute' as const,
    fontSize: 32,
    opacity: 0.8,
  },

  // === ELITE LOGO ===
  eliteLogoContainer: {
    alignItems: 'center' as const,
    marginBottom: Spacing['6xl'],
  },
  eliteLogoBlur: {
    borderRadius: 40,
    overflow: 'hidden' as const,
    padding: Spacing.lg,
  },
  eliteLogoGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  eliteLogo: {
    fontSize: 40,
  },

  // === ELITE TITLE ===
  eliteTitleAccent: {
    width: 60,
    height: 4,
    backgroundColor: Colors.success,
    borderRadius: 2,
    alignSelf: 'center' as const,
    marginTop: Spacing.md,
  },
  eliteSubtitle: {
    marginBottom: Spacing['5xl'],
  },

  // === ELITE FEATURES ===
  eliteFeaturesContainer: {
    marginBottom: Spacing['5xl'],
  },
  eliteFeaturesBlur: {
    borderRadius: 20,
    padding: Spacing['2xl'],
    overflow: 'hidden' as const,
    backgroundColor: Colors.glassWhiteLight,
    borderWidth: 1,
    borderColor: Colors.glassWhiteDark,
  },
  eliteFeature: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: Spacing.xl,
  },
  eliteFeatureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: Spacing.lg,
  },
  eliteFeatureText: {
    flex: 1,
  },
  eliteFeatureTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.gray800,
    marginBottom: Spacing.xs,
  },
  eliteFeatureDescription: {
    fontSize: 14,
    color: Colors.gray600,
    lineHeight: 20,
  },

  // === ELITE TIPS ===
  eliteTipsContainer: {
    marginBottom: Spacing['5xl'],
  },
  eliteTipsBlur: {
    borderRadius: 16,
    padding: Spacing.xl,
    overflow: 'hidden' as const,
    backgroundColor: Colors.glassWhiteLight,
    borderWidth: 1,
    borderColor: Colors.glassWhiteDark,
  },
  eliteTipsHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: Spacing.lg,
  },
  eliteTipsTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.gray800,
    marginLeft: Spacing.sm,
  },
  eliteTipsList: {
    gap: Spacing.md,
  },
  eliteTip: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: Spacing.sm,
  },
  eliteTipText: {
    fontSize: 14,
    color: Colors.gray600,
    marginLeft: Spacing.md,
    flex: 1,
  },

  // === ELITE BUTTON ===
  eliteButtonContainer: {
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing['4xl'],
  },
  eliteGetStartedButton: {
    marginBottom: Spacing.xl,
  },
  eliteFooterText: {
    fontSize: 12,
    color: Colors.gray500,
    textAlign: 'center' as const,
    fontWeight: '500' as const,
  },
};

export default WelcomeScreen;
