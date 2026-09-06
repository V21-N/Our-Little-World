import { db } from "@/lib/db";
import { achievements, userAchievements } from "@/lib/db/schema";
import { ok, handleError, requireCoupleMembership, daysBetween } from "@/lib/api/helpers";
import { eq, count } from "drizzle-orm";
import { checkAchievementsTrigger, listAchievements } from "@/lib/services/achievements";

export async function GET(request: Request) {
  try {
    const { couple } = await requireCoupleMembership(request);

    await checkAchievementsTrigger(couple.id, "days_together", "auto");
    await checkAchievementsTrigger(couple.id, "memory_count", "auto");
    await checkAchievementsTrigger(couple.id, "trip_count", "auto");
    await checkAchievementsTrigger(couple.id, "bucket_completed", "auto");

    const data = await listAchievements(couple.id);
    const unlocked = data.filter((a) => a.isUnlocked);

    return ok({ all: data, unlocked, total: data.length, unlockedCount: unlocked.length });
  } catch (e) {
    return handleError(e);
  }
}