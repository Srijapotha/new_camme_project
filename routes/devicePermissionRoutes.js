const express = require('express');
const router = express.Router();
const {
  upsertPermissions,
  getPermissions,
  updatePermission
} = require('../controllers/devicePermissionController');
const { authMiddleware } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: DevicePermissions
 *   description: Manage device permissions for the current user
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     DevicePermission:
 *       type: object
 *       properties:
 *         camera:
 *           type: boolean
 *         microphone:
 *           type: boolean
 *         location:
 *           type: boolean
 *       example:
 *         camera: true
 *         microphone: false
 *         location: true
 *     UpsertPermissionsRequest:
 *       type: object
 *       required:
 *         - email
 *         - token
 *         - permissions
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User email for authentication
 *         token:
 *           type: string
 *           description: JWT token for authentication
 *         permissions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/DevicePermission'
 *           description: Array of device permissions to upsert
 *     UpdatePermissionRequest:
 *       type: object
 *       required:
 *         - email
 *         - token
 *         - field
 *         - value
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User email for authentication
 *         token:
 *           type: string
 *           description: JWT token for authentication
 *         field:
 *           type: string
 *           description: The permission field to update (e.g., "camera")
 *           example: camera
 *         value:
 *           type: boolean
 *           description: New value for the permission field
 *           example: true
 *     GetPermissionsRequest:
 *       type: object
 *       required:
 *         - email
 *         - token
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         token:
 *           type: string
 *           description: JWT token for authentication
 */

/**
 * @swagger
 * /device-permissions:
 *   post:
 *     summary: Create or update (bulk) device permissions for the current user
 *     tags:
 *       - DevicePermissions
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Permissions to upsert with auth info
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpsertPermissionsRequest'
 *     responses:
 *       200:
 *         description: Permissions upserted successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /device-permissions/get:
 *   post:
 *     summary: Get current user's device permissions (replaces GET)
 *     tags:
 *       - DevicePermissions
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Email and token required to fetch permissions
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GetPermissionsRequest'
 *     responses:
 *       200:
 *         description: Current user's permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DevicePermission'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /device-permissions:
 *   patch:
 *     summary: Update a single device permission field for the current user
 *     tags:
 *       - DevicePermissions
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Field and value to update with auth info
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePermissionRequest'
 *     responses:
 *       200:
 *         description: Permission updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */

// POST - bulk upsert device permissions
router.post('/', authMiddleware, upsertPermissions);

// POST - get current user's permissions (replacing GET)
router.post('/get', authMiddleware, getPermissions);

// PATCH - update a single permission field
router.patch('/', authMiddleware, updatePermission);

module.exports = router;
