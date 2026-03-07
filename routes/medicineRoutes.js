const express = require("express");
const router = express.Router();
const {
  addMedicine,
  searchMedicine,
  getMyMedicines,
  updateMedicine,
  deleteMedicine,
  getBestMedicines,
  getRecommendations,
  getMedicinesByCategory,
  addRating,
  incrementViews,
  getNearbyMedicines,
  updateStock,
  markOutOfStock,
  restockMedicine,
  getStockStatus,
  getPharmaciesWithinRadius,
  getMedicinesWithinRadius,
  comparePrices,
  getPriceDropAlerts,
  markPriceDropAlertRead,
  markAllPriceDropAlertsRead,
  getMedicineAlternatives,
  smartSearchWithAlternatives
} = require("../controllers/medicineController");

const authMiddleware = require("../middleware/authMiddleware");

// 🔒 Protected Routes
router.post("/add", authMiddleware, addMedicine);
router.get("/my-medicines", authMiddleware, getMyMedicines);
router.put("/update/:id", authMiddleware, updateMedicine);
router.delete("/delete/:id", authMiddleware, deleteMedicine);
router.post("/rate/:medicineId", authMiddleware, addRating);
router.put("/stock/:medicineId", authMiddleware, updateStock);
router.put("/out-of-stock/:medicineId", authMiddleware, markOutOfStock);
router.put("/restock/:medicineId", authMiddleware, restockMedicine);
router.get("/stock-status", authMiddleware, getStockStatus);

// 🌍 Public Routes
router.get("/search", searchMedicine);
router.get("/best", getBestMedicines);
router.get("/recommendations", getRecommendations);
router.get("/category/:category", getMedicinesByCategory);
router.put("/views/:medicineId", incrementViews);
router.get("/nearby", getNearbyMedicines);
// 🗺️ Geospatial Distance-Based Filtering (2dsphere)
router.get("/geo/pharmacies-within-radius", getPharmaciesWithinRadius);
router.get("/geo/medicines-within-radius", getMedicinesWithinRadius);
router.get("/compare", comparePrices);

// � Smart Price Drop Alerts
router.get("/price-drop/alerts", getPriceDropAlerts);
router.put("/price-drop/alerts/:alertId/read", markPriceDropAlertRead);
router.put("/price-drop/alerts/read-all", markAllPriceDropAlertsRead);

// �🔄 AI-Powered Medicine Alternatives
router.get("/alternatives/:medicineId", getMedicineAlternatives);
router.get("/smart-search", smartSearchWithAlternatives);

module.exports = router;