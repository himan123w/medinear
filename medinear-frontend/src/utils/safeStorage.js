/**
 * Safe localStorage wrapper with fallback for when localStorage is disabled/unavailable
 * Handles Safari private mode and browsers with storage disabled
 */

class SafeStorage {
  constructor() {
    this.fallbackStorage = new Map();
    this.isAvailable = this.checkAvailability();
  }

  checkAvailability() {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      console.warn('localStorage is not available. Using fallback in-memory storage.');
      return false;
    }
  }

  getItem(key) {
    try {
      if (this.isAvailable) {
        return localStorage.getItem(key);
      }
      return this.fallbackStorage.get(key) || null;
    } catch (e) {
      console.error('Error getting item from storage:', e);
      return null;
    }
  }

  setItem(key, value) {
    try {
      if (this.isAvailable) {
        localStorage.setItem(key, value);
      } else {
        this.fallbackStorage.set(key, value);
      }
    } catch (e) {
      console.error('Error setting item in storage:', e);
      // Try fallback if localStorage fails (e.g., quota exceeded)
      this.fallbackStorage.set(key, value);
    }
  }

  removeItem(key) {
    try {
      if (this.isAvailable) {
        localStorage.removeItem(key);
      }
      this.fallbackStorage.delete(key);
    } catch (e) {
      console.error('Error removing item from storage:', e);
    }
  }

  clear() {
    try {
      if (this.isAvailable) {
        localStorage.clear();
      }
      this.fallbackStorage.clear();
    } catch (e) {
      console.error('Error clearing storage:', e);
    }
  }
}

// Export singleton instance
export const safeStorage = new SafeStorage();

// Helper functions for common operations
export const getToken = () => safeStorage.getItem('token');
export const setToken = (token) => safeStorage.setItem('token', token);
export const removeToken = () => safeStorage.removeItem('token');

export const getUser = () => {
  try {
    const userStr = safeStorage.getItem('user');
    return userStr && userStr !== 'undefined' && userStr !== 'null' 
      ? JSON.parse(userStr) 
      : null;
  } catch (e) {
    console.error('Error parsing user data:', e);
    return null;
  }
};

export const setUser = (user) => {
  try {
    safeStorage.setItem('user', JSON.stringify(user));
  } catch (e) {
    console.error('Error saving user data:', e);
  }
};

export const clearAuth = () => {
  removeToken();
  safeStorage.removeItem('user');
};

export default safeStorage;
