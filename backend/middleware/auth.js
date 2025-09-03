// Authentication middleware for JWT token verification and user authorization
// Provides auth and admin middleware functions for protecting API routes
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ResponseUtils } = require('../utils/helpers');
const { HTTP_STATUS, MESSAGES, USER_ROLES } = require('../utils/constants');

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
const auth = ResponseUtils.asyncHandler(async (req, res, next) => {
  const authHeader = req.header('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  
  if (!token) {
    return ResponseUtils.unauthorized(res, MESSAGES.ERROR.TOKEN_INVALID);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password').lean();
    
    if (!user) {
      return ResponseUtils.unauthorized(res, MESSAGES.ERROR.TOKEN_INVALID);
    }

    req.user = user;
    next();
  } catch (error) {
    ResponseUtils.unauthorized(res, MESSAGES.ERROR.TOKEN_INVALID);
  }
});

/**
 * Admin authorization middleware
 * Checks if authenticated user has admin role
 */
const admin = (req, res, next) => {
  if (req.user && req.user.role === USER_ROLES.ADMIN) {
    next();
  } else {
    ResponseUtils.forbidden(res, MESSAGES.ERROR.ADMIN_REQUIRED);
  }
};

/**
 * Optional authentication middleware
 * Attaches user if token is valid but doesn't require authentication
 */
const optionalAuth = ResponseUtils.asyncHandler(async (req, res, next) => {
  const authHeader = req.header('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password').lean();
      
      if (user) {
        req.user = user;
      }
    } catch (error) {
      // Token invalid, continue without user
    }
  }
  
  next();
});

module.exports = { auth, admin, optionalAuth };
