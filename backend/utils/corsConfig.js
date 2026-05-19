const { CORS_CONFIG } = require('./constants');

class CORSManager {
  static getAllowedOrigins() {
    const environment = process.env.NODE_ENV || 'development';

    if (environment === 'development') {
      const allowedOrigins = [...CORS_CONFIG.DEVELOPMENT_ORIGINS];

      if (process.env.FRONTEND_URL) {
        allowedOrigins.push(process.env.FRONTEND_URL);
      }

      if (process.env.PRODUCTION_ORIGINS) {
        const prodOrigins = process.env.PRODUCTION_ORIGINS.split(',').map(o => o.trim());
        allowedOrigins.push(...prodOrigins);
      }

      if (process.env.ADDITIONAL_ORIGINS) {
        const additional = process.env.ADDITIONAL_ORIGINS.split(',').map(o => o.trim());
        allowedOrigins.push(...additional);
      }

      return allowedOrigins;
    }

    // Production: build allowed list from env
    const productionOrigins = [];

    if (process.env.FRONTEND_URL) {
      productionOrigins.push(process.env.FRONTEND_URL);
    }

    if (process.env.PRODUCTION_ORIGINS) {
      const envOrigins = process.env.PRODUCTION_ORIGINS.split(',').map(o => o.trim());
      productionOrigins.push(...envOrigins);
    }

    return (origin, callback) => {
      if (!origin || productionOrigins.includes(origin)) {
        return callback(null, true);
      }

      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }

      const allowedPatterns = [
        /^https?:\/\/.*\.vercel\.app$/,
        /^https?:\/\/.*\.netlify\.app$/,
        /^https?:\/\/.*\.render\.com$/,
      ];

      if (allowedPatterns.some(pattern => pattern.test(origin))) {
        return callback(null, true);
      }

      callback(new Error(`Origin ${origin} not allowed by CORS`));
    };
  }

  static getCORSConfig() {
    return {
      ...CORS_CONFIG.OPTIONS,
      origin: this.getAllowedOrigins(),
    };
  }
}

module.exports = CORSManager;
