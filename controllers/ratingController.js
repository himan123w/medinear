const PharmacyRating = require('../models/PharmacyRating');
const Pharmacy = require('../models/Pharmacy');
const mongoose = require('mongoose');

// Submit a rating for a pharmacy
exports.submitRating = async (req, res) => {
  try {
    const { pharmacyId, availabilityAccuracy, price, behaviour, comment } = req.body;
    const userPhone = req.user?.phone || req.body.userPhone;
    const userId = req.user?.id;

    // Validate ratings are between 1-5
    if (
      availabilityAccuracy < 1 || availabilityAccuracy > 5 ||
      price < 1 || price > 5 ||
      behaviour < 1 || behaviour > 5
    ) {
      return res.status(400).json({
        error: 'All ratings must be between 1 and 5'
      });
    }

    // Check if pharmacy exists
    const pharmacy = await Pharmacy.findById(pharmacyId);
    if (!pharmacy) {
      return res.status(404).json({ error: 'Pharmacy not found' });
    }

    // Check if user already rated this pharmacy
    let rating = await PharmacyRating.findOne({
      pharmacy: pharmacyId,
      userPhone: userPhone
    });

    if (rating) {
      // Update existing rating
      rating.availabilityAccuracy = availabilityAccuracy;
      rating.price = price;
      rating.behaviour = behaviour;
      rating.comment = comment || rating.comment;
      rating.reviewDate = new Date();
      await rating.save();
      
      return res.json({
        message: 'Rating updated successfully',
        rating: rating
      });
    }

    // Create new rating
    const newRating = new PharmacyRating({
      pharmacy: pharmacyId,
      user: userId,
      userPhone: userPhone,
      userName: req.user?.name || req.body.userName || 'Anonymous',
      availabilityAccuracy,
      price,
      behaviour,
      comment,
      reviewDate: new Date()
    });

    await newRating.save();

    res.status(201).json({
      message: 'Rating submitted successfully',
      rating: newRating
    });
  } catch (err) {
    console.error('Rating submission error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get all ratings for a pharmacy
exports.getPharmacyRatings = async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    const { sort = '-createdAt', limit = 50, skip = 0 } = req.query;

    const ratings = await PharmacyRating.find({ pharmacy: pharmacyId })
      .sort(sort)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .select('-user -userPhone'); // Exclude user phone for privacy

    // Calculate rating statistics
    const stats = await PharmacyRating.aggregate([
      { $match: { pharmacy: mongoose.Types.ObjectId(pharmacyId) } },
      {
        $group: {
          _id: '$pharmacy',
          avgAvailabilityAccuracy: { $avg: '$availabilityAccuracy' },
          avgPrice: { $avg: '$price' },
          avgBehaviour: { $avg: '$behaviour' },
          avgOverallRating: { $avg: '$overallRating' },
          totalRatings: { $sum: 1 },
          distributionAvailability: {
            $push: '$availabilityAccuracy'
          },
          distributionPrice: {
            $push: '$price'
          },
          distributionBehaviour: {
            $push: '$behaviour'
          }
        }
      }
    ]);

    res.json({
      ratings,
      statistics: stats[0] || {
        avgAvailabilityAccuracy: 0,
        avgPrice: 0,
        avgBehaviour: 0,
        avgOverallRating: 0,
        totalRatings: 0
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get user's rating for a specific pharmacy
exports.getUserRating = async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    const userPhone = req.user?.phone || req.query.userPhone;

    if (!userPhone) {
      return res.status(400).json({ error: 'User phone is required' });
    }

    const rating = await PharmacyRating.findOne({
      pharmacy: pharmacyId,
      userPhone: userPhone
    });

    if (!rating) {
      return res.status(404).json({ error: 'No rating found for this user' });
    }

    res.json(rating);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a rating
exports.deleteRating = async (req, res) => {
  try {
    const { ratingId } = req.params;
    const userPhone = req.user?.phone || req.body.userPhone;

    const rating = await PharmacyRating.findById(ratingId);
    
    if (!rating) {
      return res.status(404).json({ error: 'Rating not found' });
    }

    // Check if user owns this rating
    if (rating.userPhone !== userPhone) {
      return res.status(403).json({ error: 'You can only delete your own ratings' });
    }

    await PharmacyRating.findByIdAndDelete(ratingId);

    res.json({ message: 'Rating deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get top-rated pharmacies
exports.getTopRatedPharmacies = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const topPharmacies = await PharmacyRating.aggregate([
      {
        $group: {
          _id: '$pharmacy',
          avgRating: { $avg: '$overallRating' },
          avgAvailability: { $avg: '$availabilityAccuracy' },
          avgPrice: { $avg: '$price' },
          avgBehaviour: { $avg: '$behaviour' },
          totalRatings: { $sum: 1 }
        }
      },
      { $sort: { avgRating: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'pharmacies',
          localField: '_id',
          foreignField: '_id',
          as: 'pharmacyDetails'
        }
      }
    ]);

    res.json(topPharmacies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get pharmacy rating summary
exports.getPharmacyRatingSummary = async (req, res) => {
  try {
    const { pharmacyId } = req.params;

    const summary = await PharmacyRating.aggregate([
      { $match: { pharmacy: mongoose.Types.ObjectId(pharmacyId) } },
      {
        $group: {
          _id: '$pharmacy',
          avgAvailabilityAccuracy: { $avg: '$availabilityAccuracy' },
          avgPrice: { $avg: '$price' },
          avgBehaviour: { $avg: '$behaviour' },
          avgOverallRating: { $avg: '$overallRating' },
          totalRatings: { $sum: 1 },
          lastRatedDate: { $max: '$reviewDate' }
        }
      }
    ]);

    if (summary.length === 0) {
      return res.json({
        avgAvailabilityAccuracy: 0,
        avgPrice: 0,
        avgBehaviour: 0,
        avgOverallRating: 0,
        totalRatings: 0
      });
    }

    res.json(summary[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get ratings distribution for a pharmacy
exports.getRatingsDistribution = async (req, res) => {
  try {
    const { pharmacyId } = req.params;

    const distribution = await PharmacyRating.aggregate([
      { $match: { pharmacy: mongoose.Types.ObjectId(pharmacyId) } },
      {
        $facet: {
          availability: [
            { $group: { _id: '$availabilityAccuracy', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
          ],
          price: [
            { $group: { _id: '$price', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
          ],
          behaviour: [
            { $group: { _id: '$behaviour', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
          ]
        }
      }
    ]);

    res.json(distribution[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
