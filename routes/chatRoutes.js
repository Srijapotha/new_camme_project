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
  sendImageMessage,
  getNotification,
  setNotification,
  getSharedMedia,
  // New endpoints
  setGroupChatPin,
  verifyGroupChatPin,
  getAutoDeleteSetting,
  setAutoDeleteSetting,
  listSavedMessages,
  deleteSavedMessage,
  listBlockedUsers,
  listRestrictedUsers,
  fetchOnlineUsers,
  fetchFriendsList
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
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               token:
 *                 type: string
 *                 description: JWT token for authentication
 *                 example: 6699aabbccddeeff0011223344556677
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
 *     security:
 *       - bearerAuth: []
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
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               token:
 *                 type: string
 *                 description: JWT token for authentication
 *                 example: 6699aabbccddeeff0011223344556677
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
 * /chat/messages:
 *   post:
 *     summary: Get all messages for a chat
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
 *             properties:
 *               chatId:
 *                 type: string
 *                 description: The ID of the chat
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               token:
 *                 type: string
 *                 description: JWT token for authentication
 *                 example: 6699aabbccddeeff0011223344556677
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
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               token:
 *                 type: string
 *                 description: JWT token for authentication
 *                 example: 6699aabbccddeeff0011223344556677
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
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               token:
 *                 type: string
 *                 description: JWT token for authentication
 *                 example: 6699aabbccddeeff0011223344556677
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
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               token:
 *                 type: string
 *                 description: JWT token for authentication
 *                 example: 6699aabbccddeeff0011223344556677
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
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               token:
 *                 type: string
 *                 description: JWT token for authentication
 *                 example: 6699aabbccddeeff0011223344556677
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
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   chatId:
 *                     type: string
 *                   senderId:
 *                     type: string
 *                   senderProfile:
 *                     type: object
 *                     properties:
 *                       userName:
 *                         type: string
 *                       fullName:
 *                         type: string
 *                       profilePic:
 *                         type: string
 *                       isOnline:
 *                         type: boolean
 *                       lastSeen:
 *                         type: string
 *                         format: date-time
 *                   content:
 *                     type: string
 *                   messageType:
 *                     type: string
 *                   sentAt:
 *                     type: string
 *                     format: date-time
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               token:
 *                 type: string
 *                 description: JWT token for authentication
 *                 example: 6699aabbccddeeff0011223344556677
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
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               token:
 *                 type: string
 *                 description: JWT token for authentication
 *                 example: 6699aabbccddeeff0011223344556677
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
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               token:
 *                 type: string
 *                 description: JWT token for authentication
 *                 example: 6699aabbccddeeff0011223344556677
 *     responses:
 *       200:
 *         description: User restricted/unrestricted successfully.
 *       500:
 *         description: Server error.
 */
router.post('/restrict-user', authMiddleware, restrictUser);

/**
 * @swagger
 * /chat/shared-media:
 *   post:
 *     summary: Get all shared media in a chat
 *     description: Returns all media messages (images, videos, files) shared in a chat, including sender profile and time.
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
 *             properties:
 *               chatId:
 *                 type: string
 *                 description: The ID of the chat
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               token:
 *                 type: string
 *                 description: JWT token for authentication
 *                 example: 6699aabbccddeeff0011223344556677
 *     responses:
 *       200:
 *         description: List of shared media messages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   mediaUrl:
 *                     type: string
 *                   mediaType:
 *                     type: string
 *                   sentAt:
 *                     type: string
 *                     format: date-time
 *                   senderProfile:
 *                     type: object
 *                     properties:
 *                       userName:
 *                         type: string
 *                       fullName:
 *                         type: string
 *                       profilePic:
 *                         type: string
 *                       isOnline:
 *                         type: boolean
 *                       lastSeen:
 *                         type: string
 *                         format: date-time
 */
router.post('/shared-media', authMiddleware, getSharedMedia);

/**
 * @swagger
 * /chat/set-notification:
 *   post:
 *     summary: Set notification preference for a contact
 *     description: Enable or disable notifications for a specific contact.
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
 *               - contactId
 *               - enabled
 *             properties:
 *               userId:
 *                 type: string
 *               contactId:
 *                 type: string
 *               enabled:
 *                 type: boolean
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               token:
 *                 type: string
 *                 description: JWT token for authentication
 *                 example: 6699aabbccddeeff0011223344556677
 *     responses:
 *       200:
 *         description: Notification setting updated
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/set-notification', authMiddleware, setNotification);

/**
 * @swagger
 * /chat/get-notification:
 *   post:
 *     summary: Get notification preference for a contact
 *     description: Returns whether notifications are enabled for a specific contact.
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
 *               - contactId
 *             properties:
 *               userId:
 *                 type: string
 *               contactId:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               token:
 *                 type: string
 *                 description: JWT token for authentication
 *                 example: 6699aabbccddeeff0011223344556677
 *     responses:
 *       200:
 *         description: Notification setting status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 enabled:
 *                   type: boolean
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/get-notification', authMiddleware, getNotification);

/**
 * @swagger
 * /chat/get-auto-delete-setting:
 *   post:
 *     summary: Get auto-delete setting for a chat
 *     description: Returns the auto-delete time (in minutes) for a chat.
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
 *             properties:
 *               chatId:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               token:
 *                 type: string
 *                 description: JWT token for authentication
 *     responses:
 *       200:
 *         description: Auto-delete time returned.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 autoDeleteTime:
 *                   type: integer
 *                   nullable: true
 *       404:
 *         description: Chat not found.
 *       500:
 *         description: Server error.
 */
router.post('/get-auto-delete-setting', authMiddleware, getAutoDeleteSetting);

/**
 * @swagger
 * /chat/set-auto-delete-setting:
 *   post:
 *     summary: Set auto-delete setting for a chat
 *     description: Sets the auto-delete time (in minutes) for a chat.
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
 *               - autoDeleteTime
 *             properties:
 *               chatId:
 *                 type: string
 *               autoDeleteTime:
 *                 type: integer
 *                 description: Minutes after which messages are auto-deleted.
 *               email:
 *                 type: string
 *                 format: email
 *               token:
 *                 type: string
 *                 description: JWT token for authentication
 *     responses:
 *       200:
 *         description: Auto-delete time updated.
 *       400:
 *         description: Invalid input.
 *       500:
 *         description: Server error.
 */
router.post('/set-auto-delete-setting', authMiddleware, setAutoDeleteSetting);

/**
 * @swagger
 * /chat/list-saved-messages:
 *   post:
 *     summary: List all saved messages for a user
 *     description: Returns all messages saved by the user.
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
 *             properties:
 *               userId:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               token:
 *                 type: string
 *                 description: JWT token for authentication
 *     responses:
 *       200:
 *         description: List of saved messages.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 savedMessages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       messageId:
 *                         type: string
 *                       content:
 *                         type: string
 *                       senderId:
 *                         type: string
 *                       receiverId:
 *                         type: string
 *                       sentAt:
 *                         type: string
 *                         format: date-time
 *                       savedAt:
 *                         type: string
 *                         format: date-time
 *       404:
 *         description: User not found.
 *       500:
 *         description: Server error.
 */
router.post('/list-saved-messages', authMiddleware, listSavedMessages);

/**
 * @swagger
 * /chat/delete-saved-message:
 *   post:
 *     summary: Delete a saved message for a user
 *     description: Deletes a specific saved message for the user.
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
 *               email:
 *                 type: string
 *                 format: email
 *               token:
 *                 type: string
 *                 description: JWT token for authentication
 *     responses:
 *       200:
 *         description: Saved message deleted.
 *       500:
 *         description: Server error.
 */
router.post('/delete-saved-message', authMiddleware, deleteSavedMessage);

/**
 * @swagger
 * /chat/list-blocked-users:
 *   post:
 *     summary: List all blocked users for a user
 *     description: Returns all users blocked by the user.
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
 *             properties:
 *               userId:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               token:
 *                 type: string
 *                 description: JWT token for authentication
 *     responses:
 *       200:
 *         description: List of blocked users.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 blockedUsers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       username:
 *                         type: string
 *                       email:
 *                         type: string
 *                       fullName:
 *                         type: string
 *                       profilePic:
 *                         type: string
 *       404:
 *         description: User not found.
 *       500:
 *         description: Server error.
 */
router.post('/list-blocked-users', authMiddleware, listBlockedUsers);

/**
 * @swagger
 * /chat/list-restricted-users:
 *   post:
 *     summary: List all restricted users for a user
 *     description: Returns all users restricted by the user.
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
 *             properties:
 *               userId:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               token:
 *                 type: string
 *                 description: JWT token for authentication
 *     responses:
 *       200:
 *         description: List of restricted users.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 restrictedUsers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       username:
 *                         type: string
 *                       email:
 *                         type: string
 *                       fullName:
 *                         type: string
 *                       profilePic:
 *                         type: string
 *       404:
 *         description: User not found.
 *       500:
 *         description: Server error.
 */
router.post('/list-restricted-users', authMiddleware, listRestrictedUsers);

/**
 * @swagger
 * /chat/fetch-online-users:
 *   post:
 *     summary: Fetch all online users
 *     description: Returns a list of all users who are currently online.
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               token:
 *                 type: string
 *                 description: JWT token for authentication
 *                 example: 6699aabbccddeeff0011223344556677
 *     responses:
 *       200:
 *         description: List of online users.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 onlineUsers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       username:
 *                         type: string
 *                       email:
 *                         type: string
 *                       fullName:
 *                         type: string
 *                       profilePic:
 *                         type: string
 *                       isOnline:
 *                         type: boolean
 *                       lastSeen:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Server error.
 */
router.post('/fetch-online-users', authMiddleware, fetchOnlineUsers);

/**
 * @swagger
 * /chat/fetch-friends-list:
 *   post:
 *     summary: Fetch friends list for a user
 *     description: Returns all friends for the user (from userAllFriends).
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
 *             properties:
 *               userId:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               token:
 *                 type: string
 *                 description: JWT token for authentication
 *                 example: 6699aabbccddeeff0011223344556677
 *     responses:
 *       200:
 *         description: List of friends.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 friends:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       username:
 *                         type: string
 *                       email:
 *                         type: string
 *                       fullName:
 *                         type: string
 *                       profilePic:
 *                         type: string
 *                       isOnline:
 *                         type: boolean
 *                       lastSeen:
 *                         type: string
 *                         format: date-time
 *       404:
 *         description: User not found.
 *       500:
 *         description: Server error.
 */
router.post('/fetch-friends-list', authMiddleware, fetchFriendsList);

module.exports = router;
