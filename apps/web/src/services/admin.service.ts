// src/services/admin.service.ts
import apiClient from "./api-client";
import type {
  AdminStatsResponse,
  User,
  UsersListResponse,
  UserQueryParams,
  ArticlesListResponse,
  CreateUserRequest,
  UpdateUserRequest,
  UpdateUserRoleRequest,
  ArticleQueryParams,
  ArticleDetailResponse,
} from "@/types/api.types";

export const adminService = {
  async getStats() {
    const response = await apiClient.get<AdminStatsResponse>("/api/admin/stats");
    return response.data;
  },

  async getAllArticles(params: ArticleQueryParams = {}) {
    const response = await apiClient.get<ArticlesListResponse>(
      "/api/admin/articles",
      {
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          ...params,
        },
      }
    );
    return response.data;
  },

  async getArticleById(id: string) {
    const response = await apiClient.get<ArticleDetailResponse>(
      `/api/admin/articles/${id}`
    );
    return response.data;
  },

  async getAllUsers(params: UserQueryParams = {}) {
    const response = await apiClient.get<UsersListResponse>(
      "/api/admin/users",
      {
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          ...params,
        },
      }
    );
    return response.data;
  },

  async getUserById(id: string) {
    const response = await apiClient.get<{ user: User }>(
      `/api/admin/users/${id}`
    );
    return response.data.user;
  },

  async createUser(data: CreateUserRequest) {
    const response = await apiClient.post<{ user: User }>(
      "/api/admin/users",
      data
    );
    return response.data.user;
  },

  async updateUser(id: string, data: UpdateUserRequest) {
    const response = await apiClient.put<{ user: User }>(
      `/api/admin/users/${id}`,
      data
    );
    return response.data.user;
  },

  async updateUserRole(id: string, data: UpdateUserRoleRequest) {
    const response = await apiClient.put<{ user: User }>(
      `/api/admin/users/${id}/role`,
      data
    );
    return response.data.user;
  },

  async toggleUserActive(id: string) {
    const response = await apiClient.put<{ user: User; message: string }>(
      `/api/admin/users/${id}/toggle-active`
    );
    return response.data;
  },

  async deleteUser(id: string) {
    const response = await apiClient.delete<{ message: string }>(
      `/api/admin/users/${id}`
    );
    return response.data;
  },
};
