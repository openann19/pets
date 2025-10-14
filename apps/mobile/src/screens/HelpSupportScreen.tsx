import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import AnimatedButton from '../components/AnimatedButton';

interface HelpSupportScreenProps {
  navigation: {
    goBack: () => void;
  };
}

interface HelpOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: () => void;
}

const HelpSupportScreen: React.FC<HelpSupportScreenProps> = ({ navigation }) => {
  // Create help options with navigation action
  const helpOptionsWithNavigation: HelpOption[] = [
    {
      id: 'faq',
      title: 'FAQ',
      description: 'Frequently asked questions',
      icon: 'help-circle-outline',
      action: () => Alert.alert('FAQ', 'FAQ section coming soon!'),
    },
    {
      id: 'contact',
      title: 'Contact Support',
      description: 'Get help from our support team',
      icon: 'chatbubble-outline',
      action: () => Alert.alert('Contact Support', 'Support chat coming soon!'),
    },
    {
      id: 'report-bug',
      title: 'Report a Bug',
      description: 'Help us improve by reporting issues',
      icon: 'bug-outline',
      action: () => Alert.alert('Report Bug', 'Bug reporting feature coming soon!'),
    },
    {
      id: 'safety',
      title: 'Safety Center',
      description: 'Safety tips and reporting tools',
      icon: 'shield-checkmark-outline',
      action: () => navigation.goBack(),
    },
  ];

  // Staggered entrance animations for help options
  const optionAnim1 = useSharedValue(0);
  const optionAnim2 = useSharedValue(0);
  const optionAnim3 = useSharedValue(0);
  const optionAnim4 = useSharedValue(0);

  // Trigger staggered animations on mount
  React.useEffect(() => {
    optionAnim1.value = withDelay(0, withSpring(1, { damping: 15, stiffness: 200 }));
    optionAnim2.value = withDelay(150, withSpring(1, { damping: 15, stiffness: 200 }));
    optionAnim3.value = withDelay(300, withSpring(1, { damping: 15, stiffness: 200 }));
    optionAnim4.value = withDelay(450, withSpring(1, { damping: 15, stiffness: 200 }));
  }, [optionAnim1, optionAnim2, optionAnim3, optionAnim4]);

  // Create animated styles for each option
  const animatedStyles = [
    useAnimatedStyle(() => ({
      opacity: optionAnim1.value,
      transform: [{ translateY: interpolate(optionAnim1.value, [0, 1], [20, 0]) }]
    })),
    useAnimatedStyle(() => ({
      opacity: optionAnim2.value,
      transform: [{ translateY: interpolate(optionAnim2.value, [0, 1], [20, 0]) }]
    })),
    useAnimatedStyle(() => ({
      opacity: optionAnim3.value,
      transform: [{ translateY: interpolate(optionAnim3.value, [0, 1], [20, 0]) }]
    })),
    useAnimatedStyle(() => ({
      opacity: optionAnim4.value,
      transform: [{ translateY: interpolate(optionAnim4.value, [0, 1], [20, 0]) }]
    })),
  ];

  const handleHelpOption = useCallback((option: HelpOption) => {
    Haptics.selectionAsync().catch(() => { });
    option.action();
  }, [navigation]);

  const handleEmailSupport = useCallback(() => {
    Haptics.selectionAsync().catch(() => { });
    const email = 'support@pawfectmatch.com';
    const subject = 'PawfectMatch Support Request';
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}`;

    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Email Support', `Please email us at ${email}`);
      }
    });
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4facfe', '#00f2fe', '#4facfe']}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { });
              navigation.goBack();
            }}
          >
            <BlurView intensity={20} style={styles.backButtonBlur}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </BlurView>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Help & Support</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Quick Actions */}
          <AnimatedButton
            style={styles.contactCard}
            onPress={handleEmailSupport}
            variant="primary"
            size="lg"
            hapticFeedback
          >
            <BlurView intensity={20} style={styles.contactBlur}>
              <View style={styles.contactContent}>
                <Ionicons name="mail-outline" size={24} color="#3B82F6" />
                <View style={styles.contactText}>
                  <Text style={styles.contactTitle}>Email Support</Text>
                  <Text style={styles.contactDescription}>support@pawfectmatch.com</Text>
                </View>
                <Ionicons name="open-outline" size={20} color="rgba(255,255,255,0.6)" />
              </View>
            </BlurView>
          </AnimatedButton>

          {/* Help Options */}
          <Text style={styles.sectionTitle}>Help Topics</Text>

          {helpOptionsWithNavigation.map((option, index) => (
            <Animated.View
              key={option.id}
              style={[styles.optionCard, animatedStyles[index] || animatedStyles[0]]}
            >
              <TouchableOpacity onPress={() => handleHelpOption(option)}>
                <BlurView intensity={20} style={styles.optionBlur}>
                  <View style={styles.optionContent}>
                    <View style={[styles.optionIcon, { backgroundColor: '#3B82F6' }]}>
                      <Ionicons name={option.icon} size={20} color="white" />
                    </View>
                    <View style={styles.optionText}>
                      <Text style={styles.optionTitle}>{option.title}</Text>
                      <Text style={styles.optionDescription}>{option.description}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.6)" />
                  </View>
                </BlurView>
              </TouchableOpacity>
            </Animated.View>
          ))}

          {/* App Info */}
          <Text style={[styles.sectionTitle, { marginTop: 32 }]}>About PawfectMatch</Text>

          <BlurView intensity={15} style={styles.infoCard}>
            <Text style={styles.infoTitle}>Version</Text>
            <Text style={styles.infoValue}>2.5.1</Text>

            <Text style={styles.infoTitle}>Build</Text>
            <Text style={styles.infoValue}>2024.10.13</Text>

            <Text style={styles.infoTitle}>Platform</Text>
            <Text style={styles.infoValue}>iOS & Android</Text>
          </BlurView>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  backButtonBlur: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contactCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  contactBlur: {
    padding: 16,
  },
  contactContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactText: {
    flex: 1,
    marginLeft: 16,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  contactDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  optionCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  optionBlur: {
    padding: 16,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 20,
  },
  infoCard: {
    borderRadius: 16,
    padding: 20,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
});

export default HelpSupportScreen;
