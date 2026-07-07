// lib/api.js
import axios from "axios";
import { useAuthStore } from "../store/authStore.js";
import { useSocketStore } from "../store/socketStore.js";

// ============================================
// CONFIGURATION
// ============================================

const API_BASE_URL =
  import.meta.env.VITE_ENV === "development"
    ? "http://localhost:5000/api"
    : import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// ============================================
// REQUEST INTERCEPTOR - Add Token
// ============================================

api.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ============================================
// RESPONSE INTERCEPTOR - Token Refresh
// ============================================

let isRefreshing = false;
let refreshQueue = [];

const processQueue = (token, error = null) => {
  refreshQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  refreshQueue = [];
};

api.interceptors.response.use(
  // Success: Pass through
  (response) => response,

  //  Error: Handle 401
  async (error) => {
    const originalRequest = error.config;

    //  Prevent loop on refresh endpoint
    if (originalRequest.url?.includes("/auth/refresh")) {
      console.warn("[API] Refresh endpoint failed, logging out");
      await handleAuthFailure();
      return Promise.reject(error);
    }

    // Only handle 401, don't retry twice
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // Queue if already refreshing
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    // Start refresh
    isRefreshing = true;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/refresh`,
        {},
        { withCredentials: true },
      );

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        response.data.data;

      //Update store with new tokens
      const { user } = useAuthStore.getState();
      useAuthStore.getState().setAuth({
        user,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        isAuthenticated: true,
      });

      // Process queued requests
      processQueue(newAccessToken);

      // Retry original request
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      //  Refresh failed - logout
      console.error("[API] Token refresh failed:", refreshError);
      await handleAuthFailure();
      processQueue(null, refreshError);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

const handleAuthFailure = async () => {
  useAuthStore.getState().logout();
  useSocketStore.getState().disconnect();
};

export default api;
