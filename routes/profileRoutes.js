const express = require('express');
const {
  getProfile,
  updateProfile,
  startPersonalInfoUpdate,
  verifyPersonalInfoOtp,
  updateInterests,
  updateSocialAccounts,
  getInfluencerReport,
  clearSocialMedia // <-- import the new controller
} = require('../controllers/profileController');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: User profile management including personal info, social accounts, and interests
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UserProfile:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         fullName:
 *           type: string
 *         userName:
 *           type: string
 *         about:
 *           type: string
 *         theme:
 *           type: string
 *         profilePic:
 *           type: string
 *         phoneNo:
 *           type: string
 *         dateBirth:
 *           type: string
 *           format: date
 *         gender:
 *           type: string
 *         hidePersonalInfo:
 *           type: boolean
 *         interests:
 *           type: array
 *           items:
 *             type: string
 *         hashtags:
 *           type: array
 *           items:
 *             type: string
 *         social:
 *           type: object
 *         points:
 *           type: integer
 *         coinWallet:
 *           type: object
 *           properties:
 *             tedGold:
 *               type: integer
 *             tedSilver:
 *               type: integer
 *             tedBronze:
 *               type: integer
 *     SocialAccount:
 *       type: object
 *       properties:
 *         platform:
 *           type: string
 *           enum: [youtube, snapchat, x, twitter, instagram, facebook, threads, linkedin, pinterest]
 *         accountEmail:
 *           type: string
 *           format: email
 *         accountPhone:
 *           type: string
 *         followersCount:
 *           type: integer
 *           minimum: 0
 *         action:
 *           type: string
 *           enum: [link, unlink]
 *         url:
 *           type: string
 *           format: uri
 *     InterestItem:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           enum: [interest, hashtag]
 *         value:
 *           type: string
 */

/**
 * @swagger
 * /profile/get-profile:
 *   post:
 *     summary: Get user profile by ID
 *     description: Retrieves complete user profile information including personal details, interests, and social accounts.
 *     tags:
 *       - Profile
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
 *               - email
 *               - token
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email for verification
 *               token:
 *                 type: string
 *                 description: JWT token for authentication
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   $ref: '#/components/schemas/UserProfile'
 *       400:
 *         description: Missing required fields
 *       403:
 *         description: Email does not match user
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post('/get-profile', authMiddleware, getProfile);

/**
 * @swagger
 * /profile/update-profile:
 *   post:
 *     summary: Update general profile information
 *     description: Updates basic profile information including theme, profile picture, full name, username, and about section.
 *     tags:
 *       - Profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - email
 *               - token
 *             properties:
 *               userId:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               token:
 *                 type: string
 *               fullName:
 *                 type: string
 *               userName:
 *                 type: string
 *               about:
 *                 type: string
 *               theme:
 *                 type: string
 *               profilePic:
 *                 type: string
 *                 format: binary
 *                 description: Profile picture file upload
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/UserProfile'
 *       400:
 *         description: Missing required fields
 *       403:
 *         description: Email does not match user
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post('/update-profile', authMiddleware, upload.single('profilePic'), updateProfile);

/**
 * @swagger
 * /profile/start-personal-info-update:
 *   post:
 *     summary: Start personal information update process
 *     description: Initiates the process to update sensitive personal information. Sends OTP if email or phone number is being changed.
 *     tags:
 *       - Profile
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
 *               - email
 *               - token
 *             properties:
 *               userId:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Current user email for verification
 *               token:
 *                 type: string
 *               phoneNo:
 *                 type: string
 *                 description: New phone number (if changing)
 *               dateBirth:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *               hidePersonalInfo:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Pending changes saved, OTP sent if required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Missing required fields
 *       403:
 *         description: Email does not match user
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post('/start-personal-info-update', authMiddleware, startPersonalInfoUpdate);

/**
 * @swagger
 * /profile/verify-personal-info-otp:
 *   post:
 *     summary: Verify OTP and apply personal information updates
 *     description: Verifies the OTP sent during personal info update and applies the pending changes.
 *     tags:
 *       - Profile
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
 *               - email
 *               - token
 *               - otp
 *             properties:
 *               userId:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               token:
 *                 type: string
 *               otp:
 *                 type: string
 *                 description: 4-digit OTP received via email
 *     responses:
 *       200:
 *         description: Personal information updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/UserProfile'
 *       400:
 *         description: Missing required fields or invalid/expired OTP
 *       403:
 *         description: Email does not match user
 *       404:
 *         description: No pending update found
 *       500:
 *         description: Server error
 */
router.post('/verify-personal-info-otp', authMiddleware, verifyPersonalInfoOtp);

/**
 * @swagger
 * /profile/update-interests:
 *   post:
 *     summary: Update user interests and hashtags
 *     description: Manage user interests and hashtags with replace, add, or remove operations.
 *     tags:
 *       - Profile
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
 *               - email
 *               - token
 *             properties:
 *               userId:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               token:
 *                 type: string
 *               action:
 *                 type: string
 *                 enum: [replace, add, remove]
 *                 description: Action to perform
 *               interests:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Complete list of interests (used with replace action)
 *               hashtags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Complete list of hashtags (used with replace action)
 *               item:
 *                 $ref: '#/components/schemas/InterestItem'
 *                 description: Single item to add/remove
 *     responses:
 *       200:
 *         description: Interests updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 interests:
 *                   type: array
 *                   items:
 *                     type: string
 *                 hashtags:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Missing required fields
 *       403:
 *         description: Email does not match user
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post('/update-interests', authMiddleware, updateInterests);

/**
 * @swagger
 * /profile/update-social-accounts:
 *   post:
 *     summary: Link or unlink social media accounts
 *     description: Manage social media account connections with follower verification and tier calculations. Accepts a socialLinks array of objects with platform and url.
 *     tags:
 *       - Profile
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
 *               - email
 *               - token
 *               - socialLinks
 *             properties:
 *               userId:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               token:
 *                 type: string
 *               socialLinks:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     platform:
 *                       type: string
 *                       description: Platform name (e.g., youtube, instagram)
 *                     url:
 *                       type: string
 *                       format: uri
 *                       description: Profile URL on the platform
 *                 description: Array of objects with platform and url
 *               hideSocial:
 *                 type: boolean
 *                 description: Whether to hide social accounts from public view
 *     responses:
 *       200:
 *         description: Social accounts processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       success:
 *                         type: boolean
 *                       platform:
 *                         type: string
 *                       linked:
 *                         type: boolean
 *                       followers:
 *                         type: integer
 *                       tier:
 *                         type: string
 *                       message:
 *                         type: string
 *                 social:
 *                   type: object
 *                 points:
 *                   type: integer
 *                 coinWallet:
 *                   type: object
 *       400:
 *         description: Missing required fields or validation error
 *       403:
 *         description: Email does not match user
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post('/update-social-accounts', authMiddleware, updateSocialAccounts);

/**
 * @swagger
 * /profile/influencer-report:
 *   post:
 *     summary: Get influencer analytics report
 *     description: Retrieves comprehensive influencer statistics including platform-wise follower counts, tiers, total followers, points, and coin wallet.
 *     tags:
 *       - Profile
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
 *               - email
 *               - token
 *             properties:
 *               userId:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Influencer report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 report:
 *                   type: object
 *                   additionalProperties:
 *                     type: object
 *                     properties:
 *                       linked:
 *                         type: boolean
 *                       url:
 *                         type: string
 *                       followers:
 *                         type: integer
 *                       tier:
 *                         type: string
 *                 totalFollowers:
 *                   type: integer
 *                   description: Sum of followers across all platforms
 *                 points:
 *                   type: integer
 *                   description: Total points earned
 *                 coinWallet:
 *                   type: object
 *                   properties:
 *                     tedGold:
 *                       type: integer
 *                     tedSilver:
 *                       type: integer
 *                     tedBronze:
 *                       type: integer
 *       400:
 *         description: Missing required fields
 *       403:
 *         description: Email does not match user
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post('/influencer-report', authMiddleware, getInfluencerReport);

/**
 * @swagger
 * /profile/clear-social-media:
 *   post:
 *     summary: Clear all linked social media accounts for a user
 *     description: Removes all entries from the user's socialMedia array.
 *     tags:
 *       - Profile
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
 *               - email
 *               - token
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email for verification
 *               token:
 *                 type: string
 *                 description: JWT token for authentication
 *     responses:
 *       200:
 *         description: socialMedia cleared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/UserProfile'
 *       400:
 *         description: Missing required fields
 *       403:
 *         description: Email does not match user
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
// Route to clear socialMedia array for a user, with verification
router.post('/clear-social-media', authMiddleware, clearSocialMedia);

module.exports = router;