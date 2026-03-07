const mongoose = require('mongoose');

const priceDropAlertSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      trim: true
    },
    searchQuery: {
      type: String,
      required: true,
      trim: true
    },
    normalizedQuery: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: true
    },
    medicineName: {
      type: String,
      required: true,
      trim: true
    },
    pharmacy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pharmacy',
      required: true
    },
    pharmacyName: {
      type: String,
      default: ''
    },
    previousPrice: {
      type: Number,
      required: true
    },
    newPrice: {
      type: Number,
      required: true
    },
    dropPercent: {
      type: Number,
      required: true
    },
    isRead: {
      type: Boolean,
      default: false
    },
    alertedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

priceDropAlertSchema.index({ deviceId: 1, isRead: 1, alertedAt: -1 });
priceDropAlertSchema.index({ medicine: 1, deviceId: 1, createdAt: -1 });
priceDropAlertSchema.index({ normalizedQuery: 1, deviceId: 1 });

module.exports = mongoose.model('PriceDropAlert', priceDropAlertSchema);
