/**
 * 📋 Response Formatter & Standardizer
 * Ensures consistent API response structure
 */

class ResponseFormatter {
  // Success response
  static success(data, message = 'Success', statusCode = 200) {
    return {
      success: true,
      statusCode,
      message,
      data,
      timestamp: new Date().toISOString()
    };
  }

  // Error response
  static error(message, statusCode = 400, errors = null) {
    return {
      success: false,
      statusCode,
      message,
      errors,
      timestamp: new Date().toISOString()
    };
  }

  // Paginated response
  static paginated(data, page, limit, total, message = 'Success') {
    return {
      success: true,
      message,
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      timestamp: new Date().toISOString()
    };
  }

  // List response with metadata
  static list(items, metadata = {}) {
    return {
      success: true,
      data: items,
      metadata: {
        count: items.length,
        ...metadata
      },
      timestamp: new Date().toISOString()
    };
  }

  // File download response
  static fileResponse(filename, buffer, mimeType = 'application/octet-stream') {
    return {
      filename,
      buffer,
      mimeType,
      size: buffer.length
    };
  }
}

// Express middleware to add formatter to response object
const responseFormatterMiddleware = (req, res, next) => {
  // Add helper methods to response
  res.sendSuccess = (data, message = 'Success', statusCode = 200) => {
    res.status(statusCode).json(ResponseFormatter.success(data, message, statusCode));
  };

  res.sendError = (message, statusCode = 400, errors = null) => {
    res.status(statusCode).json(ResponseFormatter.error(message, statusCode, errors));
  };

  res.sendPaginated = (data, page, limit, total, message = 'Success') => {
    res.status(200).json(ResponseFormatter.paginated(data, page, limit, total, message));
  };

  res.sendList = (items, metadata = {}) => {
    res.status(200).json(ResponseFormatter.list(items, metadata));
  };

  next();
};

// Backward-compatible helpers used by existing controllers.
const formatSuccessResponse = (data, message = 'Success', statusCode = 200) =>
  ResponseFormatter.success(data, message, statusCode);

const formatErrorResponse = (message, statusCode = 400, errors = null) =>
  ResponseFormatter.error(message, statusCode, errors);

module.exports = {
  ResponseFormatter,
  responseFormatterMiddleware,
  formatSuccessResponse,
  formatErrorResponse
};
