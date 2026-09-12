import { z } from "zod";
import { db } from "@/lib/db";
import { ritualAnswers } from "@/lib/db/schema";
import { ok, handleError, requireCoupleMembership } from "@/lib/api/helpers";
import { eq } from "drizzle-orm";

const PROMPTS = [
  { id: "grateful", text: "Apa satu hal hari ini yang kamu syukuri tentang kita?" },
  { id: "goodthing", text: "Apa hal terbaik yang pasanganmu lakukan minggu ini?" },
  { id: "date_idea", text: "Kalau bisa langsung pergi sekarang, mau pergi ke mana bareng?" },
  { id: "love_language", text: "Hal kecil apa yang bikin kamu merasa paling dicintai?" },
  { id: "memory", text: "Kenangan apa yang muncul tadi malam tanpa sengaja?" },
  { id: "hope", text: "Satu hal yang kamu harapkan untuk kita malam ini?" },
] as const;

function promptForToday() {
  const start = new Date("2024-01-01T00:00:00Z");
  const days = Math.floor((Date.now() - start.getTime()) / 86400000);
  return PROMPTS[days % PROMPTS.length];
}

const createSchema = z.object({
  answer: z.string().min(1).max(500),
});

export async function GET(request: Request) {
  try {
    const { couple, userId } = await requireCoupleMembership(request);
    const today = new Date().toISOString().split("T")[0];

    const answers = await db
      .select()
      .from(ritualAnswers)
      .where(eq(ritualAnswers.coupleId, couple.id));

    const todayAnswers = answers.filter((a) => a.ritualDate === today);
    const myAnswer = todayAnswers.find((a) => a.userId === userId)?.answer ?? null;
    const partnerAnswer = todayAnswers.find((a) => a.userId !== userId)?.answer ?? null;

    const allDone = Boolean(myAnswer && partnerAnswer);

    return ok({
      prompt: promptForToday(),
      myAnswer,
      partnerAnswer,
      allDone,
    });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(request: Request) {
  try {
    const { couple, userId } = await requireCoupleMembership(request);
    const body = await request.json();
    const data = createSchema.parse(body);
    const today = new Date().toISOString().split("T")[0];

    await db
      .insert(ritualAnswers)
      .values({
        coupleId: couple.id,
        ritualDate: today,
        userId,
        answer: data.answer,
      })
      .onConflictDoUpdate({
        target: [
          ritualAnswers.coupleId,
          ritualAnswers.ritualDate,
          ritualAnswers.userId,
        ],
        set: { answer: data.answer },
      });

    return ok({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}