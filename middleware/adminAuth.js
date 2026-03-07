const jwt = require("jsonwebtoken");

/**
 * Admin Authentication Middleware
 * Verifies token and checks if user is admin
 */
module.exports = (req, res, next) => {
  let token = req.header("Authorization") || req.header("authorization");

  if (!token) {
    return res.status(401).json({ message: "Access Denied - No token provided" });
  }

  if (token.startsWith("Bearer ")) {
    token = token.slice(7).trim();
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user is admin
    if (verified.role !== 'admin') {
      return res.status(403).json({ message: "Access Denied - Admin access required" });
    }

    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid Token" });
  }
};
