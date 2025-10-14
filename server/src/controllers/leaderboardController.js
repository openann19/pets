/**
 * Leaderboard Controller
 * Handles leaderboard functionality and scoring
 */

const User = require('../models/User');
const Pet = require('../models/Pet');
const Match = require('../models/Match');
const Message = require('../models/Message');
const LeaderboardScore = require('../models/LeaderboardScore');
const logger = require('../utils/logger');

/**
 * Get leaderboard entries for a specific category and timeframe
 * @route GET /api/leaderboard/:category/:timeframe
 * @access Public
 */
const getLeaderboard = async (req, res) => {
  try {
    const { category, timeframe } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Validate category
    const validCategories = ['overall', 'streak', 'matches', 'engagement'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category. Must be one of: overall, streak, matches, engagement'
      });
    }

    // Validate timeframe
    const validTimeframes = ['daily', 'weekly', 'monthly', 'allTime'];
    if (!validTimeframes.includes(timeframe)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid timeframe. Must be one of: daily, weekly, monthly, allTime'
      });
    }

    // Calculate date range
    const dateRange = getDateRange(timeframe);
    
    // Get leaderboard entries based on category
    let entries = [];
    
    switch (category) {
      case 'overall':
        entries = await getOverallLeaderboard(dateRange, limit, offset);
        break;
      case 'streak':
        entries = await getStreakLeaderboard(dateRange, limit, offset);
        break;
      case 'matches':
        entries = await getMatchesLeaderboard(dateRange, limit, offset);
        break;
      case 'engagement':
        entries = await getEngagementLeaderboard(dateRange, limit, offset);
        break;
    }

    // Get current user's rank if authenticated
    let userRank = null;
    if (req.userId) {
      userRank = await getUserRank(req.userId, category, timeframe);
    }

    res.json({
      success: true,
      data: {
        entries,
        userRank,
        category,
        timeframe,
        total: entries.length
      }
    });

  } catch (error) {
    logger.error('Leaderboard fetch error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard',
      error: error.message
    });
  }
};

/**
 * Get user's rank and score
 * @route GET /api/leaderboard/user/:userId
 * @access Public
 */
const getUserRank = async (req, res) => {
  try {
    const { userId } = req.params;
    const { category = 'overall', timeframe = 'weekly' } = req.query;

    // Validate category and timeframe
    const validCategories = ['overall', 'streak', 'matches', 'engagement'];
    const validTimeframes = ['daily', 'weekly', 'monthly', 'allTime'];
    
    if (!validCategories.includes(category) || !validTimeframes.includes(timeframe)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category or timeframe'
      });
    }

    const dateRange = getDateRange(timeframe);
    
    // Get user's score and rank
    const userScore = await calculateUserScore(userId, category, dateRange);
    const rank = await calculateUserRank(userId, category, dateRange);
    
    // Calculate percentile
    const totalUsers = await User.countDocuments({ isActive: true });
    const percentile = totalUsers > 0 ? Math.round(((totalUsers - rank + 1) / totalUsers) * 100) : 0;

    res.json({
      success: true,
      data: {
        userId,
        category,
        timeframe,
        score: userScore,
        rank,
        percentile
      }
    });

  } catch (error) {
    logger.error('User rank fetch error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user rank',
      error: error.message
    });
  }
};

/**
 * Update user's leaderboard score
 * @route POST /api/leaderboard/update
 * @access Private
 */
const updateScore = async (req, res) => {
  try {
    const { category, points } = req.body;
    const userId = req.userId;

    if (!category || typeof points !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Category and points are required'
      });
    }

    const validCategories = ['overall', 'streak', 'matches', 'engagement'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category'
      });
    }

    // Update or create leaderboard score
    await LeaderboardScore.findOneAndUpdate(
      { userId, category },
      { 
        $inc: { score: points },
        $set: { updatedAt: new Date() }
      },
      { upsert: true, new: true }
    );

    logger.info('Leaderboard score updated', { userId, category, points });

    res.json({
      success: true,
      message: 'Score updated successfully'
    });

  } catch (error) {
    logger.error('Score update error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to update score',
      error: error.message
    });
  }
};

// Helper functions

/**
 * Get date range based on timeframe
 */
const getDateRange = (timeframe) => {
  const now = new Date();
  const start = new Date();

  switch (timeframe) {
    case 'daily':
      start.setHours(0, 0, 0, 0);
      break;
    case 'weekly':
      start.setDate(now.getDate() - 7);
      break;
    case 'monthly':
      start.setMonth(now.getMonth() - 1);
      break;
    case 'allTime':
      start.setFullYear(2020); // App launch year
      break;
  }

  return { start, end: now };
};

/**
 * Get overall leaderboard (total points across all activities)
 */
const getOverallLeaderboard = async (dateRange, limit, offset) => {
  const scores = await LeaderboardScore.aggregate([
    {
      $match: {
        category: 'overall',
        updatedAt: { $gte: dateRange.start, $lte: dateRange.end }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $unwind: '$user'
    },
    {
      $match: {
        'user.isActive': true,
        'user.isBlocked': false
      }
    },
    {
      $project: {
        userId: '$user._id',
        username: '$user.username',
        avatar: '$user.avatar',
        score: 1,
        rank: { $rank: { orderBy: { score: -1 } } }
      }
    },
    {
      $sort: { score: -1 }
    },
    {
      $skip: parseInt(offset)
    },
    {
      $limit: parseInt(limit)
    }
  ]);

  return scores.map(entry => ({
    userId: entry.userId.toString(),
    username: entry.username,
    avatar: entry.avatar,
    score: entry.score,
    rank: entry.rank
  }));
};

/**
 * Get streak leaderboard (daily login streaks)
 */
const getStreakLeaderboard = async (dateRange, limit, offset) => {
  const users = await User.aggregate([
    {
      $match: {
        isActive: true,
        isBlocked: false
      }
    },
    {
      $project: {
        userId: '$_id',
        username: 1,
        avatar: 1,
        score: '$analytics.currentStreak',
        rank: { $rank: { orderBy: { 'analytics.currentStreak': -1 } } }
      }
    },
    {
      $sort: { score: -1 }
    },
    {
      $skip: parseInt(offset)
    },
    {
      $limit: parseInt(limit)
    }
  ]);

  return users.map(entry => ({
    userId: entry.userId.toString(),
    username: entry.username,
    avatar: entry.avatar,
    score: entry.score || 0,
    rank: entry.rank
  }));
};

/**
 * Get matches leaderboard (most successful matches)
 */
const getMatchesLeaderboard = async (dateRange, limit, offset) => {
  const matches = await Match.aggregate([
    {
      $match: {
        createdAt: { $gte: dateRange.start, $lte: dateRange.end },
        status: 'matched'
      }
    },
    {
      $group: {
        _id: '$pet1Owner',
        matchCount: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $unwind: '$user'
    },
    {
      $match: {
        'user.isActive': true,
        'user.isBlocked': false
      }
    },
    {
      $project: {
        userId: '$user._id',
        username: '$user.username',
        avatar: '$user.avatar',
        score: '$matchCount',
        rank: { $rank: { orderBy: { matchCount: -1 } } }
      }
    },
    {
      $sort: { score: -1 }
    },
    {
      $skip: parseInt(offset)
    },
    {
      $limit: parseInt(limit)
    }
  ]);

  return matches.map(entry => ({
    userId: entry.userId.toString(),
    username: entry.username,
    avatar: entry.avatar,
    score: entry.score,
    rank: entry.rank
  }));
};

/**
 * Get engagement leaderboard (messages and interactions)
 */
const getEngagementLeaderboard = async (dateRange, limit, offset) => {
  const engagement = await Message.aggregate([
    {
      $match: {
        createdAt: { $gte: dateRange.start, $lte: dateRange.end }
      }
    },
    {
      $group: {
        _id: '$senderId',
        messageCount: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $unwind: '$user'
    },
    {
      $match: {
        'user.isActive': true,
        'user.isBlocked': false
      }
    },
    {
      $project: {
        userId: '$user._id',
        username: '$user.username',
        avatar: '$user.avatar',
        score: '$messageCount',
        rank: { $rank: { orderBy: { messageCount: -1 } } }
      }
    },
    {
      $sort: { score: -1 }
    },
    {
      $skip: parseInt(offset)
    },
    {
      $limit: parseInt(limit)
    }
  ]);

  return engagement.map(entry => ({
    userId: entry.userId.toString(),
    username: entry.username,
    avatar: entry.avatar,
    score: entry.score,
    rank: entry.rank
  }));
};

/**
 * Calculate user's score for a specific category
 */
const calculateUserScore = async (userId, category, dateRange) => {
  switch (category) {
    case 'overall':
      const overallScore = await LeaderboardScore.findOne({ userId, category });
      return overallScore ? overallScore.score : 0;
    
    case 'streak':
      const user = await User.findById(userId);
      return user?.analytics?.currentStreak || 0;
    
    case 'matches':
      const matchCount = await Match.countDocuments({
        $or: [{ pet1Owner: userId }, { pet2Owner: userId }],
        status: 'matched',
        createdAt: { $gte: dateRange.start, $lte: dateRange.end }
      });
      return matchCount;
    
    case 'engagement':
      const messageCount = await Message.countDocuments({
        senderId: userId,
        createdAt: { $gte: dateRange.start, $lte: dateRange.end }
      });
      return messageCount;
    
    default:
      return 0;
  }
};

/**
 * Calculate user's rank for a specific category
 */
const calculateUserRank = async (userId, category, dateRange) => {
  const userScore = await calculateUserScore(userId, category, dateRange);
  
  let count = 0;
  switch (category) {
    case 'overall':
      count = await LeaderboardScore.countDocuments({
        category,
        score: { $gt: userScore },
        updatedAt: { $gte: dateRange.start, $lte: dateRange.end }
      });
      break;
    
    case 'streak':
      count = await User.countDocuments({
        'analytics.currentStreak': { $gt: userScore },
        isActive: true,
        isBlocked: false
      });
      break;
    
    case 'matches':
      // This would require a more complex query to count users with more matches
      count = 0; // Simplified for now
      break;
    
    case 'engagement':
      // This would require a more complex query to count users with more messages
      count = 0; // Simplified for now
      break;
  }
  
  return count + 1;
};

module.exports = {
  getLeaderboard,
  getUserRank,
  updateScore
};
