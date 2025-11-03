// src/app/[locale]/admin/users/[id]/edit/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { adminService } from "@/services/admin.service";
import type {
  User,
  UpdateUserRequest,
  UpdateUserRoleRequest,
  UserRole,
} from "@/types/api.types";
import {
  ArrowLeft,
  Save,
  X,
  User as UserIcon,
  Mail,
  Phone,
  Shield,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/components/common/Toast";
import { createModuleLogger, AppModules } from "@/logger";

const logger = createModuleLogger(AppModules.ADMIN_USERS);

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

export default function UserEditPage() {
  const { locale, t } = useLanguage("users");
  const router = useRouter();
  const params = useParams();
  const { showToast } = useToast();
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form states
  const [formData, setFormData] = useState<UpdateUserRequest>({
    full_name: "",
    email: "",
    phone: "",
    avatar_url: "",
    is_active: true,
  });

  const [selectedRole, setSelectedRole] = useState<UserRole>("guest");

  useEffect(() => {
    loadUser();
  }, [userId]);

  const loadUser = async () => {
    try {
      setLoading(true);
      logger.debug("Loading user for edit", { userId });

      const userData = await adminService.getUserById(userId);
      setUser(userData);

      // Populate form
      setFormData({
        full_name: userData.full_name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        avatar_url: userData.avatar_url || "",
        is_active: userData.is_active ?? true,
      });

      setSelectedRole(userData.role || "guest");

      logger.info("User loaded for edit", {
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name?.trim()) {
      newErrors.full_name =
        t("admin.users.edit.errors.fullNameRequired") ||
        "Full name is required";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email =
        t("admin.users.edit.errors.emailInvalid") || "Invalid email format";
    }

    if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone =
        t("admin.users.edit.errors.phoneInvalid") || "Invalid phone format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast(
        "error",
        t("admin.users.edit.errors.validationFailed") ||
          "Please fix validation errors"
      );
      return;
    }

    try {
      setSaving(true);
      logger.debug("Updating user", { userId, formData });

      // Update basic info
      await adminService.updateUser(userId, formData);

      // Update role if changed
      if (user && selectedRole !== user.role) {
        const roleData: UpdateUserRoleRequest = { role: selectedRole };
        await adminService.updateUserRole(userId, roleData);
      }

      showToast(
        "success",
        t("admin.users.edit.success") || "User updated successfully"
      );

      router.push(`/${locale}/admin/users/${userId}`);
    } catch (error: any) {
      logger.error("Failed to update user", error);
      showToast(
        "error",
        error?.message || t("admin.users.edit.error") || "Failed to update user"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/${locale}/admin/users/${userId}`);
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
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push(`/${locale}/admin/users/${userId}`)}
          className="p-2 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/20 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold gradient-text">
            {t("admin.users.edit.title") || "Edit User"}
          </h1>
          <p className="mt-1 text-sm text-secondary-600 dark:text-secondary-400">
            {t("admin.users.edit.subtitle") || `Editing: ${user.username}`}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                {t("admin.users.edit.basicInfo") || "Basic Information"}
              </h3>

              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    {t("admin.users.edit.fullName") || "Full Name"}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    className={`w-full px-4 py-2.5 rounded-lg border ${
                      errors.full_name
                        ? "border-red-500 focus:ring-red-500"
                        : "border-primary-200 dark:border-primary-700 focus:ring-primary-500"
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent transition-colors`}
                    placeholder={
                      t("admin.users.edit.fullNamePlaceholder") ||
                      "Enter full name"
                    }
                  />
                  {errors.full_name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.full_name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    {t("admin.users.edit.email") || "Email"}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className={`w-full px-4 py-2.5 rounded-lg border ${
                      errors.email
                        ? "border-red-500 focus:ring-red-500"
                        : "border-primary-200 dark:border-primary-700 focus:ring-primary-500"
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent transition-colors`}
                    placeholder={
                      t("admin.users.edit.emailPlaceholder") ||
                      "user@example.com"
                    }
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    {t("admin.users.edit.phone") || "Phone"}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className={`w-full px-4 py-2.5 rounded-lg border ${
                      errors.phone
                        ? "border-red-500 focus:ring-red-500"
                        : "border-primary-200 dark:border-primary-700 focus:ring-primary-500"
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent transition-colors`}
                    placeholder={
                      t("admin.users.edit.phonePlaceholder") ||
                      "+84 123 456 789"
                    }
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Avatar URL */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    {t("admin.users.edit.avatarUrl") || "Avatar URL"}
                  </label>
                  <input
                    type="url"
                    value={formData.avatar_url}
                    onChange={(e) =>
                      setFormData({ ...formData, avatar_url: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-primary-200 dark:border-primary-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - 1 column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Role & Status */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                {t("admin.users.edit.roleStatus") || "Role & Status"}
              </h3>

              <div className="space-y-4">
                {/* Role Select */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    {t("admin.users.edit.role") || "Role"}
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) =>
                      setSelectedRole(e.target.value as UserRole)
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-primary-200 dark:border-primary-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  >
                    {USER_ROLES.map((role) => (
                      <option key={role.value} value={role.value}>
                        {t(`admin.users.roles.${role.value}`) || role.label}
                      </option>
                    ))}
                  </select>
                  {selectedRole !== user.role && (
                    <p className="mt-2 text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {t("admin.users.edit.roleWillChange") ||
                        "Role will be changed"}
                    </p>
                  )}
                </div>

                {/* Active Status */}
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_active: e.target.checked,
                        })
                      }
                      className="w-5 h-5 rounded border-primary-300 text-primary-600 focus:ring-primary-500"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {t("admin.users.edit.activeAccount") ||
                          "Active Account"}
                      </div>
                      <div className="text-xs text-secondary-600 dark:text-secondary-400">
                        {t("admin.users.edit.activeAccountDesc") ||
                          "User can login and access the system"}
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* User Info Card */}
            <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-200 dark:border-primary-700 p-6">
              <h4 className="text-sm font-semibold text-primary-700 dark:text-primary-300 mb-3">
                {t("admin.users.edit.currentInfo") || "Current Information"}
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-secondary-600 dark:text-secondary-400">
                    {t("admin.users.edit.username") || "Username"}:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {user.username}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600 dark:text-secondary-400">
                    {t("admin.users.edit.currentRole") || "Current Role"}:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white capitalize">
                    {user.role}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600 dark:text-secondary-400">
                    {t("admin.users.edit.createdAt") || "Created"}:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString()
                      : "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse md:flex-row justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={handleCancel}
            disabled={saving}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
            <span>{t("common.cancel") || "Cancel"}</span>
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{t("common.saving") || "Saving..."}</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>{t("common.save") || "Save Changes"}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
