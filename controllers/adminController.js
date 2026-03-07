const User = require('../models/User');
const Pharmacy = require('../models/Pharmacy');
const Medicine = require('../models/Medicine');
const Reservation = require('../models/Reservation');
const FeatureHealth = require('../models/FeatureHealth');
const { FEATURE_DEFINITIONS } = require('../middleware/featureHealthTracker');
const { formatSuccessResponse, formatErrorResponse } = require('../middleware/responseFormatter');

function parseDateRange(query = {}) {
  const { startDate, endDate } = query;
  const createdAt = {};

  if (startDate) {
    const start = new Date(startDate);
    if (!Number.isNaN(start.getTime())) {
      createdAt.$gte = start;
    }
  }

  if (endDate) {
    const end = new Date(endDate);
    if (!Number.isNaN(end.getTime())) {
      // Include complete end day in local timezone.
      end.setHours(23, 59, 59, 999);
      createdAt.$lte = end;
    }
  }

  if (!createdAt.$gte && !createdAt.$lte) {
    return {};
  }

  return { createdAt };
}

function buildCriticalAlerts(stats = {}) {
  const alerts = [];
  const totalReservations = stats.totalReservations || 0;
  const cancellationRate = totalReservations
    ? Number(((stats.cancelledReservations || 0) / totalReservations * 100).toFixed(1))
    : 0;

  if (stats.lowStockMedicines > 0) {
    alerts.push({
      severity: 'critical',
      title: 'Low Stock Risk',
      message: `${stats.lowStockMedicines} medicines are below alert level.`,
      action: 'Review inventory and restock high-demand medicines.'
    });
  }

  if ((stats.featureHealth?.criticalFeatures || 0) > 0) {
    alerts.push({
      severity: 'critical',
      title: 'Feature Reliability Risk',
      message: `${stats.featureHealth.criticalFeatures} platform features are currently critical.`,
      action: 'Check failing APIs in Feature Health table and resolve errors.'
    });
  }

  if (cancellationRate >= 20) {
    alerts.push({
      severity: 'warning',
      title: 'High Cancellation Rate',
      message: `Reservation cancellation rate is ${cancellationRate}%.`,
      action: 'Audit pharmacy fulfillment delays and unavailable stock.'
    });
  }

  if ((stats.featureHealth?.unknownFeatures || 0) > 0) {
    alerts.push({
      severity: 'info',
      title: 'Untracked Feature Traffic',
      message: `${stats.featureHealth.unknownFeatures} features have no recent traffic.`,
      action: 'Run feature traffic seeding or QA flows before launch.'
    });
  }

  return alerts;
}

function buildFeatureHealthSummary(featureMetrics = []) {
  const metricsMap = new Map(featureMetrics.map((item) => [item.featureKey, item]));

  const features = FEATURE_DEFINITIONS.map((definition) => {
    const metric = metricsMap.get(definition.key);
    const totalHits = metric?.totalHits || 0;
    const successHits = metric?.successHits || 0;
    const serverErrorHits = metric?.serverErrorHits || 0;
    const totalResponseTimeMs = metric?.totalResponseTimeMs || 0;
    const successRate = totalHits ? Number(((successHits / totalHits) * 100).toFixed(2)) : 0;
    const averageResponseTimeMs = totalHits ? Number((totalResponseTimeMs / totalHits).toFixed(2)) : 0;

    let status = 'unknown';
    if (totalHits > 0) {
      if (successRate >= 95 && serverErrorHits === 0) {
        status = 'healthy';
      } else if (successRate >= 85) {
        status = 'warning';
      } else {
        status = 'critical';
      }
    }

    return {
      featureKey: definition.key,
      featureName: definition.name,
      routePattern: definition.routePattern,
      status,
      totalHits,
      successRate,
      averageResponseTimeMs,
      lastStatusCode: metric?.lastStatusCode || null,
      lastHitAt: metric?.lastHitAt || null
    };
  });

  const healthyFeatures = features.filter((item) => item.status === 'healthy').length;
  const warningFeatures = features.filter((item) => item.status === 'warning').length;
  const criticalFeatures = features.filter((item) => item.status === 'critical').length;
  const unknownFeatures = features.filter((item) => item.status === 'unknown').length;
  const trackedFeatures = features.length;
  const knownFeatures = trackedFeatures - unknownFeatures;
  const overallSuccessRate = knownFeatures
    ? Number(
        (
          features
            .filter((item) => item.status !== 'unknown')
            .reduce((sum, item) => sum + item.successRate, 0) / knownFeatures
        ).toFixed(2)
      )
    : 0;

  return {
    trackedFeatures,
    healthyFeatures,
    warningFeatures,
    criticalFeatures,
    unknownFeatures,
    overallSuccessRate,
    features
  };
}

/**
 * Admin Dashboard - Get Statistics (Optimized with Aggregation)
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const dateRangeFilter = parseDateRange(req.query);

    // Use Promise.all to fetch all counts in parallel instead of sequentially
    const [
      totalUsers,
      totalPharmacies,
      totalMedicines,
      totalReservations,
      reservationStats,
      featureHealthMetrics,
      lowStockMedicines
    ] = await Promise.all([
      User.countDocuments(dateRangeFilter),
      Pharmacy.countDocuments(dateRangeFilter),
      Medicine.countDocuments(dateRangeFilter),
      Reservation.countDocuments(dateRangeFilter),
      Reservation.aggregate([
        {
          $match: dateRangeFilter
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      FeatureHealth.find({})
        .select('featureKey totalHits successHits serverErrorHits totalResponseTimeMs lastStatusCode lastHitAt')
        .lean(),
      Medicine.aggregate([
        {
          $match: dateRangeFilter
        },
        {
          $match: {
            $expr: {
              $lte: ['$stock', '$stockAlert']
            }
          }
        },
        {
          $count: 'count'
        }
      ]).then((rows) => rows?.[0]?.count || 0)
    ]);

    // Process reservation stats
    const reservationMap = {};
    reservationStats.forEach(stat => {
      reservationMap[stat._id] = stat.count;
    });

    const featureHealth = buildFeatureHealthSummary(featureHealthMetrics);
    const criticalAlerts = buildCriticalAlerts({
      totalReservations,
      cancelledReservations: reservationMap['cancelled'] || 0,
      lowStockMedicines,
      featureHealth
    });

    res.json(
      formatSuccessResponse({
        totalUsers,
        totalPharmacies,
        totalMedicines,
        lowStockMedicines,
        totalReservations,
        activeReservations: reservationMap['active'] || 0,
        completedReservations: reservationMap['completed'] || 0,
        cancelledReservations: reservationMap['cancelled'] || 0,
        featureHealth,
        criticalAlerts,
        dateRange: {
          startDate: req.query.startDate || null,
          endDate: req.query.endDate || null
        },
        timestamp: new Date()
      }, 'Dashboard stats fetched successfully')
    );
  } catch (error) {
    res.status(500).json(formatErrorResponse(error.message));
  }
};

/**
 * Get all users
 */
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (page - 1) * limit;
    const dateRangeFilter = parseDateRange(req.query);

    const query = search
      ? { ...dateRangeFilter, $or: [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }, { phone: new RegExp(search, 'i') }] }
      : { ...dateRangeFilter };

    const users = await User.find(query)
      .select('-password')
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json(
      formatSuccessResponse({
        users,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      })
    );
  } catch (error) {
    res.status(500).json(formatErrorResponse(error.message));
  }
};

/**
 * Get all pharmacies
 */
exports.getAllPharmacies = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (page - 1) * limit;
    const dateRangeFilter = parseDateRange(req.query);

    const query = search
      ? { ...dateRangeFilter, name: new RegExp(search, 'i') }
      : { ...dateRangeFilter };

    const pharmacies = await Pharmacy.find(query)
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Pharmacy.countDocuments(query);

    res.json(
      formatSuccessResponse({
        pharmacies,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      })
    );
  } catch (error) {
    res.status(500).json(formatErrorResponse(error.message));
  }
};

/**
 * Get all medicines
 */
exports.getAllMedicines = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (page - 1) * limit;
    const dateRangeFilter = parseDateRange(req.query);

    const query = search
      ? { ...dateRangeFilter, name: new RegExp(search, 'i') }
      : { ...dateRangeFilter };

    const medicines = await Medicine.find(query)
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Medicine.countDocuments(query);

    res.json(
      formatSuccessResponse({
        medicines,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      })
    );
  } catch (error) {
    res.status(500).json(formatErrorResponse(error.message));
  }
};

/**
 * Delete user
 */
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    await User.findByIdAndDelete(userId);
    res.json(formatSuccessResponse({ message: 'User deleted successfully' }));
  } catch (error) {
    res.status(500).json(formatErrorResponse(error.message));
  }
};

/**
 * Create new medicine
 */
exports.createMedicine = async (req, res) => {
  try {
    const { name, genericName, strength, price, stock, stockAlert, category, pharmacy } = req.body;
    
    if (!name || !price || !pharmacy) {
      return res.status(400).json(formatErrorResponse('Name, price, and pharmacy are required'));
    }

    const medicine = new Medicine({
      name,
      genericName: genericName || '',
      strength: strength || '',
      price,
      stock: stock || 0,
      stockAlert: stockAlert || 10,
      category: category || 'General',
      pharmacy,
      available: true
    });

    await medicine.save();
    res.json(formatSuccessResponse({ medicine, message: 'Medicine created successfully' }));
  } catch (error) {
    res.status(500).json(formatErrorResponse(error.message));
  }
};

/**
 * Update medicine stock
 */
exports.updateMedicineStock = async (req, res) => {
  try {
    const { medicineId } = req.params;
    const { stock, stockAlert } = req.body;

    const medicine = await Medicine.findByIdAndUpdate(
      medicineId,
      { 
        stock: stock !== undefined ? stock : undefined,
        stockAlert: stockAlert !== undefined ? stockAlert : undefined,
        lastRestocked: new Date()
      },
      { new: true }
    );

    if (!medicine) {
      return res.status(404).json(formatErrorResponse('Medicine not found'));
    }

    res.json(formatSuccessResponse({ medicine, message: 'Medicine stock updated successfully' }));
  } catch (error) {
    res.status(500).json(formatErrorResponse(error.message));
  }
};

/**
 * Delete medicine
 */
exports.deleteMedicine = async (req, res) => {
  try {
    const { medicineId } = req.params;
    await Medicine.findByIdAndDelete(medicineId);
    res.json(formatSuccessResponse({ message: 'Medicine deleted successfully' }));
  } catch (error) {
    res.status(500).json(formatErrorResponse(error.message));
  }
};

/**
 * Delete pharmacy
 */
exports.deletePharmacy = async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    await Pharmacy.findByIdAndDelete(pharmacyId);
    res.json(formatSuccessResponse({ message: 'Pharmacy deleted successfully' }));
  } catch (error) {
    res.status(500).json(formatErrorResponse(error.message));
  }
};

/**
 * Get reservations
 */
exports.getAllReservations = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = '' } = req.query;
    const skip = (page - 1) * limit;
    const dateRangeFilter = parseDateRange(req.query);

    const query = status ? { ...dateRangeFilter, status } : { ...dateRangeFilter };

    const reservations = await Reservation.find(query)
      .populate('medicine', 'name price')
      .populate('pharmacy', '_id name')
      .populate('user', 'name email phone')
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Reservation.countDocuments(query);

    res.json(
      formatSuccessResponse({
        reservations,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      })
    );
  } catch (error) {
    res.status(500).json(formatErrorResponse(error.message));
  }
};

/**
 * Update reservation status
 */
exports.updateReservationStatus = async (req, res) => {
  try {
    const { reservationId } = req.params;
    const { status } = req.body;

    const reservation = await Reservation.findByIdAndUpdate(
      reservationId,
      { status },
      { new: true }
    );

    res.json(formatSuccessResponse({ reservation }));
  } catch (error) {
    res.status(500).json(formatErrorResponse(error.message));
  }
};
