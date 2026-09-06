import { NextRequest } from "next/server";
import { ok, fail, handleError, requireUser } from "@/lib/api/helpers";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

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
    const relPath = `uploads/${entity}/${scopeId}/${filename}`;
    const storageDir = join(process.cwd(), "public", "uploads", entity, scopeId);

    await mkdir(storageDir, { recursive: true });
    await writeFile(join(storageDir, filename), Buffer.from(await file.arrayBuffer()));

    return ok({ path: relPath, url: `/${relPath.replace(/\\/g, "/")}` }, 201);
  } catch (e) {
    return handleError(e);
  }
}