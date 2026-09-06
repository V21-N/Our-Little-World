import { db } from "@/lib/db";
import { coupleMembers, couples } from "@/lib/db/schema";
import { ok, fail, handleError, requireUser } from "@/lib/api/helpers";
import { eq, and, sql } from "drizzle-orm";

export async function DELETE(request: Request) {
  try {
    const session = await requireUser(request);
    const userId = session.user.id;

    const member = await db.query.coupleMembers.findFirst({
      where: eq(coupleMembers.userId, userId),
      with: { couple: true },
    });

    if (!member) {
      return fail("Kamu tidak berada dalam couple manapun", "NOT_IN_COUPLE", 400);
    }

    await db.transaction(async (tx) => {
      await tx.delete(coupleMembers).where(eq(coupleMembers.userId, userId));

      const remaining = await tx
        .select({ count: sql`count(*)::int` })
        .from(coupleMembers)
        .where(eq(coupleMembers.coupleId, member.coupleId));

      if (Number(remaining[0]?.count ?? 0) === 0) {
        await tx.delete(couples).where(eq(couples.id, member.coupleId));
      }
    });

    return ok({ leftCoupleId: member.coupleId });
  } catch (e) {
    return handleError(e);
  }
}
