"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await authClient.signIn.email({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message ?? "Login failed");
      return;
    }
    toast.success("Selamat datang kembali");

    const params = new URLSearchParams(window.location.search);
    const explicitNext = params.get("next");
    const invite = params.get("invite");

    if (explicitNext && explicitNext.startsWith("/")) {
      window.location.href = explicitNext;
      return;
    }

    const coupleRes = await fetch("/api/couples/current", { credentials: "include" });
    const coupleJson = await coupleRes.json().catch(() => null);
    const hasCouple = coupleJson?.success && coupleJson.data;

    if (invite) {
      window.location.href = hasCouple ? "/dashboard" : `/join/${encodeURIComponent(invite)}`;
      return;
    }

    window.location.href = hasCouple ? "/dashboard" : "/onboarding/create-couple";
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2 lg:hidden">
        <div className="flex items-center gap-2 font-serif text-lg font-semibold">
          <span className="heartbeat flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Heart className="h-4 w-4" fill="currentColor" />
          </span>
          Our Little World
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="flex items-center gap-2 font-serif text-3xl tracking-tight">
          Masuk ke dunia kita
          <Heart className="h-5 w-5 text-primary heartbeat" fill="currentColor" />
        </h1>
        <p className="text-sm text-muted-foreground">
          Masukkan email dan kata sandi kamu. Kami sudah menyiapkan tempat hangat untukmu.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="kamu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Kata Sandi</Label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-primary hover:underline"
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
          />
        </div>

        <Button type="submit" size="lg" className="heart-glow w-full" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          <Heart className="h-4 w-4 heartbeat" fill="currentColor" />
          Masuk
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Belum punya akun?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Daftar
        </Link>
      </p>
    </div>
  );
}