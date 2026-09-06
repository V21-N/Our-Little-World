import { z } from "zod";
import { db } from "@/lib/db";
import { playlists } from "@/lib/db/schema";
import { ok, handleError, requireCoupleMembership } from "@/lib/api/helpers";
import { eq, desc } from "drizzle-orm";

const urlSchema = z
  .string()
  .url()
  .refine((url) => {
    try {
      const u = new URL(url);
      return ["spotify.com", "open.spotify.com", "youtube.com", "youtu.be", "www.youtube.com", "www.spotify.com"].includes(u.hostname);
    } catch {
      return false;
    }
  }, "URL must be from Spotify or YouTube");

const createSchema = z.object({
  songTitle: z.string().min(1).max(200),
  artist: z.string().max(200).optional(),
  url: urlSchema,
  memoryId: z.string().uuid().optional(),
});

export async function GET(request: Request) {
  try {
    const { couple } = await requireCoupleMembership(request);
    const items = await db.select().from(playlists).where(eq(playlists.coupleId, couple.id)).orderBy(desc(playlists.createdAt));
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
      .insert(playlists)
      .values({
        coupleId: couple.id,
        songTitle: data.songTitle,
        artist: data.artist ?? null,
        url: data.url,
        memoryId: data.memoryId ?? null,
        addedBy: userId,
      })
      .returning()
      .then((r) => r[0]);

    return ok(item, 201);
  } catch (e) {
    return handleError(e);
  }
}