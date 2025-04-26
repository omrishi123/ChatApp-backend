const User = require('../models/User');
const BlockList = require('../models/BlockList');

exports.searchUsers = async (req, res) => {
  try {
    const { username } = req.query;
    const users = await User.find({
      username: { $regex: username, $options: 'i' },
      _id: { $ne: req.user.id }
    }).select('username profilePic');
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', err });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('username profilePic lastSeen online');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    // Add block info: is the profile user blocked by the current user?
    let blockedByMe = false;
    if (req.user && req.user.id) {
      const me = await User.findById(req.user.id);
      if (me && me.blockedUsers.includes(user._id)) blockedByMe = true;
    }
    res.json({
      ...user.toObject(),
      blockedByMe,
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', err });
  }
};

exports.blockUser = async (req, res) => {
  try {
    const { userId } = req.body;
    await User.findByIdAndUpdate(req.user.id, { $addToSet: { blockedUsers: userId } });
    res.json({ msg: 'User blocked' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', err });
  }
};

exports.unblockUser = async (req, res) => {
  try {
    const { userId } = req.body;
    await User.findByIdAndUpdate(req.user.id, { $pull: { blockedUsers: userId } });
    res.json({ msg: 'User unblocked' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', err });
  }
};

// Get AI bot profile for admin panel
exports.getAIBotProfile = async (req, res) => {
  try {
    const aiBot = await User.findOne({ ai_bot: true });
    if (!aiBot) return res.status(404).json({ msg: 'AI bot not found' });
    res.json({ profilePic: aiBot.profilePic });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to get AI bot profile', err });
  }
};
