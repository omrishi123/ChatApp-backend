const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const reportController = require('../controllers/reportController');
const adminController = require('../controllers/adminController');
const analyticsController = require('../controllers/analyticsController');
const keywordController = require('../controllers/keywordController');
const announcementController = require('../controllers/announcementController');
const systemController = require('../controllers/systemController');

// Middleware to check if user is admin
function adminOnly(req, res, next) {
  console.log('ADMIN CHECK:', req.user);
  if (!req.user || req.user.email !== 'omrishi2580@gmail.com') {
    return res.status(403).json({ message: 'Admin access only' });
  }
  next();
}

// Get all users (id, email, hashed password)
router.get('/users', auth, adminOnly, async (req, res) => {
  const users = await User.find({}, '_id email username password');
  console.log('ADMIN USERS:', users);
  res.json(users);
});

// Get all chats and messages
router.get('/chats', auth, adminOnly, async (req, res) => {
  const chats = await Chat.find({}).populate('participants', 'username email');
  // For frontend compatibility, also add a 'users' field as alias for 'participants'
  const chatsWithUsers = chats.map(chat => ({
    ...chat.toObject(),
    users: chat.participants
  }));
  console.log('ADMIN CHATS:', chatsWithUsers);
  res.json(chatsWithUsers);
});

router.get('/messages', auth, adminOnly, async (req, res) => {
  const messages = await Message.find({}).populate('sender', 'username email');
  res.json(messages);
});

// Send message as admin to a user
router.post('/message', auth, adminOnly, async (req, res) => {
  const { toUserId, content } = req.body;
  if (!toUserId || !content) return res.status(400).json({ message: 'Missing fields' });
  // Find a chat between admin and user, or create one
  let chat = await Chat.findOne({ participants: { $all: [req.user.id, toUserId] } });
  if (!chat) {
    chat = new Chat({ participants: [req.user.id, toUserId] });
    await chat.save();
  }
  // FIX: Ensure 'receiver' is set!
  const message = new Message({ chat: chat._id, sender: req.user.id, receiver: toUserId, content });
  await message.save();
  chat.lastMessage = message._id;
  await chat.save();
  res.json({ message: 'Message sent', chatId: chat._id });
});

// Ban or unban a user
router.post('/ban', auth, adminOnly, require('../controllers/adminController').toggleBanUser);

// Reset user password
router.post('/reset-password', auth, adminOnly, async (req, res) => {
  const { userId, newPassword } = req.body;
  if (!userId || !newPassword) return res.status(400).json({ message: 'Missing fields' });
  const hashed = await bcrypt.hash(newPassword, 10);
  await User.findByIdAndUpdate(userId, { password: hashed });
  res.json({ message: 'Password reset' });
});

// Edit user details (admin)
router.post('/edit-user', auth, adminOnly, adminController.editUser);

// Get user activity/logs (admin)
router.get('/user-activity/:userId', auth, adminOnly, adminController.getUserActivity);

// Delete any message (admin)
router.post('/delete-message', auth, adminOnly, adminController.deleteAnyMessage);

// Delete entire chat (admin)
router.post('/delete-chat', auth, adminOnly, adminController.deleteChat);

// Get all reports
router.get('/reports', auth, adminOnly, reportController.getReports);

// Resolve a report
router.post('/resolve-report', auth, adminOnly, reportController.resolveReport);

// Analytics/statistics
router.get('/stats', auth, adminOnly, analyticsController.getStats);

// Keyword filter management
router.get('/keywords', auth, adminOnly, keywordController.getKeywords);
router.post('/add-keyword', auth, adminOnly, keywordController.addKeyword);
router.post('/remove-keyword', auth, adminOnly, keywordController.removeKeyword);

// Announcements (broadcast, pin/unpin)
router.post('/announcement', auth, adminOnly, announcementController.sendAnnouncement);
router.get('/announcements', auth, adminOnly, announcementController.getAnnouncements);
router.post('/pin-announcement', auth, adminOnly, announcementController.pinAnnouncement);
router.post('/delete-announcement', auth, adminOnly, announcementController.deleteAnnouncement);

// Public: Get pinned announcement (no auth)
router.get('/public-announcements', announcementController.getPublicAnnouncements);

// Support tools
router.post('/impersonate', auth, adminOnly, adminController.impersonateUser);
router.get('/user-chathistory/:userId', auth, adminOnly, adminController.getUserChatHistory);

// System tools
router.get('/health', auth, adminOnly, systemController.getHealth);
router.post('/backup', auth, adminOnly, systemController.triggerBackup);
router.post('/restore', auth, adminOnly, systemController.triggerRestore);

module.exports = router;
