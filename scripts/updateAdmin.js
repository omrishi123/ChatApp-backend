// Save as scripts/updateAdmin.js in backend
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://omrishi9608:omrishi9608@chatapp-cluster.thog6qs.mongodb.net/?retryWrites=true&w=majority&appName=chatapp-cluster';

async function updateAdmin() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const email = 'omrishi2580@gmail.com';
  const password = 'Omrishi@9608';
  const username = 'admin';

  const hashed = await bcrypt.hash(password, 10);

  const result = await User.findOneAndUpdate(
    { username }, // find by username: 'admin'
    { email, password: hashed, isVerified: true },
    { new: true }
  );

  if (result) {
    console.log('Admin user updated:', result.email);
  } else {
    console.log('No admin user found to update.');
  }
  process.exit(0);
}

updateAdmin().catch(e => {
  console.error(e);
  process.exit(1);
});