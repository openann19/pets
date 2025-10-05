const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.get('/', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: Date.now(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    memory: process.memoryUsage(),
  };
  
  try {
    // Check database connectivity
    await mongoose.connection.db.admin().ping();
    res.status(200).json(health);
  } catch (error) {
    health.status = 'error';
    health.database = 'error';
    health.error = error.message;
    res.status(503).json(health);
  }
});

module.exports = router;
