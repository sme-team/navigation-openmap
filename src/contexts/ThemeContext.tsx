// ./src/contexts/ThemeContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ThemeColor } from "@/types/theme.types";
import { themes } from "@/lib/themes";
import { getLocalStorage, setLocalStorage } from "@/utils/api-helpers";

// 1. Tách logic lấy theme ban đầu ra khỏi component
const getInitialTheme = (): ThemeColor => {
  // Đảm bảo chỉ chạy trên client và chỉ chạy 1 lần
  if (typeof window !== "undefined") {
    const saved = getLocalStorage("theme-color") as ThemeColor;
    if (saved && themes[saved]) {
      return saved;
    }
  }
  return "blue"; // Trả về theme mặc định nếu không tìm thấy
};

interface ThemeContextType {
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // ✅ FIX: Sử dụng hàm getInitialTheme để khởi tạo state
  const [themeColor, setThemeColorState] =
    useState<ThemeColor>(getInitialTheme);
  const [isInitialized, setIsInitialized] = useState(false);

  // Function to apply CSS variables
  const applyCSSVariables = (color: ThemeColor) => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;
    const themeConfig = themes[color];

    if (themeConfig) {
      // Apply primary colors
      Object.entries(themeConfig.colors.primary).forEach(([shade, rgb]) => {
        root.style.setProperty(`--color-primary-${shade}`, rgb);
      });

      // Apply secondary colors
      Object.entries(themeConfig.colors.secondary).forEach(([shade, rgb]) => {
        root.style.setProperty(`--color-secondary-${shade}`, rgb);
      });
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      // State themeColor đã được khởi tạo với giá trị đúng từ getInitialTheme.
      // Chúng ta chỉ cần áp dụng CSS Variables và set Initialization.
      applyCSSVariables(themeColor);
      setIsInitialized(true);
    }
  }, []); // [] dependency là đúng, chỉ chạy một lần khi mount.

  useEffect(() => {
    if (!isInitialized) return;
    applyCSSVariables(themeColor);
  }, [themeColor, isInitialized]);

  const setThemeColor = (color: ThemeColor) => {
    setThemeColorState(color);
    if (typeof window !== "undefined") {
      setLocalStorage("theme-color", color);
    }
    applyCSSVariables(color); // Apply immediately when theme changes
  };

  return (
    <ThemeContext.Provider value={{ themeColor, setThemeColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
