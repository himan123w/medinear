const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema({
  // Order/Prescription Reference
  orderId: {
    type: String,
    required: true
  },
  orderType: {
    type: String,
    enum: ['prescription', 'medicine-order', 'emergency'],
    required: true
  },
  prescriptionId: mongoose.Schema.Types.ObjectId,
  
  // Parties Involved
  pharmacy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pharmacy',
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  customerPhone: String,
  customerName: String,
  
  deliveryPartner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryPartner'
  },
  deliveryPartnerName: String,
  deliveryPartnerPhone: String,
  
  // Pickup Details
  pickupLocation: {
    address: String,
    latitude: Number,
    longitude: Number,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      }
    },
    pickupTime: Date,
    actualPickupTime: Date
  },
  
  // Delivery Details
  deliveryLocation: {
    address: String,
    latitude: Number,
    longitude: Number,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      }
    },
    instructions: String,
    landmark: String
  },
  
  // Order Items
  items: [
    {
      name: String,
      quantity: Number,
      price: Number
    }
  ],
  
  // Delivery Info
  estimatedDeliveryTime: Number, // in minutes
  actualDeliveryTime: Date,
  deliveryType: {
    type: String,
    enum: ['scheduled', 'express', 'standard'],
    default: 'standard'
  },
  
  // Pricing
  orderAmount: Number,
  deliveryCharge: Number,
  discountApplied: Number,
  totalAmount: Number,
  paymentMethod: {
    type: String,
    enum: ['cash', 'wallet', 'upi', 'card', 'netbanking'],
    default: 'cash'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  
  // Status Tracking
  status: {
    type: String,
    enum: [
      'confirmed',
      'assigned',
      'picked-up',
      'in-transit',
      'arrived',
      'delivered',
      'failed',
      'cancelled',
      'returned'
    ],
    default: 'confirmed'
  },
  
  // Status Timeline
  statusHistory: [
    {
      status: String,
      timestamp: Date,
      location: {
        latitude: Number,
        longitude: Number
      },
      notes: String
    }
  ],
  
  // Real-time Tracking
  currentLocation: {
    latitude: Number,
    longitude: Number,
    timestamp: Date,
    accuracy: Number
  },
  
  // Live Track URL
  trackingUrl: String,
  
  // Ratings & Reviews
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  deliveryPartnerRating: {
    type: Number,
    min: 1,
    max: 5
  },
  review: String,
  issues: [String], // Any issues encountered
  
  // OTP for delivery verification
  deliveryOtp: String,
  otpVerified: Boolean,
  
  // Proof of Delivery
  podDocuments: [
    {
      photoUrl: String,
      signatureUrl: String,
      timestamp: Date
    }
  ],
  
  // Additional Info
  specialInstructions: String,
  contactlessDelivery: Boolean,
  requiresSignature: Boolean,
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
}, { timestamps: true });

// Geospatial indexes
deliverySchema.index({ 'pickupLocation.location': '2dsphere' });
deliverySchema.index({ 'deliveryLocation.location': '2dsphere' });
deliverySchema.index({ 'currentLocation': '2dsphere' });

// Status and tracking indexes
deliverySchema.index({ status: 1, createdAt: -1 });
deliverySchema.index({ deliveryPartner: 1, status: 1 });
deliverySchema.index({ customerPhone: 1, createdAt: -1 });
deliverySchema.index({ orderId: 1 });

module.exports = mongoose.model("Delivery", deliverySchema);
