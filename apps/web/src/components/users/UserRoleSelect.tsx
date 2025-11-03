// ./src/app/components/users/UserRoleSelect.tsx
"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { UserRole } from "@/types/api.types";
import { Crown, Shield, Users, User, Eye, ChevronDown } from "lucide-react";

interface UserRoleSelectProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
  disabled?: boolean;
}

const ROLE_HIERARCHY: {
  value: UserRole;
  label: string;
  icon: any;
  color: string;
  description: string;
  level: number;
}[] = [
  {
    value: "superadmin",
    label: "Super Admin",
    icon: Crown,
    color: "text-purple-600 dark:text-purple-400",
    description: "Full system access with all permissions",
    level: 9,
  },
  {
    value: "admin",
    label: "Admin",
    icon: Shield,
    color: "text-red-600 dark:text-red-400",
    description: "Administrative access to manage users and content",
    level: 8,
  },
  {
    value: "manager",
    label: "Manager",
    icon: Users,
    color: "text-orange-600 dark:text-orange-400",
    description: "Manage content and moderate users",
    level: 7,
  },
  {
    value: "staff",
    label: "Staff",
    icon: User,
    color: "text-blue-600 dark:text-blue-400",
    description: "Staff member with basic management rights",
    level: 6,
  },
  {
    value: "editor",
    label: "Editor",
    icon: User,
    color: "text-indigo-600 dark:text-indigo-400",
    description: "Edit and publish content",
    level: 5,
  },
  {
    value: "author",
    label: "Author",
    icon: User,
    color: "text-cyan-600 dark:text-cyan-400",
    description: "Create and manage own content",
    level: 4,
  },
  {
    value: "moderator",
    label: "Moderator",
    icon: Shield,
    color: "text-teal-600 dark:text-teal-400",
    description: "Moderate comments and user-generated content",
    level: 3,
  },
  {
    value: "viewer",
    label: "Viewer",
    icon: Eye,
    color: "text-gray-600 dark:text-gray-400",
    description: "View-only access",
    level: 2,
  },
  {
    value: "guest",
    label: "Guest",
    icon: User,
    color: "text-slate-600 dark:text-slate-400",
    description: "Limited guest access",
    level: 1,
  },
];

export default function UserRoleSelect({
  value,
  onChange,
  disabled = false,
}: UserRoleSelectProps) {
  const { t } = useLanguage("users");
  const [isOpen, setIsOpen] = useState(false);

  const currentRole = ROLE_HIERARCHY.find((r) => r.value === value);
  const Icon = currentRole?.icon || User;

  return (
    <div className="relative">
      {/* Selected Role Display */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border border-primary-200 dark:border-primary-700 bg-white dark:bg-gray-700 transition-all ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:border-primary-400 dark:hover:border-primary-500 cursor-pointer"
        } ${isOpen ? "ring-2 ring-primary-500" : ""}`}
      >
        <div className="flex items-center gap-3">
          <Icon className={`w-5 h-5 ${currentRole?.color}`} />
          <div className="text-left">
            <div className="font-medium text-gray-900 dark:text-white">
              {t(`admin.users.roles.${value}`) || currentRole?.label}
            </div>
            <div className="text-xs text-secondary-600 dark:text-secondary-400">
              {t(`admin.users.roles.${value}_desc`) || currentRole?.description}
            </div>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-secondary-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Options List */}
          <div className="absolute z-20 mt-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-primary-200 dark:border-primary-700 py-2 max-h-96 overflow-y-auto animate-slide-down">
            {ROLE_HIERARCHY.map((role) => {
              const RoleIcon = role.icon;
              const isSelected = role.value === value;

              return (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => {
                    onChange(role.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors ${
                    isSelected
                      ? "bg-primary-100 dark:bg-primary-900/40"
                      : ""
                  }`}
                >
                  <RoleIcon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${role.color}`} />
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {t(`admin.users.roles.${role.value}`) || role.label}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300">
                        L{role.level}
                      </span>
                    </div>
                    <p className="text-xs text-secondary-600 dark:text-secondary-400 mt-1">
                      {t(`admin.users.roles.${role.value}_desc`) || role.description}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-primary-600 dark:bg-primary-400 mt-2" />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}