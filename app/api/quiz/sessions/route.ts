import { db } from "@/lib/db";
import { quizQuestions, quizSessions } from "@/lib/db/schema";
import { ok, handleError, requireCoupleMembership } from "@/lib/api/helpers";
import { eq, inArray } from "drizzle-orm";

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
      with: {
        player: { columns: { id: true, fullName: true, nickname: true } },
        answers: true,
      },
    });
    const questionIds = sessions.flatMap((session) => session.answers.map((answer) => answer.questionId));
    const questions = questionIds.length
      ? await db
          .select({ id: quizQuestions.id, questionText: quizQuestions.questionText, options: quizQuestions.options })
          .from(quizQuestions)
          .where(inArray(quizQuestions.id, questionIds))
      : [];
    const questionMap = new Map(questions.map((question) => [question.id, question]));

    return ok(
      sessions.map((session) => ({
        ...session,
        answers: session.answers.map((answer) => ({
          id: answer.id,
          questionId: answer.questionId,
          selectedOptionIndex: answer.selectedOptionIndex,
          isCorrect: answer.isCorrect,
          answeredAt: answer.answeredAt,
          question: questionMap.get(answer.questionId) ?? null,
        })),
      })),
    );
  } catch (e) {
    return handleError(e);
  }
}