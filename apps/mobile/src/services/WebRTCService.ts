import { EventEmitter } from 'events';

import InCallManager from 'react-native-incall-manager';
import type {
  MediaStream
} from 'react-native-webrtc';
import {
  RTCPeerConnection,
  RTCIceCandidate as RTCIceCandidateImpl,
  RTCSessionDescription as RTCSessionDescriptionImpl,
  mediaDevices
} from 'react-native-webrtc';


export interface CallData {
  callId: string;
  matchId: string;
  callerId: string;
  callerName: string;
  callerAvatar?: string;
  callType: 'voice' | 'video';
  timestamp: number;
}

export interface CallState {
  isActive: boolean;
  isConnected: boolean;
  isIncoming: boolean;
  callData?: CallData;
  localStream?: MediaStream;
  remoteStream?: MediaStream;
  isMuted: boolean;
  isVideoEnabled: boolean;
  callDuration: number;
}

export interface WebRTCSignalingData {
  callId: string;
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
}

export interface CallAnsweredData {
  callId: string;
  accepted: boolean;
}

class WebRTCService extends EventEmitter {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private socket: { emit: (event: string, data: unknown) => void; on: (event: string, handler: (data: unknown) => void) => void } | null = null;
  private currentCallId: string | null = null;
  private callStartTime = 0;

  // STUN/TURN configuration
  private readonly rtcConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      // Add TURN servers for production
      // {
      //   urls: 'turn:your-turn-server.com:3478',
      //   username: 'username',
      //   credential: 'password'
      // }
    ],
    iceCandidatePoolSize: 10,
  };

  private callState: CallState = {
    isActive: false,
    isConnected: false,
    isIncoming: false,
    isMuted: false,
    isVideoEnabled: true,
    callDuration: 0,
  };
  constructor() {
    super();
    this.setupInCallManager();
  }

  private setupInCallManager() {
    // const audioEnabled = true; // Default assumption
    try {
      if (InCallManager && typeof InCallManager.setKeepScreenOn === 'function') {
        InCallManager.setKeepScreenOn(true);
        InCallManager.setForceSpeakerphoneOn(false);
      }
    } catch (error) {
      console.warn('InCallManager not available:', error);
    }
  }

  // Initialize WebRTC service with socket connection
  initialize(socket: { emit: (event: string, data: unknown) => void; on: (event: string, handler: (data: unknown) => void) => void }) {
    this.socket = socket;
    this.setupSocketListeners();
  }

  private setupSocketListeners() {
    if (!this.socket) return;

    // Incoming call
    this.socket.on('incoming-call', (callData: unknown) => {
      this.handleIncomingCall(callData as CallData);
    });

    // Call answered
    this.socket.on('call-answered', (data: unknown) => {
      void this.handleCallAnswered(data as CallAnsweredData);
    });

    // Call rejected/ended
    this.socket.on('call-ended', () => {
      this.endCall();
    });

    // WebRTC signaling
    this.socket.on('webrtc-offer', (data: unknown) => {
      void this.handleOffer(data as WebRTCSignalingData);
    });

    this.socket.on('webrtc-answer', (data: unknown) => {
      void this.handleAnswer(data as WebRTCSignalingData);
    });

    this.socket.on('webrtc-ice-candidate', (data: unknown) => {
      void this.handleIceCandidate(data as WebRTCSignalingData);
    });
  }

  // Start a call
  async startCall(matchId: string, callType: 'voice' | 'video'): Promise<boolean> {
    try {
      // Get user media
      const constraints = {
        audio: true,
        video: callType === 'video' ? {
          width: { min: 640, ideal: 1280 },
          height: { min: 480, ideal: 720 },
          frameRate: { min: 16, ideal: 30 }
        } : false
      };

      this.localStream = await mediaDevices.getUserMedia(constraints);
      
      // Create peer connection
      this.peerConnection = new RTCPeerConnection(this.rtcConfiguration);
      this.setupPeerConnectionListeners();

      // Add local stream to peer connection
      this.localStream.getTracks().forEach(track => {
        this.peerConnection?.addTrack(track, this.localStream!);
      });

      // Create and send call offer
      const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.currentCallId = callId;

      const callData: CallData = {
        callId,
        matchId,
        callerId: 'current-user-id', // Get from auth store
        callerName: 'Current User', // Get from auth store
        callType,
        timestamp: Date.now()
      };

      // Update call state
      this.callState = {
        ...this.callState,
        isActive: true,
        isIncoming: false,
        callData,
        localStream: this.localStream
      };

      // Emit call initiation
      this.socket?.emit('initiate-call', callData);
      this.emit('callStateChanged', this.callState);

      if (InCallManager && typeof InCallManager.start === 'function') {
        InCallManager.start({ media: callType === 'video' ? 'video' : 'audio' });
      }
      
      return true;
    } catch (error) {
      console.error('Error starting call:', error);
      this.emit('callError', error);
      return false;
    }
  }

  // Answer incoming call
  async answerCall(): Promise<boolean> {
    try {
      if (!this.callState.callData) return false;

      const constraints = {
        audio: true,
        video: this.callState.callData.callType === 'video' ? {
          width: { min: 640, ideal: 1280 },
          height: { min: 480, ideal: 720 },
          frameRate: { min: 16, ideal: 30 }
        } : false
      };

      this.localStream = await mediaDevices.getUserMedia(constraints);
      
      // Create peer connection
      this.peerConnection = new RTCPeerConnection(this.rtcConfiguration);
      this.setupPeerConnectionListeners();

      // Add local stream
      this.localStream.getTracks().forEach(track => {
        this.peerConnection?.addTrack(track, this.localStream!);
      });

      // Update state
      this.callState = {
        ...this.callState,
        isActive: true,
        isIncoming: false,
        localStream: this.localStream
      };

      // Notify caller that call was answered
      if (this.callState.callData) {
        this.socket?.emit('answer-call', {
          callId: this.currentCallId,
          matchId: this.callState.callData.matchId
        });
      }

      this.emit('callStateChanged', this.callState);
      this.startCallTimer();

      if (this.callState.callData) {
        if (InCallManager && typeof InCallManager.start === 'function') {
          InCallManager.start({ 
            media: this.callState.callData.callType === 'video' ? 'video' : 'audio'
          });
        }
      }

      return true;
    } catch (error) {
      console.error('Error answering call:', error);
      this.emit('callError', error);
      return false;
    }
  }

  // Reject incoming call
  rejectCall() {
    if (this.callState.callData) {
      this.socket?.emit('reject-call', {
        callId: this.callState.callData.callId,
        matchId: this.callState.callData.matchId
      });
    }
    this.endCall();
  }

  // End active call
  endCall() {
    // Clean up peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    // Stop local stream
    try {
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => track.stop());
        this.localStream = null;
      }
    } catch (error) {
      console.error('Error ending local stream:', error);
    }

    // Stop remote stream
    try {
      if (this.remoteStream) {
        this.remoteStream.getTracks().forEach(track => track.stop());
        this.remoteStream = null;
      }
    } catch (error) {
      console.error('Error ending remote stream:', error);
    }

    // Reset call state
    this.callState = {
      isActive: false,
      isConnected: false,
      isIncoming: false,
      isMuted: false,
      isVideoEnabled: true,
      callDuration: 0,
    };

    // Notify socket
    if (this.currentCallId != null) {
      this.socket?.emit('end-call', { callId: this.currentCallId });
    }

    this.currentCallId = null;
    this.callStartTime = 0;

    // Stop InCallManager
    if (InCallManager && typeof InCallManager.stop === 'function') {
      InCallManager.stop();
    }

    this.emit('callStateChanged', this.callState);
  }

  // Toggle mute
  toggleMute() {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        this.callState.isMuted = !audioTrack.enabled;
        this.emit('callStateChanged', this.callState);
      }
    }
  }

  // Toggle video
  toggleVideo() {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        this.callState.isVideoEnabled = videoTrack.enabled;
        this.emit('callStateChanged', this.callState);
      }
    }
  }

  // Switch camera (front/back)
  switchCamera() {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        // React Native WebRTC specific method
        (videoTrack as any)._switchCamera();
      }
    }
  }

  // Toggle speaker
  toggleSpeaker() {
    // State managed by InCallManager internally
    if (InCallManager && typeof InCallManager.setForceSpeakerphoneOn === 'function') {
      InCallManager.setForceSpeakerphoneOn(true);
    }
  }

  // Private methods for WebRTC signaling
  private setupPeerConnectionListeners() {
    if (!this.peerConnection) return;

    this.peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate != null) {
        this.socket?.emit('webrtc-ice-candidate', {
          callId: this.currentCallId,
          candidate: event.candidate
        });
      }
    };

    this.peerConnection.ontrack = (event: RTCTrackEvent) => {
      if (event.streams?.[0] != null) {
        this.remoteStream = event.streams[0] as MediaStream;
        this.callState.remoteStream = this.remoteStream;
        this.emit('callStateChanged', this.callState);
      }
    };

    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState;
      if (state === 'connected') {
        this.callState.isConnected = true;
        this.startCallTimer();
        this.emit('callStateChanged', this.callState);
      } else if (state === 'disconnected' || state === 'failed') {
        this.endCall();
      }
    };
  }

  private handleIncomingCall(callData: CallData) {
    this.currentCallId = callData.callId;
    this.callState = {
      ...this.callState,
      isActive: true,
      isIncoming: true,
      callData
    };

    // InCallManager.displayIncomingCall not available in current version
    // Using start for incoming call notification
    if (InCallManager && typeof InCallManager.start === 'function') {
      InCallManager.start({ media: callData.callType === 'video' ? 'video' : 'audio', ringback: '_DTMF_' });
    }
    this.emit('callStateChanged', this.callState);
  }

  private async handleCallAnswered(data: CallAnsweredData) {
    // Create offer when call is answered
    if (this.peerConnection && data.accepted) {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer as RTCSessionDescriptionInit);
      
      this.socket?.emit('webrtc-offer', {
        callId: this.currentCallId,
        offer: offer as RTCSessionDescriptionInit
      });
    }
  }

  private async handleOffer(data: WebRTCSignalingData) {
    if (this.peerConnection) {
      if (data.offer != null) {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescriptionImpl(data.offer));
      }
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer as RTCSessionDescriptionInit);
      
      this.socket?.emit('webrtc-answer', {
        callId: this.currentCallId,
        answer: answer as RTCSessionDescriptionInit
      });
    }
  }

  private async handleAnswer(data: WebRTCSignalingData) {
    if (this.peerConnection) {
      if (data.answer != null) {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescriptionImpl(data.answer));
      }
    }
  }

  private async handleIceCandidate(data: WebRTCSignalingData) {
    if (this.peerConnection && data.candidate != null) {
      await this.peerConnection.addIceCandidate(new RTCIceCandidateImpl(data.candidate));
    }
  }

  private startCallTimer() {
    this.callStartTime = Date.now();
    const timer = setInterval(() => {
      if (this.callState.isActive && this.callState.isConnected) {
        this.callState.callDuration = Math.floor((Date.now() - this.callStartTime) / 1000);
        this.emit('callStateChanged', this.callState);
      } else {
        clearInterval(timer);
      }
    }, 1000);
  }

  // Getters
  getCallState(): CallState {
    return { ...this.callState };
  }

  isCallActive(): boolean {
    return this.callState.isActive;
  }
}

export default WebRTCService;
