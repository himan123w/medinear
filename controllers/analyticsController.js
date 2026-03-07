const Inventory = require('../models/Inventory');
const areaHeatmapService = require('../services/areaHeatmapService');

// Simple analytics: stock levels, sales summary, and basic prediction (moving average)
exports.getStockSummary = async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    const inv = await Inventory.findOne({ pharmacy: pharmacyId });
    if (!inv) return res.json({ success: true, items: [] });

    const items = inv.items.map(i => ({
      medicineName: i.medicineName,
      quantity: i.quantity,
      reorderLevel: i.reorderLevel,
      lastRestocked: i.lastRestocked
    }));

    res.json({ success: true, items });
  } catch (err) {
    console.error('Get stock summary error', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Sales summary over last N days
exports.getSalesSummary = async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    const days = Number(req.query.days || 30);
    const inv = await Inventory.findOne({ pharmacy: pharmacyId });
    if (!inv) return res.json({ success: true, sales: [] });

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const sales = [];
    for (const i of inv.items) {
      const qty = i.salesHistory.filter(s => new Date(s.date) >= cutoff).reduce((sum, s) => sum + (s.quantity || 0), 0);
      sales.push({ medicineName: i.medicineName, sold: qty });
    }

    res.json({ success: true, sales });
  } catch (err) {
    console.error('Get sales summary error', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Basic stock prediction: average daily sales over window * leadDays -> expected consumption
exports.getStockPrediction = async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    const windowDays = Number(req.query.window || 30);
    const leadDays = Number(req.query.lead || 7);
    const inv = await Inventory.findOne({ pharmacy: pharmacyId });
    if (!inv) return res.json({ success: true, predictions: [] });

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - windowDays);

    const predictions = inv.items.map(i => {
      const totalSold = i.salesHistory.filter(s => new Date(s.date) >= cutoff).reduce((sum, s) => sum + (s.quantity || 0), 0);
      const avgDaily = windowDays > 0 ? totalSold / windowDays : 0;
      const expectedConsumption = Math.ceil(avgDaily * leadDays);
      const needsReorder = i.quantity <= (i.reorderLevel + expectedConsumption);
      return {
        medicineName: i.medicineName,
        currentStock: i.quantity,
        avgDaily,
        expectedConsumption,
        needsReorder
      };
    });

    res.json({ success: true, predictions });
  } catch (err) {
    console.error('Get stock prediction error', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get area heatmap for all zones
exports.getAreaHeatmap = async (req, res) => {
  try {
    const heatmap = await areaHeatmapService.getAreaHeatmap();
    res.json(heatmap);
  } catch (err) {
    console.error('Get area heatmap error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to generate area heatmap',
      error: err.message
    });
  }
};

// Get heatmap for specific city
exports.getCityHeatmap = async (req, res) => {
  try {
    const { city } = req.params;
    const heatmap = await areaHeatmapService.getCityHeatmap(city);
    res.json(heatmap);
  } catch (err) {
    console.error('Get city heatmap error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to generate city heatmap',
      error: err.message
    });
  }
};

// Get critical zones needing attention
exports.getCriticalZones = async (req, res) => {
  try {
    const criticalZones = await areaHeatmapService.getCriticalZones();
    res.json(criticalZones);
  } catch (err) {
    console.error('Get critical zones error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to get critical zones',
      error: err.message
    });
  }
};
