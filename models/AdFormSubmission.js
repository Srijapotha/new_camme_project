const mongoose = require('mongoose');

const AdFormSubmissionSchema = new mongoose.Schema({
  adId: { type: mongoose.Schema.Types.ObjectId, ref: 'Advertisement', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // optional, if user is logged in
  formData: { type: Object, required: true }, // stores field-value pairs
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AdFormSubmission', AdFormSubmissionSchema);
