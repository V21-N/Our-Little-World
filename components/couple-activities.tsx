"use client";

import { useEffect, useRef, useState } from "react";
import {
  Heart,
  Loader2,
  MessageCircleHeart,
  Send,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
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
  const { messages, messageLoading, sendMessage, loadMessages } = useCoupleActivity();
  const { profile } = useAuth();
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      loadMessages();
      window.setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open, loadMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const submit = async () => {
    if (!draft.trim()) return;
    setSending(true);
    await sendMessage(draft);
    setDraft("");
    setSending(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="flex h-full w-[min(24rem,100vw)] animate-in slide-in-from-right-3 fill-mode-both flex-col bg-background shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="font-serif text-lg">Chat berdua</h2>
          <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Tutup chat">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {messageLoading && messages.length === 0 ? (
            <Loader2 className="mx-auto mt-8 h-5 w-5 animate-spin text-primary" />
          ) : messages.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Belum ada pesan. Mulai ngobrol bareng!
            </p>
          ) : (
            messages.map((m) => {
              const mine = m.senderId === profile?.id;
              return (
                <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
                      mine
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground",
                    )}
                  >
                    <p className="whitespace-pre-line">{m.content}</p>
                    <p className={cn("mt-1 text-[10px]", mine ? "text-primary-foreground/70" : "text-muted-foreground")}>
                      {mine
                        ? "kamu"
                        : m.sender?.nickname || m.sender?.fullName?.split(" ")[0] || "pasanganmu"}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <form
          className="flex items-center gap-2 border-t border-border p-3"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <Input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Tulis pesan..."
            className="flex-1"
            maxLength={2000}
          />
          <Button type="submit" size="icon" disabled={sending || !draft.trim()}>
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
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