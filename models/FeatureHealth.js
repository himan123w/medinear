const mongoose = require('mongoose');

const featureHealthSchema = new mongoose.Schema(
  {
    featureKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    featureName: {
      type: String,
      required: true,
      trim: true
    },
    routePattern: {
      type: String,
      required: true,
      trim: true
    },
    totalHits: {
      type: Number,
      default: 0
    },
    successHits: {
      type: Number,
      default: 0
    },
    failureHits: {
      type: Number,
      default: 0
    },
    clientErrorHits: {
      type: Number,
      default: 0
    },
    serverErrorHits: {
      type: Number,
      default: 0
    },
    totalResponseTimeMs: {
      type: Number,
      default: 0
    },
    lastStatusCode: {
      type: Number,
      default: 0
    },
    lastStatus: {
      type: String,
      enum: ['healthy', 'warning', 'critical', 'unknown'],
      default: 'unknown'
    },
    lastErrorMessage: {
      type: String,
      default: ''
    },
    lastHitAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

featureHealthSchema.virtual('successRate').get(function getSuccessRate() {
  if (!this.totalHits) return 0;
  return Number(((this.successHits / this.totalHits) * 100).toFixed(2));
});

featureHealthSchema.virtual('averageResponseTimeMs').get(function getAverageResponseTimeMs() {
  if (!this.totalHits) return 0;
  return Number((this.totalResponseTimeMs / this.totalHits).toFixed(2));
});

featureHealthSchema.index({ lastStatus: 1, updatedAt: -1 });

featureHealthSchema.set('toJSON', { virtuals: true });
featureHealthSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('FeatureHealth', featureHealthSchema);