const express = require('express');
const router = express.Router();
const {
  // Partner Management
  registerDeliveryPartner,
  getAvailablePartners,
  updatePartnerLocation,
  updatePartnerAvailability,
  getPartnerProfile,
  rateDeliveryPartner,
  // Delivery Management
  bookDelivery,
  assignDeliveryPartner,
  updateDeliveryStatus,
  trackDelivery,
  getDeliveriesByCustomer,
  getDeliveriesByPartner,
  getDeliveryStats
} = require('../controllers/deliveryController');

// ==================== DELIVERY PARTNER ROUTES ====================

// Register a new delivery partner
router.post('/partner/register', registerDeliveryPartner);

// Get available partners near location
router.get('/partners/available', getAvailablePartners);

// Get partner profile
router.get('/partner/:partnerId', getPartnerProfile);

// Update partner location (GPS tracking)
router.put('/partner/:partnerId/location', updatePartnerLocation);

// Update partner availability status
router.put('/partner/:partnerId/availability', updatePartnerAvailability);

// Rate a delivery partner
router.post('/delivery/:deliveryId/rate-partner', rateDeliveryPartner);

// ==================== DELIVERY MANAGEMENT ROUTES ====================

// Book a delivery
router.post('/book', bookDelivery);

// Assign delivery to partner
router.put('/delivery/:deliveryId/assign', assignDeliveryPartner);

// Update delivery status
router.put('/delivery/:deliveryId/status', updateDeliveryStatus);

// Track delivery (real-time)
router.get('/delivery/:deliveryId/track', trackDelivery);

// Get deliveries by customer (by phone)
router.get('/customer/deliveries', getDeliveriesByCustomer);

// Get deliveries by partner
router.get('/partner/:partnerId/deliveries', getDeliveriesByPartner);

// Get delivery statistics
router.get('/partner/:partnerId/stats', getDeliveryStats);

module.exports = router;
