import { db } from "@/lib/db";
import { presence } from "@/lib/db/schema";
import { ok, handleError, requireCoupleMembership } from "@/lib/api/helpers";
import { eq } from "drizzle-orm";

const ONLINE_WINDOW = 60_000;

export async function POST(request: Request) {
  try {
    const { couple, userId } = await requireCoupleMembership(request);
    const body = await request.json().catch(() => ({}));
    const lastPage =
      typeof body.lastPage === "string" ? body.lastPage.slice(0, 200) : null;

    const now = new Date();
    await db
      .insert(presence)
      .values({
        userId,
        coupleId: couple.id,
        lastPage,
        lastSeenAt: now,
      })
      .onConflictDoUpdate({
        target: presence.userId,
        set: { lastPage, lastSeenAt: now },
      });

    return ok({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}

export async function GET(request: Request) {
  try {
    const { couple, userId } = await requireCoupleMembership(request);
    const cutoff = new Date(Date.now() - ONLINE_WINDOW);

    const rows = await db
      .select()
      .from(presence)
      .where(eq(presence.coupleId, couple.id));

    const online = rows.filter((r) => r.lastSeenAt > cutoff);
    const partner = online.find((r) => r.userId !== userId);
    const me = online.find((r) => r.userId === userId);

    return ok({
      partnerOnline: Boolean(partner),
      partnerPage: partner?.lastPage ?? null,
      myOnline: Boolean(me),
    });
  } catch (e) {
    return handleError(e);
  }
}