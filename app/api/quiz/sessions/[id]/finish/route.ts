import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { quizSessions, quizAnswers } from "@/lib/db/schema";
import { ok, fail, handleError, requireCoupleMembership } from "@/lib/api/helpers";
import { eq, and } from "drizzle-orm";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { couple } = await requireCoupleMembership(request);

    const session = await db.query.quizSessions.findFirst({
      where: and(eq(quizSessions.id, id), eq(quizSessions.coupleId, couple.id)),
    });

    if (!session) return fail("Quiz session not found", "NOT_FOUND", 404);
    if (session.status !== "in_progress") return fail("Session already completed", "COMPLETED", 400);

    const answers = await db.select().from(quizAnswers).where(eq(quizAnswers.sessionId, session.id));
    const score = answers.filter((a) => a.isCorrect).length;

    const updated = await db
      .update(quizSessions)
      .set({ status: "completed", score, completedAt: new Date() })
      .where(eq(quizSessions.id, session.id))
      .returning()
      .then((r) => r[0]);

    return ok({ ...updated, answers });
  } catch (e) {
    return handleError(e);
  }
}