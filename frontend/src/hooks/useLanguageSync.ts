// ./src/hooks/useLanguageSync.ts
"use client";

import { useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { languageDetector } from "@/lib/language-detector";
import { languages } from "@/lib/i18n";
import { getLocalStorage } from "@/utils/api-helpers";

import { createModuleLogger, AppModules } from "@/logger";
const logger = createModuleLogger(AppModules.I18N_CLIENT);

/**
 * Hook để đồng bộ language preference giữa client và server
 * Xử lý logic ưu tiên:
 * 1. localStorage (user preference)
 * 2. OS language detection
 * 3. Current URL locale
 */
export function useLanguageSync() {
  const router = useRouter();
  const pathname = usePathname();

  const syncLanguagePreference = useCallback(() => {
    try {
      // Lấy current locale từ URL
      const currentLocale = pathname.split("/")[1];

      // Kiểm tra localStorage trước
      const storedLanguage = getLocalStorage("preferred-language");

      // Detect OS language
      const osLanguage = detectOSLanguage();

      logger.debug("Language sync check", {
        currentLocale,
        storedLanguage,
        osLanguage,
        pathname,
      });

      let preferredLanguage: string | null = null;

      // Logic ưu tiên theo yêu cầu
      if (storedLanguage && languages.includes(storedLanguage)) {
        // 1. Ưu tiên localStorage (user đã chọn trước đó)
        preferredLanguage = storedLanguage;
      } else if (osLanguage && languages.includes(osLanguage)) {
        // 2. OS language detection
        preferredLanguage = osLanguage;
        // Lưu vào localStorage để lần sau không cần detect lại
        languageDetector.saveLanguagePreference(osLanguage);
      }

      // Nếu có preferred language và khác với current locale
      if (preferredLanguage && preferredLanguage !== currentLocale) {
        logger.info("Redirecting to preferred language", {
          from: currentLocale,
          to: preferredLanguage,
          reason: storedLanguage ? "localStorage" : "OS detection",
        });

        // Redirect về preferred language
        const newPathname = pathname.replace(
          `/${currentLocale}`,
          `/${preferredLanguage}`
        );
        router.replace(newPathname);
        return;
      }

      // Nếu không có stored preference và current locale hợp lệ
      // thì lưu current locale làm preference
      if (!storedLanguage && languages.includes(currentLocale)) {
        languageDetector.saveLanguagePreference(currentLocale);
        logger.debug("Saved current locale as preference", {
          locale: currentLocale,
        });
      }
    } catch (error) {
      logger.error("Error in language sync", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }, [pathname, router]);

  // Chỉ chạy một lần khi component mount
  useEffect(() => {
    // Delay một chút để tránh hydration issues
    const timeoutId = setTimeout(syncLanguagePreference, 100);
    return () => clearTimeout(timeoutId);
  }, [syncLanguagePreference]); // Empty dependency array - chỉ chạy khi mount

  return {
    syncLanguagePreference,
  };
}

/**
 * Detect ngôn ngữ từ OS/Browser (client-side)
 */
function detectOSLanguage(): string | null {
  if (typeof navigator === "undefined") return null;

  const candidates = [
    navigator.language,
    ...(navigator.languages || []),
     
    (navigator as any).userLanguage,
    (navigator as any).browserLanguage,
    (navigator as any).systemLanguage,
     
  ].filter(Boolean);

  for (const lang of candidates) {
    if (typeof lang === "string") {
      // Exact match
      if (languages.includes(lang)) {
        return lang;
      }

      // Base language
      const baseLang = lang.split("-")[0];
      if (languages.includes(baseLang)) {
        return baseLang;
      }
    }
  }

  return null;
}
