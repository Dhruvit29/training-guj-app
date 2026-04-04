// ---------------------------------------------------------------------------
// Axios instance — mirrors gc-ui's HTTP client configuration
// ---------------------------------------------------------------------------
// Base URL is set to /ga-admin/api so that all feature API modules can use
// relative paths (e.g. `/training/progress`).
// When embedded in gc-ui, the Azure AD token is forwarded automatically via
// the request interceptor.
// ---------------------------------------------------------------------------

import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/ga-admin/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach Azure AD Bearer token when available
axiosInstance.interceptors.request.use((config) => {
  const token =
    sessionStorage.getItem('azure_ad_token') ||
    sessionStorage.getItem('msal.idtoken') ||
    '';

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Response interceptor — unwrap errors consistently
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // You can add global error handling here (e.g. 401 redirect)
    console.error('[axiosInstance]', error?.response?.status, error?.message);
    return Promise.reject(error);
  },
);

export default axiosInstance;
