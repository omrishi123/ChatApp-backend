// User model
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePic: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now },
  online: { type: Boolean, default: false },
  blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  mutedChats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chat' }],
  banned: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
