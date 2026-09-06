import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { couples, coupleMembers } from "@/lib/db/schema";
import {
  ok,
  handleError,
  requireUser,
  requireProfile,
  generateInviteCode,
} from "@/lib/api/helpers";
import { eq } from "drizzle-orm";
import { z } from "zod";

const createSchema = z.object({
  coupleName: z.string().min(1).max(100).optional(),
  relationshipStartDate: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireUser(request);
    const { profile } = await requireProfile(request);

    const existing = await db.query.coupleMembers.findFirst({
      where: eq(coupleMembers.userId, session.user.id),
      with: { couple: true },
    });
    if (existing) {
      return ok(existing.couple, 200);
    }

    const body = await request.json();
    const data = createSchema.parse(body);

    const couple = await db.transaction(async (tx) => {
      const newCouple = await tx
        .insert(couples)
        .values({
          coupleName: data.coupleName ?? null,
          relationshipStartDate: data.relationshipStartDate,
          inviteCode: generateInviteCode(),
        })
        .returning()
        .then((r) => r[0]);

      await tx.insert(coupleMembers).values({
        coupleId: newCouple.id,
        userId: session.user.id,
        role: "partner_a",
      });

      return newCouple;
    });

    return ok(couple, 201);
  } catch (e) {
    return handleError(e);
  }
}