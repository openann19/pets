'use client';

import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuthStore } from '../stores/auth-store';
import { logger } from '../services/logger';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Create socket connection with auth
      const newSocket = io(SOCKET_URL, {
        auth: {
          token: localStorage.getItem('auth_token')
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      // Connection events
      newSocket.on('connect', () => {
        logger.info('Socket connected', { id: newSocket.id });
        
        // Register user
        newSocket.emit('register', { userId: user.id });
      });

      newSocket.on('disconnect', (reason) => {
        logger.warn('Socket disconnected', { reason });
      });

      newSocket.on('error', (error) => {
        logger.error('Socket error', error);
      });

      // Reconnection events
      newSocket.on('reconnect', (attemptNumber) => {
        logger.info('Socket reconnected', { attemptNumber });
      });

      newSocket.on('reconnect_error', (error) => {
        logger.error('Socket reconnection error', error);
      });

      setSocket(newSocket);

      // Cleanup on unmount
      return () => {
        newSocket.close();
      };
    } else {
      // Close socket if user logs out
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [isAuthenticated, user?.id]);

  return socket;
}
