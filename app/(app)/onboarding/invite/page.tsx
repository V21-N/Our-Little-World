"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Copy, Heart, Loader2, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/lib/hooks/use-auth";

function InviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAuth();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<"link" | "code" | null>(null);

  const inviteCode = searchParams.get("code") ?? "";
  const siteUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  const inviteLink = inviteCode ? `${siteUrl}/join/${inviteCode}` : "";

  const copy = async (text: string, kind: "link" | "code") => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(kind);
    toast.success(kind === "link" ? "Tautan disalin" : "Kode disalin");
    setTimeout(() => setCopied(null), 1500);
  };

  const finishOnboarding = async () => {
    setLoading(true);
    await refresh();
    router.push("/dashboard");
  };

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
          <Check className="h-7 w-7" strokeWidth={3} />
        </div>
        <h1 className="font-serif text-3xl tracking-tight">
          Dunia kita sudah siap!
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sekarang undang pasanganmu untuk bergabung lewat tautan privat di bawah ini.
        </p>
      </div>

      <Card className="border-border/60">
        <CardContent className="space-y-5 pt-6">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Tautan Undangan
            </Label>
            <div className="flex items-center gap-2 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-3">
              <code className="flex-1 truncate text-sm text-foreground/80">{inviteLink}</code>
              <Button
                size="icon-sm"
                variant={copied === "link" ? "default" : "outline"}
                onClick={() => copy(inviteLink, "link")}
              >
                {copied === "link" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Atau bagikan kode ini
            </Label>
            <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card p-4">
              <code className="font-mono text-2xl font-semibold tracking-[0.4em] text-primary">
                {inviteCode}
              </code>
            </div>
            <Button
              variant="soft"
              className="w-full"
              onClick={() => copy(inviteCode, "code")}
            >
              {copied === "code" ? (
                <>
                  <Check className="h-4 w-4" />
                  Tersalin
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Salin kode
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-muted/30">
        <CardContent className="space-y-4 pt-6">
          <h3 className="font-serif text-lg">Kirim lewat WhatsApp</h3>
          <p className="text-sm text-muted-foreground">
            Pesan singkat yang bisa kamu kirim ke pasanganmu.
          </p>
          <div className="rounded-xl bg-card p-4 text-sm leading-relaxed text-foreground/90">
            <Heart className="mb-2 h-4 w-4 text-primary" fill="currentColor" />
            <p>
              Hai sayang, aku sudah membuat tempat privat kita berdua di &ldquo;Yugma&rdquo;. Yuk gabung lewat tautan ini ya:
            </p>
            <p className="mt-2 font-mono text-xs text-primary">{inviteLink}</p>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              const text = encodeURIComponent(
                `Hai sayang, aku sudah membuat tempat privat kita berdua di "Yugma". Yuk gabung lewat tautan ini: ${inviteLink}`,
              );
              window.open(`https://wa.me/?text=${text}`, "_blank");
            }}
          >
            <MessageCircle className="h-4 w-4" />
            Kirim lewat WhatsApp
          </Button>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between border-t border-border pt-6">
        <Button
          variant="ghost"
          onClick={async () => {
            setLoading(true);
            await refresh();
            router.push("/dashboard");
          }}
          disabled={loading}
        >
          Nanti saja
        </Button>
        <Button onClick={finishOnboarding} disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          <Send className="h-4 w-4" />
          Lanjut ke dashboard
        </Button>
      </div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <div className="min-h-screen bg-background px-6 py-10 md:py-16">
      <Suspense
        fallback={
          <div className="flex min-h-[50vh] items-center justify-center">
            <div className="h-8 w-8 animate-pulse rounded-full bg-primary/20" />
          </div>
        }
      >
        <InviteContent />
      </Suspense>
    </div>
  );
}