"use client";

import { useEffect, useState } from "react";
import { Loader2, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatDate } from "@/lib/utils";

interface AchievementDTO {
  id: string;
  code: string;
  title: string;
  description: string | null;
  icon: string | null;
  triggerType: string;
  triggerValue: Record<string, any>;
  isUnlocked: boolean;
  unlockedAt: string | null;
}

const triggerLabel: Record<string, string> = {
  days_together: "Waktu bersama",
  memory_count: "Jumlah memori",
  bucket_completed: "Bucket list",
  trip_count: "Jumlah perjalanan",
};

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<AchievementDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/achievements")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setAchievements(res.data.all);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const unlocked = achievements.filter((a) => a.isUnlocked);
  const locked = achievements.filter((a) => !a.isUnlocked);
  const pct = achievements.length > 0 ? Math.round((unlocked.length / achievements.length) * 100) : 0;

  const renderAchievement = (a: AchievementDTO) => {
    return (
      <Card
        key={a.id}
        className={`relative overflow-hidden border-border/60 transition ${
          a.isUnlocked
            ? "bg-gradient-to-br from-primary/8 via-card to-secondary/30 hover:border-primary/30"
            : "bg-muted/30"
        }`}
      >
        <CardContent className="flex flex-col items-center gap-3 p-5 text-center">
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-2xl text-3xl ${
              a.isUnlocked ? "bg-primary/15" : "bg-muted grayscale"
            }`}
          >
            {a.isUnlocked ? a.icon : "🔒"}
          </div>
          <div>
            <h3
              className={`font-serif text-base ${a.isUnlocked ? "" : "text-muted-foreground"}`}
            >
              {a.title}
            </h3>
            {a.description && (
              <p className="mt-1 text-xs text-muted-foreground">{a.description}</p>
            )}
          </div>
          {a.isUnlocked && a.unlockedAt ? (
            <Badge variant="success" className="text-[10px]">
              Diraih {formatDate(a.unlockedAt, { day: "numeric", month: "short" })}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px]">
              {triggerLabel[a.triggerType]} ·{" "}
              {a.triggerValue.days
                ? `${a.triggerValue.days} hari`
                : a.triggerValue.count
                  ? `${a.triggerValue.count} item`
                  : ""}
            </Badge>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="mx-auto max-w-4xl px-5 py-6 lg:py-10 lg:pr-8">
      <header className="mb-6">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Achievements
        </p>
        <h1 className="mt-1 font-serif text-3xl tracking-tight md:text-4xl">
          Lencana kalian
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {unlocked.length} dari {achievements.length} lencana telah terbuka.
        </p>
      </header>

      <Card className="mb-6 border-border/60 bg-gradient-to-br from-amber-50 via-card to-primary/8">
        <CardContent className="flex items-center gap-4 pt-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
            <Trophy className="h-7 w-7" />
          </div>
          <div className="flex-1">
            <p className="font-serif text-lg">Progress lencana</p>
            <p className="text-sm text-muted-foreground">{pct}% lengkap</p>
          </div>
          <div className="text-right">
            <p className="font-serif text-3xl font-semibold tabular-nums">
              {unlocked.length}
              <span className="text-base font-normal text-muted-foreground">
                /{achievements.length}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="unlocked">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="unlocked">Terbuka ({unlocked.length})</TabsTrigger>
          <TabsTrigger value="locked">Terkunci ({locked.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="unlocked">
          {unlocked.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Belum ada lencana terbuka. Mulai tambahkan momen di aplikasi!
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">{unlocked.map(renderAchievement)}</div>
          )}
        </TabsContent>

        <TabsContent value="locked">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">{locked.map(renderAchievement)}</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}