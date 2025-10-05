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

