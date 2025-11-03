// ./src/components/ui/Header.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { LocalizedLink } from "@/components/ui/LocalizedLink";
import { useAuth } from "@/contexts/AuthContext";
import {
  Menu,
  X,
  LogIn,
  LogOut,
  Settings,
  UserCircle,
  Shield,
} from "lucide-react";
import SettingsMenu from "./SettingsMenu";

import { createModuleLogger, AppModules } from "@/logger";
const logger = createModuleLogger(AppModules.HEADER);

// Admin roles constant
const ADMIN_ROLES = ["superadmin", "admin", "author", "manager"];

const HeaderContent = () => {
  const { t } = useLanguage();
  const { user, isLoggedIn, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Check if user has admin role
  const isAdmin = () => {
    if (!user || !user.role) return false;
    const userRole =
      typeof user.role === "string" ? user.role.toLowerCase() : "";
    return ADMIN_ROLES.includes(userRole);
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        logger.debug("Closing mobile menu due to outside click");
        setIsMobileMenuOpen(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        logger.debug("Closing user menu due to outside click");
        setIsUserMenuOpen(false);
      }
    };

    logger.debug("Registering click outside event listener");
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      logger.debug("Unregistering click outside event listener");
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    const handleRouteChange = () => {
      logger.debug("Closing menus due to route change");
      setIsMobileMenuOpen(false);
      setIsUserMenuOpen(false);
    };

    logger.debug("Registering route change event listener");
    window.addEventListener("popstate", handleRouteChange);
    return () => {
      logger.debug("Unregistering route change event listener");
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, []);

  const navigationLinks = [
    { href: `/`, label: t("pages.home") },
    { href: `/articles`, label: t("pages.articles") },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      logger.debug("User logged out successfully");
      setIsUserMenuOpen(false);
    } catch (error) {
      logger.error(AppModules.HEADER, "Logout failed", error);
    }
  };

  const getUserInitials = (user: any) => {
    const displayName = user?.name || user?.full_name || user?.username || "U";

    if (!displayName || typeof displayName !== "string") {
      return "U";
    }

    const cleanName = displayName.includes("@")
      ? displayName.split("@")[0]
      : displayName;

    const parts = cleanName.split(/[\s_]+/).filter((part) => part.length > 0);

    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }

    return parts
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  return (
    <>
      {/* Header */}
      <header className="header-bg header-shadow header-transition sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-2 md:py-3">
            {/* Logo */}
            <div className="flex items-center">
              <LocalizedLink
                href="/"
                className="flex items-center space-x-2 group"
                onClick={() => {
                  logger.debug("Navigating to home page via logo click");
                  setIsMobileMenuOpen(false);
                }}
              >
                <div className="relative">
                  <div className="w-8 h-8 md:w-9 md:h-9 rounded-full logo-container p-0.5 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    <div className="w-full h-full rounded-full logo-inner p-1">
                      <Image
                        src="/icons/logo.png"
                        alt={t("nav.company")}
                        width={32}
                        height={32}
                        className="w-full h-full object-contain rounded-full"
                        priority
                      />
                    </div>
                  </div>
                </div>
                <span className="text-base md:text-lg font-bold company-name group-hover:scale-105 transition-transform duration-300">
                  {t("nav.company")}
                </span>
              </LocalizedLink>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navigationLinks.map(({ href, label }) => (
                <LocalizedLink
                  key={href}
                  href={href}
                  className="nav-link hover:nav-link transition-all duration-200 font-medium relative group"
                  onClick={() =>
                    logger.debug("Navigating to page", { page: label })
                  }
                >
                  {label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-500 transition-all duration-300 group-hover:w-full" />
                </LocalizedLink>
              ))}

              {/* Desktop Auth Section */}
              <div className="flex items-center space-x-4">
                {isLoggedIn && user ? (
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => {
                        logger.debug("Toggling user menu", {
                          isOpen: !isUserMenuOpen,
                        });
                        setIsUserMenuOpen(!isUserMenuOpen);
                      }}
                      className="flex items-center space-x-3 p-2 rounded-lg menu-item-hover transition-all duration-200 group"
                    >
                      <div className="relative">
                        {user.avatar ? (
                          <Image
                            src={user.avatar}
                            alt={user.name as string}
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-200 dark:ring-primary-700"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full user-avatar flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                            {getUserInitials(user)}
                          </div>
                        )}
                        {isAdmin() && (
                          <div
                            className="absolute -top-1 -right-1 w-3 h-3 admin-badge rounded-full border-2 border-white dark:border-gray-800 shadow-sm"
                            title="Admin User"
                          />
                        )}
                      </div>
                      <span className="text-sm font-medium nav-link max-w-24 truncate">
                        {user.name || user.full_name || user.username}
                      </span>
                    </button>

                    {/* User Dropdown Menu */}
                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 user-menu rounded-lg shadow-xl py-2 z-50 animate-slide-down">
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {user.name || user.full_name || user.username}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {user.email}
                          </p>
                          {isAdmin() && (
                            <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded text-xs font-medium admin-badge text-white shadow-sm">
                              {user.role}
                            </span>
                          )}
                        </div>

                        <LocalizedLink
                          href="/profile"
                          className="flex items-center px-4 py-3 text-sm menu-item-hover transition-colors"
                          onClick={() => {
                            logger.debug("Navigating to profile page");
                            setIsUserMenuOpen(false);
                          }}
                        >
                          <UserCircle className="w-4 h-4 mr-3" />
                          {t("nav.profile") || "Profile"}
                        </LocalizedLink>

                        <LocalizedLink
                          href="/dashboard"
                          className="flex items-center px-4 py-3 text-sm menu-item-hover transition-colors"
                          onClick={() => {
                            logger.debug("Navigating to dashboard page");
                            setIsUserMenuOpen(false);
                          }}
                        >
                          <Settings className="w-4 h-4 mr-3" />
                          {t("nav.dashboard") || "Dashboard"}
                        </LocalizedLink>

                        {/* Admin Dashboard LocalizedLink */}
                        {isAdmin() && (
                          <>
                            <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                            <LocalizedLink
                              href="/admin/dashboard"
                              className="flex items-center px-4 py-3 text-sm admin-menu-item transition-colors font-medium"
                              onClick={() => {
                                logger.debug("Navigating to admin dashboard", {
                                  role: user.role,
                                });
                                setIsUserMenuOpen(false);
                              }}
                            >
                              <Shield className="w-4 h-4 mr-3" />
                              {t("nav.adminDashboard") || "Admin Dashboard"}
                            </LocalizedLink>
                          </>
                        )}

                        <div className="border-t border-gray-200 dark:border-gray-700 my-1" />

                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-3 text-sm logout-menu-item transition-colors"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          {t("nav.logout") || "Sign Out"}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <LocalizedLink href="/login">
                    <button
                      className="login-btn flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl"
                      title={t("nav.login") || "Sign In"}
                      onClick={() => logger.debug("Navigating to login page")}
                    >
                      <LogIn className="w-5 h-5" />
                    </button>
                  </LocalizedLink>
                )}

                <SettingsMenu />
              </div>
            </nav>

            {/* Mobile Menu Controls */}
            <div className="md:hidden flex items-center space-x-2">
              <SettingsMenu />
              <button
                onClick={() => {
                  logger.debug("Toggling mobile menu", {
                    isOpen: !isMobileMenuOpen,
                  });
                  setIsMobileMenuOpen(!isMobileMenuOpen);
                }}
                className="p-2 rounded-lg mobile-button transition-colors"
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div
          className={`mobile-menu md:hidden transition-all duration-300 ${
            isMobileMenuOpen ? "block" : "hidden"
          }`}
        >
          <div ref={mobileMenuRef}>
            <nav className="px-4 py-2 space-y-1">
              {navigationLinks.map(({ href, label }) => (
                <LocalizedLink
                  key={href}
                  href={href}
                  onClick={() => {
                    logger.debug("Navigating to page via mobile menu", {
                      page: label,
                    });
                    setIsMobileMenuOpen(false);
                  }}
                  className="block px-4 py-3 menu-item-hover rounded-lg transition-colors font-medium"
                >
                  {label}
                </LocalizedLink>
              ))}

              {/* Mobile Auth Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                {isLoggedIn && user ? (
                  <div className="space-y-1">
                    <div className="flex items-center px-4 py-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                      <div className="relative">
                        {user.avatar ? (
                          <Image
                            src={user.avatar}
                            alt={user.name || user.username || "User avatar"}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-primary-200 dark:ring-primary-700"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full user-avatar flex items-center justify-center text-white font-semibold text-sm mr-3 shadow-lg">
                            {getUserInitials(user)}
                          </div>
                        )}
                        {isAdmin() && (
                          <div
                            className="absolute -top-1 -right-1 w-3 h-3 admin-badge rounded-full border-2 border-white dark:border-gray-700 shadow-sm"
                            title="Admin User"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {user.name || user.full_name || user.username}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user.email}
                        </p>
                        {isAdmin() && (
                          <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded text-xs font-medium admin-badge text-white shadow-sm">
                            {user.role}
                          </span>
                        )}
                      </div>
                    </div>

                    <LocalizedLink
                      href="/profile"
                      onClick={() => {
                        logger.debug(
                          "Navigating to profile page via mobile menu"
                        );
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center px-4 py-3 menu-item-hover rounded-lg transition-colors font-medium"
                    >
                      <UserCircle className="w-5 h-5 mr-3" />
                      {t("nav.profile") || "Profile"}
                    </LocalizedLink>

                    <LocalizedLink
                      href="/dashboard"
                      onClick={() => {
                        logger.debug(
                          "Navigating to dashboard page via mobile menu"
                        );
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center px-4 py-3 menu-item-hover rounded-lg transition-colors font-medium"
                    >
                      <Settings className="w-5 h-5 mr-3" />
                      {t("nav.dashboard") || "Dashboard"}
                    </LocalizedLink>

                    {/* Mobile Admin Dashboard LocalizedLink */}
                    {isAdmin() && (
                      <LocalizedLink
                        href="/admin/dashboard"
                        onClick={() => {
                          logger.debug(
                            "Navigating to admin dashboard via mobile menu",
                            { role: user.role }
                          );
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex items-center px-4 py-3 admin-menu-item rounded-lg transition-colors font-medium"
                      >
                        <Shield className="w-5 h-5 mr-3" />
                        {t("nav.adminDashboard") || "Admin Dashboard"}
                      </LocalizedLink>
                    )}

                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-3 logout-menu-item rounded-lg transition-colors font-medium"
                    >
                      <LogOut className="w-5 h-5 mr-3" />
                      {t("nav.logout") || "Sign Out"}
                    </button>
                  </div>
                ) : (
                  <LocalizedLink
                    href="/login"
                    onClick={() => {
                      logger.debug("Navigating to login page via mobile menu");
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full login-btn px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg"
                  >
                    <LogIn className="w-5 h-5" />
                    <span>{t("nav.login") || "Sign In"}</span>
                  </LocalizedLink>
                )}
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden backdrop-blur-sm"
          onClick={() => {
            logger.debug("Closing mobile menu via overlay click");
            setIsMobileMenuOpen(false);
          }}
        />
      )}
    </>
  );
};

const Header: React.FC = () => {
  return <HeaderContent />;
};

export default Header;
