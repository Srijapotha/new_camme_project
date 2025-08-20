const express = require('express');
const {
  searchChats,
  filterMessages,
  setChatPin,
  verifyChatPin,
  saveMessage,
  blockUser,
  restrictUser,
  createPrivateChat,
  getChatMessages,
  sendImageMessage
} = require('../controllers/chatController');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: Chat and messaging features
 */

/**
 * @swagger
 * /chat/search-chats:
 *   post:
 *     summary: Search for users and existing private chats
 *     description: Searches for users and checks if private chats already exist.
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - searchTerm
 *             properties:
 *               userId:
 *                 type: string
 *               searchTerm:
 *                 type: string
 *     responses:
 *       200:
 *         description: A list of matching users and existing private chats.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Server error.
 */
router.post('/search-chats', authMiddleware, searchChats);

/**
 * @swagger
 * /chat/create-private-chat:
 *   post:
 *     summary: Create a private chat between two users
 *     description: Creates a new private chat if one doesn't already exist between the two users.
 *     tags:
 *       - Chat
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId1
 *               - userId2
 *             properties:
 *               userId1:
 *                 type: string
 *                 description: ID of the first user.
 *               userId2:
 *                 type: string
 *                 description: ID of the second user.
 *     responses:
 *       201:
 *         description: New private chat created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 chatId:
 *                   type: string
 *       200:
 *         description: Chat already exists.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 chatId:
 *                   type: string
 *       404:
 *         description: One or both users not found.
 *       500:
 *         description: Server error.
 */
router.post('/create-private-chat', authMiddleware, createPrivateChat);

/**
 * @swagger
 * /api/v1/chat/messages:
 *   post:
 *     summary: Get all messages for a chat
 *     tags:
 *       - Chat
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               chatId:
 *                 type: string
 *                 description: The ID of the chat
 *     responses:
 *       200:
 *         description: List of messages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 */
router.post('/messages', authMiddleware, getChatMessages);

/**
 * @swagger
 * /chat/sendImageMessage:
 *   post:
 *     summary: Send an image message in a chat
 *     description: Uploads an image to Cloudinary and sends it as a chat message.
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - chatId
 *               - senderId
 *               - image
 *             properties:
 *               chatId:
 *                 type: string
 *                 description: The ID of the chat.
 *               senderId:
 *                 type: string
 *                 description: The ID of the sender.
 *               content:
 *                 type: string
 *                 description: Optional text content.
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The image file to upload.
 *     responses:
 *       201:
 *         description: Image message sent successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   $ref: '#/components/schemas/Message'
 *       400:
 *         description: Image file is required.
 *       500:
 *         description: Server error.
 */
router.post('/sendImageMessage', authMiddleware, upload.single('image'), sendImageMessage);

/**
 * @swagger
 * /chat/filter-messages:
 *   post:
 *     summary: Filter chat messages by date
 *     description: Filters messages in a chat by year, month, and optionally day.
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - chatId
 *               - year
 *               - month
 *             properties:
 *               chatId:
 *                 type: string
 *               year:
 *                 type: integer
 *               month:
 *                 type: integer
 *               day:
 *                 type: integer
 *                 description: Optional day to filter by.
 *     responses:
 *       200:
 *         description: A list of messages filtered by the specified date range.
 *       500:
 *         description: Server error.
 */
router.post('/filter-messages', authMiddleware, filterMessages);

/**
 * @swagger
 * /chat/set-chat-pin:
 *   post:
 *     summary: Set a PIN for a private chat
 *     description: Sets a 4-digit PIN for a private chat.
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - chatId
 *               - pin
 *             properties:
 *               userId:
 *                 type: string
 *               chatId:
 *                 type: string
 *               pin:
 *                 type: string
 *                 description: A 4-digit PIN.
 *     responses:
 *       200:
 *         description: PIN set successfully.
 *       400:
 *         description: Invalid PIN format.
 *       500:
 *         description: Server error.
 */
router.post('/set-chat-pin', authMiddleware, setChatPin);

/**
 * @swagger
 * /chat/verify-chat-pin:
 *   post:
 *     summary: Verify the PIN for a private chat
 *     description: Verifies the PIN entered for a private chat.
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - chatId
 *               - pin
 *             properties:
 *               userId:
 *                 type: string
 *               chatId:
 *                 type: string
 *               pin:
 *                 type: string
 *     responses:
 *       200:
 *         description: PIN verification result.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *       404:
 *         description: No PIN set for this chat.
 *       500:
 *         description: Server error.
 */
router.post('/verify-chat-pin', authMiddleware, verifyChatPin);

/**
 * @swagger
 * /chat/save-message:
 *   post:
 *     summary: Save a message for a user
 *     description: Saves a specific message for later reference.
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - messageId
 *             properties:
 *               userId:
 *                 type: string
 *               messageId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message saved successfully.
 *       500:
 *         description: Server error.
 */
router.post('/save-message', authMiddleware, saveMessage);

/**
 * @swagger
 * /chat/block-user:
 *   post:
 *     summary: Block or unblock another user
 *     description: Allows a user to block or unblock another user.
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - targetUserId
 *               - action
 *             properties:
 *               userId:
 *                 type: string
 *               targetUserId:
 *                 type: string
 *               action:
 *                 type: string
 *                 enum: [block, unblock]
 *     responses:
 *       200:
 *         description: User blocked/unblocked successfully.
 *       500:
 *         description: Server error.
 */
router.post('/block-user', authMiddleware, blockUser);

/**
 * @swagger
 * /chat/restrict-user:
 *   post:
 *     summary: Restrict or unrestrict another user
 *     description: Allows a user to restrict or unrestrict another user.
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - targetUserId
 *               - action
 *             properties:
 *               userId:
 *                 type: string
 *               targetUserId:
 *                 type: string
 *               action:
 *                 type: string
 *                 enum: [restrict, unrestrict]
 *     responses:
 *       200:
 *         description: User restricted/unrestricted successfully.
 *       500:
 *         description: Server error.
 */
router.post('/restrict-user', authMiddleware, restrictUser);

module.exports = router;
