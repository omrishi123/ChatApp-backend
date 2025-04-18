const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const userController = require('../controllers/userController');

// Search users by username
router.get('/search', auth, userController.searchUsers);
// Get user profile by ID
router.get('/:id', auth, userController.getUserProfile);
// Block user
router.post('/block', auth, userController.blockUser);
// Unblock user
router.post('/unblock', auth, userController.unblockUser);

module.exports = router;
