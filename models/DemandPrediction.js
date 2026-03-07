const mongoose = require('mongoose');

const DemandPredictionSchema = new mongoose.Schema({
  // Seasonal Demand Predictions
  season: { 
    type: String, 
    enum: ['winter', 'summer', 'monsoon', 'spring'],
    required: true 
  },
  
  predictedDemandMedicines: [{
    medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
    medicineName: { type: String, required: true },
    category: { type: String },
    currentDemand: { type: Number, default: 0 },
    predictedDemand: { type: Number, required: true },
    demandIncrease: { type: Number, default: 0, description: 'Percentage increase' },
    confidenceScore: { type: Number, min: 0, max: 100, default: 0 },
    reason: { type: String }, // e.g., "Cold & Flu season", "Allergy season"
    historicalPattern: {
      lastYear: Number,
      twoYearsAgo: Number,
      average: Number
    }
  }],
  
  // Geographic/Area Predictions
  areaPredictions: [{
    area: { type: String, required: true }, // e.g., "North Zone", "South Delhi", etc.
    pharmacyCount: { type: Number, default: 0 },
    predictedDemand: { type: Number, required: true },
    currentSupply: { type: Number, default: 0 },
    shortfall: { type: Number, default: 0 },
    recommendedStock: { type: Number, default: 0 },
    topMedicines: [{
      medicineName: String,
      predictedUnits: Number
    }],
    demographics: {
      population: Number,
      ageGroupDistribution: Map,
      commonConditions: [String]
    },
    riskLevel: { 
      type: String, 
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low'
    }
  }],
  
  // AI Model Metadata
  modelVersion: { type: String, default: '2.0' },
  algorithm: { 
    type: String, 
    default: 'lstm_ensemble',
    description: 'LSTM + Seasonal ARIMA + Random Forest'
  },
  
  // Prediction Accuracy
  accuracy: {
    overall: { type: Number, min: 0, max: 100, default: 0 },
    seasonal: { type: Number, min: 0, max: 100, default: 0 },
    geographic: { type: Number, min: 0, max: 100, default: 0 }
  },
  
  // Training Data
  trainingDataPoints: { type: Number, default: 0 },
  dataSourcePeriod: {
    startDate: Date,
    endDate: Date,
    daysCount: Number
  },
  lastTrainedAt: { type: Date, default: Date.now },
  
  // Insights & Recommendations
  insights: [{
    type: { 
      type: String, 
      enum: ['seasonal_trend', 'area_shortage', 'emerging_demand', 'price_opportunity']
    },
    title: String,
    description: String,
    actionItems: [String],
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    createdAt: { type: Date, default: Date.now }
  }],
  
  // Alerts
  alerts: [{
    severity: { type: String, enum: ['info', 'warning', 'critical'], default: 'info' },
    message: String,
    area: String,
    medicineName: String,
    actionRequired: String,
    createdAt: { type: Date, default: Date.now }
  }],
  
  validFrom: { type: Date, default: Date.now },
  validUntil: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['active', 'archived', 'draft'],
    default: 'active'
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

DemandPredictionSchema.index({ season: 1, status: 1 });
DemandPredictionSchema.index({ validFrom: 1, validUntil: 1 });
DemandPredictionSchema.index({ 'areaPredictions.area': 1 });

module.exports = mongoose.model('DemandPrediction', DemandPredictionSchema);
