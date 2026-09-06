"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Check,
  Copy,
  KeyRound,
  Loader2,
  LogOut,
  RotateCw,
  Settings as SettingsIcon,
  Trash2,
  User,
  UserMinus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatDate, initials } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/lib/hooks/use-auth";
import { authClient } from "@/lib/auth-client";
import { uploadFile } from "@/lib/api/client";
import { apiFetch } from "@/lib/api/client";

export default function SettingsPage() {
  const router = useRouter();
  const { profile, couple, user, refresh, signOut } = useAuth();
  const [copied, setCopied] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showLeave, setShowLeave] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingCouple, setSavingCouple] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const [profileForm, setProfileForm] = useState({
    fullName: "",
    nickname: "",
    birthday: "",
    avatarUrl: "",
  });

  const [coupleForm, setCoupleForm] = useState({
    coupleName: "",
    relationshipStartDate: "",
  });

  useEffect(() => {
    if (profile) {
      setProfileForm({
        fullName: profile.fullName,
        nickname: profile.nickname ?? "",
        birthday: profile.birthday ?? "",
        avatarUrl: profile.avatarUrl ?? "",
      });
    }
  }, [profile]);

  useEffect(() => {
    if (couple) {
      setCoupleForm({
        coupleName: couple.coupleName ?? "",
        relationshipStartDate: couple.relationshipStartDate,
      });
    }
  }, [couple]);

  if (!user || !couple || !profile) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const siteUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  const inviteLink = `${siteUrl}/join/${couple.inviteCode}`;

  const copyInvite = async () => {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast.success("Tautan undangan disalin");
    setTimeout(() => setCopied(false), 1500);
  };

  const regenerateCode = async () => {
    setRegenerating(true);
    const res = await apiFetch<{ inviteCode: string }>("/api/couples/regenerate-invite", {
      method: "POST",
    });
    setRegenerating(false);
    if (res.success) {
      toast.success("Kode undangan baru dibuat");
      refresh();
    } else {
      toast.error(res.error);
    }
  };

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await uploadFile(file, "avatars", user.id);
    if (result.success && result.url) {
      setProfileForm((prev) => ({ ...prev, avatarUrl: result.url! }));
      toast.success("Foto diupload");
    } else {
      toast.error(result.error ?? "Upload gagal");
    }
    e.target.value = "";
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    const res = await apiFetch("/api/profile", {
      method: "PATCH",
      body: JSON.stringify({
        fullName: profileForm.fullName,
        nickname: profileForm.nickname || null,
        birthday: profileForm.birthday || null,
        avatarUrl: profileForm.avatarUrl || null,
      }),
    });
    setSavingProfile(false);
    if (res.success) {
      toast.success("Profil diperbarui");
      refresh();
    } else {
      toast.error(res.error);
    }
  };

  const saveCouple = async () => {
    setSavingCouple(true);
    const res = await apiFetch(`/api/couples/${couple.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        coupleName: coupleForm.coupleName || null,
      }),
    });
    setSavingCouple(false);
    if (res.success) {
      toast.success("Pengaturan couple diperbarui");
      refresh();
    } else {
      toast.error(res.error);
    }
  };

  const leaveCouple = async () => {
    setLeaving(true);
    const res = await apiFetch<{ leftCoupleId: string }>("/api/couples/membership", {
      method: "DELETE",
    });
    setLeaving(false);
    setShowLeave(false);
    if (res.success) {
      toast.success("Kamu keluar dari couple");
      await refresh();
      router.push("/onboarding/create-couple");
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-5 py-6 lg:py-10 lg:pr-8">
      <header className="mb-6">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Profile & Settings
        </p>
        <h1 className="mt-1 font-serif text-3xl tracking-tight md:text-4xl">
          Pengaturan
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Atur profilmu, data couple, dan akun.
        </p>
      </header>

      <section className="mb-6">
        <SectionHeader icon={User} title="Profil kamu" />
        <Card className="border-border/60">
          <CardContent className="space-y-5 pt-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profileForm.avatarUrl || undefined} alt={profileForm.fullName} />
                <AvatarFallback>{initials(profileForm.fullName || user.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-serif text-lg">{profileForm.fullName || user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <label className="cursor-pointer">
                <Button variant="outline" size="sm" asChild>
                  <span>Ganti foto</span>
                </Button>
                <input type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
              </label>
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Nama lengkap</Label>
                <Input
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Nama panggilan</Label>
                <Input
                  value={profileForm.nickname}
                  placeholder="Bisa dipanggil apa?"
                  onChange={(e) => setProfileForm({ ...profileForm, nickname: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Tanggal lahir</Label>
                <Input
                  type="date"
                  value={profileForm.birthday}
                  onChange={(e) => setProfileForm({ ...profileForm, birthday: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={user.email} disabled />
              </div>
            </div>
            <Button onClick={saveProfile} disabled={savingProfile}>
              {savingProfile && <Loader2 className="h-4 w-4 animate-spin" />}
              Simpan profil
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="mb-6">
        <SectionHeader icon={SettingsIcon} title="Pengaturan couple" />
        <Card className="border-border/60">
          <CardContent className="space-y-5 pt-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Nama couple</Label>
                <Input
                  value={coupleForm.coupleName}
                  placeholder="Alvin & Manda"
                  onChange={(e) => setCoupleForm({ ...coupleForm, coupleName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Tanggal mulai hubungan</Label>
                <Input
                  type="date"
                  value={coupleForm.relationshipStartDate}
                  disabled
                />
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Pasangan
              </p>
              <div className="mt-3 flex items-center gap-3 rounded-xl bg-secondary/40 p-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{initials("Pasangan")}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">Pasanganmu</p>
                  <p className="text-xs text-muted-foreground">
                    Bergabung sejak{" "}
                    {couple.createdAt ? formatDate(couple.createdAt, { day: "numeric", month: "long", year: "numeric" }) : "—"}
                  </p>
                </div>
                <Badge variant="success">Aktif</Badge>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Kode undangan
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Gunakan ini untuk mengundang pasangan baru (jika pasanganmu keluar).
              </p>
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-3">
                <code className="flex-1 font-mono text-lg font-semibold tracking-[0.3em] text-primary">
                  {couple.inviteCode}
                </code>
                <Button size="icon-sm" variant="outline" onClick={copyInvite}>
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
                <Button
                  size="icon-sm"
                  variant="outline"
                  onClick={regenerateCode}
                  disabled={regenerating}
                >
                  {regenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCw className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>

            <Button onClick={saveCouple} disabled={savingCouple}>
              {savingCouple && <Loader2 className="h-4 w-4 animate-spin" />}
              Simpan pengaturan couple
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="mb-6">
        <SectionHeader icon={UserMinus} title="Keluar dari couple" />
        <Card className="border-border/60">
          <CardContent className="space-y-3 pt-6">
            <p className="text-sm text-muted-foreground">
              Keluar dari couple saat ini. Pasanganmu yang tersisa tetap punya akses ke kenangan.
              Jika kamu ingin menerima undangan baru atau membuat couple baru, lakukan ini dulu.
            </p>
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => setShowLeave(true)}
            >
              <span>Keluar dari couple ini</span>
              <UserMinus className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="mb-6">
        <SectionHeader icon={Bell} title="Notifikasi" />
        <Card className="border-border/60">
          <CardContent className="space-y-1 divide-y divide-border/40 pt-2">
            <ToggleRow
              title="Mood harian pasangan"
              description="Tampilkan mood pasangan di dashboard"
              defaultChecked
            />
            <ToggleRow
              title="Notifikasi milestone"
              description="Pemberitahuan saat melewati hari penting"
              defaultChecked
            />
            <ToggleRow
              title="Email pengingat anniversary"
              description="Kami kirim pengingat 7 hari sebelum anniversary"
              defaultChecked
            />
          </CardContent>
        </Card>
      </section>

      <section className="mb-6">
        <SectionHeader icon={KeyRound} title="Akun & Keamanan" />
        <Card className="border-border/60">
          <CardContent className="space-y-3 pt-6">
            <Link
              href="/forgot-password"
              className="flex items-center justify-between rounded-xl border border-border/60 p-4 transition hover:border-primary/30 hover:bg-secondary/30"
            >
              <div>
                <p className="text-sm font-medium">Ubah kata sandi</p>
                <p className="text-xs text-muted-foreground">
                  Kami akan kirim tautan reset ke email kamu
                </p>
              </div>
              <span className="text-xs text-primary">Ubah →</span>
            </Link>
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={async () => {
                await signOut();
                router.push("/login");
              }}
            >
              <span>Keluar</span>
              <LogOut className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="mb-12">
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="space-y-3 pt-6">
            <div className="flex items-start gap-3">
              <Trash2 className="mt-0.5 h-5 w-5 text-destructive" />
              <div>
                <p className="font-serif text-base text-destructive">Hapus akun</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Menghapus akun akan mengeluarkanmu dari couple. Data couple tetap dapat
                  diakses oleh pasangan yang tersisa. Jika kedua pasangan menghapus akun, data
                  akan dihapus permanen setelah 30 hari.
                </p>
              </div>
            </div>
            <Button
              variant="destructive"
              onClick={() => setShowDelete(true)}
              className="w-full"
            >
              Hapus akun saya
            </Button>
          </CardContent>
        </Card>
      </section>

      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yakin ingin menghapus akun?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tindakan ini akan mengeluarkanmu dari couple. Pasanganmu akan tetap memiliki akses ke
            seluruh kenangan kalian. Jika kamu berubah pikiran, hubungi kami dalam 30 hari.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDelete(false)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                await signOut();
                router.push("/login");
              }}
            >
              Hapus akun
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showLeave} onOpenChange={setShowLeave}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Keluar dari couple?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Kamu akan keluar dari couple{" "}
            <strong>{couple.coupleName ?? "saat ini"}</strong>. Pasanganmu yang tersisa tetap
            punya akses ke kenangan kalian. Kamu bisa membuat atau menerima undangan baru setelah
            keluar.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLeave(false)} disabled={leaving}>
              Batal
            </Button>
            <Button variant="destructive" onClick={leaveCouple} disabled={leaving}>
              {leaving && <Loader2 className="h-4 w-4 animate-spin" />}
              Ya, keluar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <Icon className="h-4 w-4 text-primary" />
      <h2 className="font-serif text-lg">{title}</h2>
    </div>
  );
}

function ToggleRow({
  title,
  description,
  defaultChecked,
}: {
  title: string;
  description: string;
  defaultChecked?: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked ?? false);
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={setChecked} />
    </div>
  );
}