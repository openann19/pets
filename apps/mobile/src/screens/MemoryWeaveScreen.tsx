import { Ionicons } from '@expo/vector-icons';
import { logger } from '@pawfectmatch/core';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import type { AIScreenProps } from '../navigation/types';


const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface MemoryNode {
  id: string;
  type: 'text' | 'image' | 'video' | 'location';
  content: string;
  title: string;
  timestamp: string;
  metadata?: {
    location?: string;
    participants?: string[];
    emotion?: 'happy' | 'excited' | 'love' | 'playful';
  };
}

const MemoryWeaveScreen: React.FC<AIScreenProps> = ({ navigation }) => {
  // Mock data for demo purposes
  const matchId = 'demo-match-id';
  const petName = 'Demo Pet';
  const initialMemories: MemoryNode[] = useMemo(() => [], []);
  const { isDark } = useTheme();

  const [memories, setMemories] = useState<MemoryNode[]>(initialMemories);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // Load memories from API
  const loadMemories = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);

      // If memories were passed as params, use those
      if (initialMemories.length > 0) {
        setMemories(initialMemories);
        setIsLoading(false);
        // continue below
      }

      // Otherwise fetch from API
      const api = (process.env as Record<string, string | undefined>)['EXPO_PUBLIC_API_URL'] || 'http://localhost:3001/api';

      // Get token from AsyncStorage
      let token: string | null = null;
      try {
        token = await AsyncStorage.getItem('authToken');
      } catch (error) {
        logger.warn('Failed to get token from storage', { error });
      }

      const response = await fetch(`${api}/memories/${matchId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token ?? ''}`
        }
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status.toString()}`);
      }

      const data = await response.json() as { memories: MemoryNode[]; match: any };
      setMemories(data.memories);

      // Update pet name from API response (names available if needed later)
      if (data.match?.pet1 && data.match?.pet2) {
        // data.match.pet1.name, data.match.pet2.name
      }
    } catch (error) {
      logger.error('Failed to load memories:', { error });
      Alert.alert(
        'Connection Error',
        'Failed to load memories. Please check your connection and try again.',
        [{ text: 'Retry', onPress: () => { loadMemories().catch(logger.error); } }]
      );
    } finally {
      setIsLoading(false);
    }
  }, [initialMemories, matchId]);

  useEffect(() => {
    StatusBar.setBarStyle('light-content');

    // Load memories
    loadMemories().catch(logger.error);

    // Entrance animation
    (Animated as any).parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    return () => {
      StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content');
    };
  }, [matchId, fadeAnim, scaleAnim, isDark, loadMemories]);

  const handleScroll = useCallback((event: { nativeEvent: { contentOffset: { x: number } } }) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / screenWidth);

    if (index !== currentIndex && index >= 0 && index < memories.length) {
      setCurrentIndex(index);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(logger.error);
    }
  }, [currentIndex, memories.length]);

  const scrollToIndex = useCallback((index: number) => {
    if (scrollViewRef.current !== null && index >= 0 && index < memories.length) {
      scrollViewRef.current.scrollTo({
        x: index * screenWidth,
        animated: true,
      });
      setCurrentIndex(index);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(logger.error);
    }
  }, [memories.length]);

  const getEmotionColor = (emotion?: string): string => {
    switch (emotion) {
      case 'happy': return '#FFD700';
      case 'excited': return '#FF6B6B';
      case 'love': return '#FF69B4';
      case 'playful': return '#4ECDC4';
      default: return '#8B5CF6';
    }
  };

  const getEmotionEmoji = (emotion?: string): string => {
    switch (emotion) {
      case 'happy': return '😊';
      case 'excited': return '🎉';
      case 'love': return '💕';
      case 'playful': return '🎾';
      default: return '✨';
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays.toString()} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderMemoryCard = (memory: MemoryNode, index: number): React.JSX.Element => {
    const inputRange = [
      (index - 1) * screenWidth,
      index * screenWidth,
      (index + 1) * screenWidth,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
      extrapolate: 'clamp',
    });

    const rotateY = scrollX.interpolate({
      inputRange,
      outputRange: ['45deg', '0deg', '-45deg'],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.6, 1, 0.6],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        key={memory.id}
        style={[
          styles.memoryCard,
          {
            transform: [
              { scale: scale as any },
              { perspective: 1000 as any },
              { rotateY: rotateY as any },
            ] as any,
            opacity: opacity as any,
          } as any,
        ]}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
          style={styles.cardGradient}
        >
          <BlurView intensity={20} style={styles.cardBlur}>
            {/* Memory Header */}
            <View style={styles.memoryHeader}>
              <View style={styles.memoryTitleContainer}>
                <Text style={styles.memoryTitle}>{memory.title}</Text>
                <Text style={styles.memoryTimestamp}>
                  {formatTimestamp(memory.timestamp)}
                </Text>
              </View>
              <View style={[
                styles.emotionBadge,
                { backgroundColor: `${getEmotionColor(memory.metadata?.emotion)}30` }
              ]}>
                <Text style={styles.emotionEmoji}>
                  {getEmotionEmoji(memory.metadata?.emotion)}
                </Text>
              </View>
            </View>

            {/* Memory Content */}
            <View style={styles.memoryContent}>
              {memory.type === 'image' ? (
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: memory.content }}
                    style={styles.memoryImage}
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.3)']}
                    style={styles.imageOverlay}
                  />
                </View>
              ) : (
                <ScrollView style={styles.textContainer} showsVerticalScrollIndicator={false}>
                  <Text style={styles.memoryText}>"{memory.content}"</Text>
                </ScrollView>
              )}
            </View>

            {/* Memory Metadata */}
            {memory.metadata !== undefined && (
              <View style={styles.memoryMetadata}>
                {memory.metadata.location !== undefined && (
                  <View style={styles.metadataItem}>
                    <Ionicons name="location-outline" size={14} color="#fff" />
                    <Text style={styles.metadataText}>{memory.metadata.location}</Text>
                  </View>
                )}
                {memory.metadata.participants !== undefined && (
                  <View style={styles.metadataItem}>
                    <Ionicons name="people-outline" size={14} color="#fff" />
                    <Text style={styles.metadataText}>
                      {memory.metadata.participants.join(' & ')}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </BlurView>
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderConnectionPath = (): React.JSX.Element => {
    const pathPoints = memories.map((_, index) => {
      const x = (index / (memories.length - 1)) * (screenWidth - 80) + 40;
      const y = screenHeight * 0.85;
      return { x, y };
    });

    return (
      <View style={styles.connectionPath}>
        {pathPoints.map((point, index) => {
          if (index === pathPoints.length - 1) return null;

          const nextPoint = pathPoints[index + 1];
          if (nextPoint === undefined) return null;

          const distance = Math.sqrt(
            Math.pow(nextPoint.x - point.x, 2) + Math.pow(nextPoint.y - point.y, 2)
          );
          const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * 180 / Math.PI;

          return (
            <View
              key={index}
              style={[
                styles.pathSegment,
                {
                  left: point.x,
                  top: point.y,
                  width: distance,
                  transform: [{ rotate: `${angle.toString()}deg` }],
                  opacity: index <= currentIndex ? 1 : 0.3,
                },
              ]}
            />
          );
        })}

        {pathPoints.map((point, index) => (
          <TouchableOpacity
            key={`dot-${index}`}
            style={[
              styles.pathDot,
              {
                left: point.x - 6,
                top: point.y - 6,
                backgroundColor: index === currentIndex ? '#FF69B4' : '#fff',
                transform: [{ scale: index === currentIndex ? 1.2 : 1 }],
              },
            ]}
            onPress={() => { scrollToIndex(index); }}
          />
        ))}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#1a1a2e', '#16213e', '#0f3460']}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.loadingContainer}>
          <Animated.View
            style={{
              // Animated style typing workaround
              transform: [
                { scale: scaleAnim as any }
              ] as any
            }}
          >
            <BlurView intensity={20} style={styles.loadingBlur}>
              <Text style={styles.loadingText}>Loading memories...</Text>
            </BlurView>
          </Animated.View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <SafeAreaView style={styles.header}>
        <Animated.View style={[styles.headerContent, { opacity: fadeAnim as any }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(logger.error);
              navigation.goBack();
            }}
          >
            <BlurView intensity={20} style={styles.backButtonBlur}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </BlurView>
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Memory Weave</Text>
            <Text style={styles.headerSubtitle}>{petName}</Text>
          </View>

          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(logger.error);
              // Share functionality
            }}
          >
            <BlurView intensity={20} style={styles.shareButtonBlur}>
              <Ionicons name="share-outline" size={24} color="#fff" />
            </BlurView>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>

      {/* Memory Cards */}
      <Animated.View
        style={[
          styles.cardsContainer,
          {
            opacity: fadeAnim as any,
            transform: [{ scale: scaleAnim as any }] as any
          }
        ]}
      >
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={(Animated as any).event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            {
              useNativeDriver: false,
              listener: handleScroll,
            }
          )}
          scrollEventThrottle={16}
          decelerationRate="fast"
          snapToInterval={screenWidth}
          snapToAlignment="center"
        >
          {memories.map((memory, index) => renderMemoryCard(memory, index))}
        </ScrollView>
      </Animated.View>

      {/* Connection Path */}
      <Animated.View style={[styles.pathContainer, { opacity: fadeAnim as any }]}>
        {renderConnectionPath()}
      </Animated.View>

      {/* Memory Counter */}
      <Animated.View style={[styles.counterContainer, { opacity: fadeAnim as any }]}>
        <BlurView intensity={20} style={styles.counterBlur}>
          <Text style={styles.counterText}>
            {currentIndex + 1} of {memories.length}
          </Text>
        </BlurView>
      </Animated.View>
    </View>
  );
};

export default MemoryWeaveScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  backButtonBlur: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  shareButtonBlur: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardsContainer: {
    flex: 1,
    paddingTop: 40,
  },
  memoryCard: {
    width: screenWidth * 0.85,
    height: screenHeight * 0.6,
    marginHorizontal: screenWidth * 0.075,
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardGradient: {
    flex: 1,
    borderRadius: 20,
  },
  cardBlur: {
    flex: 1,
    padding: 20,
  },
  memoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  memoryTitleContainer: {
    flex: 1,
  },
  memoryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  memoryTimestamp: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  emotionBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  emotionEmoji: {
    fontSize: 20,
  },
  memoryContent: {
    flex: 1,
    marginBottom: 20,
  },
  imageContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  memoryImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  textContainer: {
    flex: 1,
  },
  memoryText: {
    fontSize: 18,
    color: '#fff',
    lineHeight: 26,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  memoryMetadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  metadataText: {
    fontSize: 12,
    color: '#fff',
    marginLeft: 4,
  },
  pathContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    height: 40,
  },
  connectionPath: {
    flex: 1,
    position: 'relative',
  },
  pathSegment: {
    position: 'absolute',
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  pathDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  counterContainer: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    borderRadius: 20,
    overflow: 'hidden',
  },
  counterBlur: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  counterText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingBlur: {
    paddingHorizontal: 30,
    paddingVertical: 20,
    borderRadius: 16,
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
