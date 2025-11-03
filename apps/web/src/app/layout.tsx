// ./src/app/layout.tsx
import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import "@/styles/globals.css";
import { dir } from "@/lib/i18n";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Navigation OpenSource - Đoàn Quốc Cường",
  description:
    "Open project allowing community to contribute data, share routes, and develop free map applications",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const locale = cookieStore.get("preferred-language")?.value || "en";
  const htmlLang = locale === "cn" ? "zh-CN" : locale;

  return (
    <html
      lang={htmlLang}
      dir={dir(htmlLang)}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <body className={inter.className}>{children}</body>
    </html>
  );
}