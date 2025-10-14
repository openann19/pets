import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '@pawfectmatch/core';

interface NotificationCounts {
  matches: number;
  messages: number;
  nearby: number;
  updates: number;
  adoption: number;
}

interface NotificationContextType {
  counts: NotificationCounts;
  updateCount: (type: keyof NotificationCounts, count: number) => void;
  incrementCount: (type: keyof NotificationCounts) => void;
  decrementCount: (type: keyof NotificationCounts) => void;
  clearCount: (type: keyof NotificationCounts) => void;
  clearAllCounts: () => void;
  getTotalCount: () => number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [counts, setCounts] = useState<NotificationCounts>({
    matches: 0,
    messages: 0,
    nearby: 0,
    updates: 0,
    adoption: 0,
  });

  // Load counts from storage on mount
  useEffect(() => {
    loadCounts();
  }, []);

  // Save counts to storage whenever they change
  useEffect(() => {
    saveCounts();
  }, [counts]);

  const loadCounts = async () => {
    try {
      const storedCounts = await AsyncStorage.getItem('notification_counts');
      if (storedCounts) {
        const parsedCounts = JSON.parse(storedCounts);
        setCounts(parsedCounts);
      }
    } catch (error) {
      logger.error('Error loading notification counts:', { error });
    }
  };

  const saveCounts = async () => {
    try {
      await AsyncStorage.setItem('notification_counts', JSON.stringify(counts));
    } catch (error) {
      logger.error('Error saving notification counts:', { error });
    }
  };

  const updateCount = (type: keyof NotificationCounts, count: number): void => {
    setCounts(prev => ({
      ...prev,
      [type]: Math.max(0, count), // Ensure count is never negative
    }));
  };

  const incrementCount = (type: keyof NotificationCounts): void => {
    setCounts(prev => ({
      ...prev,
      [type]: prev[type] + 1,
    }));
  };

  const decrementCount = (type: keyof NotificationCounts): void => {
    setCounts(prev => ({
      ...prev,
      [type]: Math.max(0, prev[type] - 1),
    }));
  };

  const clearCount = (type: keyof NotificationCounts): void => {
    setCounts(prev => ({
      ...prev,
      [type]: 0,
    }));
  };

  const clearAllCounts = (): void => {
    setCounts({
      matches: 0,
      messages: 0,
      nearby: 0,
      updates: 0,
      adoption: 0,
    });
  };

  const getTotalCount = (): number => Object.values(counts).reduce((total, count) => total + count, 0);

  const value: NotificationContextType = {
    counts,
    updateCount,
    incrementCount,
    decrementCount,
    clearCount,
    clearAllCounts,
    getTotalCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;
