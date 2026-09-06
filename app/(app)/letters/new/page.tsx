"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { OPEN_WHEN_TAGS } from "@/lib/constants";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function NewLetterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    content: "",
    openWhenTag: "",
    scheduleEnabled: false,
    unlockAt: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/letters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          content: form.content,
          openWhenTag: form.openWhenTag || undefined,
          unlockAt: form.scheduleEnabled && form.unlockAt
            ? new Date(form.unlockAt).toISOString()
            : undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Suratmu sudah terkirim 💌");
        router.push("/letters");
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
        <Link href="/letters">
          <ArrowLeft className="h-4 w-4" />
          Letters
        </Link>
      </Button>

      <header className="mb-6">
        <h1 className="font-serif text-3xl tracking-tight md:text-4xl">Tulis surat</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Surat yang dikirim tidak dapat diedit. Tulis dengan tenang.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card className="border-border/60">
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label>Judul</Label>
              <Input
                placeholder="Mis: Untuk hari-harimu yang berat"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label>Isi Surat</Label>
              <Textarea
                placeholder="Hai sayang,&#10;&#10;Kalau kamu baca ini, ..."
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                required
                rows={10}
                maxLength={2000}
              />
              <p className="text-right text-xs text-muted-foreground">
                {form.content.length} / 2000
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-secondary/30">
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Sparkles className="h-4 w-4 text-primary" />
              Open When
            </div>

            <div className="space-y-2">
              <Label>Pilih konteks (opsional)</Label>
              <Select
                value={form.openWhenTag}
                onValueChange={(v) => setForm({ ...form, openWhenTag: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tanpa konteks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tanpa konteks</SelectItem>
                  {OPEN_WHEN_TAGS.map((tag) => (
                    <SelectItem key={tag.value} value={tag.value}>
                      {tag.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-background/60 p-4">
              <div>
                <Label htmlFor="schedule" className="cursor-pointer">
                  Jadwalkan pembukaan
                </Label>
                <p className="text-xs text-muted-foreground">
                  Surat tidak akan bisa dibuka sampai tanggal yang ditentukan
                </p>
              </div>
              <Switch
                id="schedule"
                checked={form.scheduleEnabled}
                onCheckedChange={(v) =>
                  setForm({ ...form, scheduleEnabled: v })
                }
              />
            </div>

            {form.scheduleEnabled && (
              <div className="space-y-2">
                <Label>Tanggal & waktu pembukaan</Label>
                <Input
                  type="datetime-local"
                  value={form.unlockAt}
                  onChange={(e) => setForm({ ...form, unlockAt: e.target.value })}
                  required={form.scheduleEnabled}
                />
              </div>
            )}

            <div className="flex flex-wrap gap-1.5">
              {OPEN_WHEN_TAGS.slice(0, 4).map((tag) => (
                <Badge
                  key={tag.value}
                  variant="soft"
                  className={cn(
                    "cursor-pointer text-xs",
                    form.openWhenTag === tag.value && "bg-primary/20 text-primary",
                  )}
                  onClick={() => setForm({ ...form, openWhenTag: tag.value })}
                >
                  {tag.label}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Batal
          </Button>
          <Button type="submit" size="lg" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Kirim surat
          </Button>
        </div>
      </form>
    </div>
  );
}