import { Ionicons } from '@expo/vector-icons';
import { logger, secureStorage } from '@pawfectmatch/core';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Modal, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import {
  EliteButton,
  EliteCard,
  EliteContainer,
  EliteEmptyState,
  EliteHeader,
  EliteLoading,
  EliteScrollContainer,
} from '../../components/EliteComponents';
import { Colors, GlobalStyles, Shadows, Spacing } from '../../styles/GlobalStyles';

type AdoptionStackParamList = {
  AdoptionManager: undefined;
  CreateListing: undefined;
};

type AdoptionManagerScreenProps = NativeStackScreenProps<AdoptionStackParamList, 'AdoptionManager'>;

type PetListing = {
  id: string;
  name: string;
  breed: string;
  status: 'active' | 'pending' | 'adopted' | 'paused';
  stats: {
    views: number;
    applications: number;
    references: number;
  };
};

type AdoptionApplication = {
  id: string;
  applicantName: string;
  petName: string;
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  date: string;
  matchScore: number;
};

const SPRING_CONFIG = {
  damping: 15,
  stiffness: 120,
  mass: 1,
};

const AdoptionManagerScreen = ({ navigation }: AdoptionManagerScreenProps) => {
  const [activeTab, setActiveTab] = useState<'listings' | 'applications'>('listings');
  const [refreshing, setRefreshing] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState<PetListing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [petListings, setPetListings] = useState<PetListing[]>([]);
  const [applications, setApplications] = useState<AdoptionApplication[]>([]);

  // Fetch pet listings from API
  const fetchPetListings = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const token = await secureStorage.getItem('accessToken');
      const response = await fetch(`${process.env['EXPO_PUBLIC_API_URL'] || 'http://localhost:3000'}/api/adoption/listings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch listings');
      const data: { listings?: PetListing[] } = await response.json();
      setPetListings(data.listings || []);
    } catch (err) {
      logger.error('Error fetching pet listings:', { error: err });
      setError(err instanceof Error ? err.message : 'Failed to load listings');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch applications from API
  const fetchApplications = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const token = await secureStorage.getItem('accessToken');
      const response = await fetch(`${process.env['EXPO_PUBLIC_API_URL'] || 'http://localhost:3000'}/api/adoption/applications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch applications');
      const data: { applications?: AdoptionApplication[] } = await response.json();
      setApplications(data.applications || []);
    } catch (err) {
      logger.error('Error fetching applications:', { error: err });
      setError(err instanceof Error ? err.message : 'Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchPetListings();
    fetchApplications();
  }, [fetchApplications, fetchPetListings]);

  const tabScale1 = useSharedValue(1);
  const tabScale2 = useSharedValue(1);

  const tabAnimatedStyle1 = useAnimatedStyle(() => ({
    transform: [{ scale: tabScale1.value }],
  }));

  const tabAnimatedStyle2 = useAnimatedStyle(() => ({
    transform: [{ scale: tabScale2.value }],
  }));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchPetListings(), fetchApplications()]);
    } finally {
      setRefreshing(false);
    }
  }, [fetchApplications, fetchPetListings]);

  const handleTabPress = (tab: 'listings' | 'applications', scaleValue: ReturnType<typeof useSharedValue>): void => {
    setActiveTab(tab);
    scaleValue.value = withSpring(0.95, SPRING_CONFIG);
    // Simple animation without callback
  };

  const handleStatusChange = async (pet: PetListing, newStatus: PetListing['status']): Promise<void> => {
    try {
      const token = await secureStorage.getItem('accessToken');
      const response = await fetch(`${process.env['EXPO_PUBLIC_API_URL'] || 'http://localhost:3000'}/api/adoption/listings/${pet.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      // Update local state
      setPetListings((prev) => prev.map((p) => (p.id === pet.id ? { ...p, status: newStatus } : p)));
      Alert.alert('Success', 'Pet status updated successfully');
    } catch (err) {
      logger.error('Error updating status:', { error: err });
      Alert.alert('Error', 'Failed to update pet status');
    } finally {
      setShowStatusModal(false);
      setSelectedPet(null);
    }
  };

  const handleApplicationAction = (applicationId: string, action: 'approve' | 'reject'): void => {
    Alert.alert(
      `${action === 'approve' ? 'Approve' : 'Reject'} Application`,
      `Are you sure you want to ${action} this application? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await secureStorage.getItem('accessToken');
              const response = await fetch(`${process.env['EXPO_PUBLIC_API_URL'] || 'http://localhost:3000'}/api/adoption/applications/${applicationId}/status`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ action }),
              });

              if (!response.ok) {
                throw new Error(`Failed to ${action} application`);
              }

              // Update local state
              setApplications((prev) =>
                prev.map((app) =>
                  app.id === applicationId ? { ...app, status: action === 'approve' ? 'approved' : 'rejected' } : app,
                ),
              );
              Alert.alert('Success', `Application ${action}d successfully`);
            } catch (err) {
              logger.error(`Error ${action}ing application:`, { error: err });
              Alert.alert('Error', `Failed to ${action} application`);
            }
          },
        },
      ],
    );
  };

  const getStatusColor = (status: PetListing['status'] | AdoptionApplication['status']): string => {
    switch (status) {
      case 'active':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'adopted':
        return '#8b5cf6';
      case 'withdrawn':
        return '#6b7280';
      case 'paused':
        return '#6b7280';
      case 'approved':
        return '#10b981';
      case 'rejected':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status: PetListing['status'] | AdoptionApplication['status']): string => {
    switch (status) {
      case 'active':
        return '✅';
      case 'pending':
        return '⏳';
      case 'adopted':
        return '🎉';
      case 'withdrawn':
        return '↩️';
      case 'paused':
        return '⏸️';
      case 'approved':
        return '✅';
      case 'rejected':
        return '❌';
      default:
        return '❓';
    }
  };

  const renderEliteListings = () => (
    <View style={GlobalStyles.py4}>
      {petListings.map((pet) => (
        <EliteCard key={pet.id} style={GlobalStyles.mb4}>
          <View style={styles.eliteListingHeader}>
            <View style={localStyles.flex1}>
              <Text style={GlobalStyles.heading3}>{pet.name}</Text>
              <Text style={GlobalStyles.body}>{pet.breed}</Text>
            </View>
            <View
              style={[
                styles.eliteStatusBadge,
                { backgroundColor: `${getStatusColor(pet.status)}20` },
              ]}
            >
              <Text style={[styles.eliteStatusText, { color: getStatusColor(pet.status) }]}>
                {getStatusIcon(pet.status)} {pet.status.charAt(0).toUpperCase() + pet.status.slice(1)}
              </Text>
            </View>
          </View>

          <View style={styles.eliteStatsContainer}>
            <View style={styles.eliteStat}>
              <Text style={styles.eliteStatValue}>{pet.stats.views}</Text>
              <Text style={styles.eliteStatLabel}>Views</Text>
            </View>
            <View style={styles.eliteStat}>
              <Text style={styles.eliteStatValue}>{pet.stats.applications}</Text>
              <Text style={styles.eliteStatLabel}>Apps</Text>
            </View>
            <View style={styles.eliteStat}>
              <Text style={styles.eliteStatValue}>{pet.stats.references}</Text>
              <Text style={styles.eliteStatLabel}>Refs</Text>
            </View>
          </View>

          <EliteButton
            title="Manage Status"
            variant="secondary"
            size="small"
            icon="settings-outline"
            onPress={() => {
              setSelectedPet(pet);
              setShowStatusModal(true);
            }}
            style={localStyles.flex1}
          />
        </EliteCard>
      ))}
    </View>
  );

  const renderEliteApplications = () => (
    <View style={GlobalStyles.py4}>
      {applications.map((app) => (
        <EliteCard key={app.id} style={GlobalStyles.mb4}>
          <View style={styles.eliteApplicationHeader}>
            <View style={localStyles.flex1}>
              <Text style={GlobalStyles.heading3}>{app.applicantName}</Text>
              <Text style={GlobalStyles.body}>Applying for: {app.petName}</Text>
            </View>
            <View
              style={[
                styles.eliteStatusBadge,
                { backgroundColor: `${getStatusColor(app.status)}20` },
              ]}
            >
              <Text style={[styles.eliteStatusText, { color: getStatusColor(app.status) }]}>
                {getStatusIcon(app.status)} {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
              </Text>
            </View>
          </View>

          <View style={styles.eliteApplicationDetails}>
            <Text style={styles.eliteDetailText}>
              <Ionicons name="calendar-outline" /> {new Date(app.date).toLocaleDateString()}
            </Text>
            <Text style={styles.eliteDetailText}>
              <Ionicons name="person-outline" /> {app.matchScore}% Match
            </Text>
          </View>

          {app.status === 'pending' && (
            <View style={styles.eliteActionsContainer}>
              <EliteButton
                title="Reject"
                variant="ghost"
                size="small"
                icon="close"
                onPress={() => handleApplicationAction(app.id, 'reject')}
                style={[localStyles.flex1, { borderColor: Colors.error }]}
              />
              <View style={GlobalStyles.mx2} />
              <EliteButton
                title="Approve"
                variant="primary"
                size="small"
                icon="checkmark"
                onPress={() => handleApplicationAction(app.id, 'approve')}
                style={localStyles.flex1}
                gradient={[Colors.success, '#10b981']}
              />
            </View>
          )}
        </EliteCard>
      ))}
    </View>
  );

  if (isLoading && petListings.length === 0 && applications.length === 0) {
    return <EliteLoading />;
  }

  if (error) {
    return (
      <EliteContainer>
        <View style={localStyles.flex1Center}>
          <Text style={GlobalStyles.heading2}>⚠️</Text>
          <Text style={GlobalStyles.heading3}>{error}</Text>
          <EliteButton
            title="Retry"
            variant="primary"
            onPress={() => {
              fetchPetListings();
              fetchApplications();
            }}
            style={GlobalStyles.mt4}
          />
        </View>
      </EliteContainer>
    );
  }

  return (
    <EliteContainer>
      <EliteHeader
        title="Adoption Manager"
        rightComponent={
          <TouchableOpacity onPress={() => navigation.navigate('CreateListing')}>
            <Ionicons name="add-circle" size={28} color={Colors.primary} />
          </TouchableOpacity>
        }
      />
      <EliteScrollContainer
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Elite Tab System */}
        <View style={styles.tabContainer}>
          <Animated.View style={tabAnimatedStyle1}>
            <TouchableOpacity
              style={[styles.eliteTab, activeTab === 'listings' && styles.eliteActiveTab]}
              onPress={() => handleTabPress('listings', tabScale1)}
            >
              <Ionicons
                name={activeTab === 'listings' ? 'list-circle' : 'list-circle-outline'}
                size={24}
                color={activeTab === 'listings' ? Colors.primary : Colors.textSecondary}
              />
              <Text style={[styles.eliteTabText, activeTab === 'listings' && styles.eliteActiveTabText]}>
                My Listings ({petListings.length})
              </Text>
            </TouchableOpacity>
          </Animated.View>
          <Animated.View style={tabAnimatedStyle2}>
            <TouchableOpacity
              style={[styles.eliteTab, activeTab === 'applications' && styles.eliteActiveTab]}
              onPress={() => handleTabPress('applications', tabScale2)}
            >
              <Ionicons
                name={activeTab === 'applications' ? 'file-tray-full' : 'file-tray-full-outline'}
                size={24}
                color={activeTab === 'applications' ? Colors.primary : Colors.textSecondary}
              />
              <Text style={[styles.eliteTabText, activeTab === 'applications' && styles.eliteActiveTabText]}>
                Applications ({applications.length})
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {petListings.length === 0 && applications.length === 0 && !isLoading ? (
          activeTab === 'listings' ? (
            <EliteEmptyState
              icon="paw"
              title="No Pet Listings"
              subtitle="You haven't listed any pets for adoption yet. Get started by creating a new listing."
              actionTitle="Create First Listing"
              onAction={() => navigation.navigate('CreateListing')}
            />
          ) : (
            <EliteEmptyState
              icon="file-tray-full"
              title="No Applications Received"
              subtitle="Check back later to see new applications from potential adopters."
            />
          )
        ) : activeTab === 'listings' ? (
          renderEliteListings()
        ) : (
          renderEliteApplications()
        )}
      </EliteScrollContainer>

      {/* Status Update Modal */}
      <Modal visible={showStatusModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={GlobalStyles.heading3}>Update Status for {selectedPet?.name}</Text>
            <View style={styles.statusOptionsContainer}>
              {(['active', 'paused', 'adopted'] as const).map((status) => (
                <EliteButton
                  key={status}
                  title={`${getStatusIcon(status)} ${status.charAt(0).toUpperCase() + status.slice(1)}`}
                  variant={selectedPet?.status === status ? 'primary' : 'secondary'}
                  onPress={() => selectedPet && handleStatusChange(selectedPet, status)}
                  style={localStyles.my2}
                />
              ))}
            </View>
            <EliteButton
              title="Cancel"
              variant="ghost"
              onPress={() => {
                setShowStatusModal(false);
                setSelectedPet(null);
              }}
              style={GlobalStyles.mt4}
            />
          </View>
        </View>
      </Modal>
    </EliteContainer>
  );
};

const localStyles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  flex1Center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  my2: {
    marginVertical: Spacing.md,
  },
  bodyBold: {
    ...GlobalStyles.body,
    fontWeight: 'bold',
  },
});

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.background,
    ...Shadows.md,
    borderRadius: Spacing.xl,
    margin: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  eliteTab: {
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Spacing.lg,
    flex: 1,
  },
  eliteActiveTab: {
    backgroundColor: `${Colors.primary}10`,
  },
  eliteTabText: {
    ...GlobalStyles.body,
    color: Colors.text,
    marginTop: Spacing.xs,
  },
  eliteActiveTabText: {
    ...localStyles.bodyBold,
    color: Colors.primary,
  },
  eliteListingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  eliteStatusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.lg,
  },
  eliteStatusText: {
    ...GlobalStyles.caption,
    fontWeight: 'bold',
  },
  eliteStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  eliteStat: {
    alignItems: 'center',
  },
  eliteStatValue: {
    ...GlobalStyles.heading3,
  },
  eliteStatLabel: {
    ...GlobalStyles.caption,
    color: Colors.textSecondary,
  },
  eliteApplicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  eliteApplicationDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderColor: Colors.border,
  },
  eliteDetailText: {
    ...GlobalStyles.body,
    color: Colors.textSecondary,
    alignItems: 'center',
  },
  eliteActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderRadius: Spacing.lg,
    padding: Spacing.lg,
    width: '90%',
    ...Shadows.lg,
  },
  statusOptionsContainer: {
    marginTop: Spacing.md,
  },
});

export default AdoptionManagerScreen;
