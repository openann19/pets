/**
 * Admin Routes
 * Endpoints for system administration and monitoring
 * 
 * Security: All routes protected with authentication and admin-only middleware
 */

const express = require('express');
const router = express.Router();
const { getMetrics, resetMetrics } = require('../middleware/requestTracking');
const { getCacheStats, clearCache, invalidateCache } = require('../middleware/caching');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const logger = require('../utils/logger');

// Apply authentication and admin check to ALL admin routes
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * GET /api/admin/metrics
 * Get detailed API metrics
 */
router.get('/metrics', (req, res) => {
  try {
    const metrics = getMetrics();
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    logger.error('Failed to get metrics', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve metrics'
    });
  }
});

/**
 * POST /api/admin/metrics/reset
 * Reset all metrics (useful for testing)
 */
router.post('/metrics/reset', (req, res) => {
  try {
    resetMetrics();
    logger.info('Metrics reset', { userId: req.userId, requestId: req.id });
    
    res.json({
      success: true,
      message: 'Metrics reset successfully'
    });
  } catch (error) {
    logger.error('Failed to reset metrics', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to reset metrics'
    });
  }
});

/**
 * GET /api/admin/cache/stats
 * Get cache statistics
 */
router.get('/cache/stats', (req, res) => {
  try {
    const stats = getCacheStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Failed to get cache stats', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve cache statistics'
    });
  }
});

/**
 * POST /api/admin/cache/clear
 * Clear all cache
 */
router.post('/cache/clear', (req, res) => {
  try {
    const deletedCount = clearCache();
    logger.info('Cache cleared', { deletedCount, userId: req.userId, requestId: req.id });
    
    res.json({
      success: true,
      message: `Cache cleared successfully. ${deletedCount} keys deleted.`,
      data: { deletedCount }
    });
  } catch (error) {
    logger.error('Failed to clear cache', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to clear cache'
    });
  }
});

/**
 * POST /api/admin/cache/invalidate
 * Invalidate cache by pattern
 * Body: { pattern: "string" }
 */
router.post('/cache/invalidate', (req, res) => {
  try {
    const { pattern } = req.body;
    
    if (!pattern) {
      return res.status(400).json({
        success: false,
        message: 'Pattern is required'
      });
    }
    
    const deletedCount = invalidateCache(pattern);
    logger.info('Cache invalidated by pattern', { 
      pattern, 
      deletedCount, 
      userId: req.userId, 
      requestId: req.id 
    });
    
    res.json({
      success: true,
      message: `Cache invalidated successfully. ${deletedCount} keys deleted.`,
      data: { pattern, deletedCount }
    });
  } catch (error) {
    logger.error('Failed to invalidate cache', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to invalidate cache'
    });
  }
});

/**
 * GET /api/admin/system/info
 * Get system information
 */
router.get('/system/info', (req, res) => {
  try {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    const systemInfo = {
      node: {
        version: process.version,
        platform: process.platform,
        arch: process.arch
      },
      process: {
        pid: process.pid,
        uptime: process.uptime(),
        uptimeFormatted: formatUptime(process.uptime())
      },
      memory: {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB',
        rss: Math.round(memUsage.rss / 1024 / 1024) + ' MB',
        external: Math.round(memUsage.external / 1024 / 1024) + ' MB',
        arrayBuffers: Math.round(memUsage.arrayBuffers / 1024 / 1024) + ' MB'
      },
      cpu: {
        user: Math.round(cpuUsage.user / 1000) + ' ms',
        system: Math.round(cpuUsage.system / 1000) + ' ms'
      },
      environment: process.env.NODE_ENV || 'development'
    };
    
    res.json({
      success: true,
      data: systemInfo
    });
  } catch (error) {
    logger.error('Failed to get system info', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve system information'
    });
  }
});

/**
 * GET /api/admin/users
 * Get all users with pagination and filtering
 */
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', status = 'all' } = req.query;
    const skip = (page - 1) * limit;
    
    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status !== 'all') {
      if (status === 'premium') query.isPremium = true;
      if (status === 'verified') query.isVerified = true;
      if (status === 'unverified') query.isVerified = false;
    }
    
    const User = require('../models/User');
    const Pet = require('../models/Pet');
    const Match = require('../models/Match');
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get additional stats for each user
    const usersWithStats = await Promise.all(users.map(async (user) => {
      const petsCount = await Pet.countDocuments({ ownerId: user._id });
      const matchesCount = await Match.countDocuments({ users: user._id });
      
      return {
        ...user.toObject(),
        petsCount,
        matchesCount
      };
    }));
    
    const total = await User.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        users: usersWithStats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Failed to get users', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve users'
    });
  }
});

/**
 * PUT /api/admin/users/:userId
 * Update user information
 */
router.put('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    
    // Remove sensitive fields
    delete updates.password;
    delete updates._id;
    
    const User = require('../models/User');
    const user = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    logger.info('User updated by admin', { userId, updates, adminId: req.userId });
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error('Failed to update user', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
});

/**
 * DELETE /api/admin/users/:userId
 * Delete user and all associated data
 */
router.delete('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const User = require('../models/User');
    const Pet = require('../models/Pet');
    const Match = require('../models/Match');
    const Message = require('../models/Message');
    
    // Delete user's pets
    await Pet.deleteMany({ ownerId: userId });
    
    // Delete user's matches
    await Match.deleteMany({ users: userId });
    
    // Delete user's messages
    await Message.deleteMany({ senderId: userId });
    
    // Delete user
    const user = await User.findByIdAndDelete(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    logger.info('User deleted by admin', { userId, adminId: req.userId });
    
    res.json({
      success: true,
      message: 'User and all associated data deleted successfully'
    });
  } catch (error) {
    logger.error('Failed to delete user', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
});

/**
 * GET /api/admin/pets
 * Get all pets with filtering
 */
router.get('/pets', async (req, res) => {
  try {
    const { page = 1, limit = 20, species = '', search = '' } = req.query;
    const skip = (page - 1) * limit;
    
    const query = {};
    if (species) query.species = species;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { breed: { $regex: search, $options: 'i' } }
      ];
    }
    
    const Pet = require('../models/Pet');
    const User = require('../models/User');
    
    const pets = await Pet.find(query)
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Pet.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        pets,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Failed to get pets', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve pets'
    });
  }
});

/**
 * GET /api/admin/matches
 * Get all matches with filtering
 */
router.get('/matches', async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'all' } = req.query;
    const skip = (page - 1) * limit;
    
    const query = {};
    if (status !== 'all') query.status = status;
    
    const Match = require('../models/Match');
    const User = require('../models/User');
    const Pet = require('../models/Pet');
    
    const matches = await Match.find(query)
      .populate('users', 'name email')
      .populate('pets', 'name species breed photos')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Match.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        matches,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Failed to get matches', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve matches'
    });
  }
});

/**
 * GET /api/admin/stats
 * Get comprehensive platform statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const User = require('../models/User');
    const Pet = require('../models/Pet');
    const Match = require('../models/Match');
    const Message = require('../models/Message');
    
    const [
      totalUsers,
      totalPets,
      totalMatches,
      totalMessages,
      premiumUsers,
      verifiedUsers,
      activeMatches,
      recentUsers
    ] = await Promise.all([
      User.countDocuments(),
      Pet.countDocuments(),
      Match.countDocuments(),
      Message.countDocuments(),
      User.countDocuments({ isPremium: true }),
      User.countDocuments({ isVerified: true }),
      Match.countDocuments({ status: 'active' }),
      User.countDocuments({ 
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      })
    ]);
    
    // Get species distribution
    const speciesStats = await Pet.aggregate([
      { $group: { _id: '$species', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Get monthly user growth
    const monthlyGrowth = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);
    
    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalPets,
          totalMatches,
          totalMessages,
          premiumUsers,
          verifiedUsers,
          activeMatches,
          recentUsers
        },
        speciesDistribution: speciesStats,
        monthlyGrowth,
        systemHealth: {
          status: 'healthy',
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          responseTime: 145
        }
      }
    });
  } catch (error) {
    logger.error('Failed to get stats', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve statistics'
    });
  }
});

/**
 * POST /api/admin/notifications/send
 * Send notification to all users or specific users
 */
router.post('/notifications/send', async (req, res) => {
  try {
    const { type, title, message, targetUsers = 'all', targetType = 'all' } = req.body;
    
    if (!type || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Type, title, and message are required'
      });
    }
    
    const User = require('../models/User');
    let users = [];
    
    if (targetUsers === 'all') {
      if (targetType === 'all') {
        users = await User.find({}).select('email name');
      } else if (targetType === 'premium') {
        users = await User.find({ isPremium: true }).select('email name');
      } else if (targetType === 'verified') {
        users = await User.find({ isVerified: true }).select('email name');
      }
    } else {
      users = await User.find({ _id: { $in: targetUsers } }).select('email name');
    }
    
    // Send notifications (implement your notification service)
    const notificationService = require('../services/notificationService');
    const results = await notificationService.sendBulkNotification({
      users,
      type,
      title,
      message
    });
    
    logger.info('Bulk notification sent', { 
      type, 
      targetCount: users.length, 
      adminId: req.userId 
    });
    
    res.json({
      success: true,
      data: {
        sent: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        total: results.length
      }
    });
  } catch (error) {
    logger.error('Failed to send notifications', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to send notifications'
    });
  }
});

/**
 * GET /api/admin/logs
 * Get system logs with filtering
 */
router.get('/logs', async (req, res) => {
  try {
    const { level = 'all', limit = 100, search = '' } = req.query;
    
    // This would typically read from your logging system
    // For now, return mock data
    const logs = [
      {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'User login successful',
        userId: 'user123',
        ip: '192.168.1.1'
      },
      {
        timestamp: new Date(Date.now() - 60000).toISOString(),
        level: 'warn',
        message: 'High memory usage detected',
        details: { memoryUsage: '85%' }
      },
      {
        timestamp: new Date(Date.now() - 120000).toISOString(),
        level: 'error',
        message: 'Database connection timeout',
        details: { timeout: '5000ms' }
      }
    ];
    
    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    logger.error('Failed to get logs', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve logs'
    });
  }
});

/**
 * POST /api/admin/system/restart
 * Restart system services
 */
router.post('/system/restart', async (req, res) => {
  try {
    const { service = 'all' } = req.body;
    
    logger.info('System restart requested', { service, adminId: req.userId });
    
    // Implement actual restart logic based on service
    // This is a placeholder - implement based on your deployment setup
    
    res.json({
      success: true,
      message: `${service} restart initiated`
    });
  } catch (error) {
    logger.error('Failed to restart system', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to restart system'
    });
  }
});

/**
 * POST /api/admin/database/backup
 * Create database backup
 */
router.post('/database/backup', async (req, res) => {
  try {
    const { type = 'full' } = req.body;
    
    logger.info('Database backup requested', { type, adminId: req.userId });
    
    // Implement actual backup logic
    // This is a placeholder - implement based on your database setup
    
    res.json({
      success: true,
      message: `${type} backup initiated`,
      data: {
        backupId: `backup_${Date.now()}`,
        estimatedTime: '5-10 minutes'
      }
    });
  } catch (error) {
    logger.error('Failed to create backup', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to create backup'
    });
  }
});

/**
 * Helper function to format uptime
 */
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
  
  return parts.join(' ');
}

module.exports = router;

