import { z } from "zod";
import { db } from "@/lib/db";
import { coupleMessages, profiles } from "@/lib/db/schema";
import { ok, handleError, requireCoupleMembership } from "@/lib/api/helpers";
import { eq, desc, inArray } from "drizzle-orm";

const createSchema = z.object({
  content: z.string().min(1).max(2000),
});

export async function GET(request: Request) {
  try {
    const { couple } = await requireCoupleMembership(request);
    const url = new URL(request.url);
    const limit = Math.min(Number(url.searchParams.get("limit") ?? 50) || 50, 100);

    const messages = await db
      .select()
      .from(coupleMessages)
      .where(eq(coupleMessages.coupleId, couple.id))
      .orderBy(desc(coupleMessages.createdAt))
      .limit(limit);

    const senderIds = [...new Set(messages.map((m) => m.senderId))];
    const senders = senderIds.length
      ? await db
          .select({ id: profiles.id, fullName: profiles.fullName, nickname: profiles.nickname, avatarUrl: profiles.avatarUrl })
          .from(profiles)
          .where(inArray(profiles.id, senderIds))
      : [];

    const senderMap = new Map(senders.map((s) => [s.id, s]));

    const mapped = messages.map((m) => ({
      ...m,
      sender: senderMap.get(m.senderId) ?? null,
    }));

    return ok({ items: mapped.reverse() });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(request: Request) {
  try {
    const { couple, userId } = await requireCoupleMembership(request);
    const body = await request.json();
    const data = createSchema.parse(body);

    const message = await db
      .insert(coupleMessages)
      .values({
        coupleId: couple.id,
        senderId: userId,
        content: data.content,
      })
      .returning()
      .then((r) => r[0]);

    return ok(message, 201);
  } catch (e) {
    return handleError(e);
  }
}