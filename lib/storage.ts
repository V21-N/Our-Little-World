import "server-only";
import { createClient } from "@supabase/supabase-js";

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? "media";

function getStorageClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Supabase Storage is not configured");
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function ensureBucket() {
  const supabase = getStorageClient();
  const existing = await supabase.storage.getBucket(BUCKET);
  if (!existing.error) return supabase;

  const created = await supabase.storage.createBucket(BUCKET, {
    public: false,
    fileSizeLimit: "8MB",
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  });
  if (created.error) throw created.error;
  return supabase;
}

export async function uploadImage(
  path: string,
  body: Buffer,
  contentType: string,
) {
  const supabase = await ensureBucket();
  const result = await supabase.storage.from(BUCKET).upload(path, body, {
    contentType,
    cacheControl: "31536000",
    upsert: false,
  });
  if (result.error) throw result.error;

  const signed = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60);
  if (signed.error || !signed.data?.signedUrl) {
    throw signed.error ?? new Error("Could not create image URL");
  }

  return { path, url: signed.data.signedUrl };
}

export async function getImageUrl(path: string) {
  if (path.startsWith("uploads/")) return `/${path.replace(/\\/g, "/")}`;

  const supabase = getStorageClient();
  const signed = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60);
  if (signed.error || !signed.data?.signedUrl) {
    throw signed.error ?? new Error("Could not create image URL");
  }
  return signed.data.signedUrl;
}
