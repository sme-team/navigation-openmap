// ./src/app/[locale]/layout.tsx
import { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import MainLayout from "@/components/ui/MainLayout";

import { I18nClientProvider } from "@/components/providers/I18nClientProvider";
import "@/styles/globals.css";

import { ToastProvider } from "@/components/common/Toast";

import { createModuleLogger, AppModules } from "@/logger";
const logger = createModuleLogger(AppModules.APP);

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Navigation OpenSource - Đoàn Quốc Cường",
  description:
    "Open project allowing community to contribute data, share routes, and develop free map applications",
  alternates: {
    languages: {
      en: "/en",
      vi: "/vi",
      "zh-CN": "/cn",
    },
  },
  referrer: "no-referrer-when-downgrade",
  keywords: [
    "Navigation",
    "OpenSource",
    "Map",
    "TypeScript",
    "Community",
    "Routes",
  ],
  authors: [{ name: "Đoàn Quốc Cường", url: "https://cuongdq.no-ip.info" }],
};

interface RootLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function RootLayout({
  children,
  params,
}: RootLayoutProps) {
  logger.trace("RootLayout initialized");

  const { locale } = await params;
  const htmlLang = locale === "cn" ? "zh-CN" : locale;

  logger.debug("Language settings", { locale, htmlLang });

  return (
    <ToastProvider>
      <I18nClientProvider
        locale={locale}
        initialNamespaces={["common"]}
      >
        <Providers>
          <MainLayout>{children}</MainLayout>
        </Providers>
      </I18nClientProvider>
    </ToastProvider>
  );
}