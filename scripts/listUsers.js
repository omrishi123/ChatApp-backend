// Save as scripts/listUsers.js in backend
const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://omrishi9608:omrishi9608@chatapp-cluster.thog6qs.mongodb.net/?retryWrites=true&w=majority&appName=chatapp-cluster';

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }).then(async () => {
  const users = await User.find({});
  console.log(users);
  process.exit(0);
});