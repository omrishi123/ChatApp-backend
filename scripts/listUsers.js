// Save as scripts/listUsers.js in backend
const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }).then(async () => {
  const users = await User.find({});
  console.log(users);
  process.exit(0);
});