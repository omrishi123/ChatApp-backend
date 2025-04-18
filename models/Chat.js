// Chat model
const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  isMuted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Chat', ChatSchema);
