"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES } from "@/lib/constants";
import { toast } from "sonner";

export default function NewFuturePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "dream",
    targetDate: "",
    timeCapsuleEnabled: false,
    unlockDate: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/future", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description || undefined,
          category: form.category,
          targetDate: form.targetDate || undefined,
          unlockDate: form.timeCapsuleEnabled && form.unlockDate
            ? form.unlockDate
            : undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Ditambahkan ke masa depan kita ✨");
        router.push("/future");
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
        <Link href="/future">
          <ArrowLeft className="h-4 w-4" />
          Future Us
        </Link>
      </Button>

      <header className="mb-6">
        <h1 className="font-serif text-3xl tracking-tight md:text-4xl">
          Tambahkan ke masa depan
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Mimpi, rencana, atau surat untuk diri kalian di masa depan.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card className="border-border/60">
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label>Judul</Label>
              <Input
                placeholder="Punya rumah kecil di pinggir kota"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Deskripsi / Surat</Label>
              <Textarea
                placeholder="Ceritakan lebih detail..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={6}
              />
            </div>

            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm({ ...form, category: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.future.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Target tanggal (opsional)</Label>
              <Input
                type="date"
                value={form.targetDate}
                onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-secondary/30">
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="cursor-pointer">Kunci sebagai Time Capsule</Label>
                <p className="text-xs text-muted-foreground">
                  Konten tidak akan terbaca sampai tanggal yang ditentukan
                </p>
              </div>
              <Switch
                checked={form.timeCapsuleEnabled}
                onCheckedChange={(v) =>
                  setForm({ ...form, timeCapsuleEnabled: v })
                }
              />
            </div>

            {form.timeCapsuleEnabled && (
              <div className="space-y-2">
                <Label>Tanggal pembukaan</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="date"
                    className="pl-9"
                    value={form.unlockDate}
                    onChange={(e) => setForm({ ...form, unlockDate: e.target.value })}
                    required={form.timeCapsuleEnabled}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Batal
          </Button>
          <Button type="submit" size="lg" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Simpan
          </Button>
        </div>
      </form>
    </div>
  );
}