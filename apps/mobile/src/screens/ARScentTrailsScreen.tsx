import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, CameraType } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import Svg, { Path, Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../contexts/ThemeContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ScentTrail {
  id: string;
  petName: string;
  petType: 'dog' | 'cat';
  path: { x: number; y: number }[];
  timestamp: string;
  intensity: number; // 0-1
  color: string;
  isActive: boolean;
}

interface ARScentTrailsScreenProps {
  navigation: any;
  route?: {
    params?: {
      initialLocation?: { latitude: number; longitude: number };
    };
  };
}

export default function ARScentTrailsScreen({ navigation, route }: ARScentTrailsScreenProps) {
  const { isDark, colors } = useTheme();
  
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState(CameraType.back);
  const [isScanning, setIsScanning] = useState(true);
  const [trails, setTrails] = useState<ScentTrail[]>([]);
  const [selectedTrail, setSelectedTrail] = useState<ScentTrail | null>(null);
  const [scanProgress, setScanProgress] = useState(0);

  // Animation refs
  const scanAnimation = useRef(new Animated.Value(0)).current;
  const trailAnimations = useRef<{ [key: string]: Animated.Value }>({}).current;
  const pulseAnimation = useRef(new Animated.Value(0)).current;
  const fadeInAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    requestCameraPermission();
    initializeTrails();
    startAnimations();
    
    StatusBar.setBarStyle('light-content');
    
    return () => {
      StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content');
    };
  }, []);

  const requestCameraPermission = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission Required',
          'AR Scent Trails needs camera access to overlay scent paths on the real world.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Grant Permission', onPress: requestCameraPermission }
          ]
        );
      }
    } catch (error) {
      console.error('Camera permission error:', error);
      setHasPermission(false);
    }
  };

  const initializeTrails = () => {
    // Simulate discovering scent trails
    const mockTrails: ScentTrail[] = [
      {
        id: 'trail_1',
        petName: 'Luna',
        petType: 'dog',
        path: [
          { x: screenWidth * 0.1, y: screenHeight * 0.8 },
          { x: screenWidth * 0.3, y: screenHeight * 0.6 },
          { x: screenWidth * 0.5, y: screenHeight * 0.4 },
          { x: screenWidth * 0.7, y: screenHeight * 0.3 },
          { x: screenWidth * 0.9, y: screenHeight * 0.2 },
        ],
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
        intensity: 0.8,
        color: '#FF69B4',
        isActive: true,
      },
      {
        id: 'trail_2',
        petName: 'Buddy',
        petType: 'dog',
        path: [
          { x: screenWidth * 0.2, y: screenHeight * 0.9 },
          { x: screenWidth * 0.4, y: screenHeight * 0.7 },
          { x: screenWidth * 0.6, y: screenHeight * 0.5 },
          { x: screenWidth * 0.8, y: screenHeight * 0.4 },
        ],
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        intensity: 0.6,
        color: '#4ECDC4',
        isActive: false,
      },
      {
        id: 'trail_3',
        petName: 'Max',
        petType: 'cat',
        path: [
          { x: screenWidth * 0.15, y: screenHeight * 0.7 },
          { x: screenWidth * 0.25, y: screenHeight * 0.5 },
          { x: screenWidth * 0.45, y: screenHeight * 0.3 },
          { x: screenWidth * 0.65, y: screenHeight * 0.25 },
          { x: screenWidth * 0.85, y: screenHeight * 0.15 },
        ],
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
        intensity: 0.4,
        color: '#FFD700',
        isActive: false,
      },
    ];

    // Initialize animations for each trail
    mockTrails.forEach(trail => {
      trailAnimations[trail.id] = new Animated.Value(0);
    });

    setTrails(mockTrails);
  };

  const startAnimations = () => {
    // Fade in animation
    Animated.timing(fadeInAnimation, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Scanning animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanAnimation, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Staggered trail animations
    trails.forEach((trail, index) => {
      setTimeout(() => {
        Animated.timing(trailAnimations[trail.id], {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }).start();
      }, index * 500);
    });
  };

  const startScanning = useCallback(() => {
    setIsScanning(true);
    setScanProgress(0);
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Simulate scanning progress
    const progressInterval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsScanning(false);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          return 100;
        }
        return prev + 2;
      });
    }, 50);
  }, []);

  const selectTrail = useCallback((trail: ScentTrail) => {
    setSelectedTrail(trail);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Animate trail selection
    Animated.sequence([
      Animated.timing(trailAnimations[trail.id], {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(trailAnimations[trail.id], {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [trailAnimations]);

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`;
    } else {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    }
  };

  const generateSVGPath = (points: { x: number; y: number }[]) => {
    if (points.length < 2) return '';
    
    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      const prevPoint = points[i - 1];
      const currentPoint = points[i];
      
      // Create smooth curves using quadratic bezier
      const controlX = (prevPoint.x + currentPoint.x) / 2;
      const controlY = (prevPoint.y + currentPoint.y) / 2;
      
      path += ` Q ${controlX} ${controlY} ${currentPoint.x} ${currentPoint.y}`;
    }
    
    return path;
  };

  const renderScentTrails = () => {
    return (
      <Svg style={StyleSheet.absoluteFillObject} width={screenWidth} height={screenHeight}>
        <Defs>
          {trails.map(trail => (
            <SvgLinearGradient key={`gradient-${trail.id}`} id={`gradient-${trail.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor={trail.color} stopOpacity={trail.intensity * 0.8} />
              <Stop offset="50%" stopColor={trail.color} stopOpacity={trail.intensity} />
              <Stop offset="100%" stopColor={trail.color} stopOpacity={trail.intensity * 0.3} />
            </SvgLinearGradient>
          ))}
        </Defs>
        
        {trails.map((trail, index) => {
          const pathData = generateSVGPath(trail.path);
          const animatedValue = trailAnimations[trail.id] || new Animated.Value(0);
          
          return (
            <Animated.View key={trail.id} style={{ opacity: animatedValue }}>
              <Path
                d={pathData}
                stroke={`url(#gradient-${trail.id})`}
                strokeWidth={trail.isActive ? 6 : 4}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={trail.isActive ? undefined : "10,5"}
              />
              
              {/* Trail points */}
              {trail.path.map((point, pointIndex) => (
                <Circle
                  key={`${trail.id}-point-${pointIndex}`}
                  cx={point.x}
                  cy={point.y}
                  r={trail.isActive && pointIndex === trail.path.length - 1 ? 8 : 4}
                  fill={trail.color}
                  opacity={trail.intensity}
                  onPress={() => selectTrail(trail)}
                />
              ))}
            </Animated.View>
          );
        })}
      </Svg>
    );
  };

  const renderScanningOverlay = () => {
    if (!isScanning) return null;

    const scanLineY = scanAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [screenHeight * 0.2, screenHeight * 0.8],
    });

    return (
      <Animated.View style={styles.scanningOverlay}>
        <Animated.View 
          style={[
            styles.scanLine,
            {
              transform: [{ translateY: scanLineY }],
            },
          ]}
        >
          <LinearGradient
            colors={['transparent', '#00FF88', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.scanLineGradient}
          />
        </Animated.View>
        
        <View style={styles.scanningInfo}>
          <BlurView intensity={20} style={styles.scanningInfoBlur}>
            <Text style={styles.scanningText}>Scanning for scent trails...</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${scanProgress}%` }]} />
            </View>
            <Text style={styles.progressText}>{scanProgress}%</Text>
          </BlurView>
        </View>
      </Animated.View>
    );
  };

  const renderTrailInfo = () => {
    if (!selectedTrail) return null;

    return (
      <Animated.View style={[styles.trailInfo, { opacity: fadeInAnimation }]}>
        <BlurView intensity={30} style={styles.trailInfoBlur}>
          <View style={styles.trailInfoHeader}>
            <View style={[styles.trailColorDot, { backgroundColor: selectedTrail.color }]} />
            <View style={styles.trailInfoText}>
              <Text style={styles.trailPetName}>{selectedTrail.petName}'s Trail</Text>
              <Text style={styles.trailTimestamp}>{formatTimeAgo(selectedTrail.timestamp)}</Text>
            </View>
            <TouchableOpacity
              style={styles.closeTrailInfo}
              onPress={() => setSelectedTrail(null)}
            >
              <Ionicons name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.trailStats}>
            <View style={styles.trailStat}>
              <Text style={styles.trailStatLabel}>Intensity</Text>
              <View style={styles.intensityBar}>
                <View 
                  style={[
                    styles.intensityFill, 
                    { 
                      width: `${selectedTrail.intensity * 100}%`,
                      backgroundColor: selectedTrail.color 
                    }
                  ]} 
                />
              </View>
            </View>
            
            <View style={styles.trailStat}>
              <Text style={styles.trailStatLabel}>Status</Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: selectedTrail.isActive ? '#4CAF50' : '#FF9800' }
              ]}>
                <Text style={styles.statusText}>
                  {selectedTrail.isActive ? 'Active' : 'Fading'}
                </Text>
              </View>
            </View>
          </View>
        </BlurView>
      </Animated.View>
    );
  };

  if (hasPermission === null) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={64} color="#666" />
        <Text style={styles.permissionText}>Camera access is required for AR features</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestCameraPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera View */}
      <Camera style={styles.camera} type={cameraType}>
        {/* AR Overlay */}
        <Animated.View style={[styles.arOverlay, { opacity: fadeInAnimation }]}>
          {renderScentTrails()}
        </Animated.View>

        {/* Scanning Overlay */}
        {renderScanningOverlay()}

        {/* Header */}
        <SafeAreaView style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.goBack();
              }}
            >
              <BlurView intensity={20} style={styles.headerButtonBlur}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </BlurView>
            </TouchableOpacity>
            
            <View style={styles.headerTitle}>
              <Text style={styles.headerTitleText}>AR Scent Trails</Text>
              <Animated.View style={[styles.liveBadge, { opacity: pulseAnimation }]}>
                <Text style={styles.liveBadgeText}>LIVE</Text>
              </Animated.View>
            </View>

            <TouchableOpacity
              style={styles.scanButton}
              onPress={startScanning}
              disabled={isScanning}
            >
              <BlurView intensity={20} style={styles.headerButtonBlur}>
                <Ionicons 
                  name={isScanning ? "hourglass-outline" : "scan-outline"} 
                  size={24} 
                  color="#fff" 
                />
              </BlurView>
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* Trail Info Panel */}
        {renderTrailInfo()}

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => {
              setCameraType(
                cameraType === CameraType.back ? CameraType.front : CameraType.back
              );
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <BlurView intensity={20} style={styles.controlButtonBlur}>
              <Ionicons name="camera-reverse-outline" size={24} color="#fff" />
            </BlurView>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.centerButton}
            onPress={() => {
              // Center on user location or reset view
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }}
          >
            <LinearGradient
              colors={['#FF69B4', '#8B5CF6']}
              style={styles.centerButtonGradient}
            >
              <Ionicons name="locate-outline" size={28} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => {
              // Toggle AR mode or settings
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <BlurView intensity={20} style={styles.controlButtonBlur}>
              <Ionicons name="options-outline" size={24} color="#fff" />
            </BlurView>
          </TouchableOpacity>
        </View>
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  arOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  permissionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
  },
  permissionButton: {
    backgroundColor: '#FF69B4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  scanButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  headerButtonBlur: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 8,
  },
  liveBadge: {
    backgroundColor: '#FF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  liveBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  scanningOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
  },
  scanLineGradient: {
    flex: 1,
  },
  scanningInfo: {
    position: 'absolute',
    top: screenHeight * 0.3,
    left: 20,
    right: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  scanningInfoBlur: {
    padding: 16,
    alignItems: 'center',
  },
  scanningText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00FF88',
    borderRadius: 2,
  },
  progressText: {
    color: '#fff',
    fontSize: 14,
  },
  trailInfo: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    borderRadius: 16,
    overflow: 'hidden',
    zIndex: 10,
  },
  trailInfoBlur: {
    padding: 16,
  },
  trailInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  trailColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  trailInfoText: {
    flex: 1,
  },
  trailPetName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  trailTimestamp: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  closeTrailInfo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  trailStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  trailStat: {
    flex: 1,
    marginHorizontal: 4,
  },
  trailStatLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginBottom: 4,
  },
  intensityBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
  },
  intensityFill: {
    height: '100%',
    borderRadius: 3,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
    zIndex: 10,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  controlButtonBlur: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
  },
  centerButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
