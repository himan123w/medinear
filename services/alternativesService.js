const Medicine = require('../models/Medicine');
const Pharmacy = require('../models/Pharmacy');
const AvailabilityConfidenceService = require('./availabilityConfidenceService');

/**
 * Smart Medicine Alternatives Service
 * Finds alternative medicines with same composition
 */
class AlternativesService {
  
  /**
   * Find alternatives for a medicine by composition
   * @param {String} medicineId - Original medicine ID
   * @param {Number} userLat - User latitude (optional)
   * @param {Number} userLng - User longitude (optional)
   * @param {Number} radius - Search radius in km (default 10)
   */
  async findAlternatives(medicineId, userLat = null, userLng = null, radius = 10) {
    try {
      // Get the original medicine
      const original = await Medicine.findById(medicineId).populate('pharmacy');
      
      if (!original) {
        throw new Error('Medicine not found');
      }

      // Find alternatives by composition or generic name
      let alternatives = [];
      
      if (original.composition) {
        alternatives = await this.findByComposition(
          original.composition,
          medicineId,
          userLat,
          userLng,
          radius
        );
      } else if (original.genericName) {
        alternatives = await this.findByGenericName(
          original.genericName,
          medicineId,
          userLat,
          userLng,
          radius
        );
      } else {
        // Fallback to name-based matching
        alternatives = await this.findByNameSimilarity(
          original.name,
          medicineId,
          userLat,
          userLng,
          radius
        );
      }

      // Build comparison data
      const comparison = this.buildComparison(original, alternatives);

      return {
        original: this.formatMedicine(original, userLat, userLng),
        alternatives: comparison,
        count: alternatives.length,
        searchCriteria: {
          composition: original.composition,
          genericName: original.genericName,
          radius: radius,
          hasLocation: !!(userLat && userLng)
        }
      };
    } catch (error) {
      console.error('AlternativesService.findAlternatives error:', error);
      throw error;
    }
  }

  /**
   * Find alternatives by exact composition match
   */
  async findByComposition(composition, excludeId, userLat, userLng, radius) {
    try {
      let query = {
        composition: composition,
        _id: { $ne: excludeId },
        available: true,
        stock: { $gt: 0 }
      };

      // If user location provided, filter by nearby pharmacies
      if (userLat && userLng) {
        const nearbyPharmacies = await this.getNearbyPharmacies(userLat, userLng, radius);
        query.pharmacy = { $in: nearbyPharmacies.map(p => p._id) };
      }

      const alternatives = await Medicine.find(query)
        .populate('pharmacy')
        .limit(20)
        .sort({ price: 1, rating: -1 });

      return alternatives;
    } catch (error) {
      console.error('findByComposition error:', error);
      return [];
    }
  }

  /**
   * Find alternatives by generic name
   */
  async findByGenericName(genericName, excludeId, userLat, userLng, radius) {
    try {
      let query = {
        genericName: new RegExp(genericName, 'i'),
        _id: { $ne: excludeId },
        available: true,
        stock: { $gt: 0 }
      };

      if (userLat && userLng) {
        const nearbyPharmacies = await this.getNearbyPharmacies(userLat, userLng, radius);
        query.pharmacy = { $in: nearbyPharmacies.map(p => p._id) };
      }

      const alternatives = await Medicine.find(query)
        .populate('pharmacy')
        .limit(20)
        .sort({ price: 1, rating: -1 });

      return alternatives;
    } catch (error) {
      console.error('findByGenericName error:', error);
      return [];
    }
  }

  /**
   * Find alternatives by name similarity (fallback)
   */
  async findByNameSimilarity(name, excludeId, userLat, userLng, radius) {
    try {
      // Extract base name (remove numbers, dosage info)
      const baseName = name.replace(/\d+/g, '').trim();
      
      let query = {
        name: new RegExp(baseName, 'i'),
        _id: { $ne: excludeId },
        available: true,
        stock: { $gt: 0 }
      };

      if (userLat && userLng) {
        const nearbyPharmacies = await this.getNearbyPharmacies(userLat, userLng, radius);
        query.pharmacy = { $in: nearbyPharmacies.map(p => p._id) };
      }

      const alternatives = await Medicine.find(query)
        .populate('pharmacy')
        .limit(20)
        .sort({ price: 1, rating: -1 });

      return alternatives;
    } catch (error) {
      console.error('findByNameSimilarity error:', error);
      return [];
    }
  }

  /**
   * Get nearby pharmacies using geospatial query
   */
  async getNearbyPharmacies(lat, lng, radiusKm) {
    try {
      const radiusInMeters = radiusKm * 1000;
      
      const pharmacies = await Pharmacy.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [lng, lat]
            },
            $maxDistance: radiusInMeters
          }
        }
      });

      return pharmacies;
    } catch (error) {
      console.error('getNearbyPharmacies error:', error);
      // Fallback: get all pharmacies
      return await Pharmacy.find();
    }
  }

  /**
   * Build comparison data between original and alternatives
   */
  buildComparison(original, alternatives) {
    const originalPrice = original.price;

    return alternatives.map(alt => {
      const priceDiff = alt.price - originalPrice;
      const priceDiffPercent = ((priceDiff / originalPrice) * 100).toFixed(1);
      const savings = -priceDiff;

      return {
        ...this.formatMedicine(alt),
        comparison: {
          priceDifference: priceDiff,
          priceDifferencePercent: parseFloat(priceDiffPercent),
          savings: savings > 0 ? savings : 0,
          savingsPercent: savings > 0 ? Math.abs(parseFloat(priceDiffPercent)) : 0,
          isCheaper: priceDiff < 0,
          isGeneric: alt.isGeneric,
          sameComposition: alt.composition === original.composition,
          matchType: alt.composition === original.composition ? 'exact' : 
                     alt.genericName === original.genericName ? 'generic' : 'similar'
        }
      };
    });
  }

  /**
   * Format medicine data with confidence info
   */
  formatMedicine(medicine, userLat = null, userLng = null) {
    const medicineObj = medicine.toObject ? medicine.toObject() : medicine;
    const confidenceInfo = AvailabilityConfidenceService.buildAvailabilityInfo(medicineObj);

    let distance = null;
    if (userLat && userLng && medicine.pharmacy?.latitude && medicine.pharmacy?.longitude) {
      distance = this.calculateDistance(
        userLat,
        userLng,
        medicine.pharmacy.latitude,
        medicine.pharmacy.longitude
      );
    }

    return {
      _id: medicine._id,
      name: medicine.name,
      price: medicine.price,
      composition: medicine.composition,
      genericName: medicine.genericName,
      dosageForm: medicine.dosageForm,
      strength: medicine.strength,
      manufacturer: medicine.manufacturer,
      isGeneric: medicine.isGeneric,
      stock: medicine.stock,
      rating: medicine.rating,
      reviews: medicine.reviews,
      category: medicine.category,
      pharmacy: {
        _id: medicine.pharmacy._id,
        name: medicine.pharmacy.name,
        phone: medicine.pharmacy.phone,
        area: medicine.pharmacy.area,
        address: medicine.pharmacy.address
      },
      distance: distance,
      availability: confidenceInfo
    };
  }

  /**
   * Calculate distance using Haversine formula
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(2));
  }

  /**
   * Smart search with alternatives
   * Returns both exact matches and alternatives in a smart way
   */
  async smartSearch(searchTerm, userLat = null, userLng = null, radius = 10) {
    try {
      // First, search for exact or close matches
      let query = {
        $or: [
          { name: new RegExp(searchTerm, 'i') },
          { composition: new RegExp(searchTerm, 'i') },
          { genericName: new RegExp(searchTerm, 'i') }
        ],
        available: true,
        stock: { $gt: 0 }
      };

      if (userLat && userLng) {
        const nearbyPharmacies = await this.getNearbyPharmacies(userLat, userLng, radius);
        query.pharmacy = { $in: nearbyPharmacies.map(p => p._id) };
      }

      const matches = await Medicine.find(query)
        .populate('pharmacy')
        .limit(10)
        .sort({ rating: -1, price: 1 });

      // If we have matches, find alternatives for the first/best match
      let alternativesData = null;
      if (matches.length > 0) {
        const primaryMatch = matches[0];
        alternativesData = await this.findAlternatives(
          primaryMatch._id,
          userLat,
          userLng,
          radius
        );
      }

      return {
        matches: matches.map(m => this.formatMedicine(m, userLat, userLng)),
        alternatives: alternativesData,
        matchCount: matches.length,
        hasAlternatives: alternativesData && alternativesData.count > 0
      };
    } catch (error) {
      console.error('smartSearch error:', error);
      throw error;
    }
  }
}

module.exports = new AlternativesService();
