/**
 * WebSocket Service for Real-time Features
 * Handles chat, notifications, and live updates
 */

import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';

import type { MessageAttachment, SocketNotificationData, SocketUserStatusData, SocketCallData, SocketMatchData, SocketError} from '@/types';
import { SocketMessageData, SocketTypingData } from '@/types';

interface SocketServiceConfig {
  url: string;
  token?: string;
  autoConnect?: boolean;
}


class SocketService {
  private socket: Socket | null = null;
  private readonly config: SocketServiceConfig;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectDelay = 1000;
  private isConnected = false;
  private readonly eventHandlers: Map<string, Function[]> = new Map();

  constructor(config: SocketServiceConfig) {
    this.config = {
      autoConnect: true,
      ...config,
    };

    if (this.config.autoConnect) {
      this.connect();
    }
  }

  connect(): void {
    if (this.socket?.connected) {
      return;
    }

    try {
      this.socket = io(this.config.url, {
        auth: {
          token: this.config.token,
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true,
      });

      this.setupEventListeners();
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      this.handleReconnect();
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.isConnected = false;
      this.emit('disconnected', reason);
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try to reconnect
        this.handleReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.emit('error', error);
      this.handleReconnect();
    });

    // Chat events
    this.socket.on('message', (data: MessageData) => {
      this.emit('message', data);
    });

    this.socket.on('message_sent', (data: MessageData) => {
      this.emit('message_sent', data);
    });

    this.socket.on('typing_start', (data: { matchId: string; userId: string }) => {
      this.emit('typing_start', data);
    });

    this.socket.on('typing_stop', (data: { matchId: string; userId: string }) => {
      this.emit('typing_stop', data);
    });

    // Match events
    this.socket.on('new_match', (data: SocketMatchData) => {
      this.emit('new_match', data);
    });

    this.socket.on('match_updated', (data: SocketMatchData) => {
      this.emit('match_updated', data);
    });

    // User status events
    this.socket.on('user_status', (data: SocketUserStatusData) => {
      this.emit('user_status', data);
    });

    // Notification events
    this.socket.on('notification', (data: SocketNotificationData) => {
      this.emit('notification', data);
    });

    // Call events
    this.socket.on('call_incoming', (data: SocketCallData) => {
      this.emit('call_incoming', data);
    });

    this.socket.on('call_accepted', (data: SocketCallData) => {
      this.emit('call_accepted', data);
    });

    this.socket.on('call_rejected', (data: SocketCallData) => {
      this.emit('call_rejected', data);
    });

    this.socket.on('call_ended', (data: SocketCallData) => {
      this.emit('call_ended', data);
    });

    // Error handling
    this.socket.on('error', (error: SocketError) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    });
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('reconnect_failed');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  // Event handling
  on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  off(event: string, handler?: Function): void {
    if (!this.eventHandlers.has(event)) return;
    
    if (handler) {
      const handlers = this.eventHandlers.get(event)!;
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    } else {
      this.eventHandlers.delete(event);
    }
  }

  private emit(event: string, data?: unknown): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  // Chat methods
  joinMatch(matchId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('join_match', matchId);
    }
  }

  leaveMatch(matchId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('leave_match', matchId);
    }
  }

  sendMessage(matchId: string, content: string, attachments?: MessageAttachment[]): void {
    if (this.socket?.connected) {
      this.socket.emit('send_message', {
        matchId,
        content,
        messageType: 'text',
        attachments: attachments || []
      });
    }
  }

  startTyping(matchId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('typing', { matchId, isTyping: true });
    }
  }

  stopTyping(matchId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('typing', { matchId, isTyping: false });
    }
  }

  // Match methods
  swipePet(petId: string, action: 'like' | 'pass' | 'superlike'): void {
    if (this.socket?.connected) {
      this.socket.emit('swipe', { petId, action });
    }
  }

  // Call methods
  initiateCall(matchId: string, type: 'audio' | 'video'): void {
    if (this.socket?.connected) {
      this.socket.emit('call_initiate', { matchId, type });
    }
  }

  acceptCall(callId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('call_accept', { callId });
    }
  }

  rejectCall(callId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('call_reject', { callId });
    }
  }

  endCall(callId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('call_end', { callId });
    }
  }

  // Status methods
  updateStatus(status: 'online' | 'offline' | 'away'): void {
    if (this.socket?.connected) {
      this.socket.emit('status_update', { status });
    }
  }

  // Utility methods
  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  getSocketId(): string | undefined {
    return this.socket?.id;
  }

  updateToken(token: string): void {
    this.config.token = token;
    if (this.socket?.connected) {
      this.socket.auth = { token };
    }
  }

  // Cleanup
  destroy(): void {
    this.disconnect();
    this.eventHandlers.clear();
  }
}

// Create singleton instance
let socketServiceInstance: SocketService | null = null;

export const createSocketService = (config: SocketServiceConfig): SocketService => {
  if (socketServiceInstance) {
    socketServiceInstance.destroy();
  }
  socketServiceInstance = new SocketService(config);
  return socketServiceInstance;
};

export const getSocketService = (): SocketService | null => {
  return socketServiceInstance;
};

export default SocketService;
