import { z } from "zod";
import { db } from "@/lib/db";
import { dailyMoods } from "@/lib/db/schema";
import { ok, handleError, requireCoupleMembership } from "@/lib/api/helpers";
import { eq, desc } from "drizzle-orm";

const MOODS = ["happy", "good", "neutral", "sad", "angry", "tired", "loved"] as const;

const createSchema = z.object({
  mood: z.enum(MOODS),
  note: z.string().max(280).optional(),
});

export async function GET(request: Request) {
  try {
    const { couple, userId } = await requireCoupleMembership(request);
    const url = new URL(request.url);
    const days = Math.min(Number(url.searchParams.get("days") ?? 28), 90);

    const moods = await db.select().from(dailyMoods).where(eq(dailyMoods.coupleId, couple.id)).orderBy(desc(dailyMoods.moodDate)).limit(days * 2);

    const todayStr = new Date().toISOString().slice(0, 10);
    const myToday = moods.find((m) => m.userId === userId && m.moodDate === todayStr);
    const partnerToday = moods.find((m) => m.userId !== userId && m.moodDate === todayStr);

    return ok({ myToday: myToday ?? null, partnerToday: partnerToday ?? null, history: moods });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(request: Request) {
  try {
    const { couple, userId } = await requireCoupleMembership(request);
    const body = await request.json();
    const data = createSchema.parse(body);

    const today = new Date().toISOString().slice(0, 10);

    const mood = await db
      .insert(dailyMoods)
      .values({
        coupleId: couple.id,
        userId,
        mood: data.mood,
        note: data.note ?? null,
        moodDate: today,
      })
      .onConflictDoUpdate({
        target: [dailyMoods.userId, dailyMoods.moodDate],
        set: { mood: data.mood, note: data.note ?? null },
      })
      .returning()
      .then((r) => r[0]);

    return ok(mood);
  } catch (e) {
    return handleError(e);
  }
}