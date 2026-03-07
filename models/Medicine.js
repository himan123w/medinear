const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  available: {
    type: Boolean,
    default: true
  },
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  stockAlert: {
    type: Number,
    default: 10,
    description: "Alert when stock falls below this number"
  },
  lastRestocked: {
    type: Date,
    default: Date.now
  },
  pharmacy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Pharmacy",
    required: true
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    enum: ['Antibiotics', 'Pain Relief', 'Cold & Flu', 'Vitamins', 'Digestive', 'Skin Care', 'Other'],
    default: 'Other'
  },

  // Medicine Composition & Alternative Matching
  composition: {
    type: String,
    description: "Active ingredient(s) - e.g., 'Paracetamol 650mg', 'Ibuprofen 400mg'"
  },
  genericName: {
    type: String,
    description: "Generic/scientific name for matching alternatives"
  },
  dosageForm: {
    type: String,
    enum: ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Drops', 'Inhaler', 'Other'],
    default: 'Tablet'
  },
  strength: {
    type: String,
    description: "Strength/dosage - e.g., '650mg', '500mg', '10ml'"
  },
  manufacturer: {
    type: String,
    description: "Manufacturing company"
  },
  isGeneric: {
    type: Boolean,
    default: false,
    description: "Is this a generic (non-branded) medicine?"
  },

  // Smart Availability Confidence Tracking
  recentPurchases: {
    type: Number,
    default: 0,
    description: "Recent purchase count for velocity calculation"
  },
  confidenceScore: {
    type: Number,
    default: 50,
    min: 0,
    max: 100,
    description: "Calculated trust confidence score (0-100%)"
  },
  confidenceLevel: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium',
    description: "Trust level: high (80+), medium (50-79), low (<50)"
  }
}, { timestamps: true });

// Index for confidence queries
medicineSchema.index({ confidenceScore: -1 });
medicineSchema.index({ confidenceLevel: 1 });

// Index for alternatives matching
medicineSchema.index({ composition: 1 });
medicineSchema.index({ genericName: 1 });
medicineSchema.index({ name: 'text', composition: 'text', genericName: 'text' });

// Additional indexes for faster queries
medicineSchema.index({ pharmacy: 1 });
medicineSchema.index({ createdAt: -1 });
medicineSchema.index({ stock: 1 });

module.exports = mongoose.model("Medicine", medicineSchema);