const User = require('../models/User');
const Message = require('../models/Message');
const Chat = require('../models/Chat');
const jwt = require('jsonwebtoken');

// Ban or unban a user
exports.toggleBanUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    user.banned = !user.banned;
    await user.save();
    res.json({ msg: user.banned ? 'User banned' : 'User unbanned', banned: user.banned });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', err });
  }
};

// Edit user details (admin)
exports.editUser = async (req, res) => {
  try {
    const { userId, email, username, profilePic } = req.body;
    const updates = {};
    if (email) updates.email = email;
    if (username) updates.username = username;
    if (profilePic) updates.profilePic = profilePic;
    const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', err });
  }
};

// Get user activity/logs (admin)
exports.getUserActivity = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('lastSeen online createdAt updatedAt');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', err });
  }
};

// Delete any message (admin)
exports.deleteAnyMessage = async (req, res) => {
  try {
    const { messageId } = req.body;
    await Message.findByIdAndDelete(messageId);
    res.json({ msg: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', err });
  }
};

// Delete entire chat (admin)
exports.deleteChat = async (req, res) => {
  try {
    const { chatId } = req.body;
    await Message.deleteMany({ chat: chatId });
    await Chat.findByIdAndDelete(chatId);
    res.json({ msg: 'Chat deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', err });
  }
};

// Impersonate user (admin)
exports.impersonateUser = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ msg: 'userId required' });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    if (typeof process.env.JWT_SECRET !== 'string' || !process.env.JWT_SECRET) return res.status(500).json({ msg: 'JWT_SECRET not set in environment' });
    const payload = {
      user: {
        id: user._id,
        email: user.email,
        username: user.username
      }
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user._id, username: user.username, email: user.email, profilePic: user.profilePic } });
  } catch (err) {
    console.error('Impersonate error:', err);
    res.status(500).json({ msg: 'Server error', err: err.message, stack: err.stack });
  }
};

// View user chat history (admin)
exports.getUserChatHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ msg: 'userId required' });
    // Defensive: ensure Message model is loaded
    if (!Message) return res.status(500).json({ msg: 'Message model not loaded' });
    const messages = await Message.find({ $or: [{ sender: userId }, { receiver: userId }] }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    console.error('ChatHistory error:', err);
    res.status(500).json({ msg: 'Server error', err: err.message, stack: err.stack });
  }
};
