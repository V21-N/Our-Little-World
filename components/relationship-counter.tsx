"use client";

import { useEffect, useState } from "react";
import { durationSince } from "@/lib/utils";
import { Heart } from "lucide-react";

interface Props {
  startDate: string;
  compact?: boolean;
}

const milestones = [100, 200, 365, 500, 730, 1000, 1500, 2000];

export function RelationshipCounter({ startDate, compact = false }: Props) {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const { years, months, days } = durationSince(startDate);
  const totalDays = Math.floor(
    (now.getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24),
  );

  const reachedMilestone = milestones.includes(totalDays);
  const nextMilestone = milestones.find((m) => m > totalDays);
  const daysToNext = nextMilestone ? nextMilestone - totalDays : 0;

  const units = [
    { label: "Tahun", value: years },
    { label: "Bulan", value: months },
    { label: "Hari", value: days },
  ];

  if (compact) {
    return (
      <div className="flex items-baseline gap-1.5">
        <span className="font-serif text-3xl font-semibold tabular-nums">
          {years}y {months}m {days}d
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {units.map((unit, i) => (
          <div
            key={unit.label}
            className="rounded-2xl border border-border/60 bg-card p-4 text-center breathe"
            style={{ animationDelay: `${i * 0.2}s` }}
          >
            <p className="font-serif text-3xl font-semibold tabular-nums leading-none sm:text-4xl">
              {unit.value.toLocaleString("id-ID")}
            </p>
            <p className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground sm:text-xs">
              {unit.label}
            </p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-dashed border-primary/30 bg-primary/5 px-3 py-2 text-xs">
        <span className="flex items-center gap-2 font-medium text-primary">
          <Heart className="h-3.5 w-3.5 heartbeat" fill="currentColor" />
          {totalDays.toLocaleString("id-ID")} hari bersama
        </span>
        {nextMilestone && (
          <span className="text-muted-foreground">
            {reachedMilestone
              ? `🎉 Milestone ${totalDays} hari tercapai!`
              : `${daysToNext} hari lagi menuju ${nextMilestone} hari`}
          </span>
        )}
      </div>
    </div>
  );
}