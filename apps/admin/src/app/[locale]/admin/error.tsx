// ./src/app/[locale]/(public)/error.tsx
"use client";

import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ArticleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // const t = (key: string, defaultText: string) => defaultText;
  const { t } = useLanguage();

  useEffect(() => {
    console.error("Error:", error);
  }, [error]);

  // Chuỗi văn bản được thay thế bằng cú pháp t()
  const errorTitle = t("error.loadTitle", "Failed to load the admin function.");
  const errorMessage = t("error.loadMessage", "Please try again later.");
  const commandReturn = t("error.loadReturn", "Return to the admin list");

  return (
    <div className="w-full min-h-screen flex items-center justify-center">
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-red-600 mb-4">{errorTitle}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{errorMessage}</p>
        <a
          href={`/admin`}
          className="text-primary-600 hover:text-primary-700 underline"
        >
          {commandReturn}
        </a>
      </div>
    </div>
  );
}
