"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock, Loader2, MessageCircleHeart, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate, timeAgo } from "@/lib/utils";
import { OPEN_WHEN_TAGS } from "@/lib/constants";
import { apiFetch } from "@/lib/api/client";
import type { LoveLetter } from "@/lib/types";

interface LetterDTO extends LoveLetter {
  isLocked?: boolean;
}

export default function LettersPage() {
  const [letters, setLetters] = useState<LetterDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unlocked" | "locked">("all");

  useEffect(() => {
    apiFetch<LetterDTO[]>("/api/letters")
      .then((res) => {
        if (res.success) setLetters(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-6 lg:py-10 lg:pr-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-8 w-56 animate-pulse rounded bg-muted" />
            <div className="mt-1 h-4 w-52 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-10 w-28 animate-pulse rounded-xl bg-muted" />
        </div>
        <div className="mb-6 flex gap-2">
          <div className="h-8 w-16 animate-pulse rounded-full bg-muted" />
          <div className="h-8 w-16 animate-pulse rounded-full bg-muted" />
          <div className="h-8 w-20 animate-pulse rounded-full bg-muted" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl border border-border/60 bg-card" />
          ))}
        </div>
      </div>
    );
  }

  const sorted = [...letters].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const filtered = sorted.filter((l) => {
    if (filter === "all") return true;
    const locked = l.isLocked ?? (!!l.unlockAt && new Date(l.unlockAt) > new Date());
    return filter === "locked" ? locked : !locked;
  });

  const lockedCount = sorted.filter(
    (l) => l.isLocked ?? (l.unlockAt && new Date(l.unlockAt) > new Date()),
  ).length;
  const unlockedCount = sorted.length - lockedCount;

  return (
    <div className="mx-auto max-w-4xl px-5 py-6 lg:py-10 lg:pr-8">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Love Letters
          </p>
          <h1 className="mt-1 font-serif text-3xl tracking-tight md:text-4xl">
            Surat untuk kamu
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {unlockedCount} surat terbuka · {lockedCount} surat menunggu waktu yang tepat
          </p>
        </div>
        <Button asChild>
          <Link href="/letters/new">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Tulis Surat</span>
            <span className="sm:hidden">Baru</span>
          </Link>
        </Button>
      </header>

      <div className="mb-6 flex gap-2">
        <Badge
          variant={filter === "all" ? "default" : "soft"}
          className="cursor-pointer px-3 py-1.5 text-xs"
          onClick={() => setFilter("all")}
        >
          Semua ({sorted.length})
        </Badge>
        <Badge
          variant={filter === "unlocked" ? "default" : "soft"}
          className="cursor-pointer px-3 py-1.5 text-xs"
          onClick={() => setFilter("unlocked")}
        >
          Terbuka ({unlockedCount})
        </Badge>
        <Badge
          variant={filter === "locked" ? "default" : "soft"}
          className="cursor-pointer px-3 py-1.5 text-xs"
          onClick={() => setFilter("locked")}
        >
          <Lock className="mr-1 h-3 w-3" />
          Terkunci ({lockedCount})
        </Badge>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<MessageCircleHeart className="h-6 w-6" />}
          title="Belum ada surat"
          description="Tulis pesan yang akan dibuka di waktu yang tepat."
          action={
            <Button asChild>
              <Link href="/letters/new">
                <Plus className="h-4 w-4" />
                Tulis Surat Pertama
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((letter) => {
            const isLocked = letter.isLocked ?? (letter.unlockAt && new Date(letter.unlockAt) > new Date());
            const tag = letter.openWhenTag
              ? OPEN_WHEN_TAGS.find((t) => t.value === letter.openWhenTag)
              : null;

            return (
              <Link
                key={letter.id}
                href={`/letters/${letter.id}`}
                className="group block focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-2xl"
              >
                <Card
                  className={`relative h-full overflow-hidden border-border/60 transition group-hover:-translate-y-0.5 group-hover:shadow-md ${
                    isLocked
                      ? "bg-gradient-to-br from-muted/60 via-secondary/40 to-accent/30"
                      : "bg-gradient-to-br from-primary/8 via-card to-secondary/30"
                  }`}
                >
                  <CardContent className="flex h-full flex-col gap-3 pt-6">
                    <div className="flex items-start justify-between gap-2">
                      {tag ? (
                        <Badge variant="soft" className="gap-1 text-[10px]">
                          <Sparkles className="h-3 w-3" />
                          {tag.label}
                        </Badge>
                      ) : (
                        <Badge variant="soft" className="text-[10px]">
                          Personal
                        </Badge>
                      )}
                      {isLocked ? (
                        <Badge variant="warning" className="gap-1 text-[10px]">
                          <Lock className="h-3 w-3" />
                          Terkunci
                        </Badge>
                      ) : letter.isRead ? (
                        <Badge variant="success" className="text-[10px]">
                          Terbaca
                        </Badge>
                      ) : (
                        <Badge variant="default" className="text-[10px]">
                          Baru
                        </Badge>
                      )}
                    </div>

                    <h3 className="font-serif text-xl leading-tight tracking-tight">
                      {letter.title}
                    </h3>

                    {isLocked ? (
                      <div className="flex flex-col gap-2 rounded-xl bg-background/40 p-3 text-sm text-muted-foreground">
                        <p className="italic">Surat ini belum bisa dibuka...</p>
                        <p className="text-xs">
                          Akan terbuka pada{" "}
                          {formatDate(letter.unlockAt!, {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    ) : (
                      <p className="line-clamp-3 text-sm leading-relaxed text-foreground/70">
                        {letter.content}
                      </p>
                    )}

                    <div className="mt-auto flex items-center justify-between pt-3 text-xs text-muted-foreground">
                      <span>{timeAgo(letter.createdAt)}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}