const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  let token = req.header("Authorization") || req.header("authorization");

  if (!token) {
    return res.status(401).json({ message: "Access Denied" });
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
    res.status(400).json({ message: "Invalid Token" });
  }
};