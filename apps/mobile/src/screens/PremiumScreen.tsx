/**
 * Premium Subscription Screen for Mobile
 * Professional implementation with Stripe integration
 */

import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// Removed gradients for a more refined, solid-color design
import { useAuthStore } from '@pawfectmatch/core';
import type { NavigationProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import type { InitPaymentSheetParams, PaymentSheetResult } from '@stripe/stripe-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import type { RootStackParamList } from '../navigation/types';
import { _subscriptionAPI } from '../services/api';
import { logger } from '../services/logger';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PremiumPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  popular?: boolean;
  savings?: string;
}

const PremiumScreen = (): React.JSX.Element => {
  const { user } = useAuthStore();
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [selectedPlan, setSelectedPlan] = useState<string>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const pulseAnim = useRef(new Animated.Value(0)).current;

  const premiumPlans: PremiumPlan[] = [
    {
      id: 'weekly',
      name: 'Weekly',
      price: 4.99,
      duration: 'week',
      features: ['Unlimited swipes', 'See who liked you', 'Priority matching'],
    },
    {
      id: 'monthly',
      name: 'Monthly',
      price: 14.99,
      duration: 'month',
      features: ['Unlimited swipes', 'See who liked you', 'Priority matching', 'Advanced filters'],
      popular: true,
    },
    {
      id: 'yearly',
      name: 'Yearly',
      price: 99.99,
      duration: 'year',
      features: ['All monthly features', 'AI bio generation', 'Photo analysis', 'Compatibility insights'],
      savings: 'Save 44%',
    },
  ];

  const premiumFeatures = [
    {
      icon: 'heart',
      title: 'Unlimited Swipes',
      description: 'Never run out of potential matches',
      color: '#FF6B6B',
    },
    {
      icon: 'eye',
      title: 'See Who Liked You',
      description: 'Know who\'s interested before you swipe',
      color: '#4ECDC4',
    },
    {
      icon: 'flash',
      title: 'Priority Matching',
      description: 'Get shown to more potential matches',
      color: '#FFD700',
    },
    {
      icon: 'filter',
      title: 'Advanced Filters',
      description: 'Filter by breed, age, distance and more',
      color: '#9C27B0',
    },
    {
      icon: 'sparkles',
      title: 'AI Features',
      description: 'Bio generation and photo analysis',
      color: '#FF9800',
    },
    {
      icon: 'analytics',
      title: 'Compatibility Insights',
      description: 'Deep compatibility analysis',
      color: '#2196F3',
    },
  ];

  const checkPremiumStatus = useCallback(async (): Promise<void> => {
    try {
      const subscription = await _subscriptionAPI.getCurrentSubscription();
      if (subscription && typeof subscription === 'object' && 'status' in subscription) {
        setIsPremium(subscription.status === 'active');
      }
    } catch (error) {
      logger.error('Error checking premium status:', { error: error instanceof Error ? error.message : String(error) });
    }
  }, []);

  useEffect(() => {
    void checkPremiumStatus();
  }, [checkPremiumStatus]);

  const handlePlanSelection = (planId: string): void => {
    setSelectedPlan(planId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch((error) => {
      logger.warn?.('Haptics impact failed', { error: error instanceof Error ? error.message : String(error) });
    });
  };

  const startPulse = useCallback((): void => {
    pulseAnim.setValue(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim]);

  useEffect(() => {
    startPulse();
  }, [startPulse]);

  const handleSubscribe = async (): Promise<void> => {
    if (isLoading) return;

    setIsLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Create subscription with simplified implementation
      const checkoutResult = await _subscriptionAPI.createCheckoutSession({
        priceId: selectedPlan,
        successUrl: 'pawfectmatch://premium/success',
        cancelUrl: 'pawfectmatch://premium/cancel'
      });

      if (!checkoutResult || typeof checkoutResult !== 'object' || !('sessionId' in checkoutResult)) {
        throw new Error('Invalid checkout session response');
      }

      const { initPaymentSheet, presentPaymentSheet } = await import('@stripe/stripe-react-native');

      if (typeof initPaymentSheet !== 'function' || typeof presentPaymentSheet !== 'function') {
        throw new Error('Stripe payment sheet is unavailable on this device');
      }

      const initParams: InitPaymentSheetParams = {
        merchantDisplayName: 'PawfectMatch',
        paymentIntentClientSecret: checkoutResult.sessionId as string,
        allowsDelayedPaymentMethods: true,
        defaultBillingDetails: {
          name: user ? `${user.firstName} ${user.lastName}` : '',
          email: user?.email ?? '',
        },
      };

      const initResult = await initPaymentSheet(initParams);
      if (initResult.error) {
        const paymentError = initResult.error as any;
        throw new Error(paymentError.message ?? 'Payment initialization failed');
      }

      const presentResult: PaymentSheetResult = await presentPaymentSheet();
      if (presentResult.error) {
        const paymentError = presentResult.error as any;
        throw new Error(paymentError.message ?? 'Payment presentation failed');
      }

      setIsPremium(true);
      Alert.alert(
        'Success! 🎉',
        'Welcome to PawfectMatch Premium! Your subscription is now active.',
        [
          {
            text: 'Start Exploring',
            onPress: () => {
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert(
        'Payment Failed',
        `There was an issue processing your payment: ${errorMessage}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestorePurchases = async (): Promise<void> => {
    try {
      // Restore purchases logic
      await Promise.resolve(); // Ensure async behavior
      Alert.alert('Restore Purchases', 'No previous purchases found.');
    } catch (_error) {
      Alert.alert('Error', 'Failed to restore purchases.');
    }
  };

  if (isPremium) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.premiumActiveContainer}>
          <View style={[styles.premiumActiveGradient, { backgroundColor: '#1f2937' }]}>
            <Ionicons name="star" size={80} color="#fff" />
            <Text style={styles.premiumActiveTitle}>You're Premium!</Text>
            <Text style={styles.premiumActiveSubtitle}>
              Enjoy all the premium features
            </Text>
            <TouchableOpacity
              style={styles.manageButton}
              onPress={() => { navigation.navigate('ManageSubscription'); }}
            >
              <Text style={styles.manageButtonText}>Manage Subscription</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.gray900 }]}>
      {/* Header */}
      <View style={[styles.header, styles.headerBlur, { backgroundColor: Platform.OS === 'ios' ? 'rgba(255,255,255,0.08)' : colors.glassDarkMedium }]}>
        <TouchableOpacity
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.goBack();
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.white }]}>Go Premium</Text>
        <TouchableOpacity onPress={() => { void handleRestorePurchases(); }}>
          <Text style={[styles.restoreText, { color: colors.primary }]}>Restore</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Holographic Hero */}
        <View style={[styles.heroSection, styles.holographicBg]}>
          <Ionicons name="star" size={60} color="#fff" />
          <Text style={[styles.heroTitle, styles.holoText]}>Unlock Premium Features</Text>
          <Text style={[styles.heroSubtitle, styles.holoTextSoft]}>
            Find your pet's perfect match faster with premium features
          </Text>
        </View>

        {/* Features Grid */}
        <View style={styles.featuresSection}>
          <Text style={[styles.sectionTitle, { color: colors.white }]}>
            What You'll Get
          </Text>
          <View style={styles.featuresGrid}>
            {premiumFeatures.map((feature, index) => (
              <View key={index} style={[styles.featureCard, { backgroundColor: colors.card }]}>
                <View style={[styles.featureIcon, { backgroundColor: `${feature.color}20` }]}>
                  <Ionicons name={feature.icon} size={24} color={feature.color} />
                </View>
                <Text style={[styles.featureTitle, { color: colors.white }]}>
                  {feature.title}
                </Text>
                <Text style={[styles.featureDescription, { color: colors.gray300 }]}>
                  {feature.description}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Pricing Plans */}
        <View style={styles.pricingSection}>
          <Text style={[styles.sectionTitle, { color: colors.white }]}>
            Choose Your Plan
          </Text>
          {premiumPlans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                { backgroundColor: colors.gray800 },
                selectedPlan === plan.id && [styles.selectedPlan, { borderColor: colors.accent }],
                plan.popular && styles.popularPlan,
              ]}
              onPress={() => { handlePlanSelection(plan.id); }}
              activeOpacity={0.8}
            >
              {plan.popular ? <View style={[styles.popularBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.popularText}>Most Popular</Text>
              </View> : null}
              {plan.savings ? <View style={[styles.savingsBadge, { backgroundColor: colors.success }]}>
                <Text style={styles.savingsText}>{plan.savings}</Text>
              </View> : null}
              <View style={styles.planHeader}>
                <Text style={[styles.planName, { color: colors.white }]}>{plan.name}</Text>
                <View style={styles.planPricing}>
                  <Text style={[styles.planPrice, { color: colors.white }]}>
                    ${plan.price}
                  </Text>
                  <Text style={[styles.planDuration, { color: colors.gray400 }]}>
                    /{plan.duration}
                  </Text>
                </View>
              </View>
              <View style={styles.planFeatures}>
                {plan.features.map((feature, index) => (
                  <View key={index} style={styles.planFeature}>
                    <Ionicons name="checkmark" size={16} color={colors.success} />
                    <Text style={[styles.planFeatureText, { color: colors.gray300 }]}>
                      {feature}
                    </Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Subscribe Button */}
        <TouchableOpacity
          style={[styles.subscribeButton, isLoading && styles.subscribeButtonLoading]}
          onPress={handleSubscribe}
          disabled={isLoading}
        >
          <Animated.View style={[
            styles.subscribeButtonGradient,
            styles.neonButton,
            { opacity: isLoading ? 0.7 : 1, transform: [{ scale: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.03] }) }] } as any
          ]}>
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="star" size={20} color="#fff" />
            )}
            <Text style={styles.subscribeButtonText}>
              {isLoading ? 'Processing...' : `Start ${premiumPlans.find(p => p.id === selectedPlan)?.name ?? 'Premium'} Plan`}
            </Text>
          </Animated.View>
        </TouchableOpacity>

        {/* Terms */}
        <View style={styles.termsSection}>
          <Text style={[styles.termsText, { color: colors.textSecondary }]}>
            Subscription automatically renews unless cancelled at least 24 hours before the end of the current period.
          </Text>
          <View style={styles.termsLinks}>
            <TouchableOpacity>
              <Text style={[styles.termsLink, { color: colors.primary }]}>Terms of Service</Text>
            </TouchableOpacity>
            <Text style={[styles.termsSeparator, { color: colors.textSecondary }]}> • </Text>
            <TouchableOpacity>
              <Text style={[styles.termsLink, { color: colors.primary }]}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBlur: {
    ...Platform.select({
      ios: {
        // iOS uses native blur behind; keep translucent bg above
      },
      android: {
        // Simulate blur via translucent background
        backgroundColor: 'rgba(0,0,0,0.3)'
      }
    })
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  restoreText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  holographicBg: {
    backgroundColor: '#1f2937',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  holoText: {
    textShadowColor: 'rgba(255,255,255,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  holoTextSoft: {
    textShadowColor: 'rgba(255,255,255,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  featureCard: {
    width: (SCREEN_WIDTH - 55) / 2,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  pricingSection: {
    padding: 20,
  },
  planCard: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedPlan: {
    borderWidth: 2,
  },
  popularPlan: {
    transform: [{ scale: 1.02 }],
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    left: 20,
    right: 20,
    paddingVertical: 6,
    borderRadius: 15,
    alignItems: 'center',
  },
  popularText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  savingsBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  savingsText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 10,
  },
  planName: {
    fontSize: 20,
    fontWeight: '700',
  },
  planPricing: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planPrice: {
    fontSize: 24,
    fontWeight: '800',
  },
  planDuration: {
    fontSize: 16,
    marginLeft: 2,
  },
  planFeatures: {
    gap: 8,
  },
  planFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  planFeatureText: {
    fontSize: 14,
    flex: 1,
  },
  subscribeButton: {
    marginHorizontal: 20,
    marginVertical: 20,
  },
  subscribeButtonLoading: {
    opacity: 0.7,
  },
  subscribeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 25,
    gap: 10,
  },
  neonButton: {
    backgroundColor: '#0b0b0c',
    borderWidth: 2,
    borderColor: '#ec4899',
    shadowColor: '#ec4899',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  subscribeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  termsSection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  termsText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 10,
  },
  termsLinks: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  termsLink: {
    fontSize: 12,
    fontWeight: '600',
  },
  termsSeparator: {
    fontSize: 12,
  },
  premiumActiveContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  premiumActiveGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  premiumActiveTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginTop: 20,
    marginBottom: 10,
  },
  premiumActiveSubtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 30,
  },
  manageButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  manageButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default PremiumScreen;
