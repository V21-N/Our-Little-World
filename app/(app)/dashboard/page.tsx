"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookHeart,
  CalendarDays,
  Heart,
  ListChecks,
  MessageCircleHeart,
  Plus,
  Sparkles,
  Star,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RelationshipCounter } from "@/components/relationship-counter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ROMANTIC_MESSAGES } from "@/lib/constants";
import { cn, formatDate, initials, timeAgo } from "@/lib/utils";
import { useAuth } from "@/lib/hooks/use-auth";
import { useNotifications } from "@/lib/hooks/use-notifications";
import { DailyRitual } from "@/components/daily-ritual";
import { apiFetch } from "@/lib/api/client";
import type { Memory, LoveLetter, TimelineEvent, DailyMood, Achievement } from "@/lib/types";

const categoryIcons = {
  date: Heart,
  trip: Sparkles,
  food: Heart,
  random: Sparkles,
  celebration: Heart,
  special_moment: Heart,
} as const;

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 18) return "Selamat sore";
  return "Selamat malam";
};

interface DashboardData {
  memories: Memory[];
  latestLetter: LoveLetter | null;
  bucketProgress: number;
  bucketCompleted: number;
  bucketTotal: number;
  todayMoodMe: DailyMood | null;
  todayMoodPartner: DailyMood | null;
  timelineEvents: TimelineEvent[];
  achievements: Achievement[];
  unlockedCount: number;
}

const romanticMessage =
  ROMANTIC_MESSAGES[Math.floor(Math.random() * ROMANTIC_MESSAGES.length)];

export default function DashboardPage() {
  const { profile, couple } = useAuth();
  const { tick } = useNotifications();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [memoriesRes, lettersRes, bucketRes, moodRes, timelineRes, achievementRes] =
        await Promise.all([
          apiFetch<{ items: Memory[] }>("/api/memories?limit=4", { revalidate: true }),
          apiFetch<LoveLetter[]>("/api/letters"),
          apiFetch<{
            items: unknown[];
            progress: number;
            total: number;
            completed: number;
          }>("/api/bucket-list"),
          apiFetch<{
            myToday: DailyMood | null;
            partnerToday: DailyMood | null;
            history: DailyMood[];
          }>("/api/mood"),
          apiFetch<TimelineEvent[]>("/api/timeline"),
          apiFetch<{
            all: Achievement[];
            unlocked: Achievement[];
            unlockedCount: number;
          }>("/api/achievements"),
        ]);

      const todayStr = new Date().toISOString().split("T")[0];
      let myToday: DailyMood | null = null;
      let partnerToday: DailyMood | null = null;
      if (moodRes.success && couple) {
        myToday =
          moodRes.data.history.find((m) => m.moodDate === todayStr) ?? moodRes.data.myToday;
        partnerToday = moodRes.data.partnerToday ?? null;
      }

      const unlockedLetters =
        lettersRes.success
          ? lettersRes.data
              .filter((l) => !l.unlockAt || new Date(l.unlockAt) <= new Date())
              .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
          : [];
      const latestLetter = unlockedLetters[0] ?? null;

      setData({
        memories: memoriesRes.success ? memoriesRes.data.items : [],
        latestLetter,
        bucketProgress: bucketRes.success ? bucketRes.data.progress : 0,
        bucketCompleted: bucketRes.success ? bucketRes.data.completed : 0,
        bucketTotal: bucketRes.success ? bucketRes.data.total : 0,
        todayMoodMe: myToday,
        todayMoodPartner: partnerToday,
        timelineEvents: timelineRes.success ? timelineRes.data.slice(0, 3) : [],
        achievements: achievementRes.success ? achievementRes.data.all : [],
        unlockedCount: achievementRes.success ? achievementRes.data.unlockedCount : 0,
      });
      setLoading(false);
    };
    load();
  }, [couple?.id, tick]);

  if (!couple || !profile) return null;

  const upcomingAnniversary = (() => {
    const start = new Date(couple.relationshipStartDate);
    const thisYear = new Date().getFullYear();
    const next = new Date(thisYear, start.getMonth(), start.getDate());
    if (next < new Date()) next.setFullYear(thisYear + 1);
    const daysUntil = Math.ceil((next.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return { date: next, daysUntil };
  })();

  const myName = profile?.nickname ?? profile?.fullName.split(" ")[0] ?? "kamu";
  const coupleName = couple.coupleName || `${profile.fullName.split(" ")[0]} & Pasanganmu`;

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-5 py-6 lg:py-10 lg:pr-8">
        <div className="mb-8 flex flex-col gap-4">
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          <div className="h-10 w-48 animate-pulse rounded bg-muted" />
          <div className="h-4 w-64 animate-pulse rounded bg-muted" />
        </div>
        <div className="mb-8 animate-pulse rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/10 via-accent/20 to-secondary/40 p-5 lg:p-7">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
          </div>
          <div className="h-8 w-40 animate-pulse rounded bg-muted" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl border border-border/60 bg-card" />
          ))}
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="h-64 animate-pulse rounded-2xl border border-border/60 bg-card" />
          <div className="h-64 animate-pulse rounded-2xl border border-border/60 bg-card" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-6 lg:py-10 lg:pr-8">
      <section className="mb-8 flex flex-col gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            {formatDate(new Date(), {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <h1 className="mt-1 flex flex-wrap items-center gap-2 font-serif text-3xl tracking-tight md:text-4xl">
            {greeting()}, {myName}
            <Heart className="h-5 w-5 text-primary heartbeat" fill="currentColor" />
          </h1>
          <p className="mt-2 max-w-md text-sm italic text-muted-foreground">
            &ldquo;{romanticMessage}&rdquo;
          </p>
        </div>
      </section>

      <section className="mb-8 rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/10 via-accent/20 to-secondary/40 p-5 lg:p-7">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary/80">
              Kita Berdua
            </p>
            <h2 className="mt-1 flex items-center gap-2 font-serif text-xl lg:text-2xl">
              {coupleName}
              <Heart className="h-4 w-4 text-primary heartbeat" fill="currentColor" />
            </h2>
          </div>
          <Badge variant="default" className="gap-1">
            <Heart className="h-3 w-3 heartbeat" fill="currentColor" />
            {Math.floor(
              (Date.now() - new Date(couple.relationshipStartDate).getTime()) /
                (1000 * 60 * 60 * 24 * 365),
            )}{" "}
            tahun
          </Badge>
        </div>
        <RelationshipCounter startDate={couple.relationshipStartDate} />
      </section>

      <DailyRitual />

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="md:col-span-1">
          <CardContent className="flex h-full flex-col gap-3 pt-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Anniversary Berikutnya
              </p>
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-serif text-3xl font-semibold tabular-nums">
                {upcomingAnniversary.daysUntil}
                <span className="ml-1 text-base font-normal text-muted-foreground">hari lagi</span>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatDate(upcomingAnniversary.date, {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex h-full flex-col gap-3 pt-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Bucket List
              </p>
              <ListChecks className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-serif text-3xl font-semibold tabular-nums">
                {data?.bucketProgress ?? 0}
                <span className="text-base font-normal text-muted-foreground">%</span>
              </p>
              <Progress value={data?.bucketProgress ?? 0} className="mt-2 h-1.5" />
              <p className="mt-2 text-xs text-muted-foreground">
                {data?.bucketCompleted ?? 0} dari {data?.bucketTotal ?? 0} sudah tercapai
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex h-full flex-col gap-3 pt-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Mood Hari Ini
              </p>
              <Heart className="h-4 w-4 text-primary heartbeat" fill="currentColor" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-center gap-1">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile.avatarUrl || undefined} />
                  <AvatarFallback>{initials(profile.fullName)}</AvatarFallback>
                </Avatar>
                <span className="text-xl">
                  {data?.todayMoodMe ? moodEmoji(data.todayMoodMe.mood) : "-"}
                </span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Avatar className="h-10 w-10 opacity-60">
                  <AvatarFallback>{initials("Pasangan")}</AvatarFallback>
                </Avatar>
                <span className="text-xl">
                  {data?.todayMoodPartner ? moodEmoji(data.todayMoodPartner.mood) : "-"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-xl">Memori Terbaru</h2>
              <Link
                href="/memories"
                className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                Lihat semua
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(data?.memories ?? []).map((m) => {
                const Icon = categoryIcons[m.category] ?? Heart;
                return (
                  <Link
                    key={m.id}
                    href={`/memories/${m.id}`}
                    className="group relative aspect-square overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/15 via-accent/30 to-secondary/40"
                  >
                    {m.images[0] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={m.images[0].url}
                        alt={m.caption ?? "Memory"}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium text-foreground shadow-sm">
                      <Icon className="h-3 w-3 text-primary" />
                      {m.category.replace("_", " ")}
                    </div>
                    {m.isFavorite && (
                      <Star
                        className="absolute right-3 top-3 h-4 w-4 text-amber-400"
                        fill="currentColor"
                      />
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                      <p className="line-clamp-2 text-xs font-medium">{m.caption}</p>
                      <p className="mt-1 text-[10px] opacity-80">
                        {formatDate(m.memoryDate, { day: "numeric", month: "short" })}
                      </p>
                    </div>
                  </Link>
                );
              })}
              {(data?.memories ?? []).length === 0 && (
                <p className="col-span-2 text-sm text-muted-foreground">
                  Belum ada memori. Mulai simpan kenangan kalian!
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {data?.latestLetter && (
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-serif text-xl">Surat Terbaru</h2>
                  <Link
                    href="/letters"
                    className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    Lihat semua
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
                <Link
                  href={`/letters/${data.latestLetter.id}`}
                  className="block rounded-2xl border border-border/60 bg-secondary/40 p-4 transition hover:border-primary/30"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                      <MessageCircleHeart className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-serif text-lg leading-tight">{data.latestLetter.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {data.latestLetter.senderId === profile.id
                          ? "dari kamu"
                          : "dari pasanganmu"}{" "}
                        · {timeAgo(data.latestLetter.createdAt)}
                      </p>
                      <p className="mt-3 line-clamp-3 text-sm text-foreground/70">
                        {data.latestLetter.content}
                      </p>
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-serif text-xl">Lencana</h2>
                <Link
                  href="/achievements"
                  className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  {data?.unlockedCount ?? 0} terbuka
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {(data?.achievements ?? []).slice(0, 6).map((a: any) => (
                  <div
                    key={a.id}
                    className={`flex aspect-square items-center justify-center rounded-xl text-2xl ${
                      a.isUnlocked ? "bg-secondary/40" : "bg-muted/40 grayscale opacity-40"
                    }`}
                    title={a.title}
                  >
                    {a.isUnlocked ? a.icon : "🔒"}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-xl">Aktivitas Cepat</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <QuickAction
            href="/memories/new"
            icon={BookHeart}
            label="Tambah Memori"
            color="from-rose-100 to-rose-50"
          />
          <QuickAction
            href="/letters/new"
            icon={MessageCircleHeart}
            label="Tulis Surat"
            color="from-amber-100 to-amber-50"
          />
          <QuickAction
            href="/bucket-list/new"
            icon={ListChecks}
            label="Tambah Impian"
            color="from-emerald-100 to-emerald-50"
          />
          <QuickAction
            href="/mood"
            icon={Heart}
            label="Mood Hari Ini"
            color="from-violet-100 to-violet-50"
          />
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-xl">Perjalanan Kita</h2>
          <Link
            href="/story"
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Lihat semua
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <Card>
          <CardContent className="pt-6">
            <ol className="relative space-y-6 border-l border-dashed border-border pl-6">
              {(data?.timelineEvents ?? []).length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Belum ada cerita. Mulai bangun timeline kalian!
                </p>
              )}
              {(data?.timelineEvents ?? []).map((event) => (
                <li key={event.id} className="relative">
                  <span className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full border-4 border-background bg-primary text-[10px] text-primary-foreground">
                    <CalendarDays className="h-2.5 w-2.5" />
                  </span>
                  <p className="font-serif text-base">{event.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatDate(event.eventDate, {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                    {event.location ? ` · ${event.location}` : ""}
                  </p>
                  {event.description && (
                    <p className="mt-1 text-sm text-foreground/70">{event.description}</p>
                  )}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function moodEmoji(mood: string) {
  const map: Record<string, string> = {
    happy: "😊",
    loved: "🥰",
    good: "🙂",
    neutral: "😐",
    tired: "😴",
    sad: "😢",
    angry: "😠",
  };
  return map[mood] ?? "🙂";
}

function QuickAction({
  href,
  icon: Icon,
  label,
  color,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative overflow-hidden flex items-center gap-3 rounded-2xl border border-border/60 bg-gradient-to-br p-4 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md",
        color,
      )}
    >
      <span className="pointer-events-none absolute -right-4 -top-4 text-5xl text-primary/10 opacity-0 transition group-hover:opacity-100 heartbeat">
        ❤
      </span>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/70 text-primary shadow-sm">
        <Icon className="h-4 w-4" />
      </span>
      <span className="flex-1 text-sm font-medium">{label}</span>
      <Plus className="h-4 w-4 text-muted-foreground transition group-hover:rotate-90" />
    </Link>
  );
}