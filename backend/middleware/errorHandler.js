// Enhanced error handling middleware
const { ResponseUtils } = require('../utils/helpers');
const { HTTP_STATUS, MESSAGES } = require('../utils/constants');

/**
 * Global error handler middleware
 * Handles different types of errors and sends appropriate responses
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error('❌ Error:', err.stack);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    return ResponseUtils.notFound(res, message);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    return ResponseUtils.conflict(res, message);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = {};
    Object.values(err.errors).forEach(val => {
      errors[val.path] = val.message;
    });
    return ResponseUtils.validationError(res, errors);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return ResponseUtils.unauthorized(res, MESSAGES.ERROR.TOKEN_INVALID);
  }

  if (err.name === 'TokenExpiredError') {
    return ResponseUtils.unauthorized(res, 'Token has expired');
  }

  // Multer errors (file upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return ResponseUtils.validationError(res, 'File size too large');
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    return ResponseUtils.validationError(res, 'Too many files');
  }

  // Default error
  ResponseUtils.error(
    res, 
    error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
    error.message || MESSAGES.ERROR.SERVER_ERROR
  );
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res, next) => {
  ResponseUtils.notFound(res, `Route ${req.originalUrl} not found`);
};

/**
 * Request logging middleware
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log request
  console.log(`📥 ${req.method} ${req.url} - Origin: ${req.get('Origin') || 'No Origin'} - IP: ${req.ip}`);
  
  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const statusEmoji = status < 400 ? '✅' : status < 500 ? '⚠️' : '❌';
    
    console.log(`📤 ${statusEmoji} ${req.method} ${req.url} - ${status} - ${duration}ms`);
  });
  
  next();
};

/**
 * Rate limiting helper
 */
const createRateLimit = (windowMs, max, message) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean old requests
    for (const [key, timestamps] of requests.entries()) {
      const validTimestamps = timestamps.filter(time => time > windowStart);
      if (validTimestamps.length === 0) {
        requests.delete(key);
      } else {
        requests.set(key, validTimestamps);
      }
    }
    
    // Check current IP
    const ipRequests = requests.get(ip) || [];
    const recentRequests = ipRequests.filter(time => time > windowStart);
    
    if (recentRequests.length >= max) {
      return ResponseUtils.error(res, 429, message || 'Too many requests');
    }
    
    // Add current request
    recentRequests.push(now);
    requests.set(ip, recentRequests);
    
    next();
  };
};

/**
 * Security headers middleware
 */
const securityHeaders = (req, res, next) => {
  // Remove X-Powered-By header
  res.removeHeader('X-Powered-By');
  
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Add Content Security Policy for development
  if (process.env.NODE_ENV !== 'production') {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
    );
  }
  
  next();
};

module.exports = {
  errorHandler,
  notFoundHandler,
  requestLogger,
  createRateLimit,
  securityHeaders
};
