import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@pawfectmatch/core';
import * as Haptics from 'expo-haptics';

const { width: screenWidth } = Dimensions.get('window');

type RootStackParamList = {
  Home: undefined;
  Swipe: undefined;
  Matches: undefined;
  Messages: undefined;
  Profile: undefined;
  Premium: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const handleQuickAction = (action: string) => {
    if (Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // ✅ REAL NAVIGATION - Navigate to actual screens
    switch (action) {
      case 'swipe':
        navigation.navigate('Swipe');
        break;
      case 'matches':
        navigation.navigate('Matches');
        break;
      case 'messages':
        navigation.navigate('Messages');
        break;
      case 'profile':
        navigation.navigate('Profile');
        break;
      case 'premium':
        navigation.navigate('Premium');
        break;
      default:
        console.warn(`Unknown action: ${action}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ec4899"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning!</Text>
            <Text style={styles.userName}>{user?.name || 'Pet Lover'}</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => handleQuickAction('profile')}
          >
            <Image
              source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=100' }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => handleQuickAction('swipe')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#ec4899' }]}>
                <Ionicons name="heart" size={24} color="#fff" />
              </View>
              <Text style={styles.actionText}>Swipe</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => handleQuickAction('matches')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#10b981' }]}>
                <Ionicons name="people" size={24} color="#fff" />
              </View>
              <Text style={styles.actionText}>Matches</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => handleQuickAction('messages')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#3b82f6' }]}>
                <Ionicons name="chatbubbles" size={24} color="#fff" />
              </View>
              <Text style={styles.actionText}>Messages</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => handleQuickAction('profile')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#8b5cf6' }]}>
                <Ionicons name="person" size={24} color="#fff" />
              </View>
              <Text style={styles.actionText}>Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.recentActivity}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name="heart" size={20} color="#ec4899" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>New Match!</Text>
                <Text style={styles.activitySubtitle}>You and Buddy liked each other</Text>
              </View>
              <Text style={styles.activityTime}>2m ago</Text>
            </View>

            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name="chatbubble" size={20} color="#3b82f6" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>New Message</Text>
                <Text style={styles.activitySubtitle}>From Luna: "Hey there! 🐾"</Text>
              </View>
              <Text style={styles.activityTime}>5m ago</Text>
            </View>
          </View>
        </View>

        {/* Premium Features */}
        <View style={styles.premiumSection}>
          <Text style={styles.sectionTitle}>Premium Features</Text>
          <View style={styles.premiumCard}>
            <View style={styles.premiumHeader}>
              <Ionicons name="diamond" size={24} color="#fbbf24" />
              <Text style={styles.premiumTitle}>PawfectMatch Premium</Text>
            </View>
            <Text style={styles.premiumDescription}>
              Unlock unlimited swipes, see who liked you, and get priority in search results.
            </Text>
            <TouchableOpacity
              style={styles.premiumButton}
              onPress={() => handleQuickAction('premium')}
            >
              <Text style={styles.premiumButtonText}>Upgrade Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
});