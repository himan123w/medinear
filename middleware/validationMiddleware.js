/**
 * 🛡️ Input Validation Middleware
 * Sanitizes and validates all incoming data
 */

const validator = {
  // Validate email
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 255;
  },

  // Validate phone
  isValidPhone(phone) {
    const phoneRegex = /^[0-9]{10,15}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  },

  // Validate password strength
  isStrongPassword(password) {
    // Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongRegex.test(password);
  },

  // Sanitize string input
  sanitizeString(input) {
    if (typeof input !== 'string') return '';
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove HTML tags
      .substring(0, 1000); // Limit length
  },

  // Sanitize number
  sanitizeNumber(input, min = 0, max = 1000000) {
    const num = parseInt(input, 10);
    if (isNaN(num)) return 0;
    return Math.min(Math.max(num, min), max);
  },

  // Validate object structure
  validateObject(obj, schema) {
    const errors = [];
    for (const [key, rules] of Object.entries(schema)) {
      const value = obj[key];
      
      if (rules.required && !value) {
        errors.push(`${key} is required`);
        continue;
      }

      if (rules.type && value && typeof value !== rules.type) {
        errors.push(`${key} must be ${rules.type}`);
      }

      if (rules.minLength && value && value.length < rules.minLength) {
        errors.push(`${key} must be at least ${rules.minLength} characters`);
      }

      if (rules.maxLength && value && value.length > rules.maxLength) {
        errors.push(`${key} must be at most ${rules.maxLength} characters`);
      }

      if (rules.min && value && value < rules.min) {
        errors.push(`${key} must be at least ${rules.min}`);
      }

      if (rules.max && value && value > rules.max) {
        errors.push(`${key} must be at most ${rules.max}`);
      }

      if (rules.pattern && value && !rules.pattern.test(value)) {
        errors.push(`${key} format is invalid`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

// Express middleware
const validationMiddleware = (req, res, next) => {
  // Sanitize body
  if (req.body && typeof req.body === 'object') {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = validator.sanitizeString(req.body[key]);
      }
    });
  }

  // Sanitize query
  if (req.query && typeof req.query === 'object') {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = validator.sanitizeString(req.query[key]);
      }
    });
  }

  next();
};

module.exports = {
  validator,
  validationMiddleware
};
