// file: src/services/api-client.ts
import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import ConfigService from "@/configs/config.service";
import { getLocalStorage, removeItemLocalStorage, setLocalStorage } from "@/utils/api-helpers";

import { createModuleLogger } from "@/logger";
const logger = createModuleLogger("ApiClient");

const config = ConfigService.getInstance();
const BASE_URL = config.getApiUrl() || "http://localhost:3001/blog-be";

const TOKEN_KEYS = {
  ACCESS_TOKEN: "blog_token",
  REFRESH_TOKEN: "blog_refresh_token",
} as const;

 
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Create axios instance with base configuration
export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add token to headers
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Only log non-auth requests in debug mode
    if (!config.url?.includes("/auth/")) {
      logger.debug(
        `[API] ${config.method?.toUpperCase()} ${BASE_URL}${config.url}`
      );
    }

    // Get token from LocalStorage
    const token = getLocalStorage(TOKEN_KEYS.ACCESS_TOKEN);

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    logger.error("[API Request Error]", error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors and refresh token
apiClient.interceptors.response.use(
  (response) => {
    // Only log non-auth responses in debug mode
    if (!response.config.url?.includes("/auth/")) {
      logger.debug(
        `[API Response] ${response.config.method?.toUpperCase()} ${
          response.config.url
        } - ${response.status}`
      );
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only log errors for non-auth endpoints or if it's not a 401/500 during init
    const isAuthEndpoint = originalRequest?.url?.includes("/auth/") || originalRequest?.url?.includes("/admin/");
    const isInitError = error.response?.status === 401 || error.response?.status === 500;
    
    if (!isAuthEndpoint || !isInitError) {
      logger.error(
        `[API Error] ${originalRequest?.method?.toUpperCase()} ${
          originalRequest?.url
        }`,
        error.response?.status,
        error.response?.data
      );
    } else {
      // Silently log auth verification errors during init
      logger.debug(
        `[API] Auth verification: ${originalRequest?.url} - ${error.response?.status}`
      );
    }

    // Handle 401 Unauthorized - Attempt token refresh
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = getLocalStorage(TOKEN_KEYS.REFRESH_TOKEN);

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        logger.debug("[API] Attempting token refresh");

        // Call refresh token endpoint
        const response = await axios.post(`${BASE_URL}/api/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // Save new tokens
        setLocalStorage(TOKEN_KEYS.ACCESS_TOKEN, accessToken);
        setLocalStorage(TOKEN_KEYS.REFRESH_TOKEN, newRefreshToken);

        logger.debug("[API] Token refresh successful");

        // Process queued requests
        processQueue(null, accessToken);
        isRefreshing = false;

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        logger.debug("[API] Token refresh failed, clearing auth state");

        // Process queued requests with error
        processQueue(refreshError, null);
        isRefreshing = false;

        // Clear tokens and redirect to login
        removeItemLocalStorage(TOKEN_KEYS.ACCESS_TOKEN);
        removeItemLocalStorage(TOKEN_KEYS.REFRESH_TOKEN);
        removeItemLocalStorage("blog_user");

        // Redirect to login page
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      }
    }

    // Handle other error types
    if (error.response) {
      // Server responded with error status
      const errorMessage =
        (error.response.data as any)?.error ||
        (error.response.data as any)?.message ||
        "An error occurred";

      return Promise.reject({
        message: errorMessage,
        statusCode: error.response.status,
        data: error.response.data,
      });
    } else if (error.request) {
      // Request made but no response received
      return Promise.reject({
        message: "No response from server. Please check your connection.",
        statusCode: 0,
      });
    } else {
      // Error setting up request
      return Promise.reject({
        message: error.message || "Request failed",
        statusCode: 0,
      });
    }
  }
);

// Helper function to handle file uploads
export const uploadFile = async (
  endpoint: string,
  file: File,
  fieldName = "file",
  additionalData?: Record<string, any>
) => {
  const formData = new FormData();
  formData.append(fieldName, file);

  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(
        key,
        typeof value === "object" ? JSON.stringify(value) : value
      );
    });
  }

  const token = getLocalStorage(TOKEN_KEYS.ACCESS_TOKEN);

  return axios.post(`${BASE_URL}${endpoint}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
};

// Export token keys for use in other services
export const getTokenKeys = () => TOKEN_KEYS;

export default apiClient;
 