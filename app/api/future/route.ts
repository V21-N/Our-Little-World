import { z } from "zod";
import { db } from "@/lib/db";
import { futureItems } from "@/lib/db/schema";
import { ok, handleError, requireCoupleMembership } from "@/lib/api/helpers";
import { eq, asc } from "drizzle-orm";

const CATEGORIES = ["dream", "goal", "place", "promise", "letter", "other"] as const;

const createSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  category: z.enum(CATEGORIES).optional(),
  targetDate: z.string().optional(),
  unlockDate: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const { couple } = await requireCoupleMembership(request);
    const items = await db.select().from(futureItems).where(eq(futureItems.coupleId, couple.id)).orderBy(asc(futureItems.unlockDate));
    return ok(items);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(request: Request) {
  try {
    const { couple, userId } = await requireCoupleMembership(request);
    const body = await request.json();
    const data = createSchema.parse(body);

    const item = await db
      .insert(futureItems)
      .values({
        coupleId: couple.id,
        createdBy: userId,
        title: data.title,
        description: data.description ?? null,
        category: data.category ?? null,
        targetDate: data.targetDate ?? null,
        unlockDate: data.unlockDate ?? null,
      })
      .returning()
      .then((r) => r[0]);

    return ok(item, 201);
  } catch (e) {
    return handleError(e);
  }
}