"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Loader2, Sparkles } from "lucide-react";
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
    toast.success("Akun berhasil dibuat!");

    const params = new URLSearchParams(window.location.search);
    const invite = params.get("invite");
    if (invite) {
      router.push(`/join/${encodeURIComponent(invite)}`);
      return;
    }
    router.push("/onboarding/create-couple");
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
          Buat akun baru
          <Sparkles className="h-5 w-5 text-primary heartbeat" />
        </h1>
        <p className="text-sm text-muted-foreground">
          Mari mulai perjalanan cinta yang terstruktur dan aman.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name">Nama Lengkap</Label>
          <Input
            id="name"
            placeholder="Alvin Pratama"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="kamu@email.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Kata Sandi</Label>
          <Input
            id="password"
            type="password"
            placeholder="Minimal 8 karakter"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            minLength={8}
          />
        </div>

        <Button type="submit" size="lg" className="heart-glow w-full" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Daftar
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Masuk
        </Link>
      </p>
    </div>
  );
}