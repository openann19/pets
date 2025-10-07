const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// In-memory storage for active calls (in production, use Redis)
const activeCalls = new Map();
const callParticipants = new Map();

/**
 * Initiate a video call
 * @route POST /api/video/call
 * @body {string} targetUserId - ID of user to call
 * @body {string} petId - Optional pet ID for context
 * @returns Call session details
 */
router.post('/call', authenticateToken, async (req, res) => {
  try {
    const { targetUserId, petId } = req.body;
    const callerId = req.userId;

    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: 'Target user ID is required'
      });
    }

    if (targetUserId === callerId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot call yourself'
      });
    }

    // Check if users are matched (optional security check)
    // This would query your matches collection
    // const areMatched = await checkIfUsersAreMatched(callerId, targetUserId);
    
    // Generate unique call ID
    const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create call session
    const callSession = {
      id: callId,
      callerId,
      targetUserId,
      petId,
      status: 'initiating',
      startedAt: new Date(),
      participants: [callerId],
      iceServers: getIceServers()
    };

    // Store call session
    activeCalls.set(callId, callSession);
    callParticipants.set(callerId, callId);

    // Emit call invitation through WebSocket (if connected)
    if (global.io) {
      global.io.to(`user_${targetUserId}`).emit('incoming_call', {
        callId,
        callerId,
        callerName: req.user?.name || 'User',
        petId
      });
    }

    logger.info(`Video call initiated: ${callId} from ${callerId} to ${targetUserId}`);

    res.json({
      success: true,
      data: {
        callId,
        iceServers: callSession.iceServers,
        status: 'initiating'
      }
    });

  } catch (error) {
    logger.error('Error initiating video call:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate call'
    });
  }
});

/**
 * Join an existing video call
 * @route POST /api/video/join
 * @body {string} callId - ID of call to join
 */
router.post('/join', authenticateToken, async (req, res) => {
  try {
    const { callId } = req.body;
    const userId = req.userId;

    if (!callId) {
      return res.status(400).json({
        success: false,
        message: 'Call ID is required'
      });
    }

    const callSession = activeCalls.get(callId);
    
    if (!callSession) {
      return res.status(404).json({
        success: false,
        message: 'Call session not found'
      });
    }

    // Verify user is authorized to join this call
    if (callSession.targetUserId !== userId && callSession.callerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to join this call'
      });
    }

    // Add participant if not already in call
    if (!callSession.participants.includes(userId)) {
      callSession.participants.push(userId);
      callSession.status = 'active';
    }

    // Track participant's current call
    callParticipants.set(userId, callId);

    // Notify other participants
    if (global.io) {
      callSession.participants.forEach(participantId => {
        if (participantId !== userId) {
          global.io.to(`user_${participantId}`).emit('participant_joined', {
            callId,
            userId,
            userName: req.user?.name || 'User'
          });
        }
      });
    }

    logger.info(`User ${userId} joined call ${callId}`);

    res.json({
      success: true,
      data: {
        callId,
        participants: callSession.participants,
        iceServers: callSession.iceServers,
        status: callSession.status
      }
    });

  } catch (error) {
    logger.error('Error joining video call:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join call'
    });
  }
});

/**
 * Leave a video call
 * @route POST /api/video/leave
 * @body {string} callId - ID of call to leave
 */
router.post('/leave', authenticateToken, async (req, res) => {
  try {
    const { callId } = req.body;
    const userId = req.userId;

    const callSession = activeCalls.get(callId);
    
    if (!callSession) {
      return res.status(404).json({
        success: false,
        message: 'Call session not found'
      });
    }

    // Remove participant
    callSession.participants = callSession.participants.filter(id => id !== userId);
    callParticipants.delete(userId);

    // If no participants left, end the call
    if (callSession.participants.length === 0) {
      callSession.status = 'ended';
      callSession.endedAt = new Date();
      
      // Keep call data for a short time for analytics
      setTimeout(() => {
        activeCalls.delete(callId);
      }, 60000); // Delete after 1 minute
    }

    // Notify remaining participants
    if (global.io) {
      callSession.participants.forEach(participantId => {
        global.io.to(`user_${participantId}`).emit('participant_left', {
          callId,
          userId,
          remainingParticipants: callSession.participants
        });
      });
    }

    logger.info(`User ${userId} left call ${callId}`);

    res.json({
      success: true,
      message: 'Successfully left the call'
    });

  } catch (error) {
    logger.error('Error leaving video call:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to leave call'
    });
  }
});

/**
 * Exchange WebRTC signaling data
 * @route POST /api/video/signal
 * @body {string} callId - Call ID
 * @body {string} targetUserId - Target user for signal
 * @body {object} signal - WebRTC signal data (offer/answer/ice candidate)
 */
router.post('/signal', authenticateToken, async (req, res) => {
  try {
    const { callId, targetUserId, signal } = req.body;
    const senderId = req.userId;

    if (!callId || !targetUserId || !signal) {
      return res.status(400).json({
        success: false,
        message: 'Call ID, target user ID, and signal are required'
      });
    }

    const callSession = activeCalls.get(callId);
    
    if (!callSession) {
      return res.status(404).json({
        success: false,
        message: 'Call session not found'
      });
    }

    // Verify both users are in the call
    if (!callSession.participants.includes(senderId) || 
        !callSession.participants.includes(targetUserId)) {
      return res.status(403).json({
        success: false,
        message: 'Both users must be in the call'
      });
    }

    // Forward signal through WebSocket
    if (global.io) {
      global.io.to(`user_${targetUserId}`).emit('webrtc_signal', {
        callId,
        senderId,
        signal
      });
      
      logger.debug(`WebRTC signal forwarded from ${senderId} to ${targetUserId}`);
    }

    res.json({
      success: true,
      message: 'Signal sent successfully'
    });

  } catch (error) {
    logger.error('Error handling WebRTC signal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send signal'
    });
  }
});

/**
 * Get call status
 * @route GET /api/video/status/:callId
 */
router.get('/status/:callId', authenticateToken, async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = req.userId;

    const callSession = activeCalls.get(callId);
    
    if (!callSession) {
      return res.status(404).json({
        success: false,
        message: 'Call session not found'
      });
    }

    // Only participants can check call status
    if (!callSession.participants.includes(userId) && 
        callSession.callerId !== userId && 
        callSession.targetUserId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this call status'
      });
    }

    res.json({
      success: true,
      data: {
        callId: callSession.id,
        status: callSession.status,
        participants: callSession.participants,
        startedAt: callSession.startedAt,
        endedAt: callSession.endedAt
      }
    });

  } catch (error) {
    logger.error('Error getting call status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get call status'
    });
  }
});

/**
 * Reject an incoming call
 * @route POST /api/video/reject
 * @body {string} callId - ID of call to reject
 * @body {string} reason - Optional rejection reason
 */
router.post('/reject', authenticateToken, async (req, res) => {
  try {
    const { callId, reason } = req.body;
    const userId = req.userId;

    const callSession = activeCalls.get(callId);
    
    if (!callSession) {
      return res.status(404).json({
        success: false,
        message: 'Call session not found'
      });
    }

    // Only the target user can reject the call
    if (callSession.targetUserId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reject this call'
      });
    }

    // Update call status
    callSession.status = 'rejected';
    callSession.rejectionReason = reason;
    callSession.endedAt = new Date();

    // Notify caller
    if (global.io) {
      global.io.to(`user_${callSession.callerId}`).emit('call_rejected', {
        callId,
        reason: reason || 'Call rejected'
      });
    }

    // Clean up after a delay
    setTimeout(() => {
      activeCalls.delete(callId);
    }, 10000);

    logger.info(`Call ${callId} rejected by ${userId}`);

    res.json({
      success: true,
      message: 'Call rejected successfully'
    });

  } catch (error) {
    logger.error('Error rejecting call:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject call'
    });
  }
});

/**
 * Get active calls for current user
 * @route GET /api/video/active
 */
router.get('/active', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const currentCallId = callParticipants.get(userId);

    if (!currentCallId) {
      return res.json({
        success: true,
        data: {
          hasActiveCall: false,
          call: null
        }
      });
    }

    const callSession = activeCalls.get(currentCallId);
    
    if (!callSession || callSession.status === 'ended') {
      callParticipants.delete(userId);
      return res.json({
        success: true,
        data: {
          hasActiveCall: false,
          call: null
        }
      });
    }

    res.json({
      success: true,
      data: {
        hasActiveCall: true,
        call: {
          callId: callSession.id,
          status: callSession.status,
          participants: callSession.participants,
          startedAt: callSession.startedAt
        }
      }
    });

  } catch (error) {
    logger.error('Error getting active calls:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get active calls'
    });
  }
});

// Helper function to get ICE servers configuration
function getIceServers() {
  const servers = [
    {
      urls: 'stun:stun.l.google.com:19302'
    },
    {
      urls: 'stun:stun1.l.google.com:19302'
    }
  ];

  // Add TURN servers if configured
  if (process.env.TURN_SERVER_URL) {
    servers.push({
      urls: process.env.TURN_SERVER_URL,
      username: process.env.TURN_USERNAME || '',
      credential: process.env.TURN_CREDENTIAL || ''
    });
  }

  return servers;
}

module.exports = router;