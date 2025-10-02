// Use Vite environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// For production, we want to use relative URLs to avoid CORS issues
export const BASE_URL = import.meta.env.PROD 
  ? '' // In production, use relative URLs
  : API_BASE_URL.endsWith('/') 
    ? API_BASE_URL.slice(0, -1) // Remove trailing slash if present
    : API_BASE_URL;

export const API_PATHS = {
  AUTH: {
    LOGIN: "/api/v1/auth/login",
    REGISTER: "/api/v1/auth/register",
    GET_USER_INFO: "/api/v1/auth/getUser",
    UPDATE: "/api/v1/auth/update",
    CHANGE_PASSWORD: "/api/v1/auth/change-password",
    UPLOAD_IMAGE: "/api/v1/auth/upload-image",
  },
  DASHBOARD: {
    GET_DATA: "/api/v1/dashboard",
  },
  BUDGET: {
    GET: "/api/v1/budget",
    SET: "/api/v1/budget",
  },
  INCOME: {
    ADD_INCOME: "/api/v1/income/add",
    GET_ALL_INCOME: "/api/v1/income/get",
    DELETE_INCOME: (incomeId) => `/api/v1/income/${incomeId}`,
    DOWNLOAD_INCOME: "/api/v1/income/downloadexcel",
  },
  EXPENSE: {
    ADD_EXPENSE: "/api/v1/expense/add",
    GET_ALL_EXPENSE: "/api/v1/expense/get",
    DELETE_EXPENSE: (expenseId) => `/api/v1/expense/${expenseId}`,
    DOWNLOAD_EXPENSE: "/api/v1/expense/downloadexcel",
  },
  AI: {
    SCAN_RECEIPT: "/api/v1/ai/scan",
  },
  ANALYTICS: {
    CATEGORY_BREAKDOWN: "/api/v1/analytics/category-breakdown",
  },
};