import { z } from "zod";
import { db } from "@/lib/db";
import { memories, memoryImages } from "@/lib/db/schema";
import { ok, handleError, requireCoupleMembership } from "@/lib/api/helpers";
import { eq } from "drizzle-orm";
import { listMemories, getMemoryById } from "@/lib/services/memories";
import { checkAchievementsTrigger } from "@/lib/services/achievements";

const createMemorySchema = z.object({
  caption: z.string().max(500).optional(),
  memoryDate: z.string().min(1),
  location: z.string().max(200).optional(),
  category: z.enum(["date", "trip", "food", "random", "celebration", "special_moment"]).default("random"),
  isFavorite: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  images: z.array(z.object({ storagePath: z.string().min(1) })).min(1).max(10),
});

export async function GET(request: Request) {
  try {
    const { couple } = await requireCoupleMembership(request);
    const url = new URL(request.url);
    const data = await listMemories({
      coupleId: couple.id,
      orderBy: url.searchParams.get("orderBy") ?? "date",
      category: url.searchParams.get("category") ?? undefined,
      favorite: url.searchParams.get("favorite") === "true" ? true : undefined,
      search: url.searchParams.get("search") ?? undefined,
      cursor: url.searchParams.get("cursor") ?? undefined,
      limit: url.searchParams.get("limit") ? Number(url.searchParams.get("limit")) : 12,
    });
    return ok(data);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(request: Request) {
  try {
    const { couple, userId } = await requireCoupleMembership(request);
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return ok(null, 500);
    }
    const parsed = createMemorySchema.safeParse(body);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return ok(null, 500);
    }
    const data = parsed.data;

    const memory = await db.transaction(async (tx) => {
      const newMemory = await tx
        .insert(memories)
        .values({
          coupleId: couple.id,
          createdBy: userId,
          caption: data.caption ?? null,
          memoryDate: data.memoryDate,
          location: data.location ?? null,
          category: data.category,
          isFavorite: data.isFavorite,
          tags: data.tags,
        })
        .returning()
        .then((r) => r[0]);

      await tx.insert(memoryImages).values(
        data.images.map((img, idx) => ({
          memoryId: newMemory.id,
          storagePath: img.storagePath,
          position: idx,
        }))
      );
      return newMemory;
    });

    await checkAchievementsTrigger(couple.id, "memory_count", userId);

    const full = await getMemoryById(memory.id);
    return ok(full, 201);
  } catch (e) {
    return handleError(e);
  }
}