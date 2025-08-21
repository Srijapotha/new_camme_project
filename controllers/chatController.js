const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const Chat = require('../models/chat');
const Message = require('../models/message');
const { upload } = require('../config/cloudinary');
const { verifyUserTokenAndEmail } = require('../middleware/addirionalSecurity');

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
      .populate('senderId', 'username')
      .sort({ sentAt: 1 });
    res.status(200).json(messages);
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
    const { userId, chatId, pin } = req.body;
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return res.status(400).json({ error: 'PIN must be 4 digits' });
    }
    const hashedPin = await bcrypt.hash(pin, 10);
    await User.findByIdAndUpdate(userId, {
      [`privateChatPins.${chatId}`]: hashedPin
    });
    res.json({ message: 'PIN set successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.verifyChatPin = async (req, res) => {
  try {
    const { userId, chatId, pin } = req.body;
    const user = await User.findById(userId);
    const storedPin = user.privateChatPins.get(chatId);
    if (!storedPin) {
      return res.status(404).json({ error: 'No PIN set for this chat' });
    }
    const isValid = await bcrypt.compare(pin, storedPin);
    res.json({ valid: isValid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.saveMessage = async (req, res) => {
  try {
    const verification = await verifyUserTokenAndEmail(req);
    if (!verification.success) {
      return res.status(200).json(verification);
    }
    const { userId, messageId } = req.body;
    await User.findByIdAndUpdate(userId, {
      $addToSet: { savedMessages: { messageId, savedAt: new Date() } }
    });
    res.json({ message: 'Message saved successfully' });
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