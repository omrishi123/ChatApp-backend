const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const path = require('path');

// Load env vars
dotenv.config();

const app = express();
app.use(cors({
  origin: 'https://chat-app-frontend-wheat-three.vercel.app', // for testing, allow all. For production, specify your frontend URL.
  credentials: true
}));
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      'https://chat-app-frontend-wheat-three.vercel.app'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/user'));
app.use('/api/chats', require('./routes/chat'));
app.use('/api/messages', require('./routes/message'));
app.use('/api/admin', require('./routes/admin'));

// Serve React static files
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Serve React for any unknown route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// Socket.IO setup
require('./socket')(io);

// Listen on all interfaces for mobile access
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
