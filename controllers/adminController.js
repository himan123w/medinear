const User = require('../models/User');
const Pharmacy = require('../models/Pharmacy');
const Medicine = require('../models/Medicine');
const Reservation = require('../models/Reservation');
const { formatSuccessResponse, formatErrorResponse } = require('../middleware/responseFormatter');

/**
 * Admin Dashboard - Get Statistics (Optimized with Aggregation)
 */
exports.getDashboardStats = async (req, res) => {
  try {
    // Use Promise.all to fetch all counts in parallel instead of sequentially
    const [
      totalUsers,
      totalPharmacies,
      totalMedicines,
      totalReservations,
      reservationStats
    ] = await Promise.all([
      User.countDocuments().hint({ createdAt: 1 }),
      Pharmacy.countDocuments().hint({ createdAt: 1 }),
      Medicine.countDocuments().hint({ createdAt: 1 }),
      Reservation.countDocuments().hint({ createdAt: 1 }),
      Reservation.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    // Process reservation stats
    const reservationMap = {};
    reservationStats.forEach(stat => {
      reservationMap[stat._id] = stat.count;
    });

    res.json(
      formatSuccessResponse({
        totalUsers,
        totalPharmacies,
        totalMedicines,
        totalReservations,
        activeReservations: reservationMap['active'] || 0,
        completedReservations: reservationMap['completed'] || 0,
        cancelledReservations: reservationMap['cancelled'] || 0,
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

    const query = search
      ? { $or: [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }, { phone: new RegExp(search, 'i') }] }
      : {};

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

    const query = search
      ? { name: new RegExp(search, 'i') }
      : {};

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

    const query = search
      ? { name: new RegExp(search, 'i') }
      : {};

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

    const query = status ? { status } : {};

    const reservations = await Reservation.find(query)
      .populate('medicineId', 'name price')
      .populate('pharmacyId', 'name')
      .populate('userId', 'name email phone')
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
