export function extractYouTubePlaylistId(value: string): string | null {
  try {
    const url = new URL(value);
    if (!/(^|\.)youtube\.com$|(^|\.)youtu\.be$/.test(url.hostname)) return null;
    return url.searchParams.get("list");
  } catch {
    return null;
  }
}

export function extractYouTubeVideoId(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.hostname === "youtu.be") return url.pathname.slice(1) || null;
    if (url.hostname.endsWith("youtube.com")) {
      if (url.pathname === "/watch") return url.searchParams.get("v");
      if (url.pathname.startsWith("/shorts/")) return url.pathname.split("/")[2] ?? null;
      if (url.pathname.startsWith("/embed/")) return url.pathname.split("/")[2] ?? null;
    }
  } catch {
    return null;
  }
  return null;
}

export function isYouTubeUrl(value: string) {
  return extractYouTubePlaylistId(value) !== null || extractYouTubeVideoId(value) !== null;
}
