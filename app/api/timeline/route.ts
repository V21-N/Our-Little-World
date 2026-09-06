import { z } from "zod";
import { db } from "@/lib/db";
import { timelineEvents } from "@/lib/db/schema";
import { ok, handleError, requireCoupleMembership } from "@/lib/api/helpers";
import { eq, asc } from "drizzle-orm";

const createSchema = z.object({
  title: z.string().min(1).max(200),
  eventDate: z.string().min(1),
  description: z.string().max(2000).optional(),
  imageUrl: z.string().url().optional(),
  location: z.string().max(200).optional(),
});

export async function GET(request: Request) {
  try {
    const { couple } = await requireCoupleMembership(request);
    const events = await db.select().from(timelineEvents).where(eq(timelineEvents.coupleId, couple.id)).orderBy(asc(timelineEvents.eventDate));
    return ok(events);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(request: Request) {
  try {
    const { couple, userId } = await requireCoupleMembership(request);
    const body = await request.json();
    const data = createSchema.parse(body);

    const event = await db
      .insert(timelineEvents)
      .values({
        coupleId: couple.id,
        createdBy: userId,
        title: data.title,
        eventDate: data.eventDate,
        description: data.description ?? null,
        imageUrl: data.imageUrl ?? null,
        location: data.location ?? null,
      })
      .returning()
      .then((r) => r[0]);

    return ok(event, 201);
  } catch (e) {
    return handleError(e);
  }
}