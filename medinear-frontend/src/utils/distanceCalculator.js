/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - User latitude
 * @param {number} lon1 - User longitude
 * @param {number} lat2 - Pharmacy latitude
 * @param {number} lon2 - Pharmacy longitude
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return parseFloat(distance.toFixed(1)); // Return with 1 decimal place
};

/**
 * Calculate estimated drive time based on distance
 * Uses average urban speed of 40 km/h and highway speed of 60 km/h
 * @param {number} distance - Distance in kilometers
 * @returns {object} Object with minutes and formatted string
 */
export const calculateDriveTime = (distance) => {
  // For distances < 2km, use urban speed (40 km/h)
  // For distances >= 2km, use mixed speed (50 km/h average)
  const averageSpeed = distance < 2 ? 40 : 50;
  const hours = distance / averageSpeed;
  const minutes = Math.round(hours * 60);
  
  if (minutes < 1) {
    return { minutes: 1, display: '< 1 min' };
  }
  
  return { minutes, display: `${minutes} min` };
};

/**
 * Format distance display with icon
 * @param {number} distance - Distance in kilometers
 * @returns {string} Formatted distance string with icon
 */
export const formatDistance = (distance) => {
  if (!distance || distance < 0) return '📍 N/A';
  if (distance < 1) {
    return `📍 ${Math.round(distance * 1000)} m away`;
  }
  return `📍 ${distance} km away`;
};

/**
 * Format drive time display with icon
 * @param {string} driveTimeDisplay - Drive time in minutes (e.g., "6 min")
 * @returns {string} Formatted drive time string with icon
 */
export const formatDriveTime = (driveTimeDisplay) => {
  if (!driveTimeDisplay) return '⏱ N/A';
  return `⏱ ${driveTimeDisplay} drive`;
};

/**
 * Get pharmacy coordinates from pharmacy object
 * Handles different data structure formats
 * @param {object} pharmacy - Pharmacy object
 * @returns {object} Object with latitude and longitude or null
 */
export const getPharmacyCoordinates = (pharmacy) => {
  if (!pharmacy) return null;

  // Check for geolocation field (GeoJSON format)
  if (pharmacy.geolocation && pharmacy.geolocation.coordinates) {
    return {
      latitude: pharmacy.geolocation.coordinates[1],
      longitude: pharmacy.geolocation.coordinates[0],
    };
  }

  // Check for location field with lat/lon
  if (pharmacy.location && pharmacy.location.latitude && pharmacy.location.longitude) {
    return {
      latitude: pharmacy.location.latitude,
      longitude: pharmacy.location.longitude,
    };
  }

  // Check for direct latitude/longitude fields
  if (pharmacy.latitude && pharmacy.longitude) {
    return {
      latitude: pharmacy.latitude,
      longitude: pharmacy.longitude,
    };
  }

  return null;
};

/**
 * Get distance and time information for a pharmacy
 * @param {object} pharmacy - Pharmacy object
 * @param {number} userLat - User latitude
 * @param {number} userLon - User longitude
 * @returns {object} Object with distance, driveTime, and formatted strings
 */
export const getPharmacyDistanceInfo = (pharmacy, userLat, userLon) => {
  if (!userLat || !userLon) {
    return {
      distance: null,
      driveTime: null,
      distanceDisplay: '📍 Share location to see distance',
      driveTimeDisplay: '⏱ N/A',
    };
  }

  const pharmacyCoords = getPharmacyCoordinates(pharmacy);
  if (!pharmacyCoords) {
    return {
      distance: null,
      driveTime: null,
      distanceDisplay: '📍 No location data',
      driveTimeDisplay: '⏱ N/A',
    };
  }

  const distance = calculateDistance(userLat, userLon, pharmacyCoords.latitude, pharmacyCoords.longitude);
  const driveTime = calculateDriveTime(distance);

  return {
    distance,
    driveTime: driveTime.minutes,
    distanceDisplay: formatDistance(distance),
    driveTimeDisplay: formatDriveTime(driveTime.display),
  };
};
