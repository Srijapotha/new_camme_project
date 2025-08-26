const express = require('express');
const {registerUser, getReferralStats, getAppDownloadReferralLink} = require('../controllers/referralController');
const router = express.Router();
const {authMiddleware} = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Referral
 *   description: User registration and referral system
 */

/**
 * @swagger
 * /api/referral/referral-stats:
 *   post:
 *     summary: Get referral statistics for a user
 *     description: Retrieves referral stats including points, referral link, and coin wallet.
 *     tags:
 *       - Referral
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
 *               token:
 *                 type: string
 *                 description: JWT token for authentication
 *               userId:
 *                 type: string
 *                 description: The ID of the user.
 *     responses:
 *       200:
 *         description: Referral statistics retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 referralId:
 *                   type: string
 *                 referralLink:
 *                   type: string
 *                 scorePoints:
 *                   type: integer
 *                 coins:
 *                   type: object
 *                 totalReferred:
 *                   type: integer
 *       500:
 *         description: Server error.
 */
router.post('/referral-stats', authMiddleware, getReferralStats);

/**
 * @swagger
 * /api/referral/app-download-link:
 *   post:
 *     summary: Get app download URL with referral code
 *     description: Returns a shareable app download URL containing the user's referral code.
 *     tags:
 *       - Referral
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
 *               token:
 *                 type: string
 *                 description: JWT token for authentication
 *               userId:
 *                 type: string
 *                 description: The ID of the user.
 *     responses:
 *       200:
 *         description: App download referral link generated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 downloadUrl:
 *                   type: string
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error.
 */
router.post('/app-download-link', authMiddleware, getAppDownloadReferralLink);

module.exports = router;
