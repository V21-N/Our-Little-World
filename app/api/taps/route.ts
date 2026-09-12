import { db } from "@/lib/db";
import { taps } from "@/lib/db/schema";
import { ok, handleError, requireCoupleMembership } from "@/lib/api/helpers";
import { eq, and, ne, desc } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const { couple, userId } = await requireCoupleMembership(request);

    await db.insert(taps).values({
      coupleId: couple.id,
      fromId: userId,
    });

    return ok({ ok: true }, 201);
  } catch (e) {
    return handleError(e);
  }
}

export async function GET(request: Request) {
  try {
    const { couple, userId } = await requireCoupleMembership(request);

    const unseen = await db
      .select()
      .from(taps)
      .where(
        and(eq(taps.coupleId, couple.id), ne(taps.fromId, userId), eq(taps.seen, false)),
      )
      .orderBy(desc(taps.createdAt))
      .limit(20);

    if (unseen.length > 0) {
      const ids = unseen.map((t) => t.id);
      await db
        .update(taps)
        .set({ seen: true })
        .where(and(eq(taps.coupleId, couple.id), ...ids.map((id) => eq(taps.id, id))));
    }

    return ok({ count: unseen.length, latest: unseen[0] ?? null });
  } catch (e) {
    return handleError(e);
  }
}