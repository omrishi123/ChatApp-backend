const axios = require('axios');
require('dotenv').config();
const User = require('../models/User');
const Chat = require('../models/Chat');
const Message = require('../models/Message');

// Find or create the AI bot user
async function getAIBotUser() {
  let bot = await User.findOne({ email: 'omai@system.bot', ai_bot: true });
  if (!bot) {
    bot = new User({
      username: "OM'S AI",
      email: 'omai@system.bot',
      password: 'AIBotPassword123!', // Not used, but required
      ai_bot: true,
      profilePic: '/uploads/default-ai-bot.jpg'
    });
    await bot.save();
  }
  return bot;
}

exports.sendAIMessage = async (req, res) => {
  try {
    const { text, chatId } = req.body;
    const userId = req.user.id;
    const bot = await getAIBotUser();

    // Call Gemini API
    const geminiRes = await axios.post(
      'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent',
      {
        contents: [{ parts: [{ text }] }]
      },
      {
        headers: { 'Content-Type': 'application/json' },
        params: { key: process.env.GEMINI_API_KEY }
      }
    );
    const aiReply = geminiRes.data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't understand that.";

    // Save user message
    const chat = chatId ? await Chat.findById(chatId) : new Chat({ participants: [userId, bot._id] });
    if (!chat._id) await chat.save();
    const userMsg = new Message({
      chat: chat._id,
      sender: userId,
      receiver: bot._id,
      text,
      mediaType: 'none'
    });
    await userMsg.save();
    // Save AI reply
    const aiMsg = new Message({
      chat: chat._id,
      sender: bot._id,
      receiver: userId,
      text: aiReply,
      mediaType: 'none'
    });
    await aiMsg.save();
    chat.lastMessage = aiMsg._id;
    await chat.save();
    res.json({ aiReply, chatId: chat._id, aiMsg });
  } catch (err) {
    console.error('AI ERROR:', err?.response?.data || err?.message || err);
    res.status(500).json({ msg: 'AI error', err: err?.response?.data || err?.message || String(err) });
  }
};

// Admin: update AI bot profile pic
exports.updateAIBotProfilePic = async (req, res) => {
  try {
    const bot = await getAIBotUser();
    if (req.file) bot.profilePic = `/uploads/${req.file.filename}`;
    await bot.save();
    res.json({ msg: 'AI bot profile updated', profilePic: bot.profilePic });
  } catch (err) {
    res.status(500).json({ msg: 'AI error', err: err.response?.data || err.message });
  }
};
