const express = require('express');
const { createBusinessAndAd, trackAdEvent, getAdAnalytics, getAdMetrics, createAdvertiserAccount, createAd, submitAdForm, getAdFormSubmissions, getAdById, submitAppInstallation, submitWebsiteEvent } = require('../controllers/advertisementController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { uploadd } = require('../middleware/multer');
const router = express.Router();


/**
 * @swagger
 * /ads/ad/track-event:
 *   post:
 *     summary: Track ad event (impression, click, view, engagement, install, formSubmit)
 *     tags:
 *       - Advertisement Analytics
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - adId
 *               - email
 *               - token
 *             properties:
 *               adId:
 *                 type: string
 *               actions:
 *                 type: object
 *                 properties:
 *                   impressions:
 *                     type: integer
 *                   clicks:
 *                     type: integer
 *                   views:
 *                     type: integer
 *                   engagements:
 *                     type: integer
 *                   installs:
 *                     type: integer
 *                   formSubmits:
 *                     type: integer
 *               email:
 *                 type: string
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: "Event tracked and billing updated"
 *       401:
 *         description: "Unauthorized: email and token required"
 *       404:
 *         description: "Ad not found"
 *       500:
 *         description: "Server error"
 */
router.post('/ad/track-event', authMiddleware, trackAdEvent);

/**
 * @swagger
 * /ads/ad/metrics:
 *   post:
 *     summary: Get ad metrics and analytics for a specific advertisement
 *     description: |
 *       Returns ad details, all metric counts (CPM, CPC, CPI, CPE, CPV, CPA), billing, and engagement breakdown (reactions, user list) for the specified ad.
 *     tags:
 *       - Advertisement Analytics
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - adId
 *               - email
 *               - token
 *             properties:
 *               adId:
 *                 type: string
 *               email:
 *                 type: string
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: "Ad metrics and analytics"
 *       401:
 *         description: "Unauthorized: email and token required"
 *       404:
 *         description: "Ad not found"
 *       500:
 *         description: "Server error"
 */
router.post('/ad/metrics', authMiddleware, getAdMetrics);

/**
 * @swagger
 * /ads/advertiser/create:
 *   post:
 *     summary: Create an advertiser (business) account
 *     tags:
 *       - Advertiser
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - businessName
 *               - email
 *               - token
 *             properties:
 *               businessTheme:
 *                 type: string
 *               businessProfile:
 *                 type: string
 *                 format: binary
 *               businessName:
 *                 type: string
 *               industrialSector:
 *                 type: string
 *               aboutBusiness:
 *                 type: string
 *               businessCertificates:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               businessMobileNumber:
 *                 type: string
 *               businessEmail:
 *                 type: string
 *               businessLocation:
 *                 type: string
 *               businessWebsite:
 *                 type: string
 *               email:
 *                 type: string
 *               token:
 *                 type: string
 *     responses:
 *       201:
 *         description: "Advertiser account created"
 *       401:
 *         description: "Unauthorized: email and token required"
 *       400:
 *         description: "Validation error"
 *       500:
 *         description: "Server error"
 */
router.post('/advertiser/create', authMiddleware, uploadd.fields([{ name: 'certificates', maxCount: 3 }]), createAdvertiserAccount);

/**
 * @swagger
 * /ads/ad/create:
 *   post:
 *     summary: Create an advertisement for an advertiser
 *     tags:
 *       - Advertisement
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - advertiserId
 *               - typeOfAdContent
 *               - adElements
 *               - adDescription
 *               - adModel
 *               - targetedAgeGroup
 *               - interests
 *               - locations
 *               - email
 *               - token
 *             properties:
 *               advertiserId:
 *                 type: string
 *               typeOfAdContent:
 *                 type: string
 *                 enum: [image, video]
 *               adElements:
 *                 type: string
 *                 enum: [app_installation, webpage, form]
 *               adDescription:
 *                 type: string
 *                 maxLength: 500
 *               adContentUrl:
 *                 type: string
 *                 description: URL to image or video content
 *               websiteLink:
 *                 type: string
 *                 description: Required if adElements is 'webpage'
 *               formFields:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Required if adElements is 'form'. List of selected form fields.
 *               appStoreLink:
 *                 type: string
 *                 description: Required if adElements is 'app_installation'
 *               playStoreLink:
 *                 type: string
 *                 description: Required if adElements is 'app_installation'
 *               adModel:
 *                 type: string
 *                 enum: [premium, elite, ultimate, free]
 *               targetedAgeGroup:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of age group keys (e.g., Teen, Young Adult, etc.)
 *               interests:
 *                 type: array
 *                 items:
 *                   type: string
 *               locations:
 *                 type: object
 *                 description: Location targeting object (countries, states, regions)
 *               status:
 *                 type: string
 *                 enum: [draft, preview]
 *                 description: Save as draft or preview
 *               email:
 *                 type: string
 *                 format: email
 *               token:
 *                 type: string
 *     responses:
 *       201:
 *         description: "Advertisement created"
 *       401:
 *         description: "Unauthorized: email and token required"
 *       400:
 *         description: "Validation error"
 *       404:
 *         description: "Advertiser not found"
 *       500:
 *         description: "Server error"
 */
router.post('/ad/create', authMiddleware, createAd);

/**
 * @swagger
 * /ads/ad/submit-form:
 *   post:
 *     summary: Submit form data for an ad
 *     tags:
 *       - Advertisement
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - adId
 *               - formData
 *               - email
 *               - token
 *             properties:
 *               adId:
 *                 type: string
 *               userId:
 *                 type: string
 *                 description: Optional, if user is logged in
 *               formData:
 *                 type: object
 *                 description: Field-value pairs for the form
 *               email:
 *                 type: string
 *                 format: email
 *               token:
 *                 type: string
 *     responses:
 *       201:
 *         description: "Form submitted"
 *       400:
 *         description: "Validation error"
 *       401:
 *         description: "Unauthorized: email and token required"
 *       500:
 *         description: "Server error"
 */
router.post('/ad/submit-form', authMiddleware, submitAdForm);

/**
 * @swagger
 * /ads/ad/form-submissions:
 *   post:
 *     summary: Get all form submissions for an ad
 *     tags:
 *       - Advertisement
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - adId
 *               - email
 *               - token
 *             properties:
 *               adId:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: List of form submissions
 *       400:
 *         description: Validation error
 *       401:
 *         description: "Unauthorized: email and token required"
 *       500:
 *         description: Server error
 */
router.post('/ad/form-submissions', authMiddleware, getAdFormSubmissions);

/**
 * @swagger
 * /ads/ad/get-by-id:
 *   post:
 *     summary: Get advertisement details by adId
 *     tags:
 *       - Advertisement
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - adId
 *               - email
 *               - token
 *             properties:
 *               adId:
 *                 type: string
 *                 description: Advertisement ID
 *               email:
 *                 type: string
 *                 format: email
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Advertisement details
 *       401:
 *         description: "Unauthorized: email and token required"
 *       400:
 *         description: "Validation error"
 *       404:
 *         description: "Ad not found"
 *       500:
 *         description: "Server error"
 */
router.post('/ad/get-by-id', authMiddleware, getAdById);

/**
 * @swagger
 * /ads/ad/install:
 *   post:
 *     summary: Track app installation event for an ad
 *     tags:
 *       - Advertisement
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - adId
 *               - email
 *               - token
 *             properties:
 *               adId:
 *                 type: string
 *               userId:
 *                 type: string
 *                 description: Optional, if user is logged in
 *               email:
 *                 type: string
 *                 format: email
 *               token:
 *                 type: string
 *     responses:
 *       201:
 *         description: "App installation tracked"
 *       400:
 *         description: "Validation error"
 *       401:
 *         description: "Unauthorized: email and token required"
 *       500:
 *         description: "Server error"
 */
router.post('/ad/install', authMiddleware, submitAppInstallation);

/**
 * @swagger
 * /ads/ad/website-click:
 *   post:
 *     summary: Track website click event for an ad
 *     tags:
 *       - Advertisement
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - adId
 *               - email
 *               - token
 *             properties:
 *               adId:
 *                 type: string
 *               userId:
 *                 type: string
 *                 description: Optional, if user is logged in
 *               email:
 *                 type: string
 *                 format: email
 *               token:
 *                 type: string
 *     responses:
 *       201:
 *         description: "Website click tracked"
 *       400:
 *         description: "Validation error"
 *       401:
 *         description: "Unauthorized: email and token required"
 *       500:
 *         description: "Server error"
 */
router.post('/ad/website-click', authMiddleware, submitWebsiteEvent);

module.exports = router;