import { db } from "@/lib/db";
import { loveLetters, userAchievements } from "@/lib/db/schema";
import { ok, handleError, requireCoupleMembership } from "@/lib/api/helpers";
import { eq, and, gt, ne, sql } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { couple, userId } = await requireCoupleMembership(request);
    const now = new Date();

    const [letters, recentAchievements] = await Promise.all([
      db
        .select({ id: loveLetters.id })
        .from(loveLetters)
        .where(
          and(
            eq(loveLetters.coupleId, couple.id),
            ne(loveLetters.senderId, userId),
            eq(loveLetters.isRead, false),
            sql`(${loveLetters.unlockAt} IS NULL OR ${loveLetters.unlockAt} <= ${now})`,
          ),
        ),
      db
        .select({ id: userAchievements.id })
        .from(userAchievements)
        .where(
          and(
            eq(userAchievements.coupleId, couple.id),
            gt(userAchievements.unlockedAt, sql`${now} - interval '24 hours'`),
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