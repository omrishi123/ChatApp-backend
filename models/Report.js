// Report model
const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  message: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', required: true },
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true },
  resolved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', ReportSchema);
