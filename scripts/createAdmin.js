const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://omrishi9608:omrishi9608@chatapp-cluster.thog6qs.mongodb.net/?retryWrites=true&w=majority&appName=chatapp-cluster';

async function createAdmin() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const email = 'omrishi2580@gmail.com';
  const password = 'Omrishi@9608';
  const username = 'admin';
  const profilePic = '';

  let admin = await User.findOne({ email });
  if (admin) {
    admin.email = email;
    admin.password = await bcrypt.hash(password, 10);
    admin.profilePic = profilePic;
    admin.isVerified = true;
    await admin.save();
    console.log('Admin user updated:', admin.email);
  } else {
    const hashed = await bcrypt.hash(password, 10);
    admin = new User({ email, username, password: hashed, profilePic, isVerified: true });
    await admin.save();
    console.log('Admin user created:', admin.email);
  }
  process.exit(0);
}

createAdmin().catch(e => {
  console.error(e);
  process.exit(1);
});
