import { Ionicons } from '@expo/vector-icons';
import { logger, useAuthStore } from '@pawfectmatch/core';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { Alert, Dimensions, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ShimmerPlaceholder } from '../components/ShimmerPlaceholder';
import SwipeCard from '../components/SwipeCard';
import { useTheme } from '../contexts/ThemeContext';
import type { TabParamList } from '../navigation/types';
import { _analyticsAPI, api } from '../services/api';
import { premiumService } from '../services/PremiumService';
import { UsageTrackingService } from '../services/usageTracking';

type SwipeScreenProps = BottomTabScreenProps<TabParamList, 'Swipe'>;

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface Pet {
  _id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  size: string;
  intent: string;
  description: string;
  photos: Array<{ url: string; isPrimary: boolean }>;
  personalityTags: string[];
  aiData: {
    personalityScore: {
      friendliness: number;
      energy: number;
      trainability: number;
      socialness: number;
      aggression: number;
    };
    compatibilityTags: string[];
  };
}

export default function SwipeScreen({ navigation }: SwipeScreenProps): React.JSX.Element {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const [pets, setPets] = useState<Pet[]>([]);
  const [currentPetIndex, setCurrentPetIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [swipeHistory, setSwipeHistory] = useState<{ pet: Pet; direction: 'left' | 'right' }[]>([]);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [superLikesLeft, setSuperLikesLeft] = useState(3); // Free users get 3 per day

  useEffect(() => {
    loadPets();
  }, []);

  const loadPets = async () => {
    try {
      const data = await api.request<Pet[]>("/pets");
      setPets(data);
      setLoading(false);
    } catch (error) {
      logger.error('Failed to load pets:', error);
      Alert.alert('Error', 'Failed to load pets');
      setLoading(false);
    }
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    const currentPet = pets[currentPetIndex];
    if (!currentPet) return;
    try {
      // Track the swipe event with real usage tracking service
      const action = direction === 'right' ? 'like' : 'pass';
      await UsageTrackingService.trackSwipe(user?._id || '', currentPet._id, action);
      await _analyticsAPI.trackPetEvent(
        currentPet._id,
        direction === 'right' ? 'pet_like' : 'pet_pass',
        {
          fromUserId: user?._id,
          intent: currentPet.intent
        }
      );
      // Save swipe history (limit to last 5)
      setSwipeHistory(prev => {
        const updated = [...prev, { pet: currentPet, direction }];
        return updated.length > 5 ? updated.slice(updated.length - 5) : updated;
      });
      // Move to next pet
      if (currentPetIndex < pets.length - 1) {
        setCurrentPetIndex(currentPetIndex + 1);
      } else {
        loadPets();
        setCurrentPetIndex(0);
      }
    } catch (error) {
      logger.error('Failed to track swipe:', error);
    }
  };

  // Undo Last Swipe logic - Premium feature
  const handleUndoSwipe = async () => {
    try {
      // Check if user has premium (real check now)
      const hasPremium = await premiumService.hasActiveSubscription();

      if (!hasPremium) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert(
          'Premium Feature',
          'Unlimited swipe undo is a premium feature. Upgrade to undo your last swipes!',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Upgrade', onPress: () => navigation.navigate('Premium') },
          ]
        );
        return;
      }

      if (swipeHistory.length === 0) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('No Swipes to Undo', 'You haven\'t swiped on any pets yet.');
        return;
      }

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Track premium feature usage
      await premiumService.trackUsage('undo_swipe');

      setCurrentPetIndex(idx => Math.max(0, idx - 1));
      setSwipeHistory(prev => prev.slice(0, -1)); // Remove last swipe from history

      Alert.alert('Swipe Undone', 'Your last swipe has been undone. You can now swipe again!');
    } catch (error) {
      logger.error('Failed to check premium status for undo', { error });
      Alert.alert('Error', 'Unable to verify premium status. Please try again.');
    }
  };

  const [superLikeAnimation, setSuperLikeAnimation] = useState(false);

  // Trigger super like animation
  const triggerSuperLikeAnimation = () => {
    setSuperLikeAnimation(true);
    setTimeout(() => setSuperLikeAnimation(false), 1000);
  };

  const handleSuperLike = async () => {
    try {
      // Check premium limits for super likes
      const limits = await premiumService.getPremiumLimits();

      // If user has unlimited super likes (premium), or has remaining free ones
      const canSuperLike = limits.superLikesPerDay === -1 || superLikesLeft > 0;

      if (!canSuperLike) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert(
          'No Super Likes Left',
          'You\'ve used all your Super Likes for today. Upgrade to Premium for unlimited Super Likes!',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Upgrade', onPress: () => navigation.navigate('Premium') },
          ]
        );
        return;
      }

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      Alert.alert(
        'Super Like',
        `Send a Super Like to ${currentPet.name}? This will make your profile stand out!`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Send Super Like',
            onPress: async () => {
              try {
                setSuperLikesLeft(prev => prev - 1);
                triggerSuperLikeAnimation();

                // Track premium feature usage
                await premiumService.trackUsage('super_like');

                // Treat as like for now (could be extended to super like API)
                void handleSwipe('right');

                logger.info('Super Like sent', { petId: currentPet._id });
              } catch (error) {
                logger.error('Failed to send super like', { error });
                Alert.alert('Error', 'Failed to send super like. Please try again.');
              }
            },
          },
        ]
      );
    } catch (error) {
      logger.error('Failed to check premium limits for super like', { error });
      Alert.alert('Error', 'Unable to verify premium status. Please try again.');
    }
  };

  const handleBoost = async () => {
    try {
      // Check if user can boost (premium feature)
      const canBoost = await premiumService.canUseFeature('canBoostProfile');

      if (!canBoost) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert(
          'Premium Feature',
          'Profile boosting is a premium feature. Be one of the top profiles in your area for 30 minutes!',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Upgrade to Premium', onPress: () => navigation.navigate('Premium') },
          ]
        );
        return;
      }

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Track premium feature usage
      await premiumService.trackUsage('profile_boost');

      Alert.alert(
        'Profile Boosted! 🚀',
        'Your profile is now boosted for 30 minutes. You\'ll appear at the top of everyone\'s feed!',
        [{ text: 'Awesome!', style: 'default' }]
      );

      logger.info('Profile boosted');
    } catch (error) {
      logger.error('Failed to check premium status for boost', { error });
      Alert.alert('Error', 'Unable to boost profile. Please try again.');
    }
  };

  const handleReportBlock = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setReportModalVisible(true);
  };

  const handleReportSubmit = (reason: string) => {
    Alert.alert(
      'Report Submitted',
      `Thank you for reporting this profile. We'll review it within 24 hours.`,
      [
        {
          text: 'OK',
          onPress: () => {
            setReportModalVisible(false);
            void handleSwipe('left'); // Remove reported pet from stack
          },
        },
      ]
    );
    logger.info('Pet reported', { petId: currentPet._id, reason });
  };

  const handleBlockUser = () => {
    Alert.alert(
      'Block User',
      `Block ${currentPet.name}? You won't see their profile again.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: () => {
            setReportModalVisible(false);
            void handleSwipe('left'); // Remove blocked pet from stack
            logger.info('Pet blocked', { petId: currentPet._id });
          },
        },
      ]
    );
  };

  const handleSwipeLeft = (_pet: { _id: string }) => {
    void handleSwipe('left');
  };

  const handleSwipeRight = (_pet: { _id: string }) => {
    void handleSwipe('right');
  };

  const handleSwipeUp = (_pet: { _id: string }) => {
    // For super like, perhaps treat as like for now
    void handleSwipe('right');
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.swipeContainer}>
          <View style={[styles.petCard, { backgroundColor: colors.card }]}>
            <ShimmerPlaceholder width="100%" height={screenHeight * 0.7} borderRadius={20} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (pets.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No more pets to swipe!</Text>
          <TouchableOpacity onPress={loadPets}>
            <Text>Reload</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentPet = pets[currentPetIndex]!;
  const swipeCardPet = {
    _id: currentPet._id,
    name: currentPet.name,
    age: currentPet.age,
    breed: currentPet.breed,
    photos: currentPet.photos.map(p => p.url),
    bio: currentPet.description,
    distance: 5, // placeholder
    compatibility: Math.floor(Math.random() * 100), // placeholder
    isVerified: false, // placeholder
    tags: currentPet.personalityTags,
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity style={styles.backButton} accessibilityLabel="Back" onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Discover</Text>
        <TouchableOpacity style={styles.filterButton} accessibilityLabel="Filter" onPress={() => setFilterModalVisible(true)}>
          <Ionicons name="filter" size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton} accessibilityLabel="Undo Last Swipe" onPress={handleUndoSwipe} disabled={swipeHistory.length === 0}>
          <Ionicons name="arrow-undo" size={24} color={swipeHistory.length === 0 ? '#ccc' : colors.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Matches')}>
          <Ionicons name="chatbubbles-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      {/* Filter Modal */}
      {filterModalVisible && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', zIndex: 10 }}>
          <View style={{ backgroundColor: colors.card, borderRadius: 20, padding: 24, width: '90%', maxHeight: '80%' }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: colors.text }}>Filter Pets</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Species Filter */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, color: colors.text }}>Species</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {['Dog', 'Cat', 'Bird', 'Rabbit', 'Other'].map((species) => (
                    <TouchableOpacity
                      key={species}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: colors.primary,
                        backgroundColor: 'transparent'
                      }}
                      onPress={() => {
                        // TODO: Implement species filter
                        Haptics.selectionAsync();
                      }}
                    >
                      <Text style={{ color: colors.primary, fontSize: 14 }}>{species}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Age Range Filter */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, color: colors.text }}>Age Range</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {['Puppy/Kitten (0-1)', 'Young (1-3)', 'Adult (3-7)', 'Senior (7+)'].map((age) => (
                    <TouchableOpacity
                      key={age}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: colors.primary,
                        backgroundColor: 'transparent'
                      }}
                      onPress={() => {
                        // TODO: Implement age filter
                        Haptics.selectionAsync();
                      }}
                    >
                      <Text style={{ color: colors.primary, fontSize: 14 }}>{age}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Distance Filter */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, color: colors.text }}>Maximum Distance</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {['5 miles', '10 miles', '25 miles', '50 miles', '100+ miles'].map((distance) => (
                    <TouchableOpacity
                      key={distance}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: colors.primary,
                        backgroundColor: 'transparent'
                      }}
                      onPress={() => {
                        // TODO: Implement distance filter
                        Haptics.selectionAsync();
                      }}
                    >
                      <Text style={{ color: colors.primary, fontSize: 14 }}>{distance}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Size Preference */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, color: colors.text }}>Size Preference</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {['Small', 'Medium', 'Large', 'Extra Large'].map((size) => (
                    <TouchableOpacity
                      key={size}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: colors.primary,
                        backgroundColor: 'transparent'
                      }}
                      onPress={() => {
                        // TODO: Implement size filter
                        Haptics.selectionAsync();
                      }}
                    >
                      <Text style={{ color: colors.primary, fontSize: 14 }}>{size}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Breed Filter */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, color: colors.text }}>Breed (Optional)</Text>
                <TouchableOpacity
                  style={{
                    padding: 12,
                    borderWidth: 1,
                    borderColor: colors.gray300,
                    borderRadius: 8,
                    backgroundColor: colors.gray50
                  }}
                  onPress={() => {
                    // TODO: Open breed selection modal
                    Haptics.selectionAsync();
                  }}
                >
                  <Text style={{ color: colors.textSecondary }}>Select specific breeds...</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, gap: 12 }}>
              <TouchableOpacity
                onPress={() => {
                  // TODO: Reset filters
                  setFilterModalVisible(false);
                  Haptics.selectionAsync();
                }}
                style={{ padding: 12, borderRadius: 8, backgroundColor: colors.gray200, flex: 1 }}
              >
                <Text style={{ color: colors.text, textAlign: 'center', fontWeight: '600' }}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setFilterModalVisible(false);
                  Haptics.selectionAsync();
                  // TODO: Apply filters
                }}
                style={{ padding: 12, borderRadius: 8, backgroundColor: colors.primary, flex: 1 }}
              >
                <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Pet Card */}
      <View style={styles.swipeContainer}>
        <SwipeCard
          pet={swipeCardPet}
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
          onSwipeUp={handleSwipeUp}
        />
      </View>

      {/* Premium & Safety Actions Footer */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 18, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.08)' }}>
        <TouchableOpacity accessibilityLabel="Super Like" onPress={handleSuperLike} style={{ alignItems: 'center' }}>
          <Ionicons name="star" size={28} color="#fbbf24" />
          <Text style={{ fontSize: 12, color: colors.text }}>Super Like ({superLikesLeft})</Text>
        </TouchableOpacity>
        <TouchableOpacity accessibilityLabel="Boost" onPress={handleBoost} style={{ alignItems: 'center' }}>
          <Ionicons name="rocket" size={28} color="#6366f1" />
          <Text style={{ fontSize: 12, color: colors.text }}>Boost</Text>
        </TouchableOpacity>
        <TouchableOpacity accessibilityLabel="Report/Block" onPress={handleReportBlock} style={{ alignItems: 'center' }}>
          <Ionicons name="ban" size={28} color="#ef4444" />
          <Text style={{ fontSize: 12, color: colors.text }}>Report/Block</Text>
        </TouchableOpacity>
        <TouchableOpacity accessibilityLabel="Safety Center" onPress={() => navigation.navigate('SafetyCenter')} style={{ alignItems: 'center' }}>
          <Ionicons name="shield-checkmark" size={28} color="#10b981" />
          <Text style={{ fontSize: 12, color: colors.text }}>Safety</Text>
        </TouchableOpacity>
      </View>

      {/* Report/Block Modal */}
      {reportModalVisible && (
        <View
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', zIndex: 20 }}
          accessibilityViewIsModal
          accessibilityLabel="Report or Block Modal"
        >
          <View style={{ backgroundColor: colors.card, borderRadius: 24, padding: 28, width: '90%', shadowColor: '#ec4899', shadowOpacity: 0.15, shadowRadius: 16, elevation: 8 }}>
            <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 18, color: colors.error }}>Report or Block</Text>
            <Text style={{ marginBottom: 18, fontSize: 16, color: colors.text }}>Why are you reporting this profile?</Text>
            <TouchableOpacity onPress={() => handleReportSubmit('Inappropriate Content')} style={{ padding: 14 }} accessibilityLabel="Report Inappropriate Content">
              <Text style={{ color: colors.error, fontWeight: 'bold', fontSize: 16 }}>Inappropriate Content</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleReportSubmit('Spam or Scam')} style={{ padding: 14 }} accessibilityLabel="Report Spam or Scam">
              <Text style={{ color: colors.error, fontWeight: 'bold', fontSize: 16 }}>Spam or Scam</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleReportSubmit('Other')} style={{ padding: 14 }} accessibilityLabel="Report Other">
              <Text style={{ color: colors.error, fontWeight: 'bold', fontSize: 16 }}>Other</Text>
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 28 }}>
              <TouchableOpacity onPress={handleBlockUser} style={{ padding: 12, borderRadius: 8, backgroundColor: '#f3e8ff' }} accessibilityLabel="Block User">
                <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 16 }}>Block User</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setReportModalVisible(false)} style={{ padding: 12, borderRadius: 8, backgroundColor: '#f8f9fa' }} accessibilityLabel="Cancel">
                <Text style={{ color: colors.text, fontSize: 16 }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Super Like Animation Overlay */}
      {superLikeAnimation && (
        <View style={styles.superLikeOverlay}>
          <View style={styles.superLikeContent}>
            <Ionicons name="star" size={60} color="#fbbf24" />
            <Text style={styles.superLikeText}>SUPER LIKE!</Text>
            <Text style={styles.superLikeSubtext}>Profile highlighted with sparkle ✨</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  filterButton: {
    padding: 8,
  },
  swipeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  petCard: {
    width: screenWidth * 0.9,
    height: screenHeight * 0.7,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  petImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  petInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  petHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  petName: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  petAge: {
    fontSize: 18,
  },
  petBreed: {
    fontSize: 20,
    marginBottom: 10,
  },
  petDescription: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 15,
  },
  personalityTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '600',
  },
  aiScores: {
    gap: 15,
  },
  aiScoreItem: {
    gap: 5,
  },
  aiScoreLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  aiScoreBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
  },
  aiScoreFill: {
    height: '100%',
    borderRadius: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    paddingHorizontal: 40,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  passButton: {
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  likeButton: {
    borderWidth: 2,
    borderColor: '#22c55e',
  },
  indicator: {
    position: 'absolute',
    top: 100,
    padding: 20,
    borderRadius: 40,
    borderWidth: 2,
  },
  likeIndicator: {
    right: 40,
    borderColor: '#22c55e',
  },
  superLikeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(251, 191, 36, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  superLikeContent: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  superLikeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fbbf24',
    marginTop: 10,
  },
  superLikeSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 5,
    textAlign: 'center',
  },
});
