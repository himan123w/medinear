import axios from 'axios';
import { safeStorage } from './utils/safeStorage';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Log API configuration (only in development)
if (import.meta.env.DEV) {
  console.log('[API Config] Base URL:', API_BASE_URL);
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = safeStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network error
    if (!error.response) {
      console.error('[API] Network error - Server might be down:', error.message);
      return Promise.reject({
        message: 'Network error. Please check your connection.',
        isNetworkError: true,
        originalError: error
      });
    }

    // HTTP errors
    const { status, data } = error.response;
    
    // Handle specific status codes
    switch (status) {
      case 401:
        // Unauthorized - clear auth and redirect to login
        console.warn('[API] Unauthorized access - token may be expired');
        safeStorage.removeItem('token');
        safeStorage.removeItem('user');
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login';
        }
        break;
      case 403:
        console.warn('[API] Forbidden - insufficient permissions');
        break;
      case 404:
        console.warn('[API] Resource not found:', error.config?.url);
        break;
      case 500:
        console.error('[API] Server error:', data?.message || 'Internal server error');
        break;
      default:
        console.error('[API] Request failed:', status, data?.message || error.message);
    }

    return Promise.reject({
      status,
      message: data?.message || error.message || 'An error occurred',
      data: data,
      originalError: error
    });
  }
);

// Auth API
export const authAPI = {
  // User authentication
  userRegister: (data) => api.post('/auth/user/register', data),
  userLogin: (data) => api.post('/auth/user/login', data),
  // Pharmacy authentication
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

// Medicine API
export const medicineAPI = {
  search: (name, options = {}) => api.get('/medicine/search', { params: { name, ...options } }),
  addMedicine: (data) => api.post('/medicine/add', data),
  getMyMedicines: () => api.get('/medicine/my-medicines'),
  updateMedicine: (id, data) => api.put(`/medicine/update/${id}`, data),
  deleteMedicine: (id) => api.delete(`/medicine/delete/${id}`),
  getBestMedicines: (limit = 10) => api.get('/medicine/best', { params: { limit } }),
  getRecommendations: (limit = 10) => api.get('/medicine/recommendations', { params: { limit } }),
  getMedicinesByCategory: (category, limit = 10) => api.get(`/medicine/category/${category}`, { params: { limit } }),
  addRating: (medicineId, rating) => api.post(`/medicine/rate/${medicineId}`, { rating }),
  incrementViews: (medicineId) => api.put(`/medicine/views/${medicineId}`),
  getNearbyMedicines: (medicineName, latitude, longitude, radius = 5, sortBy = 'nearest') => 
    api.get('/medicine/nearby', { params: { medicineName, latitude, longitude, radius, sortBy } }),
  updateStock: (medicineId, quantity, operation = 'set') => 
    api.put(`/medicine/stock/${medicineId}`, { quantity, operation }),
  markOutOfStock: (medicineId) => 
    api.put(`/medicine/out-of-stock/${medicineId}`),
  restockMedicine: (medicineId, quantity, stockAlert) => 
    api.put(`/medicine/restock/${medicineId}`, { quantity, stockAlert }),
  getStockStatus: () => 
    api.get('/medicine/stock-status'),
  // 🗺️ Geospatial Distance-Based Filtering
  getPharmaciesWithinRadius: (latitude, longitude, radius = 5) =>
    api.get('/medicine/geo/pharmacies-within-radius', { params: { latitude, longitude, radius } }),
  getMedicinesWithinRadius: (latitude, longitude, radius = 5, medicineName = '', sortBy = 'nearest') =>
    api.get('/medicine/geo/medicines-within-radius', { params: { latitude, longitude, radius, medicineName, sortBy } }),
  // 💰 Price Comparison
  comparePrices: (medicineName, latitude, longitude, radius = 5, limit = 20, deviceId = null) =>
    api.get('/medicine/compare', { params: { medicineName, latitude, longitude, radius, limit, deviceId } }),
  // 🔔 Smart Price Drop Alerts
  getPriceDropAlerts: (deviceId, unreadOnly = true, limit = 20) =>
    api.get('/medicine/price-drop/alerts', { params: { deviceId, unreadOnly, limit } }),
  markPriceDropAlertRead: (alertId, deviceId) =>
    api.put(`/medicine/price-drop/alerts/${alertId}/read`, { deviceId }),
  markAllPriceDropAlertsRead: (deviceId) =>
    api.put('/medicine/price-drop/alerts/read-all', { deviceId }),
  // 🔄 Medicine Alternatives (AI-Powered)
  getMedicineAlternatives: (medicineId, latitude = null, longitude = null, radius = 10) =>
    api.get(`/medicine/alternatives/${medicineId}`, { params: { latitude, longitude, radius } }),
  smartSearch: (query, latitude = null, longitude = null, radius = 10) =>
    api.get('/medicine/smart-search', { params: { query, latitude, longitude, radius } }),
};

// Pharmacy API
export const pharmacyAPI = {
  getPharmacies: () => api.get('/pharmacy'),
  addPharmacy: (data) => api.post('/pharmacy/add', data),
  getEmergencyPharmacies: (latitude, longitude, radius = 5, medicineName = '') =>
    api.get('/pharmacy/emergency', { params: { latitude, longitude, radius, medicineName } }),
  // 🟢 Open Status Features
  getPharmaciesWithStatus: (filter = 'all', latitude = null, longitude = null, radius = 50) =>
    api.get('/pharmacy/with-status', { params: { filter, latitude, longitude, radius } }),
  getPharmacyOpenStatus: (pharmacyId) =>
    api.get(`/pharmacy/${pharmacyId}/open-status`),
  updateOperatingHours: (pharmacyId, data) =>
    api.put(`/pharmacy/${pharmacyId}/operating-hours`, data),
};

// Prescription API
export const prescriptionAPI = {
  uploadPrescription: (formData) => api.post('/prescription/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getMyPrescriptions: (page = 1, limit = 10, status = '') =>
    api.get('/prescription/my-prescriptions', { params: { page, limit, status } }),
  getPrescriptionDetail: (prescriptionId) =>
    api.get(`/prescription/${prescriptionId}`),
  getAvailablePrescriptions: (page = 1, limit = 10) =>
    api.get('/prescription/available', { params: { page, limit } }),
  respondToPrescription: (prescriptionId, data) =>
    api.post(`/prescription/${prescriptionId}/respond`, data),
  selectPharmacy: (prescriptionId, pharmacyId) =>
    api.post('/prescription/select-pharmacy', { prescriptionId, pharmacyId }),
  deletePrescription: (prescriptionId) =>
    api.delete(`/prescription/${prescriptionId}`),
  getPrescriptionStats: () =>
    api.get('/prescription/pharmacy/stats'),
};

// Reminder API
export const reminderAPI = {
  createReminder: (data) => api.post('/reminder/create', data),
  getMyReminders: () => api.get('/reminder/my-reminders'),
  getUpcomingReminders: () => api.get('/reminder/upcoming'),
  getReminderDetail: (id) => api.get(`/reminder/${id}`),
  updateReminder: (id, data) => api.put(`/reminder/${id}`, data),
  deleteReminder: (id) => api.delete(`/reminder/${id}`),
  toggleReminder: (id) => api.put(`/reminder/${id}/toggle`),
  checkTrigger: () => api.post('/reminder/check-trigger')
};

// Rating API
export const ratingAPI = {
  submitRating: (data) => api.post('/rating/submit', data),
  getPharmacyRatings: (pharmacyId, sort = '-createdAt', limit = 50, skip = 0) =>
    api.get(`/rating/pharmacy/${pharmacyId}`, { params: { sort, limit, skip } }),
  getUserRating: (pharmacyId, userPhone) =>
    api.get(`/rating/pharmacy/${pharmacyId}/user-rating`, { params: { userPhone } }),
  getPharmacyRatingSummary: (pharmacyId) =>
    api.get(`/rating/pharmacy/${pharmacyId}/summary`),
  getRatingsDistribution: (pharmacyId) =>
    api.get(`/rating/pharmacy/${pharmacyId}/distribution`),
  getTopRatedPharmacies: (limit = 10) =>
    api.get('/rating/top-rated', { params: { limit } }),
  deleteRating: (ratingId, userPhone) =>
    api.delete(`/rating/${ratingId}`, { data: { userPhone } })
};

// Delivery API
export const deliveryAPI = {
  // Partner Management
  registerPartner: (data) => api.post('/delivery/partner/register', data),
  getAvailablePartners: (latitude, longitude, radius = 5000, serviceArea = '') =>
    api.get('/delivery/partners/available', { params: { latitude, longitude, radius, serviceArea } }),
  getPartnerProfile: (partnerId) =>
    api.get(`/delivery/partner/${partnerId}`),
  updatePartnerLocation: (partnerId, latitude, longitude, accuracy) =>
    api.put(`/delivery/partner/${partnerId}/location`, { latitude, longitude, accuracy }),
  updatePartnerAvailability: (partnerId, isAvailable, status) =>
    api.put(`/delivery/partner/${partnerId}/availability`, { isAvailable, status }),
  
  // Delivery Operations
  bookDelivery: (data) => api.post('/delivery/book', data),
  assignDeliveryPartner: (deliveryId, partnerId) =>
    api.put(`/delivery/delivery/${deliveryId}/assign`, { partnerId }),
  updateDeliveryStatus: (deliveryId, status, latitude, longitude, notes) =>
    api.put(`/delivery/delivery/${deliveryId}/status`, { status, latitude, longitude, notes }),
  
  // Tracking & History
  trackDelivery: (deliveryId) =>
    api.get(`/delivery/delivery/${deliveryId}/track`),
  getCustomerDeliveries: (phone, limit = 20, skip = 0) =>
    api.get('/delivery/customer/deliveries', { params: { phone, limit, skip } }),
  getPartnerDeliveries: (partnerId, status = '', limit = 20, skip = 0) =>
    api.get(`/delivery/partner/${partnerId}/deliveries`, { params: { status, limit, skip } }),
  getDeliveryStats: (partnerId) =>
    api.get(`/delivery/partner/${partnerId}/stats`),
  ratePartner: (deliveryId, rating, review) =>
    api.post(`/delivery/delivery/${deliveryId}/rate-partner`, { rating, review })
};

// Subscription API
export const subscriptionAPI = {
  createSubscription: (data) => api.post('/subscription/create', data),
  getUserSubscriptions: (userId) => api.get(`/subscription/user/${userId}`),
  getSubscriptionById: (id) => api.get(`/subscription/${id}`),
  updateSubscription: (id, data) => api.put(`/subscription/${id}`, data),
  pauseSubscription: (id) => api.put(`/subscription/${id}/pause`),
  resumeSubscription: (id) => api.put(`/subscription/${id}/resume`),
  cancelSubscription: (id) => api.put(`/subscription/${id}/cancel`),
  getDiseaseRecommendations: (disease, severity = 'moderate') => 
    api.get('/subscription/disease/recommendations', { params: { disease, severity } }),
  getDiseaseTypes: () => api.get('/subscription/disease/types'),
  processDue: () => api.get('/subscription/admin/process-due')
};

// Reservation API
export const reservationAPI = {
  createReservation: (data) => api.post('/reservations', data),
  getMyReservations: (status = '') => api.get('/reservations/my', { params: { status } }),
  getPharmacyReservations: (pharmacyId, status = '') => 
    api.get(`/reservations/pharmacy/${pharmacyId}`, { params: { status } }),
  getReservation: (id) => api.get(`/reservations/${id}`),
  cancelReservation: (id) => api.post(`/reservations/${id}/cancel`),
  completeReservation: (id, pharmacyId) => 
    api.post(`/reservations/${id}/complete`, { pharmacyId }),
  extendReservation: (id, minutes = 15) => 
    api.post(`/reservations/${id}/extend`, { minutes }),
  getReservationStats: (pharmacyId = '') => 
    api.get('/reservations/stats', { params: { pharmacyId } })
};

// Analytics API
export const analyticsAPI = {
  getAreaHeatmap: () => api.get('/analytics/heatmap/area'),
  getCityHeatmap: (city) => api.get(`/analytics/heatmap/city/${city}`),
  getCriticalZones: () => api.get('/analytics/heatmap/critical')
};

export default api;
