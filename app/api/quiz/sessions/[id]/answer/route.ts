import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { quizSessions, quizQuestions, quizAnswers } from "@/lib/db/schema";
import { ok, fail, handleError, requireCoupleMembership } from "@/lib/api/helpers";
import { eq, and } from "drizzle-orm";

const answerSchema = z.object({
  questionId: z.string().uuid(),
  selectedOptionIndex: z.number().int().min(0).max(3),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { couple } = await requireCoupleMembership(request);
    const body = await request.json();
    const data = answerSchema.parse(body);

    const session = await db.query.quizSessions.findFirst({
      where: and(eq(quizSessions.id, id), eq(quizSessions.coupleId, couple.id)),
    });

    if (!session) return fail("Quiz session not found", "NOT_FOUND", 404);
    if (session.status !== "in_progress") return fail("Session already completed", "COMPLETED", 400);

    const question = await db.query.quizQuestions.findFirst({
      where: eq(quizQuestions.id, data.questionId),
    });

    if (!question) return fail("Question not found", "NOT_FOUND", 404);

    const isCorrect = question.correctOptionIndex === data.selectedOptionIndex;

    const answer = await db
      .insert(quizAnswers)
      .values({
        sessionId: session.id,
        questionId: question.id,
        selectedOptionIndex: data.selectedOptionIndex,
        isCorrect,
      })
      .returning()
      .then((r) => r[0]);

    return ok({ ...answer, correctOptionIndex: question.correctOptionIndex });
  } catch (e) {
    return handleError(e);
  }
}