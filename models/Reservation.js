const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  medicine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    required: true
  },
  pharmacy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pharmacy',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled', 'completed'],
    default: 'active'
  },
  reservedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  },
  completedAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  reservationCode: {
    type: String,
    unique: true,
    required: true
  },
  // User information for pharmacy reference
  userInfo: {
    name: String,
    phone: String,
    email: String
  },
  // Medicine information snapshot (in case medicine details change)
  medicineSnapshot: {
    name: String,
    price: Number,
    batchNumber: String
  },
  totalAmount: {
    type: Number,
    required: true
  },
  notes: String,
  // Notification flags
  notifications: {
    pharmacyNotified: { type: Boolean, default: false },
    userNotified: { type: Boolean, default: false },
    expiryWarning: { type: Boolean, default: false }
  }
}, { 
  timestamps: true,
  // Index for efficient queries
  indexes: [
    { expiresAt: 1 },
    { status: 1 },
    { user: 1, status: 1 },
    { pharmacy: 1, status: 1 }
  ]
});

// Auto-expire index (TTL index won't work as we need to restore stock)
// We'll handle expiry in the service layer
reservationSchema.index({ expiresAt: 1, status: 1 });

// Generate unique reservation code
reservationSchema.pre('save', function(next) {
  if (!this.reservationCode) {
    this.reservationCode = `RSV${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  }
  next();
});

// Virtual for time remaining
reservationSchema.virtual('timeRemaining').get(function() {
  if (this.status !== 'active') return 0;
  const now = new Date();
  const remaining = this.expiresAt - now;
  return Math.max(0, Math.floor(remaining / 1000)); // seconds
});

// Virtual for time remaining formatted
reservationSchema.virtual('timeRemainingFormatted').get(function() {
  const seconds = this.timeRemaining;
  if (seconds === 0) return 'Expired';
  
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
});

// Check if reservation is expired
reservationSchema.methods.isExpired = function() {
  return this.status === 'active' && new Date() > this.expiresAt;
};

// Mark as expired
reservationSchema.methods.expire = async function() {
  this.status = 'expired';
  await this.save();
  return this;
};

// Cancel reservation
reservationSchema.methods.cancel = async function() {
  this.status = 'cancelled';
  this.cancelledAt = new Date();
  await this.save();
  return this;
};

// Complete reservation
reservationSchema.methods.complete = async function() {
  this.status = 'completed';
  this.completedAt = new Date();
  await this.save();
  return this;
};

// Add indexes for faster queries
reservationSchema.index({ status: 1 });
reservationSchema.index({ userId: 1 });
reservationSchema.index({ pharmacyId: 1 });
reservationSchema.index({ medicineId: 1 });
reservationSchema.index({ createdAt: -1 });
reservationSchema.index({ expiresAt: 1 });

reservationSchema.set('toJSON', { virtuals: true });
reservationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Reservation', reservationSchema);
