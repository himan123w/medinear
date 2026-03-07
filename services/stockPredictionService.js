const StockPrediction = require('../models/StockPrediction');
const Inventory = require('../models/Inventory');
const PharmaAnalytics = require('../models/PharmaAnalytics');

// Main prediction function using moving average
async function predictStock(pharmacyId, medicineId) {
  try {
    const inventory = await Inventory.findOne({ pharmacy: pharmacyId });
    const medicineItem = inventory?.items.find(item => item.medicineId?.toString() === medicineId);
    
    if (!medicineItem) {
      throw new Error('Medicine not found in inventory');
    }
    
    // Get historical sales data (last 60 days)
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const analyticsRecords = await PharmaAnalytics.find({
      pharmacy: pharmacyId,
      date: { $gte: sixtyDaysAgo }
    }).sort({ date: -1 });
    
    // Extract sales data for this medicine
    const salesData = [];
    analyticsRecords.forEach(record => {
      const medicine = record.topSellingMedicines.find(m => m.medicineId?.toString() === medicineId);
      if (medicine) {
        salesData.push(medicine.unitsSold);
      }
    });
    
    // Calculate prediction metrics
    const predictions = calculatePredictions(salesData, medicineItem, pharmacyId);
    
    return predictions;
  } catch (error) {
    console.error('Error predicting stock:', error);
    throw error;
  }
}

// Calculate various prediction algorithms
function calculatePredictions(salesData, medicineItem, pharmacyId) {
  if (salesData.length === 0) {
    return {
      algorithm: 'insufficient_data',
      predictedWeeklyDemand: 0,
      predictedMonthlyDemand: 0,
      stockOutDate: null,
      recommendedOrderQuantity: medicineItem.reorderLevel * 2,
      recommendedOrderDate: new Date(),
      accuracy: 0,
      status: 'low_data'
    };
  }
  
  // 1. Moving Average (7-day and 30-day)
  const sevenDayAverage = getMovingAverage(salesData.slice(0, 7), 7);
  const thirtyDayAverage = getMovingAverage(salesData, 30);
  
  // 2. Exponential Smoothing
  const smoothed = exponentialSmoothing(salesData, 0.3);
  
  // 3. Linear Regression for trend
  const regression = linearRegression(salesData);
  
  // Weighted average of predictions
  const predictedWeeklyDemand = (sevenDayAverage * 7 * 0.4 + smoothed * 0.3 + (regression.slope * 7 + regression.intercept) * 0.3);
  const predictedMonthlyDemand = (thirtyDayAverage * 0.5 + smoothed * 30 * 0.3 + (regression.slope * 30 + regression.intercept) * 0.2);
  
  // Calculate stock-out date
  const dailyAverage = predictedWeeklyDemand / 7;
  const daysUntilStockOut = medicineItem.quantity / Math.max(dailyAverage, 0.1);
  const stockOutDate = new Date(Date.now() + daysUntilStockOut * 24 * 60 * 60 * 1000);
  
  // Recommended order quantity (EOQ approximation)
  const holdingCost = 0.25; // 25% of unit price per year
  const orderingCost = 100; // Fixed cost per order
  const safetyStock = medicineItem.safetyStock || 10;
  const leadTimeDemand = (predictedWeeklyDemand / 7) * medicineItem.leadTime;
  const recommendedOrderQuantity = Math.ceil(
    Math.sqrt((2 * (predictedMonthlyDemand * 12) * orderingCost) / (medicineItem.unitPrice * holdingCost))
  );
  
  // Calculate when to reorder
  const reorderPoint = safetyStock + leadTimeDemand;
  const daysToReorder = Math.max(0, (medicineItem.quantity - reorderPoint) / dailyAverage);
  const recommendedOrderDate = new Date(Date.now() + daysToReorder * 24 * 60 * 60 * 1000);
  
  // Calculate accuracy (based on variance in historical data)
  const variance = calculateVariance(salesData);
  const mean = salesData.reduce((a, b) => a + b) / salesData.length;
  const coefficientOfVariation = mean > 0 ? (Math.sqrt(variance) / mean) * 100 : 0;
  const accuracy = Math.max(50, 100 - coefficientOfVariation);
  
  // Determine trend
  const trend = regression.slope > 5 ? 'increasing' : (regression.slope < -5 ? 'decreasing' : 'stable');
  const trendPercentage = regression.slope;
  
  // Generate alerts
  const alerts = generateAlerts(medicineItem, daysUntilStockOut, trend, recommendedOrderQuantity);
  
  return {
    pharmacy: pharmacyId,
    medicineId: medicineItem.medicineId,
    medicineName: medicineItem.medicineName,
    currentStock: medicineItem.quantity,
    reorderLevel: medicineItem.reorderLevel,
    
    predictedWeeklyDemand: Math.round(predictedWeeklyDemand * 100) / 100,
    predictedMonthlyDemand: Math.round(predictedMonthlyDemand * 100) / 100,
    averageDailySales: Math.round(dailyAverage * 100) / 100,
    averageWeeklySales: Math.round(sevenDayAverage * 100) / 100,
    averageMonthlySales: Math.round(thirtyDayAverage * 100) / 100,
    
    stockOutDate: daysUntilStockOut < 1000 ? stockOutDate : null,
    recommendedOrderQuantity: recommendedOrderQuantity,
    recommendedOrderDate: recommendedOrderDate,
    
    salesTrend: trend,
    trendPercentage: Math.round(trendPercentage * 100) / 100,
    
    predictionAccuracy: Math.round(accuracy),
    algorithm: 'moving_average_exponential_smoothing',
    alerts: alerts,
    status: getDeterminedStatus(medicineItem, daysUntilStockOut, coefficientOfVariation),
    
    trainingDataPoints: salesData.length,
    lastPredictionDate: new Date()
  };
}

// Moving Average Calculation
function getMovingAverage(data, period) {
  if (data.length === 0) return 0;
  const windowSize = Math.min(period, data.length);
  const sum = data.slice(0, windowSize).reduce((a, b) => a + b, 0);
  return sum / windowSize;
}

// Exponential Smoothing
function exponentialSmoothing(data, alpha = 0.3) {
  if (data.length === 0) return 0;
  let result = data[0];
  for (let i = 1; i < data.length; i++) {
    result = alpha * data[i] + (1 - alpha) * result;
  }
  return result;
}

// Linear Regression
function linearRegression(data) {
  const n = data.length;
  if (n === 0) return { slope: 0, intercept: 0 };
  
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += data[i];
    sumXY += i * data[i];
    sumX2 += i * i;
  }
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  return { slope, intercept };
}

// Variance calculation
function calculateVariance(data) {
  const mean = data.reduce((a, b) => a + b) / data.length;
  const squareDiffs = data.map(value => Math.pow(value - mean, 2));
  return squareDiffs.reduce((a, b) => a + b) / data.length;
}

// Generate alerts based on predictions
function generateAlerts(medicineItem, daysUntilStockOut, trend, recommendedQuantity) {
  const alerts = [];
  
  if (medicineItem.quantity <= medicineItem.reorderLevel) {
    alerts.push({
      type: 'low_stock',
      description: `Current stock (${medicineItem.quantity}) is below reorder level (${medicineItem.reorderLevel})`
    });
  }
  
  if (daysUntilStockOut < 7) {
    alerts.push({
      type: 'low_stock',
      description: `Stock will run out in ${Math.round(daysUntilStockOut)} days. Order immediately!`
    });
  }
  
  if (trend === 'increasing') {
    alerts.push({
      type: 'high_demand',
      description: 'Demand is increasing. Consider increasing reorder levels'
    });
  }
  
  if (medicineItem.quantity > medicineItem.reorderLevel * 5) {
    alerts.push({
      type: 'excess_stock',
      description: `Stock is significantly above reorder level. Review pricing or promotions`
    });
  }
  
  return alerts;
}

// Determine status based on multiple factors
function getDeterminedStatus(medicineItem, daysUntilStockOut, coefficientOfVariation) {
  if (coefficientOfVariation > 100) return 'low_data';
  if (medicineItem.quantity === 0) return 'active';
  return 'active';
}

// Update all predictions for a pharmacy
async function updateAllPredictions(pharmacyId) {
  try {
    const inventory = await Inventory.findOne({ pharmacy: pharmacyId });
    
    if (!inventory || inventory.items.length === 0) {
      return { updated: 0, failed: 0 };
    }
    
    let updated = 0;
    let failed = 0;
    
    for (const item of inventory.items) {
      try {
        const prediction = await predictStock(pharmacyId, item.medicineId);
        
        await StockPrediction.findOneAndUpdate(
          { pharmacy: pharmacyId, medicineId: item.medicineId },
          prediction,
          { upsert: true, new: true }
        );
        
        updated++;
      } catch (error) {
        console.error(`Failed to predict for medicine ${item.medicineName}:`, error);
        failed++;
      }
    }
    
    return { updated, failed };
  } catch (error) {
    console.error('Error updating all predictions:', error);
    throw error;
  }
}

// Get predictions for pharmacy
async function getPredictions(pharmacyId, filters = {}) {
  try {
    const query = { pharmacy: pharmacyId };
    
    if (filters.status) query.status = filters.status;
    if (filters.alertType) query.alerts = { $elemMatch: { type: filters.alertType } };
    
    const predictions = await StockPrediction.find(query)
      .sort({ stockOutDate: 1, updatedAt: -1 })
      .limit(filters.limit || 100);
    
    return predictions;
  } catch (error) {
    console.error('Error getting predictions:', error);
    throw error;
  }
}

module.exports = {
  predictStock,
  updateAllPredictions,
  getPredictions,
  calculatePredictions
};
