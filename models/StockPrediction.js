const mongoose = require('mongoose');

const StockPredictionSchema = new mongoose.Schema({
  pharmacy: { type: mongoose.Schema.Types.ObjectId, ref: 'Pharmacy', required: true },
  medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
  medicineName: { type: String, required: true },
  
  // Current Status
  currentStock: { type: Number, required: true },
  reorderLevel: { type: Number, required: true },
  safetyStock: { type: Number, default: 10 },
  leadTime: { type: Number, default: 3, description: 'Days to receive order' },
  
  // Predictions
  predictedMonthlyDemand: { type: Number, default: 0 },
  predictedWeeklyDemand: { type: Number, default: 0 },
  stockOutDate: { type: Date, description: 'Predicted date when stock will be 0' },
  recommendedOrderQuantity: { type: Number, default: 0 },
  recommendedOrderDate: { type: Date, description: 'When to place order' },
  
  // Historical Data
  averageDailySales: { type: Number, default: 0 },
  averageWeeklySales: { type: Number, default: 0 },
  averageMonthlySales: { type: Number, default: 0 },
  salesTrend: { type: String, enum: ['stable', 'increasing', 'decreasing'], default: 'stable' },
  trendPercentage: { type: Number, default: 0 },
  
  // Seasonal Data
  seasonalityIndex: { type: Number, default: 1.0 },
  peak_months: [Number], // 0-11 for Jan-Dec
  
  // Accuracy Metrics
  predictionAccuracy: { type: Number, default: 0, min: 0, max: 100 },
  lastPredictionDate: Date,
  
  // Alerts
  alerts: [{
    type: String,
    enum: ['low_stock', 'high_demand', 'slow_moving', 'excess_stock'],
    description: String,
    createdAt: { type: Date, default: Date.now }
  }],
  
  // AI Model Version
  modelVersion: { type: String, default: '1.0' },
  algorithm: { type: String, enum: ['linear_regression', 'moving_average', 'exponential_smoothing'], default: 'moving_average' },
  
  // ML Training Data
  trainingDataPoints: { type: Number, default: 0 },
  lastTrainedAt: Date,
  
  status: { type: String, enum: ['active', 'inactive', 'low_data'], default: 'active' },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

StockPredictionSchema.index({ pharmacy: 1, medicineId: 1 });
StockPredictionSchema.index({ pharmacy: 1, status: 1 });
StockPredictionSchema.index({ stockOutDate: 1 });

module.exports = mongoose.model('StockPrediction', StockPredictionSchema);
