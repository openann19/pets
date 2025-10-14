const User = require('../models/User');
const Pet = require('../models/Pet');
const Match = require('../models/Match');
const Message = require('../models/Message');
const Verification = require('../models/Verification');
const Upload = require('../models/Upload');
const Report = require('../models/Report');
const AuditLog = require('../models/AuditLog');
const mongoose = require('mongoose');
const logger = require('../utils/logger');

// Centralized error response handler
const handleError = (res, error, context = '') => {
  const errorMessage = error.message || 'An unexpected error occurred';
  const statusCode = error.statusCode || 500;
  
  // Log error with context
  logger.error(`Admin Controller Error${context ? ` - ${context}` : ''}`, {
    error: errorMessage,
    stack: error.stack,
    statusCode,
    context
  });
  
  // Don't expose internal error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  const responseMessage = isDevelopment ? errorMessage : 'An error occurred while processing your request';
  
  res.status(statusCode).json({
    success: false,
    message: responseMessage,
    ...(isDevelopment && { error: errorMessage })
  });
};

// Centralized success response handler
const handleSuccess = (res, data, message = 'Operation completed successfully') => {
  res.json({
    success: true,
    message,
    data
  });
};

// ============= USER MANAGEMENT =============

// @desc    Get all users with pagination and filtering
// @route   GET /api/admin/users
// @access  Admin
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const filter = {};
    
    // Apply filters
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.role) {
      filter.role = req.query.role;
    }
    if (req.query.search) {
      filter.$or = [
        { firstName: { $regex: req.query.search, $options: 'i' } },
        { lastName: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    if (req.query.verified) {
      filter.isVerified = req.query.verified === 'true';
    }

    const users = await User.find(filter)
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('pets', 'name species photos')
      .lean();

    const total = await User.countDocuments(filter);

    // Log admin action
    await AuditLog.create({
      adminId: req.userId,
      action: 'get_all_users',
      resourceType: 'users',
      details: { filter, page, limit },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    handleError(res, error, 'getAllUsers');
  }
};

// @desc    Get specific user details
// @route   GET /api/admin/users/:id
// @access  Admin
const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -refreshToken')
      .populate('pets')
      .populate('matches')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user activity summary
    const petCount = await Pet.countDocuments({ owner: req.params.id });
    const matchCount = await Match.countDocuments({ 
      $or: [{ user1: req.params.id }, { user2: req.params.id }] 
    });
    const messageCount = await Message.countDocuments({ 
      $or: [{ sender: req.params.id }, { receiver: req.params.id }] 
    });

    // Get recent activity
    const recentActivity = await AuditLog.find({ userId: req.params.id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('action createdAt ipAddress')
      .lean();

    // Log admin action
    await AuditLog.create({
      adminId: req.userId,
      action: 'get_user_details',
      resourceType: 'user',
      resourceId: req.params.id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      data: {
        user,
        stats: {
          petCount,
          matchCount,
          messageCount
        },
        recentActivity
      }
    });

  } catch (error) {
    logger.error('Error getting user details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user details',
      error: error.message
    });
  }
};

// @desc    Suspend user account
// @route   PUT /api/admin/users/:id/suspend
// @access  Admin
const suspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot suspend admin users'
      });
    }

    const suspensionData = {
      status: 'suspended',
      suspensionReason: req.body.reason,
      suspendedAt: new Date(),
      suspendedBy: req.userId,
      suspensionDuration: req.body.duration || null
    };

    // Set suspension end date if duration provided
    if (req.body.duration) {
      suspensionData.suspensionEndsAt = new Date(Date.now() + (req.body.duration * 24 * 60 * 60 * 1000));
    }

    await User.findByIdAndUpdate(req.params.id, suspensionData);

    // Log admin action
    await AuditLog.create({
      adminId: req.userId,
      action: 'suspend_user',
      resourceType: 'user',
      resourceId: req.params.id,
      details: {
        reason: req.body.reason,
        duration: req.body.duration,
        previousStatus: user.status
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    logger.info(`User ${req.params.id} suspended by admin ${req.userId}`, suspensionData);

    res.json({
      success: true,
      message: 'User suspended successfully',
      data: suspensionData
    });

  } catch (error) {
    logger.error('Error suspending user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to suspend user',
      error: error.message
    });
  }
};

// @desc    Ban user account permanently
// @route   PUT /api/admin/users/:id/ban
// @access  Admin
const banUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot ban admin users'
      });
    }

    const banData = {
      status: 'banned',
      banReason: req.body.reason,
      bannedAt: new Date(),
      bannedBy: req.userId
    };

    await User.findByIdAndUpdate(req.params.id, banData);

    // Deactivate all user's pets
    await Pet.updateMany({ owner: req.params.id }, { isActive: false });

    // Log admin action
    await AuditLog.create({
      adminId: req.userId,
      action: 'ban_user',
      resourceType: 'user',
      resourceId: req.params.id,
      details: {
        reason: req.body.reason,
        previousStatus: user.status
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    logger.warn(`User ${req.params.id} banned by admin ${req.userId}`, banData);

    res.json({
      success: true,
      message: 'User banned successfully',
      data: banData
    });

  } catch (error) {
    logger.error('Error banning user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to ban user',
      error: error.message
    });
  }
};

// @desc    Activate suspended/banned user
// @route   PUT /api/admin/users/:id/activate
// @access  Admin
const activateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const activationData = {
      status: 'active',
      activationReason: req.body.reason,
      activatedAt: new Date(),
      activatedBy: req.userId,
      suspensionReason: null,
      suspensionEndsAt: null,
      banReason: null
    };

    await User.findByIdAndUpdate(req.params.id, activationData);

    // Reactivate all user's pets
    await Pet.updateMany({ owner: req.params.id }, { isActive: true });

    // Log admin action
    await AuditLog.create({
      adminId: req.userId,
      action: 'activate_user',
      resourceType: 'user',
      resourceId: req.params.id,
      details: {
        reason: req.body.reason,
        previousStatus: user.status
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    logger.info(`User ${req.params.id} activated by admin ${req.userId}`, activationData);

    res.json({
      success: true,
      message: 'User activated successfully',
      data: activationData
    });

  } catch (error) {
    logger.error('Error activating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to activate user',
      error: error.message
    });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Admin
const updateUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const oldRole = user.role;
    const newRole = req.body.role;

    // Prevent demoting other admins
    if (user.role === 'admin' && newRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot demote admin users'
      });
    }

    const roleUpdateData = {
      role: newRole,
      roleUpdatedAt: new Date(),
      roleUpdatedBy: req.userId,
      roleUpdateReason: req.body.reason
    };

    await User.findByIdAndUpdate(req.params.id, roleUpdateData);

    // Log admin action
    await AuditLog.create({
      adminId: req.userId,
      action: 'update_user_role',
      resourceType: 'user',
      resourceId: req.params.id,
      details: {
        oldRole,
        newRole,
        reason: req.body.reason
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    logger.info(`User ${req.params.id} role updated from ${oldRole} to ${newRole} by admin ${req.userId}`);

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: roleUpdateData
    });

  } catch (error) {
    logger.error('Error updating user role:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user role',
      error: error.message
    });
  }
};

// @desc    Get user activity logs
// @route   GET /api/admin/users/:id/activity
// @access  Admin
const getUserActivity = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const activities = await AuditLog.find({ userId: req.params.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await AuditLog.countDocuments({ userId: req.params.id });

    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Error getting user activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user activity',
      error: error.message
    });
  }
};

// ============= CHAT MODERATION =============

// @desc    Get all chats with pagination
// @route   GET /api/admin/chats
// @access  Admin
const getAllChats = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.blocked) {
      filter.isBlocked = req.query.blocked === 'true';
    }

    const chats = await Match.find(filter)
      .populate('user1', 'firstName lastName email')
      .populate('user2', 'firstName lastName email')
      .populate('pet1', 'name species photos')
      .populate('pet2', 'name species photos')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Match.countDocuments(filter);

    // Get message counts for each chat
    const chatsWithMessageCounts = await Promise.all(
      chats.map(async (chat) => {
        const messageCount = await Message.countDocuments({ matchId: chat._id });
        return { ...chat, messageCount };
      })
    );

    res.json({
      success: true,
      data: {
        chats: chatsWithMessageCounts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Error getting all chats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chats',
      error: error.message
    });
  }
};

// @desc    Get specific chat details
// @route   GET /api/admin/chats/:id
// @access  Admin
const getChatDetails = async (req, res) => {
  try {
    const chat = await Match.findById(req.params.id)
      .populate('user1', 'firstName lastName email')
      .populate('user2', 'firstName lastName email')
      .populate('pet1', 'name species photos')
      .populate('pet2', 'name species photos')
      .lean();

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Get recent messages
    const messages = await Message.find({ matchId: req.params.id })
      .populate('sender', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json({
      success: true,
      data: {
        chat,
        messages: messages.reverse()
      }
    });

  } catch (error) {
    logger.error('Error getting chat details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chat details',
      error: error.message
    });
  }
};

// @desc    Delete specific message
// @route   DELETE /api/admin/chats/:id/messages/:messageId
// @access  Admin
const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    if (message.matchId.toString() !== req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'Message does not belong to this chat'
      });
    }

    // Soft delete the message
    await Message.findByIdAndUpdate(req.params.messageId, {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: req.userId,
      deletionReason: req.body.reason
    });

    // Log admin action
    await AuditLog.create({
      adminId: req.userId,
      action: 'delete_message',
      resourceType: 'message',
      resourceId: req.params.messageId,
      details: {
        chatId: req.params.id,
        reason: req.body.reason,
        senderId: message.sender
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    logger.warn(`Message ${req.params.messageId} deleted by admin ${req.userId}`, {
      reason: req.body.reason,
      chatId: req.params.id
    });

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    logger.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message',
      error: error.message
    });
  }
};

// @desc    Block chat between users
// @route   PUT /api/admin/chats/:id/block
// @access  Admin
const blockChat = async (req, res) => {
  try {
    const chat = await Match.findById(req.params.id);
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    const blockData = {
      isBlocked: true,
      blockedAt: new Date(),
      blockedBy: req.userId,
      blockReason: req.body.reason,
      blockDuration: req.body.duration || null
    };

    // Set block end date if duration provided
    if (req.body.duration) {
      blockData.blockEndsAt = new Date(Date.now() + (req.body.duration * 24 * 60 * 60 * 1000));
    }

    await Match.findByIdAndUpdate(req.params.id, blockData);

    // Log admin action
    await AuditLog.create({
      adminId: req.userId,
      action: 'block_chat',
      resourceType: 'chat',
      resourceId: req.params.id,
      details: {
        reason: req.body.reason,
        duration: req.body.duration,
        user1Id: chat.user1,
        user2Id: chat.user2
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    logger.warn(`Chat ${req.params.id} blocked by admin ${req.userId}`, blockData);

    res.json({
      success: true,
      message: 'Chat blocked successfully',
      data: blockData
    });

  } catch (error) {
    logger.error('Error blocking chat:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to block chat',
      error: error.message
    });
  }
};

// @desc    Unblock chat
// @route   PUT /api/admin/chats/:id/unblock
// @access  Admin
const unblockChat = async (req, res) => {
  try {
    const chat = await Match.findById(req.params.id);
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    const unblockData = {
      isBlocked: false,
      unblockedAt: new Date(),
      unblockedBy: req.userId,
      unblockReason: req.body.reason,
      blockReason: null,
      blockEndsAt: null
    };

    await Match.findByIdAndUpdate(req.params.id, unblockData);

    // Log admin action
    await AuditLog.create({
      adminId: req.userId,
      action: 'unblock_chat',
      resourceType: 'chat',
      resourceId: req.params.id,
      details: {
        reason: req.body.reason,
        user1Id: chat.user1,
        user2Id: chat.user2
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    logger.info(`Chat ${req.params.id} unblocked by admin ${req.userId}`, unblockData);

    res.json({
      success: true,
      message: 'Chat unblocked successfully',
      data: unblockData
    });

  } catch (error) {
    logger.error('Error unblocking chat:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unblock chat',
      error: error.message
    });
  }
};

// @desc    Get chat analytics
// @route   GET /api/admin/chats/analytics
// @access  Admin
const getChatAnalytics = async (req, res) => {
  try {
    const totalChats = await Match.countDocuments();
    const activeChats = await Match.countDocuments({ status: 'active' });
    const blockedChats = await Match.countDocuments({ isBlocked: true });
    const totalMessages = await Message.countDocuments();
    const deletedMessages = await Message.countDocuments({ isDeleted: true });

    // Recent activity
    const recentChats = await Match.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    const recentMessages = await Message.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    res.json({
      success: true,
      data: {
        totalChats,
        activeChats,
        blockedChats,
        totalMessages,
        deletedMessages,
        recentActivity: {
          chats24h: recentChats,
          messages24h: recentMessages
        }
      }
    });

  } catch (error) {
    logger.error('Error getting chat analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chat analytics',
      error: error.message
    });
  }
};

// ============= UPLOAD MANAGEMENT =============

// @desc    Get all uploads with filtering
// @route   GET /api/admin/uploads
// @access  Admin
const getAllUploads = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.type) {
      filter.type = req.query.type;
    }
    if (req.query.userId) {
      filter.userId = req.query.userId;
    }

    const uploads = await Upload.find(filter)
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Upload.countDocuments(filter);

    res.json({
      success: true,
      data: {
        uploads,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Error getting all uploads:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get uploads',
      error: error.message
    });
  }
};

// @desc    Approve upload
// @route   PUT /api/admin/uploads/:id/approve
// @access  Admin
const approveUpload = async (req, res) => {
  try {
    const upload = await Upload.findById(req.params.id);
    
    if (!upload) {
      return res.status(404).json({
        success: false,
        message: 'Upload not found'
      });
    }

    const approvalData = {
      status: 'approved',
      approvedAt: new Date(),
      approvedBy: req.userId,
      approvalNotes: req.body.notes || null
    };

    await Upload.findByIdAndUpdate(req.params.id, approvalData);

    // Log admin action
    await AuditLog.create({
      adminId: req.userId,
      action: 'approve_upload',
      resourceType: 'upload',
      resourceId: req.params.id,
      details: {
        notes: req.body.notes,
        userId: upload.userId,
        type: upload.type
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    logger.info(`Upload ${req.params.id} approved by admin ${req.userId}`, approvalData);

    res.json({
      success: true,
      message: 'Upload approved successfully',
      data: approvalData
    });

  } catch (error) {
    logger.error('Error approving upload:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve upload',
      error: error.message
    });
  }
};

// @desc    Reject upload
// @route   PUT /api/admin/uploads/:id/reject
// @access  Admin
const rejectUpload = async (req, res) => {
  try {
    const upload = await Upload.findById(req.params.id);
    
    if (!upload) {
      return res.status(404).json({
        success: false,
        message: 'Upload not found'
      });
    }

    const rejectionData = {
      status: 'rejected',
      rejectedAt: new Date(),
      rejectedBy: req.userId,
      rejectionReason: req.body.reason,
      rejectionNotes: req.body.notes || null
    };

    await Upload.findByIdAndUpdate(req.params.id, rejectionData);

    // Log admin action
    await AuditLog.create({
      adminId: req.userId,
      action: 'reject_upload',
      resourceType: 'upload',
      resourceId: req.params.id,
      details: {
        reason: req.body.reason,
        notes: req.body.notes,
        userId: upload.userId,
        type: upload.type
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    logger.warn(`Upload ${req.params.id} rejected by admin ${req.userId}`, rejectionData);

    res.json({
      success: true,
      message: 'Upload rejected successfully',
      data: rejectionData
    });

  } catch (error) {
    logger.error('Error rejecting upload:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject upload',
      error: error.message
    });
  }
};

// @desc    Delete upload
// @route   DELETE /api/admin/uploads/:id
// @access  Admin
const deleteUpload = async (req, res) => {
  try {
    const upload = await Upload.findById(req.params.id);
    
    if (!upload) {
      return res.status(404).json({
        success: false,
        message: 'Upload not found'
      });
    }

    // Soft delete
    await Upload.findByIdAndUpdate(req.params.id, {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: req.userId,
      deletionReason: req.body.reason
    });

    // Log admin action
    await AuditLog.create({
      adminId: req.userId,
      action: 'delete_upload',
      resourceType: 'upload',
      resourceId: req.params.id,
      details: {
        reason: req.body.reason,
        userId: upload.userId,
        type: upload.type
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    logger.warn(`Upload ${req.params.id} deleted by admin ${req.userId}`, {
      reason: req.body.reason
    });

    res.json({
      success: true,
      message: 'Upload deleted successfully'
    });

  } catch (error) {
    logger.error('Error deleting upload:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete upload',
      error: error.message
    });
  }
};

// @desc    Get upload analytics
// @route   GET /api/admin/uploads/analytics
// @access  Admin
const getUploadAnalytics = async (req, res) => {
  try {
    const totalUploads = await Upload.countDocuments();
    const pendingUploads = await Upload.countDocuments({ status: 'pending' });
    const approvedUploads = await Upload.countDocuments({ status: 'approved' });
    const rejectedUploads = await Upload.countDocuments({ status: 'rejected' });

    // Recent activity
    const recentUploads = await Upload.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    res.json({
      success: true,
      data: {
        totalUploads,
        pendingUploads,
        approvedUploads,
        rejectedUploads,
        recentActivity: {
          uploads24h: recentUploads
        }
      }
    });

  } catch (error) {
    logger.error('Error getting upload analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get upload analytics',
      error: error.message
    });
  }
};

// ============= VERIFICATION MANAGEMENT =============

// @desc    Get pending verifications
// @route   GET /api/admin/verifications/pending
// @access  Admin
const getPendingVerifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const verifications = await Verification.find({ status: 'pending' })
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Verification.countDocuments({ status: 'pending' });

    res.json({
      success: true,
      data: {
        verifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Error getting pending verifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pending verifications',
      error: error.message
    });
  }
};

// @desc    Approve verification
// @route   PUT /api/admin/verifications/:id/approve
// @access  Admin
const approveVerification = async (req, res) => {
  try {
    const verification = await Verification.findById(req.params.id);
    
    if (!verification) {
      return res.status(404).json({
        success: false,
        message: 'Verification not found'
      });
    }

    const approvalData = {
      status: 'approved',
      approvedAt: new Date(),
      approvedBy: req.userId,
      approvalNotes: req.body.notes || null
    };

    await Verification.findByIdAndUpdate(req.params.id, approvalData);

    // Update user verification status
    await User.findByIdAndUpdate(verification.userId, {
      isVerified: true,
      verifiedAt: new Date()
    });

    // Log admin action
    await AuditLog.create({
      adminId: req.userId,
      action: 'approve_verification',
      resourceType: 'verification',
      resourceId: req.params.id,
      details: {
        notes: req.body.notes,
        userId: verification.userId
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    logger.info(`Verification ${req.params.id} approved by admin ${req.userId}`, approvalData);

    res.json({
      success: true,
      message: 'Verification approved successfully',
      data: approvalData
    });

  } catch (error) {
    logger.error('Error approving verification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve verification',
      error: error.message
    });
  }
};

// @desc    Reject verification
// @route   PUT /api/admin/verifications/:id/reject
// @access  Admin
const rejectVerification = async (req, res) => {
  try {
    const verification = await Verification.findById(req.params.id);
    
    if (!verification) {
      return res.status(404).json({
        success: false,
        message: 'Verification not found'
      });
    }

    const rejectionData = {
      status: 'rejected',
      rejectedAt: new Date(),
      rejectedBy: req.userId,
      rejectionReason: req.body.reason,
      rejectionNotes: req.body.notes || null
    };

    await Verification.findByIdAndUpdate(req.params.id, rejectionData);

    // Log admin action
    await AuditLog.create({
      adminId: req.userId,
      action: 'reject_verification',
      resourceType: 'verification',
      resourceId: req.params.id,
      details: {
        reason: req.body.reason,
        notes: req.body.notes,
        userId: verification.userId
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    logger.warn(`Verification ${req.params.id} rejected by admin ${req.userId}`, rejectionData);

    res.json({
      success: true,
      message: 'Verification rejected successfully',
      data: rejectionData
    });

  } catch (error) {
    logger.error('Error rejecting verification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject verification',
      error: error.message
    });
  }
};

// @desc    Get verification history
// @route   GET /api/admin/verifications/history
// @access  Admin
const getVerificationHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const verifications = await Verification.find(filter)
      .populate('userId', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName')
      .populate('rejectedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Verification.countDocuments(filter);

    res.json({
      success: true,
      data: {
        verifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Error getting verification history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get verification history',
      error: error.message
    });
  }
};

// ============= CONTENT MODERATION =============

// @desc    Get reported content
// @route   GET /api/admin/content/reported
// @access  Admin
const getReportedContent = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const reports = await Report.find({ status: 'pending' })
      .populate('reporterId', 'firstName lastName email')
      .populate('reportedUserId', 'firstName lastName email')
      .populate('reportedPetId', 'name species')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Report.countDocuments({ status: 'pending' });

    res.json({
      success: true,
      data: {
        reports,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Error getting reported content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get reported content',
      error: error.message
    });
  }
};

// @desc    Moderate content (approve/reject)
// @route   PUT /api/admin/content/:id/moderate
// @access  Admin
const moderateContent = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    const moderationData = {
      status: req.body.action === 'approve' ? 'resolved' : 'dismissed',
      moderatedAt: new Date(),
      moderatedBy: req.userId,
      moderationReason: req.body.reason,
      moderationNotes: req.body.notes || null
    };

    await Report.findByIdAndUpdate(req.params.id, moderationData);

    // Log admin action
    await AuditLog.create({
      adminId: req.userId,
      action: 'moderate_content',
      resourceType: 'report',
      resourceId: req.params.id,
      details: {
        action: req.body.action,
        reason: req.body.reason,
        notes: req.body.notes,
        reportType: report.type
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    logger.info(`Report ${req.params.id} moderated by admin ${req.userId}`, moderationData);

    res.json({
      success: true,
      message: `Report ${req.body.action === 'approve' ? 'resolved' : 'dismissed'} successfully`,
      data: moderationData
    });

  } catch (error) {
    logger.error('Error moderating content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to moderate content',
      error: error.message
    });
  }
};

// @desc    Get moderation queue
// @route   GET /api/admin/content/moderation-queue
// @access  Admin
const getModerationQueue = async (req, res) => {
  try {
    const pendingReports = await Report.countDocuments({ status: 'pending' });
    const pendingUploads = await Upload.countDocuments({ status: 'pending' });
    const pendingVerifications = await Verification.countDocuments({ status: 'pending' });

    res.json({
      success: true,
      data: {
        pendingReports,
        pendingUploads,
        pendingVerifications,
        totalPending: pendingReports + pendingUploads + pendingVerifications
      }
    });

  } catch (error) {
    logger.error('Error getting moderation queue:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get moderation queue',
      error: error.message
    });
  }
};

// ============= SYSTEM ANALYTICS =============

// @desc    Get admin analytics dashboard data
// @route   GET /api/admin/analytics
// @access  Admin
const getAdminAnalytics = async (req, res) => {
  try {
    // User statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const suspendedUsers = await User.countDocuments({ status: 'suspended' });
    const bannedUsers = await User.countDocuments({ status: 'banned' });
    const verifiedUsers = await User.countDocuments({ isVerified: true });

    // Pet statistics
    const totalPets = await Pet.countDocuments();
    const activePets = await Pet.countDocuments({ isActive: true });

    // Match statistics
    const totalMatches = await Match.countDocuments();
    const activeMatches = await Match.countDocuments({ status: 'active' });
    const blockedMatches = await Match.countDocuments({ isBlocked: true });

    // Message statistics
    const totalMessages = await Message.countDocuments();
    const deletedMessages = await Message.countDocuments({ isDeleted: true });

    // Recent activity (24 hours)
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    const recentPets = await Pet.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    const recentMatches = await Match.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    const recentMessages = await Message.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          suspended: suspendedUsers,
          banned: bannedUsers,
          verified: verifiedUsers,
          recent24h: recentUsers
        },
        pets: {
          total: totalPets,
          active: activePets,
          recent24h: recentPets
        },
        matches: {
          total: totalMatches,
          active: activeMatches,
          blocked: blockedMatches,
          recent24h: recentMatches
        },
        messages: {
          total: totalMessages,
          deleted: deletedMessages,
          recent24h: recentMessages
        }
      }
    });

  } catch (error) {
    logger.error('Error getting admin analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get admin analytics',
      error: error.message
    });
  }
};

// @desc    Get system health status
// @route   GET /api/admin/system/health
// @access  Admin
const getSystemHealth = async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    // Check database connectivity
    const dbTest = await mongoose.connection.db.admin().ping();

    res.json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(uptime),
        database: {
          status: dbStatus,
          connected: dbTest.ok === 1
        },
        memory: {
          used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          external: Math.round(memoryUsage.external / 1024 / 1024)
        },
        cpu: {
          user: cpuUsage.user,
          system: cpuUsage.system
        },
        environment: process.env.NODE_ENV || 'development'
      }
    });

  } catch (error) {
    logger.error('Error getting system health:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get system health',
      error: error.message
    });
  }
};

// @desc    Get error logs
// @route   GET /api/admin/system/errors
// @access  Admin
const getErrorLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const errors = await AuditLog.find({ action: { $regex: /error|fail|exception/i } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await AuditLog.countDocuments({ action: { $regex: /error|fail|exception/i } });

    res.json({
      success: true,
      data: {
        errors,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Error getting error logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get error logs',
      error: error.message
    });
  }
};

// @desc    Get performance metrics
// @route   GET /api/admin/system/performance
// @access  Admin
const getPerformanceMetrics = async (req, res) => {
  try {
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();
    const cpuUsage = process.cpuUsage();

    // Database performance metrics
    const dbStats = await mongoose.connection.db.stats();

    res.json({
      success: true,
      data: {
        server: {
          uptime: Math.floor(uptime),
          memory: {
            used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
            total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
            external: Math.round(memoryUsage.external / 1024 / 1024)
          },
          cpu: {
            user: cpuUsage.user,
            system: cpuUsage.system
          }
        },
        database: {
          collections: dbStats.collections,
          dataSize: Math.round(dbStats.dataSize / 1024 / 1024),
          storageSize: Math.round(dbStats.storageSize / 1024 / 1024),
          indexes: dbStats.indexes,
          indexSize: Math.round(dbStats.indexSize / 1024 / 1024)
        }
      }
    });

  } catch (error) {
    logger.error('Error getting performance metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get performance metrics',
      error: error.message
    });
  }
};

// ============= SECURITY & MONITORING =============

// @desc    Get security alerts
// @route   GET /api/admin/security/alerts
// @access  Admin
const getSecurityAlerts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const alerts = await AuditLog.find({
      action: { $in: ['ban_user', 'suspend_user', 'block_chat', 'delete_message'] }
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await AuditLog.countDocuments({
      action: { $in: ['ban_user', 'suspend_user', 'block_chat', 'delete_message'] }
    });

    res.json({
      success: true,
      data: {
        alerts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Error getting security alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get security alerts',
      error: error.message
    });
  }
};

// @desc    Get suspicious activity
// @route   GET /api/admin/security/suspicious
// @access  Admin
const getSuspiciousActivity = async (req, res) => {
  try {
    // Find users with multiple failed login attempts
    const suspiciousLogins = await AuditLog.aggregate([
      {
        $match: {
          action: 'login_failed',
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: '$ipAddress',
          count: { $sum: 1 },
          lastAttempt: { $max: '$createdAt' }
        }
      },
      {
        $match: { count: { $gte: 5 } }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Find users with rapid account creation
    const rapidSignups = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: '$ipAddress',
          count: { $sum: 1 },
          users: { $push: { id: '$_id', email: '$email', createdAt: '$createdAt' } }
        }
      },
      {
        $match: { count: { $gte: 3 } }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        suspiciousLogins,
        rapidSignups
      }
    });

  } catch (error) {
    logger.error('Error getting suspicious activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get suspicious activity',
      error: error.message
    });
  }
};

// @desc    Get audit logs
// @route   GET /api/admin/security/audit-logs
// @access  Admin
const getAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.action) {
      filter.action = req.query.action;
    }
    if (req.query.adminId) {
      filter.adminId = req.query.adminId;
    }
    if (req.query.resourceType) {
      filter.resourceType = req.query.resourceType;
    }

    const logs = await AuditLog.find(filter)
      .populate('adminId', 'firstName lastName email')
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await AuditLog.countDocuments(filter);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Error getting audit logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get audit logs',
      error: error.message
    });
  }
};

// Import specialized admin controllers
const AdminUserController = require('./admin/AdminUserController');
const AdminChatController = require('./admin/AdminChatController');

// Re-export all admin functions from specialized controllers
module.exports = {
  // User Management
  ...AdminUserController,

  // Chat Moderation
  ...AdminChatController,

  // Placeholder for future controllers - these will be moved to separate files
  // Upload Management, Verification Management, Content Moderation, Analytics
  // will be extracted in future refactoring cycles
};
