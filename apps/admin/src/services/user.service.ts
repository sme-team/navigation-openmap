// src/services/user.service.ts
import apiClient from './api-client';
import type {
  User,
  UpdateUserRequest,
  UpdateAvatarRequest,
  ChangePasswordRequest,
  UserDashboardResponse,
  Enterprise,
  CreateEnterpriseRequest,
  UpdateEnterpriseRequest,
  Store,
  CreateStoreRequest,
  UpdateStoreRequest,
} from '@/types/api.types';

export const userService = {
  // User Profile
  async getProfile() {
    const response = await apiClient.get<{ user: User }>('/api/user/profile');
    return response.data.user;
  },

  async updateProfile(data: UpdateUserRequest) {
    const response = await apiClient.put<{ user: User }>('/api/user/profile', data);
    return response.data.user;
  },

  async updateAvatar(data: UpdateAvatarRequest) {
    const response = await apiClient.put<{ user: User }>('/api/user/avatar', data);
    return response.data.user;
  },

  async changePassword(data: ChangePasswordRequest) {
    const response = await apiClient.post<{ message: string }>(
      '/api/user/change-password',
      data
    );
    return response.data;
  },

  async getDashboard() {
    const response = await apiClient.get<UserDashboardResponse>('/api/user/dashboard');
    return response.data;
  },

  // Enterprise Management
  async createEnterprise(data: CreateEnterpriseRequest) {
    const response = await apiClient.post<{ enterprise: Enterprise }>(
      '/api/user/enterprise',
      data
    );
    return response.data.enterprise;
  },

  async getEnterprises() {
    const response = await apiClient.get<{ enterprises: Enterprise[] }>(
      '/api/user/enterprises'
    );
    return response.data.enterprises;
  },

  async getEnterpriseById(id: string) {
    const response = await apiClient.get<{ enterprise: Enterprise }>(
      `/api/user/enterprise/${id}`
    );
    return response.data.enterprise;
  },

  async updateEnterprise(id: string, data: UpdateEnterpriseRequest) {
    const response = await apiClient.put<{ enterprise: Enterprise }>(
      `/api/user/enterprise/${id}`,
      data
    );
    return response.data.enterprise;
  },

  async deleteEnterprise(id: string) {
    const response = await apiClient.delete<{ message: string }>(
      `/api/user/enterprise/${id}`
    );
    return response.data;
  },

  // Store Management
  async createStore(data: CreateStoreRequest) {
    const response = await apiClient.post<{ store: Store }>('/api/user/store', data);
    return response.data.store;
  },

  async getStoresByEnterprise(enterpriseId: string) {
    const response = await apiClient.get<{ stores: Store[] }>(
      `/api/user/enterprise/${enterpriseId}/stores`
    );
    return response.data.stores;
  },

  async getStoreById(id: string) {
    const response = await apiClient.get<{ store: Store }>(`/api/user/store/${id}`);
    return response.data.store;
  },

  async updateStore(id: string, data: UpdateStoreRequest) {
    const response = await apiClient.put<{ store: Store }>(
      `/api/user/store/${id}`,
      data
    );
    return response.data.store;
  },

  async deleteStore(id: string) {
    const response = await apiClient.delete<{ message: string }>(
      `/api/user/store/${id}`
    );
    return response.data;
  },
};