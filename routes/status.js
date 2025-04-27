const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Status = require('../models/Status');
const User = require('../models/User');
const upload = require('../middleware/upload');

// Post a new status (text or media)
router.post('/', auth, upload.single('media'), async (req, res) => {
  try {
    const { text } = req.body;
    const media = req.file ? req.file.filename : '';
    const status = new Status({
      user: req.user.id,
      text,
      media,
    });
    await status.save();
    res.json(status);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to post status', err });
  }
});

// Get statuses from contacts (exclude hiddenFrom)
router.get('/', auth, async (req, res) => {
  try {
    // Find users the current user has chatted with
    const chats = await User.findById(req.user.id).select('chats').populate('chats');
    const contactIds = chats.chats.map(c => c.participants.find(p => p.toString() !== req.user.id));
    // Get statuses from those users, not hidden from current user
    const statuses = await Status.find({
      user: { $in: contactIds },
      hiddenFrom: { $ne: req.user.id }
    }).populate('user', 'username profilePic');
    res.json(statuses);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to fetch statuses', err });
  }
});

// Hide status from selected users
router.post('/hide', auth, async (req, res) => {
  try {
    const { hideFromIds } = req.body; // array of user IDs
    await Status.updateMany({ user: req.user.id }, { $set: { hiddenFrom: hideFromIds } });
    res.json({ msg: 'Updated hiddenFrom list' });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to update hiddenFrom', err });
  }
});

module.exports = router;
