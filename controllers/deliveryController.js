const Delivery = require('../models/Delivery');
const DeliveryPartner = require('../models/DeliveryPartner');
const Pharmacy = require('../models/Pharmacy');
const mongoose = require('mongoose');
const crypto = require('crypto');

// ==================== DELIVERY PARTNER MANAGEMENT ====================

// Register a delivery partner
exports.registerDeliveryPartner = async (req, res) => {
  try {
    const { name, phone, vehicleType, serviceAreas, upiId } = req.body;

    // Check if partner already exists
    const existingPartner = await DeliveryPartner.findOne({ phone });
    if (existingPartner) {
      return res.status(400).json({ error: 'Partner already registered with this phone' });
    }

    const partner = new DeliveryPartner({
      name,
      phone,
      vehicleType,
      serviceAreas,
      upiId,
      status: 'offline',
      isAvailable: false
    });

    await partner.save();
    res.status(201).json({
      message: 'Partner registered successfully',
      partner
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get available delivery partners near location
exports.getAvailablePartners = async (req, res) => {
  try {
    const { latitude, longitude, radius = 5000, serviceArea = '' } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }

    const query = {
      isAvailable: true,
      status: 'active',
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(longitude), Number(latitude)]
          },
          $maxDistance: Number(radius)
        }
      }
    };

    if (serviceArea) {
      query.serviceAreas = serviceArea;
    }

    const partners = await DeliveryPartner.find(query)
      .select('name phone vehicleType averageRating totalDeliveries location status')
      .limit(20);

    res.json(partners);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update partner location (real-time GPS tracking)
exports.updatePartnerLocation = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const { latitude, longitude, accuracy } = req.body;

    const partner = await DeliveryPartner.findByIdAndUpdate(
      partnerId,
      {
        latitude,
        longitude,
        location: {
          type: 'Point',
          coordinates: [Number(longitude), Number(latitude)]
        },
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!partner) {
      return res.status(404).json({ error: 'Partner not found' });
    }

    // Also update any active deliveries
    await Delivery.updateMany(
      { deliveryPartner: partnerId, status: 'in-transit' },
      {
        currentLocation: {
          latitude,
          longitude,
          timestamp: new Date(),
          accuracy
        }
      }
    );

    res.json({ message: 'Location updated', partner });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update partner availability
exports.updatePartnerAvailability = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const { isAvailable, status } = req.body;

    const partner = await DeliveryPartner.findByIdAndUpdate(
      partnerId,
      { isAvailable, status },
      { new: true }
    );

    res.json({
      message: 'Availability updated',
      partner: {
        id: partner._id,
        name: partner.name,
        status: partner.status,
        isAvailable: partner.isAvailable
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get partner profile
exports.getPartnerProfile = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const partner = await DeliveryPartner.findById(partnerId);

    if (!partner) {
      return res.status(404).json({ error: 'Partner not found' });
    }

    res.json(partner);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Rate delivery partner
exports.rateDeliveryPartner = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const { rating, review } = req.body;

    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    delivery.deliveryPartnerRating = rating;
    delivery.review = review;
    await delivery.save();

    // Update partner's average rating
    const partner = delivery.deliveryPartner;
    const allRatings = await Delivery.find({
      deliveryPartner: partner,
      deliveryPartnerRating: { $exists: true }
    });

    const avgRating = allRatings.reduce((sum, d) => sum + d.deliveryPartnerRating, 0) / allRatings.length;

    await DeliveryPartner.findByIdAndUpdate(partner, {
      averageRating: avgRating,
      totalRatings: allRatings.length
    });

    res.json({ message: 'Partner rated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==================== DELIVERY MANAGEMENT ====================

// Create/Book a delivery
exports.bookDelivery = async (req, res) => {
  try {
    const {
      orderId,
      orderType,
      prescriptionId,
      pharmacyId,
      customerPhone,
      customerName,
      pickupAddress,
      pickupLat,
      pickupLng,
      deliveryAddress,
      deliveryLat,
      deliveryLng,
      items,
      totalAmount,
      deliveryType = 'standard',
      specialInstructions,
      contactlessDelivery = false
    } = req.body;

    // Calculate delivery charge based on distance
    const distance = calculateDistance(
      { latitude: parseFloat(pickupLat), longitude: parseFloat(pickupLng) },
      { latitude: parseFloat(deliveryLat), longitude: parseFloat(deliveryLng) }
    );

    const deliveryCharges = {
      standard: Math.ceil(distance * 10), // ₹10 per km
      express: Math.ceil(distance * 15), // ₹15 per km
      scheduled: Math.ceil(distance * 8)  // ₹8 per km
    };

    const delivery = new Delivery({
      orderId,
      orderType,
      prescriptionId,
      pharmacy: pharmacyId,
      customerPhone,
      customerName,
      pickupLocation: {
        address: pickupAddress,
        latitude: parseFloat(pickupLat),
        longitude: parseFloat(pickupLng),
        location: {
          type: 'Point',
          coordinates: [parseFloat(pickupLng), parseFloat(pickupLat)]
        }
      },
      deliveryLocation: {
        address: deliveryAddress,
        latitude: parseFloat(deliveryLat),
        longitude: parseFloat(deliveryLng),
        location: {
          type: 'Point',
          coordinates: [parseFloat(deliveryLng), parseFloat(deliveryLat)]
        }
      },
      items,
      totalAmount,
      deliveryCharge: deliveryCharges[deliveryType] || deliveryCharges.standard,
      deliveryType,
      estimatedDeliveryTime: deliveryType === 'express' ? 30 : 45,
      specialInstructions,
      contactlessDelivery,
      status: 'confirmed',
      statusHistory: [
        {
          status: 'confirmed',
          timestamp: new Date(),
          notes: 'Delivery order confirmed'
        }
      ]
    });

    await delivery.save();

    res.status(201).json({
      message: 'Delivery booked successfully',
      delivery: {
        id: delivery._id,
        orderId: delivery.orderId,
        status: delivery.status,
        estimatedDeliveryTime: delivery.estimatedDeliveryTime,
        deliveryCharge: delivery.deliveryCharge
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Assign delivery to partner
exports.assignDeliveryPartner = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const { partnerId } = req.body;

    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    const partner = await DeliveryPartner.findById(partnerId);
    if (!partner) {
      return res.status(404).json({ error: 'Partner not found' });
    }

    // Update delivery
    delivery.deliveryPartner = partnerId;
    delivery.deliveryPartnerName = partner.name;
    delivery.deliveryPartnerPhone = partner.phone;
    delivery.status = 'assigned';
    delivery.statusHistory.push({
      status: 'assigned',
      timestamp: new Date(),
      notes: `Assigned to ${partner.name}`
    });

    await delivery.save();

    // Update partner status
    await DeliveryPartner.findByIdAndUpdate(partnerId, {
      status: 'on-delivery',
      isAvailable: false
    });

    res.json({
      message: 'Partner assigned successfully',
      delivery: {
        id: delivery._id,
        partner: {
          id: partner._id,
          name: partner.name,
          phone: partner.phone
        },
        status: delivery.status
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update delivery status
exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const { status, latitude, longitude, notes } = req.body;

    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    // Update status
    delivery.status = status;
    delivery.updatedAt = new Date();

    // Update current location if provided
    if (latitude && longitude) {
      delivery.currentLocation = {
        latitude,
        longitude,
        timestamp: new Date()
      };
    }

    // Add to status history
    delivery.statusHistory.push({
      status,
      timestamp: new Date(),
      location: latitude && longitude ? { latitude, longitude } : undefined,
      notes
    });

    // If delivered, generate proof
    if (status === 'delivered') {
      delivery.actualDeliveryTime = new Date();
      delivery.deliveryOtp = generateOTP(); // For verification
    }

    // If cancelled/failed, mark partner available again
    if (['cancelled', 'failed'].includes(status)) {
      await DeliveryPartner.findByIdAndUpdate(delivery.deliveryPartner, {
        status: 'active',
        isAvailable: true
      });
    }

    await delivery.save();

    res.json({
      message: 'Delivery status updated',
      delivery: {
        id: delivery._id,
        status: delivery.status,
        currentLocation: delivery.currentLocation
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get delivery tracking info
exports.trackDelivery = async (req, res) => {
  try {
    const { deliveryId } = req.params;

    const delivery = await Delivery.findById(deliveryId)
      .select(
        'orderId status currentLocation pickupLocation deliveryLocation deliveryPartner estimatedDeliveryTime statusHistory'
      )
      .populate('deliveryPartner', 'name phone vehicleType location');

    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    res.json({
      tracking: delivery
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get deliveries by customer
exports.getDeliveriesByCustomer = async (req, res) => {
  try {
    const { phone } = req.query;
    const { limit = 20, skip = 0 } = req.query;

    const deliveries = await Delivery.find({ customerPhone: phone })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .select('orderId status estimatedDeliveryTime deliveryCharge createdAt');

    res.json({
      deliveries,
      total: await Delivery.countDocuments({ customerPhone: phone })
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get deliveries by partner
exports.getDeliveriesByPartner = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const { status, limit = 20, skip = 0 } = req.query;

    const query = { deliveryPartner: partnerId };
    if (status) query.status = status;

    const deliveries = await Delivery.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    res.json(deliveries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get delivery statistics
exports.getDeliveryStats = async (req, res) => {
  try {
    const { partnerId } = req.params;

    const stats = await Delivery.aggregate([
      { $match: { deliveryPartner: mongoose.Types.ObjectId(partnerId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const partner = await DeliveryPartner.findById(partnerId)
      .select('totalDeliveries completedDeliveries cancelledDeliveries averageRating');

    res.json({
      stats,
      partner
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==================== HELPER FUNCTIONS ====================

function calculateDistance(point1, point2) {
  const R = 6371; // Earth's radius in km
  const dLat = (point2.latitude - point1.latitude) * (Math.PI / 180);
  const dLng = (point2.longitude - point1.longitude) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(point1.latitude * (Math.PI / 180)) *
      Math.cos(point2.latitude * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
