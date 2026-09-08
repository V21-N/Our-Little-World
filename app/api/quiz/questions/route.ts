import { z } from "zod";
import { db } from "@/lib/db";
import { quizQuestions } from "@/lib/db/schema";
import { ok, fail, handleError, requireCoupleMembership } from "@/lib/api/helpers";
import { eq, desc } from "drizzle-orm";

const createSchema = z.object({
  questionText: z.string().min(1).max(500),
  options: z.array(z.string().min(1)).min(2).max(4),
  correctOptionIndex: z.number().int().min(0).max(3),
});

export async function GET(request: Request) {
  try {
    const { couple } = await requireCoupleMembership(request);
    const questions = await db
      .select({
        id: quizQuestions.id,
        coupleId: quizQuestions.coupleId,
        createdBy: quizQuestions.createdBy,
        questionText: quizQuestions.questionText,
        options: quizQuestions.options,
        createdAt: quizQuestions.createdAt,
      })
      .from(quizQuestions)
      .where(eq(quizQuestions.coupleId, couple.id))
      .orderBy(desc(quizQuestions.createdAt));
    return ok(questions);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(request: Request) {
  try {
    const { couple, userId } = await requireCoupleMembership(request);
    const body = await request.json();
    const data = createSchema.parse(body);

    if (data.correctOptionIndex >= data.options.length) {
      return fail("Correct option index out of range", "INVALID_INPUT", 400);
    }

    const question = await db
      .insert(quizQuestions)
      .values({
        coupleId: couple.id,
        createdBy: userId,
        questionText: data.questionText,
        options: data.options,
        correctOptionIndex: data.correctOptionIndex,
      })
      .returning()
      .then((r) => r[0]);

    return ok(question, 201);
  } catch (e) {
    return handleError(e);
  }
}