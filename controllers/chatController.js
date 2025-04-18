const Chat = require('../models/Chat');
const Message = require('../models/Message');

exports.getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user.id })
      .populate('participants', 'username profilePic email')
      .populate({ path: 'lastMessage', populate: { path: 'sender', select: 'username profilePic email' } })
      .sort({ updatedAt: -1 });
    // Add a field 'otherUser' for each chat, containing the other participant's info
    const chatsWithOtherUser = chats.map(chat => {
      const others = chat.participants.filter(u => u._id.toString() !== req.user.id);
      return {
        ...chat.toObject(),
        otherUser: others[0] || null // for 2-person chat
      };
    });
    res.json(chatsWithOtherUser);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', err });
  }
};

exports.startChat = async (req, res) => {
  try {
    const { userId } = req.body;
    let chat = await Chat.findOne({ participants: { $all: [req.user.id, userId] } });
    if (!chat) {
      chat = new Chat({ participants: [req.user.id, userId] });
      await chat.save();
    }
    res.json(chat);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', err });
  }
};

exports.muteChat = async (req, res) => {
  try {
    const { chatId } = req.body;
    await Chat.findByIdAndUpdate(chatId, { isMuted: true });
    res.json({ msg: 'Chat muted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', err });
  }
};

exports.unmuteChat = async (req, res) => {
  try {
    const { chatId } = req.body;
    await Chat.findByIdAndUpdate(chatId, { isMuted: false });
    res.json({ msg: 'Chat unmuted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', err });
  }
};
