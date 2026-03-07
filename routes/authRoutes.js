const express = require("express");
const router = express.Router();
const { register, login, userRegister, userLogin } = require("../controllers/authController");

// User authentication endpoints
router.post("/user/register", userRegister);
router.post("/user/login", userLogin);

// Pharmacy authentication endpoints (legacy)
router.post("/register", register);
router.post("/login", login);

module.exports = router;