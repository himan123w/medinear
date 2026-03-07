const PharmaAnalytics = require('../models/PharmaAnalytics');
const Inventory = require('../models/Inventory');
const StockPrediction = require('../models/StockPrediction');
const Order = require('../models/Prescription'); // Using Prescription as Order proxy for now

// Get comprehensive dashboard analytics for a pharmacy
async function getDashboardAnalytics(pharmacyId) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
    
    // Get current period analytics
    const currentAnalytics = await PharmaAnalytics.findOne({
      pharmacy: pharmacyId,
      date: { $gte: thisMonthStart }
    }).sort({ date: -1 });
    
    // Get previous month analytics for comparison
    const previousAnalytics = await PharmaAnalytics.findOne({
      pharmacy: pharmacyId,
      date: { $gte: lastMonthStart, $lte: lastMonthEnd }
    }).sort({ date: -1 });
    
    // Calculate growth metrics
    const currentSales = currentAnalytics?.totalSalesAmount || 0;
    const previousSales = previousAnalytics?.totalSalesAmount || 0;
    const salesGrowth = previousSales > 0 ? ((currentSales - previousSales) / previousSales) * 100 : 0;
    
    // Get inventory status
    const inventory = await Inventory.findOne({ pharmacy: pharmacyId });
    const lowStockCount = inventory?.items.filter(item => item.quantity <= item.reorderLevel).length || 0;
    const totalInventoryValue = inventory?.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0) || 0;
    
    // Get stock predictions
    const predictions = await StockPrediction.find({ 
      pharmacy: pharmacyId,
      status: 'active'
    }).limit(10);
    
    return {
      summary: {
        totalSales: currentSales,
        ordersCount: currentAnalytics?.ordersCount || 0,
        averageOrderValue: currentAnalytics?.averageOrderValue || 0,
        profitMargin: currentAnalytics?.profitMargin || 0,
        salesGrowth: salesGrowth.toFixed(2),
        inventoryValue: totalInventoryValue.toFixed(2)
      },
      inventory: {
        totalItems: inventory?.items.length || 0,
        lowStockItems: lowStockCount,
        outOfStockItems: inventory?.items.filter(item => item.quantity === 0).length || 0,
        inventoryTurnover: currentAnalytics?.inventoryTurnoverRate || 0
      },
      customers: {
        total: currentAnalytics?.totalCustomers || 0,
        repeat: currentAnalytics?.repeatCustomers || 0,
        retentionRate: currentAnalytics?.customerRetentionRate || 0,
        averageLifetimeValue: currentAnalytics?.averageCustomerLifetimeValue.toFixed(2) || 0
      },
      topProducts: currentAnalytics?.topSellingMedicines || [],
      categoryMetrics: currentAnalytics?.categoryMetrics || [],
      predictions: predictions || [],
      alerts: extractAlerts(predictions, inventory)
    };
  } catch (error) {
    console.error('Error getting dashboard analytics:', error);
    throw error;
  }
}

// Calculate and update analytics for a pharmacy
async function calculateAnalytics(pharmacyId) {
  try {
    const inventory = await Inventory.findOne({ pharmacy: pharmacyId });
    
    // Aggregate sales data from last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const analyticsRecords = await PharmaAnalytics.find({
      pharmacy: pharmacyId,
      date: { $gte: thirtyDaysAgo }
    });
    
    // Aggregate metrics
    let totalSales = 0;
    let totalUnits = 0;
    let totalOrders = 0;
    const medicineMap = {};
    
    analyticsRecords.forEach(record => {
      totalSales += record.totalSalesAmount;
      totalUnits += record.totalUnitssSold;
      totalOrders += record.ordersCount;
      
      record.topSellingMedicines.forEach(med => {
        if (!medicineMap[med.medicineName]) {
          medicineMap[med.medicineName] = { ...med };
        } else {
          medicineMap[med.medicineName].unitsSold += med.unitsSold;
          medicineMap[med.medicineName].revenue += med.revenue;
        }
      });
    });

    const topMedicines = Object.values(medicineMap)
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 10);
    
    // Calculate inventory metrics

    let outOfStockCount = 0;
    let totalInventoryValue = 0;
    
    if (inventory) {
      inventory.items.forEach(item => {
        if (item.quantity <= item.reorderLevel && item.quantity > 0) lowStockCount++;
        if (item.quantity === 0) outOfStockCount++;
        totalInventoryValue += item.quantity * item.unitPrice;
      });
    }
    
    // Create new analytics record
    const analytics = new PharmaAnalytics({
      pharmacy: pharmacyId,
      totalSalesAmount: totalSales,
      totalUnitssSold: totalUnits,
      ordersCount: totalOrders,
      averageOrderValue: totalOrders > 0 ? totalSales / totalOrders : 0,
      lowStockItems: lowStockCount,
      outOfStockItems: outOfStockCount,
      totalInventoryValue: totalInventoryValue,
      topSellingMedicines: topMedicines,
      monthlyGrowthRate: calculateGrowthRate(analyticsRecords),
      profitMargin: calculateProfitMargin(totalSales),
      period: 'daily',
      date: new Date()
    });
    
    await analytics.save();
    return analytics;
  } catch (error) {
    console.error('Error calculating analytics:', error);
    throw error;
  }
}

// Get sales trend data for charts
async function getSalesTrend(pharmacyId, days = 30) {
  try {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const analytics = await PharmaAnalytics.find({
      pharmacy: pharmacyId,
      date: { $gte: startDate }
    }).sort({ date: 1 });
    
    return analytics.map(record => ({
      date: record.date,
      sales: record.totalSalesAmount,
      orders: record.ordersCount,
      units: record.totalUnitssSold,
      margin: record.profitMargin
    }));
  } catch (error) {
    console.error('Error getting sales trend:', error);
    throw error;
  }
}

// Get inventory health overview
async function getInventoryHealth(pharmacyId) {
  try {
    const inventory = await Inventory.findOne({ pharmacy: pharmacyId });
    
    if (!inventory) {
      return {
        totalItems: 0,
        healthScore: 0,
        criticalItems: [],
        slowMovingItems: [],
        optimization: {}
      };
    }
    
    let healthScore = 100;
    const criticalItems = [];
    const slowMovingItems = [];
    
    inventory.items.forEach(item => {
      // Critical if out of stock
      if (item.quantity === 0) {
        healthScore -= 2;
        criticalItems.push(item);
      }
      // Low stock
      else if (item.quantity <= item.reorderLevel) {
        healthScore -= 0.5;
      }
      
      // Check if slow moving
      if (item.salesHistory && item.salesHistory.length > 0) {
        const monthlyAvg = item.salesHistory
          .filter(s => s.date >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
          .reduce((sum, s) => sum + s.quantity, 0) / 30;
        
        if (monthlyAvg < 1 && item.quantity > item.reorderLevel) {
          slowMovingItems.push({
            ...item,
            monthlyAverage: monthlyAvg
          });
        }
      }
    });
    
    healthScore = Math.max(0, Math.min(100, healthScore));
    
    return {
      totalItems: inventory.items.length,
      healthScore: Math.round(healthScore),
      criticalItems: criticalItems.slice(0, 5),
      slowMovingItems: slowMovingItems.slice(0, 5),
      optimization: {
        reduceSlowMoving: slowMovingItems.length,
        restockCritical: criticalItems.length,
        potentialSavings: calculatePotentialSavings(slowMovingItems)
      }
    };
  } catch (error) {
    console.error('Error getting inventory health:', error);
    throw error;
  }
}

// Helper functions
function calculateGrowthRate(records) {
  if (records.length < 2) return 0;
  const firstHalf = records.slice(0, Math.floor(records.length / 2));
  const secondHalf = records.slice(Math.floor(records.length / 2));
  
  const firstHalfAvg = firstHalf.reduce((sum, r) => sum + r.totalSalesAmount, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, r) => sum + r.totalSalesAmount, 0) / secondHalf.length;
  
  return firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0;
}

function calculateProfitMargin(totalSales) {
  // Simplified: assume 30% profit margin on average
  // In real scenario, this would come from actual cost data
  return totalSales > 0 ? 30 : 0;
}

function calculatePotentialSavings(slowMovingItems) {
  return slowMovingItems.reduce((sum, item) => {
    // Potential savings from reducing slow-moving inventory
    return sum + (item.quantity * 0.5 * item.unitPrice);
  }, 0);
}

function extractAlerts(predictions, inventory) {
  const alerts = [];
  
  // Stock prediction alerts
  predictions.forEach(pred => {
    if (pred.alerts) {
      pred.alerts.forEach(alert => {
        alerts.push({
          type: alert.type || alert,
          severity: alert.type === 'low_stock' ? 'high' : 'medium',
          medicine: pred.medicineName,
          message: getAlertMessage(alert.type || alert, pred),
          timestamp: alert.createdAt
        });
      });
    }
  });
  
  return alerts.slice(0, 5); // Top 5 alerts
}

function getAlertMessage(alertType, prediction) {
  const messages = {
    low_stock: `${prediction.medicineName} stock is low. Recommended reorder: ${prediction.recommendedOrderQuantity} units`,
    high_demand: `${prediction.medicineName} demand is increasing. Consider increasing stock levels`,
    slow_moving: `${prediction.medicineName} is moving slowly. Monitor for potential clearance`,
    excess_stock: `${prediction.medicineName} has excess stock. Review pricing or promotion strategy`
  };
  return messages[alertType] || 'New alert for ' + prediction.medicineName;
}

module.exports = {
  getDashboardAnalytics,
  calculateAnalytics,
  getSalesTrend,
  getInventoryHealth
};
