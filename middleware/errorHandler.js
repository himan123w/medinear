/**
 * 🏥 Global Error Handler Middleware
 * Catches and standardizes all application errors
 */

const { ResponseFormatter } = require('./responseFormatter');
const { logger } = require('../services/monitoringService');

class ErrorHandler {
  constructor() {
    this.errorCounts = {
      validation: 0,
      notFound: 0,
      unauthorized: 0,
      forbidden: 0,
      serverError: 0,
      rateLimitExceeded: 0
    };
  }

  // Main error handler middleware
  handle() {
    return (err, req, res, next) => {
      const errorType = this.categorizeError(err);
      this.errorCounts[errorType]++;

      const statusCode = this.getStatusCode(err, errorType);
      const errorResponse = this.formatError(err, errorType, statusCode);

      // Log the error
      logger.error(`${errorType} - ${err.message}`, {
        url: req.originalUrl,
        method: req.method,
        statusCode,
        errorType,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });

      // Send response
      res.status(statusCode).json(errorResponse);
    };
  }

  // Categorize error type
  categorizeError(err) {
    if (err.name === 'ValidationError' || err.isJoiError) {
      return 'validation';
    }
    if (err.name === 'CastError' || err.name === 'MongooseError') {
      return 'validation';
    }
    if (err.statusCode === 404 || err.message.includes('not found')) {
      return 'notFound';
    }
    if (err.statusCode === 401 || err.message.includes('unauthorized')) {
      return 'unauthorized';
    }
    if (err.statusCode === 403 || err.message.includes('forbidden')) {
      return 'forbidden';
    }
    if (err.statusCode === 429 || err.message.includes('rate limit')) {
      return 'rateLimitExceeded';
    }
    return 'serverError';
  }

  // Get appropriate HTTP status code
  getStatusCode(err, errorType) {
    if (err.statusCode) {
      return err.statusCode;
    }

    const statusMap = {
      validation: 400,
      notFound: 404,
      unauthorized: 401,
      forbidden: 403,
      rateLimitExceeded: 429,
      serverError: 500
    };

    return statusMap[errorType] || 500;
  }

  // Format error response
  formatError(err, errorType, statusCode) {
    const timestamp = new Date().toISOString();
    const errorId = `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    let details = {};
    let message = err.message || 'An error occurred';

    // Extract validation errors
    if (err.details && Array.isArray(err.details)) {
      details = {
        validationErrors: err.details.map(d => ({
          field: d.field || d.key,
          message: d.message
        }))
      };
    } else if (err.errors) {
      // Mongoose validation errors
      details = {
        validationErrors: Object.entries(err.errors).map(([field, error]) => ({
          field,
          message: error.message
        }))
      };
    }

    return {
      success: false,
      error: {
        errorId,
        message,
        type: errorType,
        statusCode,
        timestamp,
        ...(Object.keys(details).length > 0 && { details }),
        ...(process.env.NODE_ENV === 'development' && { 
          stack: err.stack,
          originalError: err
        })
      }
    };
  }

  // Get error statistics
  getErrorStats() {
    const total = Object.values(this.errorCounts).reduce((a, b) => a + b, 0);
    return {
      total,
      byType: this.errorCounts,
      errorRate: total > 0 ? ((this.errorCounts.serverError / total) * 100).toFixed(2) + '%' : '0%'
    };
  }

  // Reset error counts
  resetErrorStats() {
    Object.keys(this.errorCounts).forEach(key => {
      this.errorCounts[key] = 0;
    });
  }
}

// Async error wrapper
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Not found handler (must be after all other routes)
function notFoundHandler(req, res, next) {
  const error = {
    statusCode: 404,
    message: `Cannot ${req.method} ${req.originalUrl}`,
    isJoiError: false
  };
  
  const handler = new ErrorHandler();
  handler.handle()(error, req, res, next);
}

module.exports = {
  ErrorHandler,
  asyncHandler,
  notFoundHandler
};
