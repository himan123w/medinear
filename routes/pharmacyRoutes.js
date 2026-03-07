
const express = require('express');
const router = express.Router();
const { 
  addPharmacy, 
  getPharmacies, 
  getPharmaciesNearby, 
  emergencyPharmacies, 
  updateLocation,
  getPharmaciesWithStatus,
  getPharmacyOpenStatus,
  updateOperatingHours
} = require('../controllers/pharmacyController');

router.post('/add', addPharmacy);
router.get('/', getPharmacies);
router.get('/nearby', getPharmaciesNearby);
router.get('/emergency', emergencyPharmacies);
router.put('/:id/location', updateLocation);

// Open Status Routes
router.get('/with-status', getPharmaciesWithStatus);
router.get('/:id/open-status', getPharmacyOpenStatus);
router.put('/:id/operating-hours', updateOperatingHours);

module.exports = router;