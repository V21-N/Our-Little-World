"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ImagePlus, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TIMELINE_PRESETS } from "@/lib/constants";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/hooks/use-auth";
import { uploadFile } from "@/lib/api/client";

export default function NewStoryPage() {
  const router = useRouter();
  const { couple } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    eventDate: new Date().toISOString().split("T")[0],
    location: "",
    description: "",
  });

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !couple) return;
    setUploading(true);
    const result = await uploadFile(file, "timeline", couple.id);
    setUploading(false);
    if (result.success && result.url) {
      setImageUrl(result.url);
    } else {
      toast.error(result.error ?? "Upload gagal");
    }
    e.target.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/timeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          eventDate: form.eventDate,
          location: form.location || undefined,
          description: form.description || undefined,
          imageUrl: imageUrl ?? undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Momen baru ditambahkan ✨");
        router.push("/story");
      } else {
        toast.error(json.error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-5 py-6 lg:py-10 lg:pr-8">
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link href="/story">
          <ArrowLeft className="h-4 w-4" />
          Our Story
        </Link>
      </Button>

      <header className="mb-6">
        <h1 className="font-serif text-3xl tracking-tight md:text-4xl">Tambah momen</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Setiap bab dalam cerita kalian layak untuk disimpan.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card className="border-border/60">
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label>Judul</Label>
              <Input
                placeholder="First Meet, Anniversary, dst."
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
              <div className="flex flex-wrap gap-1.5">
                {TIMELINE_PRESETS.map((preset) => (
                  <Badge
                    key={preset}
                    variant="soft"
                    className={cn(
                      "cursor-pointer text-xs",
                      form.title === preset && "bg-primary/20 text-primary",
                    )}
                    onClick={() => setForm({ ...form, title: preset })}
                  >
                    {preset}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Tanggal</Label>
                <Input
                  type="date"
                  value={form.eventDate}
                  onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Lokasi</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Taman Kota, Jakarta"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cerita</Label>
              <Textarea
                placeholder="Apa yang terjadi di momen ini?"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={5}
              />
            </div>

            <div className="space-y-2">
              <Label>Foto (opsional, 1 foto)</Label>
              <label className="flex aspect-[3/2] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border/60 bg-muted/30 text-muted-foreground transition hover:border-primary/40 hover:text-primary">
                {uploading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <>
                    <ImagePlus className="h-6 w-6" />
                    <span className="text-xs">Upload foto</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={onFileChange}
                  disabled={uploading}
                />
              </label>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Batal
          </Button>
          <Button type="submit" size="lg" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Simpan momen
          </Button>
        </div>
      </form>
    </div>
  );
}