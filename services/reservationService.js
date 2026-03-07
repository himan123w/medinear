const Reservation = require('../models/Reservation');
const Medicine = require('../models/Medicine');
const Pharmacy = require('../models/Pharmacy');
const Inventory = require('../models/Inventory');
const notificationService = require('./notificationService');

// Reservation duration in milliseconds (30 minutes)
const RESERVATION_DURATION = 30 * 60 * 1000;

// Warning time before expiry (5 minutes)
const EXPIRY_WARNING_TIME = 5 * 60 * 1000;

class ReservationService {
  constructor() {
    // Start background job to process expired reservations
    this.startExpiryChecker();
  }

  /**
   * Create a new medicine reservation
   */
  async createReservation({ userId, medicineId, pharmacyId, quantity, userInfo }) {
    try {
      // 1. Check if medicine exists and has enough stock
      const medicine = await Medicine.findById(medicineId);
      if (!medicine) {
        throw new Error('Medicine not found');
      }

      if (!medicine.available) {
        throw new Error('Medicine is not available');
      }

      if (medicine.stock < quantity) {
        throw new Error(`Insufficient stock. Available: ${medicine.stock}, Requested: ${quantity}`);
      }

      // 2. Get pharmacy details
      const pharmacy = await Pharmacy.findById(pharmacyId);
      if (!pharmacy) {
        throw new Error('Pharmacy not found');
      }

      // 3. Check for existing active reservations by this user for same medicine
      const existingReservation = await Reservation.findOne({
        user: userId,
        medicine: medicineId,
        status: 'active'
      });

      if (existingReservation) {
        throw new Error('You already have an active reservation for this medicine');
      }

      // 4. Calculate expiry time
      const now = new Date();
      const expiresAt = new Date(now.getTime() + RESERVATION_DURATION);

      // 5. Create reservation
      const reservation = new Reservation({
        user: userId,
        medicine: medicineId,
        pharmacy: pharmacyId,
        quantity,
        expiresAt,
        userInfo,
        medicineSnapshot: {
          name: medicine.name,
          price: medicine.price,
          batchNumber: medicine.batchNumber || 'N/A'
        },
        totalAmount: medicine.price * quantity
      });

      await reservation.save();

      // 6. Reduce stock temporarily
      medicine.stock -= quantity;
      await medicine.save();

      // 7. Update inventory if exists
      await this.updateInventoryForReservation(pharmacyId, medicineId, -quantity);

      // 8. Notify pharmacy
      await this.notifyPharmacy(pharmacy, reservation, medicine);

      // 9. Notify user
      await this.notifyUser(userInfo, reservation, medicine, pharmacy);

      // 10. Schedule expiry warning
      setTimeout(() => {
        this.sendExpiryWarning(reservation._id);
      }, RESERVATION_DURATION - EXPIRY_WARNING_TIME);

      return await reservation.populate(['medicine', 'pharmacy', 'user']);
    } catch (error) {
      console.error('ReservationService.createReservation error:', error);
      throw error;
    }
  }

  /**
   * Cancel a reservation
   */
  async cancelReservation(reservationId, userId) {
    try {
      const reservation = await Reservation.findById(reservationId);
      
      if (!reservation) {
        throw new Error('Reservation not found');
      }

      if (reservation.user.toString() !== userId.toString()) {
        throw new Error('Unauthorized: You can only cancel your own reservations');
      }

      if (reservation.status !== 'active') {
        throw new Error(`Cannot cancel reservation with status: ${reservation.status}`);
      }

      // Mark as cancelled
      await reservation.cancel();

      // Restore stock
      await this.restoreStock(reservation);

      // Notify pharmacy about cancellation
      const pharmacy = await Pharmacy.findById(reservation.pharmacy);
      if (pharmacy && pharmacy.email) {
        await notificationService.sendEmail({
          to: pharmacy.email,
          subject: 'Reservation Cancelled',
          text: `Reservation ${reservation.reservationCode} has been cancelled by customer.`
        });
      }

      return reservation;
    } catch (error) {
      console.error('ReservationService.cancelReservation error:', error);
      throw error;
    }
  }

  /**
   * Complete a reservation (when customer picks up)
   */
  async completeReservation(reservationId, pharmacyId) {
    try {
      const reservation = await Reservation.findById(reservationId);
      
      if (!reservation) {
        throw new Error('Reservation not found');
      }

      if (reservation.pharmacy.toString() !== pharmacyId.toString()) {
        throw new Error('Unauthorized: This reservation belongs to another pharmacy');
      }

      if (reservation.status !== 'active') {
        throw new Error(`Cannot complete reservation with status: ${reservation.status}`);
      }

      // Mark as completed
      await reservation.complete();

      // Note: Stock is already reduced, so no need to adjust again
      // Just record the sale in analytics if needed

      return reservation;
    } catch (error) {
      console.error('ReservationService.completeReservation error:', error);
      throw error;
    }
  }

  /**
   * Get user's reservations
   */
  async getUserReservations(userId, status = null) {
    try {
      const query = { user: userId };
      if (status) {
        query.status = status;
      }

      const reservations = await Reservation.find(query)
        .populate('medicine')
        .populate('pharmacy')
        .sort({ createdAt: -1 });

      return reservations;
    } catch (error) {
      console.error('ReservationService.getUserReservations error:', error);
      throw error;
    }
  }

  /**
   * Get pharmacy's reservations
   */
  async getPharmacyReservations(pharmacyId, status = null) {
    try {
      const query = { pharmacy: pharmacyId };
      if (status) {
        query.status = status;
      }

      const reservations = await Reservation.find(query)
        .populate('medicine')
        .populate('user', 'name phone email')
        .sort({ createdAt: -1 });

      return reservations;
    } catch (error) {
      console.error('ReservationService.getPharmacyReservations error:', error);
      throw error;
    }
  }

  /**
   * Get single reservation details
   */
  async getReservation(reservationId) {
    try {
      const reservation = await Reservation.findById(reservationId)
        .populate('medicine')
        .populate('pharmacy')
        .populate('user', 'name phone email');

      return reservation;
    } catch (error) {
      console.error('ReservationService.getReservation error:', error);
      throw error;
    }
  }

  /**
   * Restore stock when reservation expires or is cancelled
   */
  async restoreStock(reservation) {
    try {
      const medicine = await Medicine.findById(reservation.medicine);
      if (medicine) {
        medicine.stock += reservation.quantity;
        await medicine.save();
      }

      // Update inventory
      await this.updateInventoryForReservation(
        reservation.pharmacy,
        reservation.medicine,
        reservation.quantity
      );
    } catch (error) {
      console.error('ReservationService.restoreStock error:', error);
    }
  }

  /**
   * Update inventory when reservation is created/cancelled
   */
  async updateInventoryForReservation(pharmacyId, medicineId, quantityChange) {
    try {
      const inventory = await Inventory.findOne({ pharmacy: pharmacyId });
      if (!inventory) return;

      const itemIndex = inventory.items.findIndex(
        item => item.medicineId && item.medicineId.toString() === medicineId.toString()
      );

      if (itemIndex !== -1) {
        inventory.items[itemIndex].quantity += quantityChange;
        await inventory.save();
      }
    } catch (error) {
      console.error('ReservationService.updateInventoryForReservation error:', error);
    }
  }

  /**
   * Process expired reservations - Background job
   */
  async processExpiredReservations() {
    try {
      const now = new Date();
      
      // Find all active reservations that have expired
      const expiredReservations = await Reservation.find({
        status: 'active',
        expiresAt: { $lt: now }
      });

      for (const reservation of expiredReservations) {
        // Mark as expired
        await reservation.expire();

        // Restore stock
        await this.restoreStock(reservation);

        // Notify user about expiration
        if (reservation.userInfo && reservation.userInfo.email) {
          await notificationService.sendEmail({
            to: reservation.userInfo.email,
            subject: 'Reservation Expired',
            text: `Your reservation ${reservation.reservationCode} for ${reservation.medicineSnapshot.name} has expired. The medicine is now available for others.`,
            html: `
              <h3>Reservation Expired</h3>
              <p>Your reservation <strong>${reservation.reservationCode}</strong> has expired.</p>
              <p>Medicine: <strong>${reservation.medicineSnapshot.name}</strong></p>
              <p>Quantity: <strong>${reservation.quantity}</strong></p>
              <p>The medicine is now available for others to purchase.</p>
            `
          });
        }

        console.log(`Expired and restored reservation: ${reservation.reservationCode}`);
      }

      return expiredReservations.length;
    } catch (error) {
      console.error('ReservationService.processExpiredReservations error:', error);
      return 0;
    }
  }

  /**
   * Send expiry warning 5 minutes before expiration
   */
  async sendExpiryWarning(reservationId) {
    try {
      const reservation = await Reservation.findById(reservationId);
      
      if (!reservation || reservation.status !== 'active') {
        return;
      }

      if (reservation.notifications.expiryWarning) {
        return; // Already sent
      }

      // Send warning to user
      if (reservation.userInfo && reservation.userInfo.email) {
        await notificationService.sendEmail({
          to: reservation.userInfo.email,
          subject: '⏰ Reservation Expiring Soon!',
          text: `Your reservation ${reservation.reservationCode} will expire in 5 minutes. Please collect your medicine soon!`,
          html: `
            <h3>⏰ Reservation Expiring Soon!</h3>
            <p>Your reservation <strong>${reservation.reservationCode}</strong> will expire in <strong>5 minutes</strong>.</p>
            <p>Medicine: <strong>${reservation.medicineSnapshot.name}</strong></p>
            <p>Quantity: <strong>${reservation.quantity}</strong></p>
            <p>Please collect your medicine from the pharmacy soon!</p>
          `
        });
      }

      // Mark warning as sent
      reservation.notifications.expiryWarning = true;
      await reservation.save();
    } catch (error) {
      console.error('ReservationService.sendExpiryWarning error:', error);
    }
  }

  /**
   * Notify pharmacy about new reservation
   */
  async notifyPharmacy(pharmacy, reservation, medicine) {
    try {
      if (!pharmacy.email) return;

      await notificationService.sendEmail({
        to: pharmacy.email,
        subject: '🔔 New Medicine Reservation',
        text: `New reservation received for ${medicine.name}. Code: ${reservation.reservationCode}`,
        html: `
          <h3>🔔 New Reservation Received</h3>
          <p><strong>Reservation Code:</strong> ${reservation.reservationCode}</p>
          <p><strong>Medicine:</strong> ${medicine.name}</p>
          <p><strong>Quantity:</strong> ${reservation.quantity}</p>
          <p><strong>Customer:</strong> ${reservation.userInfo.name}</p>
          <p><strong>Phone:</strong> ${reservation.userInfo.phone}</p>
          <p><strong>Amount:</strong> ₹${reservation.totalAmount}</p>
          <p><strong>Expires At:</strong> ${reservation.expiresAt.toLocaleString()}</p>
          <p>Please keep the medicine ready for pickup.</p>
        `
      });

      reservation.notifications.pharmacyNotified = true;
      await reservation.save();
    } catch (error) {
      console.error('ReservationService.notifyPharmacy error:', error);
    }
  }

  /**
   * Notify user about successful reservation
   */
  async notifyUser(userInfo, reservation, medicine, pharmacy) {
    try {
      if (!userInfo.email) return;

      await notificationService.sendEmail({
        to: userInfo.email,
        subject: '✅ Medicine Reserved Successfully',
        text: `Your medicine ${medicine.name} has been reserved. Code: ${reservation.reservationCode}`,
        html: `
          <h3>✅ Medicine Reserved Successfully</h3>
          <p>Your reservation has been confirmed!</p>
          <hr>
          <p><strong>Reservation Code:</strong> ${reservation.reservationCode}</p>
          <p><strong>Medicine:</strong> ${medicine.name}</p>
          <p><strong>Quantity:</strong> ${reservation.quantity}</p>
          <p><strong>Total Amount:</strong> ₹${reservation.totalAmount}</p>
          <p><strong>Pharmacy:</strong> ${pharmacy.name}</p>
          <p><strong>Address:</strong> ${pharmacy.address}, ${pharmacy.city}</p>
          <p><strong>Expires At:</strong> ${reservation.expiresAt.toLocaleString()}</p>
          <hr>
          <p><strong>⏰ Please collect within 30 minutes or your reservation will expire!</strong></p>
          <p>Show this reservation code at the pharmacy to collect your medicine.</p>
        `
      });

      reservation.notifications.userNotified = true;
      await reservation.save();
    } catch (error) {
      console.error('ReservationService.notifyUser error:', error);
    }
  }

  /**
   * Start background job to check and process expired reservations
   * Runs every minute
   */
  startExpiryChecker() {
    // Run every 60 seconds
    setInterval(() => {
      this.processExpiredReservations();
    }, 60 * 1000);

    console.log('✅ Reservation expiry checker started (runs every 60 seconds)');
  }

  /**
   * Get reservation statistics
   */
  async getReservationStats(pharmacyId = null) {
    try {
      const query = pharmacyId ? { pharmacy: pharmacyId } : {};
      
      const [total, active, expired, cancelled, completed] = await Promise.all([
        Reservation.countDocuments(query),
        Reservation.countDocuments({ ...query, status: 'active' }),
        Reservation.countDocuments({ ...query, status: 'expired' }),
        Reservation.countDocuments({ ...query, status: 'cancelled' }),
        Reservation.countDocuments({ ...query, status: 'completed' })
      ]);

      const conversionRate = total > 0 ? ((completed / total) * 100).toFixed(2) : 0;

      return {
        total,
        active,
        expired,
        cancelled,
        completed,
        conversionRate: parseFloat(conversionRate)
      };
    } catch (error) {
      console.error('ReservationService.getReservationStats error:', error);
      throw error;
    }
  }
}

// Export singleton instance
module.exports = new ReservationService();
