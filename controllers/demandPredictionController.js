const demandPredictionService = require('../services/demandPredictionService');
const DemandPrediction = require('../models/DemandPrediction');

// Get seasonal demand predictions (Winter medicines, etc.)
exports.getSeasonalPredictions = async (req, res) => {
  try {
    const { season } = req.query;
    
    // Get active prediction or create new one
    let prediction = await demandPredictionService.getActivePredictions();
    
    if (!prediction) {
      prediction = await demandPredictionService.createDemandPrediction(season);
    }
    
    res.json({
      success: true,
      season: prediction.season,
      medicines: prediction.predictedDemandMedicines,
      accuracy: prediction.accuracy.seasonal,
      insights: prediction.insights.filter(i => i.type === 'seasonal_trend'),
      modelVersion: prediction.modelVersion,
      lastUpdated: prediction.updatedAt
    });
  } catch (error) {
    console.error('Error getting seasonal predictions:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving seasonal predictions',
      error: error.message
    });
  }
};

// Get area-based demand predictions
exports.getAreaPredictions = async (req, res) => {
  try {
    // Get active prediction or create new one
    let prediction = await demandPredictionService.getActivePredictions();
    
    if (!prediction) {
      prediction = await demandPredictionService.createDemandPrediction();
    }
    
    res.json({
      success: true,
      areas: prediction.areaPredictions,
      accuracy: prediction.accuracy.geographic,
      alerts: prediction.alerts,
      insights: prediction.insights.filter(i => i.type === 'area_shortage'),
      lastUpdated: prediction.updatedAt
    });
  } catch (error) {
    console.error('Error getting area predictions:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving area predictions',
      error: error.message
    });
  }
};

// Get comprehensive AI dashboard
exports.getAIDashboard = async (req, res) => {
  try {
    let prediction = await demandPredictionService.getActivePredictions();
    
    if (!prediction) {
      prediction = await demandPredictionService.createDemandPrediction();
    }
    
    // Format comprehensive dashboard
    const dashboard = {
      overview: {
        season: prediction.season,
        accuracy: prediction.accuracy.overall,
        lastUpdated: prediction.updatedAt,
        validUntil: prediction.validUntil
      },
      seasonalDemand: {
        topMedicines: prediction.predictedDemandMedicines.slice(0, 10),
        totalPredicted: prediction.predictedDemandMedicines.length,
        avgConfidence: Math.round(
          prediction.predictedDemandMedicines.reduce((sum, m) => sum + m.confidenceScore, 0) / 
          prediction.predictedDemandMedicines.length
        )
      },
      geographicInsights: {
        totalAreas: prediction.areaPredictions.length,
        criticalAreas: prediction.areaPredictions.filter(a => a.riskLevel === 'critical').length,
        highRiskAreas: prediction.areaPredictions.filter(a => a.riskLevel === 'high').length,
        areas: prediction.areaPredictions.slice(0, 10)
      },
      insights: prediction.insights,
      alerts: prediction.alerts,
      aiModel: {
        version: prediction.modelVersion,
        algorithm: prediction.algorithm,
        trainingDataPoints: prediction.trainingDataPoints,
        lastTrained: prediction.lastTrainedAt
      }
    };
    
    res.json({
      success: true,
      dashboard
    });
  } catch (error) {
    console.error('Error getting AI dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving AI dashboard',
      error: error.message
    });
  }
};

// Manually trigger prediction update
exports.refreshPredictions = async (req, res) => {
  try {
    const { season } = req.body;
    
    // Archive old predictions
    await DemandPrediction.updateMany(
      { status: 'active' },
      { status: 'archived' }
    );
    
    // Create new prediction
    const prediction = await demandPredictionService.createDemandPrediction(season);
    
    res.json({
      success: true,
      message: 'Predictions refreshed successfully',
      prediction: {
        season: prediction.season,
        medicinesAnalyzed: prediction.predictedDemandMedicines.length,
        areasAnalyzed: prediction.areaPredictions.length,
        insights: prediction.insights.length,
        alerts: prediction.alerts.length
      }
    });
  } catch (error) {
    console.error('Error refreshing predictions:', error);
    res.status(500).json({
      success: false,
      message: 'Error refreshing predictions',
      error: error.message
    });
  }
};

// Get specific area prediction
exports.getAreaDetail = async (req, res) => {
  try {
    const { areaName } = req.params;
    
    const prediction = await demandPredictionService.getActivePredictions();
    
    if (!prediction) {
      return res.status(404).json({
        success: false,
        message: 'No active predictions found'
      });
    }
    
    const areaData = prediction.areaPredictions.find(a => 
      a.area.toLowerCase() === areaName.toLowerCase()
    );
    
    if (!areaData) {
      return res.status(404).json({
        success: false,
        message: 'Area not found'
      });
    }
    
    res.json({
      success: true,
      area: areaData,
      relatedInsights: prediction.insights.filter(i => 
        i.area === areaData.area || i.type === 'area_shortage'
      ),
      relatedAlerts: prediction.alerts.filter(a => a.area === areaData.area)
    });
  } catch (error) {
    console.error('Error getting area detail:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving area details',
      error: error.message
    });
  }
};

// Get medicine-specific prediction
exports.getMedicinePrediction = async (req, res) => {
  try {
    const { medicineName } = req.params;
    
    const prediction = await demandPredictionService.getActivePredictions();
    
    if (!prediction) {
      return res.status(404).json({
        success: false,
        message: 'No active predictions found'
      });
    }
    
    const medicineData = prediction.predictedDemandMedicines.find(m => 
      m.medicineName.toLowerCase().includes(medicineName.toLowerCase())
    );
    
    if (!medicineData) {
      return res.status(404).json({
        success: false,
        message: 'Medicine prediction not found'
      });
    }
    
    res.json({
      success: true,
      medicine: medicineData,
      season: prediction.season,
      relatedInsights: prediction.insights.filter(i => 
        i.title.includes(medicineData.medicineName)
      )
    });
  } catch (error) {
    console.error('Error getting medicine prediction:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving medicine prediction',
      error: error.message
    });
  }
};

// Get trending medicines (high demand + low stock)
exports.getTrendingMedicines = async (req, res) => {
  try {
    const { latitude, longitude, limit = 10 } = req.query;
    
    // Get active prediction
    let prediction = await demandPredictionService.getActivePredictions();
    
    if (!prediction) {
      prediction = await demandPredictionService.createDemandPrediction();
    }
    
    // Get high demand medicines
    const highDemandMedicines = prediction.predictedDemandMedicines
      .filter(m => m.demandLevel === 'high' || m.confidenceScore > 0.7)
      .slice(0, limit);
    
    // Get low stock alerts
    const lowStockAlerts = prediction.alerts
      .filter(a => a.type === 'low_stock' || a.type === 'critical_shortage')
      .slice(0, limit);
    
    // Combine and format trending data
    const trending = {
      highDemand: highDemandMedicines.map(m => ({
        medicineName: m.medicineName,
        type: 'high_demand',
        icon: '🔥',
        label: 'High Demand Today',
        demandScore: m.demandScore || m.confidenceScore,
        reason: m.reason || 'Hot medicine in high demand',
        searchCount: m.searchCount || 0,
        reservationCount: m.reservationCount || 0
      })),
      lowStock: lowStockAlerts
        .filter(a => a.medicine)
        .map(a => ({
          medicineName: a.medicine,
          type: 'low_stock',
          icon: '⚠',
          label: 'Running Low in Area',
          stockLevel: a.currentStock || 0,
          urgency: a.severity || 'medium',
          affectedArea: a.area || 'Your Area',
          recommendation: a.recommendation || 'Order soon'
        }))
    };
    
    res.json({
      success: true,
      trending,
      lastUpdated: prediction.updatedAt,
      totalHighDemand: highDemandMedicines.length,
      totalLowStock: lowStockAlerts.length
    });
  } catch (error) {
    console.error('Error getting trending medicines:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving trending medicines',
      error: error.message
    });
  }
};

module.exports = exports;
