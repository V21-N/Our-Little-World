"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Heart,
  Loader2,
  MessageCircleHeart,
  Send,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn, initials } from "@/lib/utils";
import { useAuth } from "@/lib/hooks/use-auth";
import { useCoupleActivity } from "@/lib/hooks/use-couple-activities";

export function PresenceChip({ compact = false }: { compact?: boolean }) {
  const { presence } = useCoupleActivity();

  const statusText = presence.partnerOnline
    ? presence.partnerPage && presence.partnerPage !== "/dashboard"
      ? "Sedang di aplikasi"
      : "Online · di dashboard"
    : "Offline";

  if (compact) {
    return (
      <span className="flex items-center gap-1.5">
        <span
          className={cn(
            "h-2 w-2 rounded-full",
            presence.partnerOnline ? "bg-emerald-500" : "bg-muted-foreground/40",
          )}
        />
        <span className="text-xs text-muted-foreground">{statusText}</span>
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2 px-1 py-1">
      <span
        className={cn(
          "h-2.5 w-2.5 rounded-full",
          presence.partnerOnline ? "bg-emerald-500" : "bg-muted-foreground/40",
        )}
      />
      <p className="text-xs text-muted-foreground">{statusText}</p>
    </div>
  );
}

export function TapButton({ withLabel = false }: { withLabel?: boolean }) {
  const { sendTap } = useCoupleActivity();
  const [sent, setSent] = useState(false);

  const handleTap = async () => {
    await sendTap();
    setSent(true);
    window.setTimeout(() => setSent(false), 1200);
  };

  return (
    <Button
      variant="ghost"
      size={withLabel ? "sm" : "icon-sm"}
      onClick={handleTap}
      className={cn(sent && "text-primary")}
      title="Kirim tap ke pasanganmu"
      aria-label="Kirim tap ke pasanganmu"
    >
      <Heart className={cn("h-4 w-4", sent && "fill-primary heartbeat")} />
      {withLabel && <span>{sent ? "Terikirim!" : "Tap pasanganmu"}</span>}
    </Button>
  );
}

export function ChatButton() {
  const [open, setOpen] = useState(false);
  const { tapCount } = useCoupleActivity();
  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => setOpen(true)}
        className="relative"
        aria-label="Chat berdua"
        title="Chat berdua"
      >
        <MessageCircleHeart className="h-4 w-4" />
        {tapCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-semibold text-primary-foreground">
            {tapCount > 9 ? "9+" : tapCount}
          </span>
        )}
      </Button>
      <ChatDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export function ChatDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { messages, messageLoading, sendMessage, loadMessages, presence, markSeen } =
    useCoupleActivity();
  const { profile } = useAuth();
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const myId = profile?.id;

  const handleOpen = async () => {
    loadMessages();
    markSeen();
    try {
      await fetch("/api/taps");
    } catch {
      // swallow
    }
    window.setTimeout(() => inputRef.current?.focus(), 200);
  };

  useEffect(() => {
    if (open) void handleOpen();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  const submit = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    await sendMessage(text);
    setDraft("");
    setSending(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void submit();
    }
  };

  const resizeInput = () => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  if (!open) return null;

  let lastDayKey = "";

  return typeof document === "undefined"
    ? null
    : createPortal(
        <div className="pointer-events-none fixed inset-0 z-[9999] grid place-items-end p-3 sm:place-items-center">
          <div className="pointer-events-auto flex h-[min(44rem,86dvh)] w-full max-w-lg animate-in fade-in zoom-in-95 fill-mode-both flex-col overflow-hidden rounded-3xl border border-border bg-background shadow-2xl">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border/70 px-4 py-3.5">
              <div className="relative">
                <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary">💬</AvatarFallback>
                </Avatar>
                <span
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background",
                    presence.partnerOnline ? "bg-emerald-500" : "bg-muted-foreground/40",
                  )}
                />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-serif text-base font-semibold leading-tight">Chat berdua</h2>
                <p className={cn("truncate text-xs", presence.partnerOnline ? "text-emerald-600" : "text-muted-foreground")}>
                  {presence.partnerOnline ? "Online sekarang" : "Offline"}
                </p>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Tutup chat">
                <X className="h-4 w-4" />
              </Button>
            </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 space-y-1 overflow-y-auto bg-gradient-to-b from-secondary/20 to-transparent px-4 py-4"
        >
          {messageLoading && messages.length === 0 ? (
            <div className="space-y-3 py-4">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={cn("flex", i % 2 === 1 ? "justify-end" : "justify-start")}
                >
                  <div className="h-10 w-40 animate-pulse rounded-2xl bg-muted" />
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <MessageCircleHeart className="h-7 w-7 text-primary" />
              </div>
              <div>
                <p className="font-serif text-base">Mulai ngobrol, berdua.</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Kirim hal-hal kecil yang bikin kalian tersenyum.
                </p>
              </div>
            </div>
          ) : (
            messages.map((m) => {
              const mine = m.senderId === myId;
              const dayKey = new Date(m.createdAt).toDateString();
              const timeLabel = new Date(m.createdAt).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              });

              const showDay = dayKey !== lastDayKey;
              lastDayKey = dayKey;

              return (
                <div key={m.id}>
                  {showDay && <DayDivider dateKey={dayKey} />}
                  <div className={cn("flex items-end gap-2", mine ? "justify-end" : "justify-start")}>
                    {!mine && (
                      <Avatar className="mb-0.5 h-7 w-7 shrink-0 bg-secondary">
                        <AvatarImage src={m.sender?.avatarUrl || undefined} alt={m.sender?.fullName || "Pasangan"} className="object-cover" />
                        <AvatarFallback className="text-[10px]">
                          {initials(m.sender?.fullName || "P")}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        "relative max-w-[75%] px-3.5 py-2 text-sm leading-relaxed shadow-sm",
                        mine
                          ? "rounded-2xl rounded-br-md bg-gradient-to-br from-primary to-primary/90 text-primary-foreground"
                          : "rounded-2xl rounded-bl-md border border-border/70 bg-card text-foreground",
                      )}
                    >
                      <p className="whitespace-pre-line break-words">{m.content}</p>
                      <p
                        className={cn(
                          "mt-0.5 flex items-center justify-end gap-1 text-[10px]",
                          mine ? "text-primary-foreground/70" : "text-muted-foreground",
                        )}
                      >
                        {timeLabel}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Composer */}
        <div className="border-t border-border/70 bg-background p-3">
          <div
            className={cn(
              "flex items-end gap-2 rounded-3xl border border-border/80 bg-card p-1.5 pl-4 transition-colors focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20",
              sending && "opacity-70",
            )}
          >
            <textarea
              ref={inputRef}
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value.slice(0, 2000));
                resizeInput();
              }}
              onKeyDown={onKeyDown}
              rows={1}
              placeholder="Tulis pesan..."
              className="max-h-[120px] flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <Button
              type="button"
              size="icon"
              onClick={() => void submit()}
              disabled={!draft.trim() || sending}
              className="h-9 w-9 shrink-0 rounded-full"
              aria-label="Kirim pesan"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
            Enter untuk kirim · Shift + Enter untuk baris baru
          </p>
        </div>
          </div>
        </div>,
        document.body,
      );
}

function DayDivider({ dateKey }: { dateKey: string }) {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  let label: string;
  if (dateKey === today.toDateString()) label = "Hari ini";
  else if (dateKey === yesterday.toDateString()) label = "Kemarin";
  else {
    label = new Date(dateKey).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
    });
  }

  return (
    <div className="my-3 flex items-center gap-3">
      <span className="h-px flex-1 bg-border/60" />
      <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="h-px flex-1 bg-border/60" />
    </div>
  );
}

export function TapToast() {
  const { latestTap, clearLatestTap } = useCoupleActivity();
  const shownRef = useRef<string | null>(null);

  useEffect(() => {
    if (latestTap && shownRef.current !== latestTap.id) {
      shownRef.current = latestTap.id;
      toast("💓 Pasanganmu mengirim tap untukmu!", {
        description: "Balas dengan tap ya.",
      });
    }
  }, [latestTap]);

  useEffect(() => {
    return () => clearLatestTap();
  }, [clearLatestTap]);

  return null;
}