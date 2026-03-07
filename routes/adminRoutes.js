const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuth = require('../middleware/adminAuth');

/**
 * Admin Routes
 * All routes require admin authentication
 */

// Dashboard Statistics
router.get('/dashboard/stats', adminAuth, adminController.getDashboardStats);

// User Management
router.get('/users', adminAuth, adminController.getAllUsers);
router.delete('/users/:userId', adminAuth, adminController.deleteUser);

// Pharmacy Management
router.get('/pharmacies', adminAuth, adminController.getAllPharmacies);
router.delete('/pharmacies/:pharmacyId', adminAuth, adminController.deletePharmacy);

// Medicine Management
router.get('/medicines', adminAuth, adminController.getAllMedicines);
router.post('/medicines', adminAuth, adminController.createMedicine);
router.put('/medicines/:medicineId/stock', adminAuth, adminController.updateMedicineStock);
router.delete('/medicines/:medicineId', adminAuth, adminController.deleteMedicine);

// Reservation Management
router.get('/reservations', adminAuth, adminController.getAllReservations);
router.put('/reservations/:reservationId/status', adminAuth, adminController.updateReservationStatus);

module.exports = router;
