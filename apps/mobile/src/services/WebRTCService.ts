import { EventEmitter } from 'events';

import InCallManager from 'react-native-incall-manager';
import type {
  MediaStream,
  RTCIceCandidate as RTCIceCandidateType,
  RTCSessionDescription as RTCSessionDescriptionType,
  MediaStreamTrack as MediaStreamTrackType} from 'react-native-webrtc';
import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  MediaStreamTrack,
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

class WebRTCService extends EventEmitter {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private socket: { emit: (event: string, data: any) => void; on: (event: string, handler: (data: any) => void) => void } | null = null;
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
    const audioEnabled = true; // Default assumption
    InCallManager.setKeepScreenOn(true);
    InCallManager.setForceSpeakerphoneOn(false);
  }

  // Initialize WebRTC service with socket connection
  initialize(socket: { emit: (event: string, data: any) => void; on: (event: string, handler: (data: any) => void) => void }) {
    this.socket = socket;
    this.setupSocketListeners();
  }

  private setupSocketListeners() {
    if (!this.socket) return;

    // Incoming call
    this.socket.on('incoming-call', (callData: CallData) => {
      this.handleIncomingCall(callData);
    });

    // Call answered
    this.socket.on('call-answered', (data: any) => {
      this.handleCallAnswered(data);
    });

    // Call rejected/ended
    this.socket.on('call-ended', () => {
      this.endCall();
    });

    // WebRTC signaling
    this.socket.on('webrtc-offer', (data: any) => {
      this.handleOffer(data);
    });

    this.socket.on('webrtc-answer', (data: any) => {
      this.handleAnswer(data);
    });

    this.socket.on('webrtc-ice-candidate', (data: any) => {
      this.handleIceCandidate(data);
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

      InCallManager.start({ media: callType === 'video' ? 'video' : 'audio' });
      
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
        InCallManager.start({ 
          media: this.callState.callData.callType === 'video' ? 'video' : 'audio'
        });
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
    if (this.currentCallId) {
      this.socket?.emit('end-call', { callId: this.currentCallId });
    }

    this.currentCallId = null;
    this.callStartTime = 0;

    // Stop InCallManager
    InCallManager.stop();

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
  async switchCamera() {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        // @ts-ignore - React Native WebRTC specific method
        videoTrack._switchCamera();
      }
    }
  }

  // Toggle speaker
  toggleSpeaker() {
    // State managed by InCallManager internally
    InCallManager.setForceSpeakerphoneOn(true);
  }

  // Private methods for WebRTC signaling
  private setupPeerConnectionListeners() {
    if (!this.peerConnection) return;

    this.peerConnection.addEventListener('icecandidate', (event: any) => {
      if (event.candidate) {
        this.socket?.emit('webrtc-ice-candidate', {
          callId: this.currentCallId,
          candidate: event.candidate
        });
      }
    });

    this.peerConnection.addEventListener('track', (event: any) => {
      if (event.streams?.[0]) {
        this.remoteStream = event.streams[0];
        this.callState.remoteStream = this.remoteStream ?? undefined;
        this.emit('callStateChanged', this.callState);
      }
    });

    this.peerConnection.addEventListener('connectionstatechange', () => {
      const state = this.peerConnection?.connectionState;
      if (state === 'connected') {
        this.callState.isConnected = true;
        this.startCallTimer();
        this.emit('callStateChanged', this.callState);
      } else if (state === 'disconnected' || state === 'failed') {
        this.endCall();
      }
    });
  }

  private async handleIncomingCall(callData: CallData) {
    this.currentCallId = callData.callId;
    this.callState = {
      ...this.callState,
      isActive: true,
      isIncoming: true,
      callData
    };

    // InCallManager.displayIncomingCall not available in current version
    // Using start for incoming call notification
    InCallManager.start({ media: callData.callType === 'video' ? 'video' : 'audio', ringback: '_DTMF_' });
    this.emit('callStateChanged', this.callState);
  }

  private async handleCallAnswered(data: any) {
    // Create offer when call is answered
    if (this.peerConnection) {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      
      this.socket?.emit('webrtc-offer', {
        callId: this.currentCallId,
        offer
      });
    }
  }

  private async handleOffer(data: any) {
    if (this.peerConnection) {
      if (data.offer) {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
      }
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      
      this.socket?.emit('webrtc-answer', {
        callId: this.currentCallId,
        answer
      });
    }
  }

  private async handleAnswer(data: any) {
    if (this.peerConnection) {
      if (data.answer) {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
      }
    }
  }

  private async handleIceCandidate(data: any) {
    if (this.peerConnection) {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
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

export default new WebRTCService();
