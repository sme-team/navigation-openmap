// src/hooks/useApi.ts
import { useState, useEffect, useCallback } from "react";
import { getErrorMessage } from "@/utils/api-helpers";

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  refetch: () => Promise<void>;
  reset: () => void;
}

export function useApi<T>(
  apiFunction: () => Promise<T>,
  options: {
    immediate?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
  } = {}
): UseApiReturn<T> {
  const { immediate = true, onSuccess, onError } = options;

  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const data = await apiFunction();
      setState({ data, loading: false, error: null });
      onSuccess?.(data);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setState({ data: null, loading: false, error: errorMessage });
      onError?.(errorMessage);
    }
  }, [apiFunction, onSuccess, onError]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  // ✅ Effect chỉ chạy 1 lần khi mount (nếu immediate = true)
  useEffect(() => {
    if (immediate) {
      fetchData();
    }
     
  }, [immediate, fetchData]);

  return {
    ...state,
    refetch: fetchData,
    reset,
  };
}
