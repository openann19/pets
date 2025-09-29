const jwt = require('jsonwebtoken');
const Match = require('../models/Match');
const User = require('../models/User');

const chatSocket = (io) => {
  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password -refreshTokens');
      
      if (!user || !user.isActive || user.isBlocked) {
        return next(new Error('Authentication error: Invalid user'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.firstName} connected: ${socket.id}`);

    // Join user to their personal room for notifications
    socket.join(`user_${socket.userId}`);

    // Handle joining match rooms
    socket.on('join_match', async (matchId) => {
      try {
        // Verify user is part of this match
        const match = await Match.findOne({
          _id: matchId,
          $or: [
            { user1: socket.userId },
            { user2: socket.userId }
          ]
        });

        if (!match) {
          socket.emit('error', { message: 'Match not found or access denied' });
          return;
        }

        // Check if match is blocked
        if (match.isUserBlocked(socket.userId)) {
          socket.emit('error', { message: 'Cannot join blocked match' });
          return;
        }

        socket.join(`match_${matchId}`);
        console.log(`User ${socket.userId} joined match ${matchId}`);

        // Mark messages as read
        await match.markMessagesAsRead(socket.userId);

        // Notify other user that this user is online
        socket.to(`match_${matchId}`).emit('user_online', {
          userId: socket.userId,
          userName: socket.user.firstName
        });

      } catch (error) {
        console.error('Join match error:', error);
        socket.emit('error', { message: 'Failed to join match' });
      }
    });

    // Handle leaving match rooms
    socket.on('leave_match', (matchId) => {
      socket.leave(`match_${matchId}`);
      
      // Notify other user that this user went offline
      socket.to(`match_${matchId}`).emit('user_offline', {
        userId: socket.userId
      });
      
      console.log(`User ${socket.userId} left match ${matchId}`);
    });

    // Handle sending messages
    socket.on('send_message', async (data) => {
      try {
        const { matchId, content, messageType = 'text', attachments = [] } = data;

        if (!content || content.trim().length === 0) {
          socket.emit('error', { message: 'Message content is required' });
          return;
        }

        if (content.length > 1000) {
          socket.emit('error', { message: 'Message too long (max 1000 characters)' });
          return;
        }

        // Find and validate match
        const match = await Match.findOne({
          _id: matchId,
          $or: [
            { user1: socket.userId },
            { user2: socket.userId }
          ]
        }).populate('user1 user2', 'firstName lastName avatar');

        if (!match) {
          socket.emit('error', { message: 'Match not found' });
          return;
        }

        if (match.status !== 'active') {
          socket.emit('error', { message: 'Cannot send message to inactive match' });
          return;
        }

        if (match.isUserBlocked(socket.userId)) {
          socket.emit('error', { message: 'Cannot send message to blocked match' });
          return;
        }

        // Add message to match
        const message = {
          sender: socket.userId,
          content: content.trim(),
          messageType,
          attachments,
          sentAt: new Date(),
          readBy: [{
            user: socket.userId,
            readAt: new Date()
          }]
        };

        match.messages.push(message);
        match.lastActivity = new Date();
        match.lastMessageAt = new Date();
        await match.save();

        // Get the saved message with populated sender
        const savedMessage = match.messages[match.messages.length - 1];
        savedMessage.sender = socket.user;

        // Emit message to all users in the match room
        io.to(`match_${matchId}`).emit('new_message', {
          matchId,
          message: savedMessage
        });

        // Send push notification to other user if they're offline
        const otherUserId = match.user1._id.toString() === socket.userId 
          ? match.user2._id.toString() 
          : match.user1._id.toString();

        const otherUserSockets = await io.in(`user_${otherUserId}`).fetchSockets();
        
        if (otherUserSockets.length === 0) {
          // Other user is offline, send push notification
          const otherUser = match.user1._id.toString() === socket.userId ? match.user2 : match.user1;
          
          if (otherUser.preferences.notifications.messages) {
            // Here you would integrate with a push notification service
            // For now, we'll emit to their user room in case they connect
            io.to(`user_${otherUserId}`).emit('notification', {
              type: 'new_message',
              title: `New message from ${socket.user.firstName}`,
              body: content.substring(0, 100),
              matchId,
              senderId: socket.userId
            });
          }
        }

        console.log(`Message sent in match ${matchId} by user ${socket.userId}`);

      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
      const { matchId, isTyping } = data;
      socket.to(`match_${matchId}`).emit('user_typing', {
        userId: socket.userId,
        userName: socket.user.firstName,
        isTyping: isTyping
      });
    });

    // Handle message read receipts
    socket.on('mark_messages_read', async (data) => {
      try {
        const { matchId } = data;

        const match = await Match.findOne({
          _id: matchId,
          $or: [
            { user1: socket.userId },
            { user2: socket.userId }
          ]
        });

        if (match) {
          await match.markMessagesAsRead(socket.userId);
          
          // Notify other user that messages were read
          socket.to(`match_${matchId}`).emit('messages_read', {
            userId: socket.userId,
            readAt: new Date()
          });
        }

      } catch (error) {
        console.error('Mark messages read error:', error);
      }
    });

    // Handle match actions (archive, block, etc.)
    socket.on('match_action', async (data) => {
      try {
        const { matchId, action } = data;

        const match = await Match.findOne({
          _id: matchId,
          $or: [
            { user1: socket.userId },
            { user2: socket.userId }
          ]
        });

        if (!match) {
          socket.emit('error', { message: 'Match not found' });
          return;
        }

        switch (action) {
          case 'archive':
            await match.toggleArchive(socket.userId);
            socket.emit('match_archived', { matchId });
            break;

          case 'unarchive':
            await match.toggleArchive(socket.userId);
            socket.emit('match_unarchived', { matchId });
            break;

          case 'favorite':
            await match.toggleFavorite(socket.userId);
            socket.emit('match_favorited', { matchId });
            break;

          case 'block':
            const userKey = match.user1.toString() === socket.userId ? 'user1' : 'user2';
            match.userActions[userKey].isBlocked = true;
            await match.save();
            
            // Remove both users from the match room
            io.to(`match_${matchId}`).emit('match_blocked', { matchId });
            break;

          default:
            socket.emit('error', { message: 'Invalid match action' });
        }

      } catch (error) {
        console.error('Match action error:', error);
        socket.emit('error', { message: 'Failed to perform match action' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      console.log(`User ${socket.user.firstName} disconnected: ${reason}`);
      
      // Update last seen time
      User.findByIdAndUpdate(socket.userId, {
        'analytics.lastActive': new Date()
      }).catch(console.error);

      // Notify all match rooms that user went offline
      socket.rooms.forEach(room => {
        if (room.startsWith('match_')) {
          socket.to(room).emit('user_offline', {
            userId: socket.userId
          });
        }
      });
    });

    // Handle connection errors
    socket.on('error', (error) => {
      console.error('Socket error for user', socket.userId, ':', error);
    });
  });

  return io;
};

module.exports = chatSocket;