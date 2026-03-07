/**
 * Geolocation Utility Functions
 * Handles location-based operations including reverse geocoding
 */

/**
 * Get city name from coordinates using OpenStreetMap nominatim
 * Free, no API key required
 */
export const getCityFromCoordinates = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
    );
    const data = await response.json();
    
    // Try different fields in order of preference
    const cityName = 
      data.address?.city || 
      data.address?.town || 
      data.address?.county || 
      data.address?.state_district ||
      data.address?.state ||
      'nearby';
    
    return cityName || 'nearby';
  } catch (error) {
    console.error('Error getting city from coordinates:', error);
    return 'your area'; // Fallback
  }
};

/**
 * Format location for display
 */
export const formatLocation = (latitude, longitude, cityName) => {
  return {
    latitude,
    longitude,
    city: cityName,
    display: `${cityName} (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
  };
};

/**
 * Calculate distance between two coordinates (in kilometers)
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
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

/**
 * Check if location is within radius (in kilometers)
 */
export const isWithinRadius = (lat1, lon1, lat2, lon2, radiusKm) => {
  return calculateDistance(lat1, lon1, lat2, lon2) <= radiusKm;
};
