const express = require('express');
const router = express.Router();
const saasDashboardController = require('../controllers/saasDashboardController');

// Dashboard endpoints
router.get('/dashboard/:pharmacyId', saasDashboardController.getDashboard);
router.get('/analytics/:pharmacyId', saasDashboardController.getAnalytics);

// Stock Prediction endpoints
router.get('/predictions/:pharmacyId', saasDashboardController.getStockPredictions);
router.post('/predictions/:pharmacyId/update', saasDashboardController.updateAllPredictions);
router.get('/recommendations/:pharmacyId', saasDashboardController.generateRecommendations);

// Inventory management endpoints
router.put('/inventory/:pharmacyId/item', saasDashboardController.updateInventoryItem);
router.post('/sales-report/:pharmacyId', saasDashboardController.reportSalesData);

// Billing endpoints
router.get('/plans', saasDashboardController.getPlans);
router.post('/subscription/:pharmacyId', saasDashboardController.createSubscription);
router.get('/subscription/:pharmacyId', saasDashboardController.getSubscription);
router.put('/subscription/:pharmacyId/plan', saasDashboardController.changePlan);
router.delete('/subscription/:pharmacyId', saasDashboardController.cancelSubscription);
router.get('/billing/:pharmacyId/history', saasDashboardController.getBillingHistory);

module.exports = router;
