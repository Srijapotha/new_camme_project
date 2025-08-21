const express = require('express');
const {createGroup, addMember, removeMember, getMyGroups} = require('../controllers/groupController');
const router = express.Router();
const {authMiddleware} = require('../middleware/authMiddleware');

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
router.post('/create-group', authMiddleware, createGroup);

/**
 * @swagger
 * /group/add-member:
 *   post:
 *     summary: Add a new member to a group chat
 *     description: Allows the group admin to add a new member to the group.
 *     tags:
 *       - Group
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
router.post('/add-member', authMiddleware, addMember);

/**
 * @swagger
 * /group/remove-member:
 *   post:
 *     summary: Remove a member from a group chat
 *     description: Allows the group admin to remove a member from the group.
 *     tags:
 *       - Group
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
router.post('/remove-member', authMiddleware, removeMember);

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
router.post('/my-groups', authMiddleware, getMyGroups);

module.exports = router;
