const express = require('express');
const {registerUser, getReferralStats} = require('../controllers/referralController');
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
 * /api/referral/register:
 *   post:
 *     summary: Register a new user with an optional referral ID
 *     description: Registers a user and optionally links them to a referrer for rewards.
 *     tags:
 *       - Referral
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               referredBy:
 *                 type: string
 *                 description: The referral ID of the person who referred this user.
 *     responses:
 *       200:
 *         description: User registered successfully, and referral rewards distributed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 referralLink:
 *                   type: string
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error.
 */
router.post('/register', authMiddleware, registerUser);

/**
 * @swagger
 * /api/referral/referral-stats/{userId}:
 *   get:
 *     summary: Get referral statistics for a user
 *     description: Retrieves referral stats including points, referral link, and coin wallet.
 *     tags:
 *       - Referral
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user.
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
 *                 points:
 *                   type: integer
 *                 coinWallet:
 *                   type: object
 *                   properties:
 *                     tedGold:
 *                       type: integer
 *                     tedSilver:
 *                       type: integer
 *                     tedBronze:
 *                       type: integer
 *                     tedBlack:
 *                       type: integer
 *                 totalReferred:
 *                   type: integer
 *       500:
 *         description: Server error.
 */
router.get('/referral-stats/:userId', authMiddleware, getReferralStats);

module.exports = router;
