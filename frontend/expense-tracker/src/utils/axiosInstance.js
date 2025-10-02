import axios from 'axios';
import { BASE_URL } from './apiPaths';

console.log('API Base URL:', BASE_URL);

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 seconds timeout
  withCredentials: true, // Enable credentials for cross-origin requests
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Expires': '0'
  }
});

// Request interceptor
axiosInstance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    
    // Log request details in development
    if (import.meta.env.DEV) {
      console.log(`[${config.method?.toUpperCase()}]`, config.url);
      console.log('Request config:', {
        baseURL: config.baseURL,
        url: config.url,
        method: config.method,
        headers: config.headers,
        data: config.data instanceof FormData ? 'FormData' : config.data
      });
    }
    
    // Add auth token if available
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Handle FormData
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']; // Let the browser set it with boundary
    }
    
    return config;
  },
  error => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging
axiosInstance.interceptors.response.use(
  response => {
    console.log(`[${response.status}] ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  error => {
    if (error.response) {
      // Server responded with a status code outside 2xx
      console.error('Response error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        url: error.config?.url,
        data: error.response.data,
        headers: error.response.headers
      });
      
      if (error.response.status === 401) {
        // Handle unauthorized
        window.location.href = '/login';
      } else if (error.response.status === 403) {
        // Handle forbidden
        console.error('Forbidden access to resource');
      } else if (error.response.status >= 500) {
        // Handle server errors
        console.error('Server error occurred');
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem("token");

        if(accessToken){
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        // Don't set Content-Type for FormData (let browser set it with boundary)
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if(error.response){
            if(error.response.status === 401){
                window.location.href = "/login";
            }
            else if(error.response.status === 500){
                console.error("Server error. Please try again");
            }
        }
        else if(error.code === 'ECONNABORTED'){
            console.error("Request timed out. Please check your internet connection and try again.");
            
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;