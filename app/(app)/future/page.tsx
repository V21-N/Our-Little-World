"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock, Loader2, Plus, Sparkles, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import { CATEGORIES } from "@/lib/constants";
import type { FutureItem } from "@/lib/types";

const daysUntil = (date: string) => {
  const ms = new Date(date).getTime() - new Date().getTime();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
};

export default function FuturePage() {
  const [items, setItems] = useState<FutureItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "locked" | "unlocked">("all");

  useEffect(() => {
    fetch("/api/future")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setItems(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const sorted = [...items].sort((a, b) =>
    (a.unlockDate ?? a.targetDate ?? "z").localeCompare(b.unlockDate ?? b.targetDate ?? "z"),
  );

  const filtered = sorted.filter((item) => {
    if (filter === "all") return true;
    if (filter === "locked")
      return item.unlockDate && new Date(item.unlockDate) > new Date();
    return !item.unlockDate || new Date(item.unlockDate) <= new Date();
  });

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-6 lg:py-10 lg:pr-8">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Future Us
          </p>
          <h1 className="mt-1 font-serif text-3xl tracking-tight md:text-4xl">
            Kita di masa depan
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Mimpi, rencana, dan surat untuk diri kalian di masa depan.
          </p>
        </div>
        <Button asChild>
          <Link href="/future/new">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Tambah</span>
          </Link>
        </Button>
      </header>

      <div className="mb-6 flex flex-wrap gap-2">
        <Badge
          variant={filter === "all" ? "default" : "soft"}
          className="cursor-pointer px-3 py-1.5 text-xs"
          onClick={() => setFilter("all")}
        >
          Semua ({sorted.length})
        </Badge>
        <Badge
          variant={filter === "locked" ? "default" : "soft"}
          className="cursor-pointer gap-1 px-3 py-1.5 text-xs"
          onClick={() => setFilter("locked")}
        >
          <Lock className="h-3 w-3" />
          Terkunci
        </Badge>
        <Badge
          variant={filter === "unlocked" ? "default" : "soft"}
          className="cursor-pointer gap-1 px-3 py-1.5 text-xs"
          onClick={() => setFilter("unlocked")}
        >
          <Unlock className="h-3 w-3" />
          Terbuka
        </Badge>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="h-6 w-6" />}
          title="Belum ada rencana"
          description="Mulai tulis harapan, impian, atau surat untuk diri kalian di masa depan."
          action={
            <Button asChild>
              <Link href="/future/new">
                <Plus className="h-4 w-4" />
                Tambah Item
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((item) => {
            const cat = CATEGORIES.future.find((c) => c.value === item.category);
            const isLocked = item.unlockDate && new Date(item.unlockDate) > new Date();
            const dDays = item.unlockDate ? daysUntil(item.unlockDate) : 0;

            return (
              <Card
                key={item.id}
                className={`relative overflow-hidden border-border/60 transition hover:border-primary/30 ${
                  isLocked
                    ? "bg-gradient-to-br from-muted/60 via-secondary/40 to-accent/30"
                    : "bg-gradient-to-br from-primary/8 via-card to-secondary/30"
                }`}
              >
                <CardContent className="space-y-3 pt-6">
                  <div className="flex items-start justify-between gap-2">
                    {cat && (
                      <Badge variant="soft" className="text-[10px]">
                        {cat.label}
                      </Badge>
                    )}
                    {isLocked ? (
                      <Badge variant="warning" className="gap-1 text-[10px]">
                        <Lock className="h-3 w-3" />
                        Terkunci
                      </Badge>
                    ) : item.unlockDate ? (
                      <Badge variant="success" className="gap-1 text-[10px]">
                        <Unlock className="h-3 w-3" />
                        Terbuka
                      </Badge>
                    ) : null}
                  </div>

                  <h3 className="font-serif text-xl leading-tight tracking-tight">
                    {item.title}
                  </h3>

                  {isLocked ? (
                    <div className="flex items-center gap-2 rounded-xl bg-background/40 p-3 text-sm">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Terbuka dalam{" "}
                        <strong className="text-foreground">
                          {dDays.toLocaleString("id-ID")} hari
                        </strong>
                      </span>
                    </div>
                  ) : (
                    <p className="line-clamp-4 text-sm leading-relaxed text-foreground/80">
                      {item.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border/40 pt-3 text-xs text-muted-foreground">
                    {item.targetDate && (
                      <span>
                        Target:{" "}
                        {formatDate(item.targetDate, {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    )}
                    {item.unlockDate && (
                      <span>
                        · Buka:{" "}
                        {formatDate(item.unlockDate, {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}