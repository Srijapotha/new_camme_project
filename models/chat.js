const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isGroup: { type: Boolean, default: false },
  groupName: String,
  groupPhoto: String,
  groupTheme: String,
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  autoDeleteTime: { type: Number, default: 0 }, // in hours, 0 = never
  pinnedMessages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
  createdAt: { type: Date, default: Date.now },
  lastActivity: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Chat', ChatSchema);