import { z } from "zod";
import { db } from "@/lib/db";
import { loveLetters } from "@/lib/db/schema";
import { ok, handleError, requireCoupleMembership } from "@/lib/api/helpers";
import { eq, desc } from "drizzle-orm";

const OPEN_WHEN_TAGS = [
  "when_you_miss_me",
  "when_you_are_sad",
  "when_you_are_happy",
  "when_we_fight",
  "when_you_need_reminder",
  "when_it_is_raining",
  "when_you_cannot_sleep",
] as const;

const createSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  imageUrl: z.string().url().optional(),
  recipientId: z.string().optional(),
  openWhenTag: z.enum(OPEN_WHEN_TAGS).optional(),
  unlockAt: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const { couple, userId } = await requireCoupleMembership(request);
    const now = new Date();

    const letters = await db.select().from(loveLetters).where(eq(loveLetters.coupleId, couple.id)).orderBy(desc(loveLetters.createdAt));

    const mapped = letters.map((l) => {
      const isSender = l.senderId === userId;
      const unlocked = !l.unlockAt || l.unlockAt <= now;
      const showContent = isSender || unlocked;
      return { ...l, content: showContent ? l.content : null, isLocked: !showContent };
    });

    const url = new URL(request.url);
    const filter = url.searchParams.get("filter");
    let result = mapped;
    if (filter === "unread") result = mapped.filter((l) => !l.isRead && !l.isLocked);
    else if (filter === "locked") result = mapped.filter((l) => l.isLocked);
    else if (filter === "unlocked") result = mapped.filter((l) => !l.isLocked);

    return ok(result);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(request: Request) {
  try {
    const { couple, userId } = await requireCoupleMembership(request);
    const body = await request.json();
    const data = createSchema.parse(body);

    const letter = await db
      .insert(loveLetters)
      .values({
        coupleId: couple.id,
        senderId: userId,
        recipientId: data.recipientId ?? null,
        title: data.title,
        content: data.content,
        imageUrl: data.imageUrl ?? null,
        openWhenTag: data.openWhenTag ?? null,
        unlockAt: data.unlockAt ? new Date(data.unlockAt) : null,
      })
      .returning()
      .then((r) => r[0]);

    return ok(letter, 201);
  } catch (e) {
    return handleError(e);
  }
}