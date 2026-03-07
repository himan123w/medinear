const express = require('express');
const router = express.Router();
const backInStockController = require('../controllers/backInStockController');
const authenticateToken = require('../middleware/authMiddleware');
const optionalAuth = require('../middleware/optionalAuth');

/**
 * Back-In-Stock Notification Routes
 * Allows both authenticated users and anonymous email subscribers
 */

// Subscribe to back-in-stock notification
router.post('/subscribe', optionalAuth, backInStockController.subscribeToBackInStock);

// Get user's subscriptions
router.get('/my', optionalAuth, backInStockController.getMySubscriptions);

// Check subscription status
router.get('/status', backInStockController.getSubscriptionStatus);

// Get statistics
router.get('/stats', authenticateToken, backInStockController.getNotificationStats);

// Cancel subscription
router.delete('/:subscriptionId/unsubscribe', optionalAuth, backInStockController.cancelSubscription);

module.exports = router;
