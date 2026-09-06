import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { couples } from "@/lib/db/schema";
import { ok, handleError, requireCoupleMembership, generateInviteCode } from "@/lib/api/helpers";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const { couple } = await requireCoupleMembership(request);

    const updated = await db
      .update(couples)
      .set({ inviteCode: generateInviteCode(), updatedAt: new Date() })
      .where(eq(couples.id, couple.id))
      .returning()
      .then((r) => r[0]);

    return ok({ inviteCode: updated.inviteCode });
  } catch (e) {
    return handleError(e);
  }
}