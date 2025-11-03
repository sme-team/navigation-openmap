import apiClient from './api-client';
import type { SearchParams, SearchResponse, HealthCheckResponse } from '@/types/api.types';

export const utilityService = {
  async searchArticles(params: SearchParams) {
    const response = await apiClient.get<SearchResponse>('/api/search', {
      params: {
        q: params.q,
        limit: params.limit || 20,
      },
    });
    return response.data;
  },

  async healthCheck() {
    const response = await apiClient.get<HealthCheckResponse>('/health');
    return response.data;
  },

  formatViewCount(count: number): string {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  },

  formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  },
};