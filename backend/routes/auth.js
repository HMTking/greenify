// Authentication API routes for user registration, login and profile management
// Handles JWT token generation, user authentication and password updates
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @route POST /api/auth/register
// @desc Register user
// @access Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Name validation
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ message: 'Name is required' });
    }

    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      return res.status(400).json({ message: 'Name must be at least 2 characters long' });
    }

    if (trimmedName.length > 50) {
      return res.status(400).json({ message: 'Name cannot exceed 50 characters' });
    }

    const nameRegex = /^[a-zA-Z\s'-]{2,50}$/;
    if (!nameRegex.test(trimmedName)) {
      return res.status(400).json({ 
        message: 'Name can only contain letters, spaces, hyphens, and apostrophes' 
      });
    }

    if (trimmedName !== name || name.includes('  ')) {
      return res.status(400).json({ 
        message: 'Name cannot have leading/trailing spaces or multiple consecutive spaces' 
      });
    }

    // Email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: 'Please enter a valid email address with proper domain format' 
      });
    }

    // Additional email security checks
    if (email.length < 5) {
      return res.status(400).json({ 
        message: 'Email must be at least 5 characters long' 
      });
    }

    if (email.includes('..')) {
      return res.status(400).json({ 
        message: 'Email cannot contain consecutive dots' 
      });
    }

    if (/\s/.test(email)) {
      return res.status(400).json({ 
        message: 'Email cannot contain spaces' 
      });
    }

    const domain = email.split('@')[1];
    if (domain && (domain.startsWith('.') || domain.endsWith('.'))) {
      return res.status(400).json({ 
        message: 'Invalid email domain format' 
      });
    }

    // Password strength validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        message: 'Password must be at least 8 characters long and contain at least 1 uppercase letter, 1 lowercase letter, and 1 special character' 
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = new User({
      name,
      email,
      password,
      role: role || 'customer'
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/auth/login
// @desc Login user
// @access Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic email format validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/auth/me
// @desc Get current user
// @access Private
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        address: req.user.address
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route PUT /api/auth/profile
// @desc Update user profile
// @access Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, address } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = name || user.name;
    user.address = address || user.address;

    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
