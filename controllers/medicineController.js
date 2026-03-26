const Medicine = require("../models/Medicine");
const Pharmacy = require("../models/Pharmacy");
const AvailabilityConfidenceService = require("../services/availabilityConfidenceService");
const AlternativesService = require("../services/alternativesService");
const PriceDropAlertService = require("../services/priceDropAlertService");

// ===============================
// Medicine Alternatives Mapping
// ===============================
const MEDICINE_ALTERNATIVES = {
  'paracetamol': ['calpol', 'crocin'],
  'calpol': ['paracetamol', 'crocin'],
  'crocin': ['paracetamol', 'calpol'],
  'aspirin': ['ibuprofen', 'diclofenac'],
  'ibuprofen': ['aspirin', 'diclofenac', 'paracetamol'],
  'diclofenac': ['ibuprofen', 'aspirin'],
  'amoxicillin': ['azithromycin', 'cephalexin'],
  'azithromycin': ['amoxicillin', 'erythromycin'],
  'cephalexin': ['amoxicillin', 'dicloxacillin'],
};

// Add Medicine (Protected)
exports.addMedicine = async (req, res) => {
  try {
    const { name, price, available, category, stock, stockAlert } = req.body;

    const medicine = await Medicine.create({
      name,
      price,
      available,
      category: category || 'Other',
      stock: stock || 0,
      stockAlert: stockAlert || 10,
      pharmacy: req.user.id   // 🔥 Comes from JWT
    });

    res.status(201).json(medicine);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// ===============================
// Get My Medicines (Protected)
// ===============================
exports.getMyMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find({
      pharmacy: req.user.id
    });

    // Add confidence scores to each medicine
    const medicinesWithConfidence = medicines.map(medicine => {
      const confidenceInfo = AvailabilityConfidenceService.buildAvailabilityInfo(medicine.toObject());
      return {
        ...medicine.toObject(),
        availability: confidenceInfo
      };
    });

    res.json(medicinesWithConfidence);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// Update Medicine (Protected)
// ===============================
exports.updateMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findOne({
      _id: req.params.id,
      pharmacy: req.user.id
    });

    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    const { name, price, available, category } = req.body;
    const oldPrice = medicine.price;

    medicine.name = name || medicine.name;
    if (price !== undefined && price !== null && price !== '') {
      medicine.price = Number(price);
    }
    medicine.available =
      available !== undefined ? available : medicine.available;
    medicine.category = category || medicine.category;

    await medicine.save();

    let priceDropMeta = { alertsCreated: 0 };
    if (medicine.price < oldPrice) {
      priceDropMeta = await PriceDropAlertService.triggerPriceDropAlerts({
        medicine,
        oldPrice,
        newPrice: medicine.price
      });
    }

    res.json({
      message: "Medicine updated successfully",
      medicine,
      priceDropAlertsCreated: priceDropMeta.alertsCreated || 0
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// Delete Medicine (Protected)
// ===============================
exports.deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findOneAndDelete({
      _id: req.params.id,
      pharmacy: req.user.id
    });

    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    res.json({ message: "Medicine deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Search Medicine (Public)
exports.searchMedicine = async (req, res) => {
  try {
    const { name, deviceId } = req.query;

    const medicines = await Medicine.find({
      name: new RegExp(name, "i"),
      available: true
    }).populate("pharmacy", "_id name phone area");

    // Add confidence scores to each medicine
    const medicinesWithConfidence = medicines.map(medicine => {
      const confidenceInfo = AvailabilityConfidenceService.buildAvailabilityInfo(medicine.toObject());
      return {
        ...medicine.toObject(),
        availability: confidenceInfo
      };
    });

    const bestPrice = medicinesWithConfidence.length
      ? Math.min(...medicinesWithConfidence.map((m) => m.price))
      : null;

    if (deviceId && name) {
      await PriceDropAlertService.trackSearchWatch({
        deviceId,
        searchQuery: name,
        bestPrice,
        source: 'search'
      });
    }

    res.json(medicinesWithConfidence);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// Get Best Medicines (Top Rated) - Public
// ===============================
exports.getBestMedicines = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const bestMedicines = await Medicine.find({
      available: true,
      rating: { $gt: 0 }
    })
      .populate("pharmacy", "_id name phone area")
      .sort({ rating: -1, reviews: -1 })
      .limit(limit);

    // Add confidence scores to each medicine
    const medicinesWithConfidence = bestMedicines.map(medicine => {
      const confidenceInfo = AvailabilityConfidenceService.buildAvailabilityInfo(medicine.toObject());
      return {
        ...medicine.toObject(),
        availability: confidenceInfo
      };
    });

    res.json(medicinesWithConfidence);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// Get Recommendations (Trending/Popular) - Public
// ===============================
exports.getRecommendations = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    // Get medicines by views, recent creations, and ratings
    const recommendations = await Medicine.find({
      available: true
    })
      .populate("pharmacy", "_id name phone area")
      .sort({ views: -1, createdAt: -1, rating: -1 })
      .limit(limit);

    // Add confidence scores to each medicine
    const recommendationsWithConfidence = recommendations.map(medicine => {
      const confidenceInfo = AvailabilityConfidenceService.buildAvailabilityInfo(medicine.toObject());
      return {
        ...medicine.toObject(),
        availability: confidenceInfo
      };
    });

    res.json(recommendationsWithConfidence);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// Get By Category - Public
// ===============================
exports.getMedicinesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    const medicines = await Medicine.find({
      category,
      available: true
    })
      .populate("pharmacy", "_id name phone area")
      .sort({ rating: -1, views: -1 })
      .limit(limit);

    // Add confidence scores to each medicine
    const medicinesWithConfidence = medicines.map(medicine => {
      const confidenceInfo = AvailabilityConfidenceService.buildAvailabilityInfo(medicine.toObject());
      return {
        ...medicine.toObject(),
        availability: confidenceInfo
      };
    });

    res.json(medicinesWithConfidence);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// Add Rating to Medicine - Protected
// ===============================
exports.addRating = async (req, res) => {
  try {
    const { medicineId } = req.params;
    const { rating } = req.body;

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const medicine = await Medicine.findById(medicineId);
    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    // Update rating (simple average)
    const totalRating = medicine.rating * medicine.reviews + rating;
    medicine.reviews += 1;
    medicine.rating = totalRating / medicine.reviews;

    await medicine.save();

    res.json({ message: "Rating added successfully", medicine });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// Increment Views - Public
// ===============================
exports.incrementViews = async (req, res) => {
  try {
    const { medicineId } = req.params;

    const medicine = await Medicine.findByIdAndUpdate(
      medicineId,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    res.json(medicine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// Get Medicines Near Me - Public (Geolocation)
// ===============================
exports.getNearbyMedicines = async (req, res) => {
  try {
    const { medicineName, latitude, longitude, lat, lng, radius = 5 } = req.query;
    const { sortBy = 'nearest' } = req.query;
    const resolvedLatitude = latitude ?? lat;
    const resolvedLongitude = longitude ?? lng;

    if (!resolvedLatitude || !resolvedLongitude) {
      return res.status(400).json({ message: "Latitude and longitude are required" });
    }

    const latValue = parseFloat(resolvedLatitude);
    const lngValue = parseFloat(resolvedLongitude);
    const radiusKm = parseFloat(radius);

    // Haversine formula to calculate distance
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // Earth's radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    // Build medicine search query
    let medicineQuery = { available: true };
    if (medicineName) {
      medicineQuery.name = new RegExp(medicineName, "i");
    }

    // Get medicines and populate pharmacy data
    const medicines = await Medicine.find(medicineQuery)
      .populate({
        path: "pharmacy",
        select: "_id name phone area latitude longitude deliveryTime licenseNumber address"
      });

    // Filter medicines from pharmacies within radius and add distance info
    const nearbyMedicines = medicines
      .filter(medicine => {
        if (!medicine.pharmacy.latitude || !medicine.pharmacy.longitude) {
          return false;
        }
        const distance = calculateDistance(
          latValue,
          lngValue,
          medicine.pharmacy.latitude,
          medicine.pharmacy.longitude
        );
        return distance <= radiusKm;
      })
      .map(medicine => {
        const distance = calculateDistance(
          latValue,
          lngValue,
          medicine.pharmacy.latitude,
          medicine.pharmacy.longitude
        );
        const confidenceInfo = AvailabilityConfidenceService.buildAvailabilityInfo(medicine.toObject());
        return {
          ...medicine.toObject(),
          distance: parseFloat(distance.toFixed(2)),
          deliveryTime: medicine.pharmacy.deliveryTime || 30,
          availability: confidenceInfo
        };
      });

    // Sort results
    if (sortBy === 'nearest') {
      nearbyMedicines.sort((a, b) => a.distance - b.distance);
    } else if (sortBy === 'cheapest') {
      nearbyMedicines.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'fastest') {
      nearbyMedicines.sort((a, b) => a.deliveryTime - b.deliveryTime);
    }

    res.json({
      count: nearbyMedicines.length,
      medicines: nearbyMedicines
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// Update Stock Quantity - Protected
// ===============================
exports.updateStock = async (req, res) => {
  try {
    const { medicineId } = req.params;
    const { quantity, operation = 'set' } = req.body; // operation: set, add, subtract

    const medicine = await Medicine.findOne({
      _id: medicineId,
      pharmacy: req.user.id
    });

    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    let newStock = medicine.stock;

    if (operation === 'set') {
      newStock = quantity;
    } else if (operation === 'add') {
      newStock = medicine.stock + quantity;
    } else if (operation === 'subtract') {
      newStock = Math.max(0, medicine.stock - quantity);
    }

    medicine.stock = newStock;
    medicine.lastRestocked = new Date();
    
    // Auto-update available status based on stock
    medicine.available = newStock > 0;

    await medicine.save();

    res.json({ 
      message: "Stock updated successfully", 
      medicine,
      stockLevel: newStock > 0 ? (newStock > medicine.stockAlert ? 'good' : 'low') : 'out_of_stock'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// Mark Out of Stock - Protected
// ===============================
exports.markOutOfStock = async (req, res) => {
  try {
    const { medicineId } = req.params;

    const medicine = await Medicine.findOne({
      _id: medicineId,
      pharmacy: req.user.id
    });

    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    medicine.available = false;
    medicine.stock = 0;

    await medicine.save();

    res.json({ 
      message: "Medicine marked as out of stock", 
      medicine 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// Restock Medicine - Protected
// ===============================
exports.restockMedicine = async (req, res) => {
  try {
    const { medicineId } = req.params;
    const { quantity, stockAlert } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: "Quantity must be greater than 0" });
    }

    const medicine = await Medicine.findOne({
      _id: medicineId,
      pharmacy: req.user.id
    });

    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    medicine.stock = quantity;
    medicine.available = true;
    medicine.lastRestocked = new Date();
    
    if (stockAlert) {
      medicine.stockAlert = stockAlert;
    }

    await medicine.save();

    res.json({ 
      message: "Medicine restocked successfully", 
      medicine,
      stockStatus: quantity < medicine.stockAlert ? 'low' : 'good'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// Get Stock Status - Protected
// ===============================
exports.getStockStatus = async (req, res) => {
  try {
    const medicines = await Medicine.find({
      pharmacy: req.user.id
    });

    const stockReport = medicines.map(medicine => ({
      id: medicine._id,
      name: medicine.name,
      price: medicine.price,
      stock: medicine.stock,
      stockAlert: medicine.stockAlert,
      available: medicine.available,
      status: medicine.stock === 0 ? 'out_of_stock' : medicine.stock < medicine.stockAlert ? 'low_stock' : 'good',
      lastRestocked: medicine.lastRestocked
    }));

    const summary = {
      totalMedicines: medicines.length,
      inStock: medicines.filter(m => m.available).length,
      outOfStock: medicines.filter(m => !m.available).length,
      lowStock: medicines.filter(m => m.available && m.stock < m.stockAlert).length
    };

    res.json({ stockReport, summary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// Get Pharmacies Within Radius - Using MongoDB 2dsphere Geospatial Query
// ===============================
exports.getPharmaciesWithinRadius = async (req, res) => {
  try {
    const { latitude, longitude, radius = 5 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: "Latitude and longitude are required" });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const radiusMeters = parseFloat(radius) * 1000; // Convert km to meters

    // Use MongoDB 2dsphere $near operator for efficient geospatial queries
    const pharmacies = await Pharmacy.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat] // Note: GeoJSON format is [longitude, latitude]
          },
          $maxDistance: radiusMeters
        }
      },
      latitude: { $exists: true },
      longitude: { $exists: true }
    }).select('name phone area latitude longitude deliveryTime address licenseNumber');

    // Calculate actual distances for sorting and display
    const pharmaciesWithDistance = pharmacies.map(pharmacy => {
      const R = 6371; // Earth's radius in km
      const dLat = (pharmacy.latitude - lat) * Math.PI / 180;
      const dLon = (pharmacy.longitude - lng) * Math.PI / 180;
      const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat * Math.PI / 180) * Math.cos(pharmacy.latitude * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      return {
        ...pharmacy.toObject(),
        distance: parseFloat(distance.toFixed(2))
      };
    });

    res.json({
      count: pharmaciesWithDistance.length,
      searchRadius: radius,
      pharmacies: pharmaciesWithDistance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// Get Medicines Within Radius - Using Pharmacy Location (2dsphere)
// ===============================
exports.getMedicinesWithinRadius = async (req, res) => {
  try {
    const { latitude, longitude, radius = 5, medicineName = '', sortBy = 'nearest' } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: "Latitude and longitude are required" });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const radiusMeters = parseFloat(radius) * 1000;

    // First, find pharmacies within radius using 2dsphere
    const nearbyPharmacies = await Pharmacy.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: radiusMeters
        }
      }
    }).select('_id');

    const pharmacyIds = nearbyPharmacies.map(p => p._id);

    // Build medicine search query
    let medicineQuery = {
      available: true,
      pharmacy: { $in: pharmacyIds }
    };

    if (medicineName) {
      medicineQuery.name = new RegExp(medicineName, 'i');
    }

    // Get medicines from nearby pharmacies
    const medicines = await Medicine.find(medicineQuery)
      .populate({
        path: 'pharmacy',
        select: '_id name phone area latitude longitude deliveryTime licenseNumber address'
      });

    // Calculate distances and add to medicines
    const medicinesWithDistance = medicines.map(medicine => {
      const R = 6371;
      const dLat = (medicine.pharmacy.latitude - lat) * Math.PI / 180;
      const dLon = (medicine.pharmacy.longitude - lng) * Math.PI / 180;
      const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat * Math.PI / 180) * Math.cos(medicine.pharmacy.latitude * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      const confidenceInfo = AvailabilityConfidenceService.buildAvailabilityInfo(medicine.toObject());

      return {
        ...medicine.toObject(),
        distance: parseFloat(distance.toFixed(2)),
        deliveryTime: medicine.pharmacy.deliveryTime || 30,
        availability: confidenceInfo
      };
    });

    // Sort results
    if (sortBy === 'nearest') {
      medicinesWithDistance.sort((a, b) => a.distance - b.distance);
    } else if (sortBy === 'cheapest') {
      medicinesWithDistance.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'fastest') {
      medicinesWithDistance.sort((a, b) => a.deliveryTime - b.deliveryTime);
    }

    res.json({
      count: medicinesWithDistance.length,
      searchRadius: radius,
      medicines: medicinesWithDistance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// Compare Prices Across Nearby Pharmacies - Public
// ===============================
exports.comparePrices = async (req, res) => {
  try {
    const { medicineName, latitude, longitude, radius = 5, limit = 20 } = req.query;

    if (!medicineName || !latitude || !longitude) {
      return res.status(400).json({ message: "medicineName, latitude and longitude are required" });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const radiusMeters = parseFloat(radius) * 1000;
    const maxResults = parseInt(limit) || 20;

    // Find nearby pharmacies using 2dsphere
    const nearbyPharmacies = await Pharmacy.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: radiusMeters
        }
      }
    }).select('name latitude longitude address phone').limit(maxResults);

    // For each pharmacy, try to find the requested medicine
    const results = await Promise.all(nearbyPharmacies.map(async (pharmacy) => {
      const medicine = await Medicine.findOne({
        pharmacy: pharmacy._id,
        name: new RegExp(medicineName, 'i'),
        available: true
      });

      if (!medicine) return null;

      // Haversine distance in km
      const R = 6371;
      const dLat = (pharmacy.latitude - lat) * Math.PI / 180;
      const dLon = (pharmacy.longitude - lng) * Math.PI / 180;
      const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat * Math.PI / 180) * Math.cos(pharmacy.latitude * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      const confidenceInfo = AvailabilityConfidenceService.buildAvailabilityInfo(medicine.toObject());

      return {
        pharmacy: pharmacy.toObject(),
        medicine: {
          id: medicine._id,
          name: medicine.name,
          price: medicine.price,
          available: medicine.available,
          stock: medicine.stock,
          availability: confidenceInfo
        },
        distance: parseFloat(distance.toFixed(2))
      };
    }));

    const filtered = results.filter(Boolean);

    // If no exact match found, suggest alternatives
    let alternatives = null;
    if (filtered.length === 0) {
      const medicineLower = medicineName.toLowerCase();
      const alternativeNames = MEDICINE_ALTERNATIVES[medicineLower] || [];

      if (alternativeNames.length > 0) {
        // Search for alternatives in nearby pharmacies
        const alternativeResults = await Promise.all(
          alternativeNames.map(async (altName) => {
            const altResults = await Promise.all(nearbyPharmacies.map(async (pharmacy) => {
              const medicine = await Medicine.findOne({
                pharmacy: pharmacy._id,
                name: new RegExp(altName, 'i'),
                available: true
              });

              if (!medicine) return null;

              const R = 6371;
              const dLat = (pharmacy.latitude - lat) * Math.PI / 180;
              const dLon = (pharmacy.longitude - lng) * Math.PI / 180;
              const a = 
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat * Math.PI / 180) * Math.cos(pharmacy.latitude * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
              const distance = R * c;

              const confidenceInfo = AvailabilityConfidenceService.buildAvailabilityInfo(medicine.toObject());

              return {
                pharmacy: pharmacy.toObject(),
                medicine: {
                  id: medicine._id,
                  name: medicine.name,
                  price: medicine.price,
                  available: medicine.available,
                  stock: medicine.stock,
                  availability: confidenceInfo
                },
                distance: parseFloat(distance.toFixed(2))
              };
            }));
            return altResults.filter(Boolean);
          })
        );

        // Flatten and combine all alternative results
        const flattenedAlternatives = alternativeResults.flat();
        if (flattenedAlternatives.length > 0) {
          flattenedAlternatives.sort((a, b) => a.medicine.price - b.medicine.price);
          alternatives = {
            suggestedMedicines: alternativeNames,
            results: flattenedAlternatives
          };
        }
      }
    }

    // Sort by price ascending
    filtered.sort((a, b) => a.medicine.price - b.medicine.price);

    let bestPrice = null;
    if (filtered.length > 0) {
      bestPrice = Math.min(...filtered.map((item) => item.medicine.price));
    } else if (alternatives?.results?.length) {
      bestPrice = Math.min(...alternatives.results.map((item) => item.medicine.price));
    }

    if (deviceId && medicineName) {
      await PriceDropAlertService.trackSearchWatch({
        deviceId,
        searchQuery: medicineName,
        bestPrice,
        latitude: lat,
        longitude: lng,
        source: 'compare'
      });
    }

    res.json({
      count: filtered.length,
      results: filtered,
      alternatives: alternatives,
      message: filtered.length === 0 && alternatives ? `"${medicineName}" not found. Showing alternatives: ${alternatives.suggestedMedicines.join(', ')}` : ''
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// � Get Smart Price Drop Alerts by Device
// ===============================
exports.getPriceDropAlerts = async (req, res) => {
  try {
    const { deviceId } = req.query;
    const { unreadOnly = 'false', limit = 20 } = req.query;

    if (!deviceId) {
      return res.status(400).json({ message: 'deviceId is required' });
    }

    const alerts = await PriceDropAlertService.getDevicePriceDropAlerts({
      deviceId,
      unreadOnly: unreadOnly === 'true',
      limit: Number(limit) || 20
    });

    res.json({
      count: alerts.length,
      unreadCount: alerts.filter((a) => !a.isRead).length,
      alerts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// ✅ Mark Single Price Drop Alert as Read
// ===============================
exports.markPriceDropAlertRead = async (req, res) => {
  try {
    const { alertId } = req.params;
    const { deviceId } = req.body;

    if (!deviceId) {
      return res.status(400).json({ message: 'deviceId is required' });
    }

    const updated = await PriceDropAlertService.markAlertAsRead({ deviceId, alertId });

    if (!updated) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    res.json({ message: 'Alert marked as read', alert: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// ✅ Mark All Price Drop Alerts as Read
// ===============================
exports.markAllPriceDropAlertsRead = async (req, res) => {
  try {
    const { deviceId } = req.body;

    if (!deviceId) {
      return res.status(400).json({ message: 'deviceId is required' });
    }

    const result = await PriceDropAlertService.markAllAlertsAsRead({ deviceId });

    res.json({
      message: 'All alerts marked as read',
      updatedCount: result.modifiedCount || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// �🔄 Get Medicine Alternatives (AI-Powered)
// ===============================
exports.getMedicineAlternatives = async (req, res) => {
  try {
    const { medicineId } = req.params;
    const { latitude, longitude, radius = 10 } = req.query;

    const userLat = latitude ? parseFloat(latitude) : null;
    const userLng = longitude ? parseFloat(longitude) : null;
    const searchRadius = parseFloat(radius);

    const result = await AlternativesService.findAlternatives(
      medicineId,
      userLat,
      userLng,
      searchRadius
    );

    res.json({
      success: true,
      data: result,
      message: result.count > 0 
        ? `Found ${result.count} alternative(s) with same composition` 
        : 'No alternatives found nearby'
    });
  } catch (error) {
    console.error('getMedicineAlternatives error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to fetch alternatives' 
    });
  }
};

// ===============================
// 🔍 Smart Search with Alternatives
// ===============================
exports.smartSearchWithAlternatives = async (req, res) => {
  try {
    const { query, latitude, longitude, radius = 10 } = req.query;

    if (!query) {
      return res.status(400).json({ 
        success: false,
        message: 'Search query is required' 
      });
    }

    const userLat = latitude ? parseFloat(latitude) : null;
    const userLng = longitude ? parseFloat(longitude) : null;
    const searchRadius = parseFloat(radius);

    const result = await AlternativesService.smartSearch(
      query,
      userLat,
      userLng,
      searchRadius
    );

    res.json({
      success: true,
      data: result,
      message: result.matchCount > 0 
        ? `Found ${result.matchCount} match(es)${result.hasAlternatives ? ' with alternatives' : ''}` 
        : 'No results found'
    });
  } catch (error) {
    console.error('smartSearchWithAlternatives error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Search failed' 
    });
  }
};