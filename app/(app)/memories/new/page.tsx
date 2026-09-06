"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImagePlus, Loader2, MapPin, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES } from "@/lib/constants";
import { categoryIcon, categoryLabel } from "@/lib/category-icons";
import { toast } from "sonner";
import { useAuth } from "@/lib/hooks/use-auth";
import { uploadFile } from "@/lib/api/client";

interface Photo {
  id: string;
  url: string;
  path: string;
}

export default function NewMemoryPage() {
  const router = useRouter();
  const { couple } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    caption: "",
    memoryDate: new Date().toISOString().split("T")[0],
    location: "",
    category: "random",
    tags: "",
    photos: [] as Photo[],
  });

  const previews = form.photos.map((p) => p.url);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!couple) return;
    if (form.photos.length + files.length > 10) {
      toast.error("Maksimal 10 foto per memori");
      return;
    }
    setUploading(true);
    for (const file of files) {
      const result = await uploadFile(file, "memories", couple.id);
      if (result.success && result.url && result.path) {
        setForm((prev) => ({
          ...prev,
          photos: [...prev.photos, { id: `p-${Date.now()}-${Math.random().toString(36).slice(2)}`, url: result.url!, path: result.path! }],
        }));
      } else {
        toast.error(result.error ?? "Upload gagal");
      }
    }
    setUploading(false);
    e.target.value = "";
  };

  const removePhoto = (id: string) => {
    setForm({ ...form, photos: form.photos.filter((p) => p.id !== id) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.photos.length === 0) {
      toast.error("Tambahkan minimal 1 foto");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/memories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        caption: form.caption,
        memoryDate: form.memoryDate,
        location: form.location || undefined,
        category: form.category,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        images: form.photos.map((p) => ({ storagePath: p.path })),
      }),
    });
    const json = await res.json();
    setLoading(false);
    if (json.success) {
      toast.success("Kenangan tersimpan ✨");
      router.push(`/memories/${json.data.id}`);
    } else {
      toast.error(json.error);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-5 py-6 lg:py-10 lg:pr-8">
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link href="/memories">
          <ArrowLeft className="h-4 w-4" />
          Memories
        </Link>
      </Button>

      <header className="mb-6">
        <h1 className="font-serif text-3xl tracking-tight md:text-4xl">
          Tambah kenangan
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ceritakan sedikit tentang momen ini, biar kalian bisa mengulanginya kapan saja.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-border/60">
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label>Foto (maks 10)</Label>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {form.photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="relative aspect-square overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/20 to-secondary/40"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.url} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(photo.id)}
                      className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                {form.photos.length < 10 && (
                  <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-border/60 bg-muted/30 text-muted-foreground transition hover:border-primary/40 hover:text-primary">
                    {uploading ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <>
                        <ImagePlus className="h-6 w-6" />
                        <span className="text-xs">Pilih</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      className="hidden"
                      onChange={onFileChange}
                      disabled={uploading}
                    />
                  </label>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Format: JPG, PNG, WebP · Maks 8MB per foto
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label htmlFor="caption">Cerita / Caption</Label>
              <Textarea
                id="caption"
                placeholder="Apa yang membuat momen ini istimewa?"
                value={form.caption}
                onChange={(e) => setForm({ ...form, caption: e.target.value })}
                rows={4}
                maxLength={500}
              />
              <p className="text-right text-xs text-muted-foreground">
                {form.caption.length} / 500
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="memoryDate">Tanggal</Label>
                <Input
                  id="memoryDate"
                  type="date"
                  value={form.memoryDate}
                  onChange={(e) => setForm({ ...form, memoryDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Lokasi (opsional)</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="location"
                    placeholder="Pantai Kuta, Bali"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select
                value={form.category}
                onValueChange={(v: string) => setForm({ ...form, category: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.memory.map((cat) => {
                    const Icon = categoryIcon[cat.value as keyof typeof categoryIcon];
                    return (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {categoryLabel[cat.value as keyof typeof categoryLabel]}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (opsional)</Label>
              <Input
                id="tags"
                placeholder="Pisahkan dengan koma, mis: bali, sunset, anniversary"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
              />
              <div className="flex flex-wrap gap-1.5">
                {form.tags
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean)
                  .map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Batal
          </Button>
          <Button type="submit" size="lg" disabled={loading || form.photos.length === 0}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Simpan kenangan
          </Button>
        </div>
      </form>
    </div>
  );
}