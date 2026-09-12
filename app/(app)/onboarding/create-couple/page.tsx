"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Heart, Loader2, LogOut, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { FloatingHearts } from "@/components/floating-hearts";
import { apiFetch } from "@/lib/api/client";
import { useAuth } from "@/lib/hooks/use-auth";

export default function CreateCouplePage() {
  const router = useRouter();
  const { couple, loading, signOut } = useAuth();
  const [bootLoading, setBootLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    partnerName: "",
    coupleName: "",
    relationshipStartDate: "",
  });

  useEffect(() => {
    if (loading) return;
    if (couple) {
      router.replace(`/onboarding/invite?code=${couple.inviteCode}`);
      return;
    }
    setBootLoading(false);
  }, [loading, couple, router]);

  const handleNext = () => {
    if (step === 1) {
      if (!form.partnerName.trim()) {
        toast.error("Nama pasanganmu belum diisi");
        return;
      }
      setStep(2);
    } else {
      handleCreate();
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.replace("/");
  };

  const handleCreate = async () => {
    setCreating(true);
    const result = await apiFetch<{ id: string; inviteCode: string }>("/api/couples", {
      method: "POST",
      body: JSON.stringify({
        coupleName: form.coupleName || `${form.partnerName} & Me`,
        relationshipStartDate: form.relationshipStartDate,
      }),
    });

    setCreating(false);
    if (result.success) {
      toast.success("Dunia kita berhasil dibuat!");
      router.push(`/onboarding/invite?code=${result.data.inviteCode}`);
    } else {
      toast.error(result.error);
    }
  };

  if (bootLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20 blur-sm"></div>
          <div className="relative h-10 w-10 animate-pulse rounded-full bg-primary/30" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-6 py-10 md:py-16">
      <FloatingHearts count={10} />
      <div className="relative mx-auto max-w-xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="/Yugma-Icon.svg"
              alt="Yugma Logo"
              className="heartbeat h-8 w-8 shrink-0 object-contain mix-blend-multiply"
            />
            <span
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "20px",
                fontWeight: "600",
                letterSpacing: "0.2em",
                color: "#6B2D39",
              }}
            >
              YUGMA
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-muted-foreground">
              Langkah {step} dari 2
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-3.5 w-3.5" />
              Keluar
            </Button>
          </div>
        </div>

        <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: step === 1 ? "50%" : "100%" }}
          />
        </div>

        {step === 1 ? (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-2 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Sparkles className="h-6 w-6" />
              </div>
              <h1 className="font-serif text-3xl tracking-tight">
                Hai! Siapa pasanganmu?
              </h1>
              <p className="text-sm text-muted-foreground">
                Kita akan mulai dengan sapaan singkat, sebelum masuk ke detail.
              </p>
            </div>

            <Card className="border-border/60">
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="partnerName">Nama pasanganmu</Label>
                  <Input
                    id="partnerName"
                    placeholder="Contoh: Manda Saputra"
                    value={form.partnerName}
                    onChange={(e) => setForm({ ...form, partnerName: e.target.value })}
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground">
                    Dia akan menerima undangan untuk bergabung ke dunia ini.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-2 text-center">
              <h1 className="font-serif text-3xl tracking-tight">
                Ceritakan tentang kita
              </h1>
              <p className="text-sm text-muted-foreground">
                Detail kecil yang akan muncul di tempat paling istimewa.
              </p>
            </div>

            <Card className="border-border/60">
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="coupleName">Nama couple (opsional)</Label>
                  <Input
                    id="coupleName"
                    placeholder='Contoh: "Alvin & Manda"'
                    value={form.coupleName}
                    onChange={(e) => setForm({ ...form, coupleName: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">Tanggal mulai hubungan</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={form.relationshipStartDate}
                    onChange={(e) =>
                      setForm({ ...form, relationshipStartDate: e.target.value })
                    }
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Dari tanggal ini semua kenangan kita dihitung.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => (step === 2 ? setStep(1) : router.back())}
          >
            {step === 2 ? "Kembali" : "Batal"}
          </Button>
          <Button onClick={handleNext} size="lg" disabled={creating}>
            {creating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : step === 1 ? (
              <>
                Lanjut
                <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              <>
                Buat dunia kita
                <Heart className="h-4 w-4" fill="currentColor" />
              </>
            )}
          </Button>
        </div>
        <div className="mt-6 border-t border-border pt-6 text-center">
          <p className="text-sm text-muted-foreground">Sudah menerima undangan?</p>
          <Button variant="link" onClick={() => router.push("/join")}>
            Gabung dengan kode undangan
          </Button>
        </div>
      </div>
    </div>
  );
}