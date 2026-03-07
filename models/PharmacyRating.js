const mongoose = require("mongoose");

const pharmacyRatingSchema = new mongoose.Schema({
  pharmacy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pharmacy',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userPhone: {
    type: String,
    required: true
  },
  userName: String,
  
  // Three rating categories
  availabilityAccuracy: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    description: "How accurate was the medicine availability info (1-5)"
  },
  price: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    description: "How fair were the prices (1-5)"
  },
  behaviour: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    description: "How good was the staff behaviour (1-5)"
  },
  
  // Overall rating (calculated average)
  overallRating: {
    type: Number,
    min: 1,
    max: 5,
    description: "Average of all three ratings"
  },
  
  // Additional feedback
  comment: {
    type: String,
    maxlength: 500,
    description: "Optional detailed feedback"
  },
  
  reviewDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for finding ratings by pharmacy and user
pharmacyRatingSchema.index({ pharmacy: 1, user: 1 }, { unique: true });
pharmacyRatingSchema.index({ pharmacy: 1 });
pharmacyRatingSchema.index({ user: 1 });

// Pre-save hook to calculate overall rating
pharmacyRatingSchema.pre('save', function(next) {
  if (this.availabilityAccuracy && this.price && this.behaviour) {
    this.overallRating = (this.availabilityAccuracy + this.price + this.behaviour) / 3;
  }
  next();
});

module.exports = mongoose.model("PharmacyRating", pharmacyRatingSchema);
