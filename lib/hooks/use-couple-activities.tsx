"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

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
};

const CoupleActivityContext = createContext<CoupleActivityContextValue | null>(null);

export function CoupleActivityProvider({
  children,
  intervalMs = 12000,
}: {
  children: React.ReactNode;
  intervalMs?: number;
}) {
  const pathname = usePathname();
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
  const lastTapIdRef = useRef<string | null>(null);

  const sendPresence = useCallback(async () => {
    try {
      await fetch("/api/presence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lastPage: pathname }),
      });
    } catch {
      // swallow
    }
  }, [pathname]);

  const loadMessages = useCallback(async () => {
    try {
      setMessageLoading(true);
      const res = await fetch("/api/messages?limit=50");
      const json = await res.json();
      if (json?.success) setMessages(json.data.items);
    } catch {
      // swallow
    } finally {
      setMessageLoading(false);
    }
  }, []);

  const poll = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    sendPresence();
    poll();
    timerRef.current = setInterval(() => {
      sendPresence();
      poll();
    }, intervalMs);

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        sendPresence();
        poll();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", () => {
      sendPresence();
      poll();
    });

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [intervalMs, sendPresence, poll]);

  const sendTap = useCallback(async () => {
    try {
      await fetch("/api/taps", { method: "POST" });
    } catch {
      // swallow
    }
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return;
      try {
        const res = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: trimmed }),
        });
        if (res.ok) await loadMessages();
      } catch {
        // swallow
      }
    },
    [loadMessages],
  );

  const submitRitual = useCallback(
    async (answer: string) => {
      const trimmed = answer.trim();
      if (!trimmed) return;
      try {
        const res = await fetch("/api/ritual", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answer: trimmed }),
        });
        if (res.ok) await poll();
      } catch {
        // swallow
      }
    },
    [poll],
  );

  const refreshActivity = useCallback(async () => {
    await Promise.all([poll(), loadMessages()]);
  }, [poll, loadMessages]);

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
      }}
    >
      {children}
    </CoupleActivityContext.Provider>
  );
}

export function useCoupleActivity() {
  const context = useContext(CoupleActivityContext);
  if (!context) {
    throw new Error("useCoupleActivity must be used inside CoupleActivityProvider");
  }
  return context;
}