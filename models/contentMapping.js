const mongoose = require('mongoose');

const contentMappingSchema = new mongoose.Schema({
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Postcreate', required: true },
    postUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    blackCoinGiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true },
    hashTags: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    tedBlackCoinData: { type: Object }, // Store the full tedBlackCoinData object if needed
});

module.exports = mongoose.model('ContentMapping', contentMappingSchema);