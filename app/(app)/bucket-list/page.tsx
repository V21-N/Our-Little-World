"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Check,
  Circle,
  Clock,
  ListChecks,
  MoreHorizontal,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import { apiFetch } from "@/lib/api/client";
import type { BucketItem, BucketStatus } from "@/lib/types";
import { CATEGORIES } from "@/lib/constants";
import { toast } from "sonner";

interface BucketListResponse {
  items: BucketItem[];
  progress: number;
  total: number;
  completed: number;
}

export default function BucketListPage() {
  const [data, setData] = useState<BucketListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<BucketStatus | "all">("all");

  const reload = () => {
    apiFetch<BucketListResponse>("/api/bucket-list", { revalidate: true })
      .then((res) => {
        if (res.success) setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    reload();
  }, []);

  const updateStatus = async (item: BucketItem, status: BucketStatus) => {
    const res = await apiFetch(`/api/bucket-list/${item.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    if (res.success) {
      toast.success(status === "completed" ? "Impian tercapai! 🎉" : "Status diperbarui");
      reload();
    } else {
      toast.error(res.error);
    }
  };

  const handleDelete = async (item: BucketItem) => {
    const res = await apiFetch(`/api/bucket-list/${item.id}`, { method: "DELETE" });
    if (res.success) {
      toast.success("Item dihapus");
      reload();
    } else {
      toast.error(res.error);
    }
  };

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
        <div className="mb-6 animate-pulse rounded-3xl border border-border/60 bg-card h-20" />
        <div className="mb-4 flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 w-20 animate-pulse rounded-full bg-muted" />
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl border border-border/60 bg-card" />
          ))}
        </div>
      </div>
    );
  }

  const bucketItems = data?.items ?? [];
  const completed = data?.completed ?? 0;
  const progress = data?.progress ?? 0;

  const filtered = bucketItems.filter((b) => filter === "all" || b.status === filter);
  const sorted = [...filtered].sort((a, b) => {
    if (a.status === "completed" && b.status !== "completed") return 1;
    if (a.status !== "completed" && b.status === "completed") return -1;
    return (a.targetDate ?? "z").localeCompare(b.targetDate ?? "z");
  });

  const countBy = (s: BucketStatus | "all") =>
    s === "all" ? bucketItems.length : bucketItems.filter((b) => b.status === s).length;

  return (
    <div className="mx-auto max-w-4xl px-5 py-6 lg:py-10 lg:pr-8">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Bucket List
          </p>
          <h1 className="mt-1 font-serif text-3xl tracking-tight md:text-4xl">
            Impian kita
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {completed} dari {bucketItems.length} sudah tercapai · {progress}%
          </p>
        </div>
        <Button asChild>
          <Link href="/bucket-list/new">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Tambah</span>
          </Link>
        </Button>
      </header>

      <Card className="mb-6 overflow-hidden border-border/60 bg-gradient-to-br from-emerald-50 via-card to-amber-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Progress bersama</span>
            <span className="font-serif text-2xl font-semibold tabular-nums">
              {progress}%
            </span>
          </div>
          <Progress value={progress} className="mt-3 h-2" />
        </CardContent>
      </Card>

      <div className="mb-6 flex flex-wrap gap-2">
        <Badge
          variant={filter === "all" ? "default" : "soft"}
          className="cursor-pointer px-3 py-1.5 text-xs"
          onClick={() => setFilter("all")}
        >
          Semua ({countBy("all")})
        </Badge>
        <Badge
          variant={filter === "planned" ? "default" : "soft"}
          className="cursor-pointer px-3 py-1.5 text-xs"
          onClick={() => setFilter("planned")}
        >
          Direncanakan ({countBy("planned")})
        </Badge>
        <Badge
          variant={filter === "in_progress" ? "default" : "soft"}
          className="cursor-pointer gap-1 px-3 py-1.5 text-xs"
          onClick={() => setFilter("in_progress")}
        >
          <Clock className="h-3 w-3" />
          Berjalan ({countBy("in_progress")})
        </Badge>
        <Badge
          variant={filter === "completed" ? "default" : "soft"}
          className="cursor-pointer gap-1 px-3 py-1.5 text-xs"
          onClick={() => setFilter("completed")}
        >
          <Check className="h-3 w-3" />
          Tercapai ({countBy("completed")})
        </Badge>
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          icon={<ListChecks className="h-6 w-6" />}
          title="Belum ada impian"
          description="Mulai daftar hal-hal yang ingin kalian lakukan bersama."
          action={
            <Button asChild>
              <Link href="/bucket-list/new">
                <Plus className="h-4 w-4" />
                Tambah Impian Pertama
              </Link>
            </Button>
          }
        />
      ) : (
        <ul className="space-y-3">
          {sorted.map((item) => {
            const cat = CATEGORIES.bucket.find((c) => c.value === item.category);
            return (
              <li key={item.id}>
                <Card
                  className={`group border-border/60 transition hover:border-primary/30 ${
                    item.status === "completed"
                      ? "bg-gradient-to-br from-emerald-50/60 via-card to-card"
                      : ""
                  }`}
                >
                  <CardContent className="flex items-start gap-3 p-4">
                    <button
                      className="mt-0.5 shrink-0"
                      onClick={() => {
                        if (item.status === "completed") {
                          updateStatus(item, "planned");
                        } else {
                          updateStatus(item, item.status === "in_progress" ? "completed" : "in_progress");
                        }
                      }}
                      aria-label={
                        item.status === "completed"
                          ? "Tandai belum selesai"
                          : "Tandai selesai"
                      }
                    >
                      {item.status === "completed" ? (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                          <Check className="h-3.5 w-3.5" strokeWidth={3} />
                        </span>
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground transition group-hover:text-primary" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3
                            className={`font-serif text-lg leading-tight ${
                              item.status === "completed"
                                ? "text-muted-foreground line-through decoration-1"
                                : ""
                            }`}
                          >
                            {item.title}
                          </h3>
                          {item.description && (
                            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {item.status !== "completed" && (
                              <DropdownMenuItem
                                onSelect={(e) => {
                                  e.preventDefault();
                                  updateStatus(item, "completed");
                                }}
                              >
                                Tandai selesai
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-destructive"
                              onSelect={(e) => {
                                e.preventDefault();
                                handleDelete(item);
                              }}
                            >
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
                        {cat && <Badge variant="outline" className="text-[10px]">{cat.label}</Badge>}
                        {item.targetDate && (
                          <span>Target {formatDate(item.targetDate, { day: "numeric", month: "short", year: "numeric" })}</span>
                        )}
                        {item.status === "completed" && item.completedDate && (
                          <Badge variant="success" className="text-[10px]">
                            ✓ Tercapai {formatDate(item.completedDate, { day: "numeric", month: "short" })}
                          </Badge>
                        )}
                        {item.status === "in_progress" && (
                          <Badge variant="warning" className="text-[10px]">
                            Berjalan
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}