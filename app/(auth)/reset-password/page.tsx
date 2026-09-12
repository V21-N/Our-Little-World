"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ password: "", confirmPassword: "" });

  const token = searchParams.get("token");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Kata sandi tidak sama");
      return;
    }
    if (!token) {
      toast.error("Tautan reset tidak valid");
      return;
    }
    setLoading(true);
    const { data, error } = await authClient.resetPassword({
      newPassword: form.password,
      token,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message ?? "Reset failed");
      return;
    }
    toast.success("Kata sandi berhasil diperbarui");
    router.push("/login");
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="password">Kata Sandi Baru</Label>
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

      <div className="space-y-2">
        <Label htmlFor="confirm">Konfirmasi Kata Sandi</Label>
        <Input
          id="confirm"
          type="password"
          placeholder="Ulangi kata sandi baru"
          value={form.confirmPassword}
          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          required
        />
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Simpan Kata Sandi
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-primary hover:underline">
          Kembali ke masuk
        </Link>
      </p>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-serif text-3xl tracking-tight">Atur ulang kata sandi</h1>
        <p className="text-sm text-muted-foreground">
          Pilih kata sandi baru untuk akun kamu.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 animate-pulse rounded-full bg-primary/20" />
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}