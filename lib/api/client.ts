"use client";

export type ApiOk<T> = { success: true; data: T };
export type ApiErr = { success: false; error: string; code?: string };

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<ApiOk<T> | ApiErr> {
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
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

  return { success: true, data: (body as ApiOk<T>).data as T };
}

export async function uploadFile(
  file: File,
  entity: string,
  scopeId: string
): Promise<{ success: boolean; url?: string; path?: string; error?: string }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("entity", entity);
  formData.append("scopeId", scopeId);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  let body: any = null;
  try {
    body = await res.json();
  } catch {
    return { success: false, error: "Upload failed" };
  }

  if (!res.ok || body.success !== true) {
    return { success: false, error: body.error ?? "Upload failed" };
  }

  return { success: true, url: body.data.url, path: body.data.path };
}