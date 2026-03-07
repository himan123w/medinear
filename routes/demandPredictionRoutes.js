const express = require('express');
const router = express.Router();
const demandPredictionController = require('../controllers/demandPredictionController');
const authMiddleware = require('../middleware/authMiddleware');

// AI Dashboard - Overview
router.get('/dashboard', authMiddleware, demandPredictionController.getAIDashboard);

// Seasonal Predictions (Winter medicines, etc.)
router.get('/seasonal', authMiddleware, demandPredictionController.getSeasonalPredictions);

// Area-based Predictions
router.get('/areas', authMiddleware, demandPredictionController.getAreaPredictions);

// Trending medicines (High demand + Low stock)
router.get('/trending', authMiddleware, demandPredictionController.getTrendingMedicines);

// Specific area details
router.get('/areas/:areaName', authMiddleware, demandPredictionController.getAreaDetail);

// Medicine-specific prediction
router.get('/medicines/:medicineName', authMiddleware, demandPredictionController.getMedicinePrediction);

// Refresh predictions (admin/manual trigger)
router.post('/refresh', authMiddleware, demandPredictionController.refreshPredictions);

module.exports = router;
