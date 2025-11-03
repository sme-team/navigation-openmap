// ./src/lib/language-detector.ts
// thư viện này chỉ chạy ở server-side không chạy ở client-side được
import { languages, fallbackLng } from "@/lib/i18n";
import {
  getLocalStorage,
  setLocalStorage,
  removeItemLocalStorage,
} from "@/utils/api-helpers";

export interface LanguageDetectionOptions {
  availableLanguages: string[];
  fallbackLanguage: string;
}

export class LanguageDetector {
  private availableLanguages: string[];
  private fallbackLanguage: string;

  constructor(options: LanguageDetectionOptions) {
    this.availableLanguages = options.availableLanguages;
    this.fallbackLanguage = options.fallbackLanguage;
  }

  /**
   * Detect language với thứ tự ưu tiên:
   * 1. localStorage (user preference từ settings)
   * 2. OS language (system preference)
   * 3. Cookie (middleware preference)
   * 4. Browser Accept-Language header
   * 5. Fallback language
   */
  detectLanguage(request?: {
    cookies?: { get: (name: string) => { value: string } | undefined };
    headers?: { get: (name: string) => string | null };
  }): string {
    // 1. Kiểm tra localStorage (client-side only)
    if (typeof window !== "undefined") {
      const storedLanguage = getLocalStorage("preferred-language");
      if (storedLanguage && this.isValidLanguage(storedLanguage)) {
        return storedLanguage;
      }

      // 2. Detect OS language
      const osLanguage = this.detectOSLanguage();
      if (osLanguage && this.isValidLanguage(osLanguage)) {
        return osLanguage;
      }
    }

    // Server-side hoặc khi không detect được từ client
    if (request) {
      // 3. Kiểm tra cookie
      const cookieLanguage = request.cookies?.get("preferred-language")?.value;
      if (cookieLanguage && this.isValidLanguage(cookieLanguage)) {
        return cookieLanguage;
      }

      // 4. Kiểm tra Accept-Language header
      const browserLanguage = this.detectBrowserLanguage(
        request.headers?.get("accept-language")
      );
      if (browserLanguage && this.isValidLanguage(browserLanguage)) {
        return browserLanguage;
      }
    }

    // 5. Fallback
    return this.fallbackLanguage;
  }

  /**
   * Detect ngôn ngữ từ OS (client-side)
   */
  private detectOSLanguage(): string | null {
    if (typeof navigator === "undefined") return null;

    // Thử các cách detect khác nhau
    const candidates = [
      // Navigator language (OS preference)
      navigator.language,
      // Navigator languages array (user preferences)
      ...(navigator.languages || []),
      // Legacy properties
       
      (navigator as any).userLanguage,
      (navigator as any).browserLanguage,
      (navigator as any).systemLanguage,
       
    ].filter(Boolean);

    for (const lang of candidates) {
      if (typeof lang === "string") {
        // Thử exact match trước
        if (this.isValidLanguage(lang)) {
          return lang;
        }

        // Thử base language (vi-VN -> vi)
        const baseLang = lang.split("-")[0];
        if (this.isValidLanguage(baseLang)) {
          return baseLang;
        }
      }
    }

    return null;
  }

  /**
   * Detect ngôn ngữ từ Accept-Language header
   */
  private detectBrowserLanguage(
    acceptLanguageHeader: string | null | undefined
  ): string | null {
    if (!acceptLanguageHeader) return null;

    const languages = acceptLanguageHeader
      .split(",")
      .map((lang) => {
        const [code, quality] = lang.trim().split(";");
        return {
          code: code.trim(),
          quality: quality ? parseFloat(quality.replace("q=", "")) : 1.0,
        };
      })
      .sort((a, b) => b.quality - a.quality); // Sort by quality

    for (const { code } of languages) {
      // Thử exact match
      if (this.isValidLanguage(code)) {
        return code;
      }

      // Thử base language
      const baseLang = code.split("-")[0];
      if (this.isValidLanguage(baseLang)) {
        return baseLang;
      }
    }

    return null;
  }

  /**
   * Kiểm tra ngôn ngữ có hợp lệ không
   */
  private isValidLanguage(language: string): boolean {
    return this.availableLanguages.includes(language);
  }

  /**
   * Lưu preference vào storage (client-side)
   */
  saveLanguagePreference(language: string): void {
    if (typeof window !== "undefined" && this.isValidLanguage(language)) {
      setLocalStorage("preferred-language", language);

      // Cập nhật cookie để đồng bộ với middleware
      document.cookie = `preferred-language=${language}; path=/; max-age=${
        60 * 60 * 24 * 365
      }`;
    }
  }

  /**
   * Xóa preference
   */
  clearLanguagePreference(): void {
    if (typeof window !== "undefined") {
      removeItemLocalStorage("preferred-language");
      document.cookie =
        "preferred-language=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  }
}

// Default instance với cấu hình từ i18n
export const languageDetector = new LanguageDetector({
  availableLanguages: languages,
  fallbackLanguage: fallbackLng,
});
