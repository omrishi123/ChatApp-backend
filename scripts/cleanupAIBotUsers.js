const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

async function cleanup() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  // Removed all AI bot user cleanup logic as AI bots are no longer part of the system
  // await User.deleteMany({ ai_bot: true });
  process.exit(0);
}

cleanup();
