import axios from 'axios';

// Get API URL based on environment
const getApiUrl = (): string => {
  // Check for environment variable first
  const envUrl = import.meta.env?.VITE_API_URL;
  if (envUrl) {
    console.log('Using VITE_API_URL:', envUrl);
    return envUrl;
  }
  
  // In development (localhost), use proxy
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    console.log('Using local proxy: /api');
    return '/api';
  }
  
  // In production on Render - TRY THESE URLs
  // Update this with your actual backend URL from Render dashboard
  const backendUrl = 'https://arabic-trivia-backend.onrender.com/api';
  console.log('🌐 Production mode - using backend:', backendUrl);
  console.log('🔗 If API fails, check your Render backend URL and update api.ts');
  return backendUrl;
};

const API_URL = getApiUrl();
console.log('📡 API Base URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Log all requests for debugging
api.interceptors.request.use((config) => {
  console.log(`📤 API: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  return config;
});

// Log errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('❌ API Error:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    } else if (error.code === 'ERR_NETWORK') {
      console.error('   Backend may not be running or CORS issue');
      console.error('   Check your backend URL in Render dashboard');
    }
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - backend may not be running');
    } else if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('No response from server - backend may not be running');
    }
    return Promise.reject(error);
  }
);

export default api;

