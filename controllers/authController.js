const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    console.log('Register request body:', req.body);
    console.log('Register request file:', req.file);
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      console.log('User already exists:', user);
      return res.status(400).json({ msg: 'Email or username already exists' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const profilePic = req.file ? `/uploads/${req.file.filename}` : '';
    user = new User({ email, username, password: hashed, profilePic });
    await user.save();
    // Optionally: send verification email here
    const payload = {
      user: {
        id: user._id,
        email: user.email,
        username: user.username
      }
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, username: user.username, email: user.email, profilePic: user.profilePic } });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
    res.status(500).json({ message: 'Registration failed', error: error.message, stack: error.stack });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login request body:', req.body);
    let user = await User.findOne({ email });
    if (!user) {
      console.log('No user found for email:', email);
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    if (user.banned) {
      return res.status(403).json({ msg: 'You are banned.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password mismatch for email:', email);
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    const payload = {
      user: {
        id: user._id,
        email: user.email,
        username: user.username
      }
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, username: user.username, email: user.email, profilePic: user.profilePic } });
  } catch (error) {
    console.error('Login error:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
    res.status(500).json({ message: 'Login failed', error: error.message, stack: error.stack });
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
    if (req.body.password) updates.password = await bcrypt.hash(req.body.password, 10);
    if (req.file) updates.profilePic = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', err });
  }
};
