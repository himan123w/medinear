const mongoose = require('mongoose');

const SaasBillingSchema = new mongoose.Schema({
  pharmacy: { type: mongoose.Schema.Types.ObjectId, ref: 'Pharmacy', required: true },
  
  // Plan Information
  plan: {
    type: String,
    enum: ['starter', 'professional', 'enterprise'],
    default: 'starter',
    description: 'Subscription plan tier'
  },
  
  // Pricing
  monthlyCharge: { type: Number, required: true },
  annualDiscount: { type: Number, default: 10, description: 'Percentage discount for annual billing' },
  billingCycle: {
    type: String,
    enum: ['monthly', 'annual'],
    default: 'monthly'
  },
  
  // Dates
  subscriptionStartDate: { type: Date, default: Date.now },
  nextBillingDate: Date,
  subscriptionEndDate: Date,
  trialEndDate: { type: Date, description: 'Null if not in trial' },
  
  // Status
  status: {
    type: String,
    enum: ['trial', 'active', 'paused', 'cancelled', 'past_due'],
    default: 'trial'
  },
  
  // Payment Information
  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'bank_transfer', 'cheque'],
    default: 'card'
  },
  
  paymentDetails: {
    cardLast4: String,
    cardBrand: String, // visa, mastercard, amex
    email: String,
    phone: String
  },
  
  // Billing History
  invoices: [{
    invoiceNumber: String,
    amount: Number,
    date: Date,
    dueDate: Date,
    paidDate: Date,
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'cancelled'],
      default: 'pending'
    },
    pdfUrl: String
  }],
  
  // Usage Tracking
  features: {
    inventoryItems: { type: Number, default: 500 }, // Limit based on plan
    analyticsRetention: { type: Number, default: 12, description: 'Months of data' },
    stockPredictionItems: { type: Number, default: 100 },
    teamMembers: { type: Number, default: 1 },
    apiCallsPerMonth: { type: Number, default: 10000 },
    customizationLevel: {
      type: String,
      enum: ['none', 'basic', 'advanced'],
      default: 'none'
    }
  },
  
  currentUsage: {
    inventoryItems: { type: Number, default: 0 },
    teamMembers: { type: Number, default: 1 },
    apiCallsThisMonth: { type: Number, default: 0 },
    storageUsedMB: { type: Number, default: 0 }
  },
  
  // Auto-renewal & payment info
  autoRenewal: { type: Boolean, default: true },
  failedPaymentAttempts: { type: Number, default: 0 },
  lastPaymentDate: Date,
  
  // Notes & Communication
  notes: String,
  customTerms: String,
  
  // Metadata
  source: {
    type: String,
    enum: ['web', 'direct', 'referral'],
    default: 'web'
  },
  referralCode: String,
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

SaasBillingSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  if (this.isNew && this.billingCycle === 'monthly') {
    const nextBilling = new Date();
    nextBilling.setMonth(nextBilling.getMonth() + 1);
    this.nextBillingDate = nextBilling;
  }
  next();
});

SaasBillingSchema.index({ pharmacy: 1 });
SaasBillingSchema.index({ status: 1, nextBillingDate: 1 });
SaasBillingSchema.index({ plan: 1 });

module.exports = mongoose.model('SaasBilling', SaasBillingSchema);
