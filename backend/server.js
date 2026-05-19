const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import utilities and middleware
const { HTTP_STATUS } = require('./utils/constants');
const { ResponseUtils } = require('./utils/helpers');
const CORSManager = require('./utils/corsConfig');
const {
  errorHandler,
  notFoundHandler,
  requestLogger,
  securityHeaders
} = require('./middleware/errorHandler');

const app = express();

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Security headers
app.use(securityHeaders);

// Optimized CORS configuration
const corsConfig = CORSManager.getCORSConfig();
app.use(cors(corsConfig));

// Log CORS configuration for debugging
CORSManager.logCORSInfo();

// Rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  message: { success: false, message: 'Too many login attempts. Try again in 15 minutes.' },
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { success: false, message: 'AI rate limit reached. Please wait before sending more messages.' },
});

app.use('/api', globalLimiter);

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use(requestLogger);

// MongoDB Connection with pool tuning
mongoose.connect(process.env.MONGO_URI, {
  maxPoolSize: 20,
  minPoolSize: 5,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  retryWrites: true,
  w: 'majority',
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

mongoose.connection.on('error', err => {
  console.error('MongoDB runtime error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected. Attempting reconnect...');
});

// Health check route
app.get('/', (req, res) => {
  ResponseUtils.success(res, HTTP_STATUS.OK, '🌱 Greenify API is running!', {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes with proper error handling
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth', require('./routes/auth'));
app.use('/api/plants', require('./routes/plants'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/ratings', require('./routes/ratings'));
app.use('/api/ai-chat', aiLimiter, require('./routes/ai-chat'));

// 404 handler for unmatched routes
app.use('*', notFoundHandler);

// Global error handler (must be last middleware)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`API Base URL: http://localhost:${PORT}`);
});
