import { Ionicons } from '@expo/vector-icons';
import { useAuthStore, useSwipeLogic } from '@pawfectmatch/core';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../contexts/ThemeContext';

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
  healthInfo: {
    vaccinated: boolean;
    spayedNeutered: boolean;
  };
  featured: { isFeatured: boolean };
  owner: {
    name: string;
    location?: { city: string };
  };
}

interface SwipeScreenProps {
  navigation: any;
}

export default function SwipeScreen({ navigation }: SwipeScreenProps) {
  const { user } = useAuthStore();
  const { colors, isDark } = useTheme();
  // Mock data for now - replace with actual API calls
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { handleLike, handlePass, handleSuperLike, isProcessing } = useSwipeLogic({
    onMatch: (result) => {
      if (result.isMatch) {
        setShowMatchModal(true);
      }
    }
  });

  const loadPets = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      const mockPets: Pet[] = [
        {
          _id: '1',
          name: 'Buddy',
          species: 'dog',
          breed: 'Golden Retriever',
          age: 3,
          size: 'large',
          intent: 'adoption',
          description: 'Friendly and energetic',
          photos: [{ url: 'https://example.com/buddy.jpg', isPrimary: true }],
          personalityTags: ['friendly', 'energetic'],
          healthInfo: { vaccinated: true, spayedNeutered: true },
          featured: { isFeatured: false },
          owner: { name: 'John Doe' }
        }
      ];
      setPets(mockPets);
    } catch (err) {
      setError('Failed to load pets');
    } finally {
      setIsLoading(false);
    }
  };

  const swipePet = async (petId: string, action: 'like' | 'pass' | 'superlike') => {
    const pet = pets.find(p => p._id === petId);
    if (!pet) return null;

    // Convert mobile Pet to core Pet type
    const corePet = {
      ...pet,
      bio: pet.description,
      distance: 0,
      compatibility: 0,
      isVerified: true,
      owner: { _id: 'owner1', name: 'Owner' }
    } as any;

    switch (action) {
      case 'like':
        return await handleLike(corePet);
      case 'pass':
        return await handlePass(corePet);
      case 'superlike':
        return await handleSuperLike(corePet);
      default:
        return null;
    }
  };

  const refreshPets = loadPets;
  
  // Load pets on component mount
  useEffect(() => {
    loadPets();
  }, []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedPet, setMatchedPet] = useState<Pet | null>(null);
  
  // Filter state for mobile
  const [filters, setFilters] = useState({
    breed: '',
    species: '',
    size: '',
    maxDistance: 25
  });
  const [showFilters, setShowFilters] = useState(false);

  // Animation values
  const position = new Animated.ValueXY();
  const rotate = position.x.interpolate({
    inputRange: [-screenWidth / 2, 0, screenWidth / 2],
    outputRange: ['-30deg', '0deg', '30deg'],
    extrapolate: 'clamp',
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, screenWidth / 4],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const nopeOpacity = position.x.interpolate({
    inputRange: [-screenWidth / 4, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // Pan responder for swipe gestures
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: Animated.event([null, { dx: position.x, dy: position.y }], {
      useNativeDriver: false,
    }),
    onPanResponderRelease: (evt, gestureState) => {
      const { dx, dy } = gestureState;
      const swipeThreshold = screenWidth * 0.3;

      if (dx > swipeThreshold) {
        // Swipe right - like
        handleSwipe('like');
      } else if (dx < -swipeThreshold) {
        // Swipe left - pass
        handleSwipe('pass');
      } else if (dy < -swipeThreshold) {
        // Swipe up - super like
        handleSwipe('superlike');
      } else {
        // Snap back
        Animated.spring(position, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      }
    },
  });

  useEffect(() => {
    loadPets();
  }, []);

  const handleSwipe = async (action: 'like' | 'pass' | 'superlike') => {
    const currentPet = pets[currentIndex];
    if (!currentPet) return;

    try {
      // Animate card off screen
      const toValue = action === 'like' ? screenWidth : action === 'pass' ? -screenWidth : 0;
      
      Animated.timing(position, {
        toValue: { x: toValue, y: action === 'superlike' ? -screenHeight : 0 },
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        // Reset position for next card
        position.setValue({ x: 0, y: 0 });
        
        // Move to next pet
        setCurrentIndex(prev => prev + 1);
      });

      // Use real API call from web hook
      const result = await swipePet(currentPet._id, action);
      if (result?.isMatch) {
        setMatchedPet(currentPet);
        setShowMatchModal(true);
      }
      
      // Load more pets when running low
      if (currentIndex >= pets.length - 2) {
        loadPets();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process swipe');
    }
  };

  const handleButtonSwipe = (action: 'like' | 'pass' | 'superlike') => {
    handleSwipe(action);
  };

  const currentPet = pets[currentIndex];

  if (isLoading && pets.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading pets...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={80} color="#ff6b6b" />
          <Text style={styles.emptyTitle}>Error loading pets</Text>
          <Text style={styles.emptySubtitle}>{error}</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={refreshPets}>
            <Text style={styles.refreshButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentPet) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>No more pets!</Text>
          <Text style={styles.emptySubtitle}>Check back later for more matches</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={loadPets}>
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const primaryPhoto = currentPet.photos.find((p: any) => p.isPrimary) || currentPet.photos[0];
  const ageText = currentPet.age < 1 ? `${Math.round(currentPet.age * 12)} months` : `${currentPet.age} years`;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Discover</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            onPress={() => setShowFilters(!showFilters)}
            style={styles.filterButton}
          >
            <Ionicons name="options-outline" size={20} color="#333" />
            <Text style={styles.filterText}>Filter</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Matches')}>
            <Ionicons name="heart" size={24} color="#ff6b6b" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Simple Filter Panel */}
      {showFilters && (
        <View style={styles.filterPanel}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterContent}>
              {/* Quick Breed Filters */}
              <Text style={styles.filterLabel}>Popular Breeds:</Text>
              <View style={styles.breedFilters}>
                {['Shiba Inu', 'Golden Retriever', 'Labrador', 'Border Collie'].map(breed => (
                  <TouchableOpacity
                    key={breed}
                    onPress={() => setFilters(prev => ({
                      ...prev,
                      breed: prev.breed === breed ? '' : breed,
                      species: 'dog'
                    }))}
                    style={[
                      styles.breedButton,
                      filters.breed === breed && styles.breedButtonActive
                    ]}
                  >
                    <Text style={[
                      styles.breedButtonText,
                      filters.breed === breed && styles.breedButtonTextActive
                    ]}>
                      {breed}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              {/* Species Filter */}
              <View style={styles.speciesFilters}>
                {['All', 'Dogs', 'Cats', 'Birds'].map(species => (
                  <TouchableOpacity
                    key={species}
                    onPress={() => setFilters(prev => ({
                      ...prev,
                      species: species === 'All' ? '' : species.toLowerCase()
                    }))}
                    style={[
                      styles.speciesButton,
                      (species === 'All' ? '' : species.toLowerCase()) === filters.species && styles.speciesButtonActive
                    ]}
                  >
                    <Text style={[
                      styles.speciesButtonText,
                      (species === 'All' ? '' : species.toLowerCase()) === filters.species && styles.speciesButtonTextActive
                    ]}>
                      {species}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Apply Button */}
              <TouchableOpacity style={styles.applyButton} onPress={loadPets}>
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      )}

      {/* Card Stack */}
      <View style={styles.cardContainer}>
        <Animated.View
          style={[
            styles.card,
            {
              transform: [
                { translateX: position.x },
                { translateY: position.y },
                { rotate },
              ],
            },
          ]}
          {...panResponder.panHandlers}
        >
          {/* Like/Nope Indicators */}
          <Animated.View style={[styles.likeIndicator, { opacity: likeOpacity }]}>
            <Text style={styles.likeText}>LIKE</Text>
          </Animated.View>
          <Animated.View style={[styles.nopeIndicator, { opacity: nopeOpacity }]}>
            <Text style={styles.nopeText}>NOPE</Text>
          </Animated.View>

          {/* Pet Photo */}
          <Image source={{ uri: primaryPhoto?.url }} style={styles.petImage} />
          
          {/* Featured Badge */}
          {currentPet.featured?.isFeatured && (
            <View style={styles.featuredBadge}>
              <Ionicons name="star" size={16} color="#fff" />
              <Text style={styles.featuredText}>Featured</Text>
            </View>
          )}

          {/* Pet Info Overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.infoOverlay}
          >
            <View style={styles.petInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.petName}>{currentPet.name}</Text>
                <Text style={styles.petAge}>{ageText}</Text>
              </View>
              <Text style={styles.petBreed}>{currentPet.breed}</Text>
              <Text style={styles.petDistance}>2.5 km away</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Next card preview */}
        {pets[currentIndex + 1] && (
          <View style={[styles.card, styles.nextCard]}>
            <Image 
              source={{ uri: pets[currentIndex + 1].photos[0]?.url }} 
              style={styles.petImage} 
            />
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.passButton]}
          onPress={() => handleButtonSwipe('pass')}
        >
          <Ionicons name="close" size={30} color="#ff4458" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.superLikeButton]}
          onPress={() => handleButtonSwipe('superlike')}
        >
          <Ionicons name="star" size={24} color="#42a5f5" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.likeButton]}
          onPress={() => handleButtonSwipe('like')}
        >
          <Ionicons name="heart" size={30} color="#66d7a2" />
        </TouchableOpacity>
      </View>

      {/* Match Modal */}
      {showMatchModal && matchedPet && (
        <View style={styles.matchModal}>
          <LinearGradient
            colors={['#ff6b6b', '#ff8e8e']}
            style={styles.matchModalContent}
          >
            <Text style={styles.matchTitle}>It's a Match! 🎉</Text>
            <View style={styles.matchPhotos}>
              <Image 
                source={{ uri: matchedPet.photos[0]?.url }} 
                style={styles.matchPhoto} 
              />
              <Image 
                source={{ uri: 'https://via.placeholder.com/100' }} 
                style={styles.matchPhoto} 
              />
            </View>
            <Text style={styles.matchText}>
              You and {matchedPet.name} liked each other!
            </Text>
            <View style={styles.matchButtons}>
              <TouchableOpacity
                style={styles.keepSwipingButton}
                onPress={() => setShowMatchModal(false)}
              >
                <Text style={styles.keepSwipingText}>Keep Swiping</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sendMessageButton}
                onPress={() => {
                  setShowMatchModal(false);
                  navigation.navigate('Chat', { matchId: matchedPet._id });
                }}
              >
                <Text style={styles.sendMessageText}>Send Message</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      )}
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    marginLeft: 4,
  },
  filterPanel: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 15,
  },
  filterContent: {
    paddingHorizontal: 20,
    alignItems: 'flex-start',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  breedFilters: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  breedButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  breedButtonActive: {
    backgroundColor: '#e91e63',
    borderColor: '#e91e63',
  },
  breedButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  breedButtonTextActive: {
    color: '#fff',
  },
  speciesFilters: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 6,
  },
  speciesButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 8,
  },
  speciesButtonActive: {
    backgroundColor: '#2196f3',
    borderColor: '#2196f3',
  },
  speciesButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  speciesButtonTextActive: {
    color: '#fff',
  },
  applyButton: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  refreshButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 30,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: screenWidth - 40,
    height: screenHeight * 0.65,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    position: 'absolute',
  },
  nextCard: {
    transform: [{ scale: 0.95 }],
    opacity: 0.8,
    zIndex: -1,
  },
  petImage: {
    width: '100%',
    height: '70%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    resizeMode: 'cover',
  },
  featuredBadge: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: '#ffd700',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  featuredText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  likeIndicator: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: '#66d7a2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    zIndex: 10,
  },
  likeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  nopeIndicator: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: '#ff4458',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    zIndex: 10,
  },
  nopeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    justifyContent: 'flex-end',
  },
  petInfo: {
    padding: 20,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  petName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 10,
  },
  petAge: {
    fontSize: 20,
    color: '#fff',
    opacity: 0.9,
  },
  petBreed: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
    marginBottom: 5,
  },
  petDistance: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.7,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 40,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  passButton: {
    backgroundColor: '#fff',
  },
  superLikeButton: {
    backgroundColor: '#fff',
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  likeButton: {
    backgroundColor: '#fff',
  },
  matchModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  matchModalContent: {
    width: screenWidth - 40,
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
  },
  matchTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',
  },
  matchPhotos: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  matchPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginHorizontal: 10,
    borderWidth: 3,
    borderColor: '#fff',
  },
  matchText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.9,
  },
  matchButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  keepSwipingButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#fff',
  },
  keepSwipingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sendMessageButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  sendMessageText: {
    color: '#ff6b6b',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
