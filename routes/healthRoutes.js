/**
 * 🏥 Health Check Routes
 * System monitoring and status endpoints
 */

const express = require('express');
const router = express.Router();
const { HealthCheck, createHealthCheckController } = require('../controllers/healthController');

// Initialize health check
const healthCheck = new HealthCheck();
const healthController = createHealthCheckController(healthCheck);

/**
 * @route   GET /api/health
 * @desc    Quick health check (returns status only)
 * @access  Public
 */
router.get('/', healthController.quick);

/**
 * @route   GET /api/health/detailed
 * @desc    Full system health check with all metrics
 * @access  Public
 */
router.get('/detailed', healthController.detailed);

/**
 * @route   GET /api/health/services
 * @desc    Check status of all platform services
 * @access  Public
 */
router.get('/services', healthController.services);

/**
 * @route   GET /api/health/database
 * @desc    Check database connectivity and status
 * @access  Public
 */
router.get('/database', healthController.database);

/**
 * @route   GET /api/health/system
 * @desc    Check system resources and performance
 * @access  Public
 */
router.get('/system', healthController.system);

module.exports = router;
