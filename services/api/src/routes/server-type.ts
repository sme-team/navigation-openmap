// ./routes/server-type.ts

import { Static, Type } from "@sinclair/typebox";

// ArticlesSchema
// Request schemas
export const CreateArticleSchema = Type.Object({
  title: Type.String({ minLength: 1, maxLength: 200 }),
  slug: Type.Optional(Type.String()),
  description: Type.Optional(Type.String({ maxLength: 300 })),
  excerpt: Type.Optional(Type.String({ maxLength: 300 })),
  content: Type.String({ minLength: 1 }),
  category: Type.Optional(Type.String()),
  tags: Type.Optional(Type.Array(Type.String())),
  status: Type.Union(
    [
      Type.Literal("draft"),
      Type.Literal("published"),
      Type.Literal("archived"),
    ],
    { default: "draft" }
  ),
  // Media fields
  image: Type.Optional(Type.String()),
  image_alt: Type.Optional(Type.String()),
  featured_image: Type.Optional(Type.String()),
  youtube: Type.Optional(Type.String()),
  youtube_title: Type.Optional(Type.String()),
  google_map: Type.Optional(Type.String()),
  map_title: Type.Optional(Type.String()),
  // SEO fields
  seo_keywords: Type.Optional(Type.String()),
  canonical_url: Type.Optional(Type.String()),
  og_title: Type.Optional(Type.String()),
  og_description: Type.Optional(Type.String()),
  og_image: Type.Optional(Type.String()),
  // Settings
  is_hidden: Type.Optional(Type.Boolean({ default: false })),
  is_comments_locked: Type.Optional(Type.Boolean({ default: false })),
});

export const UpdateArticleSchema = Type.Partial(
  Type.Object({
    title: Type.String({ minLength: 1, maxLength: 200 }),
    slug: Type.String(),
    description: Type.String({ maxLength: 300 }),
    excerpt: Type.String({ maxLength: 300 }),
    content: Type.String({ minLength: 1 }),
    category: Type.String(),
    tags: Type.Array(Type.String()),
    status: Type.Union([
      Type.Literal("draft"),
      Type.Literal("published"),
      Type.Literal("archived"),
    ]),
    image: Type.String(),
    image_alt: Type.String(),
    featured_image: Type.String(),
    youtube: Type.String(),
    youtube_title: Type.String(),
    google_map: Type.String(),
    map_title: Type.String(),
    seo_keywords: Type.String(),
    canonical_url: Type.String(),
    og_title: Type.String(),
    og_description: Type.String(),
    og_image: Type.String(),
    is_hidden: Type.Boolean(),
    is_comments_locked: Type.Boolean(),
  })
);

export const CreateCommentSchema = Type.Object({
  author_name: Type.String({ minLength: 1, maxLength: 100 }),
  author_email: Type.Optional(Type.String({ format: "email" })),
  content: Type.String({ minLength: 1, maxLength: 2000 }),
  parent_id: Type.Optional(Type.String()),
});

export const CreateReactionSchema = Type.Object({
  reaction_type: Type.Union([
    Type.Literal("like"),
    Type.Literal("love"),
    Type.Literal("haha"),
    Type.Literal("wow"),
    Type.Literal("sad"),
    Type.Literal("angry"),
  ]),
});

// Response schemas
export const ArticleSchema = Type.Object({
  _id: Type.Optional(Type.String()),
  store_id: Type.String(),
  title: Type.String(),
  slug: Type.String(),
  description: Type.Optional(Type.String()),
  excerpt: Type.Optional(Type.String()),
  content: Type.String(),
  author: Type.Optional(Type.String()),
  status: Type.Union([
    Type.Literal("draft"),
    Type.Literal("published"),
    Type.Literal("archived"),
  ]),
  image: Type.Optional(Type.String()),
  image_alt: Type.Optional(Type.String()),
  featured_image: Type.Optional(Type.String()),
  youtube: Type.Optional(Type.String()),
  youtube_title: Type.Optional(Type.String()),
  google_map: Type.Optional(Type.String()),
  map_title: Type.Optional(Type.String()),
  tags: Type.Optional(Type.Array(Type.String())),
  category: Type.Optional(Type.String()),
  seo_keywords: Type.Optional(Type.String()),
  canonical_url: Type.Optional(Type.String()),
  og_title: Type.Optional(Type.String()),
  og_description: Type.Optional(Type.String()),
  og_image: Type.Optional(Type.String()),
  is_hidden: Type.Boolean(),
  is_comments_locked: Type.Boolean(),
  created_at: Type.Optional(Type.String()),
  updated_at: Type.Optional(Type.String()),
  published_at: Type.Optional(Type.String()),
});

export const PaginatedArticlesSchema = Type.Object({
  articles: Type.Array(ArticleSchema),
  total: Type.Number(),
  page: Type.Number(),
  limit: Type.Number(),
  totalPages: Type.Number(),
});

export const ArticleDetailSchema = Type.Object({
  article: ArticleSchema,
  metrics: Type.Any(),
  comments: Type.Array(Type.Any()),
  reactions: Type.Any(),
});

// AuthSchema:

export const LoginSchema = Type.Object({
  username: Type.Optional(Type.String({ minLength: 3, maxLength: 50 })),
  email: Type.Optional(Type.String({ format: "email" })),
  password: Type.String({ minLength: 6 }),
});

export const RefreshTokenSchema = Type.Object({
  refreshToken: Type.String(),
});

export const RegisterSchema = Type.Object({
  username: Type.String({ minLength: 3, maxLength: 50 }),
  email: Type.Optional(Type.String({ format: "email" })),
  password: Type.String({ minLength: 6 }),
  full_name: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
  phone: Type.Optional(Type.String()),
  role: Type.Optional(
    Type.String({
      default: "guest",
      enum: ["author", "viewer", "guest"],
    })
  ),
  avatar_url: Type.Optional(Type.String({ format: "uri" })),
});

// Type exports
export type RegisterRequest = Static<typeof RegisterSchema>;
export type LoginRequest = Static<typeof LoginSchema>;
export type CreateArticleRequest = Static<typeof CreateArticleSchema>;
export type UpdateArticleRequest = Static<typeof UpdateArticleSchema>;
export type CreateCommentRequest = Static<typeof CreateCommentSchema>;
export type CreateReactionRequest = Static<typeof CreateReactionSchema>;

// ============================================================================
// USER SCHEMAS
// ============================================================================

export const CreateUserSchema = Type.Object({
  username: Type.String({ minLength: 3, maxLength: 50 }),
  password: Type.String({ minLength: 6 }),
  full_name: Type.String({ minLength: 1, maxLength: 100 }),
  email: Type.Optional(Type.String({ format: "email" })),
  phone: Type.Optional(Type.String()),
  role: Type.Optional(
    Type.Union([
      Type.Literal("superadmin"),
      Type.Literal("admin"),
      Type.Literal("manager"),
      Type.Literal("staff"),
      Type.Literal("editor"),
      Type.Literal("author"),
      Type.Literal("moderator"),
      Type.Literal("viewer"),
      Type.Literal("guest"),
    ])
  ),
  avatar_url: Type.Optional(Type.String()),
  auth_provider: Type.Optional(Type.String()),
  provider_id: Type.Optional(Type.String()),
});

export const UpdateUserSchema = Type.Partial(
  Type.Object({
    full_name: Type.String({ minLength: 1, maxLength: 100 }),
    email: Type.String({ format: "email" }),
    phone: Type.String(),
    avatar_url: Type.String(),
    is_active: Type.Boolean(),
  })
);

export const UpdateUserRoleSchema = Type.Object({
  role: Type.Union([
    Type.Literal("superadmin"),
    Type.Literal("admin"),
    Type.Literal("manager"),
    Type.Literal("staff"),
    Type.Literal("editor"),
    Type.Literal("author"),
    Type.Literal("moderator"),
    Type.Literal("viewer"),
    Type.Literal("guest"),
  ]),
});

export const ChangePasswordSchema = Type.Object({
  current_password: Type.String({ minLength: 6 }),
  new_password: Type.String({ minLength: 6 }),
  confirm_password: Type.String({ minLength: 6 }),
});

export const UpdateAvatarSchema = Type.Object({
  avatar_url: Type.String({ format: "uri" }),
});

// Response schemas
export const UserSchema = Type.Object({
  _id: Type.Optional(Type.String()),
  store_id: Type.Optional(Type.String()),
  username: Type.String(),
  full_name: Type.Optional(Type.String()),
  email: Type.Optional(Type.String()),
  phone: Type.Optional(Type.String()),
  role: Type.Optional(Type.String()),
  avatar_url: Type.Optional(Type.String()),
  is_active: Type.Optional(Type.Boolean()),
  auth_provider: Type.Optional(Type.String()),
  provider_id: Type.Optional(Type.String()),
  last_login: Type.Optional(Type.String()),
  created_at: Type.Optional(Type.String()),
  updated_at: Type.Optional(Type.String()),
});

export const PaginatedUsersSchema = Type.Object({
  users: Type.Array(UserSchema),
  total: Type.Number(),
  page: Type.Number(),
  limit: Type.Number(),
  totalPages: Type.Number(),
});

// ============================================================================
// ENTERPRISE SCHEMAS
// ============================================================================

export const CreateEnterpriseSchema = Type.Object({
  name: Type.String({ minLength: 1, maxLength: 200 }),
  business_type: Type.Optional(
    Type.Union([
      Type.Literal("ltd"),
      Type.Literal("joint_stock"),
      Type.Literal("private"),
      Type.Literal("partnership"),
      Type.Literal("sole_proprietorship"),
    ])
  ),
  industries: Type.Optional(Type.Array(Type.String())),
  address: Type.Optional(Type.String()),
  tax_code: Type.Optional(Type.String()),
  phone: Type.Optional(Type.String()),
  email: Type.Optional(Type.String({ format: "email" })),
  website: Type.Optional(Type.String()),
  logo_url: Type.Optional(Type.String()),
  status: Type.Optional(
    Type.Union([
      Type.Literal("active"),
      Type.Literal("inactive"),
      Type.Literal("suspended"),
      Type.Literal("pending"),
    ])
  ),
  subscription_plan: Type.Optional(
    Type.Union([
      Type.Literal("basic"),
      Type.Literal("premium"),
      Type.Literal("enterprise"),
    ])
  ),
});

export const UpdateEnterpriseSchema = Type.Partial(CreateEnterpriseSchema);

// ============================================================================
// STORE SCHEMAS
// ============================================================================

export const CreateStoreSchema = Type.Object({
  enterprise_id: Type.String(),
  name: Type.String({ minLength: 1, maxLength: 200 }),
  store_type: Type.Optional(Type.String()),
  address: Type.Optional(Type.String()),
  phone: Type.Optional(Type.String()),
  email: Type.Optional(Type.String({ format: "email" })),
  manager_name: Type.Optional(Type.String()),
  operating_hours: Type.Optional(Type.Any()),
  timezone: Type.String({ default: "Asia/Ho_Chi_Minh" }),
  currency: Type.String({ default: "VND" }),
  tax_rate: Type.Number({ default: 0 }),
  status: Type.Optional(
    Type.Union([
      Type.Literal("active"),
      Type.Literal("inactive"),
      Type.Literal("maintenance"),
      Type.Literal("closed"),
    ])
  ),
  sync_enabled: Type.Boolean({ default: false }),
});

export const UpdateStoreSchema = Type.Partial(
  Type.Object({
    name: Type.String({ minLength: 1, maxLength: 200 }),
    store_type: Type.String(),
    address: Type.String(),
    phone: Type.String(),
    email: Type.String({ format: "email" }),
    manager_name: Type.String(),
    operating_hours: Type.Any(),
    timezone: Type.String(),
    currency: Type.String(),
    tax_rate: Type.Number(),
    status: Type.Union([
      Type.Literal("active"),
      Type.Literal("inactive"),
      Type.Literal("maintenance"),
      Type.Literal("closed"),
    ]),
    sync_enabled: Type.Boolean(),
  })
);

// Type exports for user schemas
export type CreateUserRequest = Static<typeof CreateUserSchema>;
export type UpdateUserRequest = Static<typeof UpdateUserSchema>;
export type UpdateUserRoleRequest = Static<typeof UpdateUserRoleSchema>;
export type ChangePasswordRequest = Static<typeof ChangePasswordSchema>;
export type UpdateAvatarRequest = Static<typeof UpdateAvatarSchema>;
export type CreateEnterpriseRequest = Static<typeof CreateEnterpriseSchema>;
export type UpdateEnterpriseRequest = Static<typeof UpdateEnterpriseSchema>;
export type CreateStoreRequest = Static<typeof CreateStoreSchema>;
export type UpdateStoreRequest = Static<typeof UpdateStoreSchema>;