import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { loveLetters } from "@/lib/db/schema";
import { ok, fail, handleError, requireCoupleMembership } from "@/lib/api/helpers";
import { eq, and } from "drizzle-orm";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { couple, userId } = await requireCoupleMembership(request);
    const letter = await db.query.loveLetters.findFirst({
      where: and(eq(loveLetters.id, id), eq(loveLetters.coupleId, couple.id)),
    });

    if (!letter) return fail("Letter not found", "NOT_FOUND", 404);

    const now = new Date();
    const isSender = letter.senderId === userId;
    const unlocked = !letter.unlockAt || letter.unlockAt <= now;
    const showContent = isSender || unlocked;

    return ok({ ...letter, content: showContent ? letter.content : null, isLocked: !showContent });
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { couple, userId } = await requireCoupleMembership(request);
    const letter = await db.query.loveLetters.findFirst({
      where: and(eq(loveLetters.id, id), eq(loveLetters.coupleId, couple.id)),
    });

    if (!letter) return fail("Letter not found", "NOT_FOUND", 404);
    if (letter.senderId !== userId) return fail("Not allowed to delete this letter", "FORBIDDEN", 403);

    await db.delete(loveLetters).where(eq(loveLetters.id, id));
    return ok({ id, deleted: true });
  } catch (e) {
    return handleError(e);
  }
}