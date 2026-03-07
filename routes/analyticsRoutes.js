const express = require('express');
const router = express.Router();
const analytics = require('../controllers/analyticsController');

router.get('/stock/:pharmacyId', analytics.getStockSummary);
router.get('/sales/:pharmacyId', analytics.getSalesSummary);
router.get('/predict/:pharmacyId', analytics.getStockPrediction);

// Area Heatmap routes
router.get('/heatmap/area', analytics.getAreaHeatmap);
router.get('/heatmap/city/:city', analytics.getCityHeatmap);
router.get('/heatmap/critical', analytics.getCriticalZones);

module.exports = router;
