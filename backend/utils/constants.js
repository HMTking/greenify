/**
 * Application constants for consistent values across the backend
 */

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

// User Roles
const USER_ROLES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
};

// Order Status
const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

// Payment Methods
const PAYMENT_METHODS = {
  COD: 'COD',
  ONLINE: 'online',
};

// Plant Categories
// Plant categories enum for validation
const PLANT_CATEGORIES = [
  'Flowering',
  'Herbs', 
  'Indoor',
  'Outdoor',
  'Succulents',
  'Trees'
];

// CORS configuration
const CORS_CONFIG = {
  // Development origins - common Vite, React, and Next.js ports
  DEVELOPMENT_ORIGINS: [
    'http://localhost:3000',    // React default
    'http://localhost:3001',    // React alternative
    'http://localhost:5173',    // Vite default
    'http://localhost:5174',    // Vite alternative
    'http://localhost:5175',    // Vite alternative
    'http://localhost:4173',    // Vite preview
    'http://127.0.0.1:5173',    // Vite localhost alternative
    'http://127.0.0.1:3000',    // React localhost alternative
  ],
  
  // Production origins will be added from environment variables
  PRODUCTION_ORIGINS: [],
  
  // CORS options
  OPTIONS: {
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'Accept', 
      'Origin', 
      'X-Requested-With', 
      'Cache-Control',
      'Accept-Encoding',
      'Accept-Language',
      'Connection',
      'Host',
      'Referer',
      'User-Agent'
    ],
    exposedHeaders: ['Content-Range', 'X-Content-Range', 'Content-Length'],
    optionsSuccessStatus: 200, // For legacy browser support
    preflightContinue: false,
    maxAge: 86400 // 24 hours cache for preflight requests
  }
};

// API Response Messages
const MESSAGES = {
  SUCCESS: {
    USER_CREATED: 'User created successfully',
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logout successful',
    PROFILE_UPDATED: 'Profile updated successfully',
    PASSWORD_CHANGED: 'Password changed successfully',
    PLANT_CREATED: 'Plant created successfully',
    PLANT_UPDATED: 'Plant updated successfully',
    PLANT_DELETED: 'Plant deleted successfully',
    ORDER_PLACED: 'Order placed successfully',
    ORDER_UPDATED: 'Order status updated successfully',
    CART_UPDATED: 'Cart updated successfully',
    CART_CLEARED: 'Cart cleared successfully',
    RATING_SUBMITTED: 'Rating submitted successfully',
    RATING_UPDATED: 'Rating updated successfully',
  },
  ERROR: {
    VALIDATION_FAILED: 'Validation failed',
    USER_EXISTS: 'User already exists',
    INVALID_CREDENTIALS: 'Invalid credentials',
    USER_NOT_FOUND: 'User not found',
    PLANT_NOT_FOUND: 'Plant not found',
    ORDER_NOT_FOUND: 'Order not found',
    CART_NOT_FOUND: 'Cart not found',
    UNAUTHORIZED: 'Authorization denied',
    ADMIN_REQUIRED: 'Admin access required',
    TOKEN_INVALID: 'Token is not valid',
    SERVER_ERROR: 'Internal server error',
    INSUFFICIENT_STOCK: 'Insufficient stock available',
    INVALID_QUANTITY: 'Invalid quantity specified',
    RATING_EXISTS: 'Rating already exists for this order',
    INVALID_RATING: 'Rating must be between 1 and 5',
  },
};

// Validation Patterns
const VALIDATION_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/,
  NAME: /^[a-zA-Z\s'-]{2,50}$/,
  PHONE_INDIAN: /^[6-9]\d{9}$/,
  ZIP_CODE_INDIAN: /^[0-9]{6}$/,
  CITY_STATE: /^[a-zA-Z\s]+$/,
};

// Validation Limits
// Validation limits
const VALIDATION_LIMITS = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  EMAIL_MIN_LENGTH: 5,
  EMAIL_MAX_LENGTH: 100,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  ADDRESS_MIN_LENGTH: 10,
  ADDRESS_MAX_LENGTH: 255,
  DESCRIPTION: {
    MIN: 10,
    MAX: 1000,
  },
  PHONE: {
    LENGTH: 10,
  },
  ZIP_CODE: {
    LENGTH: 6,
  },
  RATING: {
    MIN: 1,
    MAX: 5,
  },
  PRICE: {
    MIN: 1,
    MAX: 999999,
  },
  STOCK: {
    MIN: 0,
    MAX: 10000,
  },
  MAX_ITEMS_PER_PAGE: 50,
};

// Database Configuration
const DB_OPTIONS = {
  CONNECT_TIMEOUT: 30000,
  BUFFER_MAX_ENTRIES: 0,
};

// JWT Configuration
const JWT_CONFIG = {
  EXPIRES_IN: '30d',
  ALGORITHM: 'HS256',
};

// File Upload Configuration
const FILE_CONFIG = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  MAX_FILES: 5,
};

// Pagination Defaults
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

module.exports = {
  HTTP_STATUS,
  USER_ROLES,
  ORDER_STATUS,
  PAYMENT_METHODS,
  PLANT_CATEGORIES,
  MESSAGES,
  VALIDATION_PATTERNS,
  VALIDATION_LIMITS,
  DB_OPTIONS,
  JWT_CONFIG,
  FILE_CONFIG,
  PAGINATION,
  CORS_CONFIG,
};
