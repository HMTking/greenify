// Authentication API routes for user registration, login and profile management
// Handles JWT token generation, user authentication and password updates
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const ValidationUtils = require('../utils/validation');
const { ResponseUtils } = require('../utils/helpers');
const { HTTP_STATUS, MESSAGES, JWT_CONFIG, USER_ROLES } = require('../utils/constants');

const router = express.Router();

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: JWT_CONFIG.EXPIRES_IN });
};

// @route POST /api/auth/register
// @desc Register user
// @access Public
router.post('/register', ResponseUtils.asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Validate name
  const nameValidation = ValidationUtils.validateName(name);
  if (!nameValidation.isValid) {
    return ResponseUtils.validationError(res, nameValidation.message);
  }

  // Validate email
  const emailValidation = ValidationUtils.validateEmail(email);
  if (!emailValidation.isValid) {
    return ResponseUtils.validationError(res, emailValidation.message);
  }

  // Validate password
  const passwordValidation = ValidationUtils.validatePassword(password);
  if (!passwordValidation.isValid) {
    return ResponseUtils.validationError(res, passwordValidation.message);
  }

  // Check if user exists
  const existingUser = await User.findOne({ email: emailValidation.value });
  if (existingUser) {
    return ResponseUtils.conflict(res, MESSAGES.ERROR.USER_EXISTS);
  }

  // Create user
  const user = new User({
    name: nameValidation.value,
    email: emailValidation.value,
    password,
    role: role && Object.values(USER_ROLES).includes(role) ? role : USER_ROLES.CUSTOMER
  });

  await user.save();

  // Generate token
  const token = generateToken(user._id);

  ResponseUtils.success(res, HTTP_STATUS.CREATED, MESSAGES.SUCCESS.USER_CREATED, {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
}));

// @route POST /api/auth/login
// @desc Login user
// @access Public
router.post('/login', ResponseUtils.asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate email
  const emailValidation = ValidationUtils.validateEmail(email);
  if (!emailValidation.isValid) {
    return ResponseUtils.validationError(res, emailValidation.message);
  }

  // Check if user exists
  const user = await User.findOne({ email: emailValidation.value });
  if (!user) {
    return ResponseUtils.validationError(res, MESSAGES.ERROR.INVALID_CREDENTIALS);
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return ResponseUtils.validationError(res, MESSAGES.ERROR.INVALID_CREDENTIALS);
  }

  // Generate token
  const token = generateToken(user._id);

  ResponseUtils.success(res, HTTP_STATUS.OK, MESSAGES.SUCCESS.LOGIN_SUCCESS, {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
}));

// @route GET /api/auth/me
// @desc Get current user
// @access Private
router.get('/me', auth, ResponseUtils.asyncHandler(async (req, res) => {
  ResponseUtils.success(res, HTTP_STATUS.OK, 'User profile retrieved', {
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      address: req.user.address
    }
  });
}));

// @route PUT /api/auth/profile
// @desc Update user profile
// @access Private
router.put('/profile', auth, ResponseUtils.asyncHandler(async (req, res) => {
  const { name, address } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    return ResponseUtils.notFound(res, 'User');
  }

  // Validate name if provided
  if (name) {
    const nameValidation = ValidationUtils.validateName(name);
    if (!nameValidation.isValid) {
      return ResponseUtils.validationError(res, nameValidation.message);
    }
    user.name = nameValidation.value;
  }

  // Validate address if provided
  if (address) {
    const addressValidation = ValidationUtils.validateAddress(address);
    if (!addressValidation.isValid) {
      return ResponseUtils.validationError(res, addressValidation.message, addressValidation.errors);
    }
    user.address = addressValidation.value;
  }

  await user.save();

  ResponseUtils.success(res, HTTP_STATUS.OK, MESSAGES.SUCCESS.PROFILE_UPDATED, {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      address: user.address
    }
  });
}));

// @route PUT /api/auth/change-password
// @desc Change user password
// @access Private
router.put('/change-password', auth, ResponseUtils.asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Validation
  if (!currentPassword || !newPassword) {
    return ResponseUtils.validationError(res, 'Both current and new passwords are required');
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    return ResponseUtils.notFound(res, 'User');
  }

  // Check current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return ResponseUtils.validationError(res, 'Current password is incorrect');
  }

  // Validate new password
  const passwordValidation = ValidationUtils.validatePassword(newPassword);
  if (!passwordValidation.isValid) {
    return ResponseUtils.validationError(res, passwordValidation.message);
  }

  // Update password
  user.password = newPassword;
  await user.save();

  ResponseUtils.success(res, HTTP_STATUS.OK, MESSAGES.SUCCESS.PASSWORD_CHANGED);
}));

module.exports = router;
