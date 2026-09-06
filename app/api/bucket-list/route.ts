import { z } from "zod";
import { db } from "@/lib/db";
import { bucketListItems } from "@/lib/db/schema";
import { ok, handleError, requireCoupleMembership } from "@/lib/api/helpers";
import { eq, desc } from "drizzle-orm";
import { checkAchievementsTrigger } from "@/lib/services/achievements";

const CATEGORIES = ["travel", "food", "experience", "milestone", "learning", "home", "other"] as const;

const createSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  category: z.enum(CATEGORIES).optional(),
  targetDate: z.string().optional(),
  status: z.enum(["planned", "in_progress", "completed"]).default("planned"),
  imageUrl: z.string().url().optional(),
});

export async function GET(request: Request) {
  try {
    const { couple } = await requireCoupleMembership(request);
    const items = await db.select().from(bucketListItems).where(eq(bucketListItems.coupleId, couple.id)).orderBy(desc(bucketListItems.createdAt));

    const total = items.length;
    const completed = items.filter((i) => i.status === "completed").length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    return ok({ items, progress, total, completed });
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
      .insert(bucketListItems)
      .values({
        coupleId: couple.id,
        createdBy: userId,
        title: data.title,
        description: data.description ?? null,
        category: data.category ?? null,
        targetDate: data.targetDate ?? null,
        status: data.status,
        completedDate: data.status === "completed" ? new Date().toISOString().slice(0, 10) : null,
        imageUrl: data.imageUrl ?? null,
      })
      .returning()
      .then((r) => r[0]);

    if (data.status === "completed") {
      await checkAchievementsTrigger(couple.id, "bucket_completed", userId);
    }

    return ok(item, 201);
  } catch (e) {
    return handleError(e);
  }
}