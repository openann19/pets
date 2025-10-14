/**
 * Offline Support Service for PawfectMatch Mobile
 * Comprehensive offline functionality with data synchronization
 */

import { logger } from '@pawfectmatch/core';
import type { Match, Message, Pet, User } from '@pawfectmatch/core/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { api } from './api';

interface OfflineData {
  pets: Pet[];
  user: User | null;
  matches: Match[];
  messages: Message[];
  lastSync: string;
  pendingActions: PendingAction[];
}

interface PendingAction {
  id: string;
  type: 'swipe' | 'message' | 'profile_update' | 'match_action';
  data: unknown;
  timestamp: string;
  retryCount: number;
}

interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: string | null;
  pendingActionsCount: number;
  syncProgress: number;
}

class OfflineService {
  private isOnline = true;
  private isSyncing = false;
  private syncListeners: ((status: SyncStatus) => void)[] = [];
  private offlineData: OfflineData = {
    pets: [],
    user: null,
    matches: [],
    messages: [],
    lastSync: new Date().toISOString(),
    pendingActions: []
  };

  constructor() {
    this.initializeOfflineService();
  }

  /**
   * Initialize offline service
   */
  private async initializeOfflineService(): Promise<void> {
    try {
      // Load offline data from storage
      await this.loadOfflineData();

      // Set up network monitoring
      this.setupNetworkMonitoring();

      // Start periodic sync
      this.startPeriodicSync();

      logger.info('Offline service initialized successfully');
    } catch (error) {
      logger.error(`Failed to initialize offline service: ${error}`);
    }
  }

  /**
   * Set up network monitoring
   */
  private setupNetworkMonitoring(): void {
    NetInfo.addEventListener((state: NetInfoState) => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected ?? false;

      if (wasOffline && this.isOnline) {
        // Came back online, trigger sync
        this.triggerSync();
      }

      this.notifyListeners();
    });
  }

  /**
   * Start periodic sync when online
   */
  private startPeriodicSync(): void {
    setInterval(() => {
      if (this.isOnline && !this.isSyncing) {
        this.triggerSync();
      }
    }, 30000); // Sync every 30 seconds
  }

  /**
   * Load offline data from storage
   */
  private async loadOfflineData(): Promise<void> {
    try {
      const storedData = await AsyncStorage.getItem('offline_data');
      if (storedData) {
        this.offlineData = JSON.parse(storedData);
      }
    } catch (error) {
      logger.error(`Failed to load offline data: ${error}`);
    }
  }

  /**
   * Save offline data to storage
   */
  private async saveOfflineData(): Promise<void> {
    try {
      await AsyncStorage.setItem('offline_data', JSON.stringify(this.offlineData));
    } catch (error) {
      logger.error(`Failed to save offline data: ${error}`);
    }
  }

  /**
   * Trigger data synchronization
   */
  public async triggerSync(): Promise<void> {
    if (this.isSyncing || !this.isOnline) {
      return;
    }

    this.isSyncing = true;
    this.notifyListeners();

    try {
      // Sync pending actions first
      await this.syncPendingActions();

      // Sync data from server
      await this.syncFromServer();

      // Update last sync time
      this.offlineData.lastSync = new Date().toISOString();
      await this.saveOfflineData();

      logger.info('Sync completed successfully');
    } catch (error) {
      logger.error(`Sync failed: ${error}`);
    } finally {
      this.isSyncing = false;
      this.notifyListeners();
    }
  }

  /**
   * Sync pending actions to server
   */
  private async syncPendingActions(): Promise<void> {
    const actionsToSync = [...this.offlineData.pendingActions];

    for (const action of actionsToSync) {
      try {
        await this.executePendingAction(action);

        // Remove successful action
        this.offlineData.pendingActions = this.offlineData.pendingActions.filter(
          a => a.id !== action.id
        );
      } catch (error) {
        logger.error(`Failed to sync action ${action.id}: ${error}`);

        // Increment retry count
        action.retryCount++;

        // Remove if max retries exceeded
        if (action.retryCount >= 3) {
          this.offlineData.pendingActions = this.offlineData.pendingActions.filter(
            a => a.id !== action.id
          );
        }
      }
    }

    await this.saveOfflineData();
  }

  /**
   * Execute a pending action
   */
  private async executePendingAction(action: PendingAction): Promise<void> {
    const actionData = action.data as Record<string, unknown>;
    switch (action.type) {
      case 'swipe':
        await api.swipePet(String(actionData['petId']), String(actionData['direction']) as 'like' | 'pass' | 'superlike');
        break;
      case 'message':
        await api.sendMessage(String(actionData['matchId']), String(actionData['message']));
        break;
      case 'profile_update':
        await api.updateUserProfile(actionData as Record<string, unknown>);
        break;
      case 'match_action':
        await api.performMatchAction(String(actionData['matchId']), String(actionData['action']));
        break;
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  /**
   * Sync data from server
   */
  private async syncFromServer(): Promise<void> {
    try {
      // Sync user data
      const userData = await api.getCurrentUser();
      if (userData) {
        this.offlineData.user = userData as unknown as User;
      }

      // Sync pets data
      const petsData = await api.getPets();
      if (petsData) {
        this.offlineData.pets = petsData as unknown as Pet[];
      }

      // Sync matches
      const matchesData = await api.getMatches();
      if (matchesData) {
        this.offlineData.matches = matchesData as unknown as Match[];

        // Sync messages for each match
        const allMessages: Message[] = [];
        for (const match of matchesData) {
          const messages = await api.getMessages(match._id);
          allMessages.push(...(messages as unknown as Message[]));
        }
        this.offlineData.messages = allMessages;
      }
    } catch (error) {
      logger.error(`Failed to sync from server: ${error}`);
      throw error;
    }
  }

  /**
   * Add pending action for offline execution
   */
  public addPendingAction(type: PendingAction['type'], data: unknown): void {
    const action: PendingAction = {
      id: `${type}_${Date.now()}_${Math.random()}`,
      type,
      data,
      timestamp: new Date().toISOString(),
      retryCount: 0
    };

    this.offlineData.pendingActions.push(action);
    this.saveOfflineData();
    this.notifyListeners();
  }

  /**
   * Get offline data
   */
  public getOfflineData(): OfflineData {
    return { ...this.offlineData };
  }

  /**
   * Get pets (offline-first)
   */
  public async getPets(): Promise<Pet[]> {
    if (this.isOnline) {
      try {
        const pets = await api.getPets();
        this.offlineData.pets = pets as unknown as Pet[];
        await this.saveOfflineData();
        return pets as unknown as Pet[];
      } catch (error) {
        logger.warn(`Failed to fetch pets online, using offline data: ${error}`);
      }
    }

    return this.offlineData.pets;
  }

  /**
   * Get user (offline-first)
   */
  public async getUser(): Promise<User | null> {
    if (this.isOnline) {
      try {
        const user = await api.getCurrentUser();
        if (user) {
          this.offlineData.user = user as unknown as User;
          await this.saveOfflineData();
        }
        return user as unknown as User | null;
      } catch (error) {
        logger.warn(`Failed to fetch user online, using offline data: ${error}`);
      }
    }

    return this.offlineData.user;
  }

  /**
   * Get matches (offline-first)
   */
  public async getMatches(): Promise<Match[]> {
    if (this.isOnline) {
      try {
        const matches = await api.getMatches();
        this.offlineData.matches = matches as unknown as Match[];
        await this.saveOfflineData();
        return matches as unknown as Match[];
      } catch (error) {
        logger.warn(`Failed to fetch matches online, using offline data: ${error}`);
      }
    }

    return this.offlineData.matches;
  }

  /**
   * Get messages (offline-first)
   */
  public async getMessages(matchId: string): Promise<Message[]> {
    if (this.isOnline) {
      try {
        const messages = await api.getMessages(matchId);
        // This logic is a bit flawed, it replaces all messages with messages from one chat
        // For a real app, we'd merge messages by matchId
        interface MessageWithMatchId extends Message {
          matchId?: string;
        }
        const otherMessages = this.offlineData.messages.filter(m => (m as MessageWithMatchId).matchId !== matchId);
        this.offlineData.messages = [...otherMessages, ...(messages as unknown as Message[])];
        await this.saveOfflineData();
        return messages as unknown as Message[];
      } catch (error) {
        logger.warn(`Failed to fetch messages online, using offline data: ${error}`);
      }
    }

    interface MessageWithMatchId extends Message {
      matchId?: string;
    }
    return this.offlineData.messages.filter(m => (m as MessageWithMatchId).matchId === matchId);
  }

  /**
   * Swipe pet (offline-aware)
   */
  public async swipePet(petId: string, direction: 'like' | 'pass' | 'superlike'): Promise<void> {
    if (this.isOnline) {
      try {
        await api.swipePet(petId, direction);
        return;
      } catch (error) {
        logger.warn(`Failed to swipe online, queuing for offline: ${error}`);
      }
    }

    // Queue for offline execution
    this.addPendingAction('swipe', { petId, direction });
  }

  /**
   * Send message (offline-aware)
   */
  public async sendMessage(matchId: string, message: string): Promise<void> {
    if (this.isOnline) {
      try {
        await api.sendMessage(matchId, message);
        return;
      } catch (error) {
        logger.warn(`Failed to send message online, queuing for offline: ${error}`);
      }
    }

    // Queue for offline execution
    this.addPendingAction('message', { matchId, message });
  }

  /**
   * Update profile (offline-aware)
   */
  public async updateProfile(profileData: Partial<User>): Promise<void> {
    if (this.isOnline) {
      try {
        await api.updateUserProfile(profileData);
        return;
      } catch (error) {
        logger.warn(`Failed to update profile online, queuing for offline: ${error}`);
      }
    }

    // Queue for offline execution
    this.addPendingAction('profile_update', profileData);
  }

  /**
   * Perform match action (offline-aware)
   */
  public async performMatchAction(matchId: string, action: string): Promise<void> {
    if (this.isOnline) {
      try {
        await api.performMatchAction(matchId, action);
        return;
      } catch (error) {
        logger.warn(`Failed to perform match action online, queuing for offline: ${error}`);
      }
    }

    // Queue for offline execution
    this.addPendingAction('match_action', { matchId, action });
  }

  /**
   * Get sync status
   */
  public getSyncStatus(): SyncStatus {
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      lastSyncTime: this.offlineData.lastSync,
      pendingActionsCount: this.offlineData.pendingActions.length,
      syncProgress: this.isSyncing ? 0.5 : 1.0
    };
  }

  /**
   * Add sync status listener
   */
  public addSyncStatusListener(listener: (status: SyncStatus) => void): () => void {
    this.syncListeners.push(listener);

    // Return unsubscribe function
    return () => {
      this.syncListeners = this.syncListeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify sync status listeners
   */
  private notifyListeners(): void {
    const status = this.getSyncStatus();
    this.syncListeners.forEach(listener => { listener(status); });
  }

  /**
   * Clear offline data
   */
  public async clearOfflineData(): Promise<void> {
    try {
      await AsyncStorage.removeItem('offline_data');
      this.offlineData = {
        pets: [],
        user: null,
        matches: [],
        messages: [],
        lastSync: new Date().toISOString(),
        pendingActions: []
      };
      logger.info('Offline data cleared');
    } catch (error) {
      logger.error(`Failed to clear offline data: ${error}`);
    }
  }

  /**
   * Get offline storage size
   */
  public async getStorageSize(): Promise<number> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      let totalSize = 0;

      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }

      return totalSize;
    } catch (error) {
      logger.error(`Failed to get storage size: ${error}`);
      return 0;
    }
  }
}

export const offlineService = new OfflineService();
