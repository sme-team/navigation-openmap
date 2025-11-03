// src/app/[locale]/admin/users/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { adminService } from "@/services/admin.service";
import type { User } from "@/types/api.types";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Lock,
  Unlock,
  Mail,
  Phone,
  Calendar,
  Clock,
  Shield,
  User as UserIcon,
} from "lucide-react";
import UserStatusBadge from "@/components/users/UserStatusBadge";
import UserRoleBadge from "@/components/users/UserRoleBadge";
import { useToast } from "@/components/common/Toast";
import { createModuleLogger, AppModules } from "@/logger";

const logger = createModuleLogger(AppModules.ADMIN_USERS);

export default function UserDetailPage() {
  const { locale, t } = useLanguage("users");
  const router = useRouter();
  const params = useParams();
  const { showToast } = useToast();
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, [userId]);

  const loadUser = async () => {
    try {
      setLoading(true);
      logger.debug("Loading user detail", { userId });

      const userData = await adminService.getUserById(userId);
      setUser(userData);

      logger.info("User detail loaded", {
        userId,
        username: userData.username,
      });
    } catch (error: any) {
      logger.error("Failed to load user", error);
      showToast("error", t("admin.users.loadError") || "Failed to load user");
      router.push(`/${locale}/admin/users`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/${locale}/admin/users/${userId}/edit`);
  };

  const handleToggleActive = async () => {
    if (!user) return;

    try {
      await adminService.toggleUserActive(userId);
      showToast(
        "success",
        user.is_active
          ? t("admin.users.deactivateSuccess") || "User deactivated"
          : t("admin.users.activateSuccess") || "User activated"
      );
      loadUser();
    } catch (error) {
      logger.error("Toggle active failed", error);
      showToast(
        "error",
        t("admin.users.toggleError") || "Failed to update user"
      );
    }
  };

  const handleDelete = async () => {
    if (!user) return;

    const confirmed = confirm(
      `${t("admin.users.confirmDelete")} ${user.username}?`
    );
    if (!confirmed) return;

    try {
      await adminService.deleteUser(userId);
      showToast(
        "success",
        t("admin.users.deleteSuccess") || "User deleted successfully"
      );
      router.push(`/${locale}/admin/users`);
    } catch (error) {
      logger.error("Delete user failed", error);
      showToast(
        "error",
        t("admin.users.deleteError") || "Failed to delete user"
      );
    }
  };

  const getUserInitials = (user: User) => {
    const name = user.full_name || user.username;
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-dual mx-auto mb-4" />
          <p className="text-secondary-600 dark:text-secondary-400">
            {t("common.loading") || "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/${locale}/admin/users`)}
            className="p-2 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold gradient-text">
              {t("admin.users.detail.title") || "User Details"}
            </h1>
            <p className="mt-1 text-sm text-secondary-600 dark:text-secondary-400">
              {t("admin.users.detail.subtitle") ||
                "View and manage user information"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors"
          >
            <Edit className="w-4 h-4" />
            <span>{t("common.edit") || "Edit"}</span>
          </button>
          <button
            onClick={handleToggleActive}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900/60 transition-colors"
          >
            {user.is_active ? (
              <>
                <Lock className="w-4 h-4" />
                <span>{t("admin.users.deactivate") || "Deactivate"}</span>
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4" />
                <span>{t("admin.users.activate") || "Activate"}</span>
              </>
            )}
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>{t("common.delete") || "Delete"}</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                {getUserInitials(user)}
              </div>
              <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
                {user.full_name || user.username}
              </h2>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">
                @{user.username}
              </p>
              <div className="mt-3 flex items-center justify-center gap-2">
                <UserRoleBadge role={user.role || "guest"} />
                <UserStatusBadge isActive={user.is_active ?? true} />
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {user.email && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-secondary-400 flex-shrink-0" />
                  <span className="text-secondary-700 dark:text-secondary-300 truncate">
                    {user.email}
                  </span>
                </div>
              )}
              {user.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-secondary-400 flex-shrink-0" />
                  <span className="text-secondary-700 dark:text-secondary-300">
                    {user.phone}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              {t("admin.users.detail.basicInfo") || "Basic Information"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                  {t("admin.users.table.fullName") || "Full Name"}
                </label>
                <p className="mt-1 text-gray-900 dark:text-white">
                  {user.full_name || "-"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                  {t("admin.users.table.email") || "Email"}
                </label>
                <p className="mt-1 text-gray-900 dark:text-white">
                  {user.email || "-"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                  {t("admin.users.table.phone") || "Phone"}
                </label>
                <p className="mt-1 text-gray-900 dark:text-white">
                  {user.phone || "-"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                  {t("admin.users.table.role") || "Role"}
                </label>
                <div className="mt-1">
                  <UserRoleBadge role={user.role || "guest"} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                  {t("admin.users.table.status") || "Status"}
                </label>
                <div className="mt-1">
                  <UserStatusBadge isActive={user.is_active ?? true} />
                </div>
              </div>
            </div>
          </div>

          {/* Authentication Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              {t("admin.users.detail.authInfo") || "Authentication"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                  {t("admin.users.detail.authProvider") || "Auth Provider"}
                </label>
                <p className="mt-1 text-gray-900 dark:text-white capitalize">
                  {user.auth_provider || "Local"}
                </p>
              </div>
              {user.provider_id && (
                <div>
                  <label className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                    {t("admin.users.detail.providerId") || "Provider ID"}
                  </label>
                  <p className="mt-1 text-gray-900 dark:text-white truncate">
                    {user.provider_id}
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                  {t("admin.users.detail.storeId") || "Store ID"}
                </label>
                <p className="mt-1 text-gray-900 dark:text-white font-mono text-xs">
                  {user.store_id || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              {t("admin.users.detail.timestamps") || "Activity"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-secondary-600 dark:text-secondary-400 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {t("admin.users.table.createdAt") || "Created"}
                </label>
                <p className="mt-1 text-gray-900 dark:text-white">
                  {user.created_at
                    ? new Date(user.created_at).toLocaleString()
                    : "-"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-600 dark:text-secondary-400 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {t("admin.users.detail.updatedAt") || "Updated"}
                </label>
                <p className="mt-1 text-gray-900 dark:text-white">
                  {user.updated_at
                    ? new Date(user.updated_at).toLocaleString()
                    : "-"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-600 dark:text-secondary-400 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {t("admin.users.detail.lastLogin") || "Last Login"}
                </label>
                <p className="mt-1 text-gray-900 dark:text-white">
                  {user.last_login
                    ? new Date(user.last_login).toLocaleString()
                    : t("common.never") || "Never"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
