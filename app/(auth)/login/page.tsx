"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Loader2, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api/client";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await authClient.signIn.email({ email, password });
      if (error) {
        toast.error(error.message ?? "Login failed");
        return;
      }
      toast.success("Selamat datang kembali di Yugma");

      const params = new URLSearchParams(window.location.search);
      const explicitNext = params.get("next");
      const invite = params.get("invite");

      if (explicitNext && explicitNext.startsWith("/")) {
        window.location.href = explicitNext;
        return;
      }

      const coupleRes = await apiFetch("/api/couples/current");
      if (!coupleRes.success) {
        toast.error(coupleRes.error);
        return;
      }
      const hasCouple = Boolean(coupleRes.data);

      if (invite) {
        window.location.href = `/join/${encodeURIComponent(invite)}`;
        return;
      }

      window.location.href = hasCouple ? "/dashboard" : "/onboarding/create-couple";
    } catch {
      toast.error("Tidak dapat terhubung ke server. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-8">
      {/* Header Brand untuk Tampilan Mobile */}
      <div className="space-y-2 lg:hidden">
        <Link href="/" className="inline-flex items-center gap-2.5 transition hover:opacity-90">
          <img
            src="/Yugma-Icon.svg"
            alt="Yugma Logo"
            className="heartbeat h-8 w-8 shrink-0 object-contain mix-blend-multiply"
          />
          <span className="font-serif text-2xl font-bold tracking-widest text-[#6B2D39]">
            YUGMA
          </span>
        </Link>
      </div>

      {/* Greeting Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-[#D4A5A5]/40 bg-[#6B2D39]/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#6B2D39]">
          <Sparkles className="h-3 w-3 text-[#6B2D39]" />
          <span>A private space for two</span>
        </div>
        
        <h1 className="font-serif text-3xl font-bold tracking-tight text-[#2B1B22] md:text-4xl">
          Masuk ke ruang kita
        </h1>
        <p className="text-sm leading-relaxed text-[#2B1B22]/70">
          Masukkan email dan kata sandi kamu. Ruang hangat ini telah siap menyambutmu kembali.
        </p>
      </div>

      {/* Form Section */}
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-[#2B1B22]/80">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="kamu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="h-11 rounded-xl border border-[#EFE6DD] bg-[#FDFBF7] px-4 text-sm text-[#2B1B22] transition-colors focus:border-[#6B2D39] focus:ring-[#6B2D39]/20"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-[#2B1B22]/80">
              Kata Sandi
            </Label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-[#6B2D39] transition hover:underline"
            >
              Lupa kata sandi?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="h-11 rounded-xl border border-[#EFE6DD] bg-[#FDFBF7] px-4 text-sm text-[#2B1B22] transition-colors focus:border-[#6B2D39] focus:ring-[#6B2D39]/20"
          />
        </div>

        <Button
          type="submit"
          size="lg"
          className="group relative h-12 w-full rounded-full bg-[#6B2D39] text-[#FDFBF7] shadow-lg shadow-[#6B2D39]/15 transition-all hover:bg-[#54232C] hover:scale-[1.01]"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-[#FDFBF7]" />
          ) : (
            <>
              <Heart className="h-4 w-4 heartbeat fill-current text-[#FDFBF7]" />
              <span className="font-medium">Masuk</span>
              <ArrowRight className="ml-1 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
            </>
          )}
        </Button>
      </form>

      {/* Register Link */}
      <div className="rounded-2xl border border-[#EFE6DD] bg-[#F8F4EE]/50 p-4 text-center">
        <p className="text-sm text-[#2B1B22]/70">
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="font-semibold text-[#6B2D39] transition hover:underline"
            onClick={(e) => {
              const params = new URLSearchParams(window.location.search);
              const invite = params.get("invite");
              if (invite) {
                e.preventDefault();
                window.location.href = `/register?invite=${encodeURIComponent(invite)}`;
              }
            }}
          >
            Daftar Yugma
          </Link>
        </p>
      </div>
    </div>
  );
}