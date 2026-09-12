"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Heart,
  KeyRound,
  Loader2,
  Sparkles,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api/client";

interface CurrentCouple {
  id: string;
  coupleName: string | null;
  relationshipStartDate: string;
  inviteCode: string;
}

interface InvitePreview {
  coupleName: string | null;
  relationshipStartDate: string;
  memberCount: number;
  isFull: boolean;
}

export default function JoinByInvitePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code: rawCode } = use(params);
  const code = (rawCode ?? "").trim().toUpperCase();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<{ user: { id: string; name: string } } | null>(null);
  const [currentCouple, setCurrentCouple] = useState<CurrentCouple | null>(null);
  const [preview, setPreview] = useState<InvitePreview | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    authClient
      .getSession()
      .then((res) => {
        if (res.data?.user) {
          setSession(res.data as any);
        }
      })
      .finally(() => setChecking(false));
  }, []);

  useEffect(() => {
    if (!code) {
      setPreview(null);
      setPreviewError("Kode undangan tidak ditemukan");
      return;
    }
    let cancelled = false;
    fetch(`/api/couples/by-invite/${encodeURIComponent(code)}`)
      .then((r) => r.json())
      .then((res) => {
        if (cancelled) return;
        if (res?.success) {
          setPreview(res.data);
          setPreviewError(null);
        } else {
          setPreview(null);
          setPreviewError(res?.error ?? "Kode undangan tidak ditemukan");
        }
      })
      .catch(() => {
        if (cancelled) return;
        setPreview(null);
        setPreviewError("Tidak dapat memvalidasi kode");
      });
    return () => {
      cancelled = true;
    };
  }, [code]);

  useEffect(() => {
    if (!session) {
      setCurrentCouple(null);
      return;
    }
    fetch("/api/couples/current", { credentials: "include" })
      .then((r) => r.json())
      .then((res) => {
        if (res?.success) setCurrentCouple(res.data);
      });
  }, [session]);

  const onJoin = async () => {
    if (!session) {
      const params = new URLSearchParams({ invite: code });
      router.push(`/login?${params.toString()}`);
      return;
    }

    setLoading(true);
    const result = await apiFetch<{ coupleId: string }>("/api/couples/join", {
      method: "POST",
      body: JSON.stringify({ inviteCode: code }),
    });

    setLoading(false);
    if (result.success) {
      toast.success("Berhasil bergabung ke dunia kecil kalian ♡");
      router.push("/dashboard");
    } else {
      toast.error(result.error);
    }
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-pulse rounded-full bg-primary/20" />
          <div className="h-3 w-40 animate-pulse rounded bg-muted" />
        </div>
      </div>
    );
  }

  const coupleIsFull = preview?.isFull ?? false;
  const isAlreadyInThisCouple = currentCouple && preview && currentCouple.inviteCode === code;
  const isAlreadyInAnotherCouple = currentCouple && preview && currentCouple.inviteCode !== code;

  if (isAlreadyInThisCouple) {
    return (
      <div className="min-h-screen bg-background px-6 py-10 md:py-16">
        <div className="mx-auto max-w-xl space-y-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Heart className="h-7 w-7 heartbeat" fill="currentColor" />
          </div>
          <h1 className="font-serif text-3xl tracking-tight">Kamu sudah bergabung!</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Kamu sudah menjadi bagian dari dunia ini ♡
          </p>
          <Button size="lg" className="mt-4" asChild>
            <Link href="/dashboard">Masuk ke Yugma</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-6 py-10 md:py-16">
      <div className="mx-auto max-w-xl space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Sparkles className="h-7 w-7" />
          </div>
          <h1 className="font-serif text-3xl tracking-tight">Kamu diundang! ♡</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {session
              ? `Selamat datang ${session.user.name}! Siap untuk bergabung?`
              : "Login untuk bergabung ke dunia kecil yang dibuat untuk kalian berdua."}
          </p>
        </div>

        <Card className="border-border/60">
          <CardContent className="space-y-5 pt-6">
            <div className="rounded-xl bg-muted/50 p-4 text-center">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Kode Undangan
              </p>
              <p className="mt-1 font-mono text-2xl font-semibold tracking-[0.4em] text-primary">
                {code}
              </p>
            </div>

            {previewError && !preview && (
              <div className="flex items-start gap-3 rounded-xl border border-rose-300/60 bg-rose-50/60 p-4 text-sm">
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                <div className="flex-1">
                  <p className="font-medium text-rose-900">{previewError}</p>
                  <p className="mt-1 text-rose-800/80">
                    Pastikan kode yang kamu masukkan benar.
                  </p>
                </div>
              </div>
            )}

            {preview && coupleIsFull && (
              <div className="flex items-start gap-3 rounded-xl border border-amber-300/60 bg-amber-50/60 p-4 text-sm">
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                <div className="flex-1">
                  <p className="font-medium text-amber-900">
                    Kode undangan ini sudah tidak tersedia
                  </p>
                  <p className="mt-1 text-amber-800/80">
                    2 dari 2 orang sudah bergabung. Minta pasanganmu membuat kode undangan
                    baru jika kamu ingin bergabung.
                  </p>
                </div>
              </div>
            )}

            {preview && !coupleIsFull && !previewError && (
              <div className="flex items-start gap-3 rounded-xl border border-emerald-300/60 bg-emerald-50/60 p-4 text-sm">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                <div className="flex-1">
                  <p className="font-medium text-emerald-900">
                    ✓ Kode valid
                  </p>
                  <p className="mt-1 text-emerald-800/80">
                    {preview.coupleName ? (
                      <span className="font-medium block mb-1">
                        Kamu diundang ke dunia kecil {preview.coupleName}.
                      </span>
                    ) : null}
                    {preview.memberCount === 0
                      ? "Belum ada member. Kamu yang pertama bergabung."
                      : "1 dari 2 orang sudah bergabung."}
                  </p>
                </div>
              </div>
            )}

            {session && isAlreadyInAnotherCouple && (
              <div className="rounded-xl border border-rose-300/60 bg-rose-50/60 p-4 text-sm">
                <p className="font-medium text-rose-900">
                  Kamu sudah memiliki couple space
                </p>
                <p className="mt-1 text-rose-800/80">
                  Akun ini sudah menjadi bagian dari couple space lain.
                  Kamu tidak dapat bergabung ke couple lain dengan akun yang sama.
                </p>
              </div>
            )}

            {previewError || coupleIsFull ? (
              <Button
                size="lg"
                className="w-full"
                variant="outline"
                asChild
              >
                <Link href="/join">
                  <KeyRound className="h-4 w-4" />
                  Masukkan kode lain
                </Link>
              </Button>
            ) : isAlreadyInAnotherCouple ? (
              <Button
                size="lg"
                className="w-full"
                asChild
              >
                <Link href="/dashboard">
                  <ArrowRight className="h-4 w-4" />
                  Kembali ke Yugma
                </Link>
              </Button>
            ) : !session ? (
              <Button
                size="lg"
                className="w-full"
                onClick={() => {
                  const params = new URLSearchParams({ invite: code });
                  router.push(`/login?${params.toString()}`);
                }}
                disabled={loading}
              >
                <ArrowRight className="h-4 w-4" />
                Lanjut ke login
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="rounded-xl bg-primary/5 p-4 text-center">
                  <p className="text-sm font-medium text-primary">
                    Bergabung ke dunia kecil kalian ♡
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Kamu akan menjadi anggota {preview?.memberCount === 0 ? "pertama" : "kedua"} dari couple space ini.
                  </p>
                </div>
                <Button
                  size="lg"
                  className="w-full"
                  onClick={onJoin}
                  disabled={loading || !preview}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Heart className="h-4 w-4" fill="currentColor" />
                      Gabung sekarang
                    </>
                  )}
                </Button>
              </div>
            )}

            {!session && !coupleIsFull && !previewError && (
              <p className="text-center text-xs text-muted-foreground">
                Belum punya akun?{" "}
                <Link
                  href={`/register?invite=${encodeURIComponent(code)}`}
                  className="font-medium text-primary hover:underline"
                >
                  Daftar
                </Link>
              </p>
            )}
            {session && !currentCouple && preview && !coupleIsFull && (
              <p className="text-center text-xs text-muted-foreground">
                Kode salah?{" "}
                <Link href="/join" className="font-medium text-primary hover:underline">
                  Masukkan kode lain
                </Link>
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}