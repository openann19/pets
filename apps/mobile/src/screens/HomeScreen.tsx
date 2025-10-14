import { Ionicons } from '@expo/vector-icons';
import { logger, useAuthStore } from '@pawfectmatch/core';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Dimensions, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AnimatedButton from '../components/AnimatedButton';
import Footer from '../components/Footer';
import { QuickActions } from '../components/shortcuts/QuickActions';
import { EventWidget } from '../components/widgets/EventWidget';
import { MatchWidget } from '../components/widgets/MatchWidget';
import { SwipeWidget } from '../components/widgets/SwipeWidget';
import { useTheme } from '../contexts/ThemeContext';
import type { TabScreenProps } from '../navigation/types';
import { haptics } from '../utils/haptics';
;

const { width: screenWidth } = Dimensions.get('window');

type HomeScreenProps = TabScreenProps<'Home'>;

export default function HomeScreen({ navigation }: HomeScreenProps): React.JSX.Element {
  const { user } = useAuthStore();
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3); // Mock data

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const handleQuickAction = (action: string) => {
    void haptics.medium();
    switch (action) {
      case 'profile':
        navigation.navigate('Profile');
        break;
      case 'swipe':
        navigation.navigate('Swipe');
        break;
      case 'matches':
        navigation.navigate('Matches');
        break;
      case 'messages':
        navigation.navigate('Matches'); // For now, redirect to matches
        break;
      case 'events':
        // TODO: Navigate to events screen when implemented
        logger.info('Events feature coming soon!');
        break;
      case 'community':
        // TODO: Navigate to community feed when implemented
        logger.info('Community feed feature coming soon!');
        break;
      case 'adoption':
        // TODO: Navigate to adoption center when implemented
        logger.info('Adoption center feature coming soon!');
        break;
      default:
        logger.info(`Quick action not implemented: ${action}`);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[`${colors.gradientSecondary[0]}`, `${colors.gradientSecondary[1]}`, `${colors.gradientSecondary[2]}`]}
        style={StyleSheet.absoluteFillObject}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.secondary}
          />
        }
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <View>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>Good morning!</Text>
            <Text style={[styles.userName, { color: colors.text }]}>{user?.firstName || 'Pet Lover'}</Text>
          </View>
          <View style={styles.headerActions}>
            {/* Notifications Bell */}
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => {
                void haptics.light();
                // TODO: Navigate to notifications screen
                setNotificationCount(0); // Clear badge for now
              }}
              accessibilityRole="button"
              accessibilityLabel={`Notifications. ${notificationCount} unread notifications`}
            >
              <Ionicons name="notifications" size={24} color={colors.text} />
              {notificationCount > 0 && (
                <View style={[styles.notificationBadge, { backgroundColor: colors.error }]}>
                  <Text style={styles.notificationBadgeText}>
                    {notificationCount > 99 ? '99+' : notificationCount.toString()}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Search/Discover Button */}
            <TouchableOpacity
              style={styles.searchButton}
              onPress={() => {
                void haptics.light();
                // TODO: Navigate to search/discover screen
              }}
              accessibilityRole="button"
              accessibilityLabel="Search and discover pets"
            >
              <Ionicons name="search" size={24} color={colors.text} />
            </TouchableOpacity>

            {/* Profile Button */}
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => handleQuickAction('profile')}
              accessibilityRole="button"
              accessibilityLabel="Open profile settings"
              accessibilityHint="Navigates to your profile page"
            >
              <Image
                source={{ uri: (user as { avatar?: string })?.avatar || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=100' }}
                style={styles.profileImage}
                accessibilityIgnoresInvertColors
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Swipe Widget */}
        <SwipeWidget
          pet={{
            id: '1',
            name: 'Buddy',
            age: 3,
            breed: 'Golden Retriever',
            photos: ['https://images.unsplash.com/photo-1552053831-71594a27632d?w=300']
          }}
          onSwipe={(direction) => {
            logger.info(`Swiped ${direction}`);
            void haptics.medium();
          }}
          onViewProfile={() => {
            logger.info('View profile');
          }}
        />

        {/* Recent Matches Widget */}
        <MatchWidget
          matches={[
            {
              id: '1',
              name: 'Sarah',
              petName: 'Luna',
              petPhoto: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=100',
              lastMessage: 'Hey! How is Buddy doing?',
              timestamp: '2m ago',
              unreadCount: 2
            },
            {
              id: '2',
              name: 'Mike',
              petName: 'Max',
              petPhoto: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=100',
              lastMessage: 'Thanks for the playdate!',
              timestamp: '1h ago',
              unreadCount: 0
            }
          ]}
          onMatchPress={(matchId) => {
            logger.info('Open match:', { matchId });
          }}
          onViewAll={() => {
            logger.info('View all matches');
          }}
        />

        {/* Upcoming Event Widget */}
        <EventWidget
          event={{
            id: '1',
            title: 'Puppy Playdate at Central Park',
            date: 'Tomorrow',
            time: '10:00 AM',
            location: 'Central Park',
            attendees: 12,
            maxAttendees: 20,
            category: 'playdate',
            image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300'
          }}
          onEventPress={() => {
            logger.info('View event details');
          }}
          onJoinEvent={() => {
            logger.info('Join event');
          }}
        />

        {/* Quick Actions */}
        <QuickActions
          actions={[
            {
              id: 'swipe',
              title: 'Swipe',
              icon: 'heart',
              color: '#ec4899',
              onPress: () => handleQuickAction('swipe')
            },
            {
              id: 'matches',
              title: 'Matches',
              icon: 'people',
              color: '#10b981',
              onPress: () => handleQuickAction('matches')
            },
            {
              id: 'messages',
              title: 'Messages',
              icon: 'chatbubbles',
              color: '#3b82f6',
              onPress: () => handleQuickAction('messages')
            },
            {
              id: 'events',
              title: 'Events',
              icon: 'calendar',
              color: '#f59e0b',
              onPress: () => handleQuickAction('events')
            },
            {
              id: 'community',
              title: 'Community',
              icon: 'newspaper',
              color: '#8b5cf6',
              onPress: () => handleQuickAction('community')
            },
            {
              id: 'adoption',
              title: 'Adoption',
              icon: 'home',
              color: '#06b6d4',
              onPress: () => handleQuickAction('adoption')
            }
          ]}
        />

        {/* Recent Activity */}
        <View style={styles.recentActivity}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
          <View style={[styles.activityCard, { backgroundColor: colors.card }]}>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name="heart" size={20} color={colors.secondary} />
              </View>
              <View style={styles.activityContent}>
                <Text style={[styles.activityTitle, { color: colors.text }]}>New Match!</Text>
                <Text style={[styles.activitySubtitle, { color: colors.textSecondary }]}>You and Buddy liked each other</Text>
              </View>
              <Text style={[styles.activityTime, { color: colors.gray500 }]}>
                2m ago
              </Text>
            </View>

            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name="chatbubble" size={20} color={colors.accent} />
              </View>
              <View style={styles.activityContent}>
                <Text style={[styles.activityTitle, { color: colors.text }]}>New Message</Text>
                <Text style={[styles.activitySubtitle, { color: colors.textSecondary }]}>From Luna: "Hey there! 🐾"</Text>
              </View>
              <Text style={[styles.activityTime, { color: colors.gray500 }]}>5m ago</Text>
            </View>
          </View>
        </View>

        {/* Premium Features */}
        <View style={styles.premiumSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Premium Features</Text>
          <View style={[styles.premiumCard, { backgroundColor: colors.card }]}>
            <View style={styles.premiumHeader}>
              <Ionicons name="diamond" size={24} color={colors.warning} />
              <Text style={[styles.premiumTitle, { color: colors.text }]}>PawfectMatch Premium</Text>
            </View>
            <Text style={[styles.premiumDescription, { color: colors.textSecondary }]}>
              Unlock unlimited swipes, see who liked you, and get priority in search results.
            </Text>
            <AnimatedButton
              onPress={() => handleQuickAction('premium')}
              variant="primary"
              accessibilityRole="button"
              accessibilityLabel="Upgrade to premium"
              accessibilityHint="Opens premium subscription options with additional features"
            >
              Upgrade Now
            </AnimatedButton>
          </View>
        </View>
      </ScrollView>

      {/* Professional Footer */}
      <Footer
        showCopyright
        showLegal
        showVersion
        showSupport
        variant="default"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  greeting: {
    fontSize: 16,
    color: '#6c757d',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  profileButton: {
    padding: 4,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  quickActions: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: (screenWidth - 60) / 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  recentActivity: {
    padding: 20,
  },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  activitySubtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  premiumSection: {
    padding: 20,
  },
  premiumCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  premiumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  premiumDescription: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
    marginBottom: 16,
  },
  premiumButton: {
    backgroundColor: '#ec4899',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  premiumButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  searchButton: {
    padding: 8,
  },
});
