import "server-only";
import { db } from "@/lib/db";
import { achievements, userAchievements, couples, memories, bucketListItems } from "@/lib/db/schema";
import { eq, and, count } from "drizzle-orm";
import { daysBetween } from "@/lib/api/helpers";

export async function evaluateTrigger(coupleId: string, triggerType: string, userId: string) {
  const allAchievements = await db.select().from(achievements).where(eq(achievements.triggerType, triggerType));
  if (allAchievements.length === 0) return;

  const couple = await db.query.couples.findFirst({ where: eq(couples.id, coupleId) });
  if (!couple) return;

  const unlocked = await db.select({ achievementId: userAchievements.achievementId }).from(userAchievements).where(eq(userAchievements.coupleId, coupleId));
  const unlockedSet = new Set(unlocked.map((u) => u.achievementId));
  const toUnlock: string[] = [];

  for (const ach of allAchievements) {
    if (unlockedSet.has(ach.id)) continue;
    const value = ach.triggerValue as Record<string, any>;
    let met = false;

    if (triggerType === "days_together") {
      const start = new Date(couple.relationshipStartDate);
      const diff = daysBetween(start, new Date());
      if (value.isAnniversary && value.isAnniversary === true) {
        const now = new Date();
        met = start.getUTCFullYear() < now.getUTCFullYear() && now.getUTCMonth() === start.getUTCMonth() && now.getUTCDate() === start.getUTCDate();
      } else {
        met = diff >= (value.days ?? 0);
      }
    } else if (triggerType === "memory_count") {
      const r = await db.select({ total: count() }).from(memories).where(eq(memories.coupleId, coupleId));
      met = Number(r[0]?.total ?? 0) >= (value.count ?? 0);
    } else if (triggerType === "trip_count") {
      const r = await db
        .select({ total: count() })
        .from(memories)
        .where(and(eq(memories.coupleId, coupleId), eq(memories.category, "trip")));
      met = Number(r[0]?.total ?? 0) >= (value.count ?? 0);
    } else if (triggerType === "bucket_completed") {
      const r = await db
        .select({ total: count() })
        .from(bucketListItems)
        .where(and(eq(bucketListItems.coupleId, coupleId), eq(bucketListItems.status, "completed")));
      met = Number(r[0]?.total ?? 0) >= (value.count ?? 0);
    }

    if (met) toUnlock.push(ach.id);
  }

  for (const id of toUnlock) {
    await db
      .insert(userAchievements)
      .values({ coupleId, achievementId: id, unlockedAt: new Date() })
      .onConflictDoNothing();
  }
  return toUnlock.length;
}

export async function checkAchievementsTrigger(coupleId: string, triggerType: string, userId: string) {
  try {
    await evaluateTrigger(coupleId, triggerType, userId);
  } catch (e) {
    console.error("Achievement check failed:", e);
  }
}

export async function listAchievements(coupleId: string) {
  const all = await db.select().from(achievements);
  const unlockedRows = await db.select().from(userAchievements).where(eq(userAchievements.coupleId, coupleId));
  const unlockedMap = new Map(unlockedRows.map((r) => [r.achievementId, r.unlockedAt]));
  return all.map((a) => ({
    ...a,
    unlockedAt: unlockedMap.get(a.id) ?? null,
    isUnlocked: unlockedMap.has(a.id),
  }));
}