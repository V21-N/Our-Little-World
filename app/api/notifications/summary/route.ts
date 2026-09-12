import { db } from "@/lib/db";
import { loveLetters, userAchievements, profiles } from "@/lib/db/schema";
import { ok, handleError, requireCoupleMembership } from "@/lib/api/helpers";
import { eq, and, gt, ne, or, isNull, lte } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { couple, userId } = await requireCoupleMembership(request);
    const now = new Date();

    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.id, userId),
    });
    const seenAt = profile?.notificationsSeenAt ?? new Date(0);

    const [letters, recentAchievements] = await Promise.all([
      db
        .select({ id: loveLetters.id })
        .from(loveLetters)
        .where(
          and(
            eq(loveLetters.coupleId, couple.id),
            ne(loveLetters.senderId, userId),
            eq(loveLetters.isRead, false),
            gt(loveLetters.createdAt, seenAt),
            or(isNull(loveLetters.unlockAt), lte(loveLetters.unlockAt, now)),
          ),
        ),
      db
        .select({ id: userAchievements.id })
        .from(userAchievements)
        .where(
          and(
            eq(userAchievements.coupleId, couple.id),
            gt(userAchievements.unlockedAt, seenAt),
          ),
        ),
    ]);

    return ok({
      unreadLetters: letters.length,
      newAchievements: recentAchievements.length,
      total: letters.length + recentAchievements.length,
    });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await requireCoupleMembership(request);
    await db
      .update(profiles)
      .set({ notificationsSeenAt: new Date(), updatedAt: new Date() })
      .where(eq(profiles.id, userId));

    return ok({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}