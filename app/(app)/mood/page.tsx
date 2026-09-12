"use client";

import { useEffect, useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MOODS } from "@/lib/constants";
import { formatDate, initials } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Mood, DailyMood } from "@/lib/types";
import { useAuth } from "@/lib/hooks/use-auth";
import { apiFetch } from "@/lib/api/client";

const today = new Date().toISOString().split("T")[0];

const buildCalendar = () => {
  const now = new Date();
  const days: { date: string; label: string }[] = [];
  for (let i = 27; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days.push({
      date: d.toISOString().split("T")[0],
      label: d.getDate().toString(),
    });
  }
  return days;
};

interface MoodResponse {
  myToday: DailyMood | null;
  partnerToday: DailyMood | null;
  history: DailyMood[];
}

export default function MoodPage() {
  const { profile, couple } = useAuth();
  const [moods, setMoods] = useState<DailyMood[]>([]);
  const [partnerToday, setPartnerToday] = useState<DailyMood | null>(null);
  const [loading, setLoading] = useState(true);
  const [mood, setMood] = useState<Mood | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const reload = () => {
    apiFetch<MoodResponse>("/api/mood", { revalidate: true })
      .then((res: any) => {
        if (res.success) {
          setMoods(res.data.history);
          setPartnerToday(res.data.partnerToday);
          const my = res.data.myToday;
          if (my) {
            setMood(my.mood);
            setNote(my.note ?? "");
          }
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    reload();
  }, []);

  const myId = profile?.id ?? "";

  const myHistory = moods.filter((m) => m.userId === myId).slice(0, 30);
  const partnerFirst = moods.find((m) => m.userId !== myId);
  const partnerId = partnerFirst?.userId ?? "partner";
  const partnerHistory = moods
    .filter((m) => m.userId === partnerId && m.userId !== myId)
    .slice(0, 30);

  const myToday = moods.find((m) => m.userId === myId && m.moodDate === today);

  const days = buildCalendar();
  const moodByDate = (userId: string) =>
    Object.fromEntries(
      moods.filter((m) => m.userId === userId).map((m) => [m.moodDate, m.mood]),
    );

  const submit = async () => {
    if (!mood) {
      toast.error("Pilih mood dulu");
      return;
    }
    setSaving(true);
    const res = await apiFetch("/api/mood", {
      method: "POST",
      body: JSON.stringify({ mood, note: note || undefined }),
    });
    setSaving(false);
    if (res.success) {
      toast.success("Mood tersimpan untuk hari ini ✨");
      reload();
    } else {
      toast.error(res.error);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-6 lg:py-10 lg:pr-8">
        <div className="mb-6">
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-8 w-64 animate-pulse rounded bg-muted" />
          <div className="mt-1 h-4 w-72 animate-pulse rounded bg-muted" />
        </div>
        <div className="mb-6 h-80 animate-pulse rounded-3xl border border-border/60 bg-card" />
        <div className="h-12 w-full animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-6 lg:py-10 lg:pr-8">
      <header className="mb-6">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Daily Mood
        </p>
        <h1 className="mt-1 font-serif text-3xl tracking-tight md:text-4xl">
          Bagaimana harimu?
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Mood kamu hari ini bisa dilihat pasangan, dan sebaliknya.
        </p>
      </header>

      <Card className="mb-6 overflow-hidden border-border/60 bg-gradient-to-br from-primary/8 via-card to-secondary/30">
        <CardContent className="space-y-5 pt-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Hari ini
            </p>
            <p className="mt-1 font-serif text-xl">
              {formatDate(new Date(), { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </div>

          <div>
            <Label className="text-sm">Pilih mood kamu</Label>
            <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-7">
              {MOODS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMood(m.value as Mood)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-2xl border-2 p-3 text-xs transition",
                    mood === m.value
                      ? "border-primary bg-primary/10"
                      : "border-border/60 hover:border-primary/40",
                  )}
                >
                  <span className="text-2xl">{m.emoji}</span>
                  <span className="text-[10px] font-medium">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Catatan singkat (opsional, maks 280 karakter)</Label>
            <Textarea
              placeholder="Sedikit cerita tentang harimu..."
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 280))}
              rows={3}
              maxLength={280}
            />
            <p className="text-right text-xs text-muted-foreground">{note.length} / 280</p>
          </div>

          <Button onClick={submit} size="lg" disabled={saving} className="w-full">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {myToday ? "Perbarui mood hari ini" : "Simpan mood hari ini"}
          </Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="partner">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="partner">Mood Pasangan</TabsTrigger>
          <TabsTrigger value="me">Mood Kamu</TabsTrigger>
        </TabsList>

        <TabsContent value="partner" className="space-y-4">
          <Card className="border-border/60 bg-secondary/30">
            <CardContent className="flex items-center gap-3 pt-6">
              <Avatar className="h-10 w-10">
                <AvatarImage src={couple?.partner?.avatarUrl || undefined} />
                <AvatarFallback>{initials(couple?.partner?.fullName ?? "Pasangan")}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">
                  {couple?.partner?.nickname ||
                    couple?.partner?.fullName?.split(" ")[0] ||
                    "Pasanganmu"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {partnerToday
                    ? `Mood hari ini: ${partnerToday.mood}`
                    : "Belum input mood hari ini"}
                </p>
              </div>
              {partnerToday && (
                <span className="text-3xl">
                  {MOODS.find((m) => m.value === partnerToday.mood)?.emoji}
                </span>
              )}
            </CardContent>
          </Card>

          <MoodCalendar days={days} moodByDateMap={moodByDate(partnerId)} />

          <ul className="space-y-2">
            {partnerHistory.map((m) => {
              const mDef = MOODS.find((x) => x.value === m.mood);
              return (
                <li key={m.id}>
                  <Card className="border-border/60">
                    <CardContent className="flex items-center gap-3 p-4">
                      <span className="text-2xl">{mDef?.emoji}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{mDef?.label}</p>
                        {m.note && (
                          <p className="mt-0.5 text-sm italic text-muted-foreground">
                            &ldquo;{m.note}&rdquo;
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {formatDate(m.moodDate, { day: "numeric", month: "short" })}
                      </Badge>
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        </TabsContent>

        <TabsContent value="me" className="space-y-4">
          <MoodCalendar days={days} moodByDateMap={moodByDate(myId ?? "")} />

          <ul className="space-y-2">
            {myHistory.map((m) => {
              const mDef = MOODS.find((x) => x.value === m.mood);
              return (
                <li key={m.id}>
                  <Card className="border-border/60">
                    <CardContent className="flex items-center gap-3 p-4">
                      <span className="text-2xl">{mDef?.emoji}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{mDef?.label}</p>
                        {m.note && (
                          <p className="mt-0.5 text-sm italic text-muted-foreground">
                            &ldquo;{m.note}&rdquo;
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {formatDate(m.moodDate, { day: "numeric", month: "short" })}
                      </Badge>
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("block font-medium text-foreground/90", className)}>
      {children}
    </label>
  );
}

function MoodCalendar({
  days,
  moodByDateMap,
}: {
  days: { date: string; label: string }[];
  moodByDateMap: Record<string, string>;
}) {
  return (
    <Card className="border-border/60">
      <CardContent className="pt-6">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          28 hari terakhir
        </p>
        <div className="grid grid-cols-7 gap-1.5">
          {days.map((d) => {
            const m = moodByDateMap[d.date];
            const mDef = m ? MOODS.find((x) => x.value === m) : null;
            return (
              <div
                key={d.date}
                className={cn(
                  "flex aspect-square flex-col items-center justify-center rounded-lg text-[10px]",
                  m
                    ? "bg-secondary/40 text-foreground"
                    : "bg-muted/40 text-muted-foreground",
                )}
                title={d.date}
              >
                {m ? (
                  <span className="text-base">{mDef?.emoji}</span>
                ) : (
                  <Lock className="h-3 w-3" />
                )}
                <span className="mt-0.5 text-[9px] font-medium">{d.label}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}