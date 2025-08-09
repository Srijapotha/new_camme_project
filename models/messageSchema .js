const mongoose = require("mongoose");

// Message Schema
const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  messageType: { type: String, enum: ['text', 'image', 'file'], default: 'text' }
}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);