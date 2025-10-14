import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { logger } from '@/services/logger';

interface Post {
  id: string;
  content: string;
  userId: string;
  createdAt: string;
  likes?: number;
}

interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
}

interface FeedUpdate {
  type: 'new_post' | 'like' | 'comment' | 'delete';
  postId?: string;
  post?: Post;
  userId?: string;
  comment?: Comment;
}

interface UseRealtimeFeedOptions {
  onUpdate: (data: FeedUpdate) => void;
  userId?: string;
  autoConnect?: boolean;
}

export const useRealtimeFeed = ({
  onUpdate,
  userId,
  autoConnect = true,
}: UseRealtimeFeedOptions) => {
  const socketRef = useRef<Socket | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    const socket = io(process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3001', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      logger.info('WebSocket connected');
      if (userId) {
        socket.emit('join:feed', userId);
      }
    });

    socket.on('disconnect', () => {
      logger.warn('WebSocket disconnected');
    });

    socket.on('feed:update', (data: FeedUpdate) => {
      onUpdate(data);
    });

    socket.on('connect_error', (error) => {
      logger.error('WebSocket connection error', { error });
    });

    socketRef.current = socket;
  }, [userId, onUpdate]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  const emit = useCallback((event: string, data: unknown) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    connect,
    disconnect,
    emit,
    isConnected: socketRef.current?.connected ?? false,
  };
};

// Convenience hooks for specific actions
export const useFeedActions = (userId?: string) => {
  const options = {
    onUpdate: () => {},
    autoConnect: false as const,
    ...(userId ? { userId } : {}),
  };
  const { emit } = useRealtimeFeed(options);

  return {
    createPost: (post: Post) => emit('post:create', post),
    likePost: (postId: string) => emit('post:like', { postId, userId }),
    commentOnPost: (postId: string, comment: string) =>
      emit('post:comment', { postId, userId, comment }),
    deletePost: (postId: string) => emit('post:delete', { postId, userId }),
  };
};
