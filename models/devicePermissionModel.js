const mongoose = require('mongoose');

const devicePermissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  gallery: { type: Boolean, default: false },           // Gallery for photos & videos
  location: { type: Boolean, default: false },          // Device location
  microphone: { type: Boolean, default: false },       // Microphone
  camera: { type: Boolean, default: false },           // Camera
  notifications: { type: Boolean, default: false },    // Push notifications
  mobileContacts: { type: Boolean, default: false },   // Mobile contacts access
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('DevicePermission', devicePermissionSchema);
