"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Loader2, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await authClient.signUp.email({
      email: form.email,
      password: form.password,
      name: form.name,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message ?? "Registration failed");
      return;
    }
    toast.success("Akun berhasil dibuat! Selamat datang di Yugma.");

    const params = new URLSearchParams(window.location.search);
    const invite = params.get("invite");
    if (invite) {
      router.push(`/join/${encodeURIComponent(invite)}`);
      return;
    }
    router.push("/onboarding/create-couple");
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
          <span
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "22px",
              fontWeight: "600",
              letterSpacing: "0.24em",
              color: "#6B2D39",
            }}
          >
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
          Mulai ruang baru
        </h1>
        <p className="text-sm leading-relaxed text-[#2B1B22]/70">
          Mari buat tempat aman untuk menyimpan cerita, kenangan, dan mimpi kalian berdua.
        </p>
      </div>

      {/* Form Section */}
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-[#2B1B22]/80">
            Nama Lengkap
          </Label>
          <Input
            id="name"
            placeholder="Alvin Pratama"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="h-11 rounded-xl border border-[#EFE6DD] bg-[#FDFBF7] px-4 text-sm text-[#2B1B22] transition-colors focus:border-[#6B2D39] focus:ring-[#6B2D39]/20"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-[#2B1B22]/80">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="kamu@email.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            autoComplete="email"
            className="h-11 rounded-xl border border-[#EFE6DD] bg-[#FDFBF7] px-4 text-sm text-[#2B1B22] transition-colors focus:border-[#6B2D39] focus:ring-[#6B2D39]/20"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-[#2B1B22]/80">
            Kata Sandi
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Minimal 8 karakter"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            minLength={8}
            autoComplete="new-password"
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
              <span className="font-medium">Daftar Akun</span>
              <ArrowRight className="ml-1 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
            </>
          )}
        </Button>
      </form>

      {/* Login Link Card */}
      <div className="rounded-2xl border border-[#EFE6DD] bg-[#F8F4EE]/50 p-4 text-center">
        <p className="text-sm text-[#2B1B22]/70">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="font-semibold text-[#6B2D39] transition hover:underline"
            onClick={(e) => {
              const params = new URLSearchParams(window.location.search);
              const invite = params.get("invite");
              if (invite) {
                e.preventDefault();
                window.location.href = `/login?invite=${encodeURIComponent(invite)}`;
              }
            }}
          >
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}