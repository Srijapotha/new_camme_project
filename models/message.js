const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: String,
  messageType: { type: String, enum: ['text', 'image', 'video', 'file'], default: 'text' },
  mediaUrl: String,
  mediaName: String,
  isPinned: { type: Boolean, default: false },
  readBy: [{ 
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    readAt: { type: Date, default: Date.now }
  }],
  sentAt: { type: Date, default: Date.now },
  autoDeleteAt: Date
});

module.exports = mongoose.model('ChatMessage', MessageSchema);