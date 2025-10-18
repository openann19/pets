import { Ionicons } from '@expo/vector-icons';
import { useAuthStore, useSwipeLogic, type Pet, type PetFilters } from '@pawfectmatch/core';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useState } from 'react';
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

import { 
  EliteContainer,
  EliteHeader,
  EliteCard,
  EliteButton,
  EliteLoading,
  FadeInUp,
  ScaleIn,
  StaggeredContainer,
  GestureWrapper,
  GlassContainer,
  GlassCard,
  HolographicContainer,
  HolographicCard,
  GlowContainer,
  GlowingCard,
  GradientText,
  PremiumHeading,
  PremiumBody,
  ParticleEffect,
} from '../components/PremiumComponents';
import { useTheme } from '../contexts/ThemeContext';
import { matchesAPI } from '../services/api';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');


type RootStackParamList = {
  Swipe: undefined;
  Matches: undefined;
  Chat: { matchId: string; petName: string };
};

type SwipeScreenProps = NativeStackScreenProps<RootStackParamList, 'Swipe'>;

export default function SwipeScreen({ navigation }: SwipeScreenProps) {
  const { user } = useAuthStore();
  
  // Real API calls for pets
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { handleLike, handlePass, handleSuperLike } = useSwipeLogic({
    onMatch: (result) => {
      if (result.isMatch) {
        setShowMatchModal(true);
      }
    }
  });

  // Filter state for mobile
  const [filters, setFilters] = useState<PetFilters>({
    breed: '',
    species: '',
    size: '',
    maxDistance: 25
  });

  const loadPets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // ✅ REAL API - Fetch pets from backend with proper typing
      const realPets = await matchesAPI.getPets(filters);
      setPets(realPets);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load pets. Please check your connection.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const swipePet = useCallback(async (petId: string, action: 'like' | 'pass' | 'superlike') => {
    try {
      const pet = pets.find(p => p._id === petId);
      if (!pet) return null;

      // Convert mobile Pet to core Pet type with proper typing
      const corePet = {
        ...pet,
        bio: pet.description ?? '',
        distance: 0,
        compatibility: 0,
        isVerified: true,
        owner: { _id: 'owner1', name: 'Owner' }
      };

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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert('Error', `Failed to process swipe: ${errorMessage}`);
      return null;
    }
  }, [pets, handleLike, handlePass, handleSuperLike]);

  const refreshPets = useCallback(() => {
    void loadPets();
  }, [loadPets]);
  
  // Load pets on component mount
  useEffect(() => {
    void loadPets();
  }, [loadPets]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedPet, setMatchedPet] = useState<Pet | null>(null);
  
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
    onPanResponderRelease: (_evt, gestureState) => {
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

  const handleSwipe = useCallback(async (action: 'like' | 'pass' | 'superlike') => {
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
        void loadPets();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process swipe';
      Alert.alert('Error', errorMessage);
    }
  }, [pets, currentIndex, position, swipePet, loadPets]);

  const handleButtonSwipe = useCallback((action: 'like' | 'pass' | 'superlike') => {
    void handleSwipe(action);
  }, [handleSwipe]);

  const currentPet = pets[currentIndex];

  if (isLoading && pets.length === 0) {
    return (
      <EliteContainer gradient="primary">
        <EliteLoading 
          title="Loading pets..." 
          subtitle="Finding your perfect matches"
          variant="paws"
        />
      </EliteContainer>
    );
  }

  if (error) {
    return (
      <EliteContainer gradient="primary">
        <View style={styles.emptyContainer}>
          <GlowContainer color="error" intensity="medium" animated={true}>
            <Ionicons name="alert-circle-outline" size={80} color="#ff6b6b" />
          </GlowContainer>
          <PremiumHeading level={2} gradient="error" animated={true}>
            Error loading pets
          </PremiumHeading>
          <PremiumBody size="base" weight="regular">
            {error}
          </PremiumBody>
          <EliteButton
            title="Try Again"
            variant="primary"
            size="lg"
            icon="refresh"
            magnetic={true}
            ripple={true}
            glow={true}
            onPress={refreshPets}
          />
        </View>
      </EliteContainer>
    );
  }

  if (!currentPet) {
    return (
      <EliteContainer gradient="primary">
        <View style={styles.emptyContainer}>
          <GlowContainer color="primary" intensity="light" animated={true}>
            <Ionicons name="heart-outline" size={80} color="#ec4899" />
          </GlowContainer>
          <PremiumHeading level={2} gradient="primary" animated={true}>
            No more pets!
          </PremiumHeading>
          <PremiumBody size="base" weight="regular">
            Check back later for more matches
          </PremiumBody>
          <EliteButton
            title="Refresh"
            variant="secondary"
            size="lg"
            icon="refresh"
            magnetic={true}
            ripple={true}
            glow={true}
            onPress={loadPets}
          />
        </View>
      </EliteContainer>
    );
  }

  const primaryPhoto = currentPet.photos.find((p) => p.isPrimary) || currentPet.photos[0];
  const ageText = currentPet.age < 1 ? `${Math.round(currentPet.age * 12)} months` : `${currentPet.age} years`;

  return (
    <EliteContainer gradient="primary">
      {/* Premium Glass Header */}
      <EliteHeader
        title="Discover"
        subtitle="Find your perfect match"
        blur={true}
        onBack={() => navigation.goBack()}
        rightComponent={
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <EliteButton
              title="Filter"
              variant="glass"
              size="sm"
              icon="options-outline"
              magnetic={true}
              ripple={true}
              onPress={() => setShowFilters(!showFilters)}
            />
            <EliteButton
              title=""
              variant="glass"
              size="sm"
              icon="heart"
              magnetic={true}
              ripple={true}
              glow={true}
              onPress={() => navigation.navigate('Matches')}
            />
          </View>
        }
      />

      {/* Premium Filter Panel */}
      {showFilters && (
        <FadeInUp delay={0}>
          <GlassContainer intensity="medium" transparency="medium" border="light" shadow="medium">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterContent}>
                {/* Quick Breed Filters */}
                <PremiumBody size="sm" weight="semibold" gradient="primary">
                  Popular Breeds:
                </PremiumBody>
                <View style={styles.breedFilters}>
                  {['Shiba Inu', 'Golden Retriever', 'Labrador', 'Border Collie'].map(breed => {
                    const handleBreedPress = useCallback(() => {
                      setFilters(prev => ({
                        ...prev,
                        breed: prev.breed === breed ? '' : breed,
                        species: 'dog'
                      }));
                    }, [breed]);
                    
                    return (
                      <EliteButton
                        key={breed}
                        title={breed}
                        variant={filters.breed === breed ? "primary" : "glass"}
                        size="sm"
                        magnetic={true}
                        ripple={true}
                        glow={filters.breed === breed}
                        onPress={handleBreedPress}
                      />
                    );
                  })}
                </View>
                
                {/* Species Filter */}
                <View style={styles.speciesFilters}>
                  {['All', 'Dogs', 'Cats', 'Birds'].map(species => {
                    const handleSpeciesPress = useCallback(() => {
                      setFilters(prev => ({
                        ...prev,
                        species: species === 'All' ? '' : species.toLowerCase()
                      }));
                    }, [species]);
                    
                    return (
                      <EliteButton
                        key={species}
                        title={species}
                        variant={(species === 'All' ? '' : species.toLowerCase()) === filters.species ? "secondary" : "glass"}
                        size="sm"
                        magnetic={true}
                        ripple={true}
                        glow={(species === 'All' ? '' : species.toLowerCase()) === filters.species}
                        onPress={handleSpeciesPress}
                      />
                    );
                  })}
                </View>

                {/* Apply Button */}
                <EliteButton
                  title="Apply Filters"
                  variant="holographic"
                  size="md"
                  icon="checkmark"
                  magnetic={true}
                  ripple={true}
                  glow={true}
                  shimmer={true}
                  onPress={loadPets}
                />
              </View>
            </ScrollView>
          </GlassContainer>
        </FadeInUp>
      )}

      {/* Premium Card Stack */}
      <View style={styles.cardContainer}>
        <GestureWrapper
          onSwipeLeft={() => handleButtonSwipe('pass')}
          onSwipeRight={() => handleButtonSwipe('like')}
          onSwipeUp={() => handleButtonSwipe('superlike')}
        >
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
            {/* Premium Like/Nope Indicators */}
            <Animated.View style={[styles.likeIndicator, { opacity: likeOpacity }]}>
              <GlowContainer color="success" intensity="heavy" animated={true}>
                <GradientText gradient="success" size="lg" weight="bold" glow={true}>
                  LIKE
                </GradientText>
              </GlowContainer>
            </Animated.View>
            <Animated.View style={[styles.nopeIndicator, { opacity: nopeOpacity }]}>
              <GlowContainer color="error" intensity="heavy" animated={true}>
                <GradientText gradient="error" size="lg" weight="bold" glow={true}>
                  NOPE
                </GradientText>
              </GlowContainer>
            </Animated.View>

            {/* Pet Photo with Glass Effect */}
            <GlassContainer intensity="light" transparency="light" border="light" shadow="medium">
              <Image source={{ uri: primaryPhoto?.url }} style={styles.petImage} />
            </GlassContainer>
            
            {/* Premium Featured Badge */}
            {currentPet.featured?.isFeatured && (
              <GlowContainer color="neon" intensity="medium" animated={true}>
                <View style={styles.featuredBadge}>
                  <Ionicons name="star" size={16} color="#fff" />
                  <GradientText gradient="neon" size="sm" weight="bold" glow={true}>
                    Featured
                  </GradientText>
                </View>
              </GlowContainer>
            )}

            {/* Premium Pet Info Overlay */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.infoOverlay}
            >
              <View style={styles.petInfo}>
                <View style={styles.nameRow}>
                  <GradientText gradient="primary" size="2xl" weight="bold" glow={true}>
                    {currentPet.name}
                  </GradientText>
                  <PremiumBody size="lg" weight="semibold" gradient="secondary">
                    {ageText}
                  </PremiumBody>
                </View>
                <PremiumBody size="base" weight="medium" gradient="primary">
                  {currentPet.breed}
                </PremiumBody>
                <PremiumBody size="sm" weight="regular">
                  2.5 km away
                </PremiumBody>
              </View>
            </LinearGradient>
          </Animated.View>
        </GestureWrapper>

        {/* Next card preview with Glass Effect */}
        {pets[currentIndex + 1] && (
          <GlassContainer intensity="light" transparency="light" border="light" shadow="light">
            <View style={[styles.card, styles.nextCard]}>
              <Image 
                source={{ uri: pets[currentIndex + 1]?.photos[0]?.url ?? '' }} 
                style={styles.petImage} 
              />
            </View>
          </GlassContainer>
        )}
      </View>

      {/* Premium Action Buttons */}
      <StaggeredContainer delay={100}>
        <View style={styles.actionButtons}>
          <FadeInUp delay={0}>
            <EliteButton
              title=""
              variant="glass"
              size="xl"
              icon="close"
              magnetic={true}
              ripple={true}
              glow={true}
              onPress={() => handleButtonSwipe('pass')}
              style={styles.actionButton}
            />
          </FadeInUp>

          <FadeInUp delay={100}>
            <EliteButton
              title=""
              variant="holographic"
              size="lg"
              icon="star"
              magnetic={true}
              ripple={true}
              glow={true}
              shimmer={true}
              onPress={() => handleButtonSwipe('superlike')}
              style={styles.actionButton}
            />
          </FadeInUp>

          <FadeInUp delay={200}>
            <EliteButton
              title=""
              variant="primary"
              size="xl"
              icon="heart"
              magnetic={true}
              ripple={true}
              glow={true}
              onPress={() => handleButtonSwipe('like')}
              style={styles.actionButton}
            />
          </FadeInUp>
        </View>
      </StaggeredContainer>

      {/* Premium Match Modal with Particle Effects */}
      {showMatchModal && matchedPet && (
        <View style={styles.matchModal}>
          <ParticleEffect count={20} variant="rainbow" speed="fast" />
          <HolographicContainer
            variant="rainbow"
            speed="fast"
            animated={true}
            shimmer={true}
            glow={true}
            style={styles.matchModalContent}
          >
            <ScaleIn delay={0}>
              <PremiumHeading level={1} gradient="holographic" animated={true} glow={true}>
                It's a Match! 🎉
              </PremiumHeading>
            </ScaleIn>
            
            <FadeInUp delay={200}>
              <View style={styles.matchPhotos}>
                <GlowContainer color="primary" intensity="medium" animated={true}>
                  <Image 
                    source={{ uri: matchedPet.photos[0]?.url }} 
                    style={styles.matchPhoto} 
                  />
                </GlowContainer>
                <GlowContainer color="secondary" intensity="medium" animated={true}>
                  <Image 
                    source={{ uri: 'https://via.placeholder.com/100' }} 
                    style={styles.matchPhoto} 
                  />
                </GlowContainer>
              </View>
            </FadeInUp>
            
            <FadeInUp delay={400}>
              <PremiumBody size="lg" weight="semibold" gradient="primary">
                You and {matchedPet.name} liked each other!
              </PremiumBody>
            </FadeInUp>
            
            <FadeInUp delay={600}>
              <View style={styles.matchButtons}>
                <EliteButton
                  title="Keep Swiping"
                  variant="glass"
                  size="lg"
                  magnetic={true}
                  ripple={true}
                  onPress={() => setShowMatchModal(false)}
                />
                <EliteButton
                  title="Send Message"
                  variant="holographic"
                  size="lg"
                  icon="chatbubble"
                  magnetic={true}
                  ripple={true}
                  glow={true}
                  shimmer={true}
                  onPress={() => {
                    setShowMatchModal(false);
                    if (matchedPet) {
                      navigation.navigate('Chat', { 
                        matchId: matchedPet._id, 
                        petName: matchedPet.name 
                      });
                    }
                  }}
                />
              </View>
            </FadeInUp>
          </HolographicContainer>
        </View>
      )}
    </EliteContainer>
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
