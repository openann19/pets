/**
 * WebSocket Service for Real-time Features
 * Handles chat, notifications, and live updates
 */

import { io, Socket } from 'socket.io-client';
import { MessageAttachment, SocketMessageData, SocketNotificationData, SocketUserStatusData, SocketCallData, SocketMatchData, SocketError, SocketTypingData } from '@/types';

interface SocketServiceConfig {
  url: string;
  token?: string;
  autoConnect?: boolean;
}


class SocketService {
  private socket: Socket | null = null;
  private config: SocketServiceConfig;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnected = false;
  private eventHandlers: Map<string, Function[]> = new Map();

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
      this.emitEvent('connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.isConnected = false;
      this.emitEvent('disconnected', reason);
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try to reconnect
        this.handleReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.emitEvent('error', error);
      this.handleReconnect();
    });

    // Chat events
    this.socket.on('message', (data: SocketMessageData) => {
      this.emitEvent('message', data);
    });

    this.socket.on('message_sent', (data: SocketMessageData) => {
      this.emitEvent('message_sent', data);
    });

    this.socket.on('typing_start', (data: { matchId: string; userId: string }) => {
      this.emitEvent('typing_start', data);
    });

    this.socket.on('typing_stop', (data: { matchId: string; userId: string }) => {
      this.emitEvent('typing_stop', data);
    });

    // Match events
    this.socket.on('new_match', (data: SocketMatchData) => {
      this.emitEvent('new_match', data);
    });

    this.socket.on('match_updated', (data: SocketMatchData) => {
      this.emitEvent('match_updated', data);
    });

    // User status events
    this.socket.on('user_status', (data: SocketUserStatusData) => {
      this.emitEvent('user_status', data);
    });

    // Notification events
    this.socket.on('notification', (data: SocketNotificationData) => {
      this.emitEvent('notification', data);
    });

    // Call events
    this.socket.on('call_incoming', (data: SocketCallData) => {
      this.emitEvent('call_incoming', data);
    });

    this.socket.on('call_accepted', (data: SocketCallData) => {
      this.emitEvent('call_accepted', data);
    });

    this.socket.on('call_rejected', (data: SocketCallData) => {
      this.emitEvent('call_rejected', data);
    });

    this.socket.on('call_ended', (data: SocketCallData) => {
      this.emitEvent('call_ended', data);
    });

    // Error handling
    this.socket.on('error', (error: SocketError) => {
      console.error('WebSocket error:', error);
      this.emitEvent('error', error);
    });
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emitEvent('reconnect_failed');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  // Event methods
  on(event: string, callback: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(callback);
  }

  off(event: string, callback?: Function): void {
    if (!callback) {
      this.eventHandlers.delete(event);
      return;
    }
    
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(callback);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  emit(event: string, ...args: any[]): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(...args));
    }
  }

  // Public emit for socket.io
  emitSocket(event: string, data?: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  private emitEvent(event: string, data?: unknown): void {
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
