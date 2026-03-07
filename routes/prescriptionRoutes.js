const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const {
  uploadPrescription,
  getMyPrescriptions,
  getAvailablePrescriptions,
  respondToPrescription,
  getPrescriptionDetail,
  selectPharmacy,
  deletePrescription,
  getPrescriptionStats
} = require("../controllers/prescriptionController");

const authMiddleware = require("../middleware/authMiddleware");

// Configure multer for prescription image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/prescriptions"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'prescription-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept image files only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Please upload a valid image file'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB max
  }
});

// 🔒 Protected Routes - User
router.post("/upload", authMiddleware, upload.single('prescriptionImage'), uploadPrescription);
router.get("/my-prescriptions", authMiddleware, getMyPrescriptions);
router.get("/:prescriptionId", authMiddleware, getPrescriptionDetail);
router.post("/select-pharmacy", authMiddleware, selectPharmacy);
router.delete("/:prescriptionId", authMiddleware, deletePrescription);

// 🔒 Protected Routes - Pharmacy
router.get("/available", authMiddleware, getAvailablePrescriptions);
router.post("/:prescriptionId/respond", authMiddleware, respondToPrescription);
router.get("/pharmacy/stats", authMiddleware, getPrescriptionStats);

module.exports = router;
