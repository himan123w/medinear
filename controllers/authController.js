const Pharmacy = require("../models/Pharmacy");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ===== USER AUTHENTICATION =====

// User Register
exports.userRegister = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Validate required fields
    if (!email || !phone || !password) {
      return res.status(400).json({ message: "Email, phone, and password are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: 'user'
    });

    res.status(201).json({ message: "Registration successful" });
  } catch (error) {
    console.error('User registration error:', error);
    res.status(500).json({ message: error.message });
  }
};

// User Login
exports.userLogin = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    // Find user by email or phone
    const user = await User.findOne({ $or: [{ email }, { phone }] });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate token with role
    const token = jwt.sign(
      { 
        _id: user._id, 
        email: user.email,
        role: user.role,
        name: user.name
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('User login error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ===== PHARMACY AUTHENTICATION =====
exports.register = async (req, res) => {
  try {
    const { name, owner, phone, password, area, licenseNumber, latitude, longitude, address } = req.body;

    const existing = await Pharmacy.findOne({ phone });
    if (existing) {
      return res.status(400).json({ message: "Pharmacy already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const pharmacyData = {
      name,
      owner,
      phone,
      password: hashedPassword,
      area,
      licenseNumber,
      latitude: latitude || null,
      longitude: longitude || null,
      address: address || null
    };

    // Store coordinates in GeoJSON format (only if provided)
    if (latitude && longitude) {
      pharmacyData.location = {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      };
    }

    const pharmacy = await Pharmacy.create(pharmacyData);

    res.status(201).json({ message: "Registered successfully", pharmacyId: pharmacy._id });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Login Pharmacy
exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    const pharmacy = await Pharmacy.findOne({ phone });
    if (!pharmacy) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, pharmacy.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        _id: pharmacy._id,
        phone: pharmacy.phone,
        role: 'pharmacy',
        name: pharmacy.name
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      pharmacy: {
        _id: pharmacy._id,
        name: pharmacy.name,
        phone: pharmacy.phone,
        role: 'pharmacy'
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};