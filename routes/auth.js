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
// Change own password
router.post('/change-password', auth, authController.changePassword);
// Reset own password (no current password required)
router.post('/reset-own-password', auth, authController.resetOwnPassword);
// TEMP: Force admin fix endpoint
router.post('/force-admin-fix', require('../controllers/authController').forceAdminFix);

module.exports = router;
