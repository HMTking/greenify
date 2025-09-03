const { HTTP_STATUS, MESSAGES } = require('./constants');

/**
 * Utility class for handling API responses consistently
 */
class ResponseUtils {
  /**
   * Send success response
   * @param {object} res - Express response object
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Success message
   * @param {object} data - Response data
   */
  static success(res, statusCode = HTTP_STATUS.OK, message = 'Success', data = {}) {
    return res.status(statusCode).json({
      success: true,
      message,
      ...data
    });
  }

  /**
   * Send error response
   * @param {object} res - Express response object
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Error message
   * @param {object} errors - Validation errors (optional)
   */
  static error(res, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, message = MESSAGES.ERROR.SERVER_ERROR, errors = null) {
    const response = {
      success: false,
      message
    };

    if (errors) {
      response.errors = errors;
    }

    // Only include stack trace in development
    if (process.env.NODE_ENV === 'development' && statusCode >= 500) {
      response.stack = new Error().stack;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Send validation error response
   * @param {object} res - Express response object
   * @param {string|object} errors - Validation errors
   */
  static validationError(res, errors) {
    const message = typeof errors === 'string' ? errors : MESSAGES.ERROR.VALIDATION_FAILED;
    const errorData = typeof errors === 'object' ? errors : null;

    return this.error(res, HTTP_STATUS.BAD_REQUEST, message, errorData);
  }

  /**
   * Send unauthorized response
   * @param {object} res - Express response object
   * @param {string} message - Custom message
   */
  static unauthorized(res, message = MESSAGES.ERROR.UNAUTHORIZED) {
    return this.error(res, HTTP_STATUS.UNAUTHORIZED, message);
  }

  /**
   * Send forbidden response
   * @param {object} res - Express response object
   * @param {string} message - Custom message
   */
  static forbidden(res, message = MESSAGES.ERROR.ADMIN_REQUIRED) {
    return this.error(res, HTTP_STATUS.FORBIDDEN, message);
  }

  /**
   * Send not found response
   * @param {object} res - Express response object
   * @param {string} resource - Resource name
   */
  static notFound(res, resource = 'Resource') {
    return this.error(res, HTTP_STATUS.NOT_FOUND, `${resource} not found`);
  }

  /**
   * Send conflict response
   * @param {object} res - Express response object
   * @param {string} message - Custom message
   */
  static conflict(res, message = 'Resource already exists') {
    return this.error(res, HTTP_STATUS.CONFLICT, message);
  }

  /**
   * Handle async route errors
   * @param {function} fn - Async function
   */
  static asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  /**
   * Create paginated response
   * @param {object} res - Express response object
   * @param {Array} data - Data array
   * @param {number} page - Current page
   * @param {number} limit - Items per page
   * @param {number} total - Total items count
   * @param {string} message - Success message
   */
  static paginated(res, data, page, limit, total, message = 'Data retrieved successfully') {
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return this.success(res, HTTP_STATUS.OK, message, {
      data,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null,
      }
    });
  }
}

/**
 * Utility class for common helper functions
 */
class UtilityHelpers {
  /**
   * Generate random string
   * @param {number} length - String length
   * @returns {string} - Random string
   */
  static generateRandomString(length = 10) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Sanitize string for database storage
   * @param {string} str - String to sanitize
   * @returns {string} - Sanitized string
   */
  static sanitizeString(str) {
    if (!str || typeof str !== 'string') return '';
    return str.trim().replace(/[<>'"]/g, '');
  }

  /**
   * Calculate percentage
   * @param {number} part - Part value
   * @param {number} whole - Whole value
   * @returns {number} - Percentage
   */
  static calculatePercentage(part, whole) {
    if (!whole || whole === 0) return 0;
    return Math.round((part / whole) * 100);
  }

  /**
   * Format price for display
   * @param {number} price - Price value
   * @returns {string} - Formatted price
   */
  static formatPrice(price) {
    if (isNaN(price)) return '₹0';
    return `₹${price.toLocaleString('en-IN')}`;
  }

  /**
   * Get pagination parameters
   * @param {object} query - Request query parameters
   * @returns {object} - Pagination parameters
   */
  static getPaginationParams(query) {
    const { PAGINATION } = require('./constants');
    
    const page = Math.max(1, parseInt(query.page) || PAGINATION.DEFAULT_PAGE);
    const limit = Math.min(
      PAGINATION.MAX_LIMIT, 
      Math.max(1, parseInt(query.limit) || PAGINATION.DEFAULT_LIMIT)
    );
    const skip = (page - 1) * limit;

    return { page, limit, skip };
  }

  /**
   * Deep clone object
   * @param {object} obj - Object to clone
   * @returns {object} - Cloned object
   */
  static deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => this.deepClone(item));
    if (typeof obj === 'object') {
      const clonedObj = {};
      Object.keys(obj).forEach(key => {
        clonedObj[key] = this.deepClone(obj[key]);
      });
      return clonedObj;
    }
    return obj;
  }

  /**
   * Debounce function
   * @param {function} func - Function to debounce
   * @param {number} delay - Delay in milliseconds
   * @returns {function} - Debounced function
   */
  static debounce(func, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  /**
   * Check if object is empty
   * @param {object} obj - Object to check
   * @returns {boolean} - True if empty
   */
  static isEmpty(obj) {
    if (obj === null || obj === undefined) return true;
    if (typeof obj === 'string') return obj.trim().length === 0;
    if (Array.isArray(obj)) return obj.length === 0;
    if (typeof obj === 'object') return Object.keys(obj).length === 0;
    return false;
  }
}

module.exports = {
  ResponseUtils,
  UtilityHelpers
};
