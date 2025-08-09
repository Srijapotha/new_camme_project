const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const authRoutes = require("./routes/userAuthRoutes");
const { dbConnect } = require('./dataBase/db');
const mongoose = require('mongoose');
const swaggerSetup = require('./swagger');
const Message = require("./models/messageSchema ")
const User = require("./models/userModel")

const app = express();
const PORT = process.env.PORT || 4000;

const server = http.createServer(app);


const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Socket.io connection handling
const connectedUsers = new Map();
const typingUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User joins
  socket.on('join', async (userId) => {
    try {
      socket.userId = userId;
      connectedUsers.set(userId, socket.id);

      // Update user online status
      await User.findByIdAndUpdate(userId, {
        isOnline: true,
        lastSeen: new Date()
      });

      // Notify others about online status
      socket.broadcast.emit('userOnline', userId);

      // Send online users list
      const onlineUsers = Array.from(connectedUsers.keys());
      socket.emit('onlineUsers', onlineUsers);

    } catch (error) {
      console.error('Error in join:', error);
    }
  });

  // Send message
  socket.on('sendMessage', async (data) => {
    try {
      const { receiverId, message, messageType = 'text' } = data;

      // Save message to database
      const newMessage = new Message({
        senderId: socket.userId,
        receiverId,
        message,
        messageType
      });

      await newMessage.save();

      // Populate sender info
      await newMessage.populate('senderId', 'userName profilePic');
      await newMessage.populate('receiverId', 'userName profilePic');

      // Send to receiver if online
      const receiverSocketId = connectedUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receiveMessage', newMessage);
      }

      // Send back to sender for confirmation
      socket.emit('messageDelivered', newMessage);

    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('messageError', { error: 'Failed to send message' });
    }
  });

  // Typing indicator
  socket.on('typing', (data) => {
    const { receiverId, isTyping } = data;
    const receiverSocketId = connectedUsers.get(receiverId);

    if (receiverSocketId) {
      if (isTyping) {
        typingUsers.set(`${socket.userId}-${receiverId}`, true);
        io.to(receiverSocketId).emit('userTyping', {
          userId: socket.userId,
          isTyping: true
        });
      } else {
        typingUsers.delete(`${socket.userId}-${receiverId}`);
        io.to(receiverSocketId).emit('userTyping', {
          userId: socket.userId,
          isTyping: false
        });
      }
    }
  });

  // Message read receipt
  socket.on('messageRead', async (data) => {
    try {
      const { messageId, senderId } = data;

      // Update message as read
      await Message.findByIdAndUpdate(messageId, {
        isRead: true,
        readAt: new Date()
      });

      // Notify sender
      const senderSocketId = connectedUsers.get(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit('messageReadConfirmation', {
          messageId,
          readBy: socket.userId,
          readAt: new Date()
        });
      }

    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  });

  // Disconnect
  socket.on('disconnect', async () => {
    try {
      if (socket.userId) {
        connectedUsers.delete(socket.userId);

        // Update user offline status
        await User.findByIdAndUpdate(socket.userId, {
          isOnline: false,
          lastSeen: new Date()
        });

        // Clear typing indicators
        for (const [key] of typingUsers) {
          if (key.startsWith(socket.userId)) {
            typingUsers.delete(key);
          }
        }

        // Notify others about offline status
        socket.broadcast.emit('userOffline', socket.userId);
      }

      console.log('User disconnected:', socket.id);
    } catch (error) {
      console.error('Error in disconnect:', error);
    }
  });
});


app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
swaggerSetup(app);

dbConnect();


app.use("/api/v1/user", authRoutes);
require("./timerService");

app.get("/", (req, res) => {
  res.send("Welcome to the Cam Me Application API Documentation");
}
);


// in server.js or app.js
app.get('/reset-window', (req, res) => {
  const email = req.query.email;

  res.send(`
      <html>
        <head><title>Reset Password</title></head>
        <body>
          <h2>Reset Your Password</h2>
          <form id="resetForm">
            <input type="hidden" id="email" value="${email}" />
            <label>OTP:</label>
            <input type="text" id="otp" required /><br/><br/>
            <label>New Password:</label>
            <input type="password" id="newPassword" required /><br/><br/>
            <button type="submit">Save</button>
          </form>
  
          <script>
            document.getElementById('resetForm').addEventListener('submit', async (e) => {
              e.preventDefault();
              const email = document.getElementById('email').value;
              const otp = document.getElementById('otp').value;
              const newPassword = document.getElementById('newPassword').value;
  
              const res = await fetch('/api/v1/user/reset-password',{
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, newPassword })
              });
  
              const data = await res.json();
              if (data.sucess) {
                alert("Password reset successful!");
                window.close();
              } else {
                alert(data.message || "Reset failed");
              }
            });
          </script>
        </body>
      </html>
    `);
});


server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
  console.log(`Api Docs avaliable  at http://localhost:${PORT}/api-docs`);
});
