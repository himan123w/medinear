const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const authenticateToken = require('../middleware/authMiddleware');
const optionalAuth = require('../middleware/optionalAuth');

/**
 * Reservation Routes
 * Some routes allow guest access, others require authentication
 */

// Create new reservation (allows guest reservations)
router.post('/', optionalAuth, reservationController.createReservation);

// Get user's reservations
router.get('/my', authenticateToken, reservationController.getMyReservations);

// Get reservation statistics
router.get('/stats', reservationController.getReservationStats);

// Get pharmacy reservations
router.get('/pharmacy/:pharmacyId', reservationController.getPharmacyReservations);

// Get single reservation
router.get('/:id', authenticateToken, reservationController.getReservation);

// Cancel reservation
router.post('/:id/cancel', authenticateToken, reservationController.cancelReservation);

// Complete reservation (pharmacy)
router.post('/:id/complete', reservationController.completeReservation);

// Extend reservation time (optional)
router.post('/:id/extend', authenticateToken, reservationController.extendReservation);

module.exports = router;
