// ./src/components/SettingsMenu.tsx
import React, { useState, useRef, useEffect } from "react";
import { useTheme as useNextTheme } from "next-themes";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { themes } from "@/lib/themes";
import { ThemeColor } from "@/types/theme.types";
import { Language } from "@/types/language.types";
import {
  Settings,
  Sun,
  Moon,
  Monitor,
  Palette,
  Globe,
  Check,
} from "lucide-react";
import { setLocalStorage } from "@/utils/api-helpers";

import { createModuleLogger, AppModules } from "@/logger";
const logger = createModuleLogger(AppModules.SETTING);

const SettingsMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"theme" | "color" | "language">(
    "theme"
  );
  const menuRef = useRef<HTMLDivElement>(null);

  const { theme, setTheme } = useNextTheme();
  const { themeColor, setThemeColor } = useTheme();
  const { language, setLanguage, t, languages, isLoading } = useLanguage();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menu on scroll (mobile UX improvement)
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth < 768) {
        setIsOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const themeOptions = [
    { key: "light", label: t("settings.lightMode") || "Light", icon: Sun },
    { key: "dark", label: t("settings.darkMode") || "Dark", icon: Moon },
    {
      key: "system",
      label: t("settings.systemMode") || "System",
      icon: Monitor,
    },
  ];

  const handleLanguageChange = async (langCode: string) => {
    try {
      await setLanguage(langCode as Language);

      if (typeof window !== "undefined") {
        setLocalStorage("preferred-language", langCode);
        document.cookie = `preferred-language=${langCode}; path=/; max-age=${
          60 * 60 * 24 * 365
        }`;
      }

      logger.info(
        AppModules.SETTING,
        "Language changed and saved to storage:",
        langCode
      );
    } catch (error) {
      logger.error(AppModules.SETTING, "Failed to change language:", error);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Settings"
        disabled={isLoading}
      >
        <Settings
          className={`w-5 h-5 text-gray-600 dark:text-gray-300 ${
            isLoading ? "animate-spin" : ""
          }`}
        />
      </button>

      {/* Settings Menu */}
      {isOpen && (
        <div className="settings-menu">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("settings.title") || "Settings"}
            </h3>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {[
              {
                key: "theme",
                label: t("settings.theme") || "Theme",
                icon: Sun,
              },
              {
                key: "color",
                label: t("settings.color") || "Color",
                icon: Palette,
              },
              {
                key: "language",
                label: t("settings.language") || "Language",
                icon: Globe,
              },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() =>
                  setActiveTab(key as "theme" | "color" | "language")
                }
                className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium transition-colors ${
                  activeTab === key
                    ? "text-primary-600 border-b-2 border-primary-600 bg-primary-50 dark:bg-primary-900/20"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Theme Tab */}
            {activeTab === "theme" && (
              <div className="space-y-2">
                {themeOptions.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => {
                      setTheme(key);
                      // Auto close on mobile after selection
                      if (window.innerWidth < 768) {
                        setTimeout(() => setIsOpen(false), 300);
                      }
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      theme === key
                        ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="flex-1 text-left">{label}</span>
                    {theme === key && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            )}

            {/* Color Tab */}
            {activeTab === "color" && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {t("settings.chooseColor") ||
                    "Choose your preferred color scheme"}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(themes).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setThemeColor(key as ThemeColor);
                        // Auto close on mobile after selection
                        if (window.innerWidth < 768) {
                          setTimeout(() => setIsOpen(false), 300);
                        }
                      }}
                      className={`relative p-3 rounded-lg border-2 transition-all ${
                        themeColor === key
                          ? "border-gray-400 dark:border-gray-500"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{
                            backgroundColor: `rgb(${config.colors.primary[500]})`,
                          }}
                        />
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{
                            backgroundColor: `rgb(${config.colors.secondary[500]})`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {config.name}
                      </span>
                      {themeColor === key && (
                        <div className="absolute top-1 right-1">
                          <Check className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Language Tab */}
            {activeTab === "language" && (
              <div className="space-y-2">
                {languages.map(({ code, name, flag }) => (
                  <button
                    key={code}
                    onClick={() => {
                      handleLanguageChange(code);
                      // Auto close on mobile after selection
                      if (window.innerWidth < 768) {
                        setTimeout(() => setIsOpen(false), 500);
                      }
                    }}
                    disabled={isLoading}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors disabled:opacity-50 ${
                      language === code
                        ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <span className="text-2xl">{flag}</span>
                    <span className="flex-1 text-left">{name}</span>
                    {language === code && <Check className="w-4 h-4" />}
                    {isLoading && language === code && (
                      <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsMenu;
