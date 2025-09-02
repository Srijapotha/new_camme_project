const mongoose = require('mongoose');

// Define the notification settings schema
const notificationSettingsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    notifications: {
        type: Boolean,
        default: true
    },
    posts: {
        type: Boolean,
        default: true
    },
    photographs: {
        type: Boolean,
        default: true
    },
    filterApplies: {
        type: Boolean,
        default: true
    },
    moments: {
        type: Boolean,
        default: true
    },
    coinInteractions: {
        type: Boolean,
        default: true
    },
    opinions: {
        type: Boolean,
        default: true
    },
    shares: {
        type: Boolean,
        default: true
    },
    saved: {
        type: Boolean,
        default: true
    },
    chats: {
        type: Boolean,
        default: true
    },
    lives: {
        type: Boolean,
        default: true
    },
    requests: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field before saving
notificationSettingsSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Create the NotificationSettings model
const NotificationSettings = mongoose.model('NotificationSettings', notificationSettingsSchema);

module.exports = NotificationSettings;