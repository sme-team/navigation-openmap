// src/types/api.ts - Complete API types matching backend

// ============================================================================
// COMMON TYPES
// ============================================================================

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================================================
// USER TYPES
// ============================================================================

export type UserRole =
  | "superadmin"
  | "admin"
  | "manager"
  | "staff"
  | "editor"
  | "author"
  | "moderator"
  | "viewer"
  | "guest";

export interface User {
  _id?: string;
  store_id?: string;
  username: string;
  full_name?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  avatar_url?: string;
  is_active?: boolean;
  auth_provider?: string;
  provider_id?: string;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
  location?: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  full_name: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  avatar_url?: string;
  auth_provider?: string;
  provider_id?: string;
}

export interface UpdateUserRequest {
  full_name?: string;
  email?: string;
  phone?: string;
  location?: string;
  avatar_url?: string;
  is_active?: boolean;
}

export interface UpdateUserRoleRequest {
  role: UserRole;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface UpdateAvatarRequest {
  avatar_url: string;
}

// ============================================================================
// USER RESPONSE TYPES (FIXED)
// ============================================================================

export interface UserResponse {
  user: User;
}

export interface CreateUserResponse {
  user: User;
}

export interface UpdateUserResponse {
  user: User;
}

export interface ToggleUserActiveResponse {
  user: User;
  message: string;
}

export interface DeleteUserResponse {
  message: string;
}

export interface ChangePasswordResponse {
  message: string;
}

// ============================================================================
// AUTHENTICATION TYPES
// ============================================================================

export interface LoginRequest {
  username?: string;
  email?: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email?: string;
  password: string;
  full_name?: string;
  phone?: string;
  role?: "author" | "viewer" | "guest";
  avatar_url?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    storeId: string;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface UserProfileResponse {
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    storeId: string;
    full_name?: string;
    phone?: string;
    avatar_url?: string;
    is_active?: boolean;
    last_login?: string;
    created_at?: string;
  };
}

// ============================================================================
// ARTICLE TYPES
// ============================================================================

export type ArticleStatus = "draft" | "published" | "archived";

export interface Article {
  _id?: string;
  store_id: string;
  title: string;
  slug: string;
  description?: string;
  excerpt?: string;
  content: string;
  author?: string;
  status: ArticleStatus;
  image?: string;
  image_alt?: string;
  featured_image?: string;
  youtube?: string;
  youtube_title?: string;
  google_map?: string;
  map_title?: string;
  tags?: string[];
  category?: string;
  seo_keywords?: string;
  canonical_url?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  is_hidden: boolean;
  is_comments_locked: boolean;
  created_at?: string;
  updated_at?: string;
  published_at?: string;
}

export interface CreateArticleRequest {
  title: string;
  slug?: string;
  description?: string;
  excerpt?: string;
  content: string;
  category?: string;
  tags?: string[];
  status?: ArticleStatus;
  image?: string;
  image_alt?: string;
  featured_image?: string;
  youtube?: string;
  youtube_title?: string;
  google_map?: string;
  map_title?: string;
  seo_keywords?: string;
  canonical_url?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  is_hidden?: boolean;
  is_comments_locked?: boolean;
}
// Nếu có nhiều dòng liên tiếp cần dùng any (thường là trong các hàm mapping data phức tạp):

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UpdateArticleRequest extends Partial<CreateArticleRequest> {}

export interface ArticleQueryParams extends PaginationParams {
  category?: string;
  tags?: string;
  search?: string;
  author?: string;
  sort?: string;
}

export interface ArticlesListResponse {
  articles: Article[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ArticleMetrics {
  article_id: string;
  total_views: number;
  unique_views: number;
  last_viewed_at?: string;
}

export interface ArticleDetailResponse {
  article: Article;
  metrics: ArticleMetrics;
  comments: Comment[];
  reactions: ReactionSummary;
}
// ============================================================================
// COMMENT TYPES
// ============================================================================

export type CommentStatus = "pending" | "approved" | "rejected";

export interface Comment {
  _id: string;
  article_id: string;
  author_name: string;
  author_email?: string;
  content: string;
  parent_id?: string;
  status: CommentStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateCommentRequest {
  author_name: string;
  author_email?: string;
  content: string;
  parent_id?: string;
}

// ============================================================================
// REACTION TYPES
// ============================================================================

export type ReactionType = "like" | "love" | "haha" | "wow" | "sad" | "angry";

export interface Reaction {
  _id: string;
  article_id: string;
  user_id?: string;
  ip_address?: string;
  reaction_type: ReactionType;
  created_at: string;
}

export interface CreateReactionRequest {
  reaction_type: ReactionType;
}

export interface ReactionSummary {
  like?: number;
  love?: number;
  haha?: number;
  wow?: number;
  sad?: number;
  angry?: number;
  total?: number;
}

// ============================================================================
// ADMIN TYPES
// ============================================================================

export interface AdminStats {
  articles: {
    total: number;
    published: number;
    draft: number;
    archived: number;
  };
  users: {
    total: number;
    active: number;
    byRole: Record<string, number>;
  };
}

export interface UsersListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserQueryParams extends PaginationParams {
  role?: string;
  search?: string;
  is_active?: boolean;
}

// ============================================================================
// ADMIN RESPONSE TYPES
// ============================================================================
export interface AdminStatsResponse {
  articles: {
    total: number;
    published: number;
    draft: number;
    archived: number;
  };
  users: {
    total: number;
    active: number;
    byRole: Record<string, number>;
  };
}

// ============================================================================
// GOOGLE AUTH TYPES
// ============================================================================

export interface GoogleAuthUrlRequest {
  callbackUrl?: string;
}

export interface GoogleAuthUrlResponse {
  success: boolean;
  message: string;
  data: {
    authUrl: string;
  };
}

export interface GoogleCallbackRequest {
  code: string;
  storeId?: string;
}

export interface GoogleAuthResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      username: string;
      email: string;
      full_name: string;
      role: string;
      avatar_url?: string;
    };
    accessToken: string;
    refreshToken: string;
  };
}

// ============================================================================
// ENTERPRISE & STORE TYPES
// ============================================================================

export type BusinessType =
  | "ltd"
  | "joint_stock"
  | "private"
  | "partnership"
  | "sole_proprietorship";
export type EnterpriseStatus = "active" | "inactive" | "suspended" | "pending";
export type SubscriptionPlan = "basic" | "premium" | "enterprise";
export type StoreStatus = "active" | "inactive" | "maintenance" | "closed";

export interface Enterprise {
  _id?: string;
  name: string;
  business_type?: BusinessType;
  industries?: string[];
  address?: string;
  tax_code?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  status: EnterpriseStatus;
  subscription_plan: SubscriptionPlan;
  created_at: string;
  updated_at: string;
}

export interface CreateEnterpriseRequest {
  name: string;
  business_type?: BusinessType;
  industries?: string[];
  address?: string;
  tax_code?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  status?: EnterpriseStatus;
  subscription_plan?: SubscriptionPlan;
}

// eslint-disable-next-line  @typescript-eslint/no-empty-object-type
export interface UpdateEnterpriseRequest
  extends Partial<CreateEnterpriseRequest> {}

export interface EnterpriseResponse {
  enterprise: Enterprise;
}

export interface EnterprisesListResponse {
  enterprises: Enterprise[];
}

export interface DeleteEnterpriseResponse {
  message: string;
}

export interface Store {
  _id?: string;
  enterprise_id: string;
  name: string;
  store_type?: string;
  address?: string;
  phone?: string;
  email?: string;
  manager_name?: string;
  timezone: string;
  currency: string;
  tax_rate: number;
  status: StoreStatus;
  sync_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateStoreRequest {
  enterprise_id: string;
  name: string;
  store_type?: string;
  address?: string;
  phone?: string;
  email?: string;
  manager_name?: string;
  operating_hours?: any;
  timezone?: string;
  currency?: string;
  tax_rate?: number;
  status?: StoreStatus;
  sync_enabled?: boolean;
}
// eslint-disable-next-line  @typescript-eslint/no-empty-object-type
export interface UpdateStoreRequest
  extends Partial<Omit<CreateStoreRequest, "enterprise_id">> {}

export interface StoreResponse {
  store: Store;
}

export interface StoresListResponse {
  stores: Store[];
}

export interface DeleteStoreResponse {
  message: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface SearchParams {
  q: string;
  limit?: number;
}

export interface SearchResponse {
  articles: Article[];
  query: string;
}

export interface HealthCheckResponse {
  status: string;
  timestamp: string;
  uptime: number;
  version: string;
}

// ============================================================================
// DASHBOARD TYPES
// ============================================================================

export interface UserDashboardStats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  archivedArticles: number;
  totalViews: number;
  totalPosts: number;
  totalComments: number;
  totalLikes: number;
  monthlyViews: any[];
  recentActivities: any[];
}

export interface UserDashboardResponse {
  user: User;
  recentActivities: any[];
  stats: UserDashboardStats;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface ErrorResponse {
  error: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}
