"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES } from "@/lib/constants";
import { toast } from "sonner";

export default function NewBucketPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "experience",
    targetDate: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/bucket-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description || undefined,
          category: form.category,
          targetDate: form.targetDate || undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Impian baru ditambahkan ✨");
        router.push("/bucket-list");
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
        <Link href="/bucket-list">
          <ArrowLeft className="h-4 w-4" />
          Bucket List
        </Link>
      </Button>

      <header className="mb-6">
        <h1 className="font-serif text-3xl tracking-tight md:text-4xl">
          Tambah impian baru
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Apa yang ingin kalian lakukan bersama?
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card className="border-border/60">
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label>Impian</Label>
              <Input
                placeholder="Mis: Honeymoon di Kyoto"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label>Cerita / Detail (opsional)</Label>
              <Textarea
                placeholder="Apa yang membuat ini istimewa?"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
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
                    {CATEGORIES.bucket.map((cat) => (
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
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Batal
          </Button>
          <Button type="submit" size="lg" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Tambah ke daftar
          </Button>
        </div>
      </form>
    </div>
  );
}