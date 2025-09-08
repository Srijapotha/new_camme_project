const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const Chat = require('../models/chat');
const Message = require('../models/message');
const { upload } = require('../config/cloudinary');
const { verifyUserTokenAndEmail } = require('../middleware/addirionalSecurity');
const { setNotificationSetting, getNotificationSetting, setPin, verifyPin } = require('../utils/chatGroupUtils');

// AUTO-DELETE CLEANUP FUNCTION
const cleanupExpiredMessages = async () => {
  const now = new Date();
  await Message.deleteMany({ autoDeleteAt: { $lte: now } });
};

// Call cleanupExpiredMessages periodically (every hour)
setInterval(cleanupExpiredMessages, 60 * 60 * 1000);

// SHARED MEDIA ENDPOINT
exports.getSharedMedia = async (req, res) => {
  try {
    const verification = await verifyUserTokenAndEmail(req);
    if (!verification.success) {
      return res.status(200).json(verification);
    }
    const { chatId } = req.body;
    if (!chatId) {
      return res.status(400).json({ error: 'chatId is required' });
    }
    const mediaMessages = await Message.find({
      chatId,
      mediaUrl: { $exists: true, $ne: null },
    }).populate('senderId', 'userName fullName profilePic isOnline lastSeen');
    const formatted = mediaMessages.map(msg => ({
      _id: msg._id,
      chatId: msg.chatId,
      senderId: msg.senderId?._id,
      senderProfile: msg.senderId ? {
        userName: msg.senderId.userName,
        fullName: msg.senderId.fullName,
        profilePic: msg.senderId.profilePic,
        isOnline: msg.senderId.isOnline,
        lastSeen: msg.senderId.lastSeen
      } : null,
      mediaUrl: msg.mediaUrl,
      mediaType: msg.mediaType,
      sentAt: msg.sentAt
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// NOTIFICATION SETTINGS ENDPOINTS
exports.setNotification = async (req, res) => {
  try {
    const verification = await verifyUserTokenAndEmail(req);
    if (!verification.success) {
      return res.status(200).json(verification);
    }
    const { userId, contactId, enabled } = req.body;
    if (!userId || !contactId || typeof enabled !== 'boolean') {
      return res.status(400).json({ error: 'userId, contactId, and enabled are required' });
    }
    await setNotificationSetting(User, userId, contactId, enabled);
    res.json({ message: 'Notification setting updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getNotification = async (req, res) => {
  try {
    const verification = await verifyUserTokenAndEmail(req);
    if (!verification.success) {
      return res.status(200).json(verification);
    }
    const { userId, contactId } = req.body;
    if (!userId || !contactId) {
      return res.status(400).json({ error: 'userId and contactId are required' });
    }
    const enabled = await getNotificationSetting(User, userId, contactId);
    res.json({ enabled });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.searchChats = async (req, res) => {
  try {
     const verification = await verifyUserTokenAndEmail(req);
            if (!verification.success) {
                return res.status(200).json(verification);
            }
    const { userId, searchTerm } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const matchingUsers = await User.find({
      $and: [
        { _id: { $ne: userId } },
        { _id: { $nin: user.blockedUsers } },
        {
          $or: [
            { username: { $regex: searchTerm, $options: 'i' } },
            { email: { $regex: searchTerm, $options: 'i' } }
          ]
        }
      ]
    }).select('username email fullName');

    const chats = await Chat.find({
      participants: userId,
      isGroup: false
    }).populate('participants', 'username email fullName');

    res.json({ users: matchingUsers, existingChats: chats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createPrivateChat = async (req, res) => {
    try {
       const verification = await verifyUserTokenAndEmail(req);
        if (!verification.success) {
            return res.status(200).json(verification);
        }
        const { userId1, userId2 } = req.body;

        // Ensure both users exist
        const [user1, user2] = await Promise.all([
            User.findById(userId1),
            User.findById(userId2)
        ]);

        if (!user1 || !user2) {
            return res.status(404).json({ error: 'One or both users not found.' });
        }

        // Check if a private chat between these two users already exists
        const existingChat = await Chat.findOne({
            isGroup: false,
            participants: { $all: [userId1, userId2] }
        });

        if (existingChat) {
            return res.status(200).json({ 
                message: 'Chat already exists.', 
                chatId: existingChat._id 
            });
        }

        // Create and save a new chat document
        const newChat = new Chat({
            isGroup: false,
            participants: [userId1, userId2]
        });

        await newChat.save();

        res.status(201).json({ 
            message: 'New private chat created.', 
            chatId: newChat._id 
        });

    } catch (error) {
        console.error('Error in createPrivateChat:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getChatMessages = async (req, res) => {
  try {
     const verification = await verifyUserTokenAndEmail(req);
            if (!verification.success) {
                return res.status(200).json(verification);
            }
    const { chatId } = req.body;
    if (!chatId) {
      return res.status(400).json({ error: 'chatId is required' });
    }
    const messages = await Message.find({ chatId })
      .populate('senderId', 'userName fullName profilePic isOnline lastSeen')
      .sort({ sentAt: 1 });
    // Format messages to always include sentAt and sender profile info
    const formatted = messages.map(msg => ({
      _id: msg._id,
      chatId: msg.chatId,
      senderId: msg.senderId?._id,
      senderProfile: msg.senderId ? {
        userName: msg.senderId.userName,
        fullName: msg.senderId.fullName,
        profilePic: msg.senderId.profilePic,
        isOnline: msg.senderId.isOnline,
        lastSeen: msg.senderId.lastSeen
      } : null,
      content: msg.content,
      messageType: msg.messageType,
      mediaUrl: msg.mediaUrl,
      sentAt: msg.sentAt,
      autoDeleteAt: msg.autoDeleteAt
    }));
    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.sendImageMessage = async (req, res) => {
  try {
    const verification = await verifyUserTokenAndEmail(req);
    if (!verification.success) {
      return res.status(200).json(verification);
    }
    const { chatId, senderId, content } = req.body;
    if (!req.file || !req.file.path) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const message = new Message({
      chatId,
      senderId,
      content,
      mediaUrl: req.file.path, // Cloudinary URL
      mediaType: 'image',
      messageType: "image",
    });

    await message.save();
    res.status(201).json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.filterMessages = async (req, res) => {
  try {
    const verification = await verifyUserTokenAndEmail(req);
    if (!verification.success) {
      return res.status(200).json(verification);
    }
    const { chatId, year, month, day } = req.body;
    let startDate = new Date(year, month - 1, day || 1);
    let endDate = day ? 
      new Date(year, month - 1, day, 23, 59, 59) : 
      new Date(year, month, 0, 23, 59, 59);

    const messages = await Message.find({
      chatId,
      sentAt: { $gte: startDate, $lte: endDate }
    }).populate('senderId', 'username').sort({ sentAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.setChatPin = async (req, res) => {
  try {
    const verification = await verifyUserTokenAndEmail(req);
    if (!verification.success) {
      return res.status(200).json(verification);
    }
    const { userId, chatId, pin, oldPin } = req.body;
    await setPin(User, userId, 'privateChatPins', chatId, pin, oldPin);
    res.json({ message: 'PIN set successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.verifyChatPin = async (req, res) => {
  try {
    const verification = await verifyUserTokenAndEmail(req);
    if (!verification.success) {
      return res.status(200).json(verification);
    }
    const { userId, chatId, pin } = req.body;
    const isValid = await verifyPin(User, userId, 'privateChatPins', chatId, pin);
    res.json({ valid: isValid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// exports.saveMessage = async (req, res) => {
//   try {
//     const verification = await verifyUserTokenAndEmail(req);
//     if (!verification.success) {
//       return res.status(200).json(verification);
//     }
//     const { userId, messageId } = req.body;
//     await User.findByIdAndUpdate(userId, {
//       $addToSet: { savedMessages: { messageId: messageId, savedAt: new Date() } }
//     });
//     res.json({ message: 'Message saved successfully', user: User });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// ...existing code...

exports.saveMessage = async (req, res) => {
  try {
    const verification = await verifyUserTokenAndEmail(req);
    if (!verification.success) {
      return res.status(200).json(verification);
    }
    const { userId, messageId } = req.body;
    if (!userId || !messageId) {
      return res.status(400).json({ error: 'userId and messageId are required' });
    }

    // Add to savedMessages
    const saved = await User.findByIdAndUpdate(userId, {
      $addToSet: { savedMessages: { messageId: messageId, savedAt: new Date() } }
    });

    // Fetch user again to check if saved
    const user = await User.findById(userId);
    const isSaved = user.savedMessages.some(sm => sm.messageId?.toString() === messageId.toString());

    if (isSaved) {
      
      res.json({ message: 'Message saved successfully' });
    } else {
      res.status(500).json({ error: 'Failed to save message' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.blockUser = async (req, res) => {
  try {
    const verification = await verifyUserTokenAndEmail(req);
    if (!verification.success) {
      return res.status(200).json(verification);
    }
    const { userId, targetUserId, action } = req.body;
    const updateOperation = action === 'block' ? 
      { $addToSet: { blockedUsers: targetUserId } } :
      { $pull: { blockedUsers: targetUserId } };
    await User.findByIdAndUpdate(userId, updateOperation);
    res.json({ message: `User ${action}ed successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.restrictUser = async (req, res) => {
  try {
    const verification = await verifyUserTokenAndEmail(req);
    if (!verification.success) {
      return res.status(200).json(verification);
    }
    const { userId, targetUserId, action } = req.body;
    const updateOperation = action === 'restrict' ? 
      { $addToSet: { restrictedUsers: targetUserId } } :
      { $pull: { restrictedUsers: targetUserId } };
    await User.findByIdAndUpdate(userId, updateOperation);
    res.json({ message: `User ${action}ed successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- MISSING FUNCTIONALITIES ---

// 1. GROUP CHAT PIN MANAGEMENT
exports.setGroupChatPin = async (req, res) => {
  try {
    const verification = await verifyUserTokenAndEmail(req);
    if (!verification.success) {
      return res.status(200).json(verification);
    }
    const { userId, groupId, pin, oldPin } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (oldPin) {
      const storedPin = user.groupChatPins?.get(groupId);
      if (!storedPin || !(await bcrypt.compare(oldPin, storedPin))) {
        return res.status(400).json({ error: 'Old PIN incorrect' });
      }
    }
    if (pin.length !== 4 || !/^[0-9]{4}$/.test(pin)) {
      return res.status(400).json({ error: 'PIN must be 4 digits' });
    }
    const hashedPin = await bcrypt.hash(pin, 10);
    await User.findByIdAndUpdate(userId, {
      [`groupChatPins.${groupId}`]: hashedPin
    });
    res.json({ message: 'Group chat PIN set/changed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.verifyGroupChatPin = async (req, res) => {
  try {
    const verification = await verifyUserTokenAndEmail(req);
    if (!verification.success) {
      return res.status(200).json(verification);
    }
    const { userId, groupId, pin } = req.body;
    const user = await User.findById(userId);
    const storedPin = user.groupChatPins?.get(groupId);
    if (!storedPin) {
      return res.status(404).json({ error: 'No PIN set for this group chat' });
    }
    const isValid = await bcrypt.compare(pin, storedPin);
    res.json({ valid: isValid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. AUTO-DELETE SETTINGS
exports.getAutoDeleteSetting = async (req, res) => {
  try {
    const verification = await verifyUserTokenAndEmail(req);
    if (!verification.success) {
      return res.status(200).json(verification);
    }
    const { chatId } = req.body;
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ error: 'Chat not found' });
    res.json({ autoDeleteTime: chat.autoDeleteTime || null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.setAutoDeleteSetting = async (req, res) => {
  try {
    const verification = await verifyUserTokenAndEmail(req);
    if (!verification.success) {
      return res.status(200).json(verification);
    }
    const { chatId, autoDeleteTime } = req.body;
    if (!autoDeleteTime || isNaN(autoDeleteTime)) {
      return res.status(400).json({ error: 'autoDeleteTime (minutes) required' });
    }
    await Chat.findByIdAndUpdate(chatId, { autoDeleteTime });
    res.json({ message: 'Auto-delete time updated', autoDeleteTime });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. SAVED MESSAGES LISTING & DELETION
exports.listSavedMessages = async (req, res) => {
  try {
    const verification = await verifyUserTokenAndEmail(req);
    if (!verification.success) {
      return res.status(200).json(verification);
    }
    const { userId } = req.body;
    const user = await User.findById(userId).populate('savedMessages.messageId');
    if (!user) return res.status(404).json({ error: 'User not found' });
    console.log(user.savedMessages);
    const formatted = (user.savedMessages || []).map(sm => ({
      messageId: sm?.messageId?._id,
      content: sm?.messageId?.content,
      senderId: sm.messageId?.senderId,
      receiverId: sm.messageId?.receiverId,
      sentAt: sm.messageId?.sentAt,
      savedAt: sm.savedAt
    }));
    res.json({ savedMessages: formatted });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteSavedMessage = async (req, res) => {
  try {
    const verification = await verifyUserTokenAndEmail(req);
    if (!verification.success) {
      return res.status(200).json(verification);
    }
    const { userId, messageId } = req.body;
    await User.findByIdAndUpdate(userId, {
      $pull: { savedMessages: { messageId } }
    });
    res.json({ message: 'Saved message deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. BLOCKED USER LIST
exports.listBlockedUsers = async (req, res) => {
  try {
    const verification = await verifyUserTokenAndEmail(req);
    if (!verification.success) {
      return res.status(200).json(verification);
    }
    const { userId } = req.body;
    const user = await User.findById(userId).populate('blockedUsers', 'username email fullName profilePic');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ blockedUsers: user.blockedUsers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 5. RESTRICTED USER LIST
exports.listRestrictedUsers = async (req, res) => {
  try {
    const verification = await verifyUserTokenAndEmail(req);
    if (!verification.success) {
      return res.status(200).json(verification);
    }
    const { userId } = req.body;
    const user = await User.findById(userId).populate('restrictedUsers', 'username email fullName profilePic');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ restrictedUsers: user.restrictedUsers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Fetch online users (expects an array of userIds to check)
exports.fetchOnlineUsers = async (req, res) => {
  try {
    const verification = await verifyUserTokenAndEmail(req);
    if (!verification.success) {
      return res.status(200).json(verification);
    }
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    // Get user's friends
    const user = await User.findById(userId).populate('userAllFriends', 'username email fullName profilePic isOnline lastSeen');
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Filter only online friends
    const onlineUsers = (user.userAllFriends || []).filter(friend => friend.isOnline);

    res.json({ onlineUsers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Fetch friends list (using userAllFriends)
exports.fetchFriendsList = async (req, res) => {
  try {
    const verification = await verifyUserTokenAndEmail(req);
    if (!verification.success) {
      return res.status(200).json(verification);
    }
    const { userId } = req.body;
    const user = await User.findById(userId).populate('userAllFriends', 'username email fullName profilePic isOnline lastSeen');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ friends: user.userAllFriends });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};