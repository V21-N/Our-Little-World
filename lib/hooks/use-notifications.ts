"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface NotificationSummary {
  unreadLetters: number;
  newAchievements: number;
  total: number;
}

export function useNotifications(intervalMs = 15000) {
  const [summary, setSummary] = useState<NotificationSummary>({
    unreadLetters: 0,
    newAchievements: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [tick, setTick] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const markSeen = useCallback(async () => {
    try {
      await fetch(`/api/notifications/summary`, { method: "POST" });
    } catch {
      // swallow
    }
    setSummary({ unreadLetters: 0, newAchievements: 0, total: 0 });
    setTick(Date.now());
  }, []);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/notifications/summary`);
      const json = await res.json();
      if (json?.success) setSummary(json.data);
      setTick(Date.now());
    } catch {
      // swallow — background polling should never crash the UI
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    timerRef.current = setInterval(refresh, intervalMs);

    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);

    const onVisibility = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [refresh, intervalMs]);

  return { summary, loading, refresh, markSeen, tick };
}