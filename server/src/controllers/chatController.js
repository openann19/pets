const Match = require('../models/Match');

// @desc    Get chat history for a match
// @route   GET /api/chat/history/:matchId
// @access  Private
const getChatHistory = async (req, res) => {
    try {
        const { matchId } = req.params;
        const match = await Match.findOne({
            _id: matchId,
            $or: [{ user1: req.userId }, { user2: req.userId }]
        }).populate('messages.sender', 'firstName avatar');

        if (!match) {
            return res.status(404).json({ success: false, message: 'Match not found' });
        }

        res.json({ success: true, data: { messages: match.messages } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Mark messages as read
// @route   POST /api/chat/read/:matchId
// @access  Private
const markMessagesRead = async (req, res) => {
    try {
        const { matchId } = req.params;
        const match = await Match.findOne({
            _id: matchId,
            $or: [{ user1: req.userId }, { user2: req.userId }]
        });

        if (!match) {
            return res.status(404).json({ success: false, message: 'Match not found' });
        }

        await match.markMessagesAsRead(req.userId);

        res.json({ success: true, message: 'Messages marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get online users (placeholder)
// @route   GET /api/chat/online
// @access  Private
const getOnlineUsers = async (req, res) => {
    // This would typically be handled by a presence system with WebSockets
    res.json({ success: true, data: { onlineUsers: [] } });
};

module.exports = {
    getChatHistory,
    markMessagesRead,
    getOnlineUsers
};
