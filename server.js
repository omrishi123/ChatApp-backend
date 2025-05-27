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

const allowedOrigins = [
  'https://chat-app-frontend-wheat-three.vercel.app',
  'https://chat-app-backend-sandy.vercel.app',
  'capacitor://localhost',
  'http://localhost:3000',
  'https://localhost',
  'http://localhost:8080',
  'http://localhost:8100'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('vercel.app')) {
      return callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// Add Cache-Control and security headers for all API responses
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  res.set('X-Content-Type-Options', 'nosniff');
  res.removeHeader('X-Powered-By');
  next();
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection with better error handling
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout after 5s
  socketTimeoutMS: 45000, // Close idle connections after 45s
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => {
  console.error('MongoDB connection error:', err.message);
  // Mask the password in logs for security
  const maskedUri = process.env.MONGO_URI 
    ? process.env.MONGO_URI.replace(/(mongodb\+srv:\/\/[^:]+:)([^@]+)(@.+)/, '$1*****$3') 
    : 'MONGO_URI is NOT set';
  console.error('Connection string used:', maskedUri);
  process.exit(1);
});

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
