// ./src/lib/i18n/server-utils.ts
// Chỉ sử dụng trong Node.js runtime (getServerSideProps, API routes, etc.)
import { readFileSync } from "fs";
import { join } from "path";
import nextI18NextConfig from "./next-i18next.config";
import { createModuleLogger, AppModules } from "@/logger";

const logger = createModuleLogger(AppModules.I18N_SERVER);
logger.debug("server-utils.ts init");

export const languages = nextI18NextConfig.i18n.locales;
export const fallbackLng = nextI18NextConfig.i18n.defaultLocale;

// Hàm helper để đọc JSON file từ public folder (chỉ cho Node.js runtime)
const loadTranslationFileSync = (locale: string, namespace: string) => {
  logger.debug("loadTranslationFileSync", { locale, namespace });
  try {
    const filePath = join(
      process.cwd(),
      "public",
      "locales",
      locale,
      `${namespace}.json`
    );
    logger.debug("File path", filePath);
    const fileContent = readFileSync(filePath, "utf8");
    logger.debug("File Content loaded", { locale, namespace });
    return JSON.parse(fileContent);
  } catch (error) {
    logger.warn("Failed to read translation file", {
      locale,
      namespace,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return null;
  }
};

// Synchronous version cho server-side rendering
export const getInitialI18nDataSync = (locale: string, ns: string[]) => {
  logger.debug("Loading server-side translation data (sync)", {
    locale,
    namespaces: ns,
  });

  try {
     
    const translationData: Record<string, any> = {};

    for (const namespace of ns) {
      const translation = loadTranslationFileSync(locale, namespace);

      if (translation) {
        translationData[namespace] = translation;
        logger.debug("Loaded server translation", {
          locale,
          namespace,
          hasData: !!translationData[namespace],
        });
      } else {
        logger.error("Failed to load server translation", {
          locale,
          namespace,
        });

        if (locale !== fallbackLng) {
          const fallbackTranslation = loadTranslationFileSync(
            fallbackLng,
            namespace
          );

          if (fallbackTranslation) {
            translationData[namespace] = fallbackTranslation;
            logger.debug("Loaded fallback translation", {
              fallbackLng,
              namespace,
            });
          } else {
            logger.error("Failed to load fallback translation", {
              fallbackLng,
              namespace,
            });
            translationData[namespace] = {};
          }
        } else {
          translationData[namespace] = {};
        }
      }
    }

    return {
      locale: locale,
      resources: translationData,
      namespaces: ns,
      fallbackLng: fallbackLng,
    };
  } catch (error) {
    logger.error("Failed to prepare i18n data", {
      locale,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return {
      locale: locale,
      resources: {},
      namespaces: ns,
      fallbackLng: fallbackLng,
    };
  }
};