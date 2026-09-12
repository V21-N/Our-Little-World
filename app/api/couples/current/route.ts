import { db } from "@/lib/db";
import { coupleMembers, couples, profiles } from "@/lib/db/schema";
import { ok, handleError, requireUser } from "@/lib/api/helpers";
import { and, eq, isNull, ne } from "drizzle-orm";

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
    const couple = result[0].couple;

    const members = await db
      .select({ profile: profiles })
      .from(coupleMembers)
      .innerJoin(profiles, eq(coupleMembers.userId, profiles.id))
      .where(
        and(eq(coupleMembers.coupleId, couple.id), ne(coupleMembers.userId, session.user.id)),
      );

    const partner = members[0]?.profile ?? null;

    return ok({ ...couple, partner });
  } catch (e) {
    return handleError(e);
  }
}