const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');

// Subscription CRUD operations
router.post('/create', subscriptionController.createSubscription);
router.get('/user/:userId', subscriptionController.getUserSubscriptions);
router.get('/:id', subscriptionController.getSubscriptionById);
router.put('/:id', subscriptionController.updateSubscription);

// Subscription status management
router.put('/:id/pause', subscriptionController.pauseSubscription);
router.put('/:id/resume', subscriptionController.resumeSubscription);
router.put('/:id/cancel', subscriptionController.cancelSubscription);

// Chronic disease recommendations
router.get('/disease/recommendations', subscriptionController.getDiseaseRecommendations);
router.get('/disease/types', subscriptionController.getDiseaseTypes);

// Admin operations
router.get('/admin/process-due', subscriptionController.processDueSubscriptions);

module.exports = router;

