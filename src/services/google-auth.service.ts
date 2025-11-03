// src/services/google-auth.service.ts
import {
  setLocalStorage,
  getLocalStorage,
  removeItemLocalStorage,
} from "@/utils/api-helpers";
import apiClient from "./api-client";
import type {
  GoogleAuthUrlResponse,
  GoogleAuthResponse
} from "@/types/api.types";

const TOKEN_KEYS = {
  ACCESS_TOKEN: "blog_token",
  REFRESH_TOKEN: "blog_refresh_token",
  USER: "blog_user",
} as const;

export const googleAuthService = {
  async getAuthUrl() {
    const response = await apiClient.get<GoogleAuthUrlResponse>(
      "/api/auth/google/url"
    );
    return response.data;
  },

  async getAuthUrlWithCallback(callbackUrl?: string) {
    const response = await apiClient.post<GoogleAuthUrlResponse>(
      "/api/auth/google/url",
      { callbackUrl }
    );
    return response.data;
  },

  async handleCallback(code: string, storeId?: string) {
    const response = await apiClient.post<GoogleAuthResponse>(
      "/api/auth/google/callback",
      { code, storeId }
    );

    if (response.data.success && response.data.data.accessToken) {
      setLocalStorage(TOKEN_KEYS.ACCESS_TOKEN, response.data.data.accessToken);
      setLocalStorage(
        TOKEN_KEYS.REFRESH_TOKEN,
        response.data.data.refreshToken
      );
    }

    return response.data;
  },

  async refreshToken(refreshToken: string) {
    const response = await apiClient.post("/api/auth/google/refresh", {
      refreshToken,
    });

    if (response.data.success && response.data.data.accessToken) {
      setLocalStorage(TOKEN_KEYS.ACCESS_TOKEN, response.data.data.accessToken);
    }

    return response.data;
  },

  async logout() {
    const refreshToken = getLocalStorage(TOKEN_KEYS.REFRESH_TOKEN);
    const response = await apiClient.post<{
      success: boolean;
      message: string;
    }>("/api/auth/google/logout", { refreshToken });

    removeItemLocalStorage(TOKEN_KEYS.ACCESS_TOKEN);
    removeItemLocalStorage(TOKEN_KEYS.REFRESH_TOKEN);
    removeItemLocalStorage(TOKEN_KEYS.USER);

    return response.data;
  },

  async getUserProfile() {
    try {
      const response = await apiClient.get("/api/auth/google/me", {
        validateStatus: (status) => {
          // Chấp nhận cả 200 và 401 như response hợp lệ (không throw error)
          return (status >= 200 && status < 300) || status === 401;
        },
      });

      // Nếu là 401, return format giống error response
      if (response.status === 401) {
        return {
          success: false,
          data: null,
          message: "Unauthorized",
        };
      }

      return response.data;
    } catch {
      // Chỉ catch các lỗi network thực sự
      return {
        success: false,
        data: null,
      };
    }
  },

  async linkAccount(code: string) {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
    }>("/api/auth/google/link", { code });
    return response.data;
  },

  async unlinkAccount() {
    const response = await apiClient.delete<{
      success: boolean;
      message: string;
    }>("/api/auth/google/unlink");
    return response.data;
  },
};
