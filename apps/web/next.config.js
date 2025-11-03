// next.config.js
/** @type {import('next').NextConfig} */
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Enable standalone output for Docker deployment
  output: "standalone",
  // Enable compression
  compress: true,
  // Optimize images
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "cuongdq.no-ip.info",
      },
      {
        protocol: "https",
        hostname: "mgapartment.ddns.net",
      },
      {
        protocol: "https",
        hostname: "cuongdq.ddns.net",
      },
      {
        protocol: "https",
        hostname: "mypos.ddns.net",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
    unoptimized: false,
  },

  // For production builds
  experimental: {
    // Enable modern features
    optimizeCss: true,
    optimizePackageImports: ["lucide-react"],
  },

  // Headers for security
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
      {
        source: "/uploads/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },

  // Sửa cấu hình experimental cho Next.js 15
  serverExternalPackages: [],

  webpack: (config, { isServer }) => {
    // Fix cho react-i18next build issues
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        net: false,
        tls: false,
      };
    }

    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "src"),
      "@/app": path.resolve(__dirname, "src/app"),
      "@/configs": path.resolve(__dirname, "src/configs"),
      "@/constants": path.resolve(__dirname, "src/constants"),
      "@/components": path.resolve(__dirname, "src/components"),
      "@/contexts": path.resolve(__dirname, "src/contexts"),
      "@/images": path.resolve(__dirname, "src/images"),
      "@/lib": path.resolve(__dirname, "src/lib"),
      "@/public": path.resolve(__dirname, "public"),
      "@/locales": path.resolve(__dirname, "public/locales"),
      "@/styles": path.resolve(__dirname, "src/styles"),
      "@/types": path.resolve(__dirname, "src/types"),
      "@/utils": path.resolve(__dirname, "src/utils"),
    };

    return config;
  },
};

export default nextConfig;
