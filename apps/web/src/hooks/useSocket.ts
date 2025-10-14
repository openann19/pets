'use client';

import { logger } from '@pawfectmatch/core';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Socket } from 'socket.io-client';
import io from 'socket.io-client';
import { useAuthStore } from '../lib/auth-store';

// Validate and provide fallback for SOCKET_URL
const SOCKET_URL =
  process.env['NEXT_PUBLIC_SOCKET_URL'] && process.env['NEXT_PUBLIC_SOCKET_URL'].length > 0
    ? process.env['NEXT_PUBLIC_SOCKET_URL']
    : 'http://localhost:3001';

// Exponential backoff configuration
const INITIAL_RECONNECT_DELAY = 1000;
const MAX_RECONNECT_DELAY = 30000;
const RECONNECT_DECAY = 1.5;
const MAX_RECONNECT_ATTEMPTS = 10;

interface SocketState {
  isConnected: boolean;
  reconnectAttempts: number;
  lastError: Error | null;
}

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [socketState, setSocketState] = useState<SocketState>({
    isConnected: false,
    reconnectAttempts: 0,
    lastError: null,
  });
  const { user, isAuthenticated } = useAuthStore();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const registerUser = useCallback((socketInstance: Socket, userId: string) => {
    socketInstance.emit('register', { userId });
    logger.info('User registered on socket', { userId });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [socket]);

  const calculateBackoffDelay = useCallback((attemptNumber: number): number => {
    const delay = Math.min(
      INITIAL_RECONNECT_DELAY * Math.pow(RECONNECT_DECAY, attemptNumber),
      MAX_RECONNECT_DELAY,
    );
    return delay + Math.random() * 1000; // Add jitter
  }, []);

  const showReconnectionToast = useCallback((attemptNumber: number, maxAttempts: number) => {
    if (typeof window !== 'undefined' && attemptNumber > 2) {
      // Show toast notification to user
      const message =
        attemptNumber < maxAttempts
          ? `Reconnecting to server... (Attempt ${attemptNumber}/${maxAttempts})`
          : 'Unable to connect to server. Please check your connection.';

      logger.warn('Socket reconnection attempt', { attemptNumber, maxAttempts, message });

      // Dispatch custom event for UI to handle
      window.dispatchEvent(
        new CustomEvent('socket-reconnect-status', {
          detail: { attemptNumber, maxAttempts, message, isError: attemptNumber >= maxAttempts },
        }),
      );
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Create socket connection with auth
      const newSocket = io(SOCKET_URL, {
        auth: {
          token: localStorage.getItem('auth_token'),
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
        reconnectionDelay: INITIAL_RECONNECT_DELAY,
        reconnectionDelayMax: MAX_RECONNECT_DELAY,
        timeout: 20000,
        autoConnect: true,
      });

      // Connection events
      newSocket.on('connect', () => {
        logger.info('Socket connected', { id: newSocket.id, userId: user._id });
        reconnectAttemptsRef.current = 0;

        setSocketState({
          isConnected: true,
          reconnectAttempts: 0,
          lastError: null,
        });

        // Register user on connect
        registerUser(newSocket, user._id);

        // Clear any pending reconnect timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      });

      newSocket.on('disconnect', (reason) => {
        logger.warn('Socket disconnected', { reason, userId: user._id });

        setSocketState((prev) => ({
          ...prev,
          isConnected: false,
        }));
      });

      newSocket.on('connect_error', (error) => {
        logger.error('Socket connection error', { error: error.message, userId: user._id });

        setSocketState((prev) => ({
          ...prev,
          lastError: error,
        }));
      });

      // Reconnection events with exponential backoff
      newSocket.on('reconnect_attempt', (attemptNumber) => {
        reconnectAttemptsRef.current = attemptNumber;

        setSocketState((prev) => ({
          ...prev,
          reconnectAttempts: attemptNumber,
        }));

        const delay = calculateBackoffDelay(attemptNumber);
        logger.info('Socket reconnection attempt', {
          attemptNumber,
          delay: Math.round(delay),
          userId: user._id,
        });

        showReconnectionToast(attemptNumber, MAX_RECONNECT_ATTEMPTS);
      });

      newSocket.on('reconnect', (attemptNumber) => {
        logger.info('Socket reconnected successfully', { attemptNumber, userId: user._id });
        reconnectAttemptsRef.current = 0;

        setSocketState({
          isConnected: true,
          reconnectAttempts: 0,
          lastError: null,
        });

        // Re-register user after reconnection
        registerUser(newSocket, user._id);

        // Notify user of successful reconnection
        if (typeof window !== 'undefined' && attemptNumber > 1) {
          window.dispatchEvent(
            new CustomEvent('socket-reconnect-status', {
              detail: {
                attemptNumber,
                message: 'Successfully reconnected to server',
                isError: false,
                isSuccess: true,
              },
            }),
          );
        }
      });

      newSocket.on('reconnect_error', (error) => {
        logger.error('Socket reconnection error', {
          error: error.message,
          attempts: reconnectAttemptsRef.current,
          userId: user._id,
        });

        setSocketState((prev) => ({
          ...prev,
          lastError: error,
        }));
      });

      newSocket.on('reconnect_failed', () => {
        logger.error('Socket reconnection failed - max attempts reached', {
          maxAttempts: MAX_RECONNECT_ATTEMPTS,
          userId: user._id,
        });

        setSocketState((prev) => ({
          ...prev,
          isConnected: false,
        }));

        // Notify user that reconnection has failed
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('socket-reconnect-status', {
              detail: {
                message: 'Connection lost. Please refresh the page.',
                isError: true,
                isFatal: true,
              },
            }),
          );
        }
      });

      setSocket(newSocket);

      // Cleanup on unmount
      return () => {
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }

        // Remove all event listeners to prevent memory leaks
        newSocket.off('connect');
        newSocket.off('disconnect');
        newSocket.off('connect_error');
        newSocket.off('reconnect_attempt');
        newSocket.off('reconnect');
        newSocket.off('reconnect_error');
        newSocket.off('reconnect_failed');

        newSocket.close();
      };
    } else {
      // Close socket if user logs out
      if (socket) {
        socket.close();
        setSocket(null);
      }
      return undefined;
    }
  }, [isAuthenticated, user, registerUser, calculateBackoffDelay, showReconnectionToast, socket]);

  return { socket, ...socketState };
}
