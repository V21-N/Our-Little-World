"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Star, MapPin, BookHeart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import { useApiData } from "@/lib/hooks/use-api";
import { apiFetch } from "@/lib/api/client";
import type { Memory } from "@/lib/types";
import {
  categoryIcon,
  categoryLabel,
  categoryGradients,
} from "@/lib/category-icons";
import { MemoriesFilterBar } from "@/components/memories/memories-filter";

interface ListResponse {
  items: Memory[];
  nextCursor: string | null;
}

export default function MemoriesPage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [started, setStarted] = useState(false);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("limit", "50");
    if (activeCategory) params.set("category", activeCategory);
    if (favoritesOnly) params.set("favorite", "true");
    if (query) params.set("search", query);

    setLoading(true);
    setStarted(true);
    apiFetch<{ items: Memory[] }>(`/api/memories?${params.toString()}`)
      .then((res) => {
        if (res.success) setMemories(res.data.items);
        setLoading(false);
      });
  }, [query, activeCategory, favoritesOnly]);

  const displayed = useMemo(() => {
    if (!query && !activeCategory && !favoritesOnly) return memories;
    return memories;
  }, [memories, query, activeCategory, favoritesOnly]);

  if (!started || loading) {
    return (
      <div className="mx-auto max-w-5xl px-5 py-6 lg:py-10 lg:pr-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-8 w-64 animate-pulse rounded bg-muted" />
            <div className="mt-1 h-4 w-48 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-10 w-28 animate-pulse rounded-xl bg-muted" />
        </div>
        <div className="h-10 w-full animate-pulse rounded-xl bg-muted" />
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-square animate-pulse rounded-2xl border border-border/60 bg-card" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-6 lg:py-10 lg:pr-8">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Memories
          </p>
          <h1 className="mt-1 font-serif text-3xl tracking-tight md:text-4xl">
            Kenangan kita
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {displayed.length} kenangan tersimpan, satu untuk setiap momen berharga.
          </p>
        </div>
        <Button asChild>
          <Link href="/memories/new">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Tambah Memori</span>
            <span className="sm:hidden">Baru</span>
          </Link>
        </Button>
      </header>

      <MemoriesFilterBar
        query={query}
        onQueryChange={setQuery}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        showFavoritesOnly={favoritesOnly}
        onToggleFavorites={() => setFavoritesOnly((v) => !v)}
        resultCount={displayed.length}
      />

      <div className="mt-6">
        {displayed.length === 0 ? (
          <EmptyState
            icon={<BookHeart className="h-6 w-6" />}
            title="Tidak ada kenangan ditemukan"
            description="Coba ubah filter atau kata kunci pencarianmu."
            action={
              <Button
                variant="outline"
                onClick={() => {
                  setQuery("");
                  setActiveCategory(null);
                  setFavoritesOnly(false);
                }}
              >
                Reset filter
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {displayed.map((memory) => {
              const Icon = categoryIcon[memory.category];
              return (
                <Link
                  key={memory.id}
                  href={`/memories/${memory.id}`}
                  className="group relative"
                >
                  <Card
                    className={`relative overflow-hidden border-border/60 bg-gradient-to-br ${categoryGradients[memory.category]} aspect-square`}
                  >
                    {memory.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={memory.images[0].url}
                        alt={memory.caption ?? "Memory"}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <div className={`absolute inset-0 bg-gradient-to-br ${categoryGradients[memory.category]}`} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />
                    <div className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-medium shadow-sm">
                      <Icon className="h-3 w-3 text-primary" />
                      {categoryLabel[memory.category]}
                    </div>
                    {memory.isFavorite && (
                      <Star
                        className="absolute right-2.5 top-2.5 h-4 w-4 text-amber-400 drop-shadow"
                        fill="currentColor"
                      />
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                      <p className="line-clamp-3 text-xs font-medium leading-snug sm:text-sm">
                        {memory.caption}
                      </p>
                      <div className="mt-1.5 flex items-center gap-1 text-[10px] opacity-90">
                        {memory.location && (
                          <>
                            <MapPin className="h-2.5 w-2.5" />
                            <span className="truncate">{memory.location}</span>
                          </>
                        )}
                      </div>
                      <p className="mt-0.5 text-[10px] opacity-80">
                        {formatDate(memory.memoryDate, { day: "numeric", month: "short" })}
                      </p>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}