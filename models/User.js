const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    sparse: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'pharmacy'],
    default: 'user'
  },
  isGuest: {
    type: Boolean,
    default: false
  },
  deviceId: String,
  profilePicture: String,
  medicalHistory: [String],
  allergies: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add indexes for faster queries
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);
