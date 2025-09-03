const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
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

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use(requestLogger);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => console.error('❌ MongoDB connection error:', err));

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
app.use('/api/auth', require('./routes/auth'));
app.use('/api/plants', require('./routes/plants'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/ratings', require('./routes/ratings'));
app.use('/api/ai-chat', require('./routes/ai-chat'));

// 404 handler for unmatched routes
app.use('*', notFoundHandler);

// Global error handler (must be last middleware)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 API Base URL: http://localhost:${PORT}`);
});
