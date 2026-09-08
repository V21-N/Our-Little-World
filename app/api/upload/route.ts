import { NextRequest } from "next/server";
import { ok, fail, handleError, requireUser } from "@/lib/api/helpers";
import { randomUUID } from "crypto";
import { uploadImage } from "@/lib/storage";
import sharp from "sharp";

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
    if (!file.type.startsWith("image/") && !/\.(jpe?g|png|webp|gif|bmp|tiff?|hei[cf])$/i.test(file.name)) {
      return fail("Unsupported file type", "INVALID_TYPE", 400);
    }

    const input = Buffer.from(await file.arrayBuffer());
    let output = await sharp(input).rotate().jpeg({ quality: 85, mozjpeg: true }).toBuffer();
    while (output.length > MAX_SIZE) {
      output = await sharp(output)
        .resize({ width: 3200, height: 3200, fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 75, mozjpeg: true })
        .toBuffer();
      if (output.length > MAX_SIZE && output.length >= input.length) break;
    }
    if (output.length > MAX_SIZE) return fail("Foto terlalu besar setelah dikompres", "FILE_TOO_LARGE", 400);

    const filename = `${randomUUID()}.jpg`;
    const storagePath = `${entity}/${scopeId}/${filename}`;
    const uploaded = await uploadImage(
      storagePath,
      output,
      "image/jpeg",
    );

    return ok({ path: uploaded.path, url: uploaded.url }, 201);
  } catch (e) {
    if (e instanceof Error && e.message.startsWith("Supabase Storage")) {
      return fail(e.message, "STORAGE_NOT_CONFIGURED", 503);
    }
    return handleError(e);
  }
}