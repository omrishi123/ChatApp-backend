const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');
const authController = require('../controllers/authController');

// Register (with profile picture upload)
router.post('/register', upload.single('profilePic'), authController.register);
// Login
router.post('/login', authController.login);
// Get my profile
router.get('/me', auth, authController.getProfile);
// Update profile (with profile picture upload)
router.put('/me', auth, upload.single('profilePic'), authController.updateProfile);

module.exports = router;
