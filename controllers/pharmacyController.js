
const Pharmacy = require('../models/Pharmacy');
const PharmacyHoursService = require('../services/pharmacyHoursService');

exports.addPharmacy = async (req, res) => {
  try {
    const { latitude, longitude, ...otherData } = req.body;
    
    const pharmacyData = {
      ...otherData,
      latitude: latitude || null,
      longitude: longitude || null
    };

    // Store coordinates in GeoJSON format for geospatial queries (only if provided)
    if (latitude && longitude) {
      pharmacyData.location = {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      };
    }

    const pharmacy = await Pharmacy.create(pharmacyData);
    res.status(201).json(pharmacy);
  } catch (err) {
    console.error('Registration error:', err);
    res.status(400).json({ error: err.message });
  }
};

exports.getPharmacies = async (req, res) => {
  try {
    const pharmacies = await Pharmacy.find();
    res.json(pharmacies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get pharmacies near a location (within a radius)
exports.getPharmaciesNearby = async (req, res) => {
  try {
    const { latitude, longitude, lat, lng, maxDistance = 50000 } = req.query;
    const resolvedLatitude = latitude ?? lat;
    const resolvedLongitude = longitude ?? lng;

    if (!resolvedLatitude || !resolvedLongitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const pharmacies = await Pharmacy.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(resolvedLongitude), Number(resolvedLatitude)]
          },
          $maxDistance: Number(maxDistance) // meters
        }
      }
    });

    res.json(pharmacies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Emergency: Find 24x7 pharmacies nearby that have in-stock medicines
exports.emergencyPharmacies = async (req, res) => {
  try {
    const { latitude, longitude, lat, lng, radius = 5, medicineName = '' } = req.query;
    const resolvedLatitude = latitude ?? lat;
    const resolvedLongitude = longitude ?? lng;

    if (!resolvedLatitude || !resolvedLongitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const maxDistance = Number(radius) * 1000; // km -> meters

    // Find pharmacies within radius and flagged as open24x7
    const pharmacies = await Pharmacy.find({
      open24x7: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(resolvedLongitude), Number(resolvedLatitude)]
          },
          $maxDistance: maxDistance
        }
      }
    }).lean();

    // For each pharmacy check medicine availability
    const Medicine = require('../models/Medicine');

    const results = [];
    for (const p of pharmacies) {
      const medQuery = {
        pharmacy: p._id,
        available: true,
        stock: { $gt: 0 }
      };
      if (medicineName) {
        medQuery.name = { $regex: medicineName, $options: 'i' };
      }

      const meds = await Medicine.find(medQuery).limit(20).select('name price stock');
      if (meds && meds.length > 0) {
        // calculate rough distance in km
        const calculateDistance = (lat1, lon1, lat2, lon2) => {
          const R = 6371;
          const dLat = (lat2 - lat1) * Math.PI / 180;
          const dLon = (lon2 - lon1) * Math.PI / 180;
          const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          return R * c;
        };

        const distanceKm = p.latitude && p.longitude
          ? calculateDistance(Number(resolvedLatitude), Number(resolvedLongitude), Number(p.latitude), Number(p.longitude))
          : null;

        results.push({
          pharmacy: p,
          distanceKm,
          availableMedicines: meds
        });
      }
    }

    res.json({ count: results.length, results });
  } catch (err) {
    console.error('Emergency search error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Add drug delivery address
exports.updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { latitude, longitude, area, address } = req.body;

    const updateData = { latitude, longitude, area };
    if (address) updateData.address = address;

    if (latitude && longitude) {
      updateData.location = {
        type: 'Point',
        coordinates: [longitude, latitude]
      };
    }

    const pharmacy = await Pharmacy.findByIdAndUpdate(id, updateData, { new: true });
    res.json(pharmacy);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ===============================
// Get Pharmacies with Open Status
// ===============================
exports.getPharmaciesWithStatus = async (req, res) => {
  try {
    const { filter = 'all', latitude, longitude, radius = 50 } = req.query;
    
    let pharmacies;
    
    // If location provided, filter by nearby
    if (latitude && longitude) {
      const maxDistance = Number(radius) * 1000; // km to meters
      pharmacies = await Pharmacy.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [Number(longitude), Number(latitude)]
            },
            $maxDistance: maxDistance
          }
        }
      }).lean();
    } else {
      pharmacies = await Pharmacy.find().lean();
    }

    // Attach open status to each pharmacy
    const pharmaciesWithStatus = PharmacyHoursService.attachOpenStatus(pharmacies);
    
    // Filter by open status
    const filtered = PharmacyHoursService.filterByOpenStatus(pharmaciesWithStatus, filter);
    
    // Sort by open status (open first)
    const sorted = PharmacyHoursService.sortByOpenStatus(filtered);

    res.json({
      success: true,
      count: sorted.length,
      pharmacies: sorted
    });
  } catch (err) {
    console.error('getPharmaciesWithStatus error:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

// ===============================
// Get Pharmacy Open Status
// ===============================
exports.getPharmacyOpenStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const pharmacy = await Pharmacy.findById(id).lean();
    
    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        error: 'Pharmacy not found'
      });
    }

    const openStatus = PharmacyHoursService.calculateOpenStatus(pharmacy);

    res.json({
      success: true,
      pharmacy: pharmacy.name,
      openStatus
    });
  } catch (err) {
    console.error('getPharmacyOpenStatus error:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

// ===============================
// Update Pharmacy Operating Hours
// ===============================
exports.updateOperatingHours = async (req, res) => {
  try {
    const { id } = req.params;
    const { operatingHours, open24x7, breakTime, temporarilyClosed, temporaryClosureReason } = req.body;

    const updateData = {};
    if (operatingHours) updateData.operatingHours = operatingHours;
    if (open24x7 !== undefined) updateData.open24x7 = open24x7;
    if (breakTime) updateData.breakTime = breakTime;
    if (temporarilyClosed !== undefined) updateData.temporarilyClosed = temporarilyClosed;
    if (temporaryClosureReason) updateData.temporaryClosureReason = temporaryClosureReason;

    const pharmacy = await Pharmacy.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        error: 'Pharmacy not found'
      });
    }

    const openStatus = PharmacyHoursService.calculateOpenStatus(pharmacy.toObject());

    res.json({
      success: true,
      message: 'Operating hours updated successfully',
      pharmacy,
      currentStatus: openStatus
    });
  } catch (err) {
    console.error('updateOperatingHours error:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};