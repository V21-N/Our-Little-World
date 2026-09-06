import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { playlists } from "@/lib/db/schema";
import { ok, fail, handleError, requireCoupleMembership } from "@/lib/api/helpers";
import { eq, and } from "drizzle-orm";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { couple } = await requireCoupleMembership(request);
    const item = await db.query.playlists.findFirst({
      where: and(eq(playlists.id, id), eq(playlists.coupleId, couple.id)),
    });

    if (!item) return fail("Playlist item not found", "NOT_FOUND", 404);

    await db.delete(playlists).where(eq(playlists.id, id));
    return ok({ id, deleted: true });
  } catch (e) {
    return handleError(e);
  }
}