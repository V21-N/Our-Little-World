"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch, ApiOk, ApiErr } from "@/lib/api/client";

export function useApiData<T>(
  path: string | null,
  options?: RequestInit
): { data: T | null; loading: boolean; error: string | null; reload: () => void } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!path) return;
    setLoading(true);
    setError(null);
    const result = await apiFetch<T>(path, options);
    if ("success" in result && result.success) {
      setData(result.data);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, [path, JSON.stringify(options)]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, reload: fetchData };
}

export function useAction<T>(
  path: string,
  options?: RequestInit
): {
  execute: (body?: unknown) => Promise<T | null>;
  loading: boolean;
  error: string | null;
  data: T | null;
  reset: () => void;
} {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(
    async (body?: unknown) => {
      setLoading(true);
      setError(null);
      const result = await apiFetch<T>(path, {
        method: "POST",
        body: body ? JSON.stringify(body) : undefined,
        ...options,
      });
      setLoading(false);
      if ("success" in result && result.success) {
        setData(result.data);
        return result.data;
      }
      setError(result.error);
      return null;
    },
    [path, JSON.stringify(options)]
  );

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return { execute, loading, error, data, reset };
}

export function useMutation<T>(
  path: string,
  method: "PATCH" | "DELETE" = "PATCH"
): {
  execute: (body?: unknown) => Promise<T | null>;
  loading: boolean;
  error: string | null;
  data: T | null;
  reset: () => void;
} {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(
    async (body?: unknown) => {
      setLoading(true);
      setError(null);
      const result = await apiFetch<T>(path, {
        method,
        body: body ? JSON.stringify(body) : undefined,
      });
      setLoading(false);
      if ("success" in result && result.success) {
        setData(result.data);
        return result.data;
      }
      setError(result.error);
      return null;
    },
    [path, method]
  );

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return { execute, loading, error, data, reset };
}