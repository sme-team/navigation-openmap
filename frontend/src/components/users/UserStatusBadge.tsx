// ./src/app/components/users/UserStatusBadge.tsx
"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { CheckCircle, XCircle } from "lucide-react";

interface UserStatusBadgeProps {
  isActive: boolean;
}

export default function UserStatusBadge({ isActive }: UserStatusBadgeProps) {
  const { t } = useLanguage("users");

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium status-badge ${
        isActive
          ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300"
          : "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300"
      }`}
    >
      {isActive ? (
        <>
          <CheckCircle className="w-3.5 h-3.5" />
          {t("admin.users.status.active") || "Active"}
        </>
      ) : (
        <>
          <XCircle className="w-3.5 h-3.5" />
          {t("admin.users.status.inactive") || "Inactive"}
        </>
      )}
    </span>
  );
}

