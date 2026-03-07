const mongoose = require('mongoose');

const SubscriptionItemSchema = new mongoose.Schema({
  medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: false },
  name: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  dose: { type: String },
  frequency: { type: String, enum: ['once-daily', 'twice-daily', 'thrice-daily', 'as-needed'], default: 'once-daily' },
  notes: { type: String } // e.g., "Morning after breakfast", "With water"
});

const ChronicPatientDetailsSchema = new mongoose.Schema({
  disease: { type: String, enum: ['diabetes', 'bp', 'heart'], required: true },
  diagnosisDate: Date,
  severity: { type: String, enum: ['mild', 'moderate', 'severe'], default: 'moderate' },
  doctorName: String,
  doctorPhone: String,
  hospitalName: String,
  medicalHistory: [String], // Previous diseases/conditions
  allergies: [String],
  lastCheckupDate: Date,
  bloodPressureReading: { // For BP patients
    systolic: Number,
    diastolic: Number,
    recordDate: Date
  },
  fastingBloodSugar: Number, // For Diabetes patients
  postprandialBloodSugar: Number,
  lastLabTestDate: Date,
  labTestResults: String // e.g., blood report, ECG results
});

const SubscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  phone: { type: String, required: true },
  email: { type: String },
  diseaseType: { type: String, enum: ['diabetes', 'bp', 'heart'], required: true },
  patientDetails: ChronicPatientDetailsSchema,
  items: { type: [SubscriptionItemSchema], default: [] },
  frequency: { type: String, enum: ['monthly', 'quarterly', 'half-yearly'], default: 'monthly' },
  nextDeliveryDate: { type: Date },
  address: { type: String },
  city: String,
  state: String,
  zipCode: String,
  paymentMethod: { type: String, enum: ['cod', 'card', 'upi'], default: 'cod' },
  monthlyPrice: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'paused', 'cancelled'], default: 'active' },
  autoRenew: { type: Boolean, default: true },
  reminderFrequency: { type: String, enum: ['daily', 'weekly', 'before-delivery'], default: 'before-delivery' },
  enrolledDate: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

SubscriptionSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Subscription', SubscriptionSchema);
