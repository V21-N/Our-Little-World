import { NextRequest } from "next/server";
import { ok, fail, handleError, requireUser } from "@/lib/api/helpers";
import { randomUUID } from "crypto";
import { uploadImage } from "@/lib/storage";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_SIZE = 8 * 1024 * 1024;
const ENTITIES = new Set(["memories", "timeline", "letters", "avatars", "couple-covers"]);

export async function POST(request: NextRequest) {
  try {
    await requireUser(request);

    const formData = await request.formData();
    const file = formData.get("file");
    const entity = formData.get("entity")?.toString();
    const scopeId = formData.get("scopeId")?.toString();

    if (!(file instanceof File)) return fail("No file provided", "NO_FILE", 400);
    if (!entity || !ENTITIES.has(entity)) return fail("Invalid entity", "INVALID_ENTITY", 400);
    if (!scopeId) return fail("Missing scopeId", "MISSING_SCOPE", 400);
    if (!ALLOWED_MIME_TYPES.has(file.type)) return fail("Unsupported file type", "INVALID_TYPE", 400);
    if (file.size > MAX_SIZE) return fail("File too large (max 8MB)", "FILE_TOO_LARGE", 400);

    const ext = file.type === "image/png" ? ".png" : file.type === "image/webp" ? ".webp" : ".jpg";
    const filename = `${randomUUID()}${ext}`;
    const storagePath = `${entity}/${scopeId}/${filename}`;
    const uploaded = await uploadImage(
      storagePath,
      Buffer.from(await file.arrayBuffer()),
      file.type,
    );

    return ok({ path: uploaded.path, url: uploaded.url }, 201);
  } catch (e) {
    if (e instanceof Error && e.message.startsWith("Supabase Storage")) {
      return fail(e.message, "STORAGE_NOT_CONFIGURED", 503);
    }
    return handleError(e);
  }
}