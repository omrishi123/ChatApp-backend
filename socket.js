// Socket.IO logic for chat events
const User = require('./models/User');
const Chat = require('./models/Chat');
const Message = require('./models/Message');

module.exports = function(io) {
  const onlineUsers = new Map(); // userId -> socketId

  io.on('connection', (socket) => {
    // User comes online
    socket.on('userOnline', async ({ userId }) => {
      onlineUsers.set(userId, socket.id);
      await User.findByIdAndUpdate(userId, { online: true, lastSeen: new Date() });
      io.emit('updateUserStatus', { userId, online: true });
    });

    // User goes offline
    socket.on('disconnect', async () => {
      for (const [userId, sockId] of onlineUsers.entries()) {
        if (sockId === socket.id) {
          onlineUsers.delete(userId);
          await User.findByIdAndUpdate(userId, { online: false, lastSeen: new Date() });
          io.emit('updateUserStatus', { userId, online: false });
        }
      }
    });

    // Join chat room
    socket.on('joinChat', ({ chatId }) => {
      console.log('Joining room:', chatId);
      socket.join(chatId);
    });

    // Join all user chats (for chat list/global updates)
    socket.on('joinAllUserChats', async ({ userId }) => {
      // Find all chat IDs for this user
      const chats = await Chat.find({ participants: userId }).select('_id');
      chats.forEach(chat => {
        console.log('Joining room:', chat._id.toString(), 'for user:', userId);
        socket.join(chat._id.toString());
      });
    });

    // Typing indicator
    socket.on('typing', ({ chatId, userId }) => {
      socket.to(chatId).emit('typing', { chatId, userId });
    });
    socket.on('stopTyping', ({ chatId, userId }) => {
      socket.to(chatId).emit('stopTyping', { chatId, userId });
    });

    // Send message
    socket.on('sendMessage', async (data) => {
      // Use the correct chat room id (data.chat)
      console.log('Emitting newMessage to room:', data.chat, 'Message:', data);
      io.to(data.chat).emit('newMessage', data);
      // Optionally: handle push notification logic here
    });

    // Message seen
    socket.on('seenMessage', ({ chatId, messageId, userId }) => {
      io.to(chatId).emit('messageSeen', { messageId, userId });
    });
  });
};
