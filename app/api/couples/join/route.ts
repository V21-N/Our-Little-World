import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { couples, coupleMembers } from "@/lib/db/schema";
import {
  ok,
  fail,
  handleError,
  requireUser,
  requireProfile,
} from "@/lib/api/helpers";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

const joinSchema = z.object({
  inviteCode: z.string().min(1).max(40),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireUser(request);
    await requireProfile(request);

    const body = await request.json();
    const data = joinSchema.parse(body);

    const result = await db.transaction(async (tx) => {
      const existing = await tx.query.coupleMembers.findFirst({
        where: eq(coupleMembers.userId, session.user.id),
      });
      
      if (existing) {
        throw new Error("ALREADY_IN_COUPLE");
      }

      const normalizedCode = (data.inviteCode ?? "").trim().toUpperCase();
      if (!normalizedCode) {
        throw new Error("INVALID_CODE");
      }

      const coupleRows = await tx
        .select()
        .from(couples)
        .where(eq(couples.inviteCode, normalizedCode))
        .for("update");
        
      const couple = coupleRows[0];
      if (!couple) {
        throw new Error("INVALID_CODE");
      }

      const memberCountRes = await tx
        .select({ count: sql`count(*)::int` })
        .from(coupleMembers)
        .where(eq(coupleMembers.coupleId, couple.id));
        
      const memberCount = Number(memberCountRes[0]?.count ?? 0);

      if (memberCount >= 2) {
        throw new Error("COUPLE_FULL");
      }

      await tx.insert(coupleMembers).values({
        coupleId: couple.id,
        userId: session.user.id,
        role: "partner_b",
      });

      await tx
        .update(couples)
        .set({ updatedAt: new Date() })
        .where(eq(couples.id, couple.id));

      return { coupleId: couple.id, role: "partner_b" };
    });

    return ok(result);
  } catch (e: any) {
    if (e.message === "ALREADY_IN_COUPLE") {
      return fail("Kamu sudah berada dalam sebuah couple", "ALREADY_IN_COUPLE", 400);
    }
    if (e.message === "INVALID_CODE") {
      return fail("Kode undangan tidak valid", "INVALID_CODE", 404);
    }
    if (e.message === "COUPLE_FULL") {
      return fail("Couple ini sudah lengkap", "COUPLE_FULL", 400);
    }
    return handleError(e);
  }
}