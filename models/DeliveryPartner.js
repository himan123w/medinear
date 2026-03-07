const mongoose = require("mongoose");

const deliveryPartnerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  email: String,
  profileImage: String,
  
  // Partner Details
  vehicleType: {
    type: String,
    enum: ['bike', 'scooter', 'car', 'cycle'],
    default: 'bike'
  },
  vehicleNumber: String,
  licenseNumber: String,
  
  // Location & Service Area
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
  serviceAreas: [String], // Areas they deliver to
  
  // Status & Availability
  status: {
    type: String,
    enum: ['active', 'inactive', 'on-delivery', 'offline', 'break'],
    default: 'offline'
  },
  isAvailable: {
    type: Boolean,
    default: false
  },
  
  // Performance Metrics
  totalDeliveries: {
    type: Number,
    default: 0
  },
  completedDeliveries: {
    type: Number,
    default: 0
  },
  cancelledDeliveries: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 5,
    min: 1,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  
  // Financial Info
  bankAccount: String,
  upiId: String,
  walletBalance: {
    type: Number,
    default: 0
  },
  
  // Documents
  aadharNumber: String,
  panNumber: String,
  insuranceNumber: String,
  documents: [
    {
      type: String,
      url: String,
      verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
      }
    }
  ],
  
  // Verification
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDate: Date,
  
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Geospatial index
deliveryPartnerSchema.index({ location: '2dsphere' }, { sparse: true });
// Status index
deliveryPartnerSchema.index({ status: 1 });
// Service areas index
deliveryPartnerSchema.index({ serviceAreas: 1 });

module.exports = mongoose.model("DeliveryPartner", deliveryPartnerSchema);
