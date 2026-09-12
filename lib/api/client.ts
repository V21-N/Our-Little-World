"use client";

import { prepareImageUpload } from "@/lib/image-upload";

export type ApiOk<T> = { success: true; data: T };
export type ApiErr = { success: false; error: string; code?: string };
export type ApiFetchOptions = RequestInit & { revalidate?: boolean };

const GET_CACHE_TTL = 15_000;
const cacheStore = new Map<string, { until: number; result: ApiOk<unknown> | ApiErr }>();

export async function apiFetch<T>(
  path: string,
  options?: ApiFetchOptions
): Promise<ApiOk<T> | ApiErr> {
  const method = (options?.method ?? "GET").toUpperCase();
  const revalidate = (options as ApiFetchOptions | undefined)?.revalidate === true;

  if (method === "GET" && !revalidate) {
    const hit = cacheStore.get(path);
    if (hit && hit.until > Date.now()) return hit.result as ApiOk<T>;
  }

  const { revalidate: _drop, cache: cacheOpt, ...fetchOptions } = options ?? {};

  const res = await fetch(path, {
    cache: method === "GET" && !revalidate ? "default" : "no-store",
    ...fetchOptions,
    headers: {
      "Content-Type": "application/json",
      ...(fetchOptions.headers ?? {}),
    },
  });

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    return { success: false, error: "Unexpected response", code: "PARSE_ERROR" };
  }

  if (!res.ok || (body as ApiErr).success === false) {
    const err = body as ApiErr;
    return { success: false, error: err.error ?? `Request failed (${res.status})`, code: err.code };
  }

  const result = { success: true, data: (body as ApiOk<T>).data as T } as ApiOk<T> | ApiErr;

  if (method === "GET" && !revalidate) {
    cacheStore.set(path, { until: Date.now() + GET_CACHE_TTL, result: result as ApiOk<unknown> });
  } else {
    cacheStore.clear();
  }

  return result;
}

export async function uploadFile(
  file: File,
  entity: string,
  scopeId: string
): Promise<{ success: boolean; url?: string; path?: string; error?: string }> {
  let preparedFile: File;
  try {
    preparedFile = await prepareImageUpload(file);
  } catch {
    return { success: false, error: "Format foto tidak dapat diproses" };
  }

  const formData = new FormData();
  formData.append("file", preparedFile);
  formData.append("entity", entity);
  formData.append("scopeId", scopeId);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    return { success: false, error: "Upload failed" };
  }

  if (!res.ok || (body as { success?: boolean }).success !== true) {
    return {
      success: false,
      error: (body as { error?: string }).error ?? "Upload failed",
    };
  }

  const data = (body as { data: { url: string; path: string } }).data;
  return { success: true, url: data.url, path: data.path };
}