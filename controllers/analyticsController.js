const User = require('../models/User');
const Chat = require('../models/Chat');
const Message = require('../models/Message');

exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ online: true });
    const totalChats = await Chat.countDocuments();
    const totalMessages = await Message.countDocuments();
    res.json({ totalUsers, activeUsers, totalChats, totalMessages });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', err });
  }
};
