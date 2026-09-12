import { NextRequest } from "next/server";
import { z } from "zod";
import { ok, fail, requireUser, handleError } from "@/lib/api/helpers";
import { extractYouTubeVideoId } from "@/lib/youtube";

const querySchema = z.object({
  url: z.string().url().min(1),
});

export async function GET(request: NextRequest) {
  try {
    await requireUser(request);
    const { url } = querySchema.parse({
      url: request.nextUrl.searchParams.get("url"),
    });

    if (!extractYouTubeVideoId(url)) {
      return fail("URL bukan video YouTube yang valid", "INVALID_URL", 400);
    }

    const oembedRes = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
      { next: { revalidate: 86400 } },
    );

    if (!oembedRes.ok) {
      return fail("Tidak dapat mengambil info video dari YouTube", "OEMBED_ERROR", 502);
    }

    const oembed = (await oembedRes.json()) as { title?: string; author_name?: string };

    const title = oembed.title ?? "";
    const channel = oembed.author_name ?? "";

    let songTitle = title;
    let artist = "";

    const separators = [" - ", " – ", " — ", " vs ", " x ", " ft "];
    let splitIdx = -1;
    let splitSep = "";
    for (const sep of separators) {
      const idx = title.indexOf(sep);
      if (idx > 0 && idx < title.length - sep.length) {
        const best = idx + sep.length;
        if (splitIdx === -1 || best < splitIdx) {
          splitIdx = best;
          splitSep = sep;
        }
      }
    }
    if (splitIdx !== -1) {
      songTitle = title.slice(splitIdx).trim();
      artist = title.slice(0, splitIdx - splitSep.length).trim();
    }
    if (!artist) artist = channel;

    return ok({ title: songTitle, artist, rawTitle: title });
  } catch (e) {
    return handleError(e);
  }
}