const express = require('express');
const router = express.Router();
const {
  submitRating,
  getPharmacyRatings,
  getUserRating,
  deleteRating,
  getTopRatedPharmacies,
  getPharmacyRatingSummary,
  getRatingsDistribution
} = require('../controllers/ratingController');

// Submit or update a rating
router.post('/submit', submitRating);

// Get all ratings for a pharmacy
router.get('/pharmacy/:pharmacyId', getPharmacyRatings);

// Get user's rating for a specific pharmacy
router.get('/pharmacy/:pharmacyId/user-rating', getUserRating);

// Get pharmacy rating summary (averages and stats)
router.get('/pharmacy/:pharmacyId/summary', getPharmacyRatingSummary);

// Get ratings distribution
router.get('/pharmacy/:pharmacyId/distribution', getRatingsDistribution);

// Get top-rated pharmacies
router.get('/top-rated', getTopRatedPharmacies);

// Delete a rating
router.delete('/:ratingId', deleteRating);

module.exports = router;
