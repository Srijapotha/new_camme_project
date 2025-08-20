const Chat = require('../models/chat');
const User = require('../models/userModel');

exports.createGroup = async (req, res) => {
  try {
    const { adminId, groupName, participants, groupTheme } = req.body;
    const group = new Chat({
      participants: [adminId, ...participants],
      isGroup: true,
      groupName,
      groupTheme,
      adminId
    });
    await group.save();
    await group.populate('participants', 'username email');
    res.json({ group, message: 'Group created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addMember = async (req, res) => {
  try {
    const { groupId, adminId, newMemberId } = req.body;
    const group = await Chat.findById(groupId);
    if (!group.adminId.equals(adminId)) {
      return res.status(403).json({ error: 'Only admin can add members' });
    }
    await Chat.findByIdAndUpdate(groupId, {
      $addToSet: { participants: newMemberId }
    });
    res.json({ message: 'Member added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const { groupId, adminId, memberId } = req.body;
    const group = await Chat.findById(groupId);
    if (!group.adminId.equals(adminId)) {
      return res.status(403).json({ error: 'Only admin can remove members' });
    }
    await Chat.findByIdAndUpdate(groupId, {
      $pull: { participants: memberId }
    });
    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMyGroups = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    const groups = await Chat.find({
      isGroup: true,
      participants: userId,
    }).populate('participants', 'username email fullName');
    res.json({ groups });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};