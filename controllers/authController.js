const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Revert to original (before status/admin changes)
// Remove forceAdminFix, debugAdmin, resetOwnPassword, changePassword, and any status-related code
// Only keep: register, login, getProfile, updateProfile

exports.register = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ msg: 'Email or username already exists' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const profilePic = req.file ? `/uploads/${req.file.filename}` : '';
    user = new User({ email, username, password: hashed, profilePic });
    await user.save();
    const payload = {
      user: {
        id: user._id,
        email: user.email,
        username: user.username
      }
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user._id, username: user.username, email: user.email, profilePic: user.profilePic } });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.findOne({ username: email });
    }
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    const payload = {
      user: {
        id: user._id,
        email: user.email,
        username: user.username
      }
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user._id, username: user.username, email: user.email, profilePic: user.profilePic } });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', err });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updates = {};
    if (req.body.username) updates.username = req.body.username;
    if (req.file) updates.profilePic = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', err });
  }
};
