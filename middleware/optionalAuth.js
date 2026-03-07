const jwt = require("jsonwebtoken");

/**
 * Optional authentication middleware
 * Verifies token if present, but allows request to continue without it
 * Sets req.user if token is valid, otherwise req.user is undefined
 */
module.exports = (req, res, next) => {
  let token = req.header("Authorization") || req.header("authorization");

  // No token? That's okay, continue as guest
  if (!token) {
    return next();
  }

  // Support headers with "Bearer <token>" or raw token
  if (token.startsWith("Bearer ")) {
    token = token.slice(7).trim();
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    // Invalid token, continue as guest
    next();
  }
};
