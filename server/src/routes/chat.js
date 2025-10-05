const express = require('express');
const {
  getChatHistory,
  markMessagesRead,
  getOnlineUsers
} = require('../controllers/chatController');

const router = express.Router();

// Routes
router.get('/history/:matchId', getChatHistory);
router.post('/read/:matchId', markMessagesRead);
router.get('/online', getOnlineUsers);

module.exports = router;