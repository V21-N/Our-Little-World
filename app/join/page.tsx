"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, KeyRound, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function JoinPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setLoading(true);
    router.push(`/join/${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="min-h-screen bg-background px-6 py-10 md:py-16">
      <div className="mx-auto max-w-xl space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Sparkles className="h-7 w-7" />
          </div>
          <h1 className="font-serif text-3xl tracking-tight">Masuk lewat undangan</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Masukkan kode undangan yang diberikan pasanganmu untuk bergabung ke dunia kecil
            kalian.
          </p>
        </div>

        <Card className="border-border/60">
          <CardContent className="space-y-5 pt-6">
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="inviteCode">Kode undangan</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="inviteCode"
                    autoFocus
                    placeholder="Mis. LOVE-2K22"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="pl-9 uppercase tracking-[0.2em]"
                    required
                    maxLength={20}
                  />
                </div>
              </div>
              <Button type="submit" size="lg" className="w-full" disabled={loading || !code.trim()}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Lanjut
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
