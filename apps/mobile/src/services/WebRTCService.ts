import { logger } from '@pawfectmatch/core';
// import errorHandler from '@pawfectmatch/core/services/ErrorHandler'; // TODO: Fix import when core exports are resolved
import { EventEmitter } from 'events';
import { Platform } from 'react-native';
import InCallManager from 'react-native-incall-manager';
import {
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
  mediaDevices,
  type MediaStream
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
  screenStream?: MediaStream;
  isMuted: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  isRecording: boolean;
  recordingStartTime?: number;
  callDuration: number;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
  networkSpeed: number;
  packetLoss: number;
  latency: number;
}

class WebRTCService extends EventEmitter {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private screenStream: MediaStream | null = null;
  private socket: { emit: (event: string, data?: unknown) => void; on: (event: string, handler: (data: unknown) => void) => void } | null = null;
  private currentCallId: string | null = null;
  private callStartTime = 0;
  private recordingInterval: NodeJS.Timeout | null = null;
  private qualityMonitorInterval: NodeJS.Timeout | null = null;

  // STUN/TURN configuration
  private rtcConfiguration: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      // Production TURN servers (configure via environment variables)
      ...(process.env['EXPO_PUBLIC_TURN_URL'] ? [{
        urls: process.env['EXPO_PUBLIC_TURN_URL'],
        username: process.env['EXPO_PUBLIC_TURN_USERNAME'] || '',
        credential: process.env['EXPO_PUBLIC_TURN_CREDENTIAL'] || ''
      }] : [])
    ],
    iceCandidatePoolSize: 10,
  };

  private callState: CallState = {
    isActive: false,
    isConnected: false,
    isIncoming: false,
    isMuted: false,
    isVideoEnabled: true,
    isScreenSharing: false,
    isRecording: false,
    callDuration: 0,
    connectionQuality: 'good',
    networkSpeed: 0,
    packetLoss: 0,
    latency: 0,
  };

  constructor() {
    super();
    this.setupInCallManager();
  }

  private setupInCallManager(): void {
    InCallManager.setSpeakerphoneOn(false);
    InCallManager.setKeepScreenOn(true);
    InCallManager.setForceSpeakerphoneOn(false);
  }

  // Initialize WebRTC service with socket connection
  initialize(socket: { emit: (event: string, data?: unknown) => void; on: (event: string, handler: (data: unknown) => void) => void }): void {
    this.socket = socket;
    this.setupSocketListeners();
  }

  private setupSocketListeners(): void {
    if (this.socket === null) return;

    // Incoming call
    this.socket.on('incoming-call', (data: unknown) => {
      this.handleIncomingCall(data as CallData);
    });

    // Call answered
    this.socket.on('call-answered', (data: unknown) => {
      this.handleCallAnswered(data as { callId: string }).catch((error) => {
        logger.error('Error handling call answered', {
          component: 'WebRTCService',
          action: 'call_answered',
          severity: 'high',
          metadata: {
            error: error instanceof Error ? error.message : String(error)
          }
        });
      });
    });

    // Call rejected/ended
    this.socket.on('call-ended', () => {
      this.endCall();
    });

    // WebRTC signaling
    this.socket.on('webrtc-offer', (data: unknown) => {
      this.handleOffer(data as { offer: RTCSessionDescriptionInit }).catch((error) => {
        logger.error('WebRTCService error handling offer', {
          component: 'WebRTCService',
          action: 'handle_offer',
          severity: 'high',
          metadata: {
            error: error instanceof Error ? error.message : String(error)
          }
        });
      });
    });

    this.socket.on('webrtc-answer', (data: unknown) => {
      this.handleAnswer(data as { answer: RTCSessionDescriptionInit }).catch((error) => {
        logger.error('Error handling answer', {
          component: 'WebRTCService',
          action: 'handle_answer',
          severity: 'high',
          metadata: {
            error: error instanceof Error ? error.message : String(error)
          }
        });
      });
    });

    this.socket.on('webrtc-ice-candidate', (data: unknown) => {
      this.handleIceCandidate(data as { candidate: RTCIceCandidateInit }).catch((error) => {
        logger.error('Error handling ICE candidate', {
          component: 'WebRTCService',
          action: 'handle_ice_candidate',
          severity: 'high',
          metadata: {
            error: error instanceof Error ? error.message : String(error)
          }
        });
      });
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
      if (this.localStream !== null && this.peerConnection !== null) {
        this.localStream.getTracks().forEach(track => {
          this.peerConnection?.addTrack(track, this.localStream!);
        });
      }

      // Create and send call offer
      const callId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
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

      // Log call start
      logger.info('Call started successfully', {
        component: 'WebRTCService',
        action: 'start_call',
        metadata: {
          callId,
          matchId,
          callType,
        },
      });

      return true;
    } catch (error) {
      // Handle error with proper error handler
      logger.error('WebRTCService error starting call', {
        component: 'WebRTCService',
        action: 'start_call',
        severity: 'high',
        metadata: {
          matchId,
          callType,
          error: error instanceof Error ? error.message : String(error)
        }
      });

      this.emit('callError', error);
      return false;
    }
  }

  // Answer incoming call
  async answerCall(): Promise<boolean> {
    try {
      if (this.callState.callData === undefined) return false;

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
      if (this.localStream !== null && this.peerConnection !== null) {
        this.localStream.getTracks().forEach(track => {
          this.peerConnection?.addTrack(track, this.localStream!);
        });
      }

      // Update state
      this.callState = {
        ...this.callState,
        isActive: true,
        isIncoming: false,
        localStream: this.localStream
      };

      // Notify caller that call was answered
      this.socket?.emit('answer-call', {
        callId: this.currentCallId,
        matchId: this.callState.callData?.matchId
      });

      this.emit('callStateChanged', this.callState);
      this.startCallTimer();

      InCallManager.start({
        media: this.callState.callData?.callType === 'video' ? 'video' : 'audio'
      });

      logger.info('Call answered successfully', {
        component: 'WebRTCService',
        action: 'answer_call',
        metadata: {
          callId: this.currentCallId,
          callType: this.callState.callData?.callType,
        },
      });

      return true;
    } catch (error) {
      logger.error('Error answering call', {
        component: 'WebRTCService',
        action: 'answer_call',
        severity: 'high',
        metadata: {
          callId: this.currentCallId,
          error: error instanceof Error ? error.message : String(error)
        }
      });

      this.emit('callError', error);
      return false;
    }
  }

  // Reject incoming call
  rejectCall(): void {
    if (this.callState.callData !== undefined) {
      this.socket?.emit('reject-call', {
        callId: this.callState.callData.callId,
        matchId: this.callState.callData.matchId
      });
    }
    this.endCall();
  }

  // End active call
  endCall(): void {
    // Clean up peer connection
    if (this.peerConnection !== null) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    // Stop local stream
    if (this.localStream !== null) {
      this.localStream.getTracks().forEach(track => { track.stop(); });
      this.localStream = null;
    }

    // Stop remote stream
    if (this.remoteStream !== null) {
      this.remoteStream.getTracks().forEach(track => { track.stop(); });
      this.remoteStream = null;
    }

    // Stop screen stream
    if (this.screenStream !== null) {
      this.screenStream.getTracks().forEach(track => { track.stop(); });
      this.screenStream = null;
    }

    // Clear intervals
    if (this.recordingInterval !== null) {
      clearInterval(this.recordingInterval);
      this.recordingInterval = null;
    }

    if (this.qualityMonitorInterval !== null) {
      clearInterval(this.qualityMonitorInterval);
      this.qualityMonitorInterval = null;
    }

    // Reset call state
    this.callState = {
      isActive: false,
      isConnected: false,
      isIncoming: false,
      isMuted: false,
      isVideoEnabled: true,
      isScreenSharing: false,
      isRecording: false,
      callDuration: 0,
      connectionQuality: 'good',
      networkSpeed: 0,
      packetLoss: 0,
      latency: 0,
    };

    // Notify socket
    if (this.currentCallId !== null) {
      this.socket?.emit('end-call', { callId: this.currentCallId });
    }

    this.currentCallId = null;
    this.callStartTime = 0;

    // Stop InCallManager
    InCallManager.stop();

    this.emit('callStateChanged', this.callState);
  }

  // Toggle mute
  toggleMute(): void {
    if (this.localStream !== null) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack !== undefined) {
        audioTrack.enabled = !audioTrack.enabled;
        this.callState.isMuted = !audioTrack.enabled;
        this.emit('callStateChanged', this.callState);
      }
    }
  }

  // Toggle video
  toggleVideo(): void {
    if (this.localStream !== null) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack !== undefined) {
        videoTrack.enabled = !videoTrack.enabled;
        this.callState.isVideoEnabled = videoTrack.enabled;
        this.emit('callStateChanged', this.callState);
      }
    }
  }

  // Switch camera (front/back)
  async switchCamera(): Promise<void> {
    if (this.localStream !== null) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack !== undefined) {
        try {
          // React Native WebRTC specific method with proper typing
          const track = videoTrack as unknown as MediaStreamTrack & { _switchCamera?: () => void };
          if (track._switchCamera && typeof track._switchCamera === 'function') {
            track._switchCamera();
          } else {
            throw new Error('Camera switching not supported on this device');
          }
        } catch (error: unknown) {
          logger.error('Error switching camera', {
            component: 'WebRTCService',
            action: 'switch_camera',
            severity: 'medium',
            metadata: {
              error: error instanceof Error ? error.message : String(error)
            }
          });
        }
      }
    }
  }

  // Toggle speaker
  toggleSpeaker(): void {
    // Note: InCallManager doesn't have getSpeakerphoneOn method
    // We'll track speaker state manually
    InCallManager.setSpeakerphoneOn(true);
  }

  // Start screen sharing
  async startScreenSharing(): Promise<boolean> {
    try {
      if (this.isScreenSharing()) return false;

      // Request screen capture permission
      const screenStream = await mediaDevices.getDisplayMedia();

      this.screenStream = screenStream;

      // Add screen stream to peer connection
      if (this.peerConnection !== null) {
        screenStream.getTracks().forEach(track => {
          this.peerConnection?.addTrack(track, screenStream);
        });
      }

      // Update state
      this.callState = {
        ...this.callState,
        isScreenSharing: true,
        screenStream: this.screenStream
      };

      // Notify other participant
      this.socket?.emit('screen-share-started', {
        callId: this.currentCallId
      });

      this.emit('callStateChanged', this.callState);

      logger.info('Screen sharing started', {
        component: 'WebRTCService',
        action: 'start_screen_sharing',
        metadata: {
          callId: this.currentCallId,
        },
      });

      return true;
    } catch (error) {
      logger.error('Error starting screen sharing', {
        component: 'WebRTCService',
        action: 'start_screen_sharing',
        severity: 'medium',
        metadata: {
          callId: this.currentCallId,
          error: error instanceof Error ? error.message : String(error)
        }
      });

      this.emit('callError', error);
      return false;
    }
  }

  // Stop screen sharing
  stopScreenSharing(): boolean {
    try {
      if (!this.isScreenSharing()) return false;

      // Remove screen tracks from peer connection
      if (this.peerConnection !== null && this.screenStream !== null) {
        this.screenStream.getTracks().forEach(track => {
          const sender = this.peerConnection?.getSenders().find(s =>
            s.track === track
          );
          if (sender !== undefined) {
            this.peerConnection?.removeTrack(sender);
          }
          track.stop();
        });
      }

      this.screenStream = null;

      // Update state
      this.callState = {
        ...this.callState,
        isScreenSharing: false
      };

      // Notify other participant
      this.socket?.emit('screen-share-stopped', {
        callId: this.currentCallId
      });

      this.emit('callStateChanged', this.callState);

      logger.info('Screen sharing stopped', {
        component: 'WebRTCService',
        action: 'stop_screen_sharing',
        metadata: {
          callId: this.currentCallId,
        },
      });

      return true;
    } catch (error) {
      logger.error('Error stopping screen sharing', {
        component: 'WebRTCService',
        action: 'stop_screen_sharing',
        severity: 'medium',
        metadata: {
          callId: this.currentCallId,
          error: error instanceof Error ? error.message : String(error)
        }
      });

      this.emit('callError', error);
      return false;
    }
  }

  // Start call recording
  async startRecording(): Promise<boolean> {
    try {
      if (this.isRecording()) return false;

      // Request recording permission
      const hasPermission = await this.requestRecordingPermission();
      if (!hasPermission) {
        throw new Error('Recording permission denied');
      }

      // Start recording
      this.callState = {
        ...this.callState,
        isRecording: true,
        recordingStartTime: Date.now()
      };

      // Notify other participant
      this.socket?.emit('recording-started', {
        callId: this.currentCallId
      });

      this.emit('callStateChanged', this.callState);

      logger.info('Call recording started', {
        component: 'WebRTCService',
        action: 'start_recording',
        metadata: {
          callId: this.currentCallId,
        },
      });

      return true;
    } catch (error) {
      logger.error('Error starting recording', {
        component: 'WebRTCService',
        action: 'start_recording',
        severity: 'medium',
        metadata: {
          callId: this.currentCallId,
          error: error instanceof Error ? error.message : String(error)
        }
      });

      this.emit('callError', error);
      return false;
    }
  }

  // Stop call recording
  stopRecording(): boolean {
    try {
      if (!this.isRecording()) return false;

      this.callState = {
        ...this.callState,
        isRecording: false
      };

      // Notify other participant
      this.socket?.emit('recording-stopped', {
        callId: this.currentCallId
      });

      this.emit('callStateChanged', this.callState);

      logger.info('Call recording stopped', {
        component: 'WebRTCService',
        action: 'stop_recording',
        metadata: {
          callId: this.currentCallId,
        },
      });

      return true;
    } catch (error) {
      logger.error('Error stopping recording', {
        component: 'WebRTCService',
        action: 'stop_recording',
        severity: 'medium',
        metadata: {
          callId: this.currentCallId,
          error: error instanceof Error ? error.message : String(error)
        }
      });

      this.emit('callError', error);
      return false;
    }
  }

  // Monitor call quality
  private startQualityMonitoring(): void {
    if (this.qualityMonitorInterval !== null) {
      clearInterval(this.qualityMonitorInterval);
    }

    this.qualityMonitorInterval = setInterval(() => {
      if (this.peerConnection === null || !this.callState.isActive) return;

      this.peerConnection.getStats().then((stats) => {
        let totalBytesReceived = 0;
        let totalBytesSent = 0;
        let totalPacketsLost = 0;
        let totalRtt = 0;
        let sampleCount = 0;

        interface RTCStatsReport {
          type?: string;
          bytesReceived?: number | string;
          packetsLost?: number | string;
          bytesSent?: number | string;
          state?: string;
          currentRoundTripTime?: number | string;
        }

        stats.forEach((report: unknown) => {
          const typedReport = report as RTCStatsReport;
          if (typedReport.type === 'inbound-rtp') {
            totalBytesReceived += Number(typedReport.bytesReceived) || 0;
            totalPacketsLost += Number(typedReport.packetsLost) || 0;
          } else if (typedReport.type === 'outbound-rtp') {
            totalBytesSent += Number(typedReport.bytesSent) || 0;
          } else if (typedReport.type === 'candidate-pair') {
            if (typedReport.state === 'succeeded') {
              totalRtt += Number(typedReport.currentRoundTripTime) || 0;
              sampleCount++;
            }
          }
        });

        // Calculate metrics
        const networkSpeed = (totalBytesReceived + totalBytesSent) / 1000; // KB/s
        const packetLoss = totalPacketsLost;
        const latency = sampleCount > 0 ? (totalRtt / sampleCount) * 1000 : 0; // ms

        // Determine connection quality
        let connectionQuality: 'excellent' | 'good' | 'fair' | 'poor' = 'good';
        if (latency < 100 && packetLoss < 5) {
          connectionQuality = 'excellent';
        } else if (latency < 200 && packetLoss < 10) {
          connectionQuality = 'good';
        } else if (latency < 500 && packetLoss < 20) {
          connectionQuality = 'fair';
        } else {
          connectionQuality = 'poor';
        }

        // Update state
        this.callState = {
          ...this.callState,
          connectionQuality,
          networkSpeed,
          packetLoss,
          latency
        };

        this.emit('callStateChanged', this.callState);

        // Emit quality warnings if needed
        if (connectionQuality === 'poor') {
          this.emit('qualityWarning', {
            quality: connectionQuality,
            latency,
            packetLoss
          });
        }
      }).catch((error) => {
        logger.error('Error monitoring call quality', {
          component: 'WebRTCService',
          action: 'monitor_call_quality',
          severity: 'low',
          metadata: {
            callId: this.currentCallId,
            error: error instanceof Error ? error.message : String(error)
          }
        });
      });
    }, 5000); // Check every 5 seconds
  }

  // Request recording permission
  private requestRecordingPermission(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        // Check if we're on a platform that supports recording
        if (Platform.OS === 'ios') {
          // iOS requires special permission handling
          resolve(true); // Simplified for now
        } else if (Platform.OS === 'android') {
          // Android permission handling
          resolve(true); // Simplified for now
        } else {
          resolve(false);
        }
      } catch (error: unknown) {
        logger.error('Error requesting recording permission', {
          component: 'WebRTCService',
          action: 'request_recording_permission',
          severity: 'medium',
          metadata: {
            error: error instanceof Error ? error.message : String(error)
          }
        });
        resolve(false);
      }
    });
  }

  private setupPeerConnectionListeners(): void {
    if (this.peerConnection === null) return;

    // Type assertion for React Native WebRTC legacy API compatibility
    const pc = this.peerConnection as any;

    // Handle ICE candidates - React Native WebRTC uses legacy event handler pattern
    pc.onicecandidate = (event: any) => {
      if (event.candidate !== null) {
        this.socket?.emit('webrtc-ice-candidate', {
          callId: this.currentCallId,
          candidate: event.candidate as RTCIceCandidate
        });
      }
    };

    // Handle remote tracks - React Native WebRTC uses onaddstream instead of modern ontrack
    pc.onaddstream = (event: any) => {
      if (event.stream) {
        this.remoteStream = event.stream;
        this.callState = {
          ...this.callState,
          remoteStream: event.stream,
        };
        this.emit('callStateChanged', this.callState);
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState;
      if (state === 'connected') {
        this.callState.isConnected = true;
        this.startCallTimer();
        this.startQualityMonitoring();
        this.emit('callStateChanged', this.callState);
      } else if (state === 'disconnected' || state === 'failed') {
        this.endCall();
      }
    };
  }

  private handleIncomingCall(callData: CallData): Promise<void> {
    return new Promise((resolve) => {
      this.currentCallId = callData.callId;
      this.callState = {
        ...this.callState,
        isActive: true,
        isIncoming: true,
        callData
      };

      // Note: InCallManager doesn't have displayIncomingCall method
      // This would need to be implemented with a custom incoming call UI
      logger.info('Incoming call received', {
        component: 'WebRTCService',
        action: 'incoming_call',
        metadata: {
          callId: callData.callId,
          callerName: callData.callerName,
          callType: callData.callType,
        },
      });
      this.emit('callStateChanged', this.callState);
      resolve();
    });
  }

  private handleCallAnswered(_data: { callId: string }): Promise<void> {
    return new Promise((resolve) => {
      // Create offer when call is answered
      if (this.peerConnection !== null) {
        this.peerConnection.createOffer().then((offer) => this.peerConnection?.setLocalDescription(offer)).then(() => {
          this.socket?.emit('webrtc-offer', {
            callId: this.currentCallId,
            offer: this.peerConnection?.localDescription
          });
        }).catch((error: unknown) => {
          logger.error('Error creating offer', {
            component: 'WebRTCService',
            action: 'create_offer',
            severity: 'high',
            metadata: {
              callId: this.currentCallId,
              error: error instanceof Error ? error.message : String(error)
            }
          });
        });
      }
      resolve();
    });
  }

  private handleOffer(data: { offer: RTCSessionDescriptionInit }): Promise<void> {
    return new Promise((resolve) => {
      if (this.peerConnection !== null && data.offer.sdp !== undefined) {
        this.peerConnection.setRemoteDescription(new RTCSessionDescription({
          type: data.offer.type,
          sdp: data.offer.sdp
        })).then(() => this.peerConnection?.createAnswer()).then((answer) => this.peerConnection?.setLocalDescription(answer)).then(() => {
          this.socket?.emit('webrtc-answer', {
            callId: this.currentCallId,
            answer: this.peerConnection?.localDescription
          });
        }).catch((error: unknown) => {
          logger.error('Error handling offer', {
            component: 'WebRTCService',
            action: 'handle_offer',
            severity: 'high',
            metadata: {
              callId: this.currentCallId,
              error: error instanceof Error ? error.message : String(error)
            }
          });
        });
      }
      resolve();
    });
  }

  private handleAnswer(data: { answer: RTCSessionDescriptionInit }): Promise<void> {
    return new Promise((resolve) => {
      if (this.peerConnection !== null && data.answer.sdp !== undefined) {
        this.peerConnection.setRemoteDescription(new RTCSessionDescription({
          type: data.answer.type,
          sdp: data.answer.sdp
        })).catch((error: unknown) => {
          logger.error('Error handling answer', {
            component: 'WebRTCService',
            action: 'handle_answer',
            severity: 'high',
            metadata: {
              callId: this.currentCallId,
              error: error instanceof Error ? error.message : String(error)
            }
          });
        });
      }
      resolve();
    });
  }

  private handleIceCandidate(data: { candidate: RTCIceCandidateInit }): Promise<void> {
    return new Promise((resolve) => {
      if (this.peerConnection !== null) {
        this.peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate)).catch((error: unknown) => {
          logger.error('Error handling ICE candidate', {
            component: 'WebRTCService',
            action: 'handle_ice_candidate',
            severity: 'medium',
            metadata: {
              callId: this.currentCallId,
              error: error instanceof Error ? error.message : String(error)
            }
          });
        });
      }
      resolve();
    });
  }

  private startCallTimer(): void {
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

  isScreenSharing(): boolean {
    return this.callState.isScreenSharing;
  }

  isRecording(): boolean {
    return this.callState.isRecording;
  }

  getConnectionQuality(): 'excellent' | 'good' | 'fair' | 'poor' {
    return this.callState.connectionQuality;
  }

  getCallStats(): { networkSpeed: number; packetLoss: number; latency: number } {
    return {
      networkSpeed: this.callState.networkSpeed,
      packetLoss: this.callState.packetLoss,
      latency: this.callState.latency
    };
  }
}

export default new WebRTCService();
