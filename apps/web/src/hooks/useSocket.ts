/**
 * WebSocket Hook for Real-time Features
 * Provides socket connection management and event handling
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { createSocketService, getSocketService } from '@/services/socket';
import { useAuth } from '@/components/providers/AuthProvider';
import { SocketEventHandlers, SocketError, SocketMessageData, SocketMatchData, SocketUserStatusData, SocketNotificationData, SocketCallData, SocketTypingData, MessageAttachment } from '@/types';

interface UseSocketOptions {
  autoConnect?: boolean;
  reconnectOnAuth?: boolean;
}


export const useSocket = (
  options: UseSocketOptions = {},
  eventHandlers: SocketEventHandlers = {}
) => {
  const { user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const socketRef = useRef<ReturnType<typeof createSocketService> | null>(null);
  const handlersRef = useRef<SocketEventHandlers>(eventHandlers);

  const {
    autoConnect = true,
    reconnectOnAuth = true,
  } = options;

  // Update handlers when they change
  useEffect(() => {
    handlersRef.current = eventHandlers;
  }, [eventHandlers]);

  // Initialize socket service
  useEffect(() => {
    if (autoConnect && isAuthenticated && user?.id) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001';
      
      socketRef.current = createSocketService({
        url: apiUrl,
        token: localStorage.getItem('accessToken') || localStorage.getItem('auth_token') || undefined,
        autoConnect: true,
      });

      // Set up event listeners
      const socket = socketRef.current;
      
      socket.on('connected', () => {
        setIsConnected(true);
        setConnectionError(null);
        handlersRef.current.onConnect?.();
      });

      socket.on('disconnected', (reason: string) => {
        setIsConnected(false);
        handlersRef.current.onDisconnect?.(reason);
      });

      socket.on('error', (error: SocketError) => {
        setConnectionError(error.message || 'Connection error');
        handlersRef.current.onError?.(error);
      });

      socket.on('message', (data: SocketMessageData) => {
        handlersRef.current.onMessage?.(data);
      });

      socket.on('new_match', (data: SocketMatchData) => {
        handlersRef.current.onNewMatch?.(data);
      });

      socket.on('user_status', (data: SocketUserStatusData) => {
        handlersRef.current.onUserStatus?.(data);
      });

      socket.on('notification', (data: SocketNotificationData) => {
        handlersRef.current.onNotification?.(data);
      });

      socket.on('call_incoming', (data: SocketCallData) => {
        handlersRef.current.onCallIncoming?.(data);
      });

      socket.on('call_accepted', (data: SocketCallData) => {
        handlersRef.current.onCallAccepted?.(data);
      });

      socket.on('call_rejected', (data: SocketCallData) => {
        handlersRef.current.onCallRejected?.(data);
      });

      socket.on('call_ended', (data: SocketCallData) => {
        handlersRef.current.onCallEnded?.(data);
      });

      socket.on('typing_start', (data: SocketTypingData) => {
        handlersRef.current.onTypingStart?.(data);
      });

      socket.on('typing_stop', (data: SocketTypingData) => {
        handlersRef.current.onTypingStop?.(data);
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.destroy();
        socketRef.current = null;
      }
    };
  }, [autoConnect, isAuthenticated, user?.id]);

  // Reconnect when authentication changes
  useEffect(() => {
    if (reconnectOnAuth && socketRef.current && isAuthenticated && user?.id) {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('auth_token') || undefined;
      if (token) {
        socketRef.current.updateToken(token);
      }
    }
  }, [reconnectOnAuth, isAuthenticated, user?.id]);

  // Socket methods
  const connect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.connect();
    }
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  }, []);

  const joinMatch = useCallback((matchId: string) => {
    if (socketRef.current) {
      socketRef.current.joinMatch(matchId);
    }
  }, []);

  const leaveMatch = useCallback((matchId: string) => {
    if (socketRef.current) {
      socketRef.current.leaveMatch(matchId);
    }
  }, []);

  const sendMessage = useCallback((matchId: string, content: string, attachments?: MessageAttachment[]) => {
    if (socketRef.current) {
      socketRef.current.sendMessage(matchId, content, attachments);
    }
  }, []);

  const startTyping = useCallback((matchId: string) => {
    if (socketRef.current) {
      socketRef.current.startTyping(matchId);
    }
  }, []);

  const stopTyping = useCallback((matchId: string) => {
    if (socketRef.current) {
      socketRef.current.stopTyping(matchId);
    }
  }, []);

  const swipePet = useCallback((petId: string, action: 'like' | 'pass' | 'superlike') => {
    if (socketRef.current) {
      socketRef.current.swipePet(petId, action);
    }
  }, []);

  const initiateCall = useCallback((matchId: string, type: 'audio' | 'video') => {
    if (socketRef.current) {
      socketRef.current.initiateCall(matchId, type);
    }
  }, []);

  const acceptCall = useCallback((callId: string) => {
    if (socketRef.current) {
      socketRef.current.acceptCall(callId);
    }
  }, []);

  const rejectCall = useCallback((callId: string) => {
    if (socketRef.current) {
      socketRef.current.rejectCall(callId);
    }
  }, []);

  const endCall = useCallback((callId: string) => {
    if (socketRef.current) {
      socketRef.current.endCall(callId);
    }
  }, []);

  const updateStatus = useCallback((status: 'online' | 'offline' | 'away') => {
    if (socketRef.current) {
      socketRef.current.updateStatus(status);
    }
  }, []);

  return {
    // Connection state
    isConnected,
    connectionError,
    socketId: socketRef.current?.getSocketId(),
    
    // Connection methods
    connect,
    disconnect,
    
    // Chat methods
    joinMatch,
    leaveMatch,
    sendMessage,
    startTyping,
    stopTyping,
    
    // Match methods
    swipePet,
    
    // Call methods
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    
    // Status methods
    updateStatus,
    
    // Raw socket access (for advanced usage)
    socket: socketRef.current,
    
    // Event methods
    on: socketRef.current?.on?.bind(socketRef.current),
    off: socketRef.current?.off?.bind(socketRef.current),
  };
};

export default useSocket;