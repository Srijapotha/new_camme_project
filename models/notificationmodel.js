const mongoose = require('mongoose');

// Define the notification schema
const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Postcreate',
        required: false
    },
    type: {
        type: String,
        enum: ['TedBlackCoinVote', 'FriendRequest', 'System', 'Comment', 'Reaction','Approval','Approach'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    actions: {
        type: [String], // e.g., ['Agree', 'Disagree']
        default: []
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create the Notification model
const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
