const { ResponseUtils } = require('../utils/helpers');
const { HTTP_STATUS, MESSAGES } = require('../utils/constants');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  if (process.env.NODE_ENV !== 'production') {
    console.error('Error:', err.message);
  }

  if (err.name === 'CastError') {
    return ResponseUtils.notFound(res, 'Resource not found');
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return ResponseUtils.conflict(res, `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`);
  }

  if (err.name === 'ValidationError') {
    const errors = {};
    Object.values(err.errors).forEach(val => {
      errors[val.path] = val.message;
    });
    return ResponseUtils.validationError(res, errors);
  }

  if (err.name === 'JsonWebTokenError') {
    return ResponseUtils.unauthorized(res, MESSAGES.ERROR.TOKEN_INVALID);
  }

  if (err.name === 'TokenExpiredError') {
    return ResponseUtils.unauthorized(res, 'Token has expired');
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return ResponseUtils.validationError(res, 'File size too large');
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    return ResponseUtils.validationError(res, 'Too many files');
  }

  ResponseUtils.error(
    res,
    error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
    error.message || MESSAGES.ERROR.SERVER_ERROR
  );
};

const notFoundHandler = (req, res) => {
  ResponseUtils.notFound(res, `Route ${req.originalUrl} not found`);
};

const securityHeaders = (req, res, next) => {
  res.removeHeader('X-Powered-By');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
};

module.exports = {
  errorHandler,
  notFoundHandler,
  securityHeaders
};
