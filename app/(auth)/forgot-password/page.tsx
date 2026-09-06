"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await authClient.requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    });
    setLoading(false);
    if (error) {
      toast.error(error.message ?? "Failed");
      return;
    }
    setSent(true);
    toast.success("Tautan reset sudah dikirim");
  };

  if (sent) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <span className="text-3xl">✉️</span>
        </div>
        <div className="space-y-2">
          <h1 className="font-serif text-3xl tracking-tight">Cek email kamu</h1>
          <p className="text-sm text-muted-foreground">
            Kami sudah mengirim tautan reset ke <strong>{email}</strong>. Cek inbox atau folder
            spam kamu.
          </p>
        </div>
        <Button asChild variant="outline" className="w-full">
          <Link href="/login">Kembali ke halaman masuk</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-serif text-3xl tracking-tight">Lupa kata sandi?</h1>
        <p className="text-sm text-muted-foreground">
          Masukkan email kamu. Kami akan kirimkan tautan untuk mengatur ulang kata sandi.
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
          />
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Kirim tautan reset
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Ingat kata sandi kamu?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Masuk
          </Link>
        </p>
      </form>
    </div>
  );
}