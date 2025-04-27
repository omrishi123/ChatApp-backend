const mongoose = require('mongoose');

const StatusSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  media: { type: String, default: '' }, // image or video URL
  text: { type: String, default: '' },
  hiddenFrom: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // users who can't see this status
  createdAt: { type: Date, default: Date.now, expires: 86400 } // auto-delete after 24 hours
});

module.exports = mongoose.model('Status', StatusSchema);
