const mongoose = require('mongoose');

const medicineReminderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    medicineName: {
      type: String,
      required: true,
      trim: true
    },
    frequency: {
      type: String,
      enum: ['weekly', 'monthly', 'quarterly'],
      default: 'monthly',
      required: true
    },
    daysBeforeReminder: {
      type: Number,
      default: 3,
      min: 0,
      max: 30,
      description: 'Number of days before refill date to send reminder'
    },
    nextReminderDate: {
      type: Date,
      required: true
    },
    lastReminderDate: {
      type: Date,
      default: null
    },
    enabled: {
      type: Boolean,
      default: true
    },
    dosage: {
      type: String,
      default: ''
    },
    category: {
      type: String,
      enum: ['diabetes', 'bp', 'thyroid', 'vitamin', 'antibiotic', 'painkiller', 'other'],
      default: 'other'
    },
    notes: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

// Index for checking reminders to trigger
medicineReminderSchema.index({ nextReminderDate: 1, enabled: 1 });
medicineReminderSchema.index({ user: 1, enabled: 1 });

module.exports = mongoose.model('MedicineReminder', medicineReminderSchema);
