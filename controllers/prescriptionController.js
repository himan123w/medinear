const Prescription = require("../models/Prescription");
const Pharmacy = require("../models/Pharmacy");
const Medicine = require("../models/Medicine");
const fs = require("fs");
const path = require("path");

const UPLOAD_DIR = path.join(__dirname, "../public/prescriptions");

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// ===============================
// Upload Prescription - Protected (User)
// ===============================
exports.uploadPrescription = async (req, res) => {
  try {
    const { description, medicines, latitude, longitude } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Prescription image is required" });
    }

    if (!latitude || !longitude) {
      return res.status(400).json({ message: "Location (latitude, longitude) is required" });
    }

    // Parse medicines if provided as string
    let medicinesArray = [];
    if (medicines) {
      try {
        medicinesArray = typeof medicines === "string" ? JSON.parse(medicines) : medicines;
      } catch (e) {
        return res.status(400).json({ message: "Invalid medicines format" });
      }
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    // Find nearby pharmacies (within 10 km)
    const nearbyPharmacies = await Pharmacy.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: 10000 // 10 km in meters
        }
      }
    }).select('_id name phone area latitude longitude');

    // Create prescription record
    const prescription = await Prescription.create({
      user: req.user.id,
      userName: req.user.name || "Anonymous",
      userPhone: req.user.phone || "N/A",
      prescriptionImage: req.file.filename, // Stored filename
      imageSize: req.file.size,
      description: description || "",
      medicines: medicinesArray,
      latitude: lat,
      longitude: lng,
      nearbyPharmacies: nearbyPharmacies.map(p => ({
        pharmacyId: p._id,
        distance: calculateDistance(lat, lng, p.latitude, p.longitude)
      }))
    });

    res.status(201).json({
      prescriptionId: prescription._id,
      message: "Prescription uploaded successfully",
      nearbyPharmaciesCount: nearbyPharmacies.length,
      prescription
    });
  } catch (error) {
    // Delete uploaded file if prescription creation fails
    if (req.file) {
      fs.unlink(req.file.path, err => {
        if (err) console.error("Error deleting file:", err);
      });
    }
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// Get My Prescriptions - Protected (User)
// ===============================
exports.getMyPrescriptions = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    let query = { user: req.user.id };

    if (status) {
      query.status = status;
    }

    const prescriptions = await Prescription.find(query)
      .populate('responses.pharmacy', 'name phone area')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Prescription.countDocuments(query);

    res.json({
      count: prescriptions.length,
      total,
      page,
      lastPage: Math.ceil(total / limit),
      prescriptions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// Get Prescriptions for Pharmacy - Protected (Pharmacy)
// ===============================
exports.getAvailablePrescriptions = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Get pharmacy location
    const pharmacy = await Pharmacy.findOne({ _id: req.user.id });

    if (!pharmacy) {
      return res.status(404).json({ message: "Pharmacy not found" });
    }

    // Find prescriptions within 15 km radius that haven't expired
    const prescriptions = await Prescription.find({
      status: { $in: ['pending', 'responded'] },
      expiryDate: { $gte: new Date() },
      'responses.pharmacy': { $ne: req.user.id } // Pharmacy hasn't already responded
    })
      .populate('user', 'name phone')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    // Filter prescriptions within distance
    const nearPrescriptions = prescriptions.filter(p => {
      const distance = calculateDistance(pharmacy.latitude, pharmacy.longitude, p.latitude, p.longitude);
      return distance <= 15; // 15 km max
    });

    const total = await Prescription.countDocuments({
      status: { $in: ['pending', 'responded'] },
      expiryDate: { $gte: new Date() }
    });

    res.json({
      count: nearPrescriptions.length,
      total,
      page,
      prescriptions: nearPrescriptions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// Respond to Prescription - Protected (Pharmacy)
// ===============================
exports.respondToPrescription = async (req, res) => {
  try {
    const { prescriptionId } = req.params;
    const { medicines, message } = req.body;

    const prescription = await Prescription.findById(prescriptionId);

    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    // Check if pharmacy already responded
    const existingResponse = prescription.responses.find(
      r => r.pharmacy.toString() === req.user.id
    );

    if (existingResponse) {
      return res.status(400).json({ message: "You have already responded to this prescription" });
    }

    // Get pharmacy info
    const pharmacy = await Pharmacy.findById(req.user.id);

    // Add response
    const response = {
      pharmacy: req.user.id,
      pharmacyName: pharmacy.name,
      pharmacyPhone: pharmacy.phone,
      pharmacyArea: pharmacy.area,
      medicines: medicines || [],
      message: message || ""
    };

    prescription.responses.push(response);
    prescription.responseCount = prescription.responses.length;

    // Update status if it's first response
    if (prescription.status === 'pending') {
      prescription.status = 'responded';
    }

    await prescription.save();

    res.json({
      message: "Response submitted successfully",
      responseCount: prescription.responseCount,
      prescription
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// Get Prescription Detail - Protected (User/Pharmacy)
// ===============================
exports.getPrescriptionDetail = async (req, res) => {
  try {
    const { prescriptionId } = req.params;

    const prescription = await Prescription.findByIdAndUpdate(
      prescriptionId,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('user', 'name phone')
      .populate('responses.pharmacy', 'name phone area latitude longitude');

    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    // Check authorization
    if (prescription.user.toString() !== req.user.id && 
        !prescription.responses.some(r => r.pharmacy.toString() === req.user.id)) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    res.json(prescription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// Select Pharmacy - Protected (User)
// ===============================
exports.selectPharmacy = async (req, res) => {
  try {
    const { prescriptionId, pharmacyId } = req.body;

    const prescription = await Prescription.findOne({
      _id: prescriptionId,
      user: req.user.id
    });

    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    // Verify pharmacy has responded
    const hasResponded = prescription.responses.some(r => r.pharmacy.toString() === pharmacyId);

    if (!hasResponded) {
      return res.status(400).json({ message: "This pharmacy has not responded" });
    }

    prescription.selectedPharmacy = pharmacyId;
    prescription.conversionStatus = 'converted';

    await prescription.save();

    res.json({
      message: "Pharmacy selected successfully",
      prescription
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// Delete Prescription - Protected (User)
// ===============================
exports.deletePrescription = async (req, res) => {
  try {
    const { prescriptionId } = req.params;

    const prescription = await Prescription.findOne({
      _id: prescriptionId,
      user: req.user.id
    });

    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    // Delete image file
    if (prescription.prescriptionImage) {
      const filePath = path.join(UPLOAD_DIR, prescription.prescriptionImage);
      fs.unlink(filePath, err => {
        if (err) console.error("Error deleting file:", err);
      });
    }

    await Prescription.findByIdAndDelete(prescriptionId);

    res.json({ message: "Prescription deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// Get Prescription Statistics - Protected (Pharmacy)
// ===============================
exports.getPrescriptionStats = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.user.id);

    if (!pharmacy) {
      return res.status(404).json({ message: "Pharmacy not found" });
    }

    // Get stats
    const totalResponses = await Prescription.countDocuments({
      'responses.pharmacy': req.user.id
    });

    const conversions = await Prescription.countDocuments({
      'responses.pharmacy': req.user.id,
      selectedPharmacy: req.user.id
    });

    const pendingPrescriptions = await Prescription.countDocuments({
      status: 'pending',
      expiryDate: { $gte: new Date() }
    });

    const conversionRate = totalResponses > 0 ? (conversions / totalResponses * 100).toFixed(2) : 0;

    res.json({
      totalResponses,
      conversions,
      conversionRate: `${conversionRate}%`,
      pendingPrescriptions,
      responseRate: `${((totalResponses / Math.max(pendingPrescriptions, 1)) * 100).toFixed(2)}%`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// Helper Function: Calculate Distance
// ===============================
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
