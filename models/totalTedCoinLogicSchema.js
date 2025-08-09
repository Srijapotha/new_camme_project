const mongoose = require('mongoose');


const totalTedCoinLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  generatedBy: { type: String, default: 'formula-based' },
  amount: { type: Number, default: 1 },
  followersCount: { type: Number, default: 0 },
  uniqueId: { type: String,  unique: true }, // new unique identifier
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('TotalTedCoinLog', totalTedCoinLogSchema);
