// ./src/app/components/users/UserFilters.tsx
"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { UserQueryParams, UserRole } from "@/types/api.types";
import { Search, X, Filter } from "lucide-react";

interface UserFiltersProps {
  filters: UserQueryParams;
  onFilterChange: (filters: Partial<UserQueryParams>) => void;
  onReset: () => void;
}

const USER_ROLES: { value: UserRole; label: string }[] = [
  { value: "superadmin", label: "Super Admin" },
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
  { value: "staff", label: "Staff" },
  { value: "editor", label: "Editor" },
  { value: "author", label: "Author" },
  { value: "moderator", label: "Moderator" },
  { value: "viewer", label: "Viewer" },
  { value: "guest", label: "Guest" },
];

export default function UserFilters({
  filters,
  onFilterChange,
  onReset,
}: UserFiltersProps) {
  const { t } = useLanguage("users");
  const [searchInput, setSearchInput] = useState(filters.search || "");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        onFilterChange({ search: searchInput || undefined });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleRoleChange = (role: string) => {
    onFilterChange({ role: role || undefined });
  };

  const handleStatusChange = (status: string) => {
    onFilterChange({
      is_active: status === "" ? undefined : status === "active",
    });
  };

  const hasActiveFilters =
    filters.search || filters.role || filters.is_active !== undefined;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-primary-200 dark:border-primary-700 p-6 animate-slide-down">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t("admin.users.filters.title") || "Filters"}
          </h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-sm text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            {t("common.clearFilters") || "Clear all"}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search Input */}
        <div className="relative">
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
            {t("admin.users.filters.search") || "Search"}
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={
                t("admin.users.filters.searchPlaceholder") ||
                "Search by username, name, email..."
              }
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-primary-200 dark:border-primary-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-secondary-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Role Filter */}
        <div>
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
            {t("admin.users.filters.role") || "Role"}
          </label>
          <select
            value={filters.role || ""}
            onChange={(e) => handleRoleChange(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-primary-200 dark:border-primary-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          >
            <option value="">
              {t("admin.users.filters.allRoles") || "All roles"}
            </option>
            {USER_ROLES.map((role) => (
              <option key={role.value} value={role.value}>
                {t(`admin.users.roles.${role.value}`) || role.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
            {t("admin.users.filters.status") || "Status"}
          </label>
          <select
            value={
              filters.is_active === undefined
                ? ""
                : filters.is_active
                ? "active"
                : "inactive"
            }
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-primary-200 dark:border-primary-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          >
            <option value="">
              {t("admin.users.filters.allStatuses") || "All statuses"}
            </option>
            <option value="active">
              {t("admin.users.status.active") || "Active"}
            </option>
            <option value="inactive">
              {t("admin.users.status.inactive") || "Inactive"}
            </option>
          </select>
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300">
                {t("admin.users.filters.search")}: "{filters.search}"
                <button
                  onClick={() => onFilterChange({ search: undefined })}
                  className="hover:bg-primary-200 dark:hover:bg-primary-800/60 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.role && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300">
                {t("admin.users.filters.role")}:{" "}
                {USER_ROLES.find((r) => r.value === filters.role)?.label}
                <button
                  onClick={() => onFilterChange({ role: undefined })}
                  className="hover:bg-primary-200 dark:hover:bg-primary-800/60 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.is_active !== undefined && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300">
                {t("admin.users.filters.status")}:{" "}
                {filters.is_active
                  ? t("admin.users.status.active") || "Active"
                  : t("admin.users.status.inactive") || "Inactive"}
                <button
                  onClick={() => onFilterChange({ is_active: undefined })}
                  className="hover:bg-primary-200 dark:hover:bg-primary-800/60 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}