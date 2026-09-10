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
  if (!existing.error) {
    if (!existing.data.public) {
      await supabase.storage.updateBucket(BUCKET, { public: true });
    }
    return supabase;
  }
  const created = await supabase.storage.createBucket(BUCKET, { public: true });
  if (created.error) {
    throw new Error(`Gagal membuat bucket Supabase Storage '${BUCKET}': ${created.error.message}`);
  }
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
    upsert: true,
  });
  if (result.error) throw result.error;

  // Menggunakan getPublicUrl agar URL bersifat permanen selamanya (bukan signed URL)
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return { path, url: data.publicUrl };
}

export async function getImageUrl(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("uploads/")) return `/${path.replace(/\\/g, "/")}`;

  const supabase = getStorageClient();
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}