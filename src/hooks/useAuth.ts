// src/hooks/useAuth.ts - Authentication hook
import { useState, useEffect } from 'react';
import { authService } from '@/services/auth.service';
import type { UserProfileResponse, LoginRequest, RegisterRequest } from '@/types/api.types';
import { getErrorMessage, removeItemLocalStorage } from '@/utils/api-helpers';

export function useAuth() {
  const [user, setUser] = useState<UserProfileResponse['user'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    if (!authService.isAuthenticated()) {
      setLoading(false);
      return;
    }

    try {
      const response = await authService.getCurrentUser();
      setUser(response.user);
    } catch (err) {
      setError(getErrorMessage(err));
      // Clear invalid tokens
      removeItemLocalStorage(authService.getTokenKeys().ACCESS_TOKEN);
      removeItemLocalStorage(authService.getTokenKeys().REFRESH_TOKEN);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (credentials: LoginRequest) => {
    setError(null);
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      return response;
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw err;
    }
  };

  const register = async (data: RegisterRequest) => {
    setError(null);
    try {
      const response = await authService.register(data);
      return response;
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  };

  const isAuthenticated = !!user;
  const hasRole = (roles: string[]) => user && roles.includes(user.role);

  return {
    user,
    loading,
    error,
    isAuthenticated,
    hasRole,
    login,
    register,
    logout,
    refetch: fetchUser,
  };
}