import { 
  ERROR_MESSAGES, 
  SUCCESS_MESSAGES, 
  STORAGE_KEYS, 
  DEBOUNCE_DELAYS,
  ORDER_STATUS_DISPLAY 
} from './constants';

/**
 * UI utility functions
 */
export class UIUtils {
  /**
   * Format price with currency
   * @param {number} price - Price to format
   * @param {string} currency - Currency symbol
   * @returns {string} Formatted price
   */
  static formatPrice(price, currency = '$') {
    if (typeof price !== 'number' || isNaN(price)) {
      return `${currency}0.00`;
    }
    return `${currency}${price.toFixed(2)}`;
  }

  /**
   * Format date to readable string
   * @param {Date|string} date - Date to format
   * @param {object} options - Intl.DateTimeFormat options
   * @returns {string} Formatted date
   */
  static formatDate(date, options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }) {
    try {
      const dateObj = new Date(date);
      return dateObj.toLocaleDateString('en-US', options);
    } catch (error) {
      return 'Invalid Date';
    }
  }

  /**
   * Truncate text to specified length
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length
   * @param {string} suffix - Suffix to add when truncated
   * @returns {string} Truncated text
   */
  static truncateText(text, maxLength = 100, suffix = '...') {
    if (typeof text !== 'string' || text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength - suffix.length) + suffix;
  }

  /**
   * Generate toggle button styles
   * @param {boolean} isActive - Whether the toggle is active
   * @returns {object} Style object
   */
  static getToggleButtonStyles(isActive) {
    return {
      backgroundColor: isActive ? "#4f46e5" : "#6b7280",
      color: "white",
      padding: "0.5rem 1rem",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "0.875rem",
      transition: "all 0.2s ease",
    };
  }

  /**
   * Generate loading skeleton styles
   * @param {number} height - Height in pixels
   * @param {number} width - Width percentage
   * @returns {object} Style object
   */
  static getSkeletonStyles(height = 20, width = 100) {
    return {
      height: `${height}px`,
      width: `${width}%`,
      backgroundColor: '#e2e8f0',
      borderRadius: '4px',
      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    };
  }
}

/**
 * Error handling utilities
 */
export class ErrorUtils {
  /**
   * Extract error message from various error formats
   * @param {any} error - Error object or message
   * @returns {string} - Formatted error message
   */
  static getErrorMessage(error) {
    if (typeof error === 'string') {
      return error;
    }

    if (error?.response?.data?.message) {
      return error.response.data.message;
    }

    if (error?.message) {
      return error.message;
    }

    if (error?.response?.status) {
      switch (error.response.status) {
        case 400:
          return ERROR_MESSAGES.VALIDATION_ERROR;
        case 401:
          return ERROR_MESSAGES.UNAUTHORIZED;
        case 403:
          return ERROR_MESSAGES.FORBIDDEN;
        case 404:
          return ERROR_MESSAGES.NOT_FOUND;
        case 500:
          return ERROR_MESSAGES.SERVER_ERROR;
        default:
          return ERROR_MESSAGES.GENERIC_ERROR;
      }
    }

    return ERROR_MESSAGES.GENERIC_ERROR;
  }

  /**
   * Check if error is a network error
   * @param {any} error - Error object
   * @returns {boolean} - True if network error
   */
  static isNetworkError(error) {
    return error?.code === 'NETWORK_ERROR' || 
           error?.message === 'Network Error' ||
           !error?.response;
  }

  /**
   * Log error for debugging
   * @param {any} error - Error to log
   * @param {string} context - Context where error occurred
   */
  static logError(error, context = 'Unknown') {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${context}] Error:`, error);
    }
  }
}

/**
 * Local storage utilities
 */
export class StorageUtils {
  /**
   * Set item in local storage
   * @param {string} key - Storage key
   * @param {any} value - Value to store
   */
  static setItem(key, value) {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      ErrorUtils.logError(error, 'StorageUtils.setItem');
    }
  }

  /**
   * Get item from local storage
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default value if key not found
   * @returns {any} - Retrieved value or default
   */
  static getItem(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      ErrorUtils.logError(error, 'StorageUtils.getItem');
      return defaultValue;
    }
  }

  /**
   * Remove item from local storage
   * @param {string} key - Storage key
   */
  static removeItem(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      ErrorUtils.logError(error, 'StorageUtils.removeItem');
    }
  }

  /**
   * Clear all items from local storage
   */
  static clear() {
    try {
      localStorage.clear();
    } catch (error) {
      ErrorUtils.logError(error, 'StorageUtils.clear');
    }
  }

  /**
   * Get auth token from storage
   * @returns {string|null} - Auth token or null
   */
  static getAuthToken() {
    return this.getItem(STORAGE_KEYS.TOKEN);
  }

  /**
   * Set auth token in storage
   * @param {string} token - Auth token
   */
  static setAuthToken(token) {
    this.setItem(STORAGE_KEYS.TOKEN, token);
  }

  /**
   * Remove auth token from storage
   */
  static removeAuthToken() {
    this.removeItem(STORAGE_KEYS.TOKEN);
  }
}

/**
 * Utility functions for common operations
 */
export class UtilityHelpers {
  /**
   * Debounce function
   * @param {function} func - Function to debounce
   * @param {number} delay - Delay in milliseconds
   * @returns {function} - Debounced function
   */
  static debounce(func, delay = DEBOUNCE_DELAYS.INPUT_VALIDATION) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  /**
   * Throttle function
   * @param {function} func - Function to throttle
   * @param {number} delay - Delay in milliseconds
   * @returns {function} - Throttled function
   */
  static throttle(func, delay = 100) {
    let isThrottled = false;
    return function (...args) {
      if (!isThrottled) {
        func.apply(this, args);
        isThrottled = true;
        setTimeout(() => isThrottled = false, delay);
      }
    };
  }

  /**
   * Deep clone object
   * @param {any} obj - Object to clone
   * @returns {any} - Cloned object
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
   * Generate unique ID
   * @returns {string} - Unique ID
   */
  static generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Check if value is empty
   * @param {any} value - Value to check
   * @returns {boolean} - True if empty
   */
  static isEmpty(value) {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim().length === 0;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
  }

  /**
   * Capitalize first letter of string
   * @param {string} str - String to capitalize
   * @returns {string} - Capitalized string
   */
  static capitalize(str) {
    if (!str || typeof str !== 'string') return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  /**
   * Generate slug from string
   * @param {string} str - String to convert to slug
   * @returns {string} - Generated slug
   */
  static generateSlug(str) {
    if (!str || typeof str !== 'string') return '';
    
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  /**
   * Format file size
   * @param {number} bytes - File size in bytes
   * @returns {string} - Formatted file size
   */
  static formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get query parameters from URL
   * @param {string} url - URL to parse (optional, defaults to current URL)
   * @returns {object} - Query parameters object
   */
  static getQueryParams(url = window.location.search) {
    const params = new URLSearchParams(url);
    const result = {};
    
    for (let [key, value] of params) {
      result[key] = value;
    }
    
    return result;
  }

  /**
   * Update URL query parameters
   * @param {object} params - Parameters to update
   * @param {boolean} replace - Whether to replace current history entry
   */
  static updateQueryParams(params, replace = false) {
    const url = new URL(window.location);
    
    Object.keys(params).forEach(key => {
      if (params[key] === null || params[key] === undefined || params[key] === '') {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, params[key]);
      }
    });
    
    if (replace) {
      window.history.replaceState({}, '', url);
    } else {
      window.history.pushState({}, '', url);
    }
  }
}
