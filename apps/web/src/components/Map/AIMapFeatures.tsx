'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HeartIcon,
  SparklesIcon,
  MapPinIcon,
  ClockIcon,
  CloudIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline';
// import { _useAuthStore } from '../../stores/auth-store';

interface AIInsight {
  id: string;
  type: 'hotspot' | 'timing' | 'weather' | 'safety' | 'match' | 'activity';
  title: string;
  description: string;
  confidence: number;
  location?: { lat: number; lng: number };
  actionable: boolean;
  priority: 'low' | 'medium' | 'high';
  icon: string;
  color: string;
}

interface PinData {
  id: string;
  coordinates: [number, number];
  activity: string;
  message?: string;
  createdAt: string;
}

interface AIMapFeaturesProps {
  pins: PinData[];
  userLocation: { latitude: number; longitude: number } | null;
  onInsightClick?: (insight: AIInsight) => void;
}

interface HotspotData {
  count: number;
  center: { lat: number; lng: number };
  pins: PinData[];
}

interface OptimalTime {
  start: string;
  end: string;
  activities: number;
}

const AIMapFeatures = ({ pins, userLocation, onInsightClick }: AIMapFeaturesProps): React.JSX.Element => {
  // const { user } = _useAuthStore(); // Currently unused
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showInsights, setShowInsights] = useState(true);

  // AI Analysis Engine
  const analyzeMapData = useCallback(async () => {
    if (!pins.length || !userLocation) return;

    setIsAnalyzing(true);

    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const newInsights: AIInsight[] = [];

    // 1. Hotspot Analysis
    const hotspots = findActivityHotspots(pins);
    hotspots.forEach((hotspot, index) => {
      newInsights.push({
        id: `hotspot-${index}`,
        type: 'hotspot',
        title: 'Popular Pet Area Detected',
        description: `High activity zone with ${hotspot.count} recent activities. Great for socializing!`,
        confidence: Math.min(hotspot.count / 10, 1),
        location: hotspot.center,
        actionable: true,
        priority: hotspot.count > 5 ? 'high' : 'medium',
        icon: '🔥',
        color: '#EF4444',
      });
    });

    // 2. Optimal Timing Analysis
    const optimalTimes = analyzeOptimalTimes(pins);
    if (optimalTimes.length > 0) {
      const firstOptimalTime = optimalTimes[0]!;
      newInsights.push({
        id: 'timing-optimal',
        type: 'timing',
        title: 'Best Times for Pet Activities',
        description: `Peak activity between ${firstOptimalTime.start}-${firstOptimalTime.end}. ${firstOptimalTime.activities} pets typically active.`,
        confidence: 0.85,
        actionable: true,
        priority: 'medium',
        icon: '⏰',
        color: '#3B82F6',
      });
    }

    // 3. Match Probability Analysis
    const matchInsights = analyzeMatchProbability(pins, userLocation);
    matchInsights.forEach((insight) => newInsights.push(insight));

    // 4. Safety Analysis
    const safetyInsights = analyzeSafetyFactors(pins, userLocation);
    safetyInsights.forEach((insight) => newInsights.push(insight));

    // 5. Activity Recommendations
    const activityRecs = generateActivityRecommendations(pins);
    activityRecs.forEach((rec) => newInsights.push(rec));

    setInsights(newInsights);
    setIsAnalyzing(false);
  }, [pins, userLocation]);

  // Hotspot Detection Algorithm
  const findActivityHotspots = (pinData: PinData[]): HotspotData[] => {
    const gridSize = 0.005; // ~500m grid
    const grid = new Map<string, { count: number; pins: PinData[]; lat: number; lng: number }>();

    pinData.forEach((pin) => {
      const gridX = Math.floor(pin.coordinates[0] / gridSize);
      const gridY = Math.floor(pin.coordinates[1] / gridSize);
      const key = `${gridX},${gridY}`;

      if (!grid.has(key)) {
        grid.set(key, { count: 0, pins: [], lat: 0, lng: 0 });
      }

      const cell = grid.get(key)!;
      cell.count++;
      cell.pins.push(pin);
      cell.lat += pin.coordinates[1];
      cell.lng += pin.coordinates[0];
    });

    return Array.from(grid.values())
      .filter((cell) => cell.count >= 3)
      .map((cell) => ({
        count: cell.count,
        center: {
          lat: cell.lat / cell.count,
          lng: cell.lng / cell.count,
        },
        pins: cell.pins,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  };

  // Optimal Timing Analysis
  const analyzeOptimalTimes = (pinData: PinData[]): OptimalTime[] => {
    const hourCounts = new Array(24).fill(0);

    pinData.forEach((pin) => {
      const hour = new Date(pin.createdAt).getHours();
      hourCounts[hour]++;
    });

    const peakHours = hourCounts
      .map((count, hour) => ({ hour, count }))
      .filter((h) => h.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    if (peakHours.length === 0 || !peakHours[0] || peakHours[0].count < 2) return [];

    return [
      {
        start: `${peakHours[0].hour}:00`,
        end: `${(peakHours[0].hour + 2) % 24}:00`,
        activities: peakHours[0].count,
      },
    ];
  };

  // Match Probability Analysis
  const analyzeMatchProbability = (pinData: PinData[], userLoc: { latitude: number; longitude: number }): AIInsight[] => {
    const nearbyPins = pinData.filter((pin) => {
      const distance = calculateDistance(
        userLoc.latitude,
        userLoc.longitude,
        pin.coordinates[1],
        pin.coordinates[0]
      );
      return distance < 5; // Within 5km
    });

    if (nearbyPins.length < 2) return [];

    return [
      {
        id: 'match-probability',
        type: 'match',
        title: 'High Match Potential Nearby',
        description: `${nearbyPins.length} potential matches within 5km. Perfect for local meetups!`,
        confidence: 0.75,
        actionable: true,
        priority: 'high',
        icon: '💕',
        color: '#EC4899',
      },
    ];
  };

  // Safety Analysis
  const analyzeSafetyFactors = (pinData: PinData[], userLoc: { latitude: number; longitude: number }): AIInsight[] => {
    const insights: AIInsight[] = [];

    // Check for crowded areas
    const nearbyActivity = pinData.filter((pin) => {
      const distance = calculateDistance(
        userLoc.latitude,
        userLoc.longitude,
        pin.coordinates[1],
        pin.coordinates[0]
      );
      return distance < 1; // Within 1km
    });

    if (nearbyActivity.length > 10) {
      insights.push({
        id: 'safety-crowded',
        type: 'safety',
        title: 'High Activity Area',
        description: 'This area sees heavy pet traffic. Great for socialization, but keep an eye on your pet.',
        confidence: 0.9,
        actionable: true,
        priority: 'medium',
        icon: '⚠️',
        color: '#F59E0B',
      });
    }

    return insights;
  };

  // Activity Recommendations
  const generateActivityRecommendations = (pinData: PinData[]): AIInsight[] => {
    const insights: AIInsight[] = [];

    const activityCounts = pinData.reduce((acc, pin) => {
      acc[pin.activity] = (acc[pin.activity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topActivity = Object.entries(activityCounts)
      .sort(([, a], [, b]) => b - a)[0];

    if (topActivity && topActivity[1] > 3) {
      insights.push({
        id: 'activity-recommendation',
        type: 'activity',
        title: 'Popular Activity',
        description: `${topActivity[0]} is trending in your area! ${topActivity[1]} recent activities.`,
        confidence: 0.8,
        actionable: true,
        priority: 'low',
        icon: '🎯',
        color: '#10B981',
      });
    }

    return insights;
  };

  // Helper: Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    analyzeMapData();
  }, [analyzeMapData]);

  // Icon mapping
  const getIconComponent = (type: AIInsight['type']) => {
    const icons = {
      hotspot: MapPinIcon,
      timing: ClockIcon,
      weather: CloudIcon,
      safety: ExclamationTriangleIcon,
      match: HeartIcon,
      activity: LightBulbIcon,
    };
    return icons[type] || SparklesIcon;
  };

  // Priority sorting
  const sortedInsights = useMemo(() => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return [...insights].sort(
      (a, b) =>
        priorityOrder[b.priority] - priorityOrder[a.priority] ||
        b.confidence - a.confidence
    );
  }, [insights]);

  if (!userLocation) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-600 text-sm">Enable location to see AI-powered insights</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SparklesIcon className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">AI Insights</h3>
        </div>
        <button
          onClick={() => setShowInsights(!showInsights)}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          {showInsights ? 'Hide' : 'Show'}
        </button>
      </div>

      {/* Loading State */}
      {isAnalyzing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-4"
        >
          <div className="inline-flex items-center gap-2 text-purple-600">
            <SparklesIcon className="h-5 w-5 animate-pulse" />
            <span className="text-sm">Analyzing patterns...</span>
          </div>
        </motion.div>
      )}

      {/* Insights List */}
      <AnimatePresence>
        {showInsights && !isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2"
          >
            {sortedInsights.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                Not enough data to generate insights yet
              </p>
            ) : (
              sortedInsights.map((insight) => {
                const IconComponent = getIconComponent(insight.type);
                return (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`
                      p-4 rounded-lg border-l-4 bg-white shadow-sm cursor-pointer
                      hover:shadow-md transition-shadow
                    `}
                    style={{ borderColor: insight.color }}
                    onClick={() => onInsightClick?.(insight)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <IconComponent className="h-5 w-5" style={{ color: insight.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium text-gray-900">{insight.title}</h4>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            {Math.round(insight.confidence * 100)}%
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                        {insight.actionable && (
                          <span className="inline-block mt-2 text-xs text-purple-600 font-medium">
                            → Take action
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIMapFeatures;
