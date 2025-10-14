'use client';

import AnalyticsVisualization from '@/components/admin/AnalyticsVisualization';
import { useToast } from '@/components/ui/toast';
import { useSocket } from '@/providers/SocketProvider';
import { api } from '@/services/api';
import { logger } from '@pawfectmatch/core';
import { useCallback, useEffect, useState } from 'react';

interface AnalyticsData {
  users: {
    total: number;
    active: number;
    suspended: number;
    banned: number;
    verified: number;
    recent24h: number;
    growth: number;
    trend: 'up' | 'down' | 'stable';
  };
  pets: {
    total: number;
    active: number;
    recent24h: number;
    growth: number;
    trend: 'up' | 'down' | 'stable';
  };
  matches: {
    total: number;
    active: number;
    blocked: number;
    recent24h: number;
    growth: number;
    trend: 'up' | 'down' | 'stable';
  };
  messages: {
    total: number;
    deleted: number;
    recent24h: number;
    growth: number;
    trend: 'up' | 'down' | 'stable';
  };
  engagement: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    averageSessionDuration: number;
    bounceRate: number;
    retentionRate: number;
  };
  revenue: {
    totalRevenue: number;
    monthlyRecurringRevenue: number;
    averageRevenuePerUser: number;
    conversionRate: number;
    churnRate: number;
  };
  timeSeries: Array<{
    date: string;
    users: number;
    pets: number;
    matches: number;
    messages: number;
    revenue: number;
    engagement: number;
  }>;
  topPerformers: Array<{
    id: string;
    name: string;
    type: 'user' | 'pet';
    score: number;
    metric: string;
  }>;
  geographicData: Array<{
    country: string;
    users: number;
    revenue: number;
    growth: number;
  }>;
  deviceStats: Array<{
    device: string;
    count: number;
    percentage: number;
  }>;
  securityMetrics: {
    totalAlerts: number;
    criticalAlerts: number;
    resolvedAlerts: number;
    averageResponseTime: number;
  };
}

export default function AnalyticsPage() {
  const toast = useToast();
  const socket = useSocket();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [autoRefresh, setAutoRefresh] = useState(true);

  /**
   * Fetch analytics data from real API
   */
  const fetchAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await api.request<{ success: boolean; analytics: AnalyticsData }>(`/admin/analytics?timeRange=${timeRange}`, {
        method: 'GET',
      });

      if (response.success && response.analytics) {
        setAnalyticsData(response.analytics);
        logger.info('Analytics data loaded', { timeRange });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      logger.error('Failed to fetch analytics', { error });
      toast.error('Analytics Load Failed', 'Unable to load analytics data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [timeRange, toast]);

  /**
   * Handle manual refresh
   */
  const handleRefresh = useCallback(() => {
    logger.info('Manually refreshing analytics...');
    toast.info('Refreshing Data', 'Loading latest analytics...');
    void fetchAnalytics();
  }, [fetchAnalytics, toast]);

  /**
   * Handle data export
   */
  const handleExport = useCallback(async (format: 'csv' | 'pdf' | 'json') => {
    try {
      logger.info(`Exporting analytics in ${format} format...`);
      toast.info('Preparing Export', `Generating ${format.toUpperCase()} file...`);

      // For blob responses, use fetch directly
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env['NEXT_PUBLIC_API_URL']}/admin/analytics/export?format=${format}&timeRange=${timeRange}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Export Complete', `Analytics exported as ${format.toUpperCase()}`);
    } catch (error) {
      logger.error('Export failed', { error, format });
      toast.error('Export Failed', 'Unable to export analytics data.');
    }
  }, [timeRange, toast]);

  /**
   * Handle time range change
   */
  const handleTimeRangeChange = useCallback((newRange: '7d' | '30d' | '90d' | '1y') => {
    setTimeRange(newRange);
    logger.info('Time range changed', { newRange });
  }, []);

  /**
   * Initial data load
   */
  useEffect(() => {
    void fetchAnalytics();
  }, [fetchAnalytics]);

  /**
   * Auto-refresh every 30 seconds if enabled
   */
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      logger.info('Auto-refreshing analytics...');
      void fetchAnalytics();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, fetchAnalytics]);

  /**
   * Real-time Socket.io updates
   * Note: Direct socket events not exposed in SocketContext
   * Auto-refresh handles real-time updates instead
   */
  useEffect(() => {
    if (!socket?.socket) return;

    const rawSocket = socket.socket;

    const handleAnalyticsUpdate = (data: Partial<AnalyticsData>) => {
      logger.info('Received real-time analytics update', { keys: Object.keys(data) });
      setAnalyticsData((prev) => (prev ? { ...prev, ...data } : null));
      toast.info('Live Update', 'Analytics refreshed with latest data');
    };

    rawSocket.on('analytics:update', handleAnalyticsUpdate);

    return () => {
      rawSocket.off('analytics:update', handleAnalyticsUpdate);
    };
  }, [socket, toast]);

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Real-time insights and performance metrics
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => handleTimeRangeChange(e.target.value as '7d' | '30d' | '90d' | '1y')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            aria-label="Select time range"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>

          {/* Auto-refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${autoRefresh
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            aria-label={autoRefresh ? 'Disable auto-refresh' : 'Enable auto-refresh'}
          >
            {autoRefresh ? '🔄 Auto' : '⏸️ Manual'}
          </button>
        </div>
      </div>

      {/* Analytics Visualization */}
      {analyticsData ? (
        <AnalyticsVisualization
          data={analyticsData as unknown as Record<string, unknown>}
          isLoading={isLoading}
          onRefresh={handleRefresh}
          onExport={handleExport}
        />
      ) : (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Loading analytics data...</p>
          </div>
        </div>
      )}
    </div>
  );
}
