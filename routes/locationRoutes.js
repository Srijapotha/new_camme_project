const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

/**
 * @swagger
 * /location/countries:
 *   post:
 *     summary: Get all countries
 *     tags: [Location]
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
 *     responses:
 *       200:
 *         description: List of countries
 */
router.post('/countries', locationController.getCountries);

/**
 * @swagger
 * /location/states:
 *   post:
 *     summary: Get all states by country ID
 *     tags: [Location]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - token
 *               - countryId
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               token:
 *                 type: string
 *               countryId:
 *                 type: string
 *                 description: Country ID
 *     responses:
 *       200:
 *         description: List of states
 */
router.post('/states', locationController.getStatesByCountry);

/**
 * @swagger
 * /location/cities:
 *   post:
 *     summary: Get all cities by state ID
 *     tags: [Location]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - token
 *               - stateId
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               token:
 *                 type: string
 *               stateId:
 *                 type: string
 *                 description: State ID
 *     responses:
 *       200:
 *         description: List of cities
 */
router.post('/cities', locationController.getCitiesByState);

/**
 * @swagger
 * /location/regions:
 *   post:
 *     summary: Get all regions (districts) by state ID
 *     tags: [Location]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - token
 *               - stateId
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               token:
 *                 type: string
 *               stateId:
 *                 type: string
 *                 description: State ID
 *     responses:
 *       200:
 *         description: List of regions
 */
router.post('/regions', locationController.getRegionsByState);

module.exports = router;
