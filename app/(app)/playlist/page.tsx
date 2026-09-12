"use client";

import { useState, useEffect } from "react";
import { ExternalLink, Loader2, Music, Play, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "sonner";
import type { PlaylistItem } from "@/lib/types";

import { apiFetch } from "@/lib/api/client";
import { useYouTubePlayer } from "@/components/youtube-player-provider";

const extractProvider = (url: string) => {
  return "YouTube";
};

const extractProviderColor = (url: string) => {
  return "bg-rose-100 text-rose-700";
};

export default function PlaylistPage() {
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAdd, setOpenAdd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { track: activeTrack, setQueue } = useYouTubePlayer();
  const [form, setForm] = useState({ songTitle: "", artist: "", url: "" });
  const [deleteTarget, setDeleteTarget] = useState<PlaylistItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [meta, setMeta] = useState<{ title: string; artist: string } | null>(null);
  const [metaTimeout, setMetaTimeout] = useState<NodeJS.Timeout | null>(null);

  const fetchMeta = async (url: string) => {
    if (!url.startsWith("http")) return;
    try {
      const res = await apiFetch<{ title: string; artist: string }>(
        `/api/playlists/meta?url=${encodeURIComponent(url)}`,
      );
      if (res.success) {
        setForm((prev) => ({
          ...prev,
          songTitle: prev.songTitle || res.data.title,
          artist: prev.artist || res.data.artist,
        }));
      }
    } catch {
      // Ingore error, user can type manually
    }
  };

  const onUrlChange = (url: string) => {
    setForm({ ...form, url });
    if (metaTimeout) clearTimeout(metaTimeout);
    setMetaTimeout(setTimeout(() => fetchMeta(url), 800));
  };

  const reload = () => {
    apiFetch<PlaylistItem[]>("/api/playlists")
      .then((res) => {
        if (res.success) setPlaylist(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    reload();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await apiFetch("/api/playlists", {
      method: "POST",
      body: JSON.stringify({
        songTitle: form.songTitle,
        artist: form.artist || undefined,
        url: form.url,
      }),
    });
    setSubmitting(false);
    if (res.success) {
      toast.success("Lagu ditambahkan");
      setOpenAdd(false);
      setForm({ songTitle: "", artist: "", url: "" });
      reload();
    } else {
      toast.error(res.error);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await apiFetch(`/api/playlists/${deleteTarget.id}`, { method: "DELETE" });
    setDeleting(false);
    setDeleteTarget(null);
    if (res.success) {
      toast.success("Lagu dihapus");
      reload();
    } else {
      toast.error(res.error);
    }
  };

const youtubeTracks = playlist
     .map((item) => ({
       title: item.songTitle,
       artist: item.artist ?? undefined,
       url: item.url,
     }));

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-6 lg:py-10 lg:pr-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-8 w-48 animate-pulse rounded bg-muted" />
            <div className="mt-1 h-4 w-40 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-10 w-32 animate-pulse rounded-xl bg-muted" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="mb-3 h-16 animate-pulse rounded-2xl border border-border/60 bg-card" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-6 lg:py-10 lg:pr-8">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Playlist
          </p>
          <h1 className="mt-1 font-serif text-3xl tracking-tight md:text-4xl">
            Lagu kita
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {playlist.length} lagu yang berarti untuk kalian.
          </p>
        </div>
        <Dialog open={openAdd} onOpenChange={setOpenAdd}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Tambah Lagu</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah lagu baru</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleAdd}>
              <div className="space-y-2">
                <Label>Judul Lagu</Label>
                <Input
                  required
                  placeholder="Cinta Terbaik"
                  value={form.songTitle}
                  onChange={(e) => setForm({ ...form, songTitle: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Artis</Label>
                <Input
                  placeholder="Peterpan"
                  value={form.artist}
                  onChange={(e) => setForm({ ...form, artist: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>URL (YouTube)</Label>
                <Input
                  required
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={form.url}
                  onChange={(e) => onUrlChange(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Hanya URL dari youtube.com
                </p>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenAdd(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Tambah
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      {playlist.length === 0 ? (
        <EmptyState
          icon={<Music className="h-6 w-6" />}
          title="Belum ada lagu"
          description="Tambahkan lagu yang berarti untuk kalian."
          action={
            <Button onClick={() => setOpenAdd(true)}>
              <Plus className="h-4 w-4" />
              Tambah Lagu
            </Button>
          }
        />
      ) : (
        <>
          <ul className="space-y-2">
            {playlist.map((item, i) => (
              <li key={item.id}>
                <Card className="group border-border/60 transition hover:border-primary/30">
                  <CardContent className="flex items-center gap-3 p-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-secondary/40 text-sm font-serif font-semibold text-primary">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{item.songTitle}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {item.artist ?? "Tanpa artis"}
                      </p>
                    </div>
                    <Badge className={`hidden sm:inline-flex ${extractProviderColor(item.url)}`}>
                      {extractProvider(item.url)}
                    </Badge>
<div className="flex items-center gap-1">
                       <Button
                         variant={activeTrack?.url === item.url ? "default" : "ghost"}
                         size="icon-sm"
                         aria-label={`Putar ${item.songTitle}`}
                         onClick={() => {
                           const index = youtubeTracks.findIndex((track) => track.url === item.url);
                           setQueue(youtubeTracks, index);
                         }}
                       >
                         <Play className="h-4 w-4" fill="currentColor" />
                       </Button>
                      <Button variant="ghost" size="icon-sm" asChild>
                        <a href={item.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Hapus"
                        onClick={() => setDeleteTarget(item)}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </>
      )}

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(v) => {
          if (!v) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus lagu?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Yakin ingin menghapus <span className="font-medium text-foreground">"{deleteTarget?.songTitle}"</span> dari playlist? Tindakan ini tidak bisa dibatalkan.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Batal
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}