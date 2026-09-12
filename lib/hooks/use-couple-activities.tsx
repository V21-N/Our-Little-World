"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/use-auth";

export interface PartnerPresence {
  partnerOnline: boolean;
  partnerPage: string | null;
  myOnline: boolean;
}

export interface TapEvent {
  id: string;
  fromId: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  coupleId: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender?: { id: string; fullName: string; nickname: string | null; avatarUrl: string | null } | null;
}

export interface RitualData {
  prompt: { id: string; text: string };
  myAnswer: string | null;
  partnerAnswer: string | null;
  allDone: boolean;
}

type CoupleActivityContextValue = {
  presence: PartnerPresence;
  tapCount: number;
  latestTap: TapEvent | null;
  messages: ChatMessage[];
  messageLoading: boolean;
  ritual: RitualData | null;
  loading: boolean;
  loadMessages: () => Promise<void>;
  sendTap: () => Promise<void>;
  clearLatestTap: () => void;
  sendMessage: (content: string) => Promise<void>;
  submitRitual: (answer: string) => Promise<void>;
  refreshActivity: () => Promise<void>;
  markSeen: () => Promise<void>;
};

const CoupleActivityContext = createContext<CoupleActivityContextValue | null>(null);

const PROMPTS = [
  { id: "grateful", text: "Apa satu hal hari ini yang kamu syukuri tentang kita?" },
  { id: "goodthing", text: "Apa hal terbaik yang pasanganmu lakukan minggu ini?" },
  { id: "date_idea", text: "Kalau bisa langsung pergi sekarang, mau pergi ke mana bareng?" },
  { id: "love_language", text: "Hal kecil apa yang bikin kamu merasa paling dicintai?" },
  { id: "memory", text: "Kenangan apa yang muncul tadi malam tanpa sengaja?" },
  { id: "hope", text: "Satu hal yang kamu harapkan untuk kita malam ini?" },
] as const;

function promptForToday() {
  const start = new Date("2024-01-01T00:00:00Z");
  const days = Math.floor((Date.now() - start.getTime()) / 86400000);
  return PROMPTS[days % PROMPTS.length];
}

export function CoupleActivityProvider({
  children,
  intervalMs = 5000,
}: {
  children: React.ReactNode;
  intervalMs?: number;
}) {
  const pathname = usePathname();
  const { couple, profile } = useAuth();
  const myId = profile?.id ?? "";
  const coupleId = couple?.id;

  const [presence, setPresence] = useState<PartnerPresence>({
    partnerOnline: false,
    partnerPage: null,
    myOnline: false,
  });
  const [tapCount, setTapCount] = useState(0);
  const [latestTap, setLatestTap] = useState<TapEvent | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageLoading, setMessageLoading] = useState(false);
  const [ritual, setRitual] = useState<RitualData | null>(null);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const seenIdsRef = useRef(new Set<string>());
  const lastTapIdRef = useRef<string | null>(null);

  const sendPresenceBeat = useCallback(async () => {
    if (!coupleId) return;
    try {
      await fetch("/api/presence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lastPage: pathname }),
      });
    } catch {
      // background heartbeat — never crash UI
    }
  }, [coupleId, pathname]);

  const loadMessages = useCallback(async () => {
    if (!coupleId) return;
    try {
      setMessageLoading(true);
      const res = await fetch("/api/messages?limit=100");
      const json = await res.json();
      if (json?.success) setMessages(json.data.items);
    } catch {
      // swallow
    } finally {
      setMessageLoading(false);
    }
  }, [coupleId]);

  const poll = useCallback(async () => {
    if (!coupleId) return;
    const [presenceRes, tapsRes, ritualRes] = await Promise.all([
      fetch("/api/presence"),
      fetch("/api/taps"),
      fetch("/api/ritual"),
    ]);

    const presenceJson = await presenceRes.json();
    if (presenceJson?.success) setPresence(presenceJson.data);

    const tapsJson = await tapsRes.json();
    if (tapsJson?.success) {
      setTapCount(tapsJson.data.count ?? 0);
      const tap = tapsJson.data.latest as TapEvent | null;
      if (tap && tap.id !== lastTapIdRef.current) {
        lastTapIdRef.current = tap.id;
        setLatestTap(tap);
      }
    }

    const ritualJson = await ritualRes.json();
    if (ritualJson?.success) setRitual(ritualJson.data);

    setLoading(false);
  }, [coupleId]);

  // Initial load + polling heartbeat.
  useEffect(() => {
    sendPresenceBeat();
    poll();
    timerRef.current = setInterval(() => {
      sendPresenceBeat();
      poll();
    }, intervalMs);

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        sendPresenceBeat();
        poll();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", () => {
      sendPresenceBeat();
      poll();
    });

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [sendPresenceBeat, poll, intervalMs]);

  // Sync seen-ids whenever messages change (for dedup of realtime events).
  useEffect(() => {
    seenIdsRef.current = new Set(messages.map((m) => m.id));
  }, [messages]);

  const appendMessageLive = useCallback(
    (msg: ChatMessage) => {
      if (!msg?.id || seenIdsRef.current.has(msg.id)) return;
      seenIdsRef.current.add(msg.id);
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    },
    [],
  );

  // Realtime (Supabase) subscription — instant tap + message delivery.
  useEffect(() => {
    const supa = supabase;
    if (!coupleId || !supa) return;

    const channel = supa
      .channel(`couple-${coupleId}`)
      .on("broadcast", { event: "tap" }, ({ payload }) => {
        const tap = payload as { id: string; fromId: string; createdAt: string };
        if (tap && tap.fromId !== myId && tap.id !== lastTapIdRef.current) {
          lastTapIdRef.current = tap.id;
          setLatestTap(tap);
        }
      })
      .on("broadcast", { event: "message" }, ({ payload }) => {
        const msg = payload as ChatMessage;
        if (msg && msg.senderId !== myId) appendMessageLive(msg);
      });

    channel.subscribe();

    return () => {
      supa.removeChannel(channel);
    };
  }, [coupleId, myId, appendMessageLive]);

  // Live tap toast side effect — keep in component so newestTap is shown once.
  const latestTapRef = useRef<string | null>(null);

  const sendTap = useCallback(async () => {
    if (!coupleId) return;
    try {
      await fetch("/api/taps", { method: "POST" });
      if (supabase) {
        const tapEvent: TapEvent = {
          id: `${Date.now()}-tap`,
          fromId: myId,
          createdAt: new Date().toISOString(),
        };
        await supabase.channel(`couple-${coupleId}`).send({
          type: "broadcast",
          event: "tap",
          payload: tapEvent,
        });
      }
    } catch {
      // swallow
    }
  }, [coupleId, myId]);

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || !coupleId) return;
      try {
        const res = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: trimmed }),
        });
        const json = await res.json();
        if (!json?.success || !json.data) return;
        const msg = json.data as ChatMessage;
        msg.sender = {
          id: myId,
          fullName: profile?.fullName ?? "",
          nickname: profile?.nickname ?? null,
          avatarUrl: profile?.avatarUrl ?? null,
        };
        appendMessageLive(msg);
        if (supabase) {
          await supabase
            .channel(`couple-${coupleId}`)
            .send({ type: "broadcast", event: "message", payload: msg });
        }
      } catch {
        // swallow
      }
    },
    [coupleId, myId, profile, appendMessageLive],
  );

  const submitRitual = useCallback(
    async (answer: string) => {
      const trimmed = answer.trim();
      if (!trimmed || !coupleId) return;
      try {
        await fetch("/api/ritual", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answer: trimmed }),
        });
        await poll();
      } catch {
        // swallow
      }
    },
    [coupleId, poll],
  );

  const refreshActivity = useCallback(async () => {
    await Promise.all([poll(), loadMessages()]);
  }, [poll, loadMessages]);

  const markSeen = useCallback(async () => {
    try {
      await fetch("/api/notifications/summary", { method: "POST" });
      await fetch("/api/taps");
      setTapCount(0);
    } catch {
      // swallow
    }
  }, []);

  return (
    <CoupleActivityContext.Provider
      value={{
        presence,
        tapCount,
        latestTap,
        messages,
        messageLoading,
        ritual,
        loading,
        loadMessages,
        sendTap,
        clearLatestTap: () => setLatestTap(null),
        sendMessage,
        submitRitual,
        refreshActivity,
        markSeen,
      }}
    >
      {children}
    </CoupleActivityContext.Provider>
  );
}

export function useCoupleActivity() {
  const context = useContext(CoupleActivityContext);
  if (!context) throw new Error("useCoupleActivity must be used inside CoupleActivityProvider");
  return context;
}