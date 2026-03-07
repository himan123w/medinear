const mongoose = require("mongoose");

const pharmacySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  owner: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    sparse: true
  },
  password: {
    type: String,
    default: null
  },
  address: String,
  city: String,
  state: String,
  zipCode: String,
  area: String,
  
  // License information
  license: String,
  licenseNumber: String,
  licenseExpiry: Date,
  
  // Location information
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
  
  // Operating information
  deliveryTime: {
    type: Number,
    default: 30,
    description: "Delivery time in minutes"
  },
  open24x7: {
    type: Boolean,
    default: false,
    description: 'Whether the pharmacy is open 24x7'
  },
  
  // Operating Hours - Enhanced
  operatingHours: {
    monday: { open: { type: String, default: '09:00' }, close: { type: String, default: '21:00' }, closed: { type: Boolean, default: false } },
    tuesday: { open: { type: String, default: '09:00' }, close: { type: String, default: '21:00' }, closed: { type: Boolean, default: false } },
    wednesday: { open: { type: String, default: '09:00' }, close: { type: String, default: '21:00' }, closed: { type: Boolean, default: false } },
    thursday: { open: { type: String, default: '09:00' }, close: { type: String, default: '21:00' }, closed: { type: Boolean, default: false } },
    friday: { open: { type: String, default: '09:00' }, close: { type: String, default: '21:00' }, closed: { type: Boolean, default: false } },
    saturday: { open: { type: String, default: '09:00' }, close: { type: String, default: '21:00' }, closed: { type: Boolean, default: false } },
    sunday: { open: { type: String, default: '10:00' }, close: { type: String, default: '20:00' }, closed: { type: Boolean, default: false } }
  },
  
  // Break/Lunch hours
  breakTime: {
    enabled: { type: Boolean, default: false },
    start: { type: String, default: '13:00' },
    end: { type: String, default: '14:00' }
  },
  
  // Temporary closure
  temporarilyClosed: {
    type: Boolean,
    default: false,
    description: 'Temporarily closed for maintenance/emergency'
  },
  temporaryClosureReason: String,
  
  // Business information
  employees: {
    type: Number,
    default: 1
  },
  serviceArea: {
    type: Number,
    default: 5,
    description: "Service radius in km"
  },
  verified: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Create index for geospatial queries - only for valid coordinates
pharmacySchema.index({ location: '2dsphere' }, { sparse: true });

// Add additional indexes for faster queries
pharmacySchema.index({ name: 1 });
pharmacySchema.index({ email: 1 });
pharmacySchema.index({ phone: 1 });
pharmacySchema.index({ verified: 1 });
pharmacySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Pharmacy', pharmacySchema);