// ============================================
// 3. CLIENT-SIDE HOOK: hooks/useVersion.ts
// ============================================
"use client";
import { useEffect, useState } from "react";

interface VersionInfo {
  version: string;
  buildDate: string;
  commitSha: string;
  environment: string;
}

export function useVersion() {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/version")
      .then((res) => res.json())
      .then((data) => {
        setVersionInfo(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { versionInfo, loading, error };
}