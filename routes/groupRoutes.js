const express = require('express');
const groupController = require('../controllers/groupController');
const router = express.Router();
const {authMiddleware} = require('../middleware/authMiddleware');

// Helper to ensure all handlers are functions
function safeHandler(fnName) {
	return typeof groupController[fnName] === 'function'
		? groupController[fnName]
		: (req, res) => {
			console.warn(`Handler for ${fnName} is not implemented`);
			res.status(501).json({error: `Handler for ${fnName} not implemented`});
		};
}

/**
 * @swagger
 * tags:
 *   name: Group
 *   description: Group chat management
 */

/**
 * @swagger
 * /group/create-group:
 *   post:
 *     summary: Create a new group chat
 *     description: Allows an admin to create a new group chat with selected participants.
 *     tags:
 *       - Group
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - adminId
 *               - groupName
 *               - participants
 *             properties:
 *               adminId:
 *                 type: string
 *               groupName:
 *                 type: string
 *               participants:
 *                 type: array
 *                 items:
 *                   type: string
 *               groupTheme:
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
 *         description: Group created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 group:
 *                   $ref: '#/components/schemas/Chat'
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error.
 */
router.post('/create-group', authMiddleware, safeHandler('createGroup'));

/**
 * @swagger
 * /group/add-member:
 *   post:
 *     summary: Add a new member to a group chat
 *     description: Allows the group admin to add a new member to the group.
 *     tags:
 *       - Group
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - groupId
 *               - adminId
 *               - newMemberId
 *             properties:
 *               groupId:
 *                 type: string
 *               adminId:
 *                 type: string
 *               newMemberId:
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
 *         description: Member added successfully.
 *       403:
 *         description: Only admin can add members.
 *       500:
 *         description: Server error.
 */
router.post('/add-member', authMiddleware, safeHandler('addMember'));

/**
 * @swagger
 * /group/remove-member:
 *   post:
 *     summary: Remove a member from a group chat
 *     description: Allows the group admin to remove a member from the group.
 *     tags:
 *       - Group
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - groupId
 *               - adminId
 *               - memberId
 *             properties:
 *               groupId:
 *                 type: string
 *               adminId:
 *                 type: string
 *               memberId:
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
 *         description: Member removed successfully.
 *       403:
 *         description: Only admin can remove members.
 *       500:
 *         description: Server error.
 */
router.post('/remove-member', authMiddleware, safeHandler('removeMember'));

/**
 * @swagger
 * /group/my-groups:
 *   post:
 *     summary: Get all groups for a user
 *     description: Returns all group chats where the given user is a participant.
 *     tags:
 *       - Group
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The user's ID
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
 *         description: List of groups the user is a member of.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 groups:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Chat'
 *       400:
 *         description: userId is required.
 *       500:
 *         description: Server error.
 */
router.post('/my-groups', authMiddleware, safeHandler('getMyGroups'));

/**
 * @swagger
 * /group/update-profile:
 *   post:
 *     summary: Update group profile, theme, or photo
 *     description: Allows the group admin to update group name, theme, or photo.
 *     tags:
 *       - Group
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - groupId
 *               - adminId
 *             properties:
 *               groupId:
 *                 type: string
 *               adminId:
 *                 type: string
 *               groupName:
 *                 type: string
 *               groupTheme:
 *                 type: string
 *               groupPhoto:
 *                 type: string
 *                 description: URL or file path
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
 *         description: Group updated successfully.
 *       403:
 *         description: Only admin can update group.
 *       500:
 *         description: Server error.
 */
router.post('/update-profile', authMiddleware, safeHandler('updateGroupProfile'));

/**
 * @swagger
 * /group/filter-messages:
 *   post:
 *     summary: Filter group chat messages by date
 *     description: Filters messages in a group chat by year, month, and optionally day.
 *     tags:
 *       - Group
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - groupId
 *               - year
 *               - month
 *             properties:
 *               groupId:
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
router.post('/filter-messages', authMiddleware, safeHandler('filterGroupMessages'));

/**
 * @swagger
 * /group/pin-message:
 *   post:
 *     summary: Pin or unpin a message in a group chat
 *     description: Allows the group admin to pin or unpin a message.
 *     tags:
 *       - Group
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - groupId
 *               - adminId
 *               - messageId
 *               - action
 *             properties:
 *               groupId:
 *                 type: string
 *               adminId:
 *                 type: string
 *               messageId:
 *                 type: string
 *               action:
 *                 type: string
 *                 enum: [pin, unpin]
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
 *         description: Message pinned/unpinned successfully.
 *       403:
 *         description: Only admin can pin/unpin messages.
 *       500:
 *         description: Server error.
 */
router.post('/pin-message', authMiddleware, safeHandler('pinGroupMessage'));

/**
 * @swagger
 * /group/save-message:
 *   post:
 *     summary: Save a message in a group chat
 *     description: Allows a user to save a message for later reference in a group chat.
 *     tags:
 *       - Group
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
 *               - groupId
 *               - messageId
 *             properties:
 *               userId:
 *                 type: string
 *               groupId:
 *                 type: string
 *               messageId:
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
 *         description: Message saved successfully.
 *       500:
 *         description: Server error.
 */
router.post('/save-message', authMiddleware, safeHandler('saveGroupMessage'));

/**
 * @swagger
 * /group/set-notification:
 *   post:
 *     summary: Set notification preference for a group
 *     description: Enable or disable notifications for a specific group.
 *     tags:
 *       - Group
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
 *               - groupId
 *               - enabled
 *             properties:
 *               userId:
 *                 type: string
 *               groupId:
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
router.post('/set-notification', authMiddleware, safeHandler('setGroupNotification'));

/**
 * @swagger
 * /group/get-notification:
 *   post:
 *     summary: Get notification preference for a group
 *     description: Returns whether notifications are enabled for a specific group.
 *     tags:
 *       - Group
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
 *               - groupId
 *             properties:
 *               userId:
 *                 type: string
 *               groupId:
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
router.post('/get-notification', authMiddleware, safeHandler('getGroupNotification'));

/**
 * @swagger
 * /group/shared-media:
 *   post:
 *     summary: Get all shared media in a group chat
 *     description: Returns all media messages shared in a group chat, including sender profile and time.
 *     tags:
 *       - Group
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - groupId
 *             properties:
 *               groupId:
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
router.post('/shared-media', authMiddleware, safeHandler('getGroupSharedMedia'));

/**
 * @swagger
 * /group/exit:
 *   post:
 *     summary: Exit a group chat
 *     description: Allows a user to leave a group chat.
 *     tags:
 *       - Group
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
 *               - groupId
 *             properties:
 *               userId:
 *                 type: string
 *               groupId:
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
 *         description: User exited group successfully.
 *       500:
 *         description: Server error.
 */
router.post('/exit', authMiddleware, safeHandler('exitGroup'));

/**
 * @swagger
 * /group/set-group-pin:
 *   post:
 *     summary: Set a PIN for a group chat
 *     description: Sets a 4-digit PIN for a group chat for the user.
 *     tags:
 *       - Group
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
 *               - groupId
 *               - pin
 *             properties:
 *               userId:
 *                 type: string
 *               groupId:
 *                 type: string
 *               pin:
 *                 type: string
 *                 description: A 4-digit PIN.
 *               oldPin:
 *                 type: string
 *                 description: Old PIN if changing.
 *               email:
 *                 type: string
 *                 format: email
 *               token:
 *                 type: string
 *                 description: JWT token for authentication
 *     responses:
 *       200:
 *         description: Group chat PIN set/changed successfully.
 *       400:
 *         description: Invalid PIN format or old PIN incorrect.
 *       500:
 *         description: Server error.
 */
router.post('/set-group-pin', authMiddleware, safeHandler('setGroupPin'));

/**
 * @swagger
 * /group/verify-group-pin:
 *   post:
 *     summary: Verify the PIN for a group chat
 *     description: Verifies the PIN entered for a group chat.
 *     tags:
 *       - Group
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
 *               - groupId
 *               - pin
 *             properties:
 *               userId:
 *                 type: string
 *               groupId:
 *                 type: string
 *               pin:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               token:
 *                 type: string
 *                 description: JWT token for authentication
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
 *         description: No PIN set for this group chat.
 *       500:
 *         description: Server error.
 */
router.post('/verify-group-pin', authMiddleware, safeHandler('verifyGroupPin'));

/**
 * @swagger
 * /group/get-group-auto-delete-setting:
 *   post:
 *     summary: Get auto-delete setting for a group chat
 *     description: Returns the auto-delete time (in minutes) for a group chat.
 *     tags:
 *       - Group
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - groupId
 *             properties:
 *               groupId:
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
 *         description: Group not found.
 *       500:
 *         description: Server error.
 */
router.post('/get-group-auto-delete-setting', authMiddleware, safeHandler('getGroupAutoDeleteSetting'));

/**
 * @swagger
 * /group/set-group-auto-delete-setting:
 *   post:
 *     summary: Set auto-delete setting for a group chat
 *     description: Sets the auto-delete time (in minutes) for a group chat.
 *     tags:
 *       - Group
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - groupId
 *               - autoDeleteTime
 *             properties:
 *               groupId:
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
router.post('/set-group-auto-delete-setting', authMiddleware, safeHandler('setGroupAutoDeleteSetting'));

/**
 * @swagger
 * /group/list-group-saved-messages:
 *   post:
 *     summary: List all saved messages for a user in group chats
 *     description: Returns all group chat messages saved by the user.
 *     tags:
 *       - Group
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
 *         description: List of saved group messages.
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
 *                       groupId:
 *                         type: string
 *       404:
 *         description: User not found.
 *       500:
 *         description: Server error.
 */
router.post('/list-group-saved-messages', authMiddleware, safeHandler('listGroupSavedMessages'));

/**
 * @swagger
 * /group/delete-group-saved-message:
 *   post:
 *     summary: Delete a saved group message for a user
 *     description: Deletes a specific saved group message for the user.
 *     tags:
 *       - Group
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
 *               - groupId
 *             properties:
 *               userId:
 *                 type: string
 *               messageId:
 *                 type: string
 *               groupId:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               token:
 *                 type: string
 *                 description: JWT token for authentication
 *     responses:
 *       200:
 *         description: Saved group message deleted.
 *       500:
 *         description: Server error.
 */
router.post('/delete-group-saved-message', authMiddleware, safeHandler('deleteGroupSavedMessage'));

/**
 * @swagger
 * /group/list-blocked-users:
 *   post:
 *     summary: List all blocked users for a user (group context)
 *     description: Returns all users blocked by the user (for group chats).
 *     tags:
 *       - Group
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
router.post('/list-blocked-users', authMiddleware, safeHandler('listBlockedUsers'));

/**
 * @swagger
 * /group/list-restricted-users:
 *   post:
 *     summary: List all restricted users for a user (group context)
 *     description: Returns all users restricted by the user (for group chats).
 *     tags:
 *       - Group
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
router.post('/list-restricted-users', authMiddleware, safeHandler('listRestrictedUsers'));

module.exports = router;
