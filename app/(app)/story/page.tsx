"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, Plus, CalendarDays, MapPin, Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import { apiFetch } from "@/lib/api/client";
import { useAuth } from "@/lib/hooks/use-auth";
import { toast } from "sonner";
import type { TimelineEvent } from "@/lib/types";

export default function StoryPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState<TimelineEvent | null>(null);
  const [form, setForm] = useState({
    title: "",
    eventDate: "",
    location: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TimelineEvent | null>(null);
  const [deleting, setDeleting] = useState(false);

  const reload = () => {
    apiFetch<TimelineEvent[]>("/api/timeline", { revalidate: true })
      .then((res) => {
        if (res.success) setEvents(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    reload();
  }, []);

  const openEdit = (event: TimelineEvent) => {
    setEditTarget(event);
    setForm({
      title: event.title,
      eventDate: event.eventDate.slice(0, 10),
      location: event.location ?? "",
      description: event.description ?? "",
    });
  };

  const saveEdit = async () => {
    if (!editTarget) return;
    if (!form.title.trim()) {
      toast.error("Judul wajib diisi");
      return;
    }
    setSaving(true);
    const res = await apiFetch<TimelineEvent>(`/api/timeline/${editTarget.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        title: form.title,
        eventDate: form.eventDate,
        location: form.location || null,
        description: form.description || null,
      }),
    });
    setSaving(false);
    if (res.success) {
      toast.success("Momen diperbarui");
      setEditTarget(null);
      reload();
    } else {
      toast.error(res.error);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await apiFetch(`/api/timeline/${deleteTarget.id}`, { method: "DELETE" });
    setDeleting(false);
    setDeleteTarget(null);
    if (res.success) {
      toast.success("Momen dihapus");
      reload();
    } else {
      toast.error(res.error);
    }
  };

  const sorted = [...events].sort((a, b) => a.eventDate.localeCompare(b.eventDate));

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-6 lg:py-10 lg:pr-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-8 w-56 animate-pulse rounded bg-muted" />
            <div className="mt-1 h-4 w-64 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-10 w-24 animate-pulse rounded-xl bg-muted" />
        </div>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl border border-border/60 bg-card" />
          ))}
        </div>
      </div>
    );
  }

  if (sorted.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-6 lg:py-10 lg:pr-8">
        <EmptyState
          icon={<CalendarDays className="h-6 w-6" />}
          title="Belum ada cerita"
          description="Mulai bangun timeline perjalanan kalian dari hari pertama."
          action={
            <Button asChild>
              <Link href="/story/new">
                <Plus className="h-4 w-4" />
                Tambah Momen
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-6 lg:py-10 lg:pr-8">
      <header className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Our Story
          </p>
          <h1 className="mt-1 font-serif text-3xl tracking-tight md:text-4xl">
            Perjalanan kita
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Setiap milestone adalah bab dari cerita kalian.
          </p>
        </div>
        <Button asChild>
          <Link href="/story/new">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Tambah</span>
          </Link>
        </Button>
      </header>

      <ol className="relative space-y-8 border-l-2 border-dashed border-primary/30 pl-6 sm:pl-8">
        {sorted.map((event, i) => (
          <li key={event.id} className="relative">
            <span className="absolute -left-[34px] flex h-10 w-10 items-center justify-center rounded-full border-4 border-background bg-primary text-primary-foreground shadow-sm sm:-left-[42px]">
              <CalendarDays className="h-4 w-4" />
            </span>
            <Card className="border-border/60 transition hover:border-primary/30 hover:shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-serif text-xs uppercase tracking-[0.18em] text-primary">
                      {i === 0 ? "Awal cerita" : `Bab ${i + 1}`}
                    </p>
                    <h2 className="mt-1 font-serif text-2xl tracking-tight">
                      {event.title}
                    </h2>
                  </div>
                  {event.createdBy === profile?.id && (
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEdit(event)}
                        aria-label="Edit momen"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setDeleteTarget(event)}
                        aria-label="Hapus momen"
                        title="Hapus"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                  <span>
                    {formatDate(event.eventDate, {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  {event.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {event.location}
                    </span>
                  )}
                </div>
                {event.description && (
                  <p className="mt-3 leading-relaxed text-foreground/80">
                    {event.description}
                  </p>
                )}
                {event.imageUrl && (
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="mt-3 w-full rounded-xl object-cover"
                  />
                )}
              </CardContent>
            </Card>
          </li>
        ))}
        <li className="relative">
          <span className="absolute -left-[34px] flex h-10 w-10 items-center justify-center rounded-full border-4 border-background bg-gradient-to-br from-primary/20 to-secondary/60 text-primary sm:-left-[42px]">
            <span className="text-lg">∞</span>
          </span>
          <Card className="border-dashed bg-muted/30">
            <CardContent className="py-6 text-center">
              <p className="font-serif italic text-muted-foreground">
                ...dan cerita kalian masih terus berlanjut.
              </p>
              <Button asChild variant="link" className="mt-2">
                <Link href="/story/new">Tambah bab baru</Link>
              </Button>
            </CardContent>
          </Card>
        </li>
      </ol>

      <Dialog open={editTarget !== null} onOpenChange={(v) => { if (!v) setEditTarget(null); }}>
        <DialogContent className="sm:rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Edit Momen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Judul</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Nama momen"
              />
            </div>
            <div className="space-y-2">
              <Label>Tanggal</Label>
              <Input
                type="date"
                value={form.eventDate}
                onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Lokasi (opsional)</Label>
              <Input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Misal: Pantai Kuta"
              />
            </div>
            <div className="space-y-2">
              <Label>Deskripsi (opsional)</Label>
              <Textarea
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Ceritakan momennya..."
              />
            </div>
          </div>
          <DialogFooter className="mt-2 flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => setEditTarget(null)} className="rounded-full">
              Batal
            </Button>
            <Button onClick={saveEdit} disabled={saving} className="rounded-full">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteTarget !== null} onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}>
        <DialogContent className="sm:rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Hapus momen?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Yakin ingin menghapus <span className="font-medium text-foreground">"{deleteTarget?.title}"</span> dari perjalanan kalian? Tindakan ini tidak bisa dibatalkan.
          </p>
          <DialogFooter className="mt-2 flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} className="rounded-full" disabled={deleting}>
              Batal
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting} className="rounded-full">
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
              Ya, Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}