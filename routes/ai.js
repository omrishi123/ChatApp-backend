const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const aiController = require('../controllers/aiController');

// Chat with AI
router.post('/message', auth, aiController.sendAIMessage);
// Admin: update AI bot profile pic
router.post('/profile-pic', auth, upload.single('profilePic'), aiController.updateAIBotProfilePic);

module.exports = router;
