// eslint.config.js (hoặc eslint.config.mjs)
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  // Yêu cầu Node.js v20.11.0+; nếu dùng version cũ hơn, thay bằng: import { fileURLToPath } from 'url'; import path from 'path'; baseDirectory: path.dirname(fileURLToPath(import.meta.url))
  baseDirectory: import.meta.dirname,
});

export default [
  // Extend Next.js core config với TypeScript support
  ...compat.config({
    extends: ["next/core-web-vitals", "next/typescript"],
  }),

  // Ignores: Di chuyển từ .eslintignore cũ vào đây (thêm pattern tùy chỉnh nếu cần)
  {
    ignores: [
      "node_modules/",
      "dist/",
      ".next/",
      "out/",
      "coverage/",
      "**/*.config.js", // Ignore config files nếu cần
      // Thêm các pattern khác từ file .eslintignore cũ, ví dụ: 'temp/**', '*.min.js'
    ],
  },

  // Rules tùy chỉnh (optional: disable rules nếu conflict với dự án)
  {
    rules: {
      "react/react-in-jsx-scope": "off", // Không cần import React trong Next.js 13+
      "@next/next/no-html-link-for-pages": "off", // Nếu dùng <a> cho internal links
      // "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/exhaustive-deps": "off",
    },
  },
];
