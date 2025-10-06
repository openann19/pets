import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import {
  Dimensions,
  InteractionManager,
  StatusBar,
  Text,
  View
} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming
} from 'react-native-reanimated';

import {
  EliteButton,
  EliteContainer
} from '../../components/EliteComponents';
import { useTheme } from '../../contexts/ThemeContext';
import { AnimationConfigs, Spacing } from '../../styles/GlobalStyles';

const { width, height } = Dimensions.get('window');

type OnboardingStackParamList = {
  UserIntent: undefined;
  PetProfileSetup: { userIntent: string };
  PreferencesSetup: { userIntent: string };
  Welcome: undefined;
};

type WelcomeScreenProps = NativeStackScreenProps<OnboardingStackParamList, 'Welcome'>;

const SPRING_CONFIG = {
  damping: 15,
  stiffness: 300,
  mass: 1,
};

const WelcomeScreen = ({ navigation }: WelcomeScreenProps) => {
  // Theme context
  const { colors, styles, isDark } = useTheme();
  const localStyles = createLocalStyles(colors);
  
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
  }, []);

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

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const handleGetStarted = async () => {
    try {
      // Elite haptic feedback
      runOnJS(triggerHaptic)();
      
      // Mark onboarding as complete
      await AsyncStorage.setItem('onboarding_complete', 'true');
      
      // Celebration animation before navigation
      confettiScale.value = withSequence(
        withSpring(1.5, AnimationConfigs.springBouncy),
        withSpring(1, AnimationConfigs.spring)
      );
      
      console.log('🎉 Onboarding completed! Welcome to PawfectMatch!');
      
      // Navigate to main app after celebration
      setTimeout(() => {
        require('react-native').DevSettings?.reload?.();
      }, 800);
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  return (
    <EliteContainer gradient={isDark ? "gradientPrimary" : "gradientSuccess"} style={{ backgroundColor: colors.gray100 }}>
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
              colors={[colors.success, `${colors.success  }DD`]}
              style={localStyles.eliteLogoGradient}
            >
              <Text style={localStyles.eliteLogo}>🐾</Text>
            </LinearGradient>
          </BlurView>
        </Animated.View>

        {/* Elite Title */}
        <Animated.View style={titleAnimatedStyle}>
          <Text style={styles.title}>You're All Set!</Text>
          <View style={localStyles.eliteTitleAccent} />
        </Animated.View>

        {/* Elite Subtitle */}
        <Animated.View style={subtitleAnimatedStyle}>
          <Text style={[styles.subtitle, localStyles.eliteSubtitle, { color: colors.gray600 }]}>
            Welcome to the PawfectMatch community! Your profile is ready and we're excited to help you find amazing connections.
          </Text>
        </Animated.View>

        {/* Elite Features */}
        <Animated.View style={[localStyles.eliteFeaturesContainer, featuresAnimatedStyle]}>
          <BlurView intensity={20} style={localStyles.eliteFeaturesBlur}>
            <View style={localStyles.eliteFeature}>
              <LinearGradient
                colors={[colors.secondary, colors.secondaryLight]}
                style={localStyles.eliteFeatureIconContainer}
              >
                <Ionicons name="heart" size={24} color={colors.white} />
              </LinearGradient>
              <View style={localStyles.eliteFeatureText}>
                <Text style={[localStyles.eliteFeatureTitle, { color: colors.gray800 }]}>Smart Matching</Text>
                <Text style={[localStyles.eliteFeatureDescription, { color: colors.gray600 }]}>AI-powered recommendations based on your preferences</Text>
              </View>
            </View>

            <View style={styles.eliteFeature}>
              <LinearGradient
                colors={[colors.primary, colors.primaryLight]}
                style={styles.eliteFeatureIconContainer}
              >
                <Ionicons name="chatbubbles" size={24} color={colors.white} />
              </LinearGradient>
              <View style={styles.eliteFeatureText}>
                <Text style={[styles.eliteFeatureTitle, { color: colors.gray800 }]}>Safe Messaging</Text>
                <Text style={[styles.eliteFeatureDescription, { color: colors.gray600 }]}>Connect securely with other pet lovers</Text>
              </View>
            </View>

            <View style={styles.eliteFeature}>
              <LinearGradient
                colors={[colors.accent, colors.accentLight]}
                style={styles.eliteFeatureIconContainer}
              >
                <Ionicons name="location" size={24} color={colors.white} />
              </LinearGradient>
              <View style={styles.eliteFeatureText}>
                <Text style={[styles.eliteFeatureTitle, { color: colors.gray800 }]}>Local Connections</Text>
                <Text style={[styles.eliteFeatureDescription, { color: colors.gray600 }]}>Find pets and owners in your area</Text>
              </View>
            </View>

            <View style={styles.eliteFeature}>
              <LinearGradient
                colors={[colors.warning, `${colors.warning  }DD`]}
                style={styles.eliteFeatureIconContainer}
              >
                <Ionicons name="shield-checkmark" size={24} color={colors.white} />
              </LinearGradient>
              <View style={styles.eliteFeatureText}>
                <Text style={[styles.eliteFeatureTitle, { color: colors.gray800 }]}>Verified Profiles</Text>
                <Text style={[styles.eliteFeatureDescription, { color: colors.gray600 }]}>Trust and safety are our top priorities</Text>
              </View>
            </View>
          </BlurView>
        </Animated.View>

        {/* Elite Pro Tips */}
        <View style={styles.eliteTipsContainer}>
          <BlurView intensity={15} style={styles.eliteTipsBlur}>
            <View style={styles.eliteTipsHeader}>
              <Ionicons name="bulb" size={20} color={colors.warning} />
              <Text style={[styles.eliteTipsTitle, { color: colors.gray800 }]}>Pro Tips</Text>
            </View>
            <View style={styles.eliteTipsList}>
              <View style={styles.eliteTip}>
                <Ionicons name="camera" size={16} color={colors.success} />
                <Text style={[styles.eliteTipText, { color: colors.gray700 }]}>Add photos to get 3x more matches</Text>
              </View>
              <View style={styles.eliteTip}>
                <Ionicons name="heart" size={16} color={colors.secondary} />
                <Text style={[styles.eliteTipText, { color: colors.gray700 }]}>Be honest about your pet's personality</Text>
              </View>
              <View style={styles.eliteTip}>
                <Ionicons name="time" size={16} color={colors.primary} />
                <Text style={[styles.eliteTipText, { color: colors.gray700 }]}>Respond to messages within 24 hours</Text>
              </View>
            </View>
          </BlurView>
        </View>
      </View>

      {/* Elite Get Started Button */}
      <Animated.View style={[styles.eliteButtonContainer, buttonAnimatedStyle]}>
        <EliteButton
          title="Start Matching! 🚀"
          size="large"
          icon="rocket"
          onPress={handleGetStarted}
          gradient={[colors.success, `${colors.success  }DD`]}
          style={styles.eliteGetStartedButton}
        />
        
        <Text style={[styles.eliteFooterText, { color: colors.gray500 }]}>
          You can update your preferences anytime in settings
        </Text>
      </Animated.View>
    </EliteContainer>
  );
};

const createLocalStyles = (colors: any) => ({
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
    backgroundColor: colors.success,
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
    backgroundColor: colors.glassWhiteLight,
    borderWidth: 1,
    borderColor: colors.glassWhiteDark,
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
    color: colors.gray800,
    marginBottom: Spacing.xs,
  },
  eliteFeatureDescription: {
    fontSize: 14,
    color: colors.gray600,
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
    backgroundColor: colors.glassWhiteLight,
    borderWidth: 1,
    borderColor: colors.glassWhiteDark,
  },
  eliteTipsHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: Spacing.lg,
  },
  eliteTipsTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.gray800,
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
    color: colors.gray600,
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
    color: colors.gray500,
    textAlign: 'center' as const,
    fontWeight: '500' as const,
  },
});

export default WelcomeScreen;
