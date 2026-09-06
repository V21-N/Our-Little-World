import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { memories } from "@/lib/db/schema";
import { ok, fail, handleError, requireCoupleMembership } from "@/lib/api/helpers";
import { eq, and } from "drizzle-orm";
import { getMemoryById } from "@/lib/services/memories";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { couple } = await requireCoupleMembership(request);
    const memory = await getMemoryById(id);
    if (!memory || memory.coupleId !== couple.id) {
      return fail("Memory not found", "NOT_FOUND", 404);
    }
    return ok(memory);
  } catch (e) {
    return handleError(e);
  }
}

const updateMemorySchema = z.object({
  caption: z.string().max(500).optional(),
  memoryDate: z.string().min(1).optional(),
  location: z.string().max(200).optional(),
  category: z.enum(["date", "trip", "food", "random", "celebration", "special_moment"]).optional(),
  isFavorite: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { couple, userId } = await requireCoupleMembership(request);
    const memory = await db.query.memories.findFirst({
      where: and(eq(memories.id, id), eq(memories.coupleId, couple.id)),
    });

    if (!memory) return fail("Memory not found", "NOT_FOUND", 404);
    if (memory.createdBy !== userId) return fail("Not allowed to edit this memory", "FORBIDDEN", 403);

    const body = await request.json();
    const data = updateMemorySchema.parse(body);

    await db
      .update(memories)
      .set({
        caption: data.caption,
        memoryDate: data.memoryDate,
        location: data.location,
        category: data.category,
        isFavorite: data.isFavorite,
        tags: data.tags,
        updatedAt: new Date(),
      })
      .where(eq(memories.id, id));

    const updated = await getMemoryById(id);
    return ok(updated);
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { couple, userId } = await requireCoupleMembership(request);
    const memory = await db.query.memories.findFirst({
      where: and(eq(memories.id, id), eq(memories.coupleId, couple.id)),
    });

    if (!memory) return fail("Memory not found", "NOT_FOUND", 404);
    if (memory.createdBy !== userId) return fail("Not allowed to delete this memory", "FORBIDDEN", 403);

    await db.delete(memories).where(eq(memories.id, id));
    return ok({ id, deleted: true });
  } catch (e) {
    return handleError(e);
  }
}