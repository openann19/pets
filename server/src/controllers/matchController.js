const Match = require('../models/Match');
const User = require('../models/User');
const Pet = require('../models/Pet');
const { sendEmail } = require('../services/emailService');

// @desc    Get user's matches
// @route   GET /api/matches
// @access  Private
const getMatches = async (req, res) => {
  try {
    const {
      status = 'active',
      page = 1,
      limit = 20,
      sortBy = 'lastActivity',
      order = 'desc'
    } = req.query;

    const query = {
      $or: [{ user1: req.userId }, { user2: req.userId }],
      status
    };

    // Check if user has archived matches (don't show archived by default)
    const userKey = 'user1'; // We'll determine the correct key in the aggregation
    if (status === 'active') {
      // We'll filter archived matches in the aggregation pipeline
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortField = sortBy === 'lastActivity' ? 'lastActivity' : 'createdAt';

    // Use aggregation to properly handle user-specific archived status
    const matches = await Match.aggregate([
      { $match: query },
      {
        $addFields: {
          isArchivedByCurrentUser: {
            $cond: {
              if: { $eq: ['$user1', req.userId] },
              then: '$userActions.user1.isArchived',
              else: '$userActions.user2.isArchived'
            }
          },
          unreadCount: {
            $size: {
              $filter: {
                input: '$messages',
                cond: {
                  $and: [
                    { $ne: ['$$this.sender', req.userId] },
                    {
                      $not: {
                        $in: [req.userId, '$$this.readBy.user']
                      }
                    }
                  ]
                }
              }
            }
          }
        }
      },
      {
        $match: {
          isArchivedByCurrentUser: status === 'archived' ? true : { $ne: true }
        }
      },
      { $sort: { [sortField]: sortOrder } },
      { $skip: (parseInt(page) - 1) * parseInt(limit) },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'pets',
          localField: 'pet1',
          foreignField: '_id',
          as: 'pet1'
        }
      },
      {
        $lookup: {
          from: 'pets',
          localField: 'pet2',
          foreignField: '_id',
          as: 'pet2'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user1',
          foreignField: '_id',
          as: 'user1',
          pipeline: [
            { $project: { firstName: 1, lastName: 1, avatar: 1, 'premium.isActive': 1 } }
          ]
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user2',
          foreignField: '_id',
          as: 'user2',
          pipeline: [
            { $project: { firstName: 1, lastName: 1, avatar: 1, 'premium.isActive': 1 } }
          ]
        }
      },
      { $unwind: '$pet1' },
      { $unwind: '$pet2' },
      { $unwind: '$user1' },
      { $unwind: '$user2' }
    ]);

    res.json({
      success: true,
      data: {
        matches,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          hasMore: matches.length === parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get matches',
      error: error.message
    });
  }
};

// @desc    Get single match with messages
// @route   GET /api/matches/:matchId
// @access  Private
const getMatch = async (req, res) => {
  try {
    const { matchId } = req.params;

    const match = await Match.findOne({
      _id: matchId,
      $or: [{ user1: req.userId }, { user2: req.userId }]
    })
    .populate('pet1 pet2')
    .populate('user1 user2', 'firstName lastName avatar bio premium.isActive')
    .populate('messages.sender', 'firstName lastName avatar _id'); // Ensure _id is always included for consistent data structure

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    // Check if match is blocked by current user
    if (match.isUserBlocked(req.userId)) {
      return res.status(403).json({
        success: false,
        message: 'Match is blocked'
      });
    }

    // Mark messages as read
    await match.markMessagesAsRead(req.userId);

    res.json({
      success: true,
      data: { match }
    });

  } catch (error) {
    console.error('Get match error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get match',
      error: error.message
    });
  }
};

// @desc    Get messages for a match
// @route   GET /api/matches/:matchId/messages
// @access  Private
const getMessages = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const match = await Match.findOne({
      _id: matchId,
      $or: [{ user1: req.userId }, { user2: req.userId }]
    })
    .populate('messages.sender', 'firstName lastName avatar _id') // Ensure _id is always included for consistent data structure
    .select('messages');

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    // Get paginated messages (newest first)
    const totalMessages = match.messages.length;
    const startIndex = Math.max(0, totalMessages - (parseInt(page) * parseInt(limit)));
    const endIndex = totalMessages - ((parseInt(page) - 1) * parseInt(limit));
    
    const messages = match.messages.slice(startIndex, endIndex).reverse();

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalMessages,
          hasMore: startIndex > 0
        }
      }
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get messages',
      error: error.message
    });
  }
};

// @desc    Send message in match
// @route   POST /api/matches/:matchId/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { content, messageType = 'text', attachments = [] } = req.body;

    const match = await Match.findOne({
      _id: matchId,
      $or: [{ user1: req.userId }, { user2: req.userId }]
    }).populate('user1 user2', 'firstName lastName avatar preferences.notifications');

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    if (match.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Cannot send message to inactive match'
      });
    }

    if (match.isUserBlocked(req.userId)) {
      return res.status(403).json({
        success: false,
        message: 'Cannot send message to blocked match'
      });
    }

    // Add message
    const message = {
      sender: req.userId,
      content: content.trim(),
      messageType,
      attachments,
      sentAt: new Date(),
      readBy: [{
        user: req.userId,
        readAt: new Date()
      }]
    };

    match.messages.push(message);
    match.lastActivity = new Date();
    match.lastMessageAt = new Date();
    await match.save();

    // Populate the new message with consistent data structure
    await match.populate('messages.sender', 'firstName lastName avatar _id');
    const newMessage = match.messages[match.messages.length - 1];

    // Send email notification to other user if they have it enabled
    const otherUser = match.user1._id.toString() === req.userId.toString() 
      ? match.user2 
      : match.user1;

    if (otherUser.preferences.notifications.email && 
        otherUser.preferences.notifications.messages) {
      try {
        await sendEmail({
          email: otherUser.email,
          template: 'newMessage',
          data: {
            userName: otherUser.firstName,
            senderName: req.user.firstName,
            message: content.substring(0, 100),
            chatUrl: `${process.env.CLIENT_URL}/matches/${matchId}`
          }
        });
      } catch (emailError) {
        console.error('Message notification email error:', emailError);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { message: newMessage }
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};

// @desc    Archive/unarchive match
// @route   PATCH /api/matches/:matchId/archive
// @access  Private
const archiveMatch = async (req, res) => {
  try {
    const { matchId } = req.params;

    const match = await Match.findOne({
      _id: matchId,
      $or: [{ user1: req.userId }, { user2: req.userId }]
    });

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    await match.toggleArchive(req.userId);

    const userKey = match.user1.toString() === req.userId.toString() ? 'user1' : 'user2';
    const isArchived = match.userActions[userKey].isArchived;

    res.json({
      success: true,
      message: `Match ${isArchived ? 'archived' : 'unarchived'} successfully`,
      data: { isArchived }
    });

  } catch (error) {
    console.error('Archive match error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to archive match',
      error: error.message
    });
  }
};

// @desc    Block match
// @route   PATCH /api/matches/:matchId/block
// @access  Private
const blockMatch = async (req, res) => {
  try {
    const { matchId } = req.params;

    const match = await Match.findOne({
      _id: matchId,
      $or: [{ user1: req.userId }, { user2: req.userId }]
    });

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    const userKey = match.user1.toString() === req.userId.toString() ? 'user1' : 'user2';
    match.userActions[userKey].isBlocked = true;
    match.status = 'blocked';
    await match.save();

    res.json({
      success: true,
      message: 'Match blocked successfully'
    });

  } catch (error) {
    console.error('Block match error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to block match',
      error: error.message
    });
  }
};

// @desc    Toggle favorite match
// @route   PATCH /api/matches/:matchId/favorite
// @access  Private
const favoriteMatch = async (req, res) => {
  try {
    const { matchId } = req.params;

    const match = await Match.findOne({
      _id: matchId,
      $or: [{ user1: req.userId }, { user2: req.userId }]
    });

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    await match.toggleFavorite(req.userId);

    const userKey = match.user1.toString() === req.userId.toString() ? 'user1' : 'user2';
    const isFavorite = match.userActions[userKey].isFavorite;

    res.json({
      success: true,
      message: `Match ${isFavorite ? 'added to' : 'removed from'} favorites`,
      data: { isFavorite }
    });

  } catch (error) {
    console.error('Favorite match error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update favorite status',
      error: error.message
    });
  }
};

// @desc    Get match statistics
// @route   GET /api/matches/stats
// @access  Private
const getMatchStats = async (req, res) => {
  try {
    const stats = await Match.aggregate([
      {
        $match: {
          $or: [{ user1: req.userId }, { user2: req.userId }]
        }
      },
      {
        $group: {
          _id: null,
          totalMatches: { $sum: 1 },
          activeMatches: {
            $sum: {
              $cond: [{ $eq: ['$status', 'active'] }, 1, 0]
            }
          },
          totalMessages: {
            $sum: { $size: '$messages' }
          },
          avgMessagesPerMatch: {
            $avg: { $size: '$messages' }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalMatches: 0,
      activeMatches: 0,
      totalMessages: 0,
      avgMessagesPerMatch: 0
    };

    res.json({
      success: true,
      data: { stats: result }
    });

  } catch (error) {
    console.error('Get match stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get match statistics',
      error: error.message
    });
  }
};

module.exports = {
  getMatches,
  getMatch,
  getMessages,
  sendMessage,
  archiveMatch,
  blockMatch,
  favoriteMatch,
  getMatchStats
};