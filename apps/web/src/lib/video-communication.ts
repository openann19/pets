/**
 * Video Communication - Production WebRTC Implementation
 * Handles peer-to-peer video calls with Socket.IO signaling
 */

import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
import { logger } from '../services/logger';

const SOCKET_URL = process.env['NEXT_PUBLIC_API_URL']?.replace('/api', '') || 'http://localhost:5000';

export interface VideoCallConfig {
  roomId: string;
  userId: string;
  userName?: string;
  isHost?: boolean;
  videoEnabled?: boolean;
  audioEnabled?: boolean;
  screenSharingEnabled?: boolean;
}

export interface VideoCallState {
  isConnected: boolean;
  isMuted: boolean;
  isVideoEnabled: boolean;
  participants: string[];
}

export interface Participant {
  id: string;
  name: string;
  stream?: MediaStream;
}

/**
 * WebRTC Video Communication Service
 * Manages peer connections, media streams, and signaling
 */
export class VideoCommunication {
  private socket: Socket | null = null;
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private screenStream: MediaStream | null = null;
  private config: VideoCallConfig | null = null;
  private isInitialized = false;

  // ICE servers for STUN/TURN
  private readonly iceServers: RTCIceServer[] = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ];

  /**
   * Initialize video call with configuration
   */
  async initializeCall(config: VideoCallConfig): Promise<MediaStream> {
    this.config = config;

    try {
      // Get user media
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: config.videoEnabled !== false,
        audio: config.audioEnabled !== false,
      });

      // Initialize socket connection
      this.initializeSocket();

      // Create peer connection
      this.createPeerConnection();

      // Join room
      this.socket?.emit('join-room', {
        roomId: config.roomId,
        userId: config.userId,
        userName: config.userName,
      });

      this.isInitialized = true;
      logger.info('Video call initialized', { roomId: config.roomId });

      return this.localStream;
    } catch (error) {
      logger.error('Failed to initialize video call', { error });
      throw new Error('Failed to access camera/microphone. Please check permissions.');
    }
  }

  /**
   * Initialize Socket.IO connection for signaling
   */
  private initializeSocket(): void {
    if (this.socket) return;

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      auth: {
        token: typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null,
      },
    });

    // Handle signaling events
    this.socket?.on('user-joined', this.handleUserJoined.bind(this));
    this.socket?.on('offer', this.handleOffer.bind(this));
    this.socket?.on('answer', this.handleAnswer.bind(this));
    this.socket?.on('ice-candidate', this.handleIceCandidate.bind(this));
    this.socket?.on('user-left', this.handleUserLeft.bind(this));

    this.socket?.on('connect', () => {
      logger.info('Socket connected for video call');
    });

    this.socket?.on('disconnect', () => {
      logger.warn('Socket disconnected');
    });
  }

  /**
   * Create RTCPeerConnection
   */
  private createPeerConnection(): void {
    this.peerConnection = new RTCPeerConnection({
      iceServers: this.iceServers,
    });

    // Add local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        this.peerConnection?.addTrack(track, this.localStream!);
      });
    }

    // Handle remote stream
    this.peerConnection.ontrack = (event: RTCTrackEvent): void => {
      if (!this.remoteStream) {
        this.remoteStream = new MediaStream();
      }
      event.streams[0]?.getTracks().forEach((track) => {
        this.remoteStream?.addTrack(track);
      });
      logger.info('Remote stream received');
    };

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent): void => {
      if (event.candidate && this.socket) {
        this.socket.emit('ice-candidate', {
          roomId: this.config?.roomId,
          candidate: event.candidate,
        });
      }
    };

    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = (): void => {
      logger.info('Connection state changed', {
        state: this.peerConnection?.connectionState,
      });
    };
  }

  /**
   * Handle user joined event
   */
  private async handleUserJoined(data: { userId: string; userName: string }): Promise<void> {
    logger.info('User joined', data);

    // Create and send offer if we're the host
    if (this.config?.isHost && this.peerConnection) {
      try {
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);

        this.socket?.emit('offer', {
          roomId: this.config.roomId,
          offer,
        });
      } catch (error) {
        logger.error('Failed to create offer', { error });
      }
    }
  }

  /**
   * Handle incoming offer
   */
  private async handleOffer(data: { offer: RTCSessionDescriptionInit }): Promise<void> {
    if (!this.peerConnection) return;

    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      this.socket?.emit('answer', {
        roomId: this.config?.roomId,
        answer,
      });

      logger.info('Offer handled, answer sent');
    } catch (error) {
      logger.error('Failed to handle offer', { error });
    }
  }

  /**
   * Handle incoming answer
   */
  private async handleAnswer(data: { answer: RTCSessionDescriptionInit }): Promise<void> {
    if (!this.peerConnection) return;

    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
      logger.info('Answer handled');
    } catch (error) {
      logger.error('Failed to handle answer', { error });
    }
  }

  /**
   * Handle incoming ICE candidate
   */
  private async handleIceCandidate(data: { candidate: RTCIceCandidateInit }): Promise<void> {
    if (!this.peerConnection) return;

    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
      logger.info('ICE candidate added');
    } catch (error) {
      logger.error('Failed to add ICE candidate', { error });
    }
  }

  /**
   * Handle user left event
   */
  private handleUserLeft(data: { userId: string }): void {
    logger.info('User left', data);
    this.remoteStream = null;
  }

  /**
   * Toggle video on/off
   */
  toggleVideo(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((track) => {
        track.enabled = enabled;
      });
      logger.info('Video toggled', { enabled });
    }
  }

  /**
   * Toggle audio on/off
   */
  toggleAudio(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = enabled;
      });
      logger.info('Audio toggled', { enabled });
    }
  }

  /**
   * Start screen sharing
   */
  async startScreenSharing(): Promise<void> {
    try {
      this.screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      // Replace video track with screen track
      const screenTrack = this.screenStream.getVideoTracks()[0];
      const sender = this.peerConnection?.getSenders().find((s) => s.track?.kind === 'video');

      if (sender && screenTrack) {
        await sender.replaceTrack(screenTrack);
      }

      // Handle screen share stop
      if (screenTrack) {
        screenTrack.onended = (): void => {
          this.stopScreenSharing();
        };
      }

      logger.info('Screen sharing started');
    } catch (error) {
      logger.error('Failed to start screen sharing', { error });
      throw new Error('Failed to start screen sharing');
    }
  }

  /**
   * Stop screen sharing
   */
  async stopScreenSharing(): Promise<void> {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach((track) => track.stop());
      this.screenStream = null;

      // Restore camera track
      if (this.localStream) {
        const videoTrack = this.localStream.getVideoTracks()[0];
        const sender = this.peerConnection?.getSenders().find((s) => s.track?.kind === 'video');

        if (sender && videoTrack) {
          await sender.replaceTrack(videoTrack);
        }
      }

      logger.info('Screen sharing stopped');
    }
  }

  /**
   * End the call and cleanup
   */
  endCall(): void {
    // Stop all tracks
    this.localStream?.getTracks().forEach((track) => track.stop());
    this.screenStream?.getTracks().forEach((track) => track.stop());

    // Close peer connection
    this.peerConnection?.close();

    // Leave room
    if (this.socket && this.config) {
      this.socket.emit('leave-room', {
        roomId: this.config.roomId,
        userId: this.config.userId,
      });
    }

    // Disconnect socket
    this.socket?.disconnect();

    // Reset state
    this.localStream = null;
    this.remoteStream = null;
    this.screenStream = null;
    this.peerConnection = null;
    this.socket = null;
    this.isInitialized = false;

    logger.info('Call ended');
  }

  /**
   * Get local stream
   */
  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  /**
   * Get remote stream
   */
  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  /**
   * Check if initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }
}

// Singleton instance
let videoCommInstance: VideoCommunication | null = null;

export const _videoCallService = {
  initializeCall: async (config: VideoCallConfig): Promise<MediaStream> => {
    if (!videoCommInstance) {
      videoCommInstance = new VideoCommunication();
    }
    return videoCommInstance.initializeCall(config);
  },

  endCall: (): void => {
    if (videoCommInstance) {
      videoCommInstance.endCall();
      videoCommInstance = null;
    }
  },

  toggleVideo: (enabled: boolean): void => {
    videoCommInstance?.toggleVideo(enabled);
  },

  toggleAudio: (enabled: boolean): void => {
    videoCommInstance?.toggleAudio(enabled);
  },

  startScreenSharing: async (): Promise<void> => {
    if (!videoCommInstance) {
      throw new Error('Video call not initialized');
    }
    return videoCommInstance.startScreenSharing();
  },

  stopScreenSharing: async (): Promise<void> => {
    if (!videoCommInstance) {
      throw new Error('Video call not initialized');
    }
    return videoCommInstance.stopScreenSharing();
  },

  getLocalStream: (): MediaStream | null => {
    return videoCommInstance?.getLocalStream() || null;
  },

  getRemoteStream: (): MediaStream | null => {
    return videoCommInstance?.getRemoteStream() || null;
  },
};

export default VideoCommunication;
