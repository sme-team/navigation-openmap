// src/app/[locale]/admin/users/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { adminService } from "@/services/admin.service";
import type { User, UserQueryParams } from "@/types/api.types";
import {
  Users as UsersIcon,
  Search,
  Filter,
  RefreshCw,
  UserPlus,
  Download,
  Trash2,
  Shield,
  Lock,
  Unlock,
  CheckSquare,
  Square,
} from "lucide-react";
import UserTable from "@/components/users/UserTable";
import UserFilters from "@/components/users/UserFilters";
import { useToast } from "@/components/common/Toast";
import { createModuleLogger, AppModules } from "@/logger";

const logger = createModuleLogger(AppModules.ADMIN_USERS);

export default function UsersListPage() {
  const { locale, t } = useLanguage("users");
  const router = useRouter();
  const { showToast } = useToast();

  // States
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // Pagination & Filters
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [filters, setFilters] = useState<UserQueryParams>({
    page: 1,
    limit: 20,
    role: undefined,
    search: undefined,
    is_active: undefined,
  });

  // Load users
  const loadUsers = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      else setRefreshing(true);

      logger.debug("Loading users with filters", filters);

      const response = await adminService.getAllUsers(filters);

      setUsers(response.users);
      setTotalPages(response.totalPages);
      setTotalUsers(response.total);
      setCurrentPage(response.page);

      logger.info("Users loaded successfully", {
        count: response.users.length,
        total: response.total,
      });
    } catch (error: any) {
      logger.error("Failed to load users", error);
      showToast("error", t("admin.users.loadError") || "Failed to load users");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadUsers();
  }, [filters]);

  // Handle filter change
  const handleFilterChange = (newFilters: Partial<UserQueryParams>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset to first page on filter change
    }));
    setSelectedUsers(new Set()); // Clear selection
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    setSelectedUsers(new Set());
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle refresh
  const handleRefresh = () => {
    loadUsers(false);
    setSelectedUsers(new Set());
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map((u) => u._id!).filter(Boolean)));
    }
  };

  // Handle select one
  const handleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  // Bulk actions
  const handleBulkDelete = async () => {
    if (selectedUsers.size === 0) return;

    const confirmed = confirm(
      `${t("admin.users.confirmDeleteMultiple")} ${selectedUsers.size} ${t(
        "admin.users.users"
      )}?`
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      const deletePromises = Array.from(selectedUsers).map((id) =>
        adminService.deleteUser(id)
      );

      await Promise.all(deletePromises);

      showToast(
        "success",
        t("admin.users.deleteSuccess") || "Users deleted successfully"
      );

      setSelectedUsers(new Set());
      loadUsers();
    } catch (error) {
      logger.error("Bulk delete failed", error);
      showToast(
        "error",
        t("admin.users.deleteError") || "Failed to delete users"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBulkToggleActive = async (status: boolean) => {
    if (selectedUsers.size === 0) return;

    try {
      setLoading(true);

      const togglePromises = Array.from(selectedUsers).map((id) =>
        adminService.toggleUserActive(id)
      );

      await Promise.all(togglePromises);

      showToast(
        "success",
        status
          ? t("admin.users.activateSuccess") || "Users activated"
          : t("admin.users.deactivateSuccess") || "Users deactivated"
      );

      setSelectedUsers(new Set());
      loadUsers();
    } catch (error) {
      logger.error("Bulk toggle active failed", error);
      showToast(
        "error",
        t("admin.users.toggleError") || "Failed to update users"
      );
    } finally {
      setLoading(false);
    }
  };

  // Export to CSV
  const handleExport = () => {
    try {
      const headers = [
        "ID",
        "Username",
        "Full Name",
        "Email",
        "Role",
        "Status",
        "Created At",
      ];
      const csvContent = [
        headers.join(","),
        ...users.map((user) =>
          [
            user._id,
            user.username,
            user.full_name || "",
            user.email || "",
            user.role || "",
            user.is_active ? "Active" : "Inactive",
            user.created_at || "",
          ].join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `users_${new Date().toISOString()}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      showToast(
        "success",
        t("admin.users.exportSuccess") || "Exported successfully"
      );
    } catch (error) {
      logger.error("Export failed", error);
      showToast("error", t("admin.users.exportError") || "Export failed");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold gradient-text flex items-center gap-3">
            <UsersIcon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            {t("admin.users.title") || "User Management"}
          </h1>
          <p className="mt-2 text-sm text-secondary-600 dark:text-secondary-400">
            {t("admin.users.subtitle") ||
              `Manage ${totalUsers} users in the system`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-primary-200 dark:border-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
            title={t("common.refresh") || "Refresh"}
          >
            <RefreshCw
              className={`w-5 h-5 text-primary-600 dark:text-primary-400 ${
                refreshing ? "animate-spin" : ""
              }`}
            />
          </button>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg border transition-colors ${
              showFilters
                ? "bg-primary-100 dark:bg-primary-900/40 border-primary-400"
                : "bg-white dark:bg-gray-800 border-primary-200 dark:border-primary-700"
            }`}
            title={t("common.filter") || "Filter"}
          >
            <Filter className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </button>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-primary-200 dark:border-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
          >
            <Download className="w-5 h-5" />
            <span>{t("common.export") || "Export"}</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <UserFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={() =>
            setFilters({
              page: 1,
              limit: 20,
              role: undefined,
              search: undefined,
              is_active: undefined,
            })
          }
        />
      )}

      {/* Bulk Actions Bar */}
      {selectedUsers.size > 0 && (
        <div className="bulk-action-bar bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700 rounded-lg p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                {selectedUsers.size} {t("admin.users.selected") || "selected"}
              </span>
              <button
                onClick={handleSelectAll}
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                {selectedUsers.size === users.length
                  ? t("common.deselectAll") || "Deselect all"
                  : t("common.selectAll") || "Select all"}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleBulkToggleActive(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors"
              >
                <Unlock className="w-4 h-4" />
                <span>{t("admin.users.activate") || "Activate"}</span>
              </button>

              <button
                onClick={() => handleBulkToggleActive(false)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900/30 transition-colors"
              >
                <Lock className="w-4 h-4" />
                <span>{t("admin.users.deactivate") || "Deactivate"}</span>
              </button>

              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>{t("common.delete") || "Delete"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <UserTable
        users={users}
        loading={loading}
        selectedUsers={selectedUsers}
        onSelectAll={handleSelectAll}
        onSelectUser={handleSelectUser}
        onRefresh={loadUsers}
      />

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <nav className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-primary-200 dark:border-primary-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
            >
              {t("common.previous") || "Previous"}
            </button>

            <div className="flex gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-10 h-10 rounded-lg transition-all ${
                      currentPage === pageNum
                        ? "pagination-active"
                        : "bg-white dark:bg-gray-800 border border-primary-200 dark:border-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-primary-200 dark:border-primary-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
            >
              {t("common.next") || "Next"}
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
