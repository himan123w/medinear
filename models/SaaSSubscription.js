const mongoose = require('mongoose');

const SaaSSubscriptionSchema = new mongoose.Schema({
  pharmacy: { type: mongoose.Schema.Types.ObjectId, ref: 'Pharmacy', required: true },
  plan: { type: String, enum: ['basic','pro','enterprise'], default: 'basic' },
  monthlyCharge: { type: Number, default: 499 },
  status: { type: String, enum: ['active','paused','cancelled'], default: 'active' },
  nextBillingDate: Date,
  paymentMethod: { type: String, default: 'card' },
  paymentInfo: {},
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});

SaaSSubscriptionSchema.pre('save', function(next){ this.updatedAt = new Date(); next(); });

module.exports = mongoose.model('SaaSSubscription', SaaSSubscriptionSchema);
