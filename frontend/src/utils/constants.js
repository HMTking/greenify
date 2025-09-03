/**
 * Frontend constants for consistent values across the application
 */

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    ME: '/auth/me',
    PROFILE: '/auth/profile',
    CHANGE_PASSWORD: '/auth/change-password',
  },
  PLANTS: {
    BASE: '/plants',
    BY_ID: (id) => `/plants/${id}`,
  },
  CART: {
    BASE: '/cart',
    ADD: '/cart/add',
    UPDATE: '/cart/update',
    REMOVE: '/cart/remove',
    CLEAR: '/cart/clear',
  },
  ORDERS: {
    BASE: '/orders',
    BY_ID: (id) => `/orders/${id}`,
    UPDATE_STATUS: (id) => `/orders/${id}/status`,
  },
  RATINGS: {
    BASE: '/ratings',
    PLANT: (plantId) => `/ratings/plant/${plantId}`,
    SUBMIT: '/ratings/submit',
  },
  AI_CHAT: '/ai-chat',
};

// HTTP Status Codes
export const HTTP_STATUS = {
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
export const USER_ROLES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
};

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

// Order Status Display
export const ORDER_STATUS_DISPLAY = {
  [ORDER_STATUS.PENDING]: { label: 'Pending', color: '#f59e0b', icon: '⏳' },
  [ORDER_STATUS.PROCESSING]: { label: 'Processing', color: '#3b82f6', icon: '⚙️' },
  [ORDER_STATUS.SHIPPED]: { label: 'Shipped', color: '#8b5cf6', icon: '🚚' },
  [ORDER_STATUS.DELIVERED]: { label: 'Delivered', color: '#10b981', icon: '✅' },
  [ORDER_STATUS.CANCELLED]: { label: 'Cancelled', color: '#ef4444', icon: '❌' },
};

// Plant Categories
export const PLANT_CATEGORIES = [
  'Indoor',
  'Outdoor', 
  'Succulents',
  'Flowering',
  'Air Purifying',
  'Low Maintenance',
  'Medicinal',
  'Herbs',
  'Cacti',
  'Tropical',
];

// Plant Category Icons
export const CATEGORY_ICONS = {
  Indoor: '🏠',
  Outdoor: '🌳',
  Succulents: '🌵',
  Flowering: '🌸',
  'Air Purifying': '🌿',
  'Low Maintenance': '🌱',
  Medicinal: '🏥',
  Herbs: '🌿',
  Cacti: '🌵',
  Tropical: '🌴',
};

// Validation Patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/,
  NAME: /^[a-zA-Z\s'-]{2,50}$/,
  PHONE_INDIAN: /^[6-9]\d{9}$/,
  ZIP_CODE_INDIAN: /^[0-9]{6}$/,
  CITY_STATE: /^[a-zA-Z\s]+$/,
};

// Validation Limits
export const VALIDATION_LIMITS = {
  NAME: { MIN: 2, MAX: 50 },
  EMAIL: { MIN: 5, MAX: 255 },
  PASSWORD: { MIN: 8, MAX: 255 },
  DESCRIPTION: { MIN: 10, MAX: 1000 },
  PRICE: { MIN: 1, MAX: 999999 },
  STOCK: { MIN: 0, MAX: 9999 },
  RATING: { MIN: 1, MAX: 5 },
  PHONE: { LENGTH: 10 },
  ZIP_CODE: { LENGTH: 6 },
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Login successful!',
  REGISTER: 'Account created successfully!',
  LOGOUT: 'Logged out successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!',
  ADDRESS_UPDATED: 'Address updated successfully!',
  PLANT_ADDED: 'Plant added successfully!',
  PLANT_UPDATED: 'Plant updated successfully!',
  PLANT_DELETED: 'Plant deleted successfully!',
  ORDER_PLACED: 'Order placed successfully!',
  ORDER_UPDATED: 'Order status updated successfully!',
  CART_UPDATED: 'Cart updated successfully!',
  CART_CLEARED: 'Cart cleared successfully!',
  ITEM_ADDED_TO_CART: 'Item added to cart!',
  ITEM_REMOVED_FROM_CART: 'Item removed from cart!',
  RATING_SUBMITTED: 'Rating submitted successfully!',
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'Please login to continue.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  GENERIC_ERROR: 'Something went wrong. Please try again.',
  LOGIN_FAILED: 'Invalid email or password.',
  REGISTRATION_FAILED: 'Registration failed. Please try again.',
  CART_ERROR: 'Failed to update cart. Please try again.',
  ORDER_ERROR: 'Failed to process order. Please try again.',
  UPLOAD_ERROR: 'Failed to upload image. Please try again.',
  
  // Validation specific error messages
  VALIDATION: {
    EMAIL_REQUIRED: 'Email is required',
    EMAIL_INVALID: 'Enter a valid email address',
    PASSWORD_REQUIRED: 'Password is required',
    PASSWORD_INVALID: 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number',
    NAME_REQUIRED: 'Name is required',
    PHONE_REQUIRED: 'Phone number is required',
    PHONE_INVALID: 'Enter a valid phone number',
    ADDRESS_REQUIRED: 'Address is required',
  },
};

// Loading States
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  CART: 'cart',
  THEME: 'theme',
  LANGUAGE: 'language',
};

// Theme Options
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto',
};

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 50,
  ADMIN_LIMIT: 10,
};

// File Upload Configuration
export const FILE_CONFIG = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  MAX_FILES: 5,
};

// Debounce Delays
export const DEBOUNCE_DELAYS = {
  SEARCH: 300,
  CART_UPDATE: 500,
  INPUT_VALIDATION: 200,
  API_CALLS: 1000,
};

// Animation Durations
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
};

// Breakpoints (for responsive design)
export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1200,
  LARGE: 1400,
};

// Default Test Credentials
export const TEST_CREDENTIALS = {
  ADMIN: {
    email: 'admin@gmail.com',
    password: 'AdminPlant@123',
  },
  CUSTOMER: {
    email: 'customer@gmail.com',
    password: 'CustomerPlant@123',
  },
};

// Rating Display
export const RATING_CONFIG = {
  MAX_STARS: 5,
  STAR_ICON: '⭐',
  EMPTY_STAR_ICON: '☆',
};

// Chat Configuration
export const CHAT_CONFIG = {
  MAX_MESSAGE_LENGTH: 1000,
  MAX_IMAGES: 3,
  TYPING_DELAY: 1000,
  MESSAGE_LIMIT: 50,
};
