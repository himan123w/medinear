const mongoose = require('mongoose');

const priceWatchSchema = new mongoose.Schema(
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
    lastSeenBestPrice: {
      type: Number,
      default: null
    },
    lastNotifiedPrice: {
      type: Number,
      default: null
    },
    totalSearches: {
      type: Number,
      default: 1
    },
    source: {
      type: String,
      enum: ['search', 'compare', 'manual'],
      default: 'search'
    },
    lastSearchLatitude: {
      type: Number,
      default: null
    },
    lastSearchLongitude: {
      type: Number,
      default: null
    },
    lastSearchedAt: {
      type: Date,
      default: Date.now
    },
    enabled: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

priceWatchSchema.index({ deviceId: 1, normalizedQuery: 1 }, { unique: true });
priceWatchSchema.index({ normalizedQuery: 1, enabled: 1 });
priceWatchSchema.index({ deviceId: 1, lastSearchedAt: -1 });

module.exports = mongoose.model('PriceWatch', priceWatchSchema);
