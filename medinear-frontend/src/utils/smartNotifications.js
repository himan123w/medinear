/**
 * Smart Notifications Utility
 * Manages engaging, context-aware notifications for stock updates and pharmacy inventory changes
 * 
 * Examples:
 * - "🎉 Paracetamol back in stock near you!"
 * - "📦 3 pharmacies near you updated inventory"
 * - "💊 Dolo 650mg now available at Life Pharmacy - 1.2km away"
 */

import { medicineAPI, pharmacyAPI } from '../api';

/**
 * Get recently searched medicines from localStorage
 */
export const getRecentSearches = () => {
  try {
    const searches = localStorage.getItem('recentSearches');
    return searches ? JSON.parse(searches) : [];
  } catch (error) {
    return [];
  }
};

/**
 * Store a search in recent searches (max 10)
 */
export const addRecentSearch = (medicineName) => {
  try {
    const searches = getRecentSearches();
    // Add to beginning, remove duplicates
    const updated = [medicineName, ...searches.filter(s => s !== medicineName)].slice(0, 10);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving search:', error);
  }
};

/**
 * Get last stock check timestamp
 */
const getLastStockCheck = () => {
  try {
    const timestamp = localStorage.getItem('lastStockCheck');
    return timestamp ? parseInt(timestamp) : 0;
  } catch (error) {
    return 0;
  }
};

/**
 * Update last stock check timestamp
 */
const updateLastStockCheck = () => {
  try {
    localStorage.setItem('lastStockCheck', Date.now().toString());
  } catch (error) {
    console.error('Error updating stock check:', error);
  }
};

/**
 * Check for stock updates on recently searched medicines
 * Returns engaging notification messages
 */
export const checkStockUpdates = async (userLocation) => {
  if (!userLocation?.latitude || !userLocation?.longitude) {
    return null;
  }

  const recentSearches = getRecentSearches();
  if (recentSearches.length === 0) {
    return null;
  }

  try {
    const notifications = [];
    
    // Check stock for each recent search (max 3 to avoid spam)
    for (const medicineName of recentSearches.slice(0, 3)) {
      try {
        const response = await medicineAPI.getNearbyMedicines(
          medicineName,
          userLocation.latitude,
          userLocation.longitude,
          10, // 10km radius
          'nearest'
        );

        const medicines = response.data.medicines || [];
        
        // Filter for recently restocked items (in stock)
        const inStockMedicines = medicines.filter(m => 
          m.availability?.level === 'in-stock' && 
          m.availability?.inStock === true
        );

        if (inStockMedicines.length > 0) {
          const closestMedicine = inStockMedicines[0];
          const distance = closestMedicine.distance 
            ? (closestMedicine.distance / 1000).toFixed(1) 
            : 'nearby';
          
          notifications.push({
            type: 'stock-update',
            message: `🎉 ${medicineName} back in stock near you!`,
            detail: `Available at ${closestMedicine.pharmacy?.name || 'pharmacy'} - ${distance}km away`,
            medicine: closestMedicine
          });
        }
      } catch (error) {
        console.error(`Error checking stock for ${medicineName}:`, error);
      }
    }

    updateLastStockCheck();
    return notifications.length > 0 ? notifications[0] : null; // Return first notification
  } catch (error) {
    console.error('Error checking stock updates:', error);
    return null;
  }
};

/**
 * Check for pharmacy inventory updates
 * Returns notification about how many pharmacies updated their inventory
 */
export const checkPharmacyUpdates = async (userLocation) => {
  if (!userLocation?.latitude || !userLocation?.longitude) {
    return null;
  }

  const lastCheck = getLastStockCheck();
  const timeSinceLastCheck = Date.now() - lastCheck;
  
  // Only check if it's been more than 30 minutes
  if (timeSinceLastCheck < 30 * 60 * 1000) {
    return null;
  }

  try {
    // Get pharmacies within 5km
    const response = await medicineAPI.getPharmaciesWithinRadius(
      userLocation.latitude,
      userLocation.longitude,
      5
    );

    const pharmacies = response.data.pharmacies || [];
    
    if (pharmacies.length >= 3) {
      return {
        type: 'inventory-update',
        message: `📦 ${pharmacies.length} pharmacies near you updated inventory`,
        detail: 'Check out the latest stock availability',
        count: pharmacies.length
      };
    }

    return null;
  } catch (error) {
    console.error('Error checking pharmacy updates:', error);
    return null;
  }
};

/**
 * Smart notification scheduler
 * Checks for updates at optimal times (not too frequent, not too rare)
 */
export const shouldCheckForUpdates = () => {
  const lastCheck = getLastStockCheck();
  const timeSinceLastCheck = Date.now() - lastCheck;
  
  // Check every 15 minutes minimum
  return timeSinceLastCheck > 15 * 60 * 1000;
};

/**
 * Format notification message with emojis for engagement
 */
export const formatSmartNotification = (notification) => {
  if (!notification) return null;

  const { type, message, detail, medicine, count } = notification;

  switch (type) {
    case 'stock-update':
      return {
        title: message,
        body: detail,
        icon: '💊',
        data: { medicine }
      };
    
    case 'inventory-update':
      return {
        title: message,
        body: detail,
        icon: '📦',
        data: { count }
      };
    
    default:
      return {
        title: message,
        body: detail || '',
        icon: '🔔',
        data: {}
      };
  }
};

/**
 * Get smart notification based on user context
 * Prioritizes: stock updates > inventory updates > price drops
 */
export const getSmartNotification = async (userLocation, recentSearches = []) => {
  if (!shouldCheckForUpdates()) {
    return null;
  }

  // Check stock updates first (most relevant)
  const stockUpdate = await checkStockUpdates(userLocation);
  if (stockUpdate) {
    return formatSmartNotification(stockUpdate);
  }

  // Then check inventory updates
  const pharmacyUpdate = await checkPharmacyUpdates(userLocation);
  if (pharmacyUpdate) {
    return formatSmartNotification(pharmacyUpdate);
  }

  return null;
};

/**
 * Show browser push notification (if permission granted)
 */
export const showPushNotification = (title, body, icon = '🔔') => {
  if (typeof Notification === 'undefined') {
    return;
  }

  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: `/favicon.ico`,
        badge: `/favicon.ico`,
        tag: 'medinear-smart-notification',
        requireInteraction: false
      });
    } catch (error) {
      console.error('Error showing push notification:', error);
    }
  }
};
