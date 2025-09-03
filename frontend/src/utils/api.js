// Enhanced Axios configuration for API requests with better error handling and utilities
import axios from 'axios';
import { ErrorUtils, StorageUtils } from './helpers';
import { STORAGE_KEYS, ERROR_MESSAGES, HTTP_STATUS } from './constants';

/**
 * API Configuration
 */
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 
           import.meta.env.VITE_API_URL_PRODUCTION || 
           'http://localhost:5000/api',
  timeout: 30000,
  withCredentials: true,
};

/**
 * Create axios instance with enhanced configuration
 */
const api = axios.create({
  ...API_CONFIG,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor to add auth token and handle loading states
 */
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = StorageUtils.getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
      });
    }

    return config;
  },
  (error) => {
    ErrorUtils.logError(error, 'API Request Interceptor');
    return Promise.reject(error);
  }
);

/**
 * Response interceptor for enhanced error handling and logging
 */
api.interceptors.response.use(
  (response) => {
    // Log successful response in development
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }

    return response;
  },
  (error) => {
    // Log error in development
    if (import.meta.env.DEV) {
      console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    }

    // Handle different error scenarios
    if (error.response) {
      const { status, data } = error.response;

      // Handle authentication errors
      if (status === HTTP_STATUS.UNAUTHORIZED) {
        // Clear stored auth data
        StorageUtils.removeAuthToken();
        StorageUtils.removeItem(STORAGE_KEYS.USER);

        // Redirect to login if not already there
        const currentPath = window.location.pathname;
        const authPaths = ['/login', '/register'];
        const adminPaths = ['/admin'];
        
        if (!authPaths.some(path => currentPath.includes(path)) && 
            !adminPaths.some(path => currentPath.includes(path))) {
          // Use a small delay to prevent multiple redirects
          setTimeout(() => {
            window.location.href = '/login';
          }, 100);
        }
      }

      // Enhance error message
      error.message = ErrorUtils.getErrorMessage(error);
      
    } else if (error.request) {
      // Network error
      error.message = ErrorUtils.isNetworkError(error) 
        ? ERROR_MESSAGES.NETWORK_ERROR 
        : ERROR_MESSAGES.GENERIC_ERROR;
    } else {
      // Other errors
      error.message = error.message || ERROR_MESSAGES.GENERIC_ERROR;
    }

    return Promise.reject(error);
  }
);

/**
 * API helper methods for common operations
 */
export const apiHelpers = {
  /**
   * Create URL with query parameters
   */
  createUrl: (endpoint, params = {}) => {
    const url = new URL(endpoint, API_CONFIG.baseURL);
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        url.searchParams.append(key, params[key]);
      }
    });
    return url.toString().replace(API_CONFIG.baseURL, '');
  },

  /**
   * Handle file upload with progress
   */
  uploadFile: async (endpoint, file, onProgress = () => {}) => {
    const formData = new FormData();
    formData.append('file', file);

    return api.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const progress = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(progress);
      },
    });
  },

  /**
   * Handle multiple file uploads
   */
  uploadFiles: async (endpoint, files, onProgress = () => {}) => {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });

    return api.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const progress = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(progress);
      },
    });
  },

  /**
   * Download file with progress
   */
  downloadFile: async (endpoint, filename, onProgress = () => {}) => {
    const response = await api.get(endpoint, {
      responseType: 'blob',
      onDownloadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(progress);
        }
      },
    });

    // Create blob URL and download
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return response;
  },

  /**
   * Check API health
   */
  healthCheck: async () => {
    try {
      const response = await axios.get(API_CONFIG.baseURL.replace('/api', ''), {
        timeout: 5000,
      });
      return response.data;
    } catch (error) {
      throw new Error('API is not available');
    }
  },

  /**
   * Retry failed request
   */
  retryRequest: async (config, maxRetries = 3, delay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await api(config);
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  },
};

export default api;
