import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RTCView } from 'react-native-webrtc';
import type { CallState } from '../../services/WebRTCService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ActiveCallScreenProps {
  callState: CallState;
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onSwitchCamera: () => void;
  onToggleSpeaker: () => void;
  onStartScreenShare?: () => void;
  onStopScreenShare?: () => void;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  onShowCallStats?: () => void;
}

export default function ActiveCallScreen({
  callState,
  onEndCall,
  onToggleMute,
  onToggleVideo,
  onSwitchCamera,
  onToggleSpeaker,
  onStartScreenShare,
  onStopScreenShare,
  onStartRecording,
  onStopRecording,
  onShowCallStats,
}: ActiveCallScreenProps): React.JSX.Element {
  const [controlsVisible, setControlsVisible] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const localVideoAnim = useRef(new Animated.ValueXY({ x: 20, y: 100 })).current;

  // Auto-hide controls after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (controlsVisible && callState.callData?.callType === 'video') {
        hideControls();
      }
    }, 5000);

    return () => { clearTimeout(timer); };
  }, [controlsVisible, callState.callData?.callType]);

  // Pan responder for draggable local video
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      localVideoAnim.x.setValue(gestureState.dx + 20);
      localVideoAnim.y.setValue(gestureState.dy + 100);
    },
    onPanResponderRelease: (_, gestureState) => {
      // Snap to edges
      const { dx, dy } = gestureState;
      const newX = dx < screenWidth / 2 ? 20 : screenWidth - 140;
      const newY = Math.max(100, Math.min(screenHeight - 300, dy + 100));

      // Use individual spring animations for x and y coordinates
      Animated.spring(localVideoAnim.x, {
        toValue: newX,
        useNativeDriver: false,
      }).start();
      Animated.spring(localVideoAnim.y, {
        toValue: newY,
        useNativeDriver: false,
      }).start();
    },
  });

  const showControls = (): void => {
    setControlsVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hideControls = (): void => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setControlsVisible(false);
    });
  };

  const toggleControls = (): void => {
    if (controlsVisible) {
      hideControls();
    } else {
      showControls();
    }
  };

  const formatCallDuration = (totalSeconds: number = callState.callDuration): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatRecordingDuration = (): string => {
    if (!callState.recordingStartTime) return '00:00';
    const duration = Math.floor((Date.now() - callState.recordingStartTime) / 1000);
    const mins = Math.floor(duration / 60);
    const secs = duration % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getQualityColor = (quality: string): string => {
    switch (quality) {
      case 'excellent': return '#4CAF50';
      case 'good': return '#8BC34A';
      case 'fair': return '#FF9800';
      case 'poor': return '#F44336';
      default: return '#8BC34A';
    }
  };

  const handleScreenShare = async () => {
    if (callState.isScreenSharing) {
      await onStopScreenShare?.();
    } else {
      await onStartScreenShare?.();
    }
  };

  const handleRecording = async () => {
    if (callState.isRecording) {
      await onStopRecording?.();
    } else {
      await onStartRecording?.();
    }
  };

  const renderVideoCall = () => (
    <View style={styles.videoContainer}>
      {/* Remote Video (Full Screen) */}
      {callState.remoteStream ? <RTCView
        style={styles.remoteVideo}
        streamURL={callState.remoteStream.toURL()}
        objectFit="cover"
      /> : null}

      {/* Screen Share Overlay */}
      {callState.isScreenSharing && callState.screenStream ? <View style={styles.screenShareOverlay}>
        <RTCView
          style={styles.screenShareVideo}
          streamURL={callState.screenStream.toURL()}
          objectFit="contain"
        />
        <View style={styles.screenShareIndicator}>
          <Ionicons name="desktop" size={16} color="#fff" />
          <Text style={styles.screenShareText}>Screen Sharing</Text>
        </View>
      </View> : null}

      {/* Local Video (Draggable Picture-in-Picture) */}
      {callState.localStream && callState.isVideoEnabled && !callState.isScreenSharing ? <Animated.View
        style={[
          styles.localVideoContainer,
          {
            transform: [
              { translateX: localVideoAnim.x as any },
              { translateY: localVideoAnim.y as any },
            ],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <RTCView
          style={styles.localVideo}
          streamURL={callState.localStream.toURL()}
          objectFit="cover"
          mirror
        />
        <TouchableOpacity
          style={styles.switchCameraButton}
          onPress={onSwitchCamera}
        >
          <Ionicons name="camera-reverse" size={20} color="#fff" />
        </TouchableOpacity>
      </Animated.View> : null}

      {/* Connection Quality Indicator */}
      <View style={styles.qualityIndicator}>
        <View
          style={[
            styles.qualityDot,
            { backgroundColor: getQualityColor(callState.connectionQuality) }
          ]}
        />
        <Text style={styles.qualityText}>
          {callState.connectionQuality.toUpperCase()}
        </Text>
      </View>

      {/* Recording Indicator */}
      {callState.isRecording ? <View style={styles.recordingIndicator}>
        <View style={styles.recordingDot} />
        <Text style={styles.recordingText}>
          REC {formatRecordingDuration()}
        </Text>
      </View> : null}

      {/* Tap to show/hide controls */}
      <TouchableOpacity
        style={styles.videoTouchArea}
        onPress={toggleControls}
        activeOpacity={1}
      />
    </View>
  );

  const renderVoiceCall = () => (
    <View style={styles.voiceContainer}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.voiceGradient}
      />

      <View style={styles.voiceContent}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarRing}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={60} color="#fff" />
            </View>
          </View>
        </View>

        <Text style={styles.callerName}>
          {callState.callData?.callerName || 'Unknown'}
        </Text>

        <Text style={styles.callStatus}>
          {callState.isConnected ? 'Connected' : 'Connecting...'}
        </Text>

        {callState.isConnected ? <Text style={styles.callDuration}>
          {formatCallDuration(callState.callDuration)}
        </Text> : null}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {callState.callData?.callType === 'video' ? renderVideoCall() : renderVoiceCall()}

      {/* Controls Overlay */}
      <Animated.View
        style={[
          styles.controlsOverlay,
          {
            opacity: fadeAnim as any,
            pointerEvents: controlsVisible ? 'auto' : 'none',
          },
        ]}
      >
        <SafeAreaView style={styles.controlsContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.callerNameHeader}>
              {callState.callData?.callerName || 'Unknown'}
            </Text>
            {callState.isConnected ? <Text style={styles.callDurationHeader}>
              {formatCallDuration(callState.callDuration)}
            </Text> : null}
          </View>

          {/* Call Controls */}
          <View style={styles.callControls}>
            {/* Mute Button */}
            <TouchableOpacity
              style={[
                styles.controlButton,
                callState.isMuted && styles.controlButtonActive,
              ]}
              onPress={onToggleMute}
            >
              <Ionicons
                name={callState.isMuted ? 'mic-off' : 'mic'}
                size={24}
                color={callState.isMuted ? '#ff4757' : '#fff'}
              />
            </TouchableOpacity>

            {/* Speaker Button */}
            <TouchableOpacity
              style={styles.controlButton}
              onPress={onToggleSpeaker}
            >
              <Ionicons name="volume-high" size={24} color="#fff" />
            </TouchableOpacity>

            {/* Video Toggle (only for video calls) */}
            {callState.callData?.callType === 'video' && (
              <TouchableOpacity
                style={[
                  styles.controlButton,
                  !callState.isVideoEnabled && styles.controlButtonActive,
                ]}
                onPress={onToggleVideo}
              >
                <Ionicons
                  name={callState.isVideoEnabled ? 'videocam' : 'videocam-off'}
                  size={24}
                  color={!callState.isVideoEnabled ? '#ff4757' : '#fff'}
                />
              </TouchableOpacity>
            )}

            {/* Screen Share Button (only for video calls) */}
            {callState.callData?.callType === 'video' && (
              <TouchableOpacity
                style={[
                  styles.controlButton,
                  callState.isScreenSharing && styles.controlButtonActive,
                ]}
                onPress={handleScreenShare}
              >
                <Ionicons
                  name={callState.isScreenSharing ? 'desktop-outline' : 'desktop'}
                  size={24}
                  color={callState.isScreenSharing ? '#4CAF50' : '#fff'}
                />
              </TouchableOpacity>
            )}

            {/* Recording Button */}
            <TouchableOpacity
              style={[
                styles.controlButton,
                callState.isRecording && styles.controlButtonActive,
              ]}
              onPress={handleRecording}
            >
              <Ionicons
                name={callState.isRecording ? 'stop-circle' : 'videocam'}
                size={24}
                color={callState.isRecording ? '#ff4757' : '#fff'}
              />
            </TouchableOpacity>

            {/* Call Stats Button */}
            <TouchableOpacity
              style={styles.controlButton}
              onPress={onShowCallStats}
            >
              <Ionicons name="stats-chart" size={24} color="#fff" />
            </TouchableOpacity>

            {/* End Call Button */}
            <TouchableOpacity
              style={[styles.controlButton, styles.endCallButton]}
              onPress={onEndCall}
            >
              <LinearGradient
                colors={['#ff4757', '#ff3838']}
                style={styles.endCallGradient}
              >
                <Ionicons name="call" size={24} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  // Video Call Styles
  videoContainer: {
    flex: 1,
  },
  remoteVideo: {
    flex: 1,
    backgroundColor: '#000',
  },
  localVideoContainer: {
    position: 'absolute',
    width: 120,
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  localVideo: {
    width: '100%',
    height: '100%',
  },
  switchCameraButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoTouchArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  // Voice Call Styles
  voiceContainer: {
    flex: 1,
  },
  voiceGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  voiceContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  avatarContainer: {
    marginBottom: 40,
  },
  avatarRing: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    padding: 8,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 72,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callerName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  callStatus: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.8,
    marginBottom: 8,
  },
  callDuration: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.6,
  },

  // Controls Overlay
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  controlsContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  callerNameHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  callDurationHeader: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  callControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 50,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  controlButtonActive: {
    backgroundColor: 'rgba(255, 71, 87, 0.3)',
    borderColor: '#ff4757',
  },
  endCallButton: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  endCallGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Screen Share Styles
  screenShareOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenShareVideo: {
    width: '100%',
    height: '100%',
  },
  screenShareIndicator: {
    position: 'absolute',
    top: 60,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  screenShareText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },

  // Quality Indicator Styles
  qualityIndicator: {
    position: 'absolute',
    top: 60,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  qualityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  qualityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  // Recording Indicator Styles
  recordingIndicator: {
    position: 'absolute',
    top: 100,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 67, 54, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginRight: 6,
  },
  recordingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
