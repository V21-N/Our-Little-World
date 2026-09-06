import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { couples } from "@/lib/db/schema";
import { ok, handleError, requireCoupleMembership } from "@/lib/api/helpers";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { couple } = await requireCoupleMembership(request);
    if (couple.id !== id) {
      return ok(couple);
    }
    return ok(couple);
  } catch (e) {
    return handleError(e);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { couple } = await requireCoupleMembership(request);
    if (couple.id !== id) {
      return ok(couple, 200);
    }

    const body = await request.json();

    const updated = await db
      .update(couples)
      .set({
        coupleName: body.coupleName ?? couple.coupleName,
        coverImageUrl: body.coverImageUrl ?? couple.coverImageUrl,
        theme: body.theme ?? couple.theme,
        updatedAt: new Date(),
      })
      .where(eq(couples.id, couple.id))
      .returning()
      .then((r) => r[0]);

    return ok(updated);
  } catch (e) {
    return handleError(e);
  }
}