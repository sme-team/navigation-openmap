// ./src/components/providers/I18nClientProvider.tsx
"use client";

import React, { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import type { i18n } from "i18next";
import { createClientI18nInstance } from "@/lib/i18n/client-utils";

import { createModuleLogger, AppModules } from "@/logger";
const logger = createModuleLogger(AppModules.I18N_PROVIDER);
logger.trace("I18nClientProvider initialized");

interface I18nClientProviderProps {
  children: React.ReactNode;
  locale: string;
  initialNamespaces?: string[];
}

export const I18nClientProvider: React.FC<I18nClientProviderProps> = ({
  children,
  locale,
  initialNamespaces = ["common","dqcai"],
}) => {
  const [i18nInstance, setI18nInstance] = useState<i18n | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initializeI18n = async () => {
      try {
        logger.debug("Initializing client i18n", { locale, initialNamespaces });

        const instance = await createClientI18nInstance(locale, initialNamespaces);

        if (isMounted) {
          setI18nInstance(instance);
          setIsInitialized(true);
          logger.debug("Client i18n initialized successfully");
        }
      } catch (error) {
        logger.error("Failed to initialize client i18n", error);
        if (isMounted) {
          setIsInitialized(true); // Vẫn set true để tránh loading vô hạn
        }
      }
    };

    initializeI18n();

    return () => {
      isMounted = false;
    };
  }, [locale, initialNamespaces]);

  // Loading state
  if (!isInitialized || !i18nInstance) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading translations...</div>
      </div>
    );
  }

  return (
    <I18nextProvider i18n={i18nInstance}>
      {children}
    </I18nextProvider>
  );
};