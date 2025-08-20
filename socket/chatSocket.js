const Message = require('../models/message');
const Chat = require('../models/chat');
const User = require('../models/userModel');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join chat room
    socket.on('joinChat', async (data) => {
      const { userId, chatId } = data;
      socket.join(chatId);
      socket.userId = userId;
      socket.currentChat = chatId;
      
      // Update last seen
      await User.findByIdAndUpdate(userId, { lastSeen: new Date() });
    });

    // Send message
    socket.on('sendMessage', async (data) => {
      try {
        const { chatId, senderId, content, messageType, mediaUrl } = data;
        
        // Check if sender is blocked
        const chat = await Chat.findById(chatId).populate('participants');
        const sender = await User.findById(senderId);
        
        // Create message
        const message = new Message({
          chatId,
          senderId,
          content,
          messageType: messageType || 'text',
          mediaUrl,
          sentAt: new Date()
        });

        // Set auto-delete if configured
        if (chat.autoDeleteTime > 0) {
          message.autoDeleteAt = new Date(Date.now() + chat.autoDeleteTime * 60 * 60 * 1000);
        }

        await message.save();
        
        // Populate sender info
        await message.populate('senderId', 'username');
        
        // Emit to all participants except restricted users
        chat.participants.forEach(participant => {
          if (!sender.restrictedUsers.includes(participant._id)) {
            io.to(chatId).emit('newMessage', message);
          }
        });

        // Update chat last activity
        await Chat.findByIdAndUpdate(chatId, { lastActivity: new Date() });
        
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Pin/Unpin message (group admin only)
    socket.on('pinMessage', async (data) => {
      try {
        const { chatId, messageId, userId, action } = data;
        
        const chat = await Chat.findById(chatId);
        if (!chat.isGroup || !chat.adminId.equals(userId)) {
          return socket.emit('error', { message: 'Only group admin can pin messages' });
        }

        if (action === 'pin') {
          await Chat.findByIdAndUpdate(chatId, { $addToSet: { pinnedMessages: messageId } });
          await Message.findByIdAndUpdate(messageId, { isPinned: true });
        } else {
          await Chat.findByIdAndUpdate(chatId, { $pull: { pinnedMessages: messageId } });
          await Message.findByIdAndUpdate(messageId, { isPinned: false });
        }

        io.to(chatId).emit('messagePinned', { messageId, action });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Leave chat
    socket.on('leaveChat', (chatId) => {
      socket.leave(chatId);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};