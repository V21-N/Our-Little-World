import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { loveLetters } from "@/lib/db/schema";
import { ok, fail, handleError, requireCoupleMembership } from "@/lib/api/helpers";
import { eq, and } from "drizzle-orm";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { couple, userId } = await requireCoupleMembership(request);
    const letter = await db.query.loveLetters.findFirst({
      where: and(eq(loveLetters.id, id), eq(loveLetters.coupleId, couple.id)),
    });

    if (!letter) return fail("Letter not found", "NOT_FOUND", 404);

    const hasUnlocked = !letter.unlockAt || letter.unlockAt <= new Date();
    if (!hasUnlocked) return fail("Letter is still locked", "LOCKED", 403);

    if (letter.senderId === userId) {
      return ok({ ...letter, content: letter.content });
    }

    const updated = await db
      .update(loveLetters)
      .set({ isRead: true, readAt: new Date() })
      .where(eq(loveLetters.id, id))
      .returning()
      .then((r) => r[0]);

    return ok({ ...updated, content: letter.content });
  } catch (e) {
    return handleError(e);
  }
}