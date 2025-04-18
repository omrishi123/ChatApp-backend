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
    res.json(user);
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
