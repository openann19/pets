'use client';

import { ChartBarIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

/**
 * Enhanced Analytics Visualization Component
 * Displays comprehensive charts and metrics for admin dashboard with real-time updates
 */
export default function AnalyticsVisualization({
  data,
  isLoading = false,
  onRefresh = () => {},
  onExport = () => {},
}) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('users');
  const [isRealTime, setIsRealTime] = useState(false);

  useEffect(() => {
    if (isRealTime) {
      const interval = setInterval(() => {
        onRefresh();
      }, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isRealTime, onRefresh]);

  if (!data) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="text-center">
          <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No analytics data available</p>
        </div>
      </div>
    );
  }

  const {
    users,
    pets,
    matches,
    messages,
    engagement,
    revenue,
    timeSeries,
    topPerformers,
    geographicData,
    deviceStats,
  } = data;

  // Helper function to get trend icon
  const getTrendIcon = (trend) => {
    if (trend === 'up') return <TrendingUpIcon className="h-4 w-4 text-green-500" />;
    if (trend === 'down') return <TrendingDownIcon className="h-4 w-4 text-red-500" />;
    return <span className="h-4 w-4 text-gray-400">—</span>;
  };

  // Helper function to get trend color
  const getTrendColor = (trend) => {
    if (trend === 'up') return 'text-green-600 dark:text-green-400';
    if (trend === 'down') return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Time Range:
              </label>
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Metric:
              </label>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="users">Users</option>
                <option value="pets">Pets</option>
                <option value="matches">Matches</option>
                <option value="messages">Messages</option>
                <option value="revenue">Revenue</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isRealTime}
                onChange={(e) => setIsRealTime(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Real-time updates
              </span>
            </label>

            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </button>

            <button
              onClick={() => onExport('csv')}
              className="px-3 py-1 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700 transition-colors"
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* User Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <UsersIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {users.total.toLocaleString()}
                </p>
              </div>
            </div>
            <div className={`flex items-center ${getTrendColor(users.trend)}`}>
              {getTrendIcon(users.trend)}
              <span className="ml-1 text-sm font-medium">{users.growth}%</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Active</p>
              <p className="font-semibold">{users.active.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">New (24h)</p>
              <p className="font-semibold">{users.recent24h.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>

        {/* Pet Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <HeartIcon className="h-8 w-8 text-pink-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Pets</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {pets.total.toLocaleString()}
                </p>
              </div>
            </div>
            <div className={`flex items-center ${getTrendColor(pets.trend)}`}>
              {getTrendIcon(pets.trend)}
              <span className="ml-1 text-sm font-medium">{pets.growth}%</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Active</p>
              <p className="font-semibold">{pets.active.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">New (24h)</p>
              <p className="font-semibold">{pets.recent24h.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>

        {/* Match Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <HeartIcon className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Matches
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {matches.total.toLocaleString()}
                </p>
              </div>
            </div>
            <div className={`flex items-center ${getTrendColor(matches.trend)}`}>
              {getTrendIcon(matches.trend)}
              <span className="ml-1 text-sm font-medium">{matches.growth}%</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Active</p>
              <p className="font-semibold">{matches.active.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">New (24h)</p>
              <p className="font-semibold">{matches.recent24h.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>

        {/* Revenue Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${revenue.totalRevenue.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>MRR: ${revenue.monthlyRecurringRevenue.toLocaleString()}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">ARPU</p>
              <p className="font-semibold">${revenue.averageRevenuePerUser}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Conversion</p>
              <p className="font-semibold">{revenue.conversionRate}%</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Metrics */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <EyeIcon className="h-5 w-5 mr-2" />
            Engagement Metrics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Daily Active Users</span>
              <span className="font-semibold">{engagement.dailyActiveUsers.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Weekly Active Users</span>
              <span className="font-semibold">{engagement.weeklyActiveUsers.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Active Users</span>
              <span className="font-semibold">
                {engagement.monthlyActiveUsers.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Avg Session Duration</span>
              <span className="font-semibold">{engagement.averageSessionDuration} min</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Bounce Rate</span>
              <span className="font-semibold">{engagement.bounceRate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Retention Rate</span>
              <span className="font-semibold">{engagement.retentionRate}%</span>
            </div>
          </div>
        </div>

        {/* Device Statistics */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <DevicePhoneMobileIcon className="h-5 w-5 mr-2" />
            Device Statistics
          </h3>
          <div className="space-y-4">
            {deviceStats?.map((device, index) => (
              <div
                key={device.device}
                className="space-y-2"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    {device.device === 'Mobile' && (
                      <DevicePhoneMobileIcon className="h-4 w-4 mr-2" />
                    )}
                    {device.device === 'Desktop' && (
                      <ComputerDesktopIcon className="h-4 w-4 mr-2" />
                    )}
                    {device.device === 'Tablet' && <DeviceTabletIcon className="h-4 w-4 mr-2" />}
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {device.device}
                    </span>
                  </div>
                  <span className="font-semibold">{device.count.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${device.percentage}%` }}
                  ></div>
                </div>
                <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                  {device.percentage}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performers */}
      {topPerformers && topPerformers.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Top Performers</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2">Name</th>
                  <th className="text-left py-2">Type</th>
                  <th className="text-left py-2">Metric</th>
                  <th className="text-left py-2">Score</th>
                </tr>
              </thead>
              <tbody>
                {topPerformers.map((performer, index) => (
                  <tr
                    key={performer.id}
                    className="border-b border-gray-100 dark:border-gray-700"
                  >
                    <td className="py-2 font-medium">{performer.name}</td>
                    <td className="py-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          performer.type === 'user'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
                        }`}
                      >
                        {performer.type}
                      </span>
                    </td>
                    <td className="py-2 text-gray-600 dark:text-gray-400">{performer.metric}</td>
                    <td className="py-2 font-semibold">{performer.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
