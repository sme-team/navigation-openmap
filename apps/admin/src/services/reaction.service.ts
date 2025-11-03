// src/services/reaction.service.ts
import apiClient from "./api-client";
import type { Reaction, ReactionSummary, ReactionType } from "@/types/api.types";
import { getClientFingerprint } from "@/utils/fingerprint.utils";

// Helper để tự động thêm fingerprint vào headers
const getHeaders = async () => {
  const fingerprint = await getClientFingerprint();
  return {
    "x-device-fingerprint": fingerprint,
  };
};

export const reactionService = {
  async addReaction(articleId: string, reactionType: ReactionType) {
    const headers = await getHeaders();
    const response = await apiClient.post<{ reaction: Reaction }>(
      `/api/articles/${articleId}/reactions`,
      { reaction_type: reactionType },
      { headers }
    );
    return response.data.reaction;
  },

  async removeReaction(articleId: string) {
    const headers = await getHeaders();
    const response = await apiClient.delete<{ message: string }>(
      `/api/articles/${articleId}/reactions`,
      { headers }
    );
    return response.data;
  },

  async getArticleReactions(articleId: string) {
    const headers = await getHeaders();
    const response = await apiClient.get<{
      reactions: ReactionSummary;
      userReaction: Reaction | null;
    }>(`/api/articles/${articleId}/reactions`, { headers });
    return response.data;
  },

  async toggleReaction(articleId: string, reactionType: ReactionType) {
    const headers = await getHeaders();
    const response = await apiClient.post<{
      action: "added" | "removed" | "changed";
      reaction: Reaction | null;
    }>(
      `/api/articles/${articleId}/reactions/toggle`,
      { reaction_type: reactionType },
      { headers }
    );
    return response.data;
  },
};
