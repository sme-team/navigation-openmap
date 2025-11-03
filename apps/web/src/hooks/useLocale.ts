// ./src/hooks/useLocale.ts
"use client";

import { usePathname } from "next/navigation";
import { languages, fallbackLng } from "@/lib/i18n";

export function useLocale() {
  const pathname = usePathname();
  
  // Lấy locale từ pathname (vd: /vi/articles -> vi)
  const locale = pathname.split('/')[1];
  
  // Validate locale
  if (languages.includes(locale)) {
    return locale;
  }
  
  return fallbackLng;
}