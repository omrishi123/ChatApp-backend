const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

async function cleanup() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  // Keep only the AI bot with the correct email, delete all other AI bots
  const keepBot = await User.findOne({ email: 'omai@system.bot', ai_bot: true });
  if (keepBot) {
    await User.deleteMany({
      ai_bot: true,
      _id: { $ne: keepBot._id }
    });
    console.log('Deleted duplicate OM\'S AI bot users. Kept:', keepBot._id);
  } else {
    // If none found, just delete all AI bots (should not happen after fix)
    await User.deleteMany({ ai_bot: true });
    console.log('Deleted all OM\'S AI bot users.');
  }
  process.exit(0);
}

cleanup();
