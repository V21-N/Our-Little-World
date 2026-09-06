import { db } from "@/lib/db";
import { couples, coupleMembers } from "@/lib/db/schema";
import { ok, fail, handleError } from "@/lib/api/helpers";
import { eq, sql } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const normalized = (code ?? "").trim().toUpperCase();
    if (!normalized) {
      return fail("Kode undangan tidak valid", "INVALID_CODE", 404);
    }

    const couple = await db.query.couples.findFirst({
      where: eq(couples.inviteCode, normalized),
    });
    if (!couple) {
      return fail("Kode undangan tidak valid", "INVALID_CODE", 404);
    }

    const memberCount = await db
      .select({ count: sql`count(*)::int` })
      .from(coupleMembers)
      .where(eq(coupleMembers.coupleId, couple.id))
      .then((r) => Number(r[0]?.count ?? 0));

    return ok({
      coupleName: couple.coupleName,
      relationshipStartDate: couple.relationshipStartDate,
      memberCount,
      isFull: memberCount >= 2,
    });
  } catch (e) {
    return handleError(e);
  }
}
