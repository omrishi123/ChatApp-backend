const Message = require('../models/Message');
const Chat = require('../models/Chat');
const User = require('../models/User'); // assuming User model is in '../models/User'

exports.getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await Message.find({ chat: chatId, deletedFor: { $ne: req.user.id } })
      .populate('sender', 'username profilePic')
      .populate('repliedTo')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', err });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { chatId, text, mediaType, repliedTo } = req.body;
    let media = '';
    if (req.file) media = `/uploads/${req.file.filename}`;
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ msg: 'Chat not found' });
    // Block check: prevent sending if receiver has blocked sender or sender has blocked receiver
    const senderUser = await User.findById(req.user.id);
    const receiverUser = await User.findById(chat.participants.find(id => id.toString() !== req.user.id));
    if (senderUser.blockedUsers.includes(receiverUser._id) || receiverUser.blockedUsers.includes(senderUser._id)) {
      return res.status(403).json({ msg: 'You cannot send messages to this user.' });
    }
    const receiver = chat.participants.find(id => id.toString() !== req.user.id);
    const message = new Message({
      chat: chatId,
      sender: req.user.id,
      receiver,
      text,
      media,
      mediaType: mediaType || (media ? 'image' : 'none'),
      repliedTo: repliedTo || null
    });
    await message.save();
    chat.lastMessage = message._id;
    await chat.save();
    res.json(message);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', err });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const { messageId, forEveryone } = req.body;
    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ msg: 'Message not found' });
    if (forEveryone) {
      message.text = '';
      message.media = '';
      message.deletedFor = message.deletedFor.concat([message.sender, message.receiver]);
    } else {
      message.deletedFor = message.deletedFor.concat([req.user.id]);
    }
    await message.save();
    res.json({ msg: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', err });
  }
};

exports.starMessage = async (req, res) => {
  try {
    const { messageId } = req.body;
    await Message.findByIdAndUpdate(messageId, { $addToSet: { starredBy: req.user.id } });
    res.json({ msg: 'Message starred' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', err });
  }
};

exports.unstarMessage = async (req, res) => {
  try {
    const { messageId } = req.body;
    await Message.findByIdAndUpdate(messageId, { $pull: { starredBy: req.user.id } });
    res.json({ msg: 'Message unstarred' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', err });
  }
};

exports.clearChat = async (req, res) => {
  try {
    const { chatId } = req.body;
    // Mark all messages in this chat as deleted for the current user
    await Message.updateMany(
      { chat: chatId, deletedFor: { $ne: req.user.id } },
      { $push: { deletedFor: req.user.id } }
    );
    res.json({ msg: 'Chat cleared' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', err });
  }
};
