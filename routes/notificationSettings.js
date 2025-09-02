const express = require('express');
const router = express.Router();
const {
    getNotificationSettings,
    updateNotificationSettings,
    resetNotificationSettings,
    updateSpecificSetting
} = require('../controllers/notificationSettingsController');
const { authMiddleware } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /notification-settings:
 *   post:
 *     summary: Get user's notification settings
 *     description: Retrieve the current notification preferences for the authenticated user
 *     tags:
 *       - Notification Settings
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - token
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email for verification
 *               token:
 *                 type: string
 *                 description: JWT token for authentication
 *     responses:
 *       200:
 *         description: Notification settings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 settings:
 *                   $ref: '#/components/schemas/NotificationSettings'
 *       500:
 *         description: Server error
 */
router.post('/', authMiddleware, getNotificationSettings);

/**
 * @swagger
 * /notification-settings:
 *   put:
 *     summary: Update user's notification settings
 *     description: Update notification preferences for the authenticated user
 *     tags:
 *       - Notification Settings
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - token
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email for verification
 *               token:
 *                 type: string
 *                 description: JWT token for authentication
 *               notifications:
 *                 type: boolean
 *               posts:
 *                 type: boolean
 *               photographs:
 *                 type: boolean
 *               filterApplies:
 *                 type: boolean
 *               moments:
 *                 type: boolean
 *               coinInteractions:
 *                 type: boolean
 *               opinions:
 *                 type: boolean
 *               shares:
 *                 type: boolean
 *               saved:
 *                 type: boolean
 *               chats:
 *                 type: boolean
 *               lives:
 *                 type: boolean
 *               requests:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Notification settings updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 settings:
 *                   $ref: '#/components/schemas/NotificationSettings'
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Server error
 */
router.put('/', authMiddleware, updateNotificationSettings);

/**
 * @swagger
 * /notification-settings/reset:
 *   post:
 *     summary: Reset notification settings to default
 *     description: Reset all notification preferences to their default values
 *     tags:
 *       - Notification Settings
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - token
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email for verification
 *               token:
 *                 type: string
 *                 description: JWT token for authentication
 *     responses:
 *       200:
 *         description: Notification settings reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 settings:
 *                   $ref: '#/components/schemas/NotificationSettings'
 *       500:
 *         description: Server error
 */
router.post('/reset', authMiddleware, resetNotificationSettings);

/**
 * @swagger
 * /notification-settings/specific:
 *   put:
 *     summary: Update a specific notification setting
 *     description: Update a single notification preference
 *     tags:
 *       - Notification Settings
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - token
 *               - settingType
 *               - value
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email for verification
 *               token:
 *                 type: string
 *                 description: JWT token for authentication
 *               settingType:
 *                 type: string
 *                 enum: [notifications, posts, photographs, filterApplies, moments, coinInteractions, opinions, shares, saved, chats, lives, requests]
 *                 description: The specific setting to update
 *               value:
 *                 type: boolean
 *                 description: The new value for the setting
 *     responses:
 *       200:
 *         description: Specific notification setting updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 settings:
 *                   $ref: '#/components/schemas/NotificationSettings'
 *       400:
 *         description: Invalid setting type or value
 *       500:
 *         description: Server error
 */
router.put('/specific', authMiddleware, updateSpecificSetting);

/**
 * @swagger
 * components:
 *   schemas:
 *     NotificationSettings:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the notification settings
 *         userId:
 *           type: string
 *           description: Reference to the user
 *         notifications:
 *           type: boolean
 *           description: General notifications toggle
 *         posts:
 *           type: boolean
 *           description: Post notifications toggle
 *         photographs:
 *           type: boolean
 *           description: Photography notifications toggle
 *         filterApplies:
 *           type: boolean
 *           description: Filter applications notifications toggle
 *         moments:
 *           type: boolean
 *           description: Moments notifications toggle
 *         coinInteractions:
 *           type: boolean
 *           description: Coin interactions notifications toggle
 *         opinions:
 *           type: boolean
 *           description: Opinions notifications toggle
 *         shares:
 *           type: boolean
 *           description: Shares notifications toggle
 *         saved:
 *           type: boolean
 *           description: Saved content notifications toggle
 *         chats:
 *           type: boolean
 *           description: Chat notifications toggle
 *         lives:
 *           type: boolean
 *           description: Live content notifications toggle
 *         requests:
 *           type: boolean
 *           description: Friend requests notifications toggle
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the settings were created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the settings were last updated
 */

module.exports = router;
