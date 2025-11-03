// rate-limit-blog.ts - Cấu hình rate limiting tối ưu cho blog
import rateLimit from "@fastify/rate-limit";
import { FastifyInstance } from "fastify";

// =============================================================================
// RATE LIMITING CONFIGURATION FOR BLOG API
// =============================================================================

export async function setupMapRateLimit(
  fastify: FastifyInstance,
  nodeEnv: string
) {
  
  // 1. AUTHENTICATION ENDPOINTS - Nghiêm ngặt nhất
  await fastify.register(rateLimit, {
    max: 5, // 5 attempts
    timeWindow: "15 minutes", 
    skipOnError: false,
    
    allowList: (req) => {
      if (nodeEnv !== "production") return true;
      
      // Chỉ áp dụng cho auth endpoints
      const authPaths = [
        "/api/auth/login",
        "/api/auth/register", 
        "/api/auth/refresh",
        "/api/auth/google/callback",
        "/api/auth/google/refresh"
      ];
      
      return !authPaths.some(path => req.url.startsWith(path));
    },

    keyGenerator: (req) => {
      // Tách biệt rate limit theo từng loại auth
      if (req.url.includes("/api/auth/login")) {
        return `${req.ip}:login`;
      }
      if (req.url.includes("/api/auth/register")) {
        return `${req.ip}:register`;
      }
      if (req.url.includes("/api/auth/google")) {
        return `${req.ip}:google_auth`;
      }
      return `${req.ip}:auth_general`;
    },

    errorResponseBuilder: (req, context) => ({
      error: "Too Many Authentication Attempts",
      message: "Please wait before trying again",
      retryAfter: Math.ceil(context.ttl / 1000),
    }),
  });

  // 2. ADMIN OPERATIONS - Nghiêm ngặt
  await fastify.register(rateLimit, {
    max: 30,
    timeWindow: "1 minute",
    skipOnError: false,

    allowList: (req) => {
      if (nodeEnv !== "production") return true;
      return !req.url.startsWith("/api/admin/");
    },

    keyGenerator: (req) => `${req.ip}:admin`,

    errorResponseBuilder: (req, context) => ({
      error: "Too Many Admin Requests",
      message: "Admin operations are rate limited",
      retryAfter: Math.ceil(context.ttl / 1000),
    }),
  });

  // 3. WRITE OPERATIONS - Trung bình nghiêm ngặt
  await fastify.register(rateLimit, {
    max: 20,
    timeWindow: "1 minute",
    skipOnError: false,

    allowList: (req) => {
      if (nodeEnv !== "production") return true;
      
      // Chỉ áp dụng cho write operations
      const isWriteOperation = ["POST", "PUT", "DELETE", "PATCH"].includes(req.method);
      if (!isWriteOperation) return true;
      
      // Skip cho auth endpoints (đã có rate limit riêng)
      if (req.url.startsWith("/api/auth/")) return true;
      
      return false;
    },

    keyGenerator: (req) => {
      // Tách biệt theo loại write operation
      if (req.url.includes("/api/articles") && ["POST", "PUT"].includes(req.method)) {
        return `${req.ip}:article_write`;
      }
      if (req.url.includes("/api/comments") && req.method === "POST") {
        return `${req.ip}:comment_create`;
      }
      if (req.url.includes("/api/reactions")) {
        return `${req.ip}:reactions`;
      }
      return `${req.ip}:write_general`;
    },

    errorResponseBuilder: (req, context) => ({
      error: "Too Many Write Requests",
      message: "Please slow down your posting",
      retryAfter: Math.ceil(context.ttl / 1000),
    }),
  });

  // 4. READ OPERATIONS - Loose cho UX tốt
  await fastify.register(rateLimit, {
    max: 300, // 5 req/second
    timeWindow: "1 minute",
    skipOnError: true, // Không chặn nếu có lỗi

    allowList: (req) => {
      if (nodeEnv !== "production") return true;
      
      // Skip cho static assets và health check
      const staticExtensions = [".css", ".js", ".jpg", ".png", ".gif", ".ico", ".svg", ".woff", ".woff2", ".ttf", ".eot"];
      if (staticExtensions.some(ext => req.url.endsWith(ext))) return true;
      
      if (req.url === "/health") return true;
      
      // Skip cho SEO bots
      const userAgent = req.headers["user-agent"] || "";
      const isBot = ["Googlebot", "Bingbot", "facebookexternalhit", "Twitterbot"].some(bot => 
        userAgent.includes(bot)
      );
      if (isBot) return true;
      
      // Chỉ áp dụng cho read operations
      const isReadOperation = req.method === "GET";
      if (!isReadOperation) return true;
      
      // Skip cho write endpoints (đã có rate limit riêng)
      if (req.url.startsWith("/api/admin/") || 
          req.url.startsWith("/api/auth/")) return true;
      
      return false;
    },

    keyGenerator: (req) => {
      // Tách biệt theo loại content
      if (req.url.startsWith("/api/articles")) {
        if (req.url.includes("/slug/") || req.url.match(/\/api\/articles\/[^/]+$/)) {
          return `${req.ip}:article_detail`; // Chi tiết bài viết
        }
        return `${req.ip}:articles_list`; // Danh sách bài viết
      }
      
      if (req.url.includes("/api/search")) {
        return `${req.ip}:search`;
      }
      
      if (req.url.includes("/comments")) {
        return `${req.ip}:comments_read`;
      }
      
      if (req.url.includes("/reactions")) {
        return `${req.ip}:reactions_read`;
      }
      
      return `${req.ip}:read_general`;
    },

    errorResponseBuilder: (req, context) => ({
      error: "Too Many Requests",
      message: "Please slow down your browsing",
      retryAfter: Math.ceil(context.ttl / 1000),
    }),
  });

  // 5. SEARCH OPERATIONS - Loose nhưng có giới hạn
  await fastify.register(rateLimit, {
    max: 60, // 1 req/second
    timeWindow: "1 minute", 
    skipOnError: true,

    allowList: (req) => {
      if (nodeEnv !== "production") return true;
      return !req.url.includes("/api/search");
    },

    keyGenerator: (req) => `${req.ip}:search`,

    errorResponseBuilder: (req, context) => ({
      error: "Too Many Search Requests", 
      message: "Please wait before searching again",
      retryAfter: Math.ceil(context.ttl / 1000),
    }),
  });
}

// =============================================================================
// ENDPOINT-SPECIFIC CONFIGURATIONS
// =============================================================================

export const BLOG_RATE_LIMIT_CONFIG = {
  // Authentication endpoints - Bảo mật cao nhất
  authentication: {
    login: { max: 5, timeWindow: "15 minutes" },
    register: { max: 1, timeWindow: "10 minutes" }, // Rất nghiêm ngặt cho register
    refresh: { max: 10, timeWindow: "15 minutes" },
    googleAuth: { max: 5, timeWindow: "10 minutes" }
  },

  // Admin operations - Nghiêm ngặt  
  admin: {
    stats: { max: 30, timeWindow: "1 minute" },
    users: { max: 20, timeWindow: "1 minute" },
    articles: { max: 40, timeWindow: "1 minute" }
  },

  // Article operations
  articles: {
    // Read operations - Loose
    list: { max: 300, timeWindow: "1 minute" },
    detail: { max: 200, timeWindow: "1 minute" },
    popular: { max: 100, timeWindow: "1 minute" },
    
    // Write operations - Nghiêm ngặt
    create: { max: 5, timeWindow: "1 minute" },
    update: { max: 10, timeWindow: "1 minute" }, 
    delete: { max: 3, timeWindow: "1 minute" }
  },

  // Comment operations
  comments: {
    read: { max: 150, timeWindow: "1 minute" },
    create: { max: 10, timeWindow: "1 minute" },
    moderate: { max: 50, timeWindow: "1 minute" }
  },

  // Reaction operations
  reactions: {
    read: { max: 200, timeWindow: "1 minute" },
    add: { max: 30, timeWindow: "1 minute" },
    remove: { max: 20, timeWindow: "1 minute" }
  },

  // Utility operations
  utility: {
    search: { max: 60, timeWindow: "1 minute" },
    metrics: { max: 100, timeWindow: "1 minute" }
  },

  // Special exemptions
  exemptions: {
    // SEO bots
    userAgents: [
      "Googlebot", "Bingbot", "facebookexternalhit", "Twitterbot", 
      "LinkedInBot", "WhatsApp", "SkypeUriPreview"
    ],
    
    // Health checks và static content
    paths: ["/health", "/robots.txt", "/sitemap.xml"],
    
    // Static assets
    staticExtensions: [
      ".css", ".js", ".jpg", ".jpeg", ".png", ".gif", ".ico", 
      ".svg", ".woff", ".woff2", ".ttf", ".eot", ".webp", ".avif"
    ]
  }
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function shouldApplyRateLimit(req: {
  url: string;
  method: string;
  headers: { [key: string]: string | undefined };
}) {
  const { url, method, headers } = req;

  // Skip trong development
  if (process.env.NODE_ENV !== "production") {
    return false;
  }

  // Skip cho SEO bots
  const userAgent = headers["user-agent"] || "";
  const isBot = BLOG_RATE_LIMIT_CONFIG.exemptions.userAgents.some(bot =>
    userAgent.toLowerCase().includes(bot.toLowerCase())
  );
  if (isBot) return false;

  // Skip cho static assets
  const isStatic = BLOG_RATE_LIMIT_CONFIG.exemptions.staticExtensions.some(ext =>
    url.toLowerCase().endsWith(ext)
  );
  if (isStatic) return false;

  // Skip cho health checks
  if (BLOG_RATE_LIMIT_CONFIG.exemptions.paths.includes(url)) {
    return false;
  }

  return true;
}

export function getRateLimitKey(req: {
  ip: string;
  url: string;
  method: string;
  headers: { [key: string]: string | undefined };
}) {
  const { ip, url, method } = req;

  // Tạo key dựa trên endpoint type
  if (url.startsWith("/api/auth/")) {
    if (url.includes("login")) return `${ip}:auth:login`;
    if (url.includes("register")) return `${ip}:auth:register`;
    if (url.includes("google")) return `${ip}:auth:google`;
    return `${ip}:auth:general`;
  }

  if (url.startsWith("/api/admin/")) {
    return `${ip}:admin`;
  }

  if (url.startsWith("/api/articles")) {
    if (method === "GET") {
      if (url.includes("/slug/") || url.match(/\/api\/articles\/[^/]+$/)) {
        return `${ip}:articles:detail`;
      }
      return `${ip}:articles:list`;
    }
    return `${ip}:articles:write`;
  }

  if (url.includes("/comments")) {
    return `${ip}:comments:${method.toLowerCase()}`;
  }

  if (url.includes("/reactions")) {
    return `${ip}:reactions:${method.toLowerCase()}`;
  }

  if (url.includes("/search")) {
    return `${ip}:search`;
  }

  // Default key
  return `${ip}:general:${method.toLowerCase()}`;
}

// =============================================================================
// MONITORING & METRICS
// =============================================================================

export interface RateLimitMetrics {
  totalRequests: number;
  blockedRequests: number;
  topEndpoints: Array<{ endpoint: string; count: number }>;
  topIPs: Array<{ ip: string; count: number; blocked: number }>;
}

export class RateLimitMonitor {
  private metrics: Map<string, number> = new Map();
  private blockedRequests: Map<string, number> = new Map();

  recordRequest(key: string, blocked: boolean = false) {
    // Record total requests
    const current = this.metrics.get(key) || 0;
    this.metrics.set(key, current + 1);

    // Record blocked requests
    if (blocked) {
      const blockedCount = this.blockedRequests.get(key) || 0;
      this.blockedRequests.set(key, blockedCount + 1);
    }
  }

  getMetrics(): RateLimitMetrics {
    const totalRequests = Array.from(this.metrics.values()).reduce((sum, count) => sum + count, 0);
    const blockedRequests = Array.from(this.blockedRequests.values()).reduce((sum, count) => sum + count, 0);

    // Get top endpoints
    const topEndpoints = Array.from(this.metrics.entries())
      .map(([endpoint, count]) => ({ endpoint, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Get top IPs (simplified - would need more complex tracking in real implementation)
    const topIPs = Array.from(this.metrics.entries())
      .filter(([key]) => key.includes(':'))
      .map(([key, count]) => {
        const ip = key.split(':')[0];
        const blocked = this.blockedRequests.get(key) || 0;
        return { ip, count, blocked };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalRequests,
      blockedRequests,
      topEndpoints,
      topIPs
    };
  }

  reset() {
    this.metrics.clear();
    this.blockedRequests.clear();
  }
}

/* 
=============================================================================
USAGE EXAMPLE
=============================================================================

// Trong main server file:
import { setupBlogRateLimit } from './rate-limit-blog';

const fastify = Fastify();

// Setup rate limiting
await setupBlogRateLimit(fastify, process.env.NODE_ENV || 'development');

// Register routes
await fastify.register(apiAuthRoutes, { prefix: '' });
await fastify.register(apiArticleRoutes, { prefix: '' });
await fastify.register(apiAdminRoutes, { prefix: '' });
// ... other routes

=============================================================================
CUSTOMIZATION NOTES
=============================================================================

1. AUTHENTICATION ENDPOINTS:
   - Login: 5 attempts/15 minutes (chống brute force)
   - Register: 1 attempt/10 minutes (chống spam account)
   - Google Auth: 5 attempts/10 minutes

2. ADMIN OPERATIONS: 
   - 30 requests/minute (đủ cho admin dashboard)

3. ARTICLE OPERATIONS:
   - Read: 300 requests/minute (5 req/second - smooth UX)
   - Write: 5-20 requests/minute (chống spam content)

4. COMMENTS & REACTIONS:
   - Read: 150-200 requests/minute
   - Write: 10-30 requests/minute

5. SEARCH:
   - 60 requests/minute (1 req/second)

6. EXEMPTIONS:
   - SEO bots: Không bị rate limit
   - Static assets: Không bị rate limit  
   - Health checks: Không bị rate limit
   - Development mode: Disabled

=============================================================================
*/