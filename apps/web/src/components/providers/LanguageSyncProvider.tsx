// ./src/components/providers/LanguageSyncProvider.tsx
"use client";

import { useLanguageSync } from '@/hooks/useLanguageSync';
import { ReactNode } from 'react';

interface LanguageSyncProviderProps {
  children: ReactNode;
}

/**
 * Client Component wrapper để sử dụng useLanguageSync hook
 * Đây là cách clean để tách biệt client-side logic khỏi server component
 */
export function LanguageSyncProvider({ children }: LanguageSyncProviderProps) {
  // Hook chỉ chạy trong client component
  useLanguageSync();
  
  return <>{children}</>;
}