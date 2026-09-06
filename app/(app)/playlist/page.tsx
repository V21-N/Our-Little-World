"use client";

import { useState, useEffect } from "react";
import { ExternalLink, Loader2, Music, Plus, Trash2 } from "lucide-react";
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
import { timeAgo } from "@/lib/utils";
import { toast } from "sonner";
import type { PlaylistItem } from "@/lib/types";

const extractProvider = (url: string) => {
  if (url.includes("spotify.com") || url.includes("open.spotify")) return "Spotify";
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "YouTube";
  return "Other";
};

const extractProviderColor = (url: string) => {
  const p = extractProvider(url);
  if (p === "Spotify") return "bg-emerald-100 text-emerald-700";
  if (p === "YouTube") return "bg-rose-100 text-rose-700";
  return "bg-secondary text-secondary-foreground";
};

export default function PlaylistPage() {
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAdd, setOpenAdd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ songTitle: "", artist: "", url: "" });

  const reload = () => {
    fetch("/api/playlists")
      .then((r) => r.json())
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
    const res = await fetch("/api/playlists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        songTitle: form.songTitle,
        artist: form.artist || undefined,
        url: form.url,
      }),
    });
    const json = await res.json();
    setSubmitting(false);
    if (json.success) {
      toast.success("Lagu ditambahkan");
      setOpenAdd(false);
      setForm({ songTitle: "", artist: "", url: "" });
      reload();
    } else {
      toast.error(json.error);
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/playlists/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) {
      toast.success("Lagu dihapus");
      reload();
    } else {
      toast.error(json.error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
                <Label>URL (Spotify / YouTube)</Label>
                <Input
                  required
                  type="url"
                  placeholder="https://open.spotify.com/track/..."
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Hanya URL dari spotify.com atau youtube.com
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
                    <Button variant="ghost" size="icon-sm" asChild>
                      <a href={item.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Hapus"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}