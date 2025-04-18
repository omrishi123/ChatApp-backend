const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const chatController = require('../controllers/chatController');

// Get all chats for user
router.get('/', auth, chatController.getChats);
// Start a chat
router.post('/start', auth, chatController.startChat);
// Mute chat
router.post('/mute', auth, chatController.muteChat);
// Unmute chat
router.post('/unmute', auth, chatController.unmuteChat);

module.exports = router;
