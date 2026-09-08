import "server-only";
import { db } from "@/lib/db";
import { memories, memoryImages } from "@/lib/db/schema";
import { asc, desc, eq, and, sql } from "drizzle-orm";
import { getImageUrl } from "@/lib/storage";

export async function getMemoryById(id: string) {
  const memory = await db.query.memories.findFirst({
    where: eq(memories.id, id),
    with: {
      images: { orderBy: (mi, { asc: a }) => [a(mi.position)] },
    },
  });
  if (!memory) return null;
  return serialize(memory);
}

export async function listMemories(params: {
  coupleId: string;
  orderBy?: string;
  category?: string;
  favorite?: boolean;
  search?: string;
  cursor?: string;
  limit?: number;
}) {
  const limit = Math.min(params.limit ?? 12, 50);
  const conds: any[] = [eq(memories.coupleId, params.coupleId)];

  if (params.category) conds.push(sql`${memories.category} = ${params.category}`);
  if (params.favorite !== undefined) conds.push(sql`${memories.isFavorite} = ${params.favorite}`);
  if (params.search) {
    conds.push(sql`(${memories.caption} ILIKE ${`%${params.search}%`} OR ${memories.location} ILIKE ${`%${params.search}%`})`);
  }

  const orderDesc = params.orderBy === "date" ? desc(memories.memoryDate) : desc(memories.createdAt);
  const items = await db.select().from(memories).where(and(...conds)).orderBy(orderDesc).limit(limit + 1);
  const hasMore = items.length > limit;
  const page = items.slice(0, limit);
  const memoryIds = page.map((m) => m.id);

  let images: typeof memoryImages.$inferSelect[] = [];
  if (memoryIds.length > 0) {
    images = await db.select().from(memoryImages).where(sql`${memoryImages.memoryId} IN (${sql.join(memoryIds, sql`, `)})`).orderBy(asc(memoryImages.position));
  }

  return {
    items: await Promise.all(
      page.map((m) => serialize({ ...m, images: images.filter((i) => i.memoryId === m.id) })),
    ),
    nextCursor: hasMore ? page[page.length - 1].id : null,
  };
}

async function serialize(memory: any) {
  return {
    ...memory,
    tags: (memory.tags as string[]) ?? [],
    images: await Promise.all(
      (memory.images ?? []).map(async (i: any) => ({
        ...i,
        url: await getImageUrl(i.storagePath),
      })),
    ).then((result) => result.sort((a, b) => a.position - b.position)),
  };
}