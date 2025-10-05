const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

router.post('/errors', (req, res) => {
  try {
    const { message, stack, url, userAgent, timestamp } = req.body;
    
    // Log the error details
    logger.error('Frontend Error Report:', {
      message,
      stack,
      url,
      userAgent,
      timestamp,
      ip: req.ip,
      userId: req.user?.id || 'anonymous'
    });
    
    res.status(200).json({ success: true, message: 'Error logged successfully' });
  } catch (error) {
    logger.error('Error logging error report:', error);
    res.status(500).json({ success: false, message: 'Failed to log error' });
  }
});

module.exports = router;
