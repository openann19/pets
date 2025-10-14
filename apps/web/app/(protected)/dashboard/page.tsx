'use client';

import { logger } from '@/services/logger';
import {
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  BoltIcon,
  CalendarDaysIcon,
  CalendarIcon,
  ChatBubbleLeftIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  EyeIcon,
  GlobeAltIcon,
  HeartIcon,
  SparklesIcon,
  TrophyIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidFill } from '@heroicons/react/24/solid';
import { useAuthStore } from '@pawfectmatch/core';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';

interface DashboardStats {
  matches: {
    total: number;
    new: number;
    active: number;
    trend: 'up' | 'down' | 'stable';
    percentage: number;
  };
  messages: {
    total: number;
    unread: number;
    sent: number;
    trend: 'up' | 'down' | 'stable';
    percentage: number;
  };
  profile: {
    views: number;
    likes: number;
    superLikes: number;
    trend: 'up' | 'down' | 'stable';
    percentage: number;
  };
  activity: {
    swipes: number;
    playdates: number;
    events: number;
    trend: 'up' | 'down' | 'stable';
    percentage: number;
  };
}

interface PackSuggestion {
  id: string;
  name: string;
  description: string;
  members: {
    id: string;
    name: string;
    avatar: string;
    compatibility: number;
  }[];
  activity: string;
  nextEvent?: {
    title: string;
    date: string;
    location: string;
  };
}

interface RecentActivity {
  id: string;
  type: 'match' | 'message' | 'like' | 'playdate' | 'event';
  title: string;
  description: string;
  timestamp: string;
  avatar?: string;
  action?: string;
}

interface NarrativeStats {
  title: string;
  description: string;
  highlight: string;
  trend: 'up' | 'down' | 'stable';
  color: string;
}

export default function ProtectedDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [packSuggestions, setPackSuggestions] = useState<PackSuggestion[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [narrativeStats, setNarrativeStats] = useState<NarrativeStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pulseData, setPulseData] = useState({
    heartbeat: 72,
    energy: 85,
    social: 78,
    happiness: 92,
  });

  const updatePulseData = useCallback(() => {
    setPulseData((prev) => ({
      heartbeat: Math.max(60, Math.min(100, prev.heartbeat + (Math.random() - 0.5) * 4)),
      energy: Math.max(70, Math.min(100, prev.energy + (Math.random() - 0.5) * 6)),
      social: Math.max(60, Math.min(100, prev.social + (Math.random() - 0.5) * 8)),
      happiness: Math.max(80, Math.min(100, prev.happiness + (Math.random() - 0.5) * 4)),
    }));
  }, []);

  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Load dashboard stats
      const statsResponse = await fetch('/api/dashboard/stats', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data);
      }

      // Load pack suggestions
      const packResponse = await fetch('/api/dashboard/pack-suggestions', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (packResponse.ok) {
        const packData = await packResponse.json();
        setPackSuggestions(packData.data);
      }

      // Load recent activity
      const activityResponse = await fetch('/api/dashboard/recent-activity', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        setRecentActivity(activityData.data);
      }

      // Generate narrative stats
      generateNarrativeStats();
    } catch (error) {
      logger.error('Failed to load dashboard data', { error });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateNarrativeStats = () => {
    const narratives: NarrativeStats[] = [
      {
        title: 'Your Social Butterfly Status',
        description: "You've been incredibly active in the community this week",
        highlight: '12 new connections',
        trend: 'up',
        color: 'text-pink-600',
      },
      {
        title: 'Playdate Champion',
        description: 'Your pets are becoming local celebrities',
        highlight: '3 successful playdates',
        trend: 'up',
        color: 'text-green-600',
      },
      {
        title: 'Message Master',
        description: "You're keeping conversations alive and thriving",
        highlight: '47 messages sent',
        trend: 'up',
        color: 'text-blue-600',
      },
    ];

    setNarrativeStats(narratives);
  };

  // Add useEffect to load data and set up pulse updates
  useEffect(() => {
    loadDashboardData();

    // Set up real-time updates
    const interval = setInterval(() => {
      updatePulseData();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [loadDashboardData, updatePulseData]);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />;
      case 'down':
        return <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'match':
        return <HeartSolidFill className="h-5 w-5 text-pink-500" />;
      case 'message':
        return <ChatBubbleLeftIcon className="h-5 w-5 text-blue-500" />;
      case 'like':
        return <HeartIcon className="h-5 w-5 text-red-500" />;
      case 'playdate':
        return <CalendarDaysIcon className="h-5 w-5 text-green-500" />;
      case 'event':
        return <GlobeAltIcon className="h-5 w-5 text-purple-500" />;
      default:
        return <SparklesIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-6"
                >
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
                  <div className="h-8 bg-gray-200 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName}! 🐾
          </h1>
          <p className="text-gray-600 text-lg">
            Here's what's happening in your pet's social world
          </p>
        </motion.div>

        {/* Pulse Dashboard */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-100 rounded-lg">
              <BoltIcon className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Live Pulse</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-1">
                {Math.round(pulseData.heartbeat)}
              </div>
              <div className="text-sm text-gray-600">Heartbeat</div>
              <div className="text-xs text-gray-500">BPM</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-1">
                {Math.round(pulseData.energy)}
              </div>
              <div className="text-sm text-gray-600">Energy</div>
              <div className="text-xs text-gray-500">Level</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {Math.round(pulseData.social)}
              </div>
              <div className="text-sm text-gray-600">Social</div>
              <div className="text-xs text-gray-500">Score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {Math.round(pulseData.happiness)}
              </div>
              <div className="text-sm text-gray-600">Happiness</div>
              <div className="text-xs text-gray-500">Index</div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats ? (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-pink-100 rounded-lg">
                    <HeartIcon className="h-6 w-6 text-pink-600" />
                  </div>
                  {getTrendIcon(stats.matches.trend)}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.matches.total}</div>
                <div className="text-sm text-gray-600 mb-1">Total Matches</div>
                <div className="text-xs text-gray-500">{stats.matches.new} new this week</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  {getTrendIcon(stats.messages.trend)}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.messages.total}</div>
                <div className="text-sm text-gray-600 mb-1">Messages</div>
                <div className="text-xs text-gray-500">{stats.messages.unread} unread</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <EyeIcon className="h-6 w-6 text-green-600" />
                  </div>
                  {getTrendIcon(stats.profile.trend)}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.profile.views}</div>
                <div className="text-sm text-gray-600 mb-1">Profile Views</div>
                <div className="text-xs text-gray-500">{stats.profile.likes} likes</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <CalendarIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  {getTrendIcon(stats.activity.trend)}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.activity.swipes}</div>
                <div className="text-sm text-gray-600 mb-1">Swipes Today</div>
                <div className="text-xs text-gray-500">{stats.activity.playdates} playdates</div>
              </motion.div>
            </>
          ) : null}
        </div>

        {/* Narrative Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <TrophyIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Your Achievements</h2>
          </div>

          <div className="space-y-4">
            {narrativeStats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">{stat.title}</h3>
                  <p className="text-sm text-gray-600">{stat.description}</p>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${stat.color}`}>{stat.highlight}</div>
                  {getTrendIcon(stat.trend)}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Pack Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Pack Suggestions</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {packSuggestions.map((pack, index) => (
              <motion.div
                key={pack.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-gray-900 mb-2">{pack.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{pack.description}</p>

                <div className="flex -space-x-2 mb-3">
                  {pack.members.map((member) => (
                    <div
                      key={member.id}
                      className="relative"
                    >
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-8 h-8 rounded-full border-2 border-white"
                      />
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white" />
                    </div>
                  ))}
                </div>

                {pack.nextEvent ? (
                  <div className="text-xs text-gray-500">
                    Next: {pack.nextEvent.title} on {pack.nextEvent.date}
                  </div>
                ) : null}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
          </div>

          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0 + index * 0.1 }}
                className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="p-2 bg-gray-100 rounded-lg">{getActivityIcon(activity.type)}</div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{activity.title}</h4>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(activity.timestamp).toLocaleTimeString()}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
