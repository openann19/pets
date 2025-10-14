/**
 * Profile Screen for Mobile
 * Premium, Gamification, Engagement, GDPR, UI/UX Upgrades
 */

import { Ionicons } from '@expo/vector-icons';
import { logger, useAuthStore } from '@pawfectmatch/core';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Footer from '../components/Footer';
import { useTheme } from '../contexts/ThemeContext';
import type { TabScreenProps } from '../navigation/types';
// Removed duplicate Animated import
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const { width: _SCREEN_WIDTH } = Dimensions.get('window');

interface Pet {
  name: string;
  species: string;
  age: number;
}

type ProfileScreenProps = TabScreenProps<'Profile'>;

interface AccountDeletionStatus {
  status: 'pending' | 'processing' | 'canceled' | 'completed' | 'not-found';
  requestedAt?: string;
  scheduledDeletionDate?: string;
  daysRemaining?: number;
  canCancel?: boolean;
  requestId?: string;
}

const ProfileScreen = ({ navigation }: ProfileScreenProps): React.JSX.Element => {
  const { colors } = useTheme();
  const { user, logout } = useAuthStore();
  const [profileData, setProfileData] = useState<{ pets: Pet[]; matches: number; messages: number; joinedDate?: string } | null>(null);
  const [deletionStatus, setDeletionStatus] = useState<AccountDeletionStatus | null>(null);
  const [premiumError, setPremiumError] = useState<string | null>(null);
  const [premiumSuccess, setPremiumSuccess] = useState<string | null>(null);
  const [showSuccessAnim, setShowSuccessAnim] = useState(false);

  // Success animation state
  const successOpacity = useSharedValue(0);

  useEffect(() => {
    if (showSuccessAnim) {
      successOpacity.value = withTiming(1, { duration: 350 });
      const timer = setTimeout(() => {
        successOpacity.value = withTiming(0, { duration: 350 });
        setShowSuccessAnim(false);
      }, 1200);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [showSuccessAnim]);

  const successAnimStyle = useAnimatedStyle(() => ({
    opacity: successOpacity.value,
  }));

  useEffect(() => {
    void loadProfileData();
    void checkAccountDeletionStatus();
  }, []);

  const checkAccountDeletionStatus = async (): Promise<void> => {
    try {
      let token: string | null = null;
      try {
        token = await AsyncStorage.getItem('authToken');
      } catch (error) {
        logger.warn('Failed to get auth token', error);
      }
      const api = process.env['API_URL'] ?? 'https://api.pawfectmatch.com';
      const response = await fetch(`${api}/api/account/status`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token ?? ''}`
        }
      });
      if (!response.ok) {
        if (response.status === 404) {
          setDeletionStatus({ status: 'not-found' });
          return;
        }
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json() as AccountDeletionStatus;
      setDeletionStatus(data);
    } catch (error) {
      logger.error('Failed to check account status:', error);
      setDeletionStatus({ status: 'not-found' });
    }
  };

  const loadProfileData = async (): Promise<void> => {
    try {
      let token: string | null = null;
      try {
        token = await AsyncStorage.getItem('authToken');
      } catch (error) {
        logger.warn('Failed to get auth token', error);
      }
      const api = process.env['API_URL'] ?? 'https://api.pawfectmatch.com';
      const response = await fetch(`${api}/api/users/profile-stats`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token ?? ''}`
        }
      });
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json() as { pets?: Pet[]; matches?: number; messages?: number; joinedDate?: string };
      setProfileData({
        pets: data.pets ?? [],
        matches: data.matches ?? 0,
        messages: data.messages ?? 0,
        ...(data.joinedDate && { joinedDate: data.joinedDate })
      });
    } catch (error) {
      logger.error('Failed to load profile data:', error);
      Alert.alert(
        'Connection Error',
        'Failed to load profile data. Please check your connection and try again.',
        [{ text: 'Retry', onPress: loadProfileData }]
      );
      setProfileData({ pets: [], matches: 0, messages: 0 });
    }
  };

  const handleAdminAccess = (): void => {
    if (Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    navigation.navigate('Admin');
  };

  const handleLogout = (): void => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            if (Haptics) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
            logout();
          }
        },
      ]
    );
  };

  const handleEditProfile = (): void => {
    if (Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.navigate('EditProfile');
  };

  const handleManageSubscription = async (): Promise<void> => {
    try {
      await Haptics.selectionAsync();
      navigation.navigate('ManageSubscription');
      setPremiumSuccess('Navigated to subscription management.');
      setPremiumError(null);
      setShowSuccessAnim(true);
      setTimeout(() => setShowSuccessAnim(false), 1200);
    } catch (err) {
      setPremiumError('Failed to open subscription management.');
      setPremiumSuccess(null);
    }
  };

  const handleDataExport = async (): Promise<void> => {
    if (Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Alert.alert(
      'Export Your Data',
      'We will prepare a complete export of all your personal data in compliance with GDPR Article 20. This may take up to 48 hours. You will receive an email when your data is ready to download.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request Export',
          style: 'default',
          onPress: async () => {
            try {
              let token: string | null = null;
              try {
                token = await AsyncStorage.getItem('authToken');
              } catch (error) {
                logger.warn('Failed to get auth token', error);
              }
              const api = process.env['API_URL'] ?? 'https://api.pawfectmatch.com';
              const response = await fetch(`${api}/api/account/export-data`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token ?? ''}`
                },
                body: JSON.stringify({
                  format: 'json',
                  includeMessages: true,
                  includeMatches: true,
                  includeProfileData: true,
                  includePreferences: true
                })
              });
              if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
              }
              const data = await response.json() as { exportId: string; estimatedTime: string };
              Alert.alert(
                'Data Export Requested',
                `Your data export has been requested. We'll send you an email when your data is ready to download. Estimated time: ${data.estimatedTime || '24-48 hours'}.`
              );
              setShowSuccessAnim(true);
              setTimeout(() => setShowSuccessAnim(false), 1200);
            } catch (error) {
              logger.error('Failed to request data export:', error);
              Alert.alert('Error', 'Failed to request data export. Please try again.', [{ text: 'OK' }]);
            }
          }
        },
      ]
    );
  };

  const handleCancelDeletion = async (): Promise<void> => {
    if (Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (!deletionStatus?.requestId) return;
    try {
      let token: string | null = null;
      try {
        token = await AsyncStorage.getItem('authToken');
      } catch (error) {
        logger.warn('Failed to get auth token', error);
      }
      const api = process.env['API_URL'] ?? 'https://api.pawfectmatch.com';
      const response = await fetch(`${api}/api/account/cancel-deletion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token ?? ''}`
        },
        body: JSON.stringify({ requestId: deletionStatus.requestId })
      });
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        Alert.alert('Deletion Canceled', 'Your account deletion request has been canceled successfully.', [{ text: 'OK' }]);
        void checkAccountDeletionStatus();
      }
    } catch (error) {
      logger.error('Failed to cancel account deletion:', error);
      Alert.alert('Error', 'Failed to cancel account deletion. Please try again.', [{ text: 'OK' }]);
    }
  };

  const handleDeleteAccount = async (): Promise<void> => {
    if (Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    if (deletionStatus?.status === 'pending' || deletionStatus?.status === 'processing') {
      Alert.alert(
        'Deletion Already Requested',
        `Your account is already scheduled for deletion on ${deletionStatus.scheduledDeletionDate?.split('T')[0]}. You have ${deletionStatus.daysRemaining} days to cancel this request.`,
        deletionStatus.canCancel
          ? [
            { text: 'Close', style: 'cancel' },
            { text: 'Cancel Deletion', onPress: handleCancelDeletion }
          ]
          : [{ text: 'OK' }]
      );
      return;
    }
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This action cannot be undone and all your data will be removed after a 30-day grace period.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            Alert.prompt(
              'Confirm Account Deletion',
              'Please type your email address to confirm account deletion',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Confirm Deletion',
                  style: 'destructive',
                  onPress: async (email) => {
                    if (email === user?.email) {
                      try {
                        let token: string | null = null;
                        try {
                          token = await AsyncStorage.getItem('authToken');
                        } catch (error) {
                          logger.warn('Failed to get auth token', error);
                        }
                        const api = process.env['API_URL'] ?? 'https://api.pawfectmatch.com';
                        const response = await fetch(`${api}/api/account/delete`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token ?? ''}`
                          }
                        });
                        if (!response.ok) {
                          throw new Error(`API error: ${response.status}`);
                        }
                        Alert.alert('Account Deletion Initiated', 'Your account will be deleted after a 30-day grace period. You will receive an email confirmation. You can cancel this request anytime during this period by logging in.');
                        void checkAccountDeletionStatus();
                      } catch (error) {
                        logger.error('Failed to initiate account deletion:', error);
                        Alert.alert('Error', 'Failed to initiate account deletion. Please try again.', [{ text: 'OK' }]);
                      }
                    } else {
                      Alert.alert('Error', 'Email address does not match your account');
                    }
                  }
                }
              ],
              'plain-text',
              '',
              'email-address'
            );
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView}>
        {/* Deletion Warning Banner */}
        {deletionStatus?.status === 'pending' && (
          <TouchableOpacity
            style={styles.deletionWarningBanner}
            onPress={() => {
              Alert.alert(
                'Account Scheduled for Deletion',
                `Your account is scheduled for deletion on ${deletionStatus.scheduledDeletionDate?.split('T')[0]}. You have ${deletionStatus.daysRemaining} days remaining to cancel this request.`,
                deletionStatus.canCancel
                  ? [
                    { text: 'Close', style: 'cancel' },
                    { text: 'Cancel Deletion', onPress: handleCancelDeletion }
                  ]
                  : [{ text: 'OK' }]
              );
            }}
          >
            <Ionicons name="alert-circle" size={24} color="white" />
            <Text style={styles.deletionWarningText}>
              Account scheduled for deletion in {deletionStatus.daysRemaining} days
            </Text>
            <Ionicons name="chevron-forward" size={20} color="white" />
          </TouchableOpacity>
        )}

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileInfo}>
            <View style={[styles.avatarContainer, { backgroundColor: colors.card }]}>
              <Ionicons name="person" size={40} color={colors.text} />
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.text }]}>
                {user?.firstName} {user?.lastName}
              </Text>
              <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
                {user?.email}
              </Text>
              {user?.role === 'admin' && (
                <View style={[styles.adminBadge, { backgroundColor: '#EF4444' }]}>
                  <Text style={styles.adminBadgeText}>ADMIN</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        {profileData ? <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Your Stats
          </Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <Ionicons name="paw" size={24} color="#10B981" />
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {profileData.pets.length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Pets
              </Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <Ionicons name="heart" size={24} color="#EC4899" />
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {profileData.matches}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Matches
              </Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <Ionicons name="chatbubble" size={24} color="#8B5CF6" />
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {profileData.messages}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Messages
              </Text>
            </View>
          </View>
        </View> : null}

        {/* Premium & Gamification Section */}
        <View style={[styles.section, { marginBottom: 12 }]} accessible accessibilityLabel="Premium & Gamification Section">
          <Text style={[styles.sectionTitle, { color: '#fbbf24' }]} accessibilityRole="header">Premium & Gamification</Text>
          {/* Success/Error States */}
          {premiumSuccess && (
            <View style={{ backgroundColor: '#dcfce7', borderRadius: 8, padding: 8, marginBottom: 6 }}>
              <Text style={{ color: '#166534', fontWeight: 'bold' }}>{premiumSuccess}</Text>
            </View>
          )}
          {premiumError && (
            <View style={{ backgroundColor: '#fee2e2', borderRadius: 8, padding: 8, marginBottom: 6 }}>
              <Text style={{ color: '#991b1b', fontWeight: 'bold' }}>{premiumError}</Text>
            </View>
          )}
          {showSuccessAnim && (
            <Animated.View style={[{ backgroundColor: '#bbf7d0', borderRadius: 8, padding: 8, marginBottom: 6, alignItems: 'center' }, successAnimStyle]}>
              <Ionicons name="checkmark-circle" size={28} color="#22c55e" />
              <Text style={{ color: '#166534', fontWeight: 'bold', marginTop: 4 }}>Success!</Text>
            </Animated.View>
          )}
          <View style={{ backgroundColor: '#FEF9C3', borderRadius: 12, padding: 14, marginBottom: 10 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#92400e', marginBottom: 6 }} accessibilityRole="header">Premium Features</Text>
            <Text style={{ color: '#92400e', fontSize: 13 }}>Unlimited Likes, See Who Liked You, Advanced Filters, Priority Placement, Incognito Mode, Rewind Swipes, Travel Mode, Super Likes, Profile Insights, Ad-Free, Verified Badge, Video Calls, Priority Support, Exclusive Events, Custom URL</Text>
            <TouchableOpacity
              style={{ marginTop: 10, alignSelf: 'flex-start', backgroundColor: '#fbbf24', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16 }}
              accessibilityRole="button"
              accessibilityLabel="Manage Subscription"
              onPress={async () => {
                try {
                  await Haptics.selectionAsync();
                  navigation.navigate('ManageSubscription');
                  setPremiumSuccess('Navigated to subscription management.');
                  setPremiumError(null);
                  setShowSuccessAnim(true);
                  setTimeout(() => setShowSuccessAnim(false), 1200);
                } catch (err) {
                  setPremiumError('Failed to open subscription management.');
                  setPremiumSuccess(null);
                }
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Manage Subscription</Text>
            </TouchableOpacity>
          </View>
          <View style={{ backgroundColor: '#EDE9FE', borderRadius: 12, padding: 14 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#6d28d9', marginBottom: 6 }} accessibilityRole="header">Achievements & Engagement</Text>
            <Text style={{ color: '#6d28d9', fontSize: 13 }}>Badges, Leaderboard, Daily Streak, Quests, Points, Rewards Shop, Levels, Friends, Group Chats, Events, Photo Contests</Text>
            <View style={{ flexDirection: 'row', marginTop: 8 }}>
              <Text style={{ backgroundColor: '#DDD6FE', color: '#6d28d9', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, fontWeight: 'bold', marginRight: 8 }}>Level: Gold</Text>
              <Text style={{ backgroundColor: '#FEF9C3', color: '#92400e', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, fontWeight: 'bold' }}>Points: 1,250</Text>
            </View>
            {/* Empty State Example */}
            {!profileData?.pets?.length && (
              <View style={{ marginTop: 10, backgroundColor: '#f3f4f6', borderRadius: 8, padding: 8 }}>
                <Text style={{ color: '#6b7280', fontStyle: 'italic' }}>Add a pet to unlock more achievements!</Text>
              </View>
            )}
          </View>
        </View>

        {/* Quick Access Section */}
        <View style={[styles.section, { marginBottom: 12 }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Access</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 }}>
            <TouchableOpacity style={styles.quickAccessButton} onPress={() => navigation.navigate('PrivacySettings')}>
              <Ionicons name="lock-closed-outline" size={22} color={colors.primary} />
              <Text style={styles.quickAccessText}>Privacy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAccessButton} onPress={() => navigation.navigate('BlockedUsers')}>
              <Ionicons name="ban" size={22} color="#ef4444" />
              <Text style={styles.quickAccessText}>Blocked Users</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAccessButton} onPress={() => navigation.navigate('SafetyCenter')}>
              <Ionicons name="shield-checkmark" size={22} color="#10b981" />
              <Text style={styles.quickAccessText}>Safety</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAccessButton} onPress={() => navigation.navigate('NotificationPreferences')}>
              <Ionicons name="notifications" size={22} color="#6366f1" />
              <Text style={styles.quickAccessText}>Notifications</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAccessButton} onPress={() => navigation.navigate('HelpSupport')}>
              <Ionicons name="help-circle" size={22} color="#fbbf24" />
              <Text style={styles.quickAccessText}>Help</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAccessButton} onPress={() => navigation.navigate('AboutTermsPrivacy')}>
              <Ionicons name="information-circle" size={22} color={colors.text} />
              <Text style={styles.quickAccessText}>About</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAccessButton} onPress={() => navigation.navigate('DeactivateAccount')}>
              <Ionicons name="pause" size={22} color="#f59e42" />
              <Text style={styles.quickAccessText}>Deactivate</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAccessButton} onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate('AdvancedFilters');
            }}>
              <Ionicons name="options" size={22} color="#0ea5e9" />
              <Text style={styles.quickAccessText}>Filters</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAccessButton} onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              navigation.navigate('ModerationTools');
            }}>
              <Ionicons name="alert" size={22} color="#ef4444" />
              <Text style={styles.quickAccessText}>Moderation</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.card }]} onPress={handleEditProfile}>
            <Ionicons name="create-outline" size={24} color={colors.primary} />
            <Text style={[styles.actionButtonText, { color: colors.text }]}>Edit Profile</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.card }]} onPress={handleManageSubscription}>
            <Ionicons name="card-outline" size={24} color={colors.primary} />
            <Text style={[styles.actionButtonText, { color: colors.text }]}>Manage Subscription</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          {user?.role === 'admin' && (
            <TouchableOpacity style={[styles.actionButton, styles.adminButton, { backgroundColor: '#FEF2F2' }]} onPress={handleAdminAccess}>
              <Ionicons name="shield-checkmark-outline" size={24} color="#EF4444" />
              <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>Admin Panel</Text>
              <Ionicons name="chevron-forward" size={20} color="#EF4444" />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.card }]} onPress={handleDataExport}>
            <Ionicons name="download-outline" size={24} color={colors.primary} />
            <Text style={[styles.actionButtonText, { color: colors.text }]}>Download My Data (GDPR)</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.dangerButton, { backgroundColor: '#FEF2F2', marginTop: 16 }]} onPress={handleDeleteAccount}>
            <Ionicons name="trash-outline" size={24} color="#DC2626" />
            <Text style={[styles.actionButtonText, { color: '#DC2626' }]}>Delete Account</Text>
            <Ionicons name="chevron-forward" size={20} color="#DC2626" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.logoutButton, { backgroundColor: '#FEF2F2', marginTop: 16 }]} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#EF4444" />
            <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>Logout</Text>
            <Ionicons name="chevron-forward" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>

        {/* Pets Section */}
        {profileData ? <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Pets</Text>
          {profileData.pets.map((pet: Pet, index: number) => (
            <View key={index} style={[styles.petCard, { backgroundColor: colors.card }]}>
              <View style={styles.petInfo}>
                <Ionicons name="paw" size={24} color="#10B981" />
                <View style={styles.petDetails}>
                  <Text style={[styles.petName, { color: colors.text }]}>{pet.name}</Text>
                  <Text style={[styles.petSpecies, { color: colors.textSecondary }]}>{pet.species} • {pet.age} years old</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </View>
          ))}
        </View> : null}
      </ScrollView>
      <Footer showCopyright showLegal showVersion={false} showSupport variant="minimal" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  quickAccessButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 8,
    minWidth: 120,
    elevation: 2,
  },
  quickAccessText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  deletionWarningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 8,
  },
  deletionWarningText: {
    color: 'white',
    fontWeight: '600',
    flex: 1,
    marginLeft: 8,
  },
  header: {
    paddingVertical: 24,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    marginBottom: 8,
  },
  adminBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  adminBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  adminButton: {
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  dangerButton: {
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  actionButtonText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  petCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  petInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  petDetails: {
    marginLeft: 12,
  },
  petName: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  petSpecies: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default ProfileScreen;