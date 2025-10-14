import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Image, StatusBar, StyleSheet, Text, TouchableOpacity, Vibration, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { type CallData } from '../../services/WebRTCService';

const { height: screenHeight } = Dimensions.get('window');

interface IncomingCallScreenProps {
  callData: CallData;
  onAnswer: () => void;
  onReject: () => void;
}

export default function IncomingCallScreen({
  callData,
  onAnswer,
  onReject
}: IncomingCallScreenProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Create interpolation values for transforms
  const headerTranslateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, 0],
  }) as any;

  const callerInfoScale = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  }) as any;

  const avatarScale = pulseAnim.interpolate({
    inputRange: [1, 1.2],
    outputRange: [1, 1.2],
  }) as any;

  const actionsTranslateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [100, 0],
  }) as any;

  const additionalOpacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  }) as any;

  useEffect(() => {
    // Start pulsing animation for incoming call
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    // Slide in animation
    const slideAnimation = Animated.timing(slideAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    });

    pulseAnimation.start();
    slideAnimation.start();

    // Vibration pattern for incoming call
    const vibrationPattern = [0, 1000, 500, 1000, 500];
    Vibration.vibrate(vibrationPattern, true);

    return () => {
      pulseAnimation.stop();
      Vibration.cancel();
    };
  }, [pulseAnim, slideAnim]);

  const handleAnswer = (): void => {
    Vibration.cancel();
    onAnswer();
  };

  const handleReject = (): void => {
    Vibration.cancel();
    onReject();
  };

  const formatCallType = (type: 'video' | 'voice'): string => (type === 'video' ? 'Video Call' : 'Voice Call');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Background Gradient */}
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.backgroundGradient}
      />

      {/* Blur Overlay */}
      <BlurView intensity={20} style={styles.blurOverlay} />

      <SafeAreaView style={styles.content}>
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              transform: [
                {
                  translateY: headerTranslateY
                }
              ]
            }
          ]}
        >
          <Text style={styles.incomingCallText}>Incoming Call</Text>
          <Text style={styles.callTypeText}>{formatCallType(callData.callType)}</Text>
        </Animated.View>

        {/* Caller Info */}
        <Animated.View
          style={[
            styles.callerInfo,
            {
              transform: [
                {
                  scale: callerInfoScale
                }
              ]
            }
          ]}
        >
          {/* Avatar with pulsing effect */}
          <Animated.View
            style={[
              styles.avatarContainer,
              {
                transform: [
                  {
                    scale: avatarScale
                  }
                ]
              }
            ]}
          >
            <View style={styles.avatarRing}>
              <Image
                source={
                  callData.callerAvatar
                    ? { uri: callData.callerAvatar }
                    : require('../../assets/default-avatar.png')
                }
                style={styles.avatar}
              />
            </View>
          </Animated.View>

          <Text style={styles.callerName}>{callData.callerName}</Text>
          <Text style={styles.callerSubtext}>PawfectMatch</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.actionsContainer,
            {
              transform: [{
                translateY: actionsTranslateY
              }]
            }
          ]}
        >
          {/* Reject Button */}
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={handleReject}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#ff4757', '#ff3838']}
              style={styles.buttonGradient}
            >
              <Ionicons name="call" size={32} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
            </LinearGradient>
          </TouchableOpacity>

          {/* Answer Button */}
          <TouchableOpacity
            style={[styles.actionButton, styles.answerButton]}
            onPress={handleAnswer}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#2ed573', '#1dd1a1']}
              style={styles.buttonGradient}
            >
              <Ionicons name="call" size={32} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Additional Actions */}
        <Animated.View
          style={[
            styles.additionalActions,
            {
              opacity: additionalOpacity,
            }
          ]}
        >
          <TouchableOpacity style={styles.additionalButton}>
            <Ionicons name="chatbubble" size={24} color="#fff" />
            <Text style={styles.additionalButtonText}>Message</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.additionalButton}>
            <Ionicons name="alarm" size={24} color="#fff" />
            <Text style={styles.additionalButtonText}>Remind Me</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: screenHeight * 0.1,
  },
  incomingCallText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    opacity: 0.8,
  },
  callTypeText: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.7,
    marginTop: 8,
  },
  callerInfo: {
    alignItems: 'center',
    marginTop: screenHeight * 0.15,
  },
  avatarContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  callerName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
  },
  callerSubtext: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.7,
    marginTop: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: screenHeight * 0.1,
  },
  actionButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  rejectButton: {},
  answerButton: {},
  buttonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  additionalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  additionalButton: {
    alignItems: 'center',
  },
  additionalButtonText: {
    color: '#fff',
    marginTop: 8,
    fontSize: 14,
  },
});
