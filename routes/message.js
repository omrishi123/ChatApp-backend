const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');
const messageController = require('../controllers/messageController');
const reportController = require('../controllers/reportController');

// Get all messages for a chat
router.get('/:chatId', auth, messageController.getMessages);
// Send a message (with media upload)
router.post('/send', auth, upload.single('media'), messageController.sendMessage);
// Delete message (for me or everyone)
router.post('/delete', auth, messageController.deleteMessage);
// Star message
router.post('/star', auth, messageController.starMessage);
// Unstar message
router.post('/unstar', auth, messageController.unstarMessage);
// Clear chat messages for the current user
router.post('/clear', auth, messageController.clearChat);
// Report a message
router.post('/report', auth, reportController.reportMessage);

module.exports = router;
