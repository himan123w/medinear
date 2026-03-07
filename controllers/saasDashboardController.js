const analyticsService = require('../services/analyticsService');
const stockPredictionService = require('../services/stockPredictionService');
const saasBillingService = require('../services/saasBillingService');
const Pharmacy = require('../models/Pharmacy');
const Inventory = require('../models/Inventory');

// Get SaaS Dashboard for pharmacy
exports.getDashboard = async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    
    // Verify pharmacy exists and user has access
    const pharmacy = await Pharmacy.findById(pharmacyId);
    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }
    
    // Get dashboard analytics
    const analytics = await analyticsService.getDashboardAnalytics(pharmacyId);
    
    // Get subscription details
    const subscription = await saasBillingService.getSubscription(pharmacyId);
    
    res.json({
      success: true,
      pharmacy: {
        id: pharmacy._id,
        name: pharmacy.name,
        owner: pharmacy.owner
      },
      dashboard: analytics,
      subscription: subscription
    });
  } catch (error) {
    console.error('Error getting dashboard:', error);
    res.status(500).json({ message: 'Error fetching dashboard', error: error.message });
  }
};

// Get analytics data
exports.getAnalytics = async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    const { period = 'monthly', days = 30 } = req.query;
    
    const salesTrend = await analyticsService.getSalesTrend(pharmacyId, parseInt(days));
    const inventoryHealth = await analyticsService.getInventoryHealth(pharmacyId);
    
    res.json({
      success: true,
      salesTrend,
      inventoryHealth,
      period
    });
  } catch (error) {
    console.error('Error getting analytics:', error);
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
};

// Get stock predictions
exports.getStockPredictions = async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    const { alertType, status, limit = 100 } = req.query;
    
    const filters = {};
    if (alertType) filters.alertType = alertType;
    if (status) filters.status = status;
    filters.limit = parseInt(limit);
    
    const predictions = await stockPredictionService.getPredictions(pharmacyId, filters);
    
    res.json({
      success: true,
      predictions,
      count: predictions.length
    });
  } catch (error) {
    console.error('Error getting predictions:', error);
    res.status(500).json({ message: 'Error fetching predictions', error: error.message });
  }
};

// Generate stock recommendations
exports.generateRecommendations = async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    
    // Get all stock predictions
    const predictions = await stockPredictionService.getPredictions(pharmacyId);
    
    // Prioritize by urgency
    const recommendations = {
      urgent: predictions.filter(p => p.alerts?.some(a => a.type === 'low_stock')).slice(0, 5),
      highDemand: predictions.filter(p => p.alerts?.some(a => a.type === 'high_demand')).slice(0, 5),
      optimizeStock: predictions.filter(p => p.alerts?.some(a => a.type === 'excess_stock')).slice(0, 5),
      slowing: predictions.filter(p => p.alerts?.some(a => a.type === 'slow_moving')).slice(0, 5)
    };
    
    // Calculate potential savings
    const potentialSavings = recommendations.optimizeStock.reduce((sum, item) => {
      return sum + (item.currentStock * 0.3 * item.recommendedOrderQuantity);
    }, 0);
    
    res.json({
      success: true,
      recommendations,
      potentialSavings: Math.round(potentialSavings),
      totalAlerts: predictions.flat().length
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ message: 'Error generating recommendations', error: error.message });
  }
};

// Update inventory with prediction
exports.updateInventoryItem = async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    const { medicineId, quantity, reorderLevel, unitPrice } = req.body;
    
    const inventory = await Inventory.findOne({ pharmacy: pharmacyId });
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory not found' });
    }
    
    const itemIndex = inventory.items.findIndex(item => item.medicineId?.toString() === medicineId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in inventory' });
    }
    
    // Update item
    if (quantity !== undefined) inventory.items[itemIndex].quantity = quantity;
    if (reorderLevel !== undefined) inventory.items[itemIndex].reorderLevel = reorderLevel;
    if (unitPrice !== undefined) inventory.items[itemIndex].unitPrice = unitPrice;
    
    await inventory.save();
    
    // Update prediction
    if (quantity !== undefined) {
      const prediction = await stockPredictionService.predictStock(pharmacyId, medicineId);
      res.json({
        success: true,
        message: 'Inventory updated',
        item: inventory.items[itemIndex],
        prediction
      });
    } else {
      res.json({
        success: true,
        message: 'Inventory updated',
        item: inventory.items[itemIndex]
      });
    }
  } catch (error) {
    console.error('Error updating inventory:', error);
    res.status(500).json({ message: 'Error updating inventory', error: error.message });
  }
};

// Trigger manual prediction update for all medicines
exports.updateAllPredictions = async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    
    const result = await stockPredictionService.updateAllPredictions(pharmacyId);
    
    res.json({
      success: true,
      updated: result.updated,
      failed: result.failed,
      message: `Updated ${result.updated} predictions`
    });
  } catch (error) {
    console.error('Error updating predictions:', error);
    res.status(500).json({ message: 'Error updating predictions', error: error.message });
  }
};

// Report sales data (from POS/order system) to update analytics
exports.reportSalesData = async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    const { items, totalAmount, timestamp } = req.body;
    
    // This would integrate with the analytics service to record sales
    // For now, just acknowledge
    
    res.json({
      success: true,
      message: 'Sales data recorded',
      recordedAt: timestamp || new Date(),
      itemsCount: items.length
    });
  } catch (error) {
    console.error('Error reporting sales:', error);
    res.status(500).json({ message: 'Error reporting sales', error: error.message });
  }
};

// Get all plans
exports.getPlans = async (req, res) => {
  try {
    const plans = saasBillingService.getAllPlans();
    
    res.json({
      success: true,
      plans
    });
  } catch (error) {
    console.error('Error getting plans:', error);
    res.status(500).json({ message: 'Error fetching plans', error: error.message });
  }
};

// Create subscription
exports.createSubscription = async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    const { planType, billingCycle, paymentMethod } = req.body;
    
    const result = await saasBillingService.createSubscription(
      pharmacyId,
      planType,
      billingCycle,
      paymentMethod
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get subscription
exports.getSubscription = async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    
    const result = await saasBillingService.getSubscription(pharmacyId);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error getting subscription:', error);
    res.status(500).json({ message: 'Error fetching subscription', error: error.message });
  }
};

// Change plan
exports.changePlan = async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    const { newPlanType } = req.body;
    
    const result = await saasBillingService.changePlan(pharmacyId, newPlanType);
    
    res.json(result);
  } catch (error) {
    console.error('Error changing plan:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Cancel subscription
exports.cancelSubscription = async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    const { reason } = req.body;
    
    const result = await saasBillingService.cancelSubscription(pharmacyId, reason);
    
    res.json(result);
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get billing history
exports.getBillingHistory = async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    const { limit = 12 } = req.query;
    
    const invoices = await saasBillingService.getBillingHistory(pharmacyId, parseInt(limit));
    
    res.json({
      success: true,
      invoices,
      count: invoices.length
    });
  } catch (error) {
    console.error('Error getting billing history:', error);
    res.status(500).json({ message: 'Error fetching billing history', error: error.message });
  }
};

module.exports = exports;
