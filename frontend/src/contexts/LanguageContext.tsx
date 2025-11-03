// ./src/contexts/LanguageContext.tsx
"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { languages, fallbackLng } from "@/lib/i18n";
import { languageDetector } from "@/lib/language-detector";
import { useTranslation, UseTranslationResponse } from "react-i18next";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { getLocalStorage } from "@/utils/api-helpers";

import { createModuleLogger, AppModules } from "@/logger";
const logger = createModuleLogger(AppModules.CONTEXT);
logger.trace("LanguageContext initialized");

// --- Types ---
type Language = (typeof languages)[number];

interface LanguageContextType {
  language: Language;
  locale: Language; // ✅ Thêm locale (alias cho language)
  setLanguage: (lang: Language) => Promise<void>;
  t: UseTranslationResponse<"common", undefined>["t"];
  isLoading: boolean;
  languages: { code: Language; name: string; flag: string }[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

interface LanguageProviderProps {
  children: React.ReactNode;
}

// --- Component ---
export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const { t, i18n } = useTranslation("common");
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  logger.trace("LanguageProvider initialized");

  const languageList = [
    { code: "en" as Language, name: "English", flag: "🇺🇸" },
    { code: "vi" as Language, name: "Tiếng Việt", flag: "🇻🇳" },
    { code: "cn" as Language, name: "中文", flag: "🇨🇳" },
  ];

  // Enhanced language sync with priority order
  useEffect(() => {
    // Kiểm tra xem có đang ở client side không
    if (typeof window === "undefined" || hasInitialized) {
      return;
    }

    logger.trace("LanguageProvider effect triggered", {
      pathname: pathname,
      currentLanguage: i18n.language,
      isClient: typeof window !== "undefined",
    });

    const initializeLanguage = async () => {
      try {
        // 1. Lấy locale từ URL
        const localeFromPath = pathname.split("/")[1] as Language;
        let targetLocale: Language;

        // 2. Language detection với thứ tự ưu tiên:
        // localStorage → OS detection → URL locale → Cookie → Fallback
        const storedLanguage = getLocalStorage(
          "preferred-language"
        ) as Language;
        const osLanguage = detectOSLanguage();
        const cookieLanguage = Cookies.get("preferred-language") as Language;

        logger.debug("Language detection sources", {
          localeFromPath,
          storedLanguage,
          osLanguage,
          cookieLanguage,
          fallback: fallbackLng,
        });

        // Thứ tự ưu tiên theo yêu cầu
        if (storedLanguage && languages.includes(storedLanguage)) {
          // 1. Ưu tiên localStorage (user đã chọn trước đó)
          targetLocale = storedLanguage;
          logger.debug("Using stored language preference", {
            language: targetLocale,
          });
        } else if (osLanguage && languages.includes(osLanguage)) {
          // 2. OS language detection (lần đầu truy cập)
          targetLocale = osLanguage;
          // Lưu vào storage để lần sau không cần detect lại
          languageDetector.saveLanguagePreference(osLanguage);
          logger.debug("Using OS detected language", {
            language: targetLocale,
          });
        } else if (languages.includes(localeFromPath)) {
          // 3. URL locale (nếu hợp lệ)
          targetLocale = localeFromPath;
          logger.debug("Using URL locale", { language: targetLocale });
        } else if (cookieLanguage && languages.includes(cookieLanguage)) {
          // 4. Cookie (từ middleware hoặc previous visit)
          targetLocale = cookieLanguage;
          logger.debug("Using cookie language", { language: targetLocale });
        } else {
          // 5. Fallback
          targetLocale = fallbackLng;
          logger.debug("Using fallback language", { language: targetLocale });
        }

        logger.debug("Language synchronization", {
          localeFromPath,
          targetLocale,
          currentLanguage: i18n.language,
        });

        // 3. Chỉ thay đổi ngôn ngữ i18n nếu khác với hiện tại
        if (i18n.language !== targetLocale) {
          logger.debug("Changing i18n language", {
            from: i18n.language,
            to: targetLocale,
          });
          await i18n.changeLanguage(targetLocale);
        }

        // 4. Đảm bảo cookie và localStorage được sync
        if (!storedLanguage || storedLanguage !== targetLocale) {
          languageDetector.saveLanguagePreference(targetLocale);
        }

        Cookies.set("preferred-language", targetLocale, {
          expires: 365, // 1 năm
          path: "/",
        });

        // 5. Redirect nếu URL locale khác với target locale
        if (
          languages.includes(localeFromPath) &&
          localeFromPath !== targetLocale
        ) {
          const segments = pathname.split("/");
          segments[1] = targetLocale;
          const newPath = segments.join("/");

          logger.debug("Redirecting to preferred language path", {
            from: pathname,
            to: newPath,
            reason: "language preference mismatch",
          });

          router.replace(newPath);
          return;
        }

        // 6. Nếu URL không có locale, thêm locale prefix
        if (!languages.includes(localeFromPath)) {
          const newPath = `/${targetLocale}${pathname}`;

          logger.debug("Adding locale prefix to URL", {
            from: pathname,
            to: newPath,
          });

          router.replace(newPath);
          return;
        }

        setHasInitialized(true);
      } catch (error) {
        logger.error("Error during language initialization", {
          message: error instanceof Error ? error.message : "Unknown error",
          pathname: pathname,
        });

        // Fallback initialization
        if (i18n.language !== fallbackLng) {
          await i18n.changeLanguage(fallbackLng).catch(() => {});
        }
        setHasInitialized(true);
      }
    };

    // Delay để tránh hydration issues
    const timeoutId = setTimeout(initializeLanguage, 100);
    return () => clearTimeout(timeoutId);
  }, [pathname, i18n, router, hasInitialized]);

  // Hàm chuyển đổi ngôn ngữ
  const setLanguage = useCallback(
    async (lang: Language) => {
      if (isLoading || lang === i18n.language) return;

      setIsLoading(true);
      try {
        logger.debug("Setting language", {
          newLanguage: lang,
          currentPath: pathname,
        });

        // 1. Thay đổi ngôn ngữ i18n
        await i18n.changeLanguage(lang);

        // 2. Lưu preference vào storage (localStorage + cookie)
        languageDetector.saveLanguagePreference(lang);

        // 3. Chuyển hướng đến route mới
        const segments = pathname.split("/");
        // Thay thế segment đầu tiên (language code) bằng language mới
        if (languages.includes(segments[1] as Language)) {
          segments[1] = lang;
        } else {
          // Nếu không có language code, thêm vào đầu
          segments.splice(1, 0, lang);
        }
        const newPath = segments.join("/");

        logger.debug("Redirecting to new language path", {
          language: lang,
          oldPath: pathname,
          newPath: newPath,
        });

        router.push(newPath);
      } catch (error) {
        logger.error("Error setting language", {
          message: error instanceof Error ? error.message : "Unknown error",
          targetLanguage: lang,
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [pathname, router, i18n, isLoading]
  );

  // ✅ Lấy locale hiện tại từ pathname
  const currentLocale = React.useMemo(() => {
    const pathLocale = pathname.split("/")[1] as Language;
    return languages.includes(pathLocale) ? pathLocale : (i18n.language as Language);
  }, [pathname, i18n.language]);

  // Giá trị Context
  const contextValue: LanguageContextType = {
    language: i18n.language as Language,
    locale: currentLocale, // ✅ Thêm locale vào context
    setLanguage,
    t,
    isLoading,
    languages: languageList,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

// --- Hook sử dụng với namespace tùy chọn ---
export const useLanguage = (namespace: string = "common") => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }

  // Sử dụng useTranslation với namespace được chỉ định
  const { t: customT } = useTranslation(namespace);

  return {
    ...context,
    // Override function t nếu namespace khác "common"
    t: namespace === "common" ? context.t : customT,
  };
};

// --- Hook chuyên dụng cho common namespace (backward compatibility) ---
export const useLanguageCommon = () => {
  return useLanguage("common");
};

// ✅ Hook riêng để lấy locale (optional, nhưng tiện lợi)
export const useLocale = () => {
  const { locale } = useLanguage();
  return locale;
};

// --- Utility function ---
/**
 * Detect ngôn ngữ từ OS/Browser (client-side)
 */
function detectOSLanguage(): Language | null {
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
      if (languages.includes(lang as Language)) {
        return lang as Language;
      }

      // Base language
      const baseLang = lang.split("-")[0];
      if (languages.includes(baseLang as Language)) {
        return baseLang as Language;
      }
    }
  }

  return null;
}