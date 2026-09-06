import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { bucketListItems } from "@/lib/db/schema";
import { ok, fail, handleError, requireCoupleMembership } from "@/lib/api/helpers";
import { eq, and } from "drizzle-orm";
import { checkAchievementsTrigger } from "@/lib/services/achievements";

const CATEGORIES = ["travel", "food", "experience", "milestone", "learning", "home", "other"] as const;

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  category: z.enum(CATEGORIES).optional(),
  targetDate: z.string().optional(),
  status: z.enum(["planned", "in_progress", "completed"]).optional(),
  imageUrl: z.string().url().optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { couple, userId } = await requireCoupleMembership(request);
    const item = await db.query.bucketListItems.findFirst({
      where: and(eq(bucketListItems.id, id), eq(bucketListItems.coupleId, couple.id)),
    });

    if (!item) return fail("Bucket item not found", "NOT_FOUND", 404);

    const body = await request.json();
    const data = updateSchema.parse(body);

    const setObj: Record<string, unknown> = { ...data, updatedAt: new Date() };
    if (data.status === "completed") {
      setObj.completedDate = item.completedDate ?? new Date().toISOString().slice(0, 10);
    } else if (data.status) {
      setObj.completedDate = null;
    }

    const updated = await db
      .update(bucketListItems)
      .set(setObj)
      .where(eq(bucketListItems.id, id))
      .returning()
      .then((r) => r[0]);

    if (data.status === "completed") {
      await checkAchievementsTrigger(couple.id, "bucket_completed", userId);
    }

    return ok(updated);
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { couple, userId } = await requireCoupleMembership(request);
    const item = await db.query.bucketListItems.findFirst({
      where: and(eq(bucketListItems.id, id), eq(bucketListItems.coupleId, couple.id)),
    });

    if (!item) return fail("Bucket item not found", "NOT_FOUND", 404);
    if (item.createdBy !== userId) return fail("Not allowed to delete this item", "FORBIDDEN", 403);

    await db.delete(bucketListItems).where(eq(bucketListItems.id, id));
    return ok({ id, deleted: true });
  } catch (e) {
    return handleError(e);
  }
}