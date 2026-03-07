const mongoose = require("mongoose");

const prescriptionResponseSchema = new mongoose.Schema({
  pharmacy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pharmacy',
    required: true
  },
  pharmacyName: String,
  pharmacyPhone: String,
  pharmacyArea: String,
  medicines: [{
    name: String,
    available: Boolean,
    price: Number,
    quantity: Number,
    deliveryTime: Number
  }],
  message: String,
  respondedAt: {
    type: Date,
    default: Date.now
  }
});

const prescriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auth',
    required: true
  },
  userName: String,
  userPhone: String,
  prescriptionImage: {
    type: String, // URL or base64 or filename
    required: true
  },
  imageSize: Number, // in bytes
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    maxLength: 500
  },
  status: {
    type: String,
    enum: ['pending', 'responded', 'completed', 'expired'],
    default: 'pending'
  },
  medicines: [{
    name: String,
    quantity: String,
    dosage: String
  }],
  expiryDate: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  },
  // Pharmacy responses
  responses: [prescriptionResponseSchema],
  responseCount: {
    type: Number,
    default: 0
  },
  // Nearby pharmacies for auto-notification
  nearbyPharmacies: [{
    pharmacyId: mongoose.Schema.Types.ObjectId,
    distance: Number
  }],
  latitude: Number,
  longitude: Number,
  // Conversion tracking
  selectedPharmacy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pharmacy'
  },
  conversionStatus: {
    type: String,
    enum: ['not-converted', 'negotiating', 'converted'],
    default: 'not-converted'
  },
  views: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Index for user prescriptions
prescriptionSchema.index({ user: 1, createdAt: -1 });
// Index for pharmacy responses
prescriptionSchema.index({ 'responses.pharmacy': 1 });
// TTL index for expiring prescriptions (auto-delete after 30 days)
prescriptionSchema.index({ expiryDate: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Prescription", prescriptionSchema);
