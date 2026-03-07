const mongoose = require('mongoose');

const backInStockNotificationSchema = new mongoose.Schema(
  {
    // User or anonymous
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: null,
      description: 'Email for notification (if user not logged in)'
    },
    
    // Medicine & Pharmacy
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: true
    },
    medicineName: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    dosage: {
      type: String,
      default: '',
      trim: true
    },
    pharmacy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pharmacy',
      required: true
    },
    pharmacyName: {
      type: String,
      required: true,
      trim: true
    },
    pharmacyPhone: {
      type: String,
      default: '',
      trim: true
    },
    
    // Stock tracking
    stockStatusAtSubscription: {
      type: String,
      enum: ['out_of_stock', 'low_stock', 'available'],
      default: 'out_of_stock',
      describe: 'Stock status when user subscribed'
    },
    currentStock: {
      type: Number,
      default: 0
    },
    requiredStock: {
      type: Number,
      default: 1,
      min: 1,
      describe: 'Minimum stock needed to trigger notification'
    },
    
    // Notification status
    status: {
      type: String,
      enum: ['active', 'notified', 'cancelled', 'expired'],
      default: 'active',
      index: true
    },
    notificationSentAt: {
      type: Date,
      default: null
    },
    notificationSentVia: {
      type: [String],
      enum: ['email', 'sms', 'push', 'in_app'],
      default: ['email'],
      describe: 'Channels used to send notification'
    },
    
    // Preferences
    notificationMethod: {
      type: String,
      enum: ['email', 'sms', 'push', 'all'],
      default: 'email'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    
    // Price tracking (optional)
    maxPriceLimit: {
      type: Number,
      default: null,
      describe: 'Only notify if price is below this limit'
    },
    priceAtSubscription: {
      type: Number,
      default: null
    },
    
    // Metadata
    deviceId: {
      type: String,
      default: null,
      trim: true
    },
    searchQuery: {
      type: String,
      default: null,
      trim: true,
      describe: 'Original search query that led to subscription'
    },
    checkCount: {
      type: Number,
      default: 0,
      describe: 'Number of times this subscription was checked'
    },
    lastCheckedAt: {
      type: Date,
      default: null
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      describe: 'Subscription expires after 90 days'
    },
    
    // Notes
    notes: {
      type: String,
      default: '',
      trim: true
    }
  },
  {
    timestamps: true,
    collection: 'back_in_stock_notifications'
  }
);

// Indexes for efficient querying
backInStockNotificationSchema.index({ medicineName: 1, status: 1 });
backInStockNotificationSchema.index({ pharmacy: 1, status: 1 });
backInStockNotificationSchema.index({ user: 1, status: 1 });
backInStockNotificationSchema.index({ email: 1, status: 1 });
backInStockNotificationSchema.index({ status: 1, expiresAt: 1 });
backInStockNotificationSchema.index({ createdAt: -1 });

// Methods
backInStockNotificationSchema.methods.markAsNotified = function() {
  this.status = 'notified';
  this.notificationSentAt = new Date();
  return this.save();
};

backInStockNotificationSchema.methods.cancel = function() {
  this.status = 'cancelled';
  return this.save();
};

backInStockNotificationSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

backInStockNotificationSchema.methods.incrementCheckCount = function() {
  this.checkCount += 1;
  this.lastCheckedAt = new Date();
  return this.save();
};

// Statics
backInStockNotificationSchema.statics.getActivePendingNotifications = function() {
  return this.find({
    status: 'active',
    expiresAt: { $gt: new Date() }
  });
};

backInStockNotificationSchema.statics.getByPharmacyAndMedicine = function(pharmacyId, medicineId) {
  return this.find({
    pharmacy: pharmacyId,
    medicine: medicineId,
    status: 'active',
    expiresAt: { $gt: new Date() }
  });
};

backInStockNotificationSchema.statics.getByUser = function(userId) {
  return this.find({
    user: userId,
    status: 'active',
    expiresAt: { $gt: new Date() }
  }).sort({ createdAt: -1 });
};

backInStockNotificationSchema.statics.getByEmail = function(email) {
  return this.find({
    email: email.toLowerCase(),
    status: 'active',
    expiresAt: { $gt: new Date() }
  }).sort({ createdAt: -1 });
};

module.exports = mongoose.model('BackInStockNotification', backInStockNotificationSchema);
