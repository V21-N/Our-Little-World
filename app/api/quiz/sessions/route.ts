import { db } from "@/lib/db";
import { quizQuestions, quizSessions } from "@/lib/db/schema";
import { ok, handleError, requireCoupleMembership } from "@/lib/api/helpers";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const { couple, userId } = await requireCoupleMembership(request);

    const session = await db
      .insert(quizSessions)
      .values({
        coupleId: couple.id,
        playerId: userId,
        status: "in_progress",
      })
      .returning()
      .then((r) => r[0]);

    const questions = await db
      .select({
        id: quizQuestions.id,
        questionText: quizQuestions.questionText,
        options: quizQuestions.options,
      })
      .from(quizQuestions)
      .where(eq(quizQuestions.coupleId, couple.id));

    return ok({ session, questions }, 201);
  } catch (e) {
    return handleError(e);
  }
}

export async function GET(request: Request) {
  try {
    const { couple } = await requireCoupleMembership(request);
    const sessions = await db.query.quizSessions.findMany({
      where: eq(quizSessions.coupleId, couple.id),
      with: { answers: true },
    });
    return ok(sessions);
  } catch (e) {
    return handleError(e);
  }
}