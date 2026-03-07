/**
 * 🚀 Rate Limiting & Throttling Middleware
 * Prevents abuse, protects against attacks
 */

const rateLimit = require('express-rate-limit');

// Global rate limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip health check endpoint
    return req.path === '/api/health';
  }
});

// Auth limiter (stricter for login attempts)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts
  message: 'Too many login attempts, please try again after 15 minutes.',
  skipSuccessfulRequests: true, // Don't count successful requests
  standardHeaders: true,
  legacyHeaders: false
});

// API rate limiter (stricter)
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute per IP
  message: 'API rate limit exceeded',
  standardHeaders: true
});

// Heavy operation limiter
const heavyOperationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 heavy operations per minute
  message: 'Too many heavy operations, please slow down.'
});

// Per-user rate limiter (for authenticated endpoints)
class UserRateLimiter {
  constructor() {
    this.limits = new Map();
  }

  checkLimit(userId, action, maxPerWindow = 10, windowMs = 60000) {
    const key = `${userId}:${action}`;
    const now = Date.now();

    if (!this.limits.has(key)) {
      this.limits.set(key, []);
    }

    const timestamps = this.limits.get(key);

    // Remove old timestamps
    const recentTimestamps = timestamps.filter(ts => now - ts < windowMs);

    if (recentTimestamps.length >= maxPerWindow) {
      return {
        allowed: false,
        retryAfter: Math.ceil((recentTimestamps[0] + windowMs - now) / 1000)
      };
    }

    recentTimestamps.push(now);
    this.limits.set(key, recentTimestamps);

    return { allowed: true };
  }
}

const userRateLimiter = new UserRateLimiter();

module.exports = {
  globalLimiter,
  authLimiter,
  apiLimiter,
  heavyOperationLimiter,
  userRateLimiter
};
