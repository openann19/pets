/**
 * 🛠️ COMPREHENSIVE ADMIN PANEL
 * Complete admin interface for managing PawfectMatch platform
 */

'use client';

import {
  UsersIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  CogIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  CloudIcon,
  ServerIcon,
  CircleStackIcon,
  KeyIcon,
  DocumentTextIcon,
  BellIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  CpuChipIcon,
  WifiIcon,
  BoltIcon,
  LockClosedIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect } from 'react';

import PremiumButton from '@/components/UI/PremiumButton';
import PremiumCard from '@/components/UI/PremiumCard';
import { PREMIUM_VARIANTS, SPRING_CONFIGS } from '@/constants/animations';

interface AdminStats {
  totalUsers: number;
  totalPets: number;
  totalMatches: number;
  totalMessages: number;
  activeSubscriptions: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  uptime: string;
  memoryUsage: string;
  responseTime: number;
}

interface User {
  id: string;
  email: string;
  name: string;
  isPremium: boolean;
  isVerified: boolean;
  createdAt: string;
  lastActive: string;
  petsCount: number;
  matchesCount: number;
}

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  ownerId: string;
  ownerName: string;
  createdAt: string;
  photos: string[];
  isActive: boolean;
}

interface Match {
  id: string;
  users: string[];
  pets: string[];
  createdAt: string;
  lastMessageAt?: string;
  status: 'active' | 'inactive' | 'blocked';
  messagesCount: number;
}

interface SystemMetric {
  name: string;
  value: string | number;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [_pets, _setPets] = useState<Pet[]>([]);
  const [_matches, _setMatches] = useState<Match[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [apiEndpoints, setApiEndpoints] = useState<Array<{ endpoint: string; method: string; status: string; responseTime: number; path?: string; calls?: number; avgTime?: number; errors?: number }>>([]);
  const [_logs, _setLogs] = useState<Array<{ timestamp: string; level: string; message: string; userId?: string }>>([]);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const loadAdminData = () => {
      setIsLoading(true);
      
      // Simulate API calls
      setTimeout(() => {
        setStats({
          totalUsers: 1250,
          totalPets: 2100,
          totalMatches: 850,
          totalMessages: 15420,
          activeSubscriptions: 340,
          systemHealth: 'healthy',
          uptime: '15d 8h 32m',
          memoryUsage: '2.4 GB',
          responseTime: 145
        });

        setUsers([
          {
            id: '1',
            email: 'john@example.com',
            name: 'John Doe',
            isPremium: true,
            isVerified: true,
            createdAt: '2024-01-15',
            lastActive: '2024-01-20',
            petsCount: 2,
            matchesCount: 5
          },
          {
            id: '2',
            email: 'jane@example.com',
            name: 'Jane Smith',
            isPremium: false,
            isVerified: true,
            createdAt: '2024-01-18',
            lastActive: '2024-01-19',
            petsCount: 1,
            matchesCount: 3
          }
        ]);

        setSystemMetrics([
          { name: 'API Response Time', value: '145ms', status: 'good', trend: 'down' },
          { name: 'Memory Usage', value: '2.4 GB', status: 'warning', trend: 'up' },
          { name: 'CPU Usage', value: '45%', status: 'good', trend: 'stable' },
          { name: 'Database Connections', value: '12/50', status: 'good', trend: 'stable' },
          { name: 'Error Rate', value: '0.2%', status: 'good', trend: 'down' },
          { name: 'Active Users', value: '156', status: 'good', trend: 'up' }
        ]);

        setApiEndpoints([
          { endpoint: '/api/users', method: 'GET', status: 'healthy', responseTime: 45, path: '/api/users', calls: 1250, avgTime: 45, errors: 2 },
          { endpoint: '/api/pets', method: 'POST', status: 'healthy', responseTime: 120, path: '/api/pets', calls: 890, avgTime: 120, errors: 5 },
          { endpoint: '/api/matches', method: 'GET', status: 'healthy', responseTime: 65, path: '/api/matches', calls: 2100, avgTime: 65, errors: 1 },
          { endpoint: '/api/auth/login', method: 'POST', status: 'warning', responseTime: 85, path: '/api/auth/login', calls: 3400, avgTime: 85, errors: 12 },
          { endpoint: '/api/pets/discover', method: 'GET', status: 'healthy', responseTime: 95, path: '/api/pets/discover', calls: 5600, avgTime: 95, errors: 8 }
        ]);

        setIsLoading(false);
      }, 1000);
    };

    loadAdminData();
  }, []);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: ChartBarIcon },
    { id: 'users', label: 'Users', icon: UsersIcon },
    { id: 'pets', label: 'Pets', icon: HeartIcon },
    { id: 'matches', label: 'Matches', icon: ChatBubbleLeftRightIcon },
    { id: 'api', label: 'API Management', icon: ServerIcon },
    { id: 'system', label: 'System', icon: CogIcon },
    { id: 'logs', label: 'Logs', icon: DocumentTextIcon },
    { id: 'settings', label: 'Settings', icon: ShieldCheckIcon },
  ];

  const handleUserAction = (_action: string, _userId: string) => {
    // TODO: Implement action for user
    // Implement actual API calls
  };

  const handleSystemAction = (_action: string) => {
    // TODO: Implement system action
    // Implement actual system actions
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Enhanced Stats Overview */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
              delayChildren: 0.1
            }
          }
        }}
      >
        {stats && [
          { 
            label: 'Total Users', 
            value: stats.totalUsers, 
            icon: UsersIcon, 
            color: 'blue',
            gradient: 'from-blue-500 to-blue-600',
            trend: '+12%',
            trendUp: true
          },
          { 
            label: 'Total Pets', 
            value: stats.totalPets, 
            icon: HeartIcon, 
            color: 'pink',
            gradient: 'from-pink-500 to-pink-600',
            trend: '+8%',
            trendUp: true
          },
          { 
            label: 'Total Matches', 
            value: stats.totalMatches, 
            icon: ChatBubbleLeftRightIcon, 
            color: 'green',
            gradient: 'from-green-500 to-green-600',
            trend: '+15%',
            trendUp: true
          },
          { 
            label: 'Premium Users', 
            value: stats.activeSubscriptions, 
            icon: CurrencyDollarIcon, 
            color: 'purple',
            gradient: 'from-purple-500 to-purple-600',
            trend: '+23%',
            trendUp: true
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            variants={PREMIUM_VARIANTS.card}
            whileHover={{ 
              scale: 1.02,
              transition: SPRING_CONFIGS.gentle            }}
            whileTap={{ 
              scale: 0.98,
              transition: SPRING_CONFIGS.snappy            }}
          >
            <PremiumCard variant="glass" className="p-6 relative overflow-hidden group">
              {/* Animated background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <div className="flex items-center space-x-1">
                    <span className={`text-xs font-semibold ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.trend}
                    </span>
                    <motion.div
                      animate={{ rotate: stat.trendUp ? 0 : 180 }}
                      transition={SPRING_CONFIGS.gentle}
                    >
                      {stat.trendUp ? (
                        <ArrowUpIcon className="w-3 h-3 text-green-600" />
                      ) : (
                        <ArrowDownIcon className="w-3 h-3 text-red-600" />
                      )}
                    </motion.div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <motion.p 
                    className="text-3xl font-bold text-gray-900"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1, ...(SPRING_CONFIGS.bouncy) }}
                  >
                    {stat.value.toLocaleString()}
                  </motion.p>
                  
                  <motion.div
                    whileHover={{ 
                      scale: 1.1,
                      rotate: 5,
                      transition: SPRING_CONFIGS.gentle                    }}
                  >
                    <stat.icon className={`w-10 h-10 text-${stat.color}-500 drop-shadow-lg`} />
                  </motion.div>
                </div>
              </div>
            </PremiumCard>
          </motion.div>
        ))}
      </motion.div>

      {/* Enhanced System Health */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, ...(SPRING_CONFIGS.smooth) }}
      >
        <PremiumCard variant="gradient" className="p-6 relative overflow-hidden">
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20 animate-pulse" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">System Health</h3>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <ChartBarIcon className="w-6 h-6 text-white/80" />
              </motion.div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {systemMetrics.map((metric, index) => (
                <motion.div 
                  key={metric.name} 
                  className="flex items-center justify-between p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1, ...SPRING_CONFIGS.gentle }}
                  whileHover={{ 
                    scale: 1.02,
                    transition: SPRING_CONFIGS.gentle                  }}
                >
                  <div className="flex-1">
                    <p className="text-sm text-white/80 font-medium">{metric.name}</p>
                    <motion.p 
                      className="text-lg font-bold text-white"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                    >
                      {metric.value}
                    </motion.p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <motion.div 
                      className={`w-4 h-4 rounded-full ${
                        metric.status === 'good' ? 'bg-green-400' : 
                        metric.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                      }`}
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [1, 0.7, 1]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.2
                      }}
                    />
                    
                    <motion.div
                      animate={{ rotate: metric.trend === 'up' ? 0 : 180 }}
                      transition={SPRING_CONFIGS.gentle}
                    >
                      {metric.trend === 'up' ? (
                        <ArrowUpIcon className="w-4 h-4 text-green-400" />
                      ) : metric.trend === 'down' ? (
                        <ArrowDownIcon className="w-4 h-4 text-red-400" />
                      ) : (
                        <div className="w-4 h-4 bg-white/40 rounded-full" />
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </PremiumCard>
      </motion.div>

      {/* Enhanced Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, ...(SPRING_CONFIGS.smooth) }}
      >
        <PremiumCard className="p-6 relative overflow-hidden">
          {/* Subtle background animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-blue-500/5 animate-pulse" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <BoltIcon className="w-6 h-6 text-purple-500" />
              </motion.div>
            </div>
            
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                    delayChildren: 0.1
                  }
                }
              }}
            >
              {[
                {
                  variant: 'primary' as const,
                  action: 'clear-cache',
                  icon: ArrowPathIcon,
                  label: 'Clear Cache',
                  description: 'Refresh system cache',
                  color: 'blue'
                },
                {
                  variant: 'neon' as const,
                  action: 'restart-services',
                  icon: BoltIcon,
                  label: 'Restart Services',
                  description: 'Reload all services',
                  color: 'yellow'
                },
                {
                  variant: 'glass' as const,
                  action: 'backup-database',
                  icon: CircleStackIcon,
                  label: 'Backup DB',
                  description: 'Create data backup',
                  color: 'green'
                },
                {
                  variant: 'holographic' as const,
                  action: 'send-notification',
                  icon: BellIcon,
                  label: 'Send Notification',
                  description: 'Notify all users',
                  color: 'purple'
                }
              ].map((action, index) => (
                <motion.div
                  key={action.action}
                  variants={PREMIUM_VARIANTS.card}
                  whileHover={{ 
                    scale: 1.05,
                    transition: SPRING_CONFIGS.gentle                  }}
                  whileTap={{ 
                    scale: 0.95,
                    transition: SPRING_CONFIGS.snappy                  }}
                >
                  <PremiumButton
                    variant={action.variant}
                    onClick={() => handleSystemAction(action.action)}
                    icon={
                      <motion.div
                        whileHover={{ 
                          rotate: 360,
                          transition: { duration: 0.5 }
                        }}
                      >
                        <action.icon className="w-5 h-5" />
                      </motion.div>
                    }
                    className="h-full flex flex-col items-center justify-center p-4 text-center group"
                  >
                    <div className="space-y-2">
                      <div className="font-semibold">{action.label}</div>
                      <div className="text-xs opacity-70 group-hover:opacity-100 transition-opacity">
                        {action.description}
                      </div>
                    </div>
                  </PremiumButton>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </PremiumCard>
      </motion.div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-8">
      {/* Enhanced Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...(SPRING_CONFIGS.smooth) }}
      >
        <PremiumCard className="p-6 relative overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">User Management</h3>
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <UserGroupIcon className="w-6 h-6 text-purple-500" />
              </motion.div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <motion.div 
                  className="relative"
                  whileFocus={{ scale: 1.02 }}
                  transition={SPRING_CONFIGS.gentle}
                >
                  <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                  />
                </motion.div>
              </div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={SPRING_CONFIGS.gentle}
              >
                <PremiumButton
                  variant="primary"
                  icon={
                    <motion.div
                      whileHover={{ rotate: 90 }}
                      transition={{ duration: 0.3 }}
                    >
                      <PlusIcon className="w-5 h-5" />
                    </motion.div>
                  }
                  className="px-6 py-3"
                >
                  Add User
                </PremiumButton>
              </motion.div>
            </div>
          </div>
        </PremiumCard>
      </motion.div>

      {/* Enhanced Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, ...(SPRING_CONFIGS.smooth) }}
      >
        <PremiumCard className="p-6 relative overflow-hidden">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-white/50" />
          
          <div className="relative z-10">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-4 px-4 font-bold text-gray-700">User</th>
                    <th className="text-left py-4 px-4 font-bold text-gray-700">Status</th>
                    <th className="text-left py-4 px-4 font-bold text-gray-700">Pets</th>
                    <th className="text-left py-4 px-4 font-bold text-gray-700">Matches</th>
                    <th className="text-left py-4 px-4 font-bold text-gray-700">Last Active</th>
                    <th className="text-left py-4 px-4 font-bold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, _index) => (
                    <motion.tr 
                      key={user.id} 
                      className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 transition-all duration-300 group"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: _index * 0.1, ...SPRING_CONFIGS.gentle }}
                      whileHover={{ 
                        scale: 1.01,
                        transition: SPRING_CONFIGS.gentle                      }}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <motion.div
                            className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold"
                            whileHover={{ 
                              scale: 1.1,
                              rotate: 5,
                              transition: SPRING_CONFIGS.gentle                            }}
                          >
                            {user.name.charAt(0).toUpperCase()}
                          </motion.div>
                          <div>
                            <p className="font-semibold text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          {user.isPremium && (
                            <motion.span 
                              className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 text-xs rounded-full font-semibold border border-purple-200"
                              whileHover={{ scale: 1.05 }}
                              transition={SPRING_CONFIGS.gentle}
                            >
                              Premium
                            </motion.span>
                          )}
                          <motion.div
                            whileHover={{ scale: 1.2 }}
                            transition={SPRING_CONFIGS.gentle}
                          >
                            {user.isVerified ? (
                              <CheckCircleIcon className="w-5 h-5 text-green-500" />
                            ) : (
                              <XCircleIcon className="w-5 h-5 text-red-500" />
                            )}
                          </motion.div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <motion.span 
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                          whileHover={{ scale: 1.05 }}
                          transition={SPRING_CONFIGS.gentle}
                        >
                          {user.petsCount}
                        </motion.span>
                      </td>
                      <td className="py-4 px-4">
                        <motion.span 
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                          whileHover={{ scale: 1.05 }}
                          transition={SPRING_CONFIGS.gentle}
                        >
                          {user.matchesCount}
                        </motion.span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-500 font-medium">{user.lastActive}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <motion.button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserModal(true);
                            }}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            transition={SPRING_CONFIGS.gentle}
                          >
                            <EyeIcon className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            onClick={() => handleUserAction('edit', user.id)}
                            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-all duration-200"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            transition={SPRING_CONFIGS.gentle}
                          >
                            <PencilIcon className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            onClick={() => handleUserAction('delete', user.id)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            transition={SPRING_CONFIGS.gentle}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </PremiumCard>
      </motion.div>
    </div>
  );

  const renderAPI = () => (
    <div className="space-y-6">
      <PremiumCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">API Endpoints</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4">Method</th>
                <th className="text-left py-3 px-4">Endpoint</th>
                <th className="text-left py-3 px-4">Calls</th>
                <th className="text-left py-3 px-4">Avg Time</th>
                <th className="text-left py-3 px-4">Errors</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {apiEndpoints.map((endpoint, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs rounded ${
                      endpoint.method === 'GET' ? 'bg-green-100 text-green-800' :
                      endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {endpoint.method}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-sm">{endpoint.path}</td>
                  <td className="py-3 px-4">{endpoint.calls?.toLocaleString() ?? 'N/A'}</td>
                  <td className="py-3 px-4">{endpoint.avgTime ? `${endpoint.avgTime}ms` : 'N/A'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs rounded ${
                      endpoint.errors === 0 ? 'bg-green-100 text-green-800' :
                      endpoint.errors && endpoint.errors < 5 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {endpoint.errors ?? 0}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-blue-600 hover:text-blue-800">
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-green-600 hover:text-green-800">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PremiumCard>

      {/* API Management */}
      <PremiumCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">API Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PremiumButton
            variant="primary"
            onClick={() => handleSystemAction('regenerate-api-keys')}
            icon={<KeyIcon className="w-4 h-4" />}
          >
            Regenerate API Keys
          </PremiumButton>
          <PremiumButton
            variant="neon"
            onClick={() => handleSystemAction('enable-rate-limiting')}
            icon={<ShieldCheckIcon className="w-4 h-4" />}
          >
            Enable Rate Limiting
          </PremiumButton>
          <PremiumButton
            variant="glass"
            onClick={() => handleSystemAction('api-documentation')}
            icon={<DocumentTextIcon className="w-4 h-4" />}
          >
            API Documentation
          </PremiumButton>
        </div>
      </PremiumCard>
    </div>
  );

  const renderSystem = () => (
    <div className="space-y-6">
      {/* System Status */}
      <PremiumCard variant="gradient" className="p-6">
        <h3 className="text-lg font-semibold mb-4">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
              <div className="flex items-center space-x-3">
                <ServerIcon className="w-5 h-5 text-white" />
                <span className="text-white">Server Status</span>
              </div>
              <CheckCircleIcon className="w-5 h-5 text-green-400" />
            </div>
            <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
              <div className="flex items-center space-x-3">
                <CircleStackIcon className="w-5 h-5 text-white" />
                <span className="text-white">Database</span>
              </div>
              <CheckCircleIcon className="w-5 h-5 text-green-400" />
            </div>
            <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
              <div className="flex items-center space-x-3">
                <CloudIcon className="w-5 h-5 text-white" />
                <span className="text-white">Redis Cache</span>
              </div>
              <CheckCircleIcon className="w-5 h-5 text-green-400" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
              <div className="flex items-center space-x-3">
                <WifiIcon className="w-5 h-5 text-white" />
                <span className="text-white">WebSocket</span>
              </div>
              <CheckCircleIcon className="w-5 h-5 text-green-400" />
            </div>
            <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
              <div className="flex items-center space-x-3">
                <CpuChipIcon className="w-5 h-5 text-white" />
                <span className="text-white">AI Service</span>
              </div>
              <CheckCircleIcon className="w-5 h-5 text-green-400" />
            </div>
            <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
              <div className="flex items-center space-x-3">
                <GlobeAltIcon className="w-5 h-5 text-white" />
                <span className="text-white">CDN</span>
              </div>
              <CheckCircleIcon className="w-5 h-5 text-green-400" />
            </div>
          </div>
        </div>
      </PremiumCard>

      {/* System Actions */}
      <PremiumCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">System Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <PremiumButton
            variant="primary"
            onClick={() => handleSystemAction('restart-server')}
            icon={<ArrowPathIcon className="w-4 h-4" />}
          >
            Restart Server
          </PremiumButton>
          <PremiumButton
            variant="neon"
            onClick={() => handleSystemAction('clear-logs')}
            icon={<TrashIcon className="w-4 h-4" />}
          >
            Clear Logs
          </PremiumButton>
          <PremiumButton
            variant="glass"
            onClick={() => handleSystemAction('backup-system')}
            icon={<CircleStackIcon className="w-4 h-4" />}
          >
            System Backup
          </PremiumButton>
          <PremiumButton
            variant="holographic"
            onClick={() => handleSystemAction('maintenance-mode')}
            icon={<LockClosedIcon className="w-4 h-4" />}
          >
            Maintenance Mode
          </PremiumButton>
        </div>
      </PremiumCard>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'users': return renderUsers();
      case 'api': return renderAPI();
      case 'system': return renderSystem();
      default: return <div>Coming soon...</div>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...(SPRING_CONFIGS.smooth) }}
          className="mb-8"
        >
          <PremiumCard variant="gradient" className="p-8 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0">
              <motion.div
                className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.1, 0.2, 0.1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div
                className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-lg"
                animate={{
                  scale: [1.2, 1, 1.2],
                  opacity: [0.1, 0.2, 0.1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
              />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, ...SPRING_CONFIGS.gentle }}
                  >
                    <h1 className="text-4xl font-bold text-white flex items-center space-x-3">
                      <motion.span
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        🛠️
                      </motion.span>
                      <span>Admin Panel</span>
                    </h1>
                  </motion.div>
                  
                  <motion.p 
                    className="text-white/80 text-lg"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, ...SPRING_CONFIGS.gentle }}
                  >
                    Complete platform management interface
                  </motion.p>
                </div>
                
                <motion.div 
                  className="flex items-center space-x-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, ...SPRING_CONFIGS.gentle }}
                >
                  <div className="text-right text-white">
                    <p className="text-sm opacity-80 mb-1">System Status</p>
                    <motion.div
                      className="flex items-center space-x-2"
                      whileHover={{ scale: 1.05 }}
                      transition={SPRING_CONFIGS.gentle}
                    >
                      <motion.div
                        className={`w-3 h-3 rounded-full ${
                          stats?.systemHealth === 'healthy' ? 'bg-green-400' : 
                          stats?.systemHealth === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                        }`}
                        animate={{ 
                          scale: [1, 1.2, 1],
                          opacity: [1, 0.7, 1]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity
                        }}
                      />
                      <p className="text-lg font-semibold">
                        {stats?.systemHealth === 'healthy' ? 'Healthy' : 
                         stats?.systemHealth === 'warning' ? 'Warning' : 'Critical'}
                      </p>
                    </motion.div>
                  </div>
                  
                  <motion.div
                    className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm"
                    whileHover={{ scale: 1.05 }}
                    transition={SPRING_CONFIGS.gentle}
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <CpuChipIcon className="w-5 h-5 text-white" />
                    </motion.div>
                    <span className="text-white font-medium">Live</span>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </PremiumCard>
        </motion.div>

        <div className="flex space-x-6">
          {/* Enhanced Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, ...(SPRING_CONFIGS.smooth) }}
            className="w-64 flex-shrink-0"
          >
            <PremiumCard className="p-4 relative overflow-hidden">
              {/* Subtle background animation */}
              <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-pink-500/5" />
              
              <div className="relative z-10">
                <motion.div
                  className="mb-6"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, ...SPRING_CONFIGS.gentle }}
                >
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Navigation</h3>
                  <div className="w-full h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full" />
                </motion.div>
                
                <nav className="space-y-2">
                  {tabs.map((tab, index) => (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden group ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 shadow-lg border border-purple-200'
                          : 'text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:text-gray-800'
                      }`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1, ...SPRING_CONFIGS.gentle }}
                      whileHover={{ 
                        scale: 1.02,
                        transition: SPRING_CONFIGS.gentle                      }}
                      whileTap={{ 
                        scale: 0.98,
                        transition: SPRING_CONFIGS.snappy                      }}
                    >
                      {/* Active indicator */}
                      {activeTab === tab.id && (
                        <motion.div
                          className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-400 to-pink-400 rounded-r-full"
                          layoutId="activeTab"
                          transition={SPRING_CONFIGS.gentle}
                        />
                      )}
                      
                      <motion.div
                        whileHover={{ 
                          rotate: activeTab === tab.id ? 0 : 5,
                          scale: 1.1
                        }}
                        transition={SPRING_CONFIGS.gentle}
                      >
                        <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-purple-600' : 'text-gray-500 group-hover:text-gray-700'}`} />
                      </motion.div>
                      
                      <span className={`font-medium ${activeTab === tab.id ? 'text-purple-700' : 'text-gray-600 group-hover:text-gray-800'}`}>
                        {tab.label}
                      </span>
                      
                      {/* Hover effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        initial={false}
                      />
                    </motion.button>
                  ))}
                </nav>
              </div>
            </PremiumCard>
          </motion.div>

          {/* Main Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1"
          >
            {renderContent()}
          </motion.div>
        </div>
      </div>

      {/* User Modal */}
      <AnimatePresence>
        {showUserModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowUserModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">User Details</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-500">Name</label>
                  <p className="font-medium">{selectedUser.name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Email</label>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Status</label>
                  <div className="flex items-center space-x-2">
                    {selectedUser.isPremium && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                        Premium
                      </span>
                    )}
                    {selectedUser.isVerified ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Verified
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                        Unverified
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <PremiumButton
                  variant="glass"
                  onClick={() => setShowUserModal(false)}
                >
                  Close
                </PremiumButton>
                <PremiumButton
                  variant="primary"
                  onClick={() => {
                    handleUserAction('edit', selectedUser.id);
                    setShowUserModal(false);
                  }}
                >
                  Edit User
                </PremiumButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
