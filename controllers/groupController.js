const Chat = require('../models/chat');
const User = require('../models/userModel');
const { verifyUserTokenAndEmail } = require('../middleware/addirionalSecurity');

exports.createGroup = async (req, res) => {
  try {
    const { email, token } = req.body;
    const user = await verifyUserTokenAndEmail(email, token);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
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
    const { email, token } = req.body;
    const user = await verifyUserTokenAndEmail(email, token);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
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
    const { email, token } = req.body;
    const user = await verifyUserTokenAndEmail(email, token);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
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
    const { userId, email, token } = req.body;
    const user = await verifyUserTokenAndEmail(email, token);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
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