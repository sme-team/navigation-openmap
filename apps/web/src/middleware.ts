// ./src/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { fallbackLng, languages } from "@/lib/i18n";

import { createModuleLogger, AppModules } from "@/logger";
const logger = createModuleLogger(AppModules.MIDDLEWARE);

logger.trace("Middleware importing...");

const PUBLIC_FILE_ASSETS = [
  "/.well-known",
  "/favicon.ico",
  "/sitemap.xml",
  "/robots.txt",
  "/assets",
  "/locales",
  "/static", 
  "/_next",
  "/api",
  "/map",
  "/database",
];

const STATIC_EXTENSIONS_REGEX =
  /\.(html|css|js|png|jpg|jpeg|gif|svg|ico|woff2|md|mdx|json?|ttf|eot)$/i;

/**
 * Detect language with priority order:
 * 1. localStorage (cannot access in middleware - handle on client)
 * 2. OS language (cannot detect in middleware - handle on client)
 * 3. Cookie (saved user preference)
 * 4. Accept-Language header (browser preference)
 * 5. Fallback language (default: English)
 */
function detectPreferredLanguage(request: NextRequest): string {
  // 1 & 2: localStorage and OS language cannot be detected in middleware
  // Will be handled on client-side and synced via cookie

  // 3. Check cookie (from user preference or previous visit)
  const cookieLanguage = request.cookies.get("preferred-language")?.value;
  if (cookieLanguage && languages.includes(cookieLanguage)) {
    logger.debug("Language detected from cookie", { language: cookieLanguage });
    return cookieLanguage;
  }

  // 4. Check Accept-Language header (browser/OS preference)
  const acceptLanguage = request.headers.get("accept-language");
  if (acceptLanguage) {
    const browserLanguage = detectBrowserLanguage(acceptLanguage);
    if (browserLanguage) {
      logger.debug("Language detected from Accept-Language header", {
        language: browserLanguage,
        acceptLanguage,
      });
      return browserLanguage;
    }
  }

  // 5. Fallback language (English)
  logger.debug("Using fallback language", { language: fallbackLng });
  return fallbackLng;
}

/**
 * Parse Accept-Language header to find suitable language
 */
function detectBrowserLanguage(acceptLanguageHeader: string): string | null {
  const browserLanguages = acceptLanguageHeader
    .split(",")
    .map((lang) => {
      const [code, quality] = lang.trim().split(";");
      return {
        code: code.trim(),
        quality: quality ? parseFloat(quality.replace("q=", "")) : 1.0,
      };
    })
    .sort((a, b) => b.quality - a.quality); // Sort by priority

  for (const { code } of browserLanguages) {
    // Try exact match first
    if (languages.includes(code)) {
      return code;
    }

    // Try base language (en-US -> en)
    const baseLang = code.split("-")[0];
    if (languages.includes(baseLang)) {
      return baseLang;
    }
  }

  return null;
}

/**
 * Check if pathname needs locale prefix
 */
function isLocaleMissing(pathname: string): boolean {
  return languages.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );
}

/**
 * Check if it's a static file or public asset
 */
function isPublicAsset(pathname: string): boolean { 
  if (!pathname || pathname === "/") return false; // Edge case: skip root or empty

  const cleanPathname = pathname.split("?")[0].split("#")[0].toLowerCase(); // Clean query/fragment, case-insensitive

  return (
    PUBLIC_FILE_ASSETS.some((path) =>
      cleanPathname.startsWith(path.toLowerCase())
    ) || STATIC_EXTENSIONS_REGEX.test(cleanPathname)
  );
}

export function middleware(request: NextRequest) {
  const startTime = Date.now();
  const pathname = request.nextUrl.pathname;

  logger.trace("Middleware processing request", {
    pathname,
    userAgent: request.headers.get("user-agent")?.slice(0, 100),
    acceptLanguage: request.headers.get("accept-language"),
  });

  // Skip static resources and API routes
  if (isPublicAsset(pathname)) {
    logger.trace("Skipping middleware for public asset", { pathname });
    return NextResponse.next();
  }

  // Check if pathname is missing locale prefix
  if (isLocaleMissing(pathname)) {
    // Detect preferred language
    const detectedLanguage = detectPreferredLanguage(request);

    logger.info("Redirecting to localized path", {
      originalPath: pathname,
      detectedLanguage,
      redirectPath: `/${detectedLanguage}${pathname}`,
      processingTime: Date.now() - startTime,
    });

    // Create redirect response with locale prefix
    const localizedUrl = new URL(
      `/${detectedLanguage}${pathname}`,
      request.url
    );

    // Preserve query parameters
    localizedUrl.search = request.nextUrl.search;

    const response = NextResponse.redirect(localizedUrl);

    // Save detected language to cookie to avoid re-detection
    response.cookies.set("preferred-language", detectedLanguage, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      httpOnly: false, // Allow client-side access
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    // Add headers so client knows about redirect
    response.headers.set("X-Language-Detected", detectedLanguage);
    response.headers.set("X-Redirect-Reason", "locale-missing");

    return response;
  }

  // If locale prefix exists, continue processing
  const currentLocale = pathname.split("/")[1];

  // Validate locale and redirect if invalid
  if (!languages.includes(currentLocale)) {
    const fallbackLanguage = detectPreferredLanguage(request);
    const correctedPath = pathname.replace(
      `/${currentLocale}`,
      `/${fallbackLanguage}`
    );

    logger.warn("Invalid locale detected, redirecting to fallback", {
      invalidLocale: currentLocale,
      fallbackLanguage,
      originalPath: pathname,
      correctedPath,
    });

    const response = NextResponse.redirect(new URL(correctedPath, request.url));
    response.cookies.set("preferred-language", fallbackLanguage, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return response;
  }

  // Log successful processing
  logger.trace("Middleware completed successfully", {
    pathname,
    locale: currentLocale,
    processingTime: Date.now() - startTime,
  });

  // Add locale header for route handlers
  const response = NextResponse.next();
  response.headers.set("X-Current-Locale", currentLocale);

  return response;
}

export const config = {
  matcher: [
    // Apply to all routes except static files, API, _next
    "/((?!_next/static|_next/image|favicon.ico|api|assets|locales|.*\\..*$).*)",
  ],
};