// Performance optimization utilities for admin panel
import axios from "axios";

// Simple in-memory cache with TTL (Time To Live)
class SimpleCache {
  constructor() {
    this.cache = new Map();
  }

  set(key, value, ttl = 30000) { // Default TTL: 30 seconds
    const expires = Date.now() + ttl;
    this.cache.set(key, { value, expires });
  }

  get(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() > cached.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.value;
  }

  clear() {
    this.cache.clear();
  }

  delete(key) {
    this.cache.delete(key);
  }
}

// Global cache instance
const apiCache = new SimpleCache();

// Enhanced axios instance with caching
const createCachedApiCall = (url, options = {}) => {
  return async (params = {}) => {
    const cacheKey = `${url}?${new URLSearchParams(params).toString()}`;
    
    // Check cache first
    const cached = apiCache.get(cacheKey);
    if (cached && !options.skipCache) {
      return cached;
    }

    try {
      const response = await axios.get(url, {
        params,
        headers: {
          'Cache-Control': 'max-age=30',
          ...options.headers
        }
      });

      // Cache the response
      if (!options.skipCache) {
        apiCache.set(cacheKey, response.data, options.ttl || 30000);
      }

      return response.data;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  };
};

// Predefined cached API calls
export const adminAPI = {
  // Get plants with caching
  getPlants: createCachedApiCall(`${import.meta.env.VITE_API_URL}/plants`, {
    ttl: 60000 // 1 minute cache
  }),

  // Get order stats with shorter cache
  getOrderStats: createCachedApiCall(`${import.meta.env.VITE_API_URL}/orders/admin/stats`, {
    ttl: 15000 // 15 seconds cache
  }),

  // Get orders with caching
  getOrders: createCachedApiCall(`${import.meta.env.VITE_API_URL}/orders/admin/all`, {
    ttl: 20000 // 20 seconds cache
  }),

  // Clear specific cache entries
  clearCache: (pattern) => {
    if (pattern) {
      // Clear entries matching pattern
      for (const key of apiCache.cache.keys()) {
        if (key.includes(pattern)) {
          apiCache.delete(key);
        }
      }
    } else {
      // Clear all cache
      apiCache.clear();
    }
  }
};

// Debounce utility for search inputs
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Optimize image loading
export const createOptimizedImageLoader = () => {
  const imageCache = new Map();
  
  return (src, callback) => {
    if (imageCache.has(src)) {
      callback(imageCache.get(src));
      return;
    }

    const img = new Image();
    img.onload = () => {
      imageCache.set(src, src);
      callback(src);
    };
    img.onerror = () => {
      callback(null);
    };
    img.src = src;
  };
};

// Performance monitoring
export const performanceMonitor = {
  startTime: null,
  
  start(label) {
    this.startTime = performance.now();
    console.log(`🚀 ${label} started`);
  },
  
  end(label) {
    if (this.startTime) {
      const duration = performance.now() - this.startTime;
      console.log(`✅ ${label} completed in ${duration.toFixed(2)}ms`);
      this.startTime = null;
    }
  }
};

// Memory usage monitoring (development only)
export const memoryMonitor = () => {
  if (process.env.NODE_ENV === 'development' && 'memory' in performance) {
    const memory = performance.memory;
    console.log('Memory Usage:', {
      used: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)} MB`,
      total: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)} MB`,
      limit: `${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)} MB`
    });
  }
};

export default {
  adminAPI,
  debounce,
  createOptimizedImageLoader,
  performanceMonitor,
  memoryMonitor
};
