import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { timelineEvents } from "@/lib/db/schema";
import { ok, fail, handleError, requireCoupleMembership } from "@/lib/api/helpers";
import { eq, and } from "drizzle-orm";

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  eventDate: z.string().min(1).optional(),
  description: z.string().max(2000).optional(),
  imageUrl: z.string().url().optional(),
  location: z.string().max(200).optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { couple, userId } = await requireCoupleMembership(request);
    const event = await db.query.timelineEvents.findFirst({
      where: and(eq(timelineEvents.id, id), eq(timelineEvents.coupleId, couple.id)),
    });

    if (!event) return fail("Event not found", "NOT_FOUND", 404);
    if (event.createdBy !== userId) return fail("Not allowed to edit this event", "FORBIDDEN", 403);

    const body = await request.json();
    const data = updateSchema.parse(body);

    const updated = await db
      .update(timelineEvents)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(timelineEvents.id, id))
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
    const event = await db.query.timelineEvents.findFirst({
      where: and(eq(timelineEvents.id, id), eq(timelineEvents.coupleId, couple.id)),
    });

    if (!event) return fail("Event not found", "NOT_FOUND", 404);
    if (event.createdBy !== userId) return fail("Not allowed to delete this event", "FORBIDDEN", 403);

    await db.delete(timelineEvents).where(eq(timelineEvents.id, id));
    return ok({ id, deleted: true });
  } catch (e) {
    return handleError(e);
  }
}