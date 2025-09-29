import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@pawfectmatch/core';

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  error: string | null;
}

export const useSocket = (): Socket | null => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, accessToken } = useAuthStore();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    if (!user || !accessToken) {
      return;
    }

    const connectSocket = () => {
      try {
        const newSocket = io(process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
          auth: {
            token: accessToken,
            userId: user._id,
          },
          transports: ['websocket'],
          timeout: 10000,
          reconnection: true,
          reconnectionAttempts: maxReconnectAttempts,
          reconnectionDelay: 1000,
        });

        newSocket.on('connect', () => {
          console.log('Socket connected:', newSocket.id);
          setIsConnected(true);
          setError(null);
          reconnectAttempts.current = 0;
        });

        newSocket.on('disconnect', (reason) => {
          console.log('Socket disconnected:', reason);
          setIsConnected(false);
          
          if (reason === 'io server disconnect') {
            // Server disconnected, try to reconnect
            newSocket.connect();
          }
        });

        newSocket.on('connect_error', (err) => {
          console.error('Socket connection error:', err);
          setError(err.message);
          reconnectAttempts.current++;
          
          if (reconnectAttempts.current >= maxReconnectAttempts) {
            setError('Failed to connect after multiple attempts');
          }
        });

        newSocket.on('error', (err) => {
          console.error('Socket error:', err);
          setError(err.message || 'Socket error occurred');
        });

        // Authentication error
        newSocket.on('auth_error', (err) => {
          console.error('Socket auth error:', err);
          setError('Authentication failed');
          newSocket.disconnect();
        });

        // User-specific events
        newSocket.on('user_online', (data) => {
          console.log('User came online:', data);
        });

        newSocket.on('user_offline', (data) => {
          console.log('User went offline:', data);
        });

        // Match events
        newSocket.on('new_match', (data) => {
          console.log('New match:', data);
          // Handle new match notification
        });

        newSocket.on('new_message', (data) => {
          console.log('New message:', data);
          // Handle new message notification
        });

        // Call events (handled by WebRTC service)
        newSocket.on('incoming_call', (data) => {
          console.log('Incoming call:', data);
        });

        setSocket(newSocket);

        return newSocket;
      } catch (err) {
        console.error('Error creating socket:', err);
        setError('Failed to create socket connection');
        return null;
      }
    };

    const socketInstance = connectSocket();

    return () => {
      if (socketInstance) {
        console.log('Cleaning up socket connection');
        socketInstance.removeAllListeners();
        socketInstance.disconnect();
      }
      setSocket(null);
      setIsConnected(false);
      setError(null);
    };
  }, [user, accessToken]);

  return socket;
};

// Hook for socket with connection status
export const useSocketWithStatus = (): UseSocketReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, accessToken } = useAuthStore();

  useEffect(() => {
    if (!user || !accessToken) {
      return;
    }

    const newSocket = io(process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      auth: {
        token: accessToken,
        userId: user._id,
      },
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      setError(null);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      setError(err.message);
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.removeAllListeners();
      newSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
      setError(null);
    };
  }, [user, accessToken]);

  return { socket, isConnected, error };
};

// Emit helper
export const useSocketEmit = () => {
  const socket = useSocket();

  const emit = (event: string, data?: any) => {
    if (socket && socket.connected) {
      socket.emit(event, data);
      return true;
    }
    console.warn('Socket not connected, cannot emit:', event);
    return false;
  };

  return emit;
};

export default useSocket;
