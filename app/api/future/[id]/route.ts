import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { futureItems } from "@/lib/db/schema";
import { ok, fail, handleError, requireCoupleMembership } from "@/lib/api/helpers";
import { eq, and } from "drizzle-orm";

const CATEGORIES = ["dream", "goal", "place", "promise", "letter", "other"] as const;

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  category: z.enum(CATEGORIES).optional(),
  targetDate: z.string().optional(),
  unlockDate: z.string().optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { couple, userId } = await requireCoupleMembership(request);

    const item = await db.query.futureItems.findFirst({
      where: and(eq(futureItems.id, id), eq(futureItems.coupleId, couple.id)),
    });

    if (!item) return fail("Future item not found", "NOT_FOUND", 404);
    if (item.createdBy !== userId) return fail("Not allowed to edit this item", "FORBIDDEN", 403);
    if (item.unlockDate && new Date(item.unlockDate) <= new Date()) {
      return fail("Item already unlocked and read-only", "READ_ONLY", 403);
    }

    const body = await request.json();
    const data = updateSchema.parse(body);

    const updated = await db
      .update(futureItems)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(futureItems.id, id))
      .returning()
      .then((r) => r[0]);

    return ok(updated);
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { couple, userId } = await requireCoupleMembership(request);

    const item = await db.query.futureItems.findFirst({
      where: and(eq(futureItems.id, id), eq(futureItems.coupleId, couple.id)),
    });

    if (!item) return fail("Future item not found", "NOT_FOUND", 404);
    if (item.createdBy !== userId) return fail("Not allowed to delete this item", "FORBIDDEN", 403);
    if (item.unlockDate && new Date(item.unlockDate) <= new Date()) {
      return fail("Item already unlocked and read-only", "READ_ONLY", 403);
    }

    await db.delete(futureItems).where(eq(futureItems.id, id));
    return ok({ id, deleted: true });
  } catch (e) {
    return handleError(e);
  }
}