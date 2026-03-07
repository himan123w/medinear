const reservationService = require('../services/reservationService');
const { formatSuccessResponse, formatErrorResponse } = require('../middleware/responseFormatter');

/**
 * Create a new medicine reservation
 * POST /api/reservations
 */
exports.createReservation = async (req, res) => {
  try {
    const { medicineId, pharmacyId, quantity, phone, name, email } = req.body;
    
    // Get userId from auth if available, otherwise use deviceId or generate one
    const userId = req.user?.id || req.body.deviceId || `guest_${Date.now()}`;
    const isGuest = !req.user;

    // Validate required fields
    if (!medicineId || !pharmacyId || !quantity) {
      return res.status(400).json(
        formatErrorResponse('Medicine ID, Pharmacy ID, and quantity are required')
      );
    }

    // For guest users, phone number is required
    if (isGuest && !phone) {
      return res.status(400).json(
        formatErrorResponse('Phone number is required for reservations')
      );
    }

    if (quantity < 1) {
      return res.status(400).json(
        formatErrorResponse('Quantity must be at least 1')
      );
    }

    // Get user info (authenticated or guest)
    const userInfo = {
      name: req.user?.name || name || 'Guest',
      phone: req.user?.phone || phone || '',
      email: req.user?.email || email || ''
    };

    const reservation = await reservationService.createReservation({
      userId,
      medicineId,
      pharmacyId,
      quantity,
      userInfo
    });

    res.status(201).json(
      formatSuccessResponse(
        {
          reservation,
          message: '🎉 Medicine reserved successfully! Please collect within 30 minutes.'
        },
        'Reservation created successfully'
      )
    );
  } catch (error) {
    console.error('createReservation error:', error);
    res.status(error.message.includes('not found') || error.message.includes('Insufficient') ? 400 : 500).json(
      formatErrorResponse(error.message || 'Failed to create reservation')
    );
  }
};

/**
 * Get user's reservations
 * GET /api/reservations/my
 */
exports.getMyReservations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    const reservations = await reservationService.getUserReservations(userId, status);

    res.json(
      formatSuccessResponse(
        {
          reservations,
          count: reservations.length
        },
        'Reservations retrieved successfully'
      )
    );
  } catch (error) {
    console.error('getMyReservations error:', error);
    res.status(500).json(
      formatErrorResponse('Failed to fetch reservations')
    );
  }
};

/**
 * Get pharmacy's reservations
 * GET /api/reservations/pharmacy/:pharmacyId
 */
exports.getPharmacyReservations = async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    const { status } = req.query;

    // Verify pharmacy access (can be enhanced with auth)
    const reservations = await reservationService.getPharmacyReservations(pharmacyId, status);

    res.json(
      formatSuccessResponse(
        {
          reservations,
          count: reservations.length,
          stats: await reservationService.getReservationStats(pharmacyId)
        },
        'Pharmacy reservations retrieved successfully'
      )
    );
  } catch (error) {
    console.error('getPharmacyReservations error:', error);
    res.status(500).json(
      formatErrorResponse('Failed to fetch pharmacy reservations')
    );
  }
};

/**
 * Get single reservation details
 * GET /api/reservations/:id
 */
exports.getReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const reservation = await reservationService.getReservation(id);

    if (!reservation) {
      return res.status(404).json(
        formatErrorResponse('Reservation not found')
      );
    }

    res.json(
      formatSuccessResponse(reservation, 'Reservation retrieved successfully')
    );
  } catch (error) {
    console.error('getReservation error:', error);
    res.status(500).json(
      formatErrorResponse('Failed to fetch reservation')
    );
  }
};

/**
 * Cancel a reservation
 * POST /api/reservations/:id/cancel
 */
exports.cancelReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const reservation = await reservationService.cancelReservation(id, userId);

    res.json(
      formatSuccessResponse(
        {
          reservation,
          message: 'Reservation cancelled successfully. Stock has been restored.'
        },
        'Reservation cancelled'
      )
    );
  } catch (error) {
    console.error('cancelReservation error:', error);
    res.status(error.message.includes('Unauthorized') ? 403 : 400).json(
      formatErrorResponse(error.message || 'Failed to cancel reservation')
    );
  }
};

/**
 * Complete a reservation (pharmacy marks as picked up)
 * POST /api/reservations/:id/complete
 */
exports.completeReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const pharmacyId = req.body.pharmacyId || req.user.pharmacyId;

    if (!pharmacyId) {
      return res.status(400).json(
        formatErrorResponse('Pharmacy ID is required')
      );
    }

    const reservation = await reservationService.completeReservation(id, pharmacyId);

    res.json(
      formatSuccessResponse(
        {
          reservation,
          message: 'Reservation completed successfully. Thank you for your business!'
        },
        'Reservation completed'
      )
    );
  } catch (error) {
    console.error('completeReservation error:', error);
    res.status(error.message.includes('Unauthorized') ? 403 : 400).json(
      formatErrorResponse(error.message || 'Failed to complete reservation')
    );
  }
};

/**
 * Get reservation statistics
 * GET /api/reservations/stats
 */
exports.getReservationStats = async (req, res) => {
  try {
    const { pharmacyId } = req.query;
    const stats = await reservationService.getReservationStats(pharmacyId);

    res.json(
      formatSuccessResponse(stats, 'Reservation statistics retrieved successfully')
    );
  } catch (error) {
    console.error('getReservationStats error:', error);
    res.status(500).json(
      formatErrorResponse('Failed to fetch reservation statistics')
    );
  }
};

/**
 * Extend reservation time (optional feature)
 * POST /api/reservations/:id/extend
 */
exports.extendReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { minutes = 15 } = req.body;

    const Reservation = require('../models/Reservation');
    const reservation = await Reservation.findById(id);

    if (!reservation) {
      return res.status(404).json(
        formatErrorResponse('Reservation not found')
      );
    }

    if (reservation.user.toString() !== userId.toString()) {
      return res.status(403).json(
        formatErrorResponse('Unauthorized: You can only extend your own reservations')
      );
    }

    if (reservation.status !== 'active') {
      return res.status(400).json(
        formatErrorResponse('Can only extend active reservations')
      );
    }

    // Extend by specified minutes (max 15 minutes)
    const extensionTime = Math.min(minutes, 15) * 60 * 1000;
    reservation.expiresAt = new Date(reservation.expiresAt.getTime() + extensionTime);
    await reservation.save();

    res.json(
      formatSuccessResponse(
        {
          reservation,
          message: `Reservation extended by ${Math.min(minutes, 15)} minutes`
        },
        'Reservation extended successfully'
      )
    );
  } catch (error) {
    console.error('extendReservation error:', error);
    res.status(500).json(
      formatErrorResponse('Failed to extend reservation')
    );
  }
};
