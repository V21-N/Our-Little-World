"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, CalendarDays, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import type { TimelineEvent } from "@/lib/types";

export default function StoryPage() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/timeline")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setEvents(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const sorted = [...events].sort((a, b) => a.eventDate.localeCompare(b.eventDate));

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
                <p className="font-serif text-xs uppercase tracking-[0.18em] text-primary">
                  {i === 0 ? "Awal cerita" : `Bab ${i + 1}`}
                </p>
                <h2 className="mt-1 font-serif text-2xl tracking-tight">
                  {event.title}
                </h2>
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
    </div>
  );
}