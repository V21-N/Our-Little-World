import { db } from "@/lib/db";
import { coupleMembers, couples } from "@/lib/db/schema";
import { ok, handleError, requireUser } from "@/lib/api/helpers";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const session = await requireUser(request);
    const member = await db.query.coupleMembers.findFirst({
      where: eq(coupleMembers.userId, session.user.id),
      with: { couple: true },
    });
    if (!member) {
      return ok(null);
    }
    return ok(member.couple);
  } catch (e) {
    return handleError(e);
  }
}