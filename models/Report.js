const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reportedPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Postcreate',
  },
  reportedComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
  },
  reason: {
    type: String,
    // enum: ['spam', 'hate_speech', 'nudity', 'violence', 'other'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'resolved', 'dismissed'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Report', reportSchema);