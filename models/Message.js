// Message model
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, default: '' },
  media: { type: String, default: '' },
  mediaType: { type: String, enum: ['image', 'video', 'audio', 'none'], default: 'none' },
  seen: { type: Boolean, default: false },
  starredBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  repliedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
  forwardedFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);
