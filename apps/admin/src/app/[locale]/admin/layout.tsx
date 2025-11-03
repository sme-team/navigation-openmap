// ./src/app/[locale]/admin/layout.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Loader2, Menu } from "lucide-react";
import "@/styles/PostEditor.css";

const ALLOWED_ROLES = ["superadmin", "admin", "manager", "editor", "author"];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { locale } = useLanguage();
  const { user, isLoggedIn, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check authentication and authorization
  useEffect(() => {
    if (!loading) {
      if (!isLoggedIn) {
        router.push(
          `/${locale}/login?redirect=${encodeURIComponent(pathname)}`
        );
        return;
      }

      if (user && !ALLOWED_ROLES.includes(user.role)) {
        router.push(`/${locale}/unauthorized`);
      }
    }
  }, [isLoggedIn, loading, user, router, pathname]);

  // Handle responsive sidebar state
  useEffect(() => {
    const handleResize = () => {
      // Desktop: sidebar mở mặc định
      // Mobile/Tablet: sidebar đóng mặc định
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [pathname]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen && window.innerWidth < 1024) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [sidebarOpen]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 header-transition">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 dark:text-primary-400 animate-spin mx-auto mb-3" />
          <p className="text-secondary-600 dark:text-secondary-400">
            Đang tải...
          </p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn || !user || !ALLOWED_ROLES.includes(user.role)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 header-transition">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="
          fixed bottom-6 right-6 z-50
          lg:hidden
          w-14 h-14 rounded-full
          bg-gradient-to-br from-primary-500 to-primary-700
          dark:from-primary-600 dark:to-primary-800
          text-white
          shadow-lg hover:shadow-2xl
          flex items-center justify-center
          transition-all duration-300
          hover:scale-110 active:scale-95
          group
        "
        aria-label={sidebarOpen ? "Đóng menu" : "Mở menu"}
      >
        <Menu 
          className={`
            w-6 h-6 transition-transform duration-300
            ${sidebarOpen ? 'rotate-90' : 'rotate-0'}
          `}
        />
        <div className="
          absolute inset-0 rounded-full
          bg-primary-500 dark:bg-primary-600
          animate-ping opacity-20
          group-hover:opacity-30
        " />
      </button>
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`
          fixed top-1/2 -translate-y-1/2 z-50 group
          transition-all duration-300 ease-in-out
          hidden lg:flex
          ${sidebarOpen ? "left-64" : "left-0"}
        `}
        aria-label={sidebarOpen ? "Đóng sidebar" : "Mở sidebar"}
      >
        <div className={`
          relative flex items-center justify-center
          h-16 rounded-r-lg
          bg-gradient-to-r from-primary-500 to-primary-600
          dark:from-primary-600 dark:to-primary-700
          shadow-lg hover:shadow-xl
          transition-all duration-300
          ${sidebarOpen ? 'w-2 group-hover:w-10' : 'w-2 group-hover:w-10'}
        `}>
          <div className="relative flex items-center justify-center text-white">
            <Menu className={`
              w-5 h-5 transition-all duration-300
              ${sidebarOpen ? 'rotate-90' : 'rotate-0'}
              group-hover:scale-110
            `} />
          </div>
          <div className="
            absolute inset-0 rounded-r-lg 
            bg-primary-400 opacity-0 
            group-hover:opacity-20 blur 
            transition-opacity duration-300
          " />
        </div>
      </button>
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userRole={user.role}
      />
      {sidebarOpen && (
        <div
          className="
            fixed inset-0 bg-black/50 dark:bg-black/70 
            backdrop-blur-sm
            z-30 lg:hidden 
            transition-opacity duration-300
            animate-fade-in
          "
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      <main
        className={`
          min-h-screen
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}
          p-4 md:p-6 lg:p-8
        `}
      >
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
