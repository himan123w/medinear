const mongoose = require('mongoose');

const PharmaAnalyticsSchema = new mongoose.Schema({
  pharmacy: { type: mongoose.Schema.Types.ObjectId, ref: 'Pharmacy', required: true },
  
  // Sales Metrics
  totalSalesAmount: { type: Number, default: 0 },
  totalUnitssSold: { type: Number, default: 0 },
  averageOrderValue: { type: Number, default: 0 },
  ordersCount: { type: Number, default: 0 },
  
  // Inventory Metrics
  totalInventoryValue: { type: Number, default: 0 },
  lowStockItems: { type: Number, default: 0 },
  outOfStockItems: { type: Number, default: 0 },
  inventoryTurnoverRate: { type: Number, default: 0 },
  
  // Customer Metrics
  totalCustomers: { type: Number, default: 0 },
  repeatCustomers: { type: Number, default: 0 },
  customerRetentionRate: { type: Number, default: 0 },
  averageCustomerLifetimeValue: { type: Number, default: 0 },
  
  // Performance Metrics
  monthlyGrowthRate: { type: Number, default: 0 },
  profitMargin: { type: Number, default: 0 },
  costOfGoodsSold: { type: Number, default: 0 },
  
  // Daily/Weekly/Monthly breakdown
  dailySales: [{
    date: Date,
    amount: Number,
    units: Number,
    orders: Number
  }],
  
  topSellingMedicines: [{
    medicineId: mongoose.Schema.Types.ObjectId,
    medicineName: String,
    unitsSold: Number,
    revenue: Number
  }],
  
  // Category-wise metrics
  categoryMetrics: [{
    category: String,
    revenue: Number,
    unitsSold: Number,
    growth: Number
  }],
  
  period: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'daily' },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

PharmaAnalyticsSchema.index({ pharmacy: 1, date: -1 });
PharmaAnalyticsSchema.index({ pharmacy: 1, period: 1 });

module.exports = mongoose.model('PharmaAnalytics', PharmaAnalyticsSchema);
