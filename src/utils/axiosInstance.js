// src/utils/axiosInstance.js
import axios from 'axios';

// Base URL left empty; callers should use absolute URLs or Laravel proxy.
const instance = axios.create({
  baseURL: '',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: false,
  validateStatus: status => status >= 200 && status < 300
});

// Add logging interceptors
instance.interceptors.request.use(
  (config) => {
    // Ensure Authorization header is set from stored token only
    if (!config.headers['Authorization']) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }

    // Log the full request details
    console.log('Request:', {
      url: config.url?.startsWith('http') ? config.url : config.baseURL + (config.url || ''),
      method: config.method,
      data: config.data,
      headers: config.headers
    });

    // Do not auto-prepend paths; callers should pass correct URLs

    // Use a different base URL for payment gateway requests
    if (config.url?.includes('pg.dewamalaya33.com') || config.url?.includes('/pg-proxy')) {
      // For absolute URLs, remove the baseURL to prevent duplication
      if (config.url?.startsWith('http')) {
        config.baseURL = '';
      }
    }

    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => {
    console.log('Response:', response.data);
    return response;
  },
  (error) => {
    console.error('API Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
        data: error.config?.data
      }
    });
    return Promise.reject(error);
  }
);

export default instance;
