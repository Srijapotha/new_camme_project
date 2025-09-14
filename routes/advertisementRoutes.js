const express = require('express');
const { createBusinessAndAd, trackAdEvent, getAdAnalytics, getAdMetrics, createAdvertiserAccount, createAd } = require('../controllers/advertisementController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { uploadd } = require('../middleware/multer');
const router = express.Router();

/**
 * @swagger
 * /ads/business/create:
 *   post:
 *     summary: Create a business profile and advertisement
 *     tags:
 *       - Advertisement
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
 *               typeOfAdContent:
 *                 type: string
 *               adElements:
 *                 type: string
 *               appStoreLink:
 *                 type: string
 *               playStoreLink:
 *                 type: string
 *               adModel:
 *                 type: string
 *               targetedAgeGroup:
 *                 type: array
 *                 items:
 *                   type: string
 *               interests:
 *                 type: array
 *                 items:
 *                   type: string
 *               locations:
 *                 type: object
 *               adContentUrl:
 *                 type: string
 *                 format: binary
 *               email:
 *                 type: string
 *               token:
 *                 type: string
 *     responses:
 *       201:
 *         description: "Business and ad created"
 *       401:
 *         description: "Unauthorized: email and token required"
 *       400:
 *         description: "Validation error"
 *       500:
 *         description: "Server error"
 */
router.post('/business/create', authMiddleware, uploadd.fields([{ name: 'certificates', maxCount: 3 }]), createBusinessAndAd);

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
 *                   impression:
 *                     type: integer
 *                   click:
 *                     type: integer
 *                   view:
 *                     type: integer
 *                   engagement:
 *                     type: integer
 *                   install:
 *                     type: integer
 *                   formSubmit:
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
 * /ads/ad/analytics:
 *   post:
 *     summary: Get ad analytics for a specific advertisement
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
 *         description: "Ad analytics"
 *       401:
 *         description: "Unauthorized: email and token required"
 *       404:
 *         description: "Ad not found"
 *       500:
 *         description: "Server error"
 */
router.post('/ad/analytics', authMiddleware, getAdAnalytics);

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
 *               - email
 *               - token
 *             properties:
 *               advertiserId:
 *                 type: string
 *               typeOfAdContent:
 *                 type: string
 *               adElements:
 *                 type: string
 *               appStoreLink:
 *                 type: string
 *               playStoreLink:
 *                 type: string
 *               adModel:
 *                 type: string
 *               targetedAgeGroup:
 *                 type: array
 *                 items:
 *                   type: string
 *               interests:
 *                 type: array
 *                 items:
 *                   type: string
 *               locations:
 *                 type: object
 *               adContentUrl:
 *                 type: string
 *               email:
 *                 type: string
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

module.exports = router;