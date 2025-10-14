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

// @desc    Get paginated messages for a match
// @route   GET /api/chat/:matchId/messages?page=1&limit=20
// @access  Private
const getMessages = async (req, res) => {
    try {
        const { matchId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const match = await Match.findOne({
            _id: matchId,
            $or: [{ user1: req.userId }, { user2: req.userId }]
        });

        if (!match) {
            return res.status(404).json({ success: false, message: 'Match not found' });
        }

        // Get total message count
        const totalMessages = match.messages.length;

        // Get paginated messages with sender population
        const messages = await Match.findOne({
            _id: matchId,
            $or: [{ user1: req.userId }, { user2: req.userId }]
        })
        .select('messages')
        .populate({
            path: 'messages.sender',
            select: 'firstName avatar',
            options: { skip, limit: limit }
        })
        .then(doc => doc ? doc.messages.slice(skip, skip + limit) : []);

        const totalPages = Math.ceil(totalMessages / limit);
        const hasMore = page < totalPages;

        res.json({
            success: true,
            data: {
                messages,
                pagination: {
                    page,
                    limit,
                    totalMessages,
                    totalPages,
                    hasMore
                }
            }
        });
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

// @desc    Send a message in a match
// @route   POST /api/chat/:matchId/messages
// @access  Private
const sendMessage = async (req, res) => {
    try {
        const { matchId } = req.params;
        const { content, messageType = 'text', attachments = [] } = req.body;

        if (!content && !attachments.length) {
            return res.status(400).json({
                success: false,
                message: 'Message content or attachments are required'
            });
        }

        const match = await Match.findOne({
            _id: matchId,
            $or: [{ user1: req.userId }, { user2: req.userId }]
        });

        if (!match) {
            return res.status(404).json({ success: false, message: 'Match not found' });
        }

        // Add the message using the model's method
        const updatedMatch = await match.addMessage(req.userId, content, messageType, attachments);

        // Get the newly added message
        const newMessage = updatedMatch.messages[updatedMatch.messages.length - 1];

        // Populate sender info
        await newMessage.populate('sender', 'firstName avatar');

        res.status(201).json({
            success: true,
            data: { message: newMessage }
        });
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
    getMessages,
    markMessagesRead,
    getOnlineUsers,
    sendMessage
};
