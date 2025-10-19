import api from '../services/api';
import { io, Socket } from 'socket.io-client';

// WebSocket connection management
class WebSocketManager {
  private socket: Socket | null = null;
  private userId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;
  private isConnecting = false;

  connect(userId: string, token: string): Promise<Socket> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting) {
        reject(new Error('Connection already in progress'));
        return;
      }

      if (this.socket?.connected && this.userId === userId) {
        resolve(this.socket);
        return;
      }

      this.isConnecting = true;
      this.userId = userId;

      // Clean up existing connection
      if (this.socket) {
        this.socket.disconnect();
      }

      const socketUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001';
      
      console.log('[WebSocket] Connecting to:', socketUrl);

      this.socket = io(socketUrl, {
        auth: {
          token: token,
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: this.reconnectDelay,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: this.maxReconnectAttempts,
        timeout: 20000,
        upgrade: true,
        rememberUpgrade: true,
      });

      const socket = this.socket;

      // Connection success handler
      socket.on('connect', () => {
        console.log('[WebSocket] Connected successfully', { id: socket.id, userId });
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        
        // Join user's personal room for notifications
        socket.emit('join_user_room', { userId });
        
        resolve(socket);
      });

      // Connection error handler
      socket.on('connect_error', (error) => {
        console.error('[WebSocket] Connection error:', error);
        this.isConnecting = false;
        this.reconnectAttempts++;
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          reject(new Error(`Failed to connect after ${this.maxReconnectAttempts} attempts`));
        }
      });

      // Disconnect handler
      socket.on('disconnect', (reason) => {
        console.log('[WebSocket] Disconnected:', reason);
        this.isConnecting = false;
      });

      // Error handler
      socket.on('error', (error) => {
        console.error('[WebSocket] Socket error:', error);
      });

      // Set up common event listeners
      this.setupEventListeners(socket);
    });
  }

  private setupEventListeners(socket: Socket) {
    // Handle new messages
    socket.on('new_message', (data) => {
      console.log('[WebSocket] New message received:', data);
      // Dispatch custom event for components to listen to
      window.dispatchEvent(new CustomEvent('websocket:new_message', { detail: data }));
    });

    // Handle user online/offline status
    socket.on('user_online', (data) => {
      console.log('[WebSocket] User online:', data);
      window.dispatchEvent(new CustomEvent('websocket:user_online', { detail: data }));
    });

    socket.on('user_offline', (data) => {
      console.log('[WebSocket] User offline:', data);
      window.dispatchEvent(new CustomEvent('websocket:user_offline', { detail: data }));
    });

    // Handle typing indicators
    socket.on('user_typing', (data) => {
      console.log('[WebSocket] User typing:', data);
      window.dispatchEvent(new CustomEvent('websocket:user_typing', { detail: data }));
    });

    // Handle notifications
    socket.on('notification', (data) => {
      console.log('[WebSocket] Notification received:', data);
      window.dispatchEvent(new CustomEvent('websocket:notification', { detail: data }));
    });

    // Handle match events
    socket.on('new_match', (data) => {
      console.log('[WebSocket] New match:', data);
      window.dispatchEvent(new CustomEvent('websocket:new_match', { detail: data }));
    });

    // Handle message read receipts
    socket.on('messages_read', (data) => {
      console.log('[WebSocket] Messages read:', data);
      window.dispatchEvent(new CustomEvent('websocket:messages_read', { detail: data }));
    });
  }

  disconnect(): void {
    if (this.socket) {
      console.log('[WebSocket] Disconnecting...');
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
      this.isConnecting = false;
      this.reconnectAttempts = 0;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  // Join a match room for real-time chat
  joinMatch(matchId: string): void {
    if (this.socket?.connected) {
      console.log('[WebSocket] Joining match room:', matchId);
      this.socket.emit('join_match', matchId);
    }
  }

  // Leave a match room
  leaveMatch(matchId: string): void {
    if (this.socket?.connected) {
      console.log('[WebSocket] Leaving match room:', matchId);
      this.socket.emit('leave_match', matchId);
    }
  }

  // Send a message in a match
  sendMessage(matchId: string, content: string, messageType: string = 'text', attachments: unknown[] = []): void {
    if (this.socket?.connected) {
      console.log('[WebSocket] Sending message to match:', matchId);
      this.socket.emit('send_message', {
        matchId,
        content,
        messageType,
        attachments
      });
    }
  }

  // Send typing indicator
  sendTyping(matchId: string, isTyping: boolean): void {
    if (this.socket?.connected) {
      this.socket.emit('typing', { matchId, isTyping });
    }
  }

  // Mark messages as read
  markMessagesRead(matchId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('mark_messages_read', { matchId });
    }
  }

  // Perform match actions (archive, block, etc.)
  performMatchAction(matchId: string, action: string): void {
    if (this.socket?.connected) {
      this.socket.emit('match_action', { matchId, action });
    }
  }
}

// Create singleton instance
const webSocketManager = new WebSocketManager();

// Enhanced API client with real WebSocket implementation
const apiClient = {
  ...api,
  
  // Real WebSocket connection methods
  connectWebSocket: async (userId: string): Promise<Socket | null> => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      return await webSocketManager.connect(userId, token);
    } catch (error) {
      console.error('[WebSocket] Failed to connect:', error);
      return null;
    }
  },

  disconnectWebSocket: (): void => {
    webSocketManager.disconnect();
  },

  // WebSocket utility methods
  isWebSocketConnected: (): boolean => {
    return webSocketManager.isConnected();
  },

  joinMatchRoom: (matchId: string): void => {
    webSocketManager.joinMatch(matchId);
  },

  leaveMatchRoom: (matchId: string): void => {
    webSocketManager.leaveMatch(matchId);
  },

  sendChatMessage: (matchId: string, content: string, messageType: string = 'text', attachments: unknown[] = []): void => {
    webSocketManager.sendMessage(matchId, content, messageType, attachments);
  },

  sendTypingIndicator: (matchId: string, isTyping: boolean): void => {
    webSocketManager.sendTyping(matchId, isTyping);
  },

  markMessagesAsRead: (matchId: string): void => {
    webSocketManager.markMessagesRead(matchId);
  },

  performMatchAction: (matchId: string, action: string): void => {
    webSocketManager.performMatchAction(matchId, action);
  },

  // Event listener helpers
  onWebSocketEvent: (eventName: string, callback: (data: unknown) => void): () => void => {
    const handler = (event: CustomEvent) => callback(event.detail);
    window.addEventListener(`websocket:${eventName}`, handler as EventListener);
    
    // Return cleanup function
    return () => {
      window.removeEventListener(`websocket:${eventName}`, handler as EventListener);
    };
  },
};

export default apiClient;
