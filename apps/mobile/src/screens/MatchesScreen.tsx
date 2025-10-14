import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// const { width: screenWidth } = Dimensions.get('window');

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
  // const { user } = useAuthStore();
  const [matches, setMatches] = useState<Match[]>([]);
  // const [likedYou, setLikedYou] = useState<Array<{
  //   id: string;
  //   petId: string;
  //   petName: string;
  //   petPhoto: string;
  //   userId: string;
  //   userName: string;
  //   timestamp: string;
  // }>>([]);
  const [_selectedTab, setSelectedTab] = useState<'matches'>('matches');
  const [refreshing, setRefreshing] = useState(false);
  // const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      // Mock data for now
      const mockMatches: Match[] = [
        {
          _id: '1',
          petId: 'pet1',
          petName: 'Buddy',
          petPhoto: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400',
          petAge: 3,
          petBreed: 'Golden Retriever',
          lastMessage: {
            content: 'Hey! 🐾',
            timestamp: new Date().toISOString(),
            senderId: 'pet1'
          },
          isOnline: true,
          matchedAt: new Date().toISOString(),
          unreadCount: 2
        }
      ];
      setMatches(mockMatches);
    } catch (error) {
      console.error('Failed to load matches:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMatches();
    setRefreshing(false);
  };

  const renderMatch = ({ item }: { item: Match }) => (
    <TouchableOpacity
      style={styles.matchCard}
      onPress={() => {
        if (Haptics) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        navigation.navigate('Chat', {
          matchId: item._id,
          petName: item.petName
        });
      }}
    >
      <Image source={{ uri: item.petPhoto }} style={styles.matchPhoto} />
      <View style={styles.matchInfo}>
        <View style={styles.matchHeader}>
          <Text style={styles.matchName}>{item.petName}</Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
        <Text style={styles.matchMessage} numberOfLines={1}>
          {item.lastMessage.content}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Matches</Text>
        <TouchableOpacity
          onPress={() => {
            if (Haptics) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          }}
        >
          <Ionicons name="filter" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            styles.activeTab
          ]}
          onPress={() => setSelectedTab('matches')}
        >
          <Text style={[
            styles.tabText,
            styles.activeTabText
          ]}>
            Matches
          </Text>
        </TouchableOpacity>
        {/* Liked You tab disabled until its data matches Match type */}
        {/* <TouchableOpacity
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
        </TouchableOpacity> */}
      </View>

      <FlatList
        data={matches}
        renderItem={renderMatch}
        keyExtractor={item => item._id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
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
});
