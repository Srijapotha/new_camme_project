const express = require('express');
const {
  register,
  otpVerify,
  ProfileCreation,
  login,
  loginOtpverify,
  connectionFilter,
  getConnectionFilter,
  PasswordResetRequest,
  resetPassword,
  addAccount,
  approveLinkAccount,
  finalizeLinkAccount,
  rejectLinkAccount,
  logoutUser,
  getMatchedIntrested,
  getHashTagContent,
  getAllowLocation,
  sendFriendRequest,
  acceptFriendRequest,
  createPost,
  giveTedBlackCoinToPost,
  report,
  createMoment,
  generateAndTrackShare,
  getAllFriends,
  sharePostWithFriend,
  getAllPosts,
  giveTedGoldToPost,
  giveTedSilverPost,
  giveTedBronzePost,
  giveTedBlackCoin,
  resendOtp,
  viewAMoment,
  getYourMoment,
  getAllMoments,
  authorizedUserMomentsViewersCount,
  authorizedUserMomentsViewers,
  deleteMoment,
  giveCommentToAnMomemt,
  replyToMomontComment,
  getAllCommentsWithReplies,
  getAllPost,
  getSinglePost,
  getAuthorizedUserPost,
  giveCommentToPost,
  getAuthorizedUserPhotoGraphy,
  voteTedBlackCoin,
  sendNoti,
  handleTedBlackCoinVote,
  getBlackCoinReactionsToMyPosts,
  getBlackCoinReactionsByMe,
  count,
  getNotiFicationsOnBasisUserId,
  requested,
  requestedme,
  IrequEst,
  rejectFriendRequest,
  unFriend,
  makeAfriend,
  getAll_Matches_OnBasisOf_Intrest_HashTag_Location,
  getProfileBasedOnUserId,
  TEST,
  cancleMyRequest,
  fetchAllRecentUserAllFriends,
  fetchAllRecentCancleRequest,
  deleteAPost,
  fetchProfileLocations,
  apporachModeToAUser,
  handelApporachVote,
  sendReqinApporach,
  acceptReqApporach,
  rejectReqApporach,
  ReqApporachShow,
  fetchFriendsApporachController,
  apporachModeProtectorOn,
  sendLiveLocationWithInyourFriends,
  fetchMapSetting,
  sendMessage,
  getMessages,
  FetchPhotoGraphyForHome,
  friendsInMessingIfOnline,
  markMsgAsRead,
  getShareablePostUrl,
  toggleSavePost,
  getAllPendingBlackCoins,
  approveOrRejectBlackCoin,
  giveReplayToCommentPost,
  getAllCommentsAndReplies,
  getSavedItems,
  toggleSaveItem,
  getProfileVisitors,
  getProfile,
  updateAutoDeleteChat,
  getAutoDeleteChat,
  updateHideMutualFriends,
  getHideMutualFriends
} = require("../controllers/userAuthController")
const { authMiddleware } = require('../middleware/authMiddleware');
const { uploadd } = require("../middleware/multer");
const checkBlacklist = require('../middleware/BlackListToken');
const { upload } = require("../config/cloudinary");
const { addComment, addReply, getComments, likeComment } = require('../controllers/commentController');
const {getInstagramQrCode} = require('../controllers/qrController');

const router = express.Router();
/**
 * @swagger
 * /user/register:
 *   post:
 *     summary: Register a new user with profile and theme image upload.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - gender
 *               - dateBirth
 *               - fullName
 *               - email
 *               - phoneNo
 *             properties:
 *               gender:
 *                 type: string
 *               dateBirth:
 *                 type: string
 *                 format: date
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phoneNo:
 *                 type: string
 *               profilePic:
 *                 type: string
 *                 format: binary
 *               theme:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: User registered, OTP sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 */
router.post('/register', upload.fields([
  { name: 'profilePic', maxCount: 1 },
  { name: 'theme', maxCount: 1 },
]), register)
/**
 * @swagger
 * /user/verifyotp:
 *   post:
 *     summary: Verify OTP and activate user account
 *     description: Verifies the OTP sent to the user's email and activates the account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               otp:
 *                 type: string
 *                 example: 1234
 *     responses:
 *       200:
 *         description: OTP verified. Account Activated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucess:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: OTP verified. Account Activated
 *                 user:
 *                   type: object
 *                   description: The verified user object
 *       400:
 *         description: Invalid or expired OTP / missing fields
 *       500:
 *         description: Internal server error
 */
router.post("/verifyotp", otpVerify);

/**
 * @swagger
 * /user/profileComplite:
 *   post:
 *     summary: Complete user profile by setting username and password
 *     description: After OTP verification, user sets their username and password to complete the profile
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - userName
 *               - confirmPassword
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 example: MySecurePass123
 *               userName:
 *                 type: string
 *                 example: johnny98
 *     responses:
 *       200:
 *         description: Profile completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucess:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Missing fields or user not found
 *       500:
 *         description: Internal server error
 */
router.post("/profileComplite", ProfileCreation);
/**
 * @swagger
 * /user/connectionFilter:
 *   post:
 *     summary: Create or update a user's connection filter.
 *     tags:
 *       - Connection Filter
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 description: User's email address.
 *                 example: "example@gmail.com"
 *               intrest:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of hashtags to be added.
 *                 example: ["AI", "Startups"]
 *               hashTag:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of hashtags to be added.
 *                 example: ["#AI", "#Startups"]
 *               lattitude:
 *                 type: number
 *                 description: User's current latitude.
 *                 example: 22.5726
 *               longitude:
 *                 type: number
 *                 description: User's current longitude.
 *                 example: 88.3639
 *     responses:
 *       200:
 *         description: Connection filter saved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Connection filter saved successfully
 *                 connection:
 *                   $ref: '#/components/schemas/ConnectionFilter'
 *       400:
 *         description: Missing required fields like email.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Server error.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ConnectionFilter:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "6639c9b9fcb8a0b93f3f6a45"
 *         userId:
 *           type: string
 *           description: User's MongoDB ID
 *           example: "6629aab5df1e8f1234567890"
 *         intrestedFiled:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Technology", "AI", "Music"]
 *         hashTag:
 *           type: array
 *           items:
 *             type: string
 *           example: ["#AI", "#Startups"]
 *         location:
 *           type: object
 *           properties:
 *             lattitude:
 *               type: number
 *               example: 22.5726
 *             longitude:
 *               type: number
 *               example: 88.3639
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-05-07T10:15:30Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-05-07T11:20:45Z"
 */

router.post("/connectionFilter", connectionFilter);
/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: User login with OTP verification
 *     description: Logs in a user by verifying credentials and sends OTP via email and SMS for further verification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - userName
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 example: MySecurePass123
 *               userName:
 *                 type: string
 *                 example: johnny98
 *     responses:
 *       200:
 *         description: OTP sent to user via email and phone
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucess:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: OTP sent to your email and phone number
 *       400:
 *         description: Invalid credentials or unverified email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucess:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Please provide all details
 *       500:
 *         description: Internal server error
 */
router.post("/login", login);
/**
 * @swagger
 * /user/loginOtpverify:
 *   post:
 *     summary: Verify OTP for login
 *     description: Verifies the OTP sent to the user's email and returns a JWT token if successful.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *               - fcmToken
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               otp:
 *                 type: string
 *                 example: "123456"
 *               fcmToken:
 *                 type: string
 *                 example: "fcm_token_here"
 *     responses:
 *       200:
 *         description: OTP verification result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucess:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Login Otp Verify"
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d3b41abdacab002f3c6b80"
 *                     email:
 *                       type: string
 *                       example: "user@example.com"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     fcmToken:
 *                       type: string
 *                       example: "fcm_token_here"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       500:
 *         description: Internal server error during OTP verification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucess:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "error in loginverifyOtp controller"
 */
router.post("/loginOtpverify", loginOtpverify);

/**
 * @swagger
 * /user/getConnectionFilter:
 *   get:
 *     summary: Retrieve a user's connection filter settings
 *     description: Fetches the stored connection filter (interests, hashtags, tags, and locations) for a given user.
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: User's email address
 *         example: johndoe@example.com
 *     responses:
 *       200:
 *         description: Connection filter retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   example:
 *                     userId: 609e125a5d1f4a1d3cfa7e3d
 *                     intrestedFiled: [{ intrested: "Technology" }]
 *                     hashTagFiled: [{ hashTag: "#AI", tag: "artificial-intelligence" }]
 *                     locationFiled: [{ location: "New York" }]
 *       400:
 *         description: Email not provided
 *       404:
 *         description: User or connection filter not found
 *       500:
 *         description: Server error in getConnectionFilter controller
 */
router.get("/getConnectionFilter", getConnectionFilter);
/**
 * @swagger
 * /user/forgetPassword:
 *   post:
 *     summary: Request password reset
 *     description: Sends an OTP and a reset link to the user's email if the user exists.
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: OTP and reset link sent to email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucess:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 */

router.post("/forgetPassword", PasswordResetRequest);
/**
 * @swagger
 * /user/reset-password:
 *   post:
 *     summary: Reset user password
 *     description: Resets the user's password using a valid OTP sent to their email.
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               otp:
 *                 type: integer
 *                 example: 123456
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: newSecurePassword123
 *     responses:
 *       200:
 *         description: Password reset successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid OTP or expired
 *       500:
 *         description: Server error
 */
router.post("/reset-password", resetPassword);
/**
 * @swagger
 * /user/addAccount:
 *   post:
 *     summary: Request to link a secondary account to the main account
 *     description: Authenticated users can send a request to link another user account by verifying the secondary account's password. An email and SMS will be sent to the secondary account for approval.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userName
 *               - email
 *               - phoneNo
 *               - password
 *             properties:
 *               userName:
 *                 type: string
 *                 example: secondaryUser
 *               email:
 *                 type: string
 *                 example: secondary@example.com
 *               phoneNo:
 *                 type: string
 *                 example: "+1234567890"
 *               password:
 *                 type: string
 *                 example: SecondaryPass123!
 *     responses:
 *       200:
 *         description: Approval email and SMS sent to secondary account
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Approval email & SMS sent to secondary user.
 *                 secondaryAccount:
 *                   type: object
 *                   description: The secondary user account details
 *                 main:
 *                   type: object
 *                   description: The main user account details
 *       400:
 *         description: Invalid request (e.g., trying to link own account or duplicate request)
 *       401:
 *         description: Invalid password for the secondary account
 *       404:
 *         description: Secondary account not found
 *       500:
 *         description: Error in addAccount controller
 */
router.post("/addAccount", authMiddleware, addAccount)
router.get("/account-link/approve/:userId/:requesterId", approveLinkAccount);
router.post("/account-link/verify-otp", finalizeLinkAccount);
router.post("/account-link/reject/:userId/:requesterId", rejectLinkAccount);
/**
 * @swagger
 * /user/logout:
 *   post:
 *     summary: Logout a user
 *     description: Logs out a user by blacklisting their token and updating their session data.
 *     tags:
 *       - Auth
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
 *                 example: user@example.com
 *               token:
 *                 type: string
 *                 description: JWT token provided by the user
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6...
 *     responses:
 *       200:
 *         description: Successful logout
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User logged out successfully.
 *       400:
 *         description: Missing email or token
 *       403:
 *         description: Token or email mismatch
 *       500:
 *         description: Internal server error
 */
router.post("/logout",checkBlacklist,authMiddleware, logoutUser);
/**
 * @swagger
 * /user/getMatchIntrested:
 *   post:
 *     summary: Get matched users based on interest fields
 *     description: Retrieves users whose interest fields match those of the authenticated user, excluding the user themselves.
 *     tags:
 *       - Matching
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Bearer token for verification
 *               email:
 *                 type: string
 *                 description: Email of the authenticated user
 *             required:
 *               - token
 *               - email
 *     responses:
 *       200:
 *         description: Success response with matched users or appropriate message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 userInterestedFields:
 *                   type: array
 *                   items:
 *                     type: string
 *                 matchedUsers:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       403:
 *         description: Provided token does not match authorized token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post("/getMatchIntrested",authMiddleware, getMatchedIntrested);
/**
 * @swagger
 * /user/getHashTagContent:
 *   post:
 *     summary: Get users with matching hashtags
 *     description: Retrieves other users whose hashtag filters match any of the authenticated user's hashtags, excluding the user themselves.
 *     tags:
 *       - Hashtag Matching
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Bearer token for verification
 *               email:
 *                 type: string
 *                 description: Email of the authenticated user
 *             required:
 *               - token
 *               - email
 *     responses:
 *       200:
 *         description: Success response with matched hashtag users or appropriate message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 tags:
 *                   type: array
 *                   items:
 *                     type: string
 *                 matchedTags:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserFilter'
 *       403:
 *         description: Provided token does not match authorized token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post("/getHashTagContent",authMiddleware, getHashTagContent);
/**
 * @swagger
 * /user/getLocation:
 *   post:
 *     summary: Get all users with the same location as the logged-in user (excluding the current user)
 *     tags:
 *       - Location
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example: {}
 *     responses:
 *       200:
 *         description: List of users matching the logged-in user's location
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 matchedFilters:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userId:
 *                         type: object
 *                         description: Populated user object
 *                       location:
 *                         type: object
 *                         properties:
 *                           lattitude:
 *                             type: number
 *                           longitude:
 *                             type: number
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       500:
 *         description: Server error in getAllowLocation
 */
router.post("/getLocation",authMiddleware, getAllowLocation);
/**
 * @swagger
 * /user/getAll_Matches_OnBasisOf_Intrest_HashTag_Location:
 *   post:
 *     summary: Get matched users based on Interests, Hashtags, and Location
 *     tags:
 *       - Match
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: your-jwt-token
 *               email:
 *                 type: string
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Successfully fetched matched users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 filtersUsed:
 *                   type: object
 *                   properties:
 *                     intrestedFiled:
 *                       type: array
 *                       items:
 *                         type: string
 *                     hashTag:
 *                       type: array
 *                       items:
 *                         type: string
 *                     location:
 *                       type: object
 *                       properties:
 *                         lattitude:
 *                           type: number
 *                         longitude:
 *                           type: number
 *                 matchedUsers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     description: Filtered user details populated from ConnectionFilter
 *       403:
 *         description: Unauthorized or token/email mismatch
 *       500:
 *         description: Server error occurred
 */
router.post("/getAll_Matches_OnBasisOf_Intrest_HashTag_Location",authMiddleware,getAll_Matches_OnBasisOf_Intrest_HashTag_Location)
/**
 * @swagger
 * /user/createpost:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []  # if you're using JWT auth
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - description
 *               - visibility
 *               - token
 *               - email
 *             properties:
 *               description:
 *                 type: string
 *               visibility:
 *                 type: boolean
 *                 example: true
 *               is_photography:
 *                 type: boolean
 *                 example: true
 *               token:
 *                 type: string
 *               email:
 *                 type: string
 *               hashTag:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["nature", "sunset"]
 *               appliedFilter:
 *                 type: string
 *                 example: grayscale
 *               filteredImageUrl:
 *                 type: string
 *               colorMatrix:
 *                 type: string
 *                 description: JSON stringified array of numbers. E.g. "[0.3, 0.6, 0.9]"
 *                 example: "[0.3, 0.6, 0.9]"
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Post created successfully
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Server Error
 */

router.post("/createpost", authMiddleware, upload.array("files", 10), createPost);
// /**
//  * @swagger
//  * /user/share/{postId}/{friendId}:
//  *   post:
//  *     summary: Share a post with a friend
//  *     tags:
//  *       - Posts
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: postId
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: ID of the original post to share
//  *       - in: path
//  *         name: friendId
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: ID of the friend to share the post with
//  *     responses:
//  *       200:
//  *         description: Post shared successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 success:
//  *                   type: boolean
//  *                   example: true
//  *                 message:
//  *                   type: string
//  *                   example: Post shared successfully your friend
//  *                 sharedPostId:
//  *                   type: string
//  *                   example: 6629a314d67d72a3a0989f4e
//  *                 originalPost:
//  *                   type: object
//  *                   description: Original post data
//  *       403:
//  *         description: Not a friend, sharing not allowed
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 success:
//  *                   type: boolean
//  *                   example: false
//  *                 message:
//  *                   type: string
//  *                   example: Not a friend, so post Not share
//  *       404:
//  *         description: Post not found
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 success:
//  *                   type: boolean
//  *                   example: false
//  *                 message:
//  *                   type: string
//  *                   example: Post not found
//  *       500:
//  *         description: Internal server error
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 success:
//  *                   type: boolean
//  *                   example: false
//  *                 message:
//  *                   type: string
//  *                   example: Internal Server Error
//  */
router.post('/share/:postId/:friendId', authMiddleware, sharePostWithFriend);
router.post("/reportPost/:postId", authMiddleware, report);
/**
 * @swagger
 * /user/moments:
 *   post:
 *     summary: Create a new moment (story-like content that expires in 24 hours)
 *     tags:
 *       - Moments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *               - descripition
 *               - token
 *               - email
 *             properties:
 *               image:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Upload one or more image files
 *               descripition:
 *                 type: string
 *                 description: Text description for the moment
 *               is_closeFriends:
 *                 type: boolean
 *                 description: Optional flag to show moment only to close friends
 *               token:
 *                 type: string
 *                 description: JWT token to validate against authorization header
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email to validate identity
 *     responses:
 *       201:
 *         description: Moment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Moment created successfully and will expire in 24 hours
 *                 moment:
 *                   $ref: '#/components/schemas/Moment'
 *       403:
 *         description: Token mismatch error
 *       200:
 *         description: Email mismatch or missing fields
 *       500:
 *         description: Server error while creating moment
 */


router.post("/moments", authMiddleware, upload.array('image', 10), createMoment);
/**
 * @swagger
 * /user/friends:
 *   get:
 *     summary: Get all friends of the authenticated user
 *     tags:
 *       - Friends
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of friends retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 friends:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "60f7ad94c2b6e4b55c1b4567"
 *                       fullName:
 *                         type: string
 *                         example: "John Doe"
 *                       userName:
 *                         type: string
 *                         example: "john_doe"
 *                       profilePic:
 *                         type: string
 *                         example: "https://cloudinary.com/images/user.png"
 *       401:
 *         description: Unauthorized - JWT token required
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

router.get('/friends', authMiddleware, getAllFriends);


/**
 * @swagger
 * /user/resendOtp:
 *   post:
 *     summary: Resend OTP to a user's email
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: OTP resent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucess:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Otp Resend SucessFully
 *       400:
 *         description: Email not provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucess:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: please provide email
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucess:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: User Not Found!
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucess:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: error in resend-Otp Controller
 */
router.post("/resendOtp", resendOtp)
/**
 * @swagger
 * /user/getYourMoment:
 *   post:
 *     summary: Get all moments created by the authenticated user
 *     tags:
 *       - Moments
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
 *                 example: user@example.com
 *               token:
 *                 type: string
 *                 description: The same JWT token sent in the Authorization header
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Successfully fetched user's own moments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucess:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Fetched your moments
 *                 yourMoment:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       userId:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           userName:
 *                             type: string
 *                           profilePic:
 *                             type: string
 *                       content:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       403:
 *         description: Token mismatch
 *       500:
 *         description: Server error
 */
router.post("/getYourMoment", authMiddleware, getYourMoment);
/**
 * @swagger
 * /user/getallmomets:
 *   post:
 *     summary: Get all moments with user information
 *     tags:
 *       - Moments
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
 *                 example: user@example.com
 *               token:
 *                 type: string
 *                 description: The same JWT token sent in the Authorization header
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Successfully fetched all moments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 allMoments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       userId:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           userName:
 *                             type: string
 *                           profilePic:
 *                             type: string
 *                       content:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       403:
 *         description: Token mismatch
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Provided token does not match authorized token
 *       500:
 *         description: Server error
 */
router.post("/getallmomets", authMiddleware, getAllMoments);
/**
 * @swagger
 * /user/viewMoment:
 *   post:
 *     summary: View a single moment by its ID and record viewer
 *     tags:
 *       - Moments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Provide email, token, userId of moment owner, and optional momentId to view a specific moment
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - token
 *               - userId
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email of the authenticated user (viewer)
 *               token:
 *                 type: string
 *                 description: JWT token for authorization
 *               userId:
 *                 type: string
 *                 description: ID of the moment owner
 *               momentId:
 *                 type: string
 *                 description: (Optional) ID of the specific moment to view
 *     responses:
 *       200:
 *         description: Moment fetched successfully or relevant failure message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 viewersCount:
 *                   type: integer
 *                   description: Number of viewers of the moment
 *                   nullable: true
 *                 viewers:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: List of user IDs who viewed the moment
 *                   nullable: true
 *                 moment:
 *                   type: object
 *                   description: The moment document details
 *                   nullable: true
 *       403:
 *         description: Token mismatch error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post("/viewMoment", authMiddleware, viewAMoment);
/**
 * @swagger
 * /user/authorizedUserMomentsViewersCount:
 *   post:
 *     summary: Get viewer counts for authorized user's moments
 *     tags:
 *       - Moments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Provide email, token, and optionally momentId to fetch viewer count for a specific moment or all moments
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
 *                 description: Email of the authorized user
 *               token:
 *                 type: string
 *                 description: JWT token for authorization
 *               momentId:
 *                 type: string
 *                 description: (Optional) Moment ID to get viewers count for a specific moment
 *     responses:
 *       200:
 *         description: Viewer count fetched successfully or relevant info message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 totalViewers:
 *                   type: integer
 *                   description: Total number of unique viewers
 *                   nullable: true
 *                 momentId:
 *                   type: string
 *                   description: Moment ID if queried specifically
 *                   nullable: true
 *                 momentsCount:
 *                   type: integer
 *                   description: Total number of moments for the authorized user (when no momentId provided)
 *                   nullable: true
 *       403:
 *         description: Token mismatch error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Moment not found or not owned by the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post("/authorizedUserMomentsViewersCount", authMiddleware, authorizedUserMomentsViewersCount);
/**
 * @swagger
 * /user/authorizedUserMomentsViewers:
 *   post:
 *     summary: Get unique viewers of authorized user's moments
 *     tags:
 *       - Moments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Provide email, token, and optionally momentId to fetch viewers for a specific moment or all moments
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
 *                 description: Email of the authorized user
 *               token:
 *                 type: string
 *                 description: JWT token for authorization
 *               momentId:
 *                 type: string
 *                 description: (Optional) Moment ID to get viewers for a specific moment
 *     responses:
 *       200:
 *         description: Viewers fetched successfully or relevant info message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 viewers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       userName:
 *                         type: string
 *                       profilePic:
 *                         type: string
 *                   description: List of unique viewers
 *                 momentId:
 *                   type: string
 *                   description: Moment ID if queried specifically
 *                   nullable: true
 *                 momentsCount:
 *                   type: integer
 *                   description: Total moments count (when no momentId provided)
 *                   nullable: true
 *       403:
 *         description: Token mismatch error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Moment not found or not owned by the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post("/authorizedUserMomentsViewers", authMiddleware, authorizedUserMomentsViewers);
/**
 * @swagger
 * /user/deleteMoment:
 *   delete:
 *     summary: Delete a specific moment owned by the authorized user
 *     description: >
 *       Deletes a moment if it belongs to the authorized user.
 *       Requires verification of the user's token and email.
 *     tags:
 *       - Moments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - momentId
 *               - email
 *               - token
 *             properties:
 *               momentId:
 *                 type: string
 *                 description: ID of the moment to be deleted
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *                 description: Email of the authorized user
 *               token:
 *                 type: string
 *                 example: your-auth-token
 *                 description: JWT token for authorization
 *     responses:
 *       200:
 *         description: Moment deletion result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Moment deleted successfully
 *       500:
 *         description: Server error during deletion
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Server error in deleteMoment
 */
router.delete("/deleteMoment", authMiddleware, deleteMoment)
/**
 * @swagger
 * /user/giveCommentToAnMomemt:
 *   post:
 *     summary: Add a comment to a specific moment
 *     description: |
 *       Allows an authorized user to add a comment to a moment.
 *       Requires valid token and email verification.
 *     tags:
 *       - Moments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - momentId
 *               - comment
 *               - email
 *               - token
 *             properties:
 *               momentId:
 *                 type: string
 *                 description: ID of the moment to comment on
 *               comment:
 *                 type: string
 *                 description: Comment text to add
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *                 description: Email of the authorized user
 *               token:
 *                 type: string
 *                 example: your-auth-token
 *                 description: JWT token for authorization
 *     responses:
 *       200:
 *         description: Comment added successfully or error message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Comment added successfully
 *                 comments:
 *                   type: array
 *                   description: Updated list of comments on the moment
 *                   items:
 *                     type: object
 *                     properties:
 *                       userId:
 *                         type: string
 *                         description: ID of the user who commented
 *                       comment:
 *                         type: string
 *                         description: Comment text
 *       500:
 *         description: Server error while adding comment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Server error in giveCommentToAMomemt
 */
router.post("/giveCommentToAnMomemt", authMiddleware, giveCommentToAnMomemt);
/**
 * @swagger
 * /user/replyToMomontComment:
 *   post:
 *     summary: Reply to a comment on a specific moment
 *     description: |
 *       Allows an authorized user to reply to a comment on a moment.
 *       Requires valid token and email verification.
 *     tags:
 *       - Moments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - momentId
 *               - commentId
 *               - reply
 *               - email
 *               - token
 *             properties:
 *               momentId:
 *                 type: string
 *                 description: ID of the moment containing the comment
 *               commentId:
 *                 type: string
 *                 description: ID of the comment to reply to
 *               reply:
 *                 type: string
 *                 description: Reply text to add
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *                 description: Email of the authorized user
 *               token:
 *                 type: string
 *                 example: your-auth-token
 *                 description: JWT token for authorization
 *     responses:
 *       200:
 *         description: Reply added successfully or error message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Reply added successfully.
 *                 updatedComment:
 *                   type: object
 *                   description: The updated comment with new replies
 *       500:
 *         description: Server error while adding reply
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Server error while replying to comment.
 */
router.post("/replyToMomontComment", authMiddleware, replyToMomontComment)
/**
 * @swagger
 * /user/getAllCommentsWithReplies:
 *   post:
 *     summary: Get all comments and their replies for a specific moment
 *     description: |
 *       Fetches all comments along with their replies for the given moment.
 *       Requires token and email verification for the authorized user.
 *     tags:
 *       - Moments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - momentId
 *               - email
 *               - token
 *             properties:
 *               momentId:
 *                 type: string
 *                 description: ID of the moment to fetch comments from
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *                 description: Email of the authorized user
 *               token:
 *                 type: string
 *                 example: your-auth-token
 *                 description: JWT token for authorization
 *     responses:
 *       200:
 *         description: Comments and replies fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Fetched all comments and replies for the moment
 *                 comments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     description: Comment object with replies and user info
 *       404:
 *         description: Moment not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Moment not found
 *       500:
 *         description: Server error while fetching comments and replies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Server error while fetching comments and replies
 */
router.post("/getAllCommentsWithReplies", authMiddleware, getAllCommentsWithReplies)
/**
 * @swagger
 * /user/getAllPost:
 *   post:
 *     summary: Get all posts with user and coin count data
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []  # Assumes JWT Bearer token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               token:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Returns all posts with coin count and user info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Fetched all posts
 *                 allPosts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 609c5ecf9d1d8b001fba14a7
 *                       description:
 *                         type: string
 *                       tedGoldCount:
 *                         type: integer
 *                         example: 3
 *                       tedSilverCount:
 *                         type: integer
 *                         example: 2
 *                       tedBronzeCount:
 *                         type: integer
 *                         example: 4
 *                       tedBlackCoinCount:
 *                         type: integer
 *                         example: 1
 *                       totalCoin:
 *                         type: integer
 *                         example: 425
 *                       userId:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           userName:
 *                             type: string
 *                           profilePic:
 *                             type: string
 *                           email:
 *                             type: string
 *                       comments:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             userId:
 *                               type: object
 *                               properties:
 *                                 _id:
 *                                   type: string
 *                                 userName:
 *                                   type: string
 *                                 profilePic:
 *                                   type: string
 *                                 email:
 *                                   type: string
 *                             comment:
 *                               type: string
 *       401:
 *         description: Unauthorized or token mismatch
 *       500:
 *         description: Server error
 */
router.post("/getAllPost", authMiddleware, getAllPost);
/**
 * @swagger
 * /user/getSinglePost:
 *   post:
 *     summary: Fetch a single post by postId after validating token and email
 *     tags:
 *       - Posts
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
 *               - postId
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               token:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *               postId:
 *                 type: string
 *                 example: 6644920a4ad4cc66aaae6131
 *     responses:
 *       200:
 *         description: Successfully fetched single post
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Fetched single post
 *                 post:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 6644920a4ad4cc66aaae6131
 *                     userId:
 *                       type: object
 *                       properties:
 *                         userName:
 *                           type: string
 *                           example: Chinmay
 *                         profilePic:
 *                           type: string
 *                           example: "https://example.com/profile.jpg"
 *                         email:
 *                           type: string
 *                           example: user@example.com
 *                     tedGoldCount:
 *                       type: integer
 *                       example: 2
 *                     tedSilverCount:
 *                       type: integer
 *                       example: 1
 *                     tedBronzeCount:
 *                       type: integer
 *                       example: 0
 *                     tedBlackCoinCount:
 *                       type: integer
 *                       example: 0
 *                     totalCoin:
 *                       type: integer
 *                       example: 200
 *       500:
 *         description: Server error while fetching single post
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Server error while fetching single post
 */
router.post("/getSinglePost", authMiddleware, getSinglePost)
/**
 * @swagger
 * /user/getAuthorizedUserPost:
 *   post:
 *     summary: Get all posts created by the authorized user
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []  # JWT token in Authorization header
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               token:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (optional if not using token verification)
 *     responses:
 *       200:
 *         description: Returns all posts made by the authorized user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Fetched all posts for the authorized user
 *                 userPosts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       description:
 *                         type: string
 *                       userId:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           userName:
 *                             type: string
 *                           profilePic:
 *                             type: string
 *                           email:
 *                             type: string
 *                       comments:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             userId:
 *                               type: object
 *                               properties:
 *                                 _id:
 *                                   type: string
 *                                 userName:
 *                                   type: string
 *                                 profilePic:
 *                                   type: string
 *                                 email:
 *                                   type: string
 *                             comment:
 *                               type: string
 *       401:
 *         description: Unauthorized or email mismatch
 *       500:
 *         description: Server error while fetching posts
 */
router.post("/getAuthorizedUserPost", authMiddleware, getAuthorizedUserPost);
/**
 * @swagger
 * /user/giveCommentToPost:
 *   post:
 *     summary: Add a comment to a post after verifying token and email
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Comment details with postId, email, and token
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - postId
 *               - comment
 *               - email
 *               - token
 *             properties:
 *               postId:
 *                 type: string
 *                 example: 6644920a4ad4cc66aaae6131
 *               comment:
 *                 type: string
 *                 example: This is a great post!
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               token:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Comment added successfully or validation error message
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *                     message:
 *                       type: string
 *                       example: Comment added successfully
 *                     comments:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           userId:
 *                             type: string
 *                             example: 6644920a4ad4cc66aaae6131
 *                           comment:
 *                             type: string
 *                             example: This is a great post!
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           profilePic:
 *                             type: string
 *                           userName:
 *                             type: string
 *                 - type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: false
 *                     message:
 *                       type: string
 *                       example: Provided token does not match authorized token
 *       500:
 *         description: Server error while adding comment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: server error while adding comment to post
 */
router.post("/giveCommentToPost", authMiddleware, giveCommentToPost);

/**
 * @swagger
 * /user/giveReplayToCommentPost:
 *   post:
 *     summary: Reply to a comment on a post after verifying token and email
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Reply details with postId, commentId, email, and token
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - postId
 *               - commentId
 *               - reply
 *               - email
 *               - token
 *             properties:
 *               postId:
 *                 type: string
 *                 example: 6644920a4ad4cc66aaae6131
 *               commentId:
 *                 type: string
 *                 example: 6644920a4ad4cc66aaae6132
 *               reply:
 *                 type: string
 *                 example: Thanks for your feedback!
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               token:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Reply added successfully or validation error message
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     sucess:
 *                       type: boolean
 *                       example: true
 *                     message:
 *                       type: string
 *                       example: Reply Give SucessFully to an Post
 *                 - type: object
 *                   properties:
 *                     sucess:
 *                       type: boolean
 *                       example: false
 *                     message:
 *                       type: string
 *                       example: Provided token does not match authorized token
 *       500:
 *         description: Server error while replying to comment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucess:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Server Error while Give ReplayTo an Posts
 */
router.post("/giveReplayToCommentPost", authMiddleware, giveReplayToCommentPost);

/**
 * @swagger
 * /user/getAllCommentsAndReplies:
 *   post:
 *     summary: Get all comments and replies for a post
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Post ID to fetch comments and replies
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - postId
 *             properties:
 *               postId:
 *                 type: string
 *                 example: 6644920a4ad4cc66aaae6131
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
 *         description: Comments and replies fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Comments and replies fetched successfully
 *                 comments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userId:
 *                         type: string
 *                       comment:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                       profilePic:
 *                         type: string
 *                       userName:
 *                         type: string
 *                       replies:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             userId:
 *                               type: string
 *                             reply:
 *                               type: string
 *                             createdAt:
 *                               type: string
 *                               format: date-time
 *                             profilePic:
 *                               type: string
 *                             userName:
 *                               type: string
 *       400:
 *         description: Missing postId
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router.post("/getAllCommentsAndReplies", authMiddleware, getAllCommentsAndReplies);

/**
 * @swagger
 * /user/giveTedGoldcoin:
 *   post:
 *     summary: Give a TedGold coin to a post after verifying token and email
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Details required to give TedGold coin to a post
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - postId
 *               - email
 *               - token
 *             properties:
 *               postId:
 *                 type: string
 *                 example: 6644920a4ad4cc66aaae6131
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               token:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: TedGold coin given successfully or validation errors
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *                     message:
 *                       type: string
 *                       example: TedGold given successfully
 *                     updatedTedGoldCount:
 *                       type: integer
 *                       example: 5
 *                     toUser:
 *                       type: string
 *                       example: 6644920a4ad4cc66aaae6131
 *                 - type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: false
 *                     message:
 *                       type: string
 *                       example: You have already given a coin to this post
 *       500:
 *         description: Internal server error while giving TedGold coin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Internal Server Error in giveTedGoldToPost
 */
router.post("/giveTedGoldcoin",authMiddleware, giveTedGoldToPost);
/**
 * @swagger
 * /user/giveTedSilvercoin:
 *   post:
 *     summary: Give a TedSilver coin to a post after verifying token and email
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Details required to give TedSilver coin to a post
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - postId
 *               - email
 *               - token
 *             properties:
 *               postId:
 *                 type: string
 *                 example: 6644920a4ad4cc66aaae6131
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               token:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: TedSilver coin given successfully or validation errors
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *                     message:
 *                       type: string
 *                       example: TedSilver given successfully
 *                     updatedTedSilverCount:
 *                       type: integer
 *                       example: 3
 *                     toUser:
 *                       type: string
 *                       example: 6644920a4ad4cc66aaae6131
 *                 - type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: false
 *                     message:
 *                       type: string
 *                       example: You have already given a coin to this post
 *       500:
 *         description: Internal server error while giving TedSilver coin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: error in giveTedSilverPost controller
 */
router.post("/giveTedSilvercoin", authMiddleware, giveTedSilverPost);
/**
 * @swagger
 * /user/giveTedBronzeCoin:
 *   post:
 *     summary: Give a TedBronze coin to a post
 *     tags:
 *       - Posts
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
 *               - postId
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               token:
 *                 type: string
 *               postId:
 *                 type: string
 *                 description: The ID of the post to give the coin to
 *     responses:
 *       200:
 *         description: Coin given successfully or failure reason
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 updatedTedBronzeCount:
 *                   type: integer
 *                   nullable: true
 *                 toUser:
 *                   type: string
 *                   nullable: true
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */

router.post("/giveTedBronzeCoin", authMiddleware, giveTedBronzePost);
/**
 * @swagger
 * /user/getAuthorizedUserPhotoGraphy:
 *   post:
 *     summary: Retrieve authenticated user's photography posts
 *     description: |
 *       Returns all posts for the authorized user where `is_photography` is true.
 *       Validates the user's email against the provided token in the request body.
 *     tags:
 *       - Posts
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
 *                 description: User's registered email address
 *                 example: user@example.com
 *               token:
 *                 type: string
 *                 description: Bearer token from the Authorization header
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: List of photography posts or a message if none exist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Fetched all Photos for the authorized user
 *                 userPhotoGraphy:
 *                   type: array
 *                   description: Array of photography Post objects
 *                   items:
 *                     $ref: '#/components/schemas/Post'
 *       403:
 *         description: Token mismatch or unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Provided token does not match authorized token
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Server Error while fetching userAll Photos
 */
router.post(
  "/getAuthorizedUserPhotoGraphy",
  authMiddleware,
  getAuthorizedUserPhotoGraphy
);

/**
 * @swagger
 * /user/givetedBlackCoin:
 *   post:
 *     summary: Give a TedBlackCoin to a post with a reason and notify prior coin givers for voting.
 *     tags:
 *       - TedBlackCoin
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - postId
 *               - reason
 *               - email
 *               - token
 *               - hashTags
 *             properties:
 *               postId:
 *                 type: string
 *                 description: ID of the post to give a TedBlackCoin.
 *               reason:
 *                 type: string
 *                 description: Reason for giving the TedBlackCoin.
 *               email:
 *                 type: string
 *                 description: Email of the user giving the coin (for verification).
 *               token:
 *                 type: string
 *                 description: Authorization token for validation.
 *               hashTags:
 *                 type: string
 *                 enum: [spam, abuse, misinformation]
 *                 description: Hashtag category for the TedBlackCoin reason.
 *     responses:
 *       200:
 *         description: TedBlackCoin successfully given and notifications sent for voting.
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
 *         description: Missing required fields or invalid hashTags.
 *       401:
 *         description: Invalid token or email mismatch.
 *       404:
 *         description: Post or post owner not found.
 *       500:
 *         description: Server error.
 */
router.post("/givetedBlackCoin", authMiddleware, giveTedBlackCoin);
// /**
//  * @swagger
//  * /user/voteTedBlackCoin:
//  *   post:
//  *     summary: Vote on a TedBlackCoin action
//  *     tags:
//  *       - TedBlackCoin
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - postId
//  *               - voteType
//  *               - email
//  *               - token
//  *             properties:
//  *               postId:
//  *                 type: string
//  *                 description: ID of the post to vote on
//  *                 example: "665094f23d2ae18a37f04eaa"
//  *               voteType:
//  *                 type: string
//  *                 enum: [agree, disagree]
//  *                 description: The vote type ("agree" or "disagree")
//  *                 example: "agree"
//  *               email:
//  *                 type: string
//  *                 description: Email of the user casting the vote
//  *                 example: "user@example.com"
//  *               token:
//  *                 type: string
//  *                 description: JWT token of the user
//  *                 example: "your.jwt.token.here"
//  *     responses:
//  *       200:
//  *         description: Vote recorded successfully or validation message
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 success:
//  *                   type: boolean
//  *                   example: true
//  *                 message:
//  *                   type: string
//  *                   example: "Vote recorded successfully"
//  *       500:
//  *         description: Server error while voting
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 success:
//  *                   type: boolean
//  *                   example: false
//  *                 message:
//  *                   type: string
//  *                   example: "Server error while voting"
//  */
router.post("/voteTedBlackCoin",authMiddleware,voteTedBlackCoin)

/**
 * @swagger
 * /user/inviteAFriend:
 *   post:
 *     summary: Send a friend request to another user
 *     description: |
 *       Allows an authenticated user to send a friend request to another user by their ID.
 *       Verifies the JWT token and email before proceeding. Also checks if a request has already been sent.
 *     tags:
 *       - Friends
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
 *               - reciverId
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *                 description: Authenticated user's email for verification
 *               token:
 *                 type: string
 *                 example: your-jwt-token
 *                 description: JWT token to verify user identity
 *               reciverId:
 *                 type: string
 *                 example: 66512f6bbec36e0a27d44891
 *                 description: ID of the user to whom the friend request is being sent
 *     responses:
 *       200:
 *         description: Friend request sent or already sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucess:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Friend request sent
 *       403:
 *         description: Provided token does not match authorized token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Provided token does not match authorized token
 *       500:
 *         description: Server error while sending friend request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucess:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Error in inviteAFriend Route
 */
router.post("/inviteAFriend",authMiddleware,sendFriendRequest);
/**
 * @swagger
 * /user/cancleMyRequest:
 *   post:
 *     summary: Cancel a sent friend request with email and token verification
 *     tags:
 *       - Friends
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               friendId:
 *                 type: string
 *                 description: ID of the user to whom the friend request was sent
 *               email:
 *                 type: string
 *                 description: Email of the user (used for verification)
 *               token:
 *                 type: string
 *                 description: Token to be matched with authorization header
 *             required:
 *               - friendId
 *               - email
 *               - token
 *     responses:
 *       200:
 *         description: Friend request canceled or error message if validation fails
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error while canceling request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post("/cancleMyRequest",authMiddleware,cancleMyRequest);
/**
 * @swagger
 * /user/fetchAllRecentUserAllFriends:
 *   post:
 *     summary: Fetch all users the current user has recently unfriended
 *     tags:
 *       - Friends
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email of the authenticated user for verification
 *               token:
 *                 type: string
 *                 description: Token to match against the Authorization header
 *             required:
 *               - email
 *               - token
 *     responses:
 *       200:
 *         description: Successfully fetched recently unfriended users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucess:
 *                   type: boolean
 *                 Recent:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       userId:
 *                         type: string
 *                       recentId:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             userName:
 *                               type: string
 *                             email:
 *                               type: string
 *                             profilePic:
 *                               type: string
 *                       status:
 *                         type: string
 *       500:
 *         description: Server error while fetching recent unfriended users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucess:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post("/fetchAllRecentUserAllFriends",authMiddleware,fetchAllRecentUserAllFriends);
/**
 * @swagger
 * /user/fetchAllRecentCancleRequest:
 *   post:
 *     summary: Fetch all recently canceled friend requests by the user
 *     tags:
 *       - Friends
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email of the authenticated user for verification
 *               token:
 *                 type: string
 *                 description: Token to match with the Authorization header
 *             required:
 *               - email
 *               - token
 *     responses:
 *       200:
 *         description: Successfully fetched recent canceled requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 Recent:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       userId:
 *                         type: string
 *                       status:
 *                         type: string
 *                       recentId:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             userName:
 *                               type: string
 *                             email:
 *                               type: string
 *                             profilePic:
 *                               type: string
 *       500:
 *         description: Server error while fetching canceled friend requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post("/fetchAllRecentCancleRequest",authMiddleware,fetchAllRecentCancleRequest)
/**
 * @swagger
 * user/acceptFriendRequest:
 *   post:
 *     summary: Accept a friend request
 *     description: |
 *       Allows an authenticated user to accept a pending friend request.
 *       Validates JWT token, user email, and the friend request ID.
 *     tags:
 *       - Friends
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
 *               - requestId
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *                 description: Authenticated user's email
 *               token:
 *                 type: string
 *                 example: your-jwt-token
 *                 description: JWT token from Authorization header
 *               requestId:
 *                 type: string
 *                 example: 6651356cf913ff4e09cc3cde
 *                 description: ID of the friend request to accept
 *     responses:
 *       200:
 *         description: Friend request accepted or validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Friend request accepted
 *       403:
 *         description: Provided token does not match authorized token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Provided token does not match authorized token
 *       500:
 *         description: Server error while accepting the friend request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Error in acceptRequest controller
 */
router.post("/acceptFriendRequest",authMiddleware, acceptFriendRequest);
/**
 * @swagger
 * /user/rejectFriendRequest:
 *   post:
 *     summary: Reject a friend request
 *     description: Allows the authenticated user to reject a friend request sent to them.
 *     tags:
 *       - Friends
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Bearer token for verification
 *               email:
 *                 type: string
 *                 description: Email of the authenticated user
 *               requestId:
 *                 type: string
 *                 description: User ID of the person who sent the friend request
 *             required:
 *               - token
 *               - email
 *               - requestId
 *     responses:
 *       200:
 *         description: Friend request successfully rejected or appropriate message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       403:
 *         description: Provided token does not match authorized token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post("/rejectFriendRequest",authMiddleware,rejectFriendRequest)
/**
 * @swagger
 * /user/requestedme:
 *   post:
 *     summary: Get all pending friend requests sent to the authenticated user
 *     description: Returns a list of users who have sent a friend request to the currently logged-in user (receiver).
 *     tags:
 *       - Friends
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Bearer token for verification
 *               email:
 *                 type: string
 *                 description: Email of the authenticated user
 *             required:
 *               - token
 *               - email
 *     responses:
 *       200:
 *         description: Success response with list of friend requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucess:
 *                   type: boolean
 *                 length:
 *                   type: integer
 *                   description: Number of pending friend requests
 *                 request:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       403:
 *         description: Provided token does not match authorized token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucess:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post("/requestedme",authMiddleware,requestedme);
/**
 * @swagger
 * /user/IrequEst:
 *   post:
 *     summary: Get all friend requests sent by the authenticated user
 *     description: Returns a list of friend requests that the currently logged-in user (sender) has sent to others.
 *     tags:
 *       - Friends
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Bearer token for verification
 *               email:
 *                 type: string
 *                 description: Email of the authenticated user
 *             required:
 *               - token
 *               - email
 *     responses:
 *       200:
 *         description: Success response with list of sent friend requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucess:
 *                   type: boolean
 *                 length:
 *                   type: integer
 *                   description: Number of requests sent
 *                 requistI:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       403:
 *         description: Provided token does not match authorized token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucess:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post("/IrequEst",authMiddleware,IrequEst)
/**
 * @swagger
 * /user/unFriend:
 *   post:
 *     summary: Unfriend a user and store the action in recent list
 *     description: 
 *       Unfriends a user by removing them from the current user's friend list. 
 *       Also logs the unfriended user in the "recent" collection for tracking.
 *     tags:
 *       - Friends
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
 *               - unFriendUserId
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               token:
 *                 type: string
 *                 example: jwt-token-string
 *               unFriendUserId:
 *                 type: string
 *                 format: ObjectId
 *                 example: 60c72b2f9b1d8c3a3c8d1a2b
 *     responses:
 *       200:
 *         description: Successfully unfriended
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Successfully unfriended
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized or token mismatch
 *       500:
 *         description: Internal server error
 */
router.post("/unFriend",authMiddleware,unFriend)
/**
 * @swagger
 * /user/makeAfriend:
 *   post:
 *     summary: Make a friend and remove from recent unfriended list
 *     description: 
 *       Adds a user to the current user's friend list, and removes the user from the "recent" unfriended list if present.
 *     tags:
 *       - Friends
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
 *               - friendId
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               token:
 *                 type: string
 *                 example: jwt-token-string
 *               friendId:
 *                 type: string
 *                 format: ObjectId
 *                 example: 60c72b2f9b1d8c3a3c8d1a2b
 *     responses:
 *       200:
 *         description: Successfully made a friend
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Successfully made a friend
 *       400:
 *         description: Missing required fields
 *       403:
 *         description: Unauthorized - Token mismatch
 *       500:
 *         description: Internal server error
 */
router.post("/makeAfriend",authMiddleware,makeAfriend)

/**
 * @swagger
 * /user/handleTedBlackCoinVote:
 *   post:
 *     summary: Handle TedBlackCoin vote (agree/disagree) by a user
 *     tags:
 *       - TedBlackCoin
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *               - postId
 *               - giverId
 *               - token
 *               - email
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [agree_vote, disagree_vote]
 *                 example: agree_vote
 *               postId:
 *                 type: string
 *                 example: 665b5e0d7dd99f7d2cfddf3a
 *               giverId:
 *                 type: string
 *                 example: 665b5e0d7dd99f7d2cfddf99
 *               token:
 *                 type: string
 *                 description: JWT token for verification
 *               email:
 *                 type: string
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Vote recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     postId:
 *                       type: string
 *                     action:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *       400:
 *         description: Validation or duplicate vote error
 *       401:
 *         description: Unauthorized - invalid token or email
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router.post("/handleTedBlackCoinVote",authMiddleware,handleTedBlackCoinVote)

router.post("/noti",sendNoti)


/**
 * @swagger
 * /user/getBlackCoinReactionsToMyPosts:
 *   post:
 *     summary: Get list of users who gave TedBlackCoin to my posts
 *     tags:
 *       - TedBlackCoin
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - email
 *             properties:
 *               token:
 *                 type: string
 *                 description: JWT token of the logged-in user
 *               email:
 *                 type: string
 *                 description: Email of the logged-in user
 *                 example: myemail@example.com
 *     responses:
 *       200:
 *         description: List of black coin reactions to the user's posts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                   description: Number of reactions
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       userId:
 *                         type: object
 *                         properties:
 *                           userName:
 *                             type: string
 *                           profilePic:
 *                             type: string
 *                           email:
 *                             type: string
 *                       userPostId:
 *                         type: object
 *                         properties:
 *                           content:
 *                             type: object
 *                           hashTag:
 *                             type: array
 *                             items:
 *                               type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *       400:
 *         description: Missing token or email
 *       401:
 *         description: Unauthorized - Invalid token or email
 *       500:
 *         description: Server error while fetching reactions
 */
router.post("/getBlackCoinReactionsToMyPosts",authMiddleware,getBlackCoinReactionsToMyPosts);
/**
 * @swagger
 * /user/getBlackCoinReactionsByMe:
 *   post:
 *     summary: Get all posts where I have given a TedBlackCoin
 *     tags:
 *       - TedBlackCoin
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - email
 *             properties:
 *               token:
 *                 type: string
 *                 description: JWT token of the logged-in user
 *               email:
 *                 type: string
 *                 description: Email of the logged-in user
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: List of posts reacted to with TedBlackCoin by the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       userPostId:
 *                         type: object
 *                         properties:
 *                           content:
 *                             type: object
 *                             description: Content of the post
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                       postUserId:
 *                         type: object
 *                         properties:
 *                           userName:
 *                             type: string
 *                           profilePic:
 *                             type: string
 *       400:
 *         description: Missing token or email
 *       401:
 *         description: Unauthorized - Invalid token or email
 *       500:
 *         description: Server error while fetching reactions
 */
router.post("/getBlackCoinReactionsByMe", authMiddleware ,getBlackCoinReactionsByMe);
/**
 * @swagger
 * /user/getNotiFicationsOnBasisUserId:
 *   post:
 *     summary: Get notifications for a user
 *     description: Returns a list of notifications for the logged-in user, filtered by token and email verification.
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: your-jwt-token
 *               email:
 *                 type: string
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Successfully retrieved notifications or relevant message.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucess:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 count:
 *                   type: number
 *                 notification:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       userId:
 *                         type: object
 *                         properties:
 *                           userName:
 *                             type: string
 *                           profilePic:
 *                             type: string
 *                           email:
 *                             type: string
 *                       postId:
 *                         type: object
 *                         properties:
 *                           content:
 *                             type: string
 *                           descriptionText:
 *                             type: string
 *                           is_photography:
 *                             type: boolean
 *                           colorMatrix:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal Server Error
 */
router.post("/getNotiFicationsOnBasisUserId",authMiddleware,getNotiFicationsOnBasisUserId);
/**
 * @swagger
 * /user/getProfileBasedOnUserId:
 *   post:
 *     summary: Get a user's profile and posts based on userId
 *     tags:
 *       - Profile
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
 *                 description: The ID of the user whose profile is to be fetched
 *                 example: 6643a295e7a91b2e0db7b123
 *     responses:
 *       200:
 *         description: Successfully fetched user profile and posts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Fetched user profile
 *                 userProfile:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     userName:
 *                       type: string
 *                     profilePic:
 *                       type: string
 *                     email:
 *                       type: string
 *                     userAllFriends:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           userName:
 *                             type: string
 *                           profilePic:
 *                             type: string
 *                           email:
 *                             type: string
 *                     posts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           content:
 *                             type: string
 *                           descriptionText:
 *                             type: string
 *                           is_photography:
 *                             type: boolean
 *                           colorMatrix:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           comments:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 userId:
 *                                   type: object
 *                                   properties:
 *                                     userName:
 *                                       type: string
 *                                     profilePic:
 *                                       type: string
 *                                     email:
 *                                       type: string
 *       500:
 *         description: Server error while fetching profile
 */
router.post("/getProfileBasedOnUserId",getProfileBasedOnUserId)

router.post("/test",TEST)
/**
 * @swagger
 * /user/deleteAPost:
 *   post:
 *     tags:
 *       - Posts
 *     summary: Delete a post by its owner
 *     description: |
 *       Deletes the specified post if the user is the owner and deducts
 *       TedCoin balances (gold, silver, bronze) from the user's wallet
 *       if the post has over 10 TedBlack coins.
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
 *               - postId
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               token:
 *                 type: string
 *               postId:
 *                 type: string
 *                 description: MongoDB ObjectId of the post to delete
 *     responses:
 *       '200':
 *         description: Post evaluated (and deleted) successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 tedBlackCount:
 *                   type: integer
 *                 tedGoldCount:
 *                   type: integer
 *                 tedSilverCount:
 *                   type: integer
 *                 tedBronzeCount:
 *                   type: integer
 *       '403':
 *         description: Not authorized – user is not the post owner.
 *       '404':
 *         description: Post or user not found.
 *       '500':
 *         description: Server error.
 */
router.post("/deleteAPost",authMiddleware,deleteAPost)
/**
 * @swagger
 * /user/fetchProfileLocations:
 *   post:
 *     summary: Fetch nearby user profile locations within a given distance.
 *     tags:
 *       - Map & Location
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - distance
 *               - email
 *               - token
 *               - profileDisplay
 *             properties:
 *               distance:
 *                 type: number
 *                 description: Distance in kilometers to filter nearby users
 *                 example: 5
 *               email:
 *                 type: string
 *                 description: Email of the user for verification
 *                 example: user@example.com
 *               token:
 *                 type: string
 *                 description: Bearer token from Authorization header
 *               profileDisplay:
 *                 type: boolean
 *                 description: Whether profile visibility is enabled or not
 *                 example: true
 *     responses:
 *       200:
 *         description: Successfully fetched nearby users or profileDisplay is disabled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                   description: Number of nearby users
 *                 users:
 *                   type: array
 *                   description: Array of nearby users with profilePic
 *                   items:
 *                     type: object
 *                 message:
 *                   type: string
 *       401:
 *         description: Invalid token or email
 *       404:
 *         description: Location not found for this user
 *       500:
 *         description: Server Error in FetchProfileLocations
 */
router.post("/fetchProfileLocations",authMiddleware,fetchProfileLocations)
/**
 * @swagger
 * /user/fetchMapSetting:
 *   post:
 *     summary: Fetch map settings for the authenticated user
 *     description: Retrieves map settings stored for a specific user based on their ID. Requires a valid token and matching email.
 *     tags:
 *       - Map Settings
 *     security:
 *       - bearerAuth: []  # Token should be sent in the Authorization header as Bearer token
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
 *                 example: user@example.com
 *               token:
 *                 type: string
 *                 example: your_jwt_token_here
 *     responses:
 *       200:
 *         description: Successfully fetched map setting
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucess:
 *                   type: boolean
 *                   example: true
 *                 mapSettingOnAnUserId:
 *                   type: object
 *                   description: User-specific map setting object
 *       401:
 *         description: Unauthorized - Invalid token or email
 *       500:
 *         description: Internal Server Error
 */
router.post("/fetchMapSetting",authMiddleware,fetchMapSetting)
/**
 * @swagger
 * /user/sendReqinApporach:
 *   post:
 *     summary: Send an approach request to another user.
 *     description: Sends an approach request from the logged-in user to another user if approach mode is enabled.
 *     tags:
 *       - Approach Mode
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
 *               - requestId
 *               - apporachMode
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               token:
 *                 type: string
 *                 description: JWT token from Authorization header
 *                 example: eyJhbGciOiJIUzI1NiIsInR...
 *               requestId:
 *                 type: string
 *                 description: ID of the user to whom the request is being sent
 *                 example: 665f390c3b2376aaf92e80e0
 *               apporachMode:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Response message about request status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucess:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Req Approach Send"
 *       401:
 *         description: Unauthorized or invalid email/token
 *       500:
 *         description: Server Error in make Request
 */
router.post("/sendReqinApporach",authMiddleware,sendReqinApporach)
/**
 * @swagger
 * /user/acceptReqApporach:
 *   post:
 *     summary: Accept an approach request from another user.
 *     description: Logged-in user accepts an incoming approach request and notifies the sender with current location.
 *     tags:
 *       - Approach Mode
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
 *               - requestId
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               token:
 *                 type: string
 *                 description: JWT token from Authorization header
 *                 example: eyJhbGciOiJIUzI1NiIsInR...
 *               requestId:
 *                 type: string
 *                 description: ID of the user who sent the approach request
 *                 example: 665f390c3b2376aaf92e80e0
 *     responses:
 *       200:
 *         description: Approach request accepted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucess:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Approach Accepted"
 *       401:
 *         description: Invalid token or email
 *       404:
 *         description: Location not found
 *       500:
 *         description: Server Error in Accept Request apporach
 */
router.post("/acceptReqApporach",authMiddleware,acceptReqApporach)
/**
 * @swagger
 * /user/rejectReqApporach:
 *   post:
 *     summary: Reject an incoming approach request
 *     description: Allows the logged-in user to reject a pending approach request. A notification will be sent to the requester.
 *     tags:
 *       - Approach Mode
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
 *               - requestId
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email of the logged-in user
 *                 example: user@example.com
 *               token:
 *                 type: string
 *                 description: JWT token of the user (must match Authorization header)
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6...
 *               requestId:
 *                 type: string
 *                 description: ID of the user who sent the approach request
 *                 example: 665f390c3b2376aaf92e80e0
 *     responses:
 *       200:
 *         description: Approach request rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Approach Rejected
 *       400:
 *         description: Missing required fields like userId or requestId
 *       401:
 *         description: Invalid token or email
 *       404:
 *         description: No approach request found
 *       500:
 *         description: Server error while rejecting the request
 */
router.post("/rejectReqApporach",authMiddleware,rejectReqApporach);
/**
 * @swagger
 * /user/ReqApporachShow:
 *   post:
 *     summary: Show all pending approach requests
 *     description: Returns a list of all users who have sent a pending approach request to the logged-in user.
 *     tags:
 *       - Approach Mode
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
 *                 description: Logged-in user's email for verification
 *                 example: user@example.com
 *               token:
 *                 type: string
 *                 description: JWT token of the user (must match Authorization header)
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6...
 *     responses:
 *       200:
 *         description: List of pending approach requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucess:
 *                   type: boolean
 *                   example: true
 *                 ReqApporach:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       sender:
 *                         type: object
 *                         description: The user who sent the request
 *                       status:
 *                         type: string
 *                         example: pending
 *       401:
 *         description: Invalid token or email
 *       500:
 *         description: Server error while retrieving requests
 */
router.post("/ReqApporachShow",authMiddleware,ReqApporachShow)
/**
 * @swagger
 * /user/fetchFriendsApporachController:
 *   post:
 *     summary: Fetch user's friends list with basic info.
 *     description: Retrieves the list of friends (userAllFriends) for the authenticated user, including their userName, fullName, email, and profilePic.
 *     tags:
 *       - Approach Mode
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
 *                 example: user@example.com
 *               token:
 *                 type: string
 *                 example: your_jwt_token_here
 *     responses:
 *       200:
 *         description: List of user's friends or error message.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucess:
 *                   type: boolean
 *                   example: true
 *                 friend_List:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 60f7cbb96f354826d8e9a9a3
 *                       userName:
 *                         type: string
 *                         example: john_doe
 *                       fullName:
 *                         type: string
 *                         example: John Doe
 *                       email:
 *                         type: string
 *                         example: john@example.com
 *                       profilePic:
 *                         type: string
 *                         example: https://example.com/image.jpg
 *       401:
 *         description: Unauthorized – Invalid token or email.
 *       500:
 *         description: Server error.
 */
router.post("/fetchFriendsApporachController",authMiddleware,fetchFriendsApporachController);
// /**
//  * @swagger
//  * /user/apporachModeProtectorOn:
//  *   post:
//  *     summary: Enable Approach Mode Protector and fetch locations of user's friends.
//  *     description: This endpoint enables the approach mode protector and returns the locations of all friends if the mode is on.
//  *     tags:
//  *       - Approach Mode
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - email
//  *               - token
//  *               - apporachMode
//  *             properties:
//  *               email:
//  *                 type: string
//  *                 example: user@example.com
//  *               token:
//  *                 type: string
//  *                 example: your_jwt_token_here
//  *               apporachMode:
//  *                 type: boolean
//  *                 example: true
//  *     responses:
//  *       200:
//  *         description: Success or failure message with friend locations if applicable.
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 sucess:
//  *                   type: boolean
//  *                   example: true
//  *                 message:
//  *                   type: string
//  *                   example: Inside in Apporach Mode
//  *                 Location:
//  *                   type: array
//  *                   items:
//  *                     type: object
//  *                     properties:
//  *                       lattitude:
//  *                         type: number
//  *                         example: 28.6139
//  *                       longitude:
//  *                         type: number
//  *                         example: 77.2090
//  *       401:
//  *         description: Unauthorized (Invalid token or email).
//  *       500:
//  *         description: Server error.
//  */
router.post("/apporachModeProtectorOn",authMiddleware,apporachModeProtectorOn)
/**
 * @swagger
 * /user/sendLiveLocationWithInyourFriends:
 *   post:
 *     summary: Share live location with friends within 5 km
 *     tags:
 *       - Approach Mode
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
 *               - data
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               token:
 *                 type: string
 *                 description: Should match the Bearer token in Authorization header
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
 *               data:
 *                 type: array
 *                 description: Array of friend user IDs
 *                 items:
 *                   type: string
 *                 example: ["665f3b1e5fd021e3b04e3e4d", "6648f10bd4015c8890d95e72"]
 *     responses:
 *       200:
 *         description: Live location sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Live location sent to 2 friend(s) within 5km"
 *                 notifiedUsers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       friendId:
 *                         type: string
 *                         example: "665f3b1e5fd021e3b04e3e4d"
 *                       friendName:
 *                         type: string
 *                         example: "JohnDoe"
 *                       distance:
 *                         type: string
 *                         example: "2.31"
 *       400:
 *         description: Missing or invalid input data
 *       401:
 *         description: Unauthorized (invalid token or email)
 *       500:
 *         description: Internal server error
 */
router.post("/sendLiveLocationWithInyourFriends",authMiddleware,sendLiveLocationWithInyourFriends)
/**
 * @swagger
 * /user/getMessages:
 *   post:
 *     summary: Fetch all messages between the authenticated user and a specific receiver
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
 *               - receiverId
 *             properties:
 *               receiverId:
 *                 type: string
 *                 example: "60a7a1f2e13e2b001c8b4567"
 *     responses:
 *       200:
 *         description: Returns all messages between sender and receiver
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 messages:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Message'
 *       500:
 *         description: Internal server error
 */

// router.post("/getMessages",authMiddleware,getMessages)

router.post("/friendsInMessingIfOnline",authMiddleware,friendsInMessingIfOnline);

// router.post("/getMessages",authMiddleware,getMessages);

router.post("/markMsgAsRead",authMiddleware,markMsgAsRead)

router.post("/FetchPhotoGraphyForHome",authMiddleware,FetchPhotoGraphyForHome)

// /**
//  * @swagger
//  * /user/apporachModeToAUser:
//  *   post:
//  *     summary: Send an approach request to another user with optional push notification.
//  *     tags:
//  *       - Map & Location
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - apporachId
//  *               - email
//  *               - token
//  *               - profileDisplay
//  *               - apporachMode
//  *             properties:
//  *               apporachId:
//  *                 type: string
//  *                 description: ID of the user to whom the approach request is sent
//  *               email:
//  *                 type: string
//  *                 description: Email of the sender user (used for validation)
//  *                 example: user@example.com
//  *               token:
//  *                 type: string
//  *                 description: Bearer token for authentication
//  *               profileDisplay:
//  *                 type: boolean
//  *                 description: Whether the profile is visible to others
//  *                 example: true
//  *               apporachMode:
//  *                 type: boolean
//  *                 description: Whether the user has enabled approach mode
//  *                 example: true
//  *     responses:
//  *       200:
//  *         description: Approach request sent successfully or required settings are disabled
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 success:
//  *                   type: boolean
//  *                 message:
//  *                   type: string
//  *       400:
//  *         description: Missing apporachId
//  *       401:
//  *         description: Invalid token or email
//  *       404:
//  *         description: Target user not found
//  *       500:
//  *         description: Server error in handling approach mode
//  */
// router.post("/apporachModeToAUser",authMiddleware,apporachModeToAUser)
// /**
//  * @swagger
//  * /user/handelApporachVote:
//  *   post:
//  *     summary: Handle user's vote (agree_vote/disagree_vote) for Approach Mode
//  *     tags:
//  *       - Map & Location
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - email
//  *               - token
//  *               - action
//  *             properties:
//  *               email:
//  *                 type: string
//  *                 example: user@example.com
//  *               token:
//  *                 type: string
//  *                 example: your-auth-token
//  *               action:
//  *                 type: string
//  *                 enum: [agree_vote, disagree_vote]
//  *                 description: User action on approach mode
//  *                 example: agree_vote
//  *     responses:
//  *       200:
//  *         description: Vote handled successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 success:
//  *                   type: boolean
//  *                   example: true
//  *                 message:
//  *                   type: string
//  *                   example: User agreed with the ApporachMode
//  *                 userLat:
//  *                   type: number
//  *                   example: 17.385044
//  *                 userLon:
//  *                   type: number
//  *                   example: 78.486671
//  *                 user:
//  *                   type: object
//  *                   description: Populated user data including posts
//  *       401:
//  *         description: Invalid token or email
//  *       404:
//  *         description: Location not found for this user
//  *       500:
//  *         description: Server Error in Handling Approach Vote
//  */
// router.post("/handelApporachVote",authMiddleware,handelApporachVote)




/**
 * @swagger
 * /user/share-url:
 *   post:
 *     summary: Generate shareable URL for a post
 *     description: Returns a public URL that can be shared for viewing the post.
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - postId
 *             properties:
 *               postId:
 *                 type: string
 *                 example: "abc123"
 *                 description: The ID of the post to generate a shareable URL for.
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
 *         description: Shareable URL generated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 shareUrl:
 *                   type: string
 *                   example: https://yourdomain.com/posts/123456
 *                 message:
 *                   type: string
 *                   example: Shareable URL generated successfully.
 *       404:
 *         description: Post not found.
 *       500:
 *         description: Internal server error.
 */
router.post('/share-url', authMiddleware, getShareablePostUrl);

/**
 * @swagger
 * /user/save:
 *   put:
 *     summary: Save or unsave a post
 *     description: Allows a user to save a post for later viewing or remove it from saved posts.
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - postId
 *             properties:
 *               postId:
 *                 type: string
 *                 example: "abc123"
 *                 description: The ID of the post to save or unsave.
 *               type:
 *                 type: string
 *                 example: post/photograph/filter
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
 *         description: Post saved/unsaved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Post saved successfully.
 *       404:
 *         description: Post not found.
 *       500:
 *         description: Internal server error.
 */
router.put('/save', authMiddleware, toggleSaveItem);

/**
 * @swagger
 * /user/saved-items:
 *   post:
 *     summary: Get saved items by type
 *     description: Retrieve all saved items of a specific type (post, photograph, filter), optionally filtered by savedAt timestamp.
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [post, photograph, filter]
 *                 example: post
 *                 description: The type of saved item to retrieve.
 *               savedAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-08-01T00:00:00.000Z"
 *                 description: (Optional) Only return items saved after this timestamp.
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
 *         description: List of saved items.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         example: post
 *                       item:
 *                         type: object
 *                         description: The full populated item document.
 *                       savedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-09-02T12:00:00.000Z"
 *       400:
 *         description: Invalid type or bad request.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */
router.post('/saved-items', authMiddleware, getSavedItems);

/**
 * @swagger
 * /user/qrCode:
 *   post:
 *     summary: Generate camMe QR Code
 *     description: Generates a QR code that links to a user's camMe profile.
 *     tags:
 *       - QR Code
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: camMe userId to generate QR code for
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
 *                 example: 6644920a4ad4cc66aaae6131
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
 *         description: QR code generated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 qrCode:
 *                   type: string
 *                   format: uri
 *                   example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
 *       400:
 *         description: Missing or invalid userId.
 *       500:
 *         description: Internal server error.
 */
router.post('/qrCode', authMiddleware, getInstagramQrCode);

/**
 * @swagger
 * /user/getAllPendingBlackCoins:
 *   post:
 *     summary: Get all pending black coin votes for manual review
 *     tags:
 *       - Black Coin Moderation
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               token:
 *                 type: string
 *                 description: JWT token for authentication
 *                 example: 6699aabbccddeeff0011223344556677
 *     responses:
 *       200:
 *         description: List of all pending black coin votes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ContentMapping'
 */
router.post('/getAllPendingBlackCoins', authMiddleware, getAllPendingBlackCoins);


/**
 * @swagger
 * /user/approveOrRejectBlackCoin:
 *   post:
 *     summary: Approve or reject a pending black coin vote
 *     tags:
 *       - Black Coin Moderation
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mappingId:
 *                 type: string
 *                 description: The ContentMapping document ID
 *               action:
 *                 type: string
 *                 enum: [approve, reject]
 *                 description: Approve or reject the black coin
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               token:
 *                 type: string
 *                 description: JWT token for authentication
 *                 example: 6699aabbccddeeff0011223344556677
 *     responses:
 *       200:
 *         description: Black coin moderation result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post('/approveOrRejectBlackCoin', authMiddleware, approveOrRejectBlackCoin);

 
/**
 * @swagger
 * /user/getProfileVisitors:
 *   post:
 *     summary: Get list of users who visited the specified user's profile
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
 *                 description: The ID of the profile owner whose visitors are requested
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Requester's email (must match authenticated user's email)
 *               token:
 *                 type: string
 *                 description: JWT token (must match Authorization header)
 *               limit:
 *                 type: integer
 *                 description: Number of visitor records per page (optional, default 50)
 *               page:
 *                 type: integer
 *                 description: Page number (optional, default 1)
 *     responses:
 *       200:
 *         description: Visitor list returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 visitors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       visitorId:
 *                         type: string
 *                       fullName:
 *                         type: string
 *                       userName:
 *                         type: string
 *                       profilePic:
 *                         type: string
 *                       visitedAt:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Missing required fields (userId, email, or token)
 *       401:
 *         description: Unauthorized - token mismatch or invalid
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error while fetching visitors
 */
router.post("/getProfileVisitors", authMiddleware, getProfileVisitors);

/**
 * @swagger
 * /user/get-profile:
 *   post:
 *     summary: Get user profile by ID (records visitor if requester is different)
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
 *                 description: ID of the profile to fetch
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Requester's email (must match the authenticated user's email)
 *               token:
 *                 type: string
 *                 description: JWT token (must match the Authorization header)
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized (token/email mismatch)
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post("/get-profile", authMiddleware, getProfile);

// Update autoDeleteChat
router.post('/autoDeleteChat', updateAutoDeleteChat);
/**
 * @swagger
 * /user/autoDeleteChat:
 *   post:
 *     summary: Update or get autoDeleteChat setting for the user
 *     tags:
 *       - Privacy
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
 *                 example: user@example.com
 *               token:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *               autoDeleteChat:
 *                 type: string
 *                 enum: [24h, 1w, 30d, never]
 *                 example: 24h
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */

// Verify (get) autoDeleteChat
router.post('/getAutoDeleteChat', getAutoDeleteChat);
/**
 * @swagger
 * /user/getAutoDeleteChat:
 *   post:
 *     summary: Get current autoDeleteChat setting for the user
 *     tags:
 *       - Privacy
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
 *                 example: user@example.com
 *               token:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 */

// Update hideMutualFriends
router.post('/hideMutualFriends', updateHideMutualFriends);
/**
 * @swagger
 * /user/hideMutualFriends:
 *   post:
 *     summary: Update or get hideMutualFriends setting for the user
 *     tags:
 *       - Privacy
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
 *                 example: user@example.com
 *               token:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *               hideMutualFriends:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */

// Verify (get) hideMutualFriends
router.post('/getHideMutualFriends', getHideMutualFriends);
/**
 * @swagger
 * /user/getHideMutualFriends:
 *   post:
 *     summary: Get current hideMutualFriends setting for the user
 *     tags:
 *       - Privacy
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
 *                 example: user@example.com
 *               token:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 */

const { updateBeAnonymous, getBeAnonymous } = require("../controllers/userAuthController");

router.post('/beAnonymous', updateBeAnonymous);
router.post('/getBeAnonymous', getBeAnonymous);

/**
 * @swagger
 * /user/beAnonymous:
 *   post:
 *     summary: Update Be Anonymous setting for the user
 *     tags:
 *       - Privacy
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - token
 *               - beAnonymous
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               token:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *               beAnonymous:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *
 * /user/getBeAnonymous:
 *   post:
 *     summary: Get current Be Anonymous setting for the user
 *     tags:
 *       - Privacy
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
 *                 example: user@example.com
 *               token:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 */

module.exports = router;                       