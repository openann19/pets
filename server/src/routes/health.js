/**
 * Health Check Routes
 * System monitoring and status endpoints
 */

const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const logger = require('../utils/logger');

// Basic health check
router.get('/', async (req, res) => {
  try {
    const healthCheck = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      pid: process.pid,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
        external: Math.round(process.memoryUsage().external / 1024 / 1024) + ' MB',
      },
      cpu: process.cpuUsage(),
    };

    res.status(200).json(healthCheck);
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

// Detailed health check with database connectivity
router.get('/detailed', async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Check database connection
    let dbStatus = 'disconnected';
    let dbResponseTime = 0;
    
    if (mongoose.connection.readyState === 1) {
      const dbStartTime = Date.now();
      try {
        await mongoose.connection.db.admin().ping();
        dbResponseTime = Date.now() - dbStartTime;
        dbStatus = 'connected';
      } catch (dbError) {
        dbStatus = 'error';
        logger.error('Database ping failed:', dbError);
      }
    }

    // Check Redis connection (if available)
    let redisStatus = 'not_configured';
    let redisResponseTime = 0;
    
    try {
      const { getRedisClient } = require('../config/redis');
      const redisClient = getRedisClient();
      if (redisClient) {
        const redisStartTime = Date.now();
        await redisClient.ping();
        redisResponseTime = Date.now() - redisStartTime;
        redisStatus = 'connected';
      }
    } catch (redisError) {
      redisStatus = 'error';
      logger.warn('Redis check failed:', redisError.message);
    }

    const responseTime = Date.now() - startTime;

    const detailedHealthCheck = {
      status: dbStatus === 'connected' ? 'OK' : 'DEGRADED',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      pid: process.pid,
      responseTime: `${responseTime}ms`,
      services: {
        database: {
          status: dbStatus,
          responseTime: `${dbResponseTime}ms`,
          connectionState: mongoose.connection.readyState,
          host: mongoose.connection.host,
          port: mongoose.connection.port,
          name: mongoose.connection.name,
        },
        redis: {
          status: redisStatus,
          responseTime: `${redisResponseTime}ms`,
        },
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
        external: Math.round(process.memoryUsage().external / 1024 / 1024) + ' MB',
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + ' MB',
      },
      cpu: {
        user: process.cpuUsage().user,
        system: process.cpuUsage().system,
      },
      system: {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
      },
    };

    const statusCode = dbStatus === 'connected' ? 200 : 503;
    res.status(statusCode).json(detailedHealthCheck);
  } catch (error) {
    logger.error('Detailed health check failed:', error);
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

// Readiness check (for Kubernetes)
router.get('/ready', async (req, res) => {
  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        status: 'NOT_READY',
        reason: 'Database not connected',
        timestamp: new Date().toISOString(),
      });
    }

    // Test database connectivity
    await mongoose.connection.db.admin().ping();

    res.status(200).json({
      status: 'READY',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Readiness check failed:', error);
    res.status(503).json({
      status: 'NOT_READY',
      reason: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Liveness check (for Kubernetes)
router.get('/live', (req, res) => {
  res.status(200).json({
    status: 'ALIVE',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Metrics endpoint
router.get('/metrics', (req, res) => {
  try {
    const metrics = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        heapUsed: process.memoryUsage().heapUsed,
        heapTotal: process.memoryUsage().heapTotal,
        external: process.memoryUsage().external,
        rss: process.memoryUsage().rss,
      },
      cpu: process.cpuUsage(),
      connections: {
        database: mongoose.connection.readyState,
      },
      environment: process.env.NODE_ENV || 'development',
    };

    res.status(200).json(metrics);
  } catch (error) {
    logger.error('Metrics collection failed:', error);
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Database status endpoint
router.get('/database', async (req, res) => {
  try {
    const dbInfo = {
      status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name,
      collections: [],
    };

    if (mongoose.connection.readyState === 1) {
      try {
        const collections = await mongoose.connection.db.listCollections().toArray();
        dbInfo.collections = collections.map(col => ({
          name: col.name,
          type: col.type,
        }));
      } catch (error) {
        logger.warn('Failed to list collections:', error.message);
      }
    }

    res.status(200).json(dbInfo);
  } catch (error) {
    logger.error('Database status check failed:', error);
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

module.exports = router;