// .src/components/provider/Providers.tsx
"use client";

import React from "react";
import { ThemeProvider as NextThemeProvider } from "next-themes";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { LanguageSyncProvider } from "@/components/providers/LanguageSyncProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <LanguageProvider>
        <LanguageSyncProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </LanguageSyncProvider>
      </LanguageProvider>
    </NextThemeProvider>
  );
}
