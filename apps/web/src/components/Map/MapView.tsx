import React, { useEffect, useState, useMemo, memo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, Polyline } from 'react-leaflet';
import L, { LatLngExpression, Icon, DivIcon } from 'leaflet';
import { io, Socket } from 'socket.io-client';
// import { PulsePin } from '@pawfectmatch/core/types/realtime';
import { useAuthStore } from '../../lib/auth-store';
import { motion, AnimatePresence } from 'framer-motion';
// import { SPRING_CONFIG } from '@pawfectmatch/core/constants/animations';
const SPRING_CONFIG = { type: "spring", stiffness: 260, damping: 20 };
import { HeartIcon, ChatBubbleLeftRightIcon, MapPinIcon } from '@heroicons/react/24/solid';
import LoadingSpinner from '../UI/LoadingSpinner';
import 'leaflet/dist/leaflet.css';
// Local dev stub for PulsePin type (remove when shared types are available)
type PulsePin = {
  _id: string;
  petId: string;
  ownerId: string;
  coordinates: [number, number]; // [lng, lat]
  activity: 'walking' | 'playing' | 'grooming' | 'vet' | 'park' | 'other';
  message?: string;
  createdAt: string;
};
// Enhanced icon system with activity-based styling
const createActivityIcon = (activity: string, isMatch: boolean = false) => {
  const activityIcons: Record<string, string> = {
    walking: '🚶',
    playing: '🎾',
    grooming: '✂️',
    vet: '🏥',
    park: '🏞️',
    other: '📍'
  };

  const colors: Record<string, string> = {
    walking: '#3B82F6',
    playing: '#10B981',
    grooming: '#8B5CF6',
    vet: '#EF4444',
    park: '#059669',
    other: '#6B7280'
  };

  const emoji = activityIcons[activity] || '📍';
  const color = colors[activity] || '#6B7280';
  const borderColor = isMatch ? '#EC4899' : color;

  return new DivIcon({
    html: `
      <div style="
        width: 40px;
        height: 40px;
        background: ${color};
        border: 3px solid ${borderColor};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: pulse 2s infinite;
      ">
        ${emoji}
      </div>
      <style>
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      </style>
    `,
    className: 'custom-div-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
};

interface AnimatedMarkerProps {
  pin: PulsePin;
  isMatch?: boolean;
  onMarkerClick?: (pin: PulsePin) => void;
}

const AnimatedMarker: React.FC<AnimatedMarkerProps> = memo(({ pin, isMatch = false, onMarkerClick }) => {
  const [isNew, setIsNew] = useState(true);
  const [showTrail, setShowTrail] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsNew(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleMarkerClick = useCallback(() => {
    onMarkerClick?.(pin);
    setShowTrail(!showTrail);
  }, [pin, onMarkerClick, showTrail]);

  const activityLabels: Record<string, string> = {
    walking: 'Taking a walk',
    playing: 'Playing around',
    grooming: 'Getting groomed',
    vet: 'At the vet',
    park: 'At the dog park',
    other: 'Active nearby'
  };

  return (
    <>
      <Marker
        position={[pin.coordinates[1], pin.coordinates[0]] as LatLngExpression}
        icon={createActivityIcon(pin.activity, isMatch)}
        eventHandlers={{
          click: handleMarkerClick
        }}
      >
        <Popup className="custom-popup">
          <div className="p-3 min-w-[200px]">
            <div className="flex items-center space-x-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${
                isMatch ? 'bg-pink-500' : 'bg-blue-500'
              }`} />
              <strong className="text-gray-900">
                {activityLabels[pin.activity] || pin.activity}
              </strong>
            </div>
            
            {pin.message && (
              <p className="text-sm text-gray-600 mb-2">{pin.message}</p>
            )}
            
            <div className="text-xs text-gray-500 mb-3">
              {new Date(pin.createdAt).toLocaleTimeString()}
            </div>
            
            {isMatch && (
              <div className="flex space-x-2">
                <button className="flex items-center space-x-1 px-2 py-1 bg-pink-100 text-pink-700 rounded-full text-xs hover:bg-pink-200 transition-colors">
                  <HeartIcon className="w-3 h-3" />
                  <span>Like</span>
                </button>
                <button className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs hover:bg-blue-200 transition-colors">
                  <ChatBubbleLeftRightIcon className="w-3 h-3" />
                  <span>Chat</span>
                </button>
              </div>
            )}
          </div>
        </Popup>
      </Marker>
      
      {/* Activity radius circle */}
      <Circle
        center={[pin.coordinates[1], pin.coordinates[0]] as LatLngExpression}
        radius={100}
        pathOptions={{
          color: isMatch ? '#EC4899' : '#3B82F6',
          fillColor: isMatch ? '#EC4899' : '#3B82F6',
          fillOpacity: 0.1,
          weight: 2,
          opacity: 0.6
        }}
      />
      
      {/* New pin animation */}
      {isNew && (
        <Circle
          center={[pin.coordinates[1], pin.coordinates[0]] as LatLngExpression}
          radius={200}
          pathOptions={{
            color: '#10B981',
            fillColor: '#10B981',
            fillOpacity: 0.2,
            weight: 3,
            opacity: 0.8
          }}
        />
      )}
    </>
  );
});

AnimatedMarker.displayName = 'AnimatedMarker'; // For React dev tools

interface AutoCenterProps {
  pins: PulsePin[];
}

const AutoCenter: React.FC<AutoCenterProps> = ({ pins }) => {
  const map = useMap();

  useEffect(() => {
    if (pins.length === 0) return;
    const bounds = L.latLngBounds(
      pins.map((p) => [p.coordinates[1], p.coordinates[0]] as LatLngExpression)
    );
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 }); // Cap zoom for usability
  }, [pins, map]);

  return null;
};

interface MapViewProps {
  filters?: {
    showMyPets: boolean;
    showMatches: boolean;
    showNearby: boolean;
    activityTypes: string[];
    radius: number;
  };
}

const MapView: React.FC<MapViewProps> = ({ filters }) => {
  const [pins, setPins] = useState<PulsePin[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedPin, setSelectedPin] = useState<PulsePin | null>(null);
  const [heatmapData, setHeatmapData] = useState<Array<[number, number, number]>>([]);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.warn('Geolocation error:', error);
          // Fallback to NYC
          setUserLocation([40.75, -73.98]);
        }
      );
    } else {
      setUserLocation([40.75, -73.98]);
    }
  }, []);

  // Socket connection with enhanced features
  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5678/pulse';
    const socket: Socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true
    });

    socket.on('connect', () => {
      console.log('MapView connected to enhanced pulse channel');
      // Request initial data
      socket.emit('request:initial-pins', { radius: filters?.radius || 5 });
    });

    socket.on('pin:update', (pin: PulsePin) => {
      setPins((prev) => {
        const updated = prev.filter((p) => p._id !== pin._id);
        return [...updated, pin].slice(-100); // Keep last 100 pins
      });
    });

    socket.on('pin:remove', (pinId: string) => {
      setPins((prev) => prev.filter((p) => p._id !== pinId));
    });

    socket.on('heatmap:update', (data: Array<[number, number, number]>) => {
      setHeatmapData(data);
    });

    // Simulate real-time data for demo
    const simulateData = () => {
      const activities = ['walking', 'playing', 'grooming', 'vet', 'park', 'other'];
      const messages = [
        'Having a great time!',
        'Beautiful weather today',
        'Made a new friend',
        'Feeling energetic',
        'Love this spot!'
      ];

      if (userLocation) {
        const mockPin: PulsePin = {
          _id: `mock-${Date.now()}`,
          petId: `pet-${Math.random()}`,
          ownerId: `owner-${Math.random()}`,
          coordinates: [
            userLocation[1] + (Math.random() - 0.5) * 0.02,
            userLocation[0] + (Math.random() - 0.5) * 0.02
          ],
          activity: activities[Math.floor(Math.random() * activities.length)] as any,
          message: Math.random() > 0.5 ? messages[Math.floor(Math.random() * messages.length)] : undefined,
          createdAt: new Date().toISOString()
        };

        setPins((prev) => [...prev, mockPin].slice(-50));
      }
    };

    const interval = setInterval(simulateData, 5000);

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, [userLocation, filters?.radius]);

  // Filter pins based on current filters
  const filteredPins = useMemo(() => {
    if (!filters) return pins;
    
    return pins.filter(pin => {
      if (!filters.activityTypes.includes(pin.activity)) return false;
      // Add more filtering logic here
      return true;
    });
  }, [pins, filters]);

  const handleMarkerClick = useCallback((pin: PulsePin) => {
    setSelectedPin(pin);
  }, []);

  const center: LatLngExpression = useMemo(() => {
    return userLocation || [40.75, -73.98];
  }, [userLocation]);

  if (!userLocation) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-2xl">
        <div className="text-center">
          <LoadingSpinner size="large" color="#EC4899" className="mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={center}
        zoom={13}
        className="h-full w-full rounded-2xl overflow-hidden shadow-lg"
        aria-label="Interactive map of pet locations"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User location marker */}
        {userLocation && (
          <Marker
            position={userLocation as LatLngExpression}
            icon={new DivIcon({
              html: `
                <div style="
                  width: 20px;
                  height: 20px;
                  background: #EC4899;
                  border: 3px solid white;
                  border-radius: 50%;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                ">
                </div>
              `,
              className: 'user-location-icon',
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            })}
          >
            <Popup>
              <div className="text-center">
                <strong>Your Location</strong>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Pet activity pins */}
        {filteredPins.map((pin) => (
          <AnimatedMarker
            key={pin._id}
            pin={pin}
            isMatch={Math.random() > 0.7} // Simulate matches
            onMarkerClick={handleMarkerClick}
          />
        ))}
        
        <AutoCenter pins={filteredPins} />
      </MapContainer>
      
      {/* Custom zoom controls */}
      <div className="absolute top-4 left-4 z-[1000] space-y-2">
        <button className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-200">
          <MapPinIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>
    </div>
  );
};

export default MapView;