/**
 * Application Constants
 * Centralized configuration values for the MediNear application
 */

// API & Network
export const API_TIMEOUT = 30000; // 30 seconds
export const DEFAULT_RADIUS = 5; // 5 km
export const MAX_RADIUS = 50; // 50 km

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_LIMIT = 20;

// Timeouts & Intervals
export const NOTIFICATION_DURATION = 3000; // 3 seconds
export const TOAST_DURATION = 3000; // 3 seconds
export const PRICE_DROP_CHECK_INTERVAL = 2 * 60 * 1000; // 2 minutes
export const SMART_NOTIFICATION_INTERVAL = 15 * 60 * 1000; // 15 minutes
export const REMINDER_CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
export const OPEN_STATUS_UPDATE_INTERVAL = 60000; // 1 minute
export const ALERT_CHECK_INTERVAL = 60000; // 1 minute
export const RESERVATION_COUNTDOWN_INTERVAL = 1000; // 1 second

// Medicine Categories
export const MEDICINE_CATEGORIES = [
  'Antibiotics',
  'Pain Relief',
  'Cold & Flu',
  'Vitamins',
  'Digestive',
  'Skin Care',
  'General'
];

// Delivery
export const DELIVERY_EARNINGS = {
  MIN: 10,
  MAX: 20,
  CURRENCY: '₹'
};

export const DELIVERY_PARTNER_RADIUS = 5000; // 5 km in meters

// Reservation
export const RESERVATION_DEFAULT_DURATION = 30; // 30 minutes
export const RESERVATION_EXTEND_DURATION = 15; // 15 minutes

// Stock
export const DEFAULT_STOCK_ALERT_THRESHOLD = 10;
export const LOW_STOCK_THRESHOLD = 5;

// Ratings
export const MAX_RATING = 5;
export const MIN_RATING = 1;

// Status
export const PHARMACY_STATUS = {
  OPEN: 'open',
  CLOSED: 'closed',
  OPEN_24_7: 'open_24_7',
  TEMPORARILY_CLOSED: 'temporarily_closed'
};

export const RESERVATION_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired'
};

export const DELIVERY_STATUS = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  PICKED_UP: 'picked_up',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

export const PARTNER_STATUS = {
  AVAILABLE: 'available',
  BUSY: 'busy',
  OFFLINE: 'offline'
};

// User Roles
export const USER_ROLES = {
  USER: 'user',
  PHARMACY: 'pharmacy',
  ADMIN: 'admin',
  PARTNER: 'partner'
};

// Sorting Options
export const SORT_OPTIONS = {
  NEAREST: 'nearest',
  PRICE_LOW_HIGH: 'price_low_high',
  PRICE_HIGH_LOW: 'price_high_low',
  RATING: 'rating',
  NEWEST: 'newest'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  DEVICE_ID: 'deviceId',
  PHARMACY_ID: 'pharmacyId',
  USER_ID: 'userId',
  USER_PHONE: 'userPhone',
  PUSH_NOTIFICATIONS: 'pushNotifications',
  EMAIL_NOTIFICATIONS: 'emailNotifications',
  SMS_ALERTS: 'smsAlerts'
};

// Disease Severity
export const DISEASE_SEVERITY = {
  MILD: 'mild',
  MODERATE: 'moderate',
  SEVERE: 'severe'
};

// Responsive Breakpoints (match with CSS)
export const BREAKPOINTS = {
  MOBILE: 480,
  TABLET: 768,
  DESKTOP: 1024,
  WIDE: 1440
};

// Map Configuration
export const MAP_CONFIG = {
  DEFAULT_ZOOM: 13,
  MAX_ZOOM: 18,
  MIN_ZOOM: 3,
  DEFAULT_CENTER: [28.6139, 77.2090] // Delhi coordinates
};

// Animation Durations (ms)
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500
};

// Validation
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MIN_PHONE_LENGTH: 10,
  MAX_PHONE_LENGTH: 15,
  MIN_MEDICINE_NAME_LENGTH: 2,
  MAX_MEDICINE_NAME_LENGTH: 100
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Please login to continue.',
  FORBIDDEN: 'You do not have permission to access this resource.',
  NOT_FOUND: 'Resource not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check the form and try again.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Login successful!',
  REGISTER: 'Registration successful!',
  LOGOUT: 'Logged out successfully.',
  SAVE: 'Saved successfully!',
  DELETE: 'Deleted successfully!',
  UPDATE: 'Updated successfully!'
};

export default {
  API_TIMEOUT,
  DEFAULT_RADIUS,
  MAX_RADIUS,
  DEFAULT_PAGE_SIZE,
  DEFAULT_LIMIT,
  NOTIFICATION_DURATION,
  TOAST_DURATION,
  MEDICINE_CATEGORIES,
  DELIVERY_EARNINGS,
  PHARMACY_STATUS,
  RESERVATION_STATUS,
  DELIVERY_STATUS,
  USER_ROLES,
  SORT_OPTIONS,
  STORAGE_KEYS,
  BREAKPOINTS,
  MAP_CONFIG,
  ANIMATION_DURATION,
  VALIDATION,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
};
