const Group = require('../models/chat');
const Message = require('../models/message');
const User = require('../models/userModel');
const { verifyUserTokenAndEmail } = require('../middleware/addirionalSecurity');
const { setNotificationSetting, getNotificationSetting, setPin, verifyPin } = require('../utils/chatGroupUtils');

// Create a new group chat
exports.createGroup = async (req, res) => {
  try {
    const verification = await verifyUserTokenAndEmail(req);
    if (!verification.success) {
      return res.status(200).json(verification);
    }
    const { adminId, groupName, participants, groupTheme, groupPhoto } = req.body;

    // Validation
    if (!adminId || !groupName || !participants || !Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({ error: 'adminId, groupName, and participants are required' });
    }

    // Check for existing group with same name (global)
    const existingGroup = await Group.findOne({ groupName, isGroup: true });
    if (existingGroup) {
      return res.status(409).json({ error: 'Group with this name already exists.' });
    }

    // Ensure admin is in participants
    if (!participants.includes(adminId)) {
      participants.push(adminId);
    }

    // Create group object
    const groupData = {
      adminId,
      groupName,
      participants,
      isGroup: true,
      groupTheme: groupTheme || "",
      groupPhoto: groupPhoto || "",
      createdAt: new Date()
    };

    // Create group in DB
    const group = await Group.create(groupData);

    // Optionally, populate participants for response
    await group.populate('participants', 'userName fullName profilePic email');

    res.status(200).json({
      group,
      message: 'Group created successfully.'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update group profile, theme, or photo
exports.updateGroupProfile = async (req, res) => {
  try {
    const verification = await verifyUserTokenAndEmail(req);
    if (!verification.success) {
      return res.status(200).json(verification);
    }
    const { groupId, adminId, groupName, groupTheme, groupPhoto } = req.body;
    const group = await Group.findById(groupId);
    if (!group || !group.isGroup || group.adminId.toString() !== adminId) {
      return res.status(403).json({ error: 'Only admin can update group.' });
    }
    if (groupName) group.groupName = groupName;
    if (groupTheme) group.groupTheme = groupTheme;
    if (groupPhoto) group.groupPhoto = groupPhoto;
    await group.save();
    res.json({ message: 'Group updated successfully.', group });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Filter group messages by date
exports.filterGroupMessages = async (req, res) => {
  try {
    const verification = await verifyUserTokenAndEmail(req);
    if (!verification.success) {
      return res.status(200).json(verification);
    }
    const { groupId, year, month, day } = req.body;
    let startDate = new Date(year, month - 1, day || 1);
    let endDate = day ? new Date(year, month - 1, day, 23, 59, 59) : new Date(year, month, 0, 23, 59, 59);
    const messages = await Message.find({ chatId: groupId, sentAt: { $gte: startDate, $lte: endDate } })
      .populate('senderId', 'userName fullName profilePic isOnline lastSeen')
      .sort({ sentAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Pin or unpin a message in group
exports.pinGroupMessage = async (req, res) => {
  try {
    const verification = await verifyUserTokenAndEmail(req);
    if (!verification.success) {
      return res.status(200).json(verification);
    }
    const { groupId, adminId, messageId, action } = req.body;
    const group = await Group.findById(groupId);
    if (!group || !group.isGroup || group.adminId.toString() !== adminId) {
      return res.status(403).json({ error: 'Only admin can pin/unpin messages.' });
    }
    if (action === 'pin') {
      await Group.findByIdAndUpdate(groupId, { $addToSet: { pinnedMessages: messageId } });
      await Message.findByIdAndUpdate(messageId, { isPinned: true });
    } else {
      await Group.findByIdAndUpdate(groupId, { $pull: { pinnedMessages: messageId } });
      await Message.findByIdAndUpdate(messageId, { isPinned: false });
    }
    res.json({ message: `Message ${action}ned successfully.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Save a message in group
exports.saveGroupMessage = async (req, res) => {
  try {
    const verification = await verifyUserTokenAndEmail(req);
    if (!verification.success) {
      return res.status(200).json(verification);
    }
    const { userId, groupId, messageId } = req.body;
    await User.findByIdAndUpdate(userId, {
      $addToSet: { savedMessages: { messageId, savedAt: new Date(), groupId } }
    });
    res.json({ message: 'Message saved successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Set group notification
exports.setGroupNotification = async (req, res) => {
  try {
    const verification = await verifyUserTokenAndEmail(req);
    if (!verification.success) {
      return res.status(200).json(verification);
    }
    const { userId, groupId, enabled } = req.body;
    await setNotificationSetting(User, userId, groupId, enabled);
    res.json({ message: 'Notification setting updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get group notification
exports.getGroupNotification = async (req, res) => {
  try {
    const verification = await verifyUserTokenAndEmail(req);
    if (!verification.success) {
      return res.status(200).json(verification);
    }
    const { userId, groupId } = req.body;
    const enabled = await getNotificationSetting(User, userId, groupId);
    res.json({ enabled });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get shared media in group
exports.getGroupSharedMedia = async (req, res) => {
  try {
    const verification = await verifyUserTokenAndEmail(req);
    if (!verification.success) {
      return res.status(200).json(verification);
    }
    const { groupId } = req.body;
    const mediaMessages = await Message.find({
      chatId: groupId,
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

// Exit group
exports.exitGroup = async (req, res) => {
  try {
    const verification = await verifyUserTokenAndEmail(req);
    if (!verification.success) {
      return res.status(200).json(verification);
    }
    const { userId, groupId } = req.body;
    await Group.findByIdAndUpdate(groupId, { $pull: { participants: userId } });
    res.json({ message: 'User exited group successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getMyGroups = async (req, res) => {
  try {
    const { userId } = req.body;
    const verification = await verifyUserTokenAndEmail(req);
    if (!verification.success) {
      return res.status(200).json(verification);
    }
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    const groups = await Group.find({
      isGroup: true,
      participants: userId,
    }).populate('participants', 'username email fullName');
    res.json({ groups });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- MISSING FUNCTIONALITIES FOR GROUP CHAT SETTINGS ---

// 1. GROUP CHAT PIN MANAGEMENT
exports.setGroupPin = async (req, res) => {
  try {
    const verification = await verifyUserTokenAndEmail(req);
    if (!verification.success) {
      return res.status(200).json(verification);
    }
    const { userId, groupId, pin, oldPin } = req.body;
    await setPin(User, userId, 'groupChatPins', groupId, pin, oldPin);
    res.json({ message: 'Group chat PIN set/changed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.verifyGroupPin = async (req, res) => {
  try {
    const verification = await verifyUserTokenAndEmail(req);
    if (!verification.success) {
      return res.status(200).json(verification);
    }
    const { userId, groupId, pin } = req.body;
    const isValid = await verifyPin(User, userId, 'groupChatPins', groupId, pin);
    res.json({ valid: isValid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. AUTO-DELETE SETTINGS
exports.getGroupAutoDeleteSetting = async (req, res) => {
  try {
    const verification = await verifyUserTokenAndEmail(req);
    if (!verification.success) {
      return res.status(200).json(verification);
    }
    const { groupId } = req.body;
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: 'Group not found' });
    res.json({ autoDeleteTime: group.autoDeleteTime || null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.setGroupAutoDeleteSetting = async (req, res) => {
  try {
    const verification = await verifyUserTokenAndEmail(req);
    if (!verification.success) {
      return res.status(200).json(verification);
    }
    const { groupId, autoDeleteTime } = req.body;
    if (!autoDeleteTime || isNaN(autoDeleteTime)) {
      return res.status(400).json({ error: 'autoDeleteTime (minutes) required' });
    }
    await Group.findByIdAndUpdate(groupId, { autoDeleteTime });
    res.json({ message: 'Auto-delete time updated', autoDeleteTime });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. SAVED MESSAGES LISTING & DELETION FOR GROUP
exports.listGroupSavedMessages = async (req, res) => {
  try {
    const verification = await verifyUserTokenAndEmail(req);
    if (!verification.success) {
      return res.status(200).json(verification);
    }
    const { userId } = req.body;
    const user = await User.findById(userId).populate('savedMessages.messageId');
    if (!user) return res.status(404).json({ error: 'User not found' });
    const formatted = (user.savedMessages || []).filter(sm => sm.groupId).map(sm => ({
      messageId: sm.messageId?._id,
      content: sm.messageId?.content,
      senderId: sm.messageId?.senderId,
      receiverId: sm.messageId?.receiverId,
      sentAt: sm.messageId?.sentAt,
      savedAt: sm.savedAt,
      groupId: sm.groupId
    }));
    res.json({ savedMessages: formatted });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteGroupSavedMessage = async (req, res) => {
  try {
    const verification = await verifyUserTokenAndEmail(req);
    if (!verification.success) {
      return res.status(200).json(verification);
    }
    const { userId, messageId, groupId } = req.body;
    await User.findByIdAndUpdate(userId, {
      $pull: { savedMessages: { messageId, groupId } }
    });
    res.json({ message: 'Saved group message deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. BLOCKED USER LIST (if relevant for groups)
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

// 5. RESTRICTED USER LIST (if relevant for groups)
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

exports.addMember = async (req, res) => {
  try {
    const verification = await verifyUserTokenAndEmail(req);
    if (!verification.success) {
      return res.status(200).json(verification);
    }
    const { groupId, adminId, newMemberId } = req.body;
    const group = await Group.findById(groupId);
    if (!group.adminId.equals(adminId)) {
      return res.status(403).json({ error: 'Only admin can add members' });
    }
    await Group.findByIdAndUpdate(groupId, {
      $addToSet: { participants: newMemberId }
    });
    res.json({ message: 'Member added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const verification = await verifyUserTokenAndEmail(req);
    if (!verification.success) {
      return res.status(200).json(verification);
    }
    const { groupId, adminId, memberId } = req.body;
    const group = await Group.findById(groupId);
    if (!group.adminId.equals(adminId)) {
      return res.status(403).json({ error: 'Only admin can remove members' });
    }
    await Group.findByIdAndUpdate(groupId, {
      $pull: { participants: memberId }
    });
    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const verification = await verifyUserTokenAndEmail(req);
    if (!verification.success) {
      return res.status(200).json(verification);
    }
    const { groupId, adminId, memberId } = req.body;
    const group = await Group.findById(groupId);
    if (!group.adminId.equals(adminId)) {
      return res.status(403).json({ error: 'Only admin can remove members' });
    }
    await Group.findByIdAndUpdate(groupId, {
      $pull: { participants: memberId }
    });
    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
