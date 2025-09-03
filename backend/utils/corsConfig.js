/**
 * CORS Configuration Utility
 * Handles Cross-Origin Resource Sharing configuration for the application
 * Supports both development and production environments with flexible origin management
 */

const { CORS_CONFIG } = require('./constants');

/**
 * CORS Configuration Manager
 */
class CORSManager {
  /**
   * Get allowed origins based on environment
   * @returns {Array|Function} Array of allowed origins or function for dynamic origin checking
   */
  static getAllowedOrigins() {
    const environment = process.env.NODE_ENV || 'development';
    
    if (environment === 'development') {
      // Development mode: Allow common development ports + environment variable
      const allowedOrigins = [...CORS_CONFIG.DEVELOPMENT_ORIGINS];
      
      // Add FRONTEND_URL from environment if it exists
      if (process.env.FRONTEND_URL) {
        allowedOrigins.push(process.env.FRONTEND_URL);
      }
      
      // Add any additional development URLs from environment
      if (process.env.ADDITIONAL_ORIGINS) {
        const additionalOrigins = process.env.ADDITIONAL_ORIGINS.split(',').map(origin => origin.trim());
        allowedOrigins.push(...additionalOrigins);
      }
      
      console.log('🔧 CORS Development Origins:', allowedOrigins);
      return allowedOrigins;
    }
    
    // Production mode: Use environment variables only
    const productionOrigins = [];
    
    if (process.env.FRONTEND_URL) {
      productionOrigins.push(process.env.FRONTEND_URL);
    }
    
    if (process.env.PRODUCTION_ORIGINS) {
      const envOrigins = process.env.PRODUCTION_ORIGINS.split(',').map(origin => origin.trim());
      productionOrigins.push(...envOrigins);
    }
    
    // Fallback for production if no origins are specified
    if (productionOrigins.length === 0) {
      console.warn('⚠️  No production origins configured. Using dynamic origin checking.');
      return this.dynamicOriginChecker;
    }
    
    console.log('🚀 CORS Production Origins:', productionOrigins);
    return productionOrigins;
  }
  
  /**
   * Dynamic origin checker for production environments
   * Allows origins based on certain patterns or conditions
   * @param {string} origin - The origin to check
   * @param {Function} callback - Callback function
   */
  static dynamicOriginChecker(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      console.log('🔓 Allowing request with no origin (mobile app/API client)');
      return callback(null, true);
    }
    
    // Allow localhost in development-like scenarios
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      console.log('🔧 Allowing localhost origin:', origin);
      return callback(null, true);
    }
    
    // Allow common development and staging patterns
    const allowedPatterns = [
      /^https?:\/\/.*\.vercel\.app$/,
      /^https?:\/\/.*\.netlify\.app$/,
      /^https?:\/\/.*\.herokuapp\.com$/,
      /^https?:\/\/.*\.railway\.app$/,
      /^https?:\/\/.*\.render\.com$/,
    ];
    
    const isAllowed = allowedPatterns.some(pattern => pattern.test(origin));
    
    if (isAllowed) {
      console.log('✅ Allowing origin by pattern match:', origin);
      return callback(null, true);
    }
    
    console.warn('❌ Origin not allowed:', origin);
    callback(new Error(`Origin ${origin} not allowed by CORS policy`));
  }
  
  /**
   * Get complete CORS configuration object
   * @returns {object} CORS configuration for express cors middleware
   */
  static getCORSConfig() {
    return {
      ...CORS_CONFIG.OPTIONS,
      origin: this.getAllowedOrigins(),
    };
  }
  
  /**
   * Log CORS configuration for debugging
   */
  static logCORSInfo() {
    const environment = process.env.NODE_ENV || 'development';
    console.log('\n🌐 CORS Configuration:');
    console.log(`   Environment: ${environment}`);
    console.log(`   Credentials: ${CORS_CONFIG.OPTIONS.credentials}`);
    console.log(`   Methods: ${CORS_CONFIG.OPTIONS.methods.join(', ')}`);
    console.log(`   Max Age: ${CORS_CONFIG.OPTIONS.maxAge}s`);
    
    const origins = this.getAllowedOrigins();
    if (typeof origins === 'function') {
      console.log('   Origins: Dynamic checking enabled');
    } else {
      console.log(`   Origins: ${origins.length} configured`);
      origins.forEach((origin, index) => {
        console.log(`     ${index + 1}. ${origin}`);
      });
    }
    console.log('');
  }
}

module.exports = CORSManager;
