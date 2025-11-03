// ./src/lib/i18n/client-utils.ts
"use client";

import { createInstance } from "i18next";
import { initReactI18next } from "react-i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import { fallbackLng } from "./index";
import { createModuleLogger, AppModules } from "@/logger";

const logger = createModuleLogger(AppModules.I18N_CLIENT);
logger.debug("Client-utils initing");

export const createClientI18nInstance = async (
  locale: string,
  initialNamespaces: string[] = ["common","dqcai"]
) => {
  logger.debug("Creating client i18n instance", { locale, initialNamespaces });

  const instance = createInstance();

  await instance
    .use(initReactI18next)
    .use(
      resourcesToBackend((lng: string, ns: string, callback) => {
        // Sử dụng trực tiếp lng từ i18next, không cần mapping ngược
        const targetLocale = lng;

        logger.debug("Attempting to load translation", {
          lng: targetLocale,
          ns,
          path: `/locales/${targetLocale}/${ns}.json`,
        });

        // FIX: Sử dụng fetch thay vì dynamic import để load từ public folder
        // Files trong public/ được serve tại root URL, không thể import trực tiếp
        fetch(`/locales/${targetLocale}/${ns}.json`)
          .then(async (response) => {
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const resources = await response.json();
            
            logger.debug("Successfully loaded client translation resource", {
              lng: targetLocale,
              ns,
              resourceKeys: Object.keys(resources || {}),
            });
            
            callback(null, resources);
          })
          .catch((error) => {
            logger.warn("Failed to load primary translation, trying fallback", {
              lng: targetLocale,
              ns,
              error: error.message,
            });

            // Thử fallback nếu không load được
            if (targetLocale !== fallbackLng) {
              fetch(`/locales/${fallbackLng}/${ns}.json`)
                .then(async (fallbackResponse) => {
                  if (!fallbackResponse.ok) {
                    throw new Error(`HTTP ${fallbackResponse.status}: ${fallbackResponse.statusText}`);
                  }
                  const fallbackResources = await fallbackResponse.json();
                  
                  logger.debug("Successfully loaded fallback translation", {
                    originalLng: targetLocale,
                    fallbackLng: fallbackLng,
                    ns,
                  });
                  
                  callback(null, fallbackResources);
                })
                .catch((fallbackError) => {
                  logger.error("Failed to load fallback translation", {
                    lng: fallbackLng,
                    ns,
                    error: fallbackError.message,
                  });
                  callback(fallbackError, null);
                });
            } else {
              logger.error("Failed to load client translation", {
                lng: targetLocale,
                ns,
                error,
              });
              callback(error, null);
            }
          });
      })
    )
    .init({
      lng: locale,
      fallbackLng: fallbackLng,
      ns: initialNamespaces,
      defaultNS: "common",
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
      debug: process.env.NODE_ENV === "development",
      load: "languageOnly",
      cleanCode: true,
    });

  logger.debug("Client i18n instance created successfully", {
    language: instance.language,
    loadedNamespaces: instance.loadNamespaces,
  });

  return instance;
};