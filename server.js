// server.js

const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

// Route Imports
const authRoutes = require("./routes/userAuthRoutes");
const chatRoutes = require('./routes/chatRoutes');
const groupRoutes = require('./routes/groupRoutes');
const referralRoutes = require('./routes/referralRoutes');
const profileRoutes = require('./routes/profileRoutes');
const notificationSettingsRoutes = require('./routes/notificationSettings');
const devicePermissionRoutes = require('./routes/devicePermissionRoutes')
const reportRoutes = require('./routes/reportRoutes');

// Model Imports (make sure these exist)
const Message = require("./models/message");
const User = require("./models/userModel");
const Chat = require("./models/chat");

// Utility/Service Imports
const { dbConnect } = require('./dataBase/db');
const swaggerSetup = require('./swagger');
const admin = require('./firebase');
require('./utils/messageCleanup');
require("./timerService");

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

// A map to store active sockets and their user IDs
const connectedUsers = new Map();

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    /**
     * @description Handles a user joining a chat application.
     * @param {string} userId - The unique ID of the user.
     */
    socket.on('join', async (userId) => {
        try {
            socket.userId = userId;
            connectedUsers.set(userId, socket.id);

            await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() });
            socket.broadcast.emit('userOnline', userId);

            const onlineUsers = Array.from(connectedUsers.keys());
            socket.emit('onlineUsers', onlineUsers);

        } catch (error) {
            console.error('Error in join:', error);
        }
    });

    /**
     * @description Handles a user joining a specific chat room (private or group).
     * @param {object} data - Contains userId and chatId.
     */
    socket.on('joinChat', async (data) => {
        const { userId, chatId } = data;
        socket.join(chatId);
        socket.userId = userId;
        socket.currentChat = chatId;
        await User.findByIdAndUpdate(userId, { lastSeen: new Date() });
    });

    /**
     * @description Handles sending a message within a specific chat room.
     * @param {object} data - Contains chatId, senderId, content, etc.
     */
    socket.on('sendMessage', async (data) => {
        try {
            const { chatId, senderId, content, messageType, mediaUrl } = data;
            const chat = await Chat.findById(chatId).populate('participants');
            const sender = await User.findById(senderId);

            if (!sender || !chat) {
                return socket.emit('messageError', { error: 'Invalid sender or chat' });
            }

            // Blocked user check: if any recipient has blocked the sender, do not deliver
            for (const participant of chat.participants) {
                if (participant._id.toString() !== senderId.toString()) {
                    const recipient = await User.findById(participant._id);
                    if (recipient.blockedUsers && recipient.blockedUsers.map(id => id.toString()).includes(senderId.toString())) {
                        return socket.emit('messageError', { error: 'You are blocked by this user and cannot send messages.' });
                    }
                }
            }

            const message = new Message({
                chatId,
                senderId,
                content,
                messageType: messageType || 'text',
                mediaUrl,
                sentAt: new Date()
            });

            // if (chat.autoDeleteTime > 0) {
            //     message.autoDeleteAt = new Date(Date.now() + chat.autoDeleteTime * 60 * 60 * 1000);
            // }
            let autoDeleteMs = null;
            switch (chat.autoDeleteTime) {
                case '24h':
                    autoDeleteMs = 24 * 60 * 60 * 1000;
                    break;
                case '1w':
                    autoDeleteMs = 7 * 24 * 60 * 60 * 1000;
                    break;
                case '30d':
                    autoDeleteMs = 30 * 24 * 60 * 60 * 1000;
                    break;
                default:
                    autoDeleteMs = null; // 'never'
            }
            if (autoDeleteMs) {
                message.autoDeleteAt = new Date(Date.now() + autoDeleteMs);
            }

            await message.save();
            await message.populate('senderId', 'userName');

            // send notification
            for (const participant of chat.participants) {
                if (participant._id.toString() !== senderId.toString()) {
                    const user = await User.findById(participant._id);
                    if (user && user.fcmToken) {
                        try {
                            await admin.messaging().send({
                                token: user.fcmToken,
                                notification: {
                                    title: `New message from ${sender.userName || sender.username}`,
                                    body: content || (messageType === 'image' ? '📷 Image' : 'New message'),
                                },
                                data: {
                                    chatId: chatId.toString(),
                                    senderId: senderId.toString(),
                                    messageId: message._id.toString(),
                                }
                            });
                        } catch (err) {
                            console.error('FCM send error:', err.message);
                        }
                    }
                }
            }

            chat.participants.forEach(participant => {
                if (!sender.restrictedUsers.includes(participant._id)) {
                    io.to(chatId).emit('newMessage', message);
                }
            });

            await Chat.findByIdAndUpdate(chatId, { lastActivity: new Date() });

        } catch (error) {
            console.error('Error sending message:', error);
            socket.emit('messageError', { message: error.message });
        }
    });

    /**
     * @description Handles typing indicators.
     * @param {object} data - Contains receiverId and isTyping boolean.
     */
    socket.on('typing', (data) => {
        const { receiverId, isTyping } = data;
        const receiverSocketId = connectedUsers.get(receiverId);

        if (receiverSocketId) {
            io.to(receiverSocketId).emit('userTyping', {
                userId: socket.userId,
                isTyping
            });
        }
    });

    // group typing
    socket.on('groupTyping', (data) => {
    // data: { groupId, userId, isTyping }
    // Broadcast to all group members except the sender
    socket.to(data.groupId).emit('groupUserTyping', {
        userId: data.userId,
        groupId: data.groupId,
        isTyping: data.isTyping,
    });
    });

    /**
     * @description Handles message read receipts.
     * @param {object} data - Contains messageId and senderId.
     */
    socket.on('messageRead', async (data) => {
        try {
            const { messageId, senderId } = data;

            await Message.findByIdAndUpdate(messageId, { isRead: true, readAt: new Date() });
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

    /**
     * @description Handles pinning/unpinning a message in a group.
     * @param {object} data - Contains chatId, messageId, userId, and action.
     */
    socket.on('pinMessage', async (data) => {
        try {
            const { chatId, messageId, userId, action } = data;
            const chat = await Chat.findById(chatId);

            if (!chat.isGroup || !chat.adminId.equals(userId)) {
                return socket.emit('error', { message: 'Only group admin can pin messages' });
            }

            if (action === 'pin') {
                await Chat.findByIdAndUpdate(chatId, { $addToSet: { pinnedMessages: messageId } });
                await Message.findByIdAndUpdate(messageId, { isPinned: true });
            } else {
                await Chat.findByIdAndUpdate(chatId, { $pull: { pinnedMessages: messageId } });
                await Message.findByIdAndUpdate(messageId, { isPinned: false });
            }
            io.to(chatId).emit('messagePinned', { messageId, action });
        } catch (error) {
            socket.emit('error', { message: error.message });
        }
    });

    /**
     * @description Handles a user leaving a chat room.
     * @param {string} chatId - The ID of the chat room to leave.
     */
    socket.on('leaveChat', (chatId) => {
        socket.leave(chatId);
    });

    /**
     * @description Handles user disconnection.
     */
    socket.on('disconnect', async () => {
        try {
            if (socket.userId) {
                connectedUsers.delete(socket.userId);
                await User.findByIdAndUpdate(socket.userId, { isOnline: false, lastSeen: new Date() });
                socket.broadcast.emit('userOffline', socket.userId);
            }
            console.log('User disconnected:', socket.id);
        } catch (error) {
            console.error('Error in disconnect:', error);
        }
    });
});

// Express Middleware and Route setup
app.use(cors({ origin: "*", credentials: true }));
// capture raw body for debugging malformed JSON payloads
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
swaggerSetup(app);

// Database connection
dbConnect();

// API Routes
app.use("/api/v1/user", authRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/group', groupRoutes);
app.use('/api/v1/referral', referralRoutes);
// Profile routes with specific JSON parsing
app.use('/api/v1/profile', express.json({
  strict: false,
  verify: (req, res, buf, encoding) => {
    if (buf && buf.length) {
      try {
        JSON.parse(buf.toString(encoding));
      } catch (e) {
        console.error('JSON Parse Error:', e.message);
        res.status(400).json({
          error: 'Invalid JSON in request',
          details: e.message,
          location: '/api/v1/profile'
        });
        throw new Error('Invalid JSON');
      }
    }
  }
}), profileRoutes);
app.use('/api/v1/notification-settings', notificationSettingsRoutes);
app.use('/api/v1/device-permissions', devicePermissionRoutes);
app.use('/api/v1/reports', reportRoutes);

app.get("/", (req, res) => {
    res.send("Welcome to the Cam Me Application API Documentation");
});

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

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
    console.log(`Api Docs available at http://localhost:${PORT}/api-docs`);
});