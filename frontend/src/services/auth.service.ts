// src/services/auth.service.ts
import { setLocalStorage, removeItemLocalStorage, getLocalStorage } from '@/utils/api-helpers';
import apiClient from './api-client';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshTokenResponse,
  UserProfileResponse,
} from '@/types/api.types';

const TOKEN_KEYS = {
  ACCESS_TOKEN: 'blog_token',
  REFRESH_TOKEN: 'blog_refresh_token',
  USER: 'blog_user',
} as const;

export const authService = {
  async register(data: RegisterRequest) {
    const response = await apiClient.post<{
      message: string;
      user: AuthResponse['user'];
    }>('/api/auth/register', data);
    return response.data;
  },

  async login(data: LoginRequest) {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', data);
    if (response.data.accessToken) {
      setLocalStorage(TOKEN_KEYS.ACCESS_TOKEN, response.data.accessToken);
      setLocalStorage(TOKEN_KEYS.REFRESH_TOKEN, response.data.refreshToken);
    }
    return response.data;
  },

  async refreshToken(refreshToken: string) {
    const response = await apiClient.post<RefreshTokenResponse>('/api/auth/refresh', {
      refreshToken,
    });
    if (response.data.accessToken) {
      setLocalStorage(TOKEN_KEYS.ACCESS_TOKEN, response.data.accessToken);
      setLocalStorage(TOKEN_KEYS.REFRESH_TOKEN, response.data.refreshToken);
    }
    return response.data;
  },

  async logout() {
    const response = await apiClient.post<{ message: string }>('/api/auth/logout');
    removeItemLocalStorage(TOKEN_KEYS.ACCESS_TOKEN);
    removeItemLocalStorage(TOKEN_KEYS.REFRESH_TOKEN);
    removeItemLocalStorage(TOKEN_KEYS.USER);
    return response.data;
  },

  async getCurrentUser() {
    const response = await apiClient.get<UserProfileResponse>('/api/auth/me');
    return response.data;
  },

  isAuthenticated(): boolean {
    return !!getLocalStorage(TOKEN_KEYS.ACCESS_TOKEN);
  },

  getAccessToken(): string | null {
    return getLocalStorage(TOKEN_KEYS.ACCESS_TOKEN);
  },

  getRefreshToken(): string | null {
    return getLocalStorage(TOKEN_KEYS.REFRESH_TOKEN);
  },

  getTokenKeys() {
    return TOKEN_KEYS;
  },
};