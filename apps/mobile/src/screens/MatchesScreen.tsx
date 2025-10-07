import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@pawfectmatch/core';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AdvancedCard, CardConfigs } from '../components/Advanced/AdvancedCard';
import { AdvancedHeader, HeaderConfigs } from '../components/Advanced/AdvancedHeader';
import { matchesAPI } from '../services/api';

const { width: screenWidth } = Dimensions.get('window');

interface Match {
  _id: string;
  petId: string;
  petName: string;
  petPhoto: string;
  petAge: number;
  petBreed: string;
  lastMessage: {
    content: string;
    timestamp: string;
    senderId: string;
  };
  isOnline: boolean;
  matchedAt: string;
  unreadCount: number;
}

interface MatchesScreenProps {
  navigation: any;
}

export default function MatchesScreen({ navigation }: MatchesScreenProps) {
  const { user } = useAuthStore();
  const [matches, setMatches] = useState<Match[]>([]);
  const [likedYou, setLikedYou] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState<'matches' | 'likedYou'>('matches');
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [initialOffset, setInitialOffset] = useState<number>(0);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    const restore = async () => {
      try {
        const saved = await AsyncStorage.getItem('mobile_matches_scroll');
        if (saved) setInitialOffset(Number(saved));
      } catch {}
    };
    restore();
    loadMatches();
  }, []);

  useEffect(() => {
    if (!isLoading && initialOffset > 0) {
      requestAnimationFrame(() => {
        listRef.current?.scrollToOffset({ offset: initialOffset, animated: false });
      });
    }
  }, [isLoading, initialOffset]);

  const loadMatches = async () => {
    setIsLoading(true);
    try {
      // ✅ REAL API - Fetch matches from backend
      const realMatches = await matchesAPI.getMatches() as unknown as Match[];
      setMatches(realMatches);
    } catch (error) {
      console.error('Failed to load matches:', error);
      Alert.alert(
        'Connection Error',
        'Unable to load matches. Please check your connection and try again.'
      );
      setMatches([]);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMatches();
    setRefreshing(false);
  };

  const renderMatch = ({ item }: { item: Match }) => (
    <AdvancedCard
      {...CardConfigs.glass({
        interactions: ['hover', 'press', 'glow', 'bounce'],
        haptic: 'medium',
        onPress: async () => {
          try {
            const matchDetails = await matchesAPI.getMatch(item._id);
            console.log('Loaded match details:', matchDetails);
            navigation.navigate('Chat', { 
              matchId: item._id, 
              petName: item.petName 
            });
          } catch (error) {
            console.error('Failed to load match details:', error);
            navigation.navigate('Chat', { 
              matchId: item._id, 
              petName: item.petName 
            });
          }
        },
        apiAction: async () => {
          const messages = await matchesAPI.getMessages(item._id);
          console.log('Loaded messages for match:', messages.length);
        },
        badge: item.unreadCount > 0 ? { 
          text: item.unreadCount > 99 ? '99+' : item.unreadCount.toString(),
          backgroundColor: '#ef4444'
        } : undefined,
        status: item.isOnline ? {
          text: 'Online',
          backgroundColor: '#10b981'
        } : undefined,
      })}
      style={styles.matchCard}
    >
      <View style={styles.matchContent}>
        <Image source={{ uri: item.petPhoto }} style={styles.matchPhoto} />
        <View style={styles.matchInfo}>
          <View style={styles.matchHeader}>
            <Text style={styles.matchName}>{item.petName}</Text>
          </View>
          <Text style={styles.matchMessage} numberOfLines={1}>
            {item.lastMessage.content}
          </Text>
          <Text style={styles.matchTime}>
            {new Date(item.lastMessage.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>
      </View>
    </AdvancedCard>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Advanced Header */}
      <AdvancedHeader
        {...HeaderConfigs.glass({
          title: 'Matches',
          rightButtons: [
            {
              type: 'filter',
              onPress: async () => {
                console.log('Filter matches');
              },
              variant: 'glass',
              haptic: 'light',
            },
            {
              type: 'search',
              onPress: async () => {
                console.log('Search matches');
              },
              variant: 'minimal',
              haptic: 'light',
            },
          ],
          apiActions: {
            filter: async () => {
              console.log('Filter API action');
            },
            search: async () => {
              console.log('Search API action');
            },
          },
        })}
      />

      <AdvancedCard
        {...CardConfigs.minimal({
          interactions: ['hover', 'press'],
          haptic: 'light',
        })}
        style={styles.tabContainer}
      >
        <View style={styles.tabContent}>
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === 'matches' && styles.activeTab
            ]}
            onPress={() => setSelectedTab('matches')}
          >
            <Text style={[
              styles.tabText,
              selectedTab === 'matches' && styles.activeTabText
            ]}>
              Matches
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === 'likedYou' && styles.activeTab
            ]}
            onPress={() => setSelectedTab('likedYou')}
          >
            <Text style={[
              styles.tabText,
              selectedTab === 'likedYou' && styles.activeTabText
            ]}>
              Liked You
            </Text>
          </TouchableOpacity>
        </View>
      </AdvancedCard>

      <FlatList
        ref={listRef}
        data={selectedTab === 'matches' ? matches : likedYou}
        renderItem={renderMatch}
        keyExtractor={item => item._id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        onScroll={async (e) => {
          try {
            await AsyncStorage.setItem('mobile_matches_scroll', String(e.nativeEvent.contentOffset.y));
          } catch {}
        }}
        scrollEventThrottle={120}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ec4899"
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#ec4899',
  },
  tabText: {
    fontSize: 16,
    color: '#6c757d',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#ec4899',
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  matchCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  matchPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  matchInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  matchName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  matchMessage: {
    fontSize: 14,
    color: '#6c757d',
  },
  unreadBadge: {
    backgroundColor: '#ec4899',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  matchContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  matchTime: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  tabContent: {
    flexDirection: 'row',
  },
});
