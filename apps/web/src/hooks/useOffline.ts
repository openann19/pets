/**
 * Offline Hook
 * React hook for managing offline state and operations
 */

import { logger } from '@pawfectmatch/core';
import { useCallback, useEffect, useState } from 'react';
import type { OfflineAction } from '../services/OfflineService';
import OfflineService from '../services/OfflineService';
type EventData = { type: string; data: unknown; };

export interface OfflineState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSync: number;
  pendingActions: number;
  failedActions: number;
  syncProgress: number;
}

export interface OfflineActions {
  cacheData: (key: string, data: EventData, expiresIn?: number) => Promise<void>;
  getCachedData: (key: string) => Promise<EventData | null>;
  removeCachedData: (key: string) => Promise<void>;
  clearCache: () => Promise<void>;
  queueAction: (action: Omit<OfflineAction, 'id' | 'timestamp' | 'retries'>) => Promise<string>;
  removeAction: (id: string) => Promise<void>;
  sync: () => Promise<void>;
  getPendingActions: () => OfflineAction[];
  getFailedActions: () => OfflineAction[];
  refreshStatus: () => void;
}

export const useOffline = (): OfflineState & OfflineActions => {
  const [state, setState] = useState<OfflineState>({
    isOnline: navigator.onLine,
    isSyncing: false,
    lastSync: 0,
    pendingActions: 0,
    failedActions: 0,
    syncProgress: 1,
  });

  // Update status from service - defined early to use in initialization
  const updateStatus = useCallback(() => {
    const status = OfflineService.getSyncStatus();
    setState((prev) => ({
      ...prev,
      isOnline: status.isOnline,
      isSyncing: status.isSyncing,
      lastSync: status.lastSync,
      pendingActions: status.pendingActions,
      failedActions: status.failedActions,
      syncProgress: status.syncProgress,
    }));
  }, []);

  // Initialize offline service
  useEffect(() => {
    const initializeOffline = async () => {
      try {
        await OfflineService.initialize();
        updateStatus();
      } catch (error) {
        logger.error('Failed to initialize offline service:', { error });
      }
    };

    initializeOffline();
  }, [updateStatus]);

  // Setup event listeners
  useEffect(() => {
    const handleOnline = () => {
      setState((prev) => ({ ...prev, isOnline: true }));
    };

    const handleOffline = () => {
      setState((prev) => ({ ...prev, isOnline: false }));
    };

    const handleSyncStarted = () => {
      setState((prev) => ({ ...prev, isSyncing: true }));
    };

    const handleSyncCompleted = () => {
      setState((prev) => ({
        ...prev,
        isSyncing: false,
        lastSync: Date.now(),
      }));
      updateStatus();
    };

    const handleSyncFailed = () => {
      setState((prev) => ({ ...prev, isSyncing: false }));
    };

    const handleActionQueued = () => {
      updateStatus();
    };

    const handleActionRemoved = () => {
      updateStatus();
    };

    // Add event listeners
    OfflineService.on('online', handleOnline);
    OfflineService.on('offline', handleOffline);
    OfflineService.on('syncStarted', handleSyncStarted);
    OfflineService.on('syncCompleted', handleSyncCompleted);
    OfflineService.on('syncFailed', handleSyncFailed);
    OfflineService.on('actionQueued', handleActionQueued);
    OfflineService.on('actionRemoved', handleActionRemoved);

    // Cleanup
    return () => {
      OfflineService.off('online', handleOnline);
      OfflineService.off('offline', handleOffline);
      OfflineService.off('syncStarted', handleSyncStarted);
      OfflineService.off('syncCompleted', handleSyncCompleted);
      OfflineService.off('syncFailed', handleSyncFailed);
      OfflineService.off('actionQueued', handleActionQueued);
      OfflineService.off('actionRemoved', handleActionRemoved);
    };
  }, []);

  // Cache data
  const cacheData = useCallback(
    async (key: string, data: Record<string, unknown>, expiresIn?: number): Promise<void> => {
      await OfflineService.cacheData(key, data, expiresIn);
    },
    [],
  );

  // Get cached data
  const getCachedData = useCallback(async (key: string): Promise<any | null> => await OfflineService.getCachedData(key), []);

  // Remove cached data
  const removeCachedData = useCallback(async (key: string): Promise<void> => {
    await OfflineService.removeCachedData(key);
  }, []);

  // Clear cache
  const clearCache = useCallback(async (): Promise<void> => {
    await OfflineService.clearCache();
  }, []);

  // Queue action
  const queueAction = useCallback(
    async (action: Omit<OfflineAction, 'id' | 'timestamp' | 'retries'>): Promise<string> => await OfflineService.queueAction(action),
    [],
  );

  // Remove action
  const removeAction = useCallback(async (id: string): Promise<void> => {
    await OfflineService.removeAction(id);
  }, []);

  // Sync
  const sync = useCallback(async (): Promise<void> => {
    await OfflineService.sync();
  }, []);

  // Get pending actions
  const getPendingActions = useCallback((): OfflineAction[] => OfflineService.getPendingActions(), []);

  // Get failed actions
  const getFailedActions = useCallback((): OfflineAction[] => OfflineService.getFailedActions(), []);

  // Refresh status
  const refreshStatus = useCallback(() => {
    updateStatus();
  }, [updateStatus]);

  return {
    ...state,
    cacheData,
    getCachedData,
    removeCachedData,
    clearCache,
    queueAction,
    removeAction,
    sync,
    getPendingActions,
    getFailedActions,
    refreshStatus,
  };
};
