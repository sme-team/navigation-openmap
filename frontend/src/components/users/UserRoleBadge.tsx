// ./src/app/components/users/UserRoleBadge.tsx
"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import type { UserRole } from "@/types/api.types";

import { Shield, Crown, Users, User, Eye } from "lucide-react";

interface UserRoleBadgeProps {
  role: UserRole;
}

const ROLE_CONFIG: Record<
  UserRole,
  { icon: any; color: string; label: string }
> = {
  superadmin: {
    icon: Crown,
    color: "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300",
    label: "Super Admin",
  },
  admin: {
    icon: Shield,
    color: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300",
    label: "Admin",
  },
  manager: {
    icon: Users,
    color: "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300",
    label: "Manager",
  },
  staff: {
    icon: User,
    color: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
    label: "Staff",
  },
  editor: {
    icon: User,
    color: "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300",
    label: "Editor",
  },
  author: {
    icon: User,
    color: "bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300",
    label: "Author",
  },
  moderator: {
    icon: Shield,
    color: "bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300",
    label: "Moderator",
  },
  viewer: {
    icon: Eye,
    color: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300",
    label: "Viewer",
  },
  guest: {
    icon: User,
    color: "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300",
    label: "Guest",
  },
};

export default function UserRoleBadge({ role }: UserRoleBadgeProps) {
  const { t } = useLanguage("users");
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.guest;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium status-badge ${config.color}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {t(`admin.users.roles.${role}`) || config.label}
    </span>
  );
}