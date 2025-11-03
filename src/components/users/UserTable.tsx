// ./src/app/components/users/UserTable.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import type { User } from "@/types/api.types";
import {
  Edit,
  Trash2,
  Eye,
  Lock,
  Unlock,
  Shield,
  CheckSquare,
  Square,
  MoreVertical,
} from "lucide-react";
import UserStatusBadge from "./UserStatusBadge";
import UserRoleBadge from "./UserRoleBadge";
import { adminService } from "@/services/admin.service";
import { useToast } from "@/components/common/Toast";
import { createModuleLogger, AppModules } from "@/logger";

const logger = createModuleLogger(AppModules.ADMIN_USERS);

interface UserTableProps {
  users: User[];
  loading: boolean;
  selectedUsers: Set<string>;
  onSelectAll: () => void;
  onSelectUser: (userId: string) => void;
  onRefresh: () => void;
}

export default function UserTable({
  users,
  loading,
  selectedUsers,
  onSelectAll,
  onSelectUser,
  onRefresh,
}: UserTableProps) {
  const { locale, t } = useLanguage("users");
  const router = useRouter();
  const { showToast } = useToast();
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  const handleView = (userId: string) => {
    router.push(`/${locale}/admin/users/${userId}`);
  };

  const handleEdit = (userId: string) => {
    router.push(`/${locale}/admin/users/${userId}/edit`);
  };

  const handleToggleActive = async (user: User) => {
    try {
      await adminService.toggleUserActive(user._id!);
      showToast(
        "success",
        user.is_active
          ? t("admin.users.deactivateSuccess") || "User deactivated"
          : t("admin.users.activateSuccess") || "User activated"
      );
      onRefresh();
    } catch (error) {
      logger.error("Toggle active failed", error);
      showToast(
        "error",
        t("admin.users.toggleError") || "Failed to update user"
      );
    }
  };

  const handleDelete = async (user: User) => {
    const confirmed = confirm(
      `${t("admin.users.confirmDelete")} ${user.username}?`
    );
    if (!confirmed) return;

    try {
      await adminService.deleteUser(user._id!);
      showToast(
        "success",
        t("admin.users.deleteSuccess") || "User deleted successfully"
      );
      onRefresh();
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
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-8 text-center">
          <div className="spinner-dual mx-auto mb-4" />
          <p className="text-secondary-600 dark:text-secondary-400">
            {t("common.loading") || "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="empty-state">
          <div className="empty-state-icon">
            <Shield className="w-full h-full" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t("admin.users.noUsers") || "No users found"}
          </h3>
          <p className="text-secondary-600 dark:text-secondary-400">
            {t("admin.users.noUsersDescription") ||
              "Try adjusting your filters"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary-50 dark:bg-primary-900/20 border-b border-primary-200 dark:border-primary-700">
              <tr>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={onSelectAll}
                    className="p-1 hover:bg-primary-100 dark:hover:bg-primary-800/40 rounded transition-colors"
                  >
                    {selectedUsers.size === users.length ? (
                      <CheckSquare className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    ) : (
                      <Square className="w-5 h-5 text-secondary-400" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-700 dark:text-secondary-300">
                  {t("admin.users.table.user") || "User"}
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-700 dark:text-secondary-300">
                  {t("admin.users.table.email") || "Email"}
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-700 dark:text-secondary-300">
                  {t("admin.users.table.role") || "Role"}
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-700 dark:text-secondary-300">
                  {t("admin.users.table.status") || "Status"}
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-700 dark:text-secondary-300">
                  {t("admin.users.table.createdAt") || "Created"}
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-secondary-700 dark:text-secondary-300">
                  {t("common.actions") || "Actions"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((user) => (
                <tr
                  key={user._id}
                  className="hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-colors"
                >
                  <td className="px-6 py-4">
                    <button
                      onClick={() => onSelectUser(user._id!)}
                      className="p-1 hover:bg-primary-100 dark:hover:bg-primary-800/40 rounded transition-colors"
                    >
                      {selectedUsers.has(user._id!) ? (
                        <CheckSquare className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      ) : (
                        <Square className="w-5 h-5 text-secondary-400" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                        {getUserInitials(user)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {user.full_name || user.username}
                        </div>
                        <div className="text-sm text-secondary-500">
                          @{user.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-secondary-700 dark:text-secondary-300">
                      {user.email || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <UserRoleBadge role={user.role || "guest"} />
                  </td>
                  <td className="px-6 py-4">
                    <UserStatusBadge isActive={user.is_active ?? true} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-secondary-600 dark:text-secondary-400">
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleView(user._id!)}
                        className="p-2 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-800/40 text-primary-600 dark:text-primary-400 transition-colors"
                        title={t("common.view") || "View"}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(user._id!)}
                        className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800/40 text-blue-600 dark:text-blue-400 transition-colors"
                        title={t("common.edit") || "Edit"}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleActive(user)}
                        className="p-2 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-800/40 text-yellow-600 dark:text-yellow-400 transition-colors"
                        title={
                          user.is_active
                            ? t("admin.users.deactivate") || "Deactivate"
                            : t("admin.users.activate") || "Activate"
                        }
                      >
                        {user.is_active ? (
                          <Lock className="w-4 h-4" />
                        ) : (
                          <Unlock className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-800/40 text-red-600 dark:text-red-400 transition-colors"
                        title={t("common.delete") || "Delete"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {users.map((user) => (
          <div
            key={user._id}
            className="mobile-card bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4"
          >
            <div className="flex items-start gap-4">
              <button
                onClick={() => onSelectUser(user._id!)}
                className="mt-1 p-1"
              >
                {selectedUsers.has(user._id!) ? (
                  <CheckSquare className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                ) : (
                  <Square className="w-5 h-5 text-secondary-400" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                {/* Header with Avatar and Status - Fixed Layout */}
                <div className="flex items-start gap-3 mb-3">
                  {/* Avatar + Name (flex-1 to allow shrinking) */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-semibold shadow-lg flex-shrink-0">
                      {getUserInitials(user)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 dark:text-white truncate">
                        {user.full_name || user.username}
                      </div>
                      <div className="text-sm text-secondary-500 truncate">
                        @{user.username}
                      </div>
                    </div>
                  </div>
                  {/* Status Badge (flex-shrink-0 to prevent shrinking) */}
                  <div className="flex-shrink-0">
                    <UserStatusBadge isActive={user.is_active ?? true} />
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-secondary-600 dark:text-secondary-400">
                      {t("admin.users.table.email") || "Email"}:
                    </span>
                    <span className="text-sm text-gray-900 dark:text-white truncate ml-2">
                      {user.email || "-"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-secondary-600 dark:text-secondary-400">
                      {t("admin.users.table.role") || "Role"}:
                    </span>
                    <UserRoleBadge role={user.role || "guest"} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-secondary-600 dark:text-secondary-400">
                      {t("admin.users.table.createdAt") || "Created"}:
                    </span>
                    <span className="text-sm text-secondary-700 dark:text-secondary-300">
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : "-"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleView(user._id!)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-900/60 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {t("common.view") || "View"}
                    </span>
                  </button>
                  <button
                    onClick={() => handleEdit(user._id!)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {t("common.edit") || "Edit"}
                    </span>
                  </button>
                  <button
                    onClick={() => handleToggleActive(user)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900/60 transition-colors"
                  >
                    {user.is_active ? (
                      <>
                        <Lock className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {t("admin.users.lock") || "Lock"}
                        </span>
                      </>
                    ) : (
                      <>
                        <Unlock className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {t("admin.users.unlock") || "Unlock"}
                        </span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(user)}
                    className="px-4 py-2 rounded-lg bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
