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

    const existing = await db.query.coupleMembers.findFirst({
      where: eq(coupleMembers.userId, session.user.id),
    });
    if (existing) {
      return fail("Kamu sudah berada dalam sebuah couple", "ALREADY_IN_COUPLE", 400);
    }

    const body = await request.json();
    const data = joinSchema.parse(body);

    const normalizedCode = (data.inviteCode ?? "").trim().toUpperCase();
    if (!normalizedCode) {
      return fail("Kode undangan tidak valid", "INVALID_CODE", 404);
    }

    const couple = await db.query.couples.findFirst({
      where: eq(couples.inviteCode, normalizedCode),
    });
    if (!couple) {
      return fail("Kode undangan tidak valid", "INVALID_CODE", 404);
    }

    const memberCount = await db
      .select({ count: sql`count(*)::int` })
      .from(coupleMembers)
      .where(eq(coupleMembers.coupleId, couple.id))
      .then((r) => Number(r[0]?.count ?? 0));

    if (memberCount >= 2) {
      return fail("Couple ini sudah lengkap", "COUPLE_FULL", 400);
    }

    await db.insert(coupleMembers).values({
      coupleId: couple.id,
      userId: session.user.id,
      role: "partner_b",
    });

    await db
      .update(couples)
      .set({ updatedAt: new Date() })
      .where(eq(couples.id, couple.id));

    return ok({ coupleId: couple.id, role: "partner_b" });
  } catch (e) {
    return handleError(e);
  }
}