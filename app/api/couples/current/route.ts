import { db } from "@/lib/db";
import { coupleMembers, couples } from "@/lib/db/schema";
import { ok, handleError, requireUser } from "@/lib/api/helpers";
import { and, eq, isNull } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const session = await requireUser(request);
    const result = await db
      .select({ couple: couples })
      .from(coupleMembers)
      .innerJoin(couples, eq(coupleMembers.coupleId, couples.id))
      .where(
        and(
          eq(coupleMembers.userId, session.user.id),
          isNull(couples.deletedAt),
        ),
      )
      .limit(1);

    if (!result[0]) {
      return ok(null);
    }
    return ok(result[0].couple);
  } catch (e) {
    return handleError(e);
  }
}