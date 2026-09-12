import { z } from "zod";
import { db } from "@/lib/db";
import { playlists } from "@/lib/db/schema";
import { ok, fail, handleError, requireCoupleMembership } from "@/lib/api/helpers";
import { eq, desc } from "drizzle-orm";
import { extractYouTubeVideoId } from "@/lib/youtube";

async function fetchYoutubeMeta(url: string): Promise<{ title: string; artist: string }> {
  const oembedRes = await fetch(
    `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
    { next: { revalidate: 86400 } },
  );
  if (!oembedRes.ok) return { title: "", artist: "" };
  const oembed = (await oembedRes.json()) as { title?: string; author_name?: string };
  const title = oembed.title ?? "";
  const channel = oembed.author_name ?? "";
  const sepIdx = title.search(/ [-–—] | vs | x | ft /);
  if (sepIdx > 0) {
    return {
      title: title.slice(sepIdx + 1).trim(),
      artist: title.slice(0, sepIdx).trim(),
    };
  }
  return { title, artist: channel };
}

const urlSchema = z
  .string()
  .url()
  .refine((url) => {
    try {
      const u = new URL(url);
      return ["youtube.com", "youtu.be", "www.youtube.com", "m.youtube.com"].includes(u.hostname);
    } catch {
      return false;
    }
  }, "URL must be from YouTube");

const createSchema = z.object({
  songTitle: z.string().max(200).optional(),
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

    let songTitle = data.songTitle ?? "";
    let artist = data.artist ?? null;

    if (!songTitle.trim() && extractYouTubeVideoId(data.url)) {
      const meta = await fetchYoutubeMeta(data.url);
      songTitle = meta.title;
      if (artist === null || !artist.trim()) artist = meta.artist || null;
    }

    if (!songTitle.trim()) {
      return fail("Judul lagu wajib diisi", "VALIDATION_ERROR", 400);
    }

    const item = await db
      .insert(playlists)
      .values({
        coupleId: couple.id,
        songTitle,
        artist,
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