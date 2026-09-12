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
  Heart,
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
import { useAuth, type CurrentProfile } from "@/lib/hooks/use-auth";
import { authClient } from "@/lib/auth-client";
import { uploadFile } from "@/lib/api/client";
import { apiFetch } from "@/lib/api/client";

export default function SettingsPage() {
  const router = useRouter();
  const { profile, couple, user, refresh, signOut } = useAuth();
  const [copied, setCopied] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showLeave, setShowLeave] = useState(false);
  
  // State untuk Hapus Akun
  const [deletePassword, setDeletePassword] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);

  // State untuk Pending File Avatar & Preview
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Loading States
  const [regenerating, setRegenerating] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingCouple, setSavingCouple] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const logout = async () => {
    await signOut();
    router.replace("/");
  };

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

  if (!user || !profile) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-6 lg:py-10 lg:pr-8">
        <div className="mb-8 h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="mb-6 h-40 animate-pulse rounded-3xl border border-border/60 bg-card" />
        <div className="space-y-4">
          <div className="h-24 animate-pulse rounded-2xl border border-border/60 bg-card" />
          <div className="h-24 animate-pulse rounded-2xl border border-border/60 bg-card" />
          <div className="h-24 animate-pulse rounded-2xl border border-border/60 bg-card" />
        </div>
      </div>
    );
  }

  if (!couple) {
    return (
      <div className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#6B2D39]/10 text-[#6B2D39] mb-4">
          <SettingsIcon className="h-8 w-8" />
        </div>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-[#2B1B22]">Pengaturan Ruang</h1>
        <p className="mt-3 text-sm text-[#2B1B22]/70 leading-relaxed">
          Kamu belum bergabung dengan ruang manapun. Buat atau terima undangan terlebih dahulu untuk memulai Yugma.
        </p>
        <div className="mt-8 flex gap-3 w-full sm:w-auto">
          <Button variant="outline" onClick={() => router.push("/")} className="rounded-full border-[#EFE6DD] w-full sm:w-auto">
            Beranda
          </Button>
          <Button onClick={logout} className="rounded-full bg-[#6B2D39] hover:bg-[#54232C] text-[#FDFBF7] w-full sm:w-auto">
            <LogOut className="h-4 w-4 mr-2" />
            Keluar Sesi
          </Button>
        </div>
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
      toast.success("Kode undangan baru berhasil dibuat");
      refresh();
    } else {
      toast.error(res.error);
    }
  };

  const onAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    let finalAvatarUrl = profileForm.avatarUrl;

    if (avatarFile) {
      const uploadResult = await uploadFile(avatarFile, "avatars", user.id);
      if (!uploadResult.success || !uploadResult.url) {
        toast.error(uploadResult.error ?? "Gagal mengupload foto");
        setSavingProfile(false);
        return;
      }
      finalAvatarUrl = uploadResult.url;
    }

    const res = await apiFetch<CurrentProfile>("/api/profile", {
      method: "PATCH",
      body: JSON.stringify({
        fullName: profileForm.fullName,
        nickname: profileForm.nickname || null,
        birthday: profileForm.birthday || null,
        avatarUrl: finalAvatarUrl || null,
      }),
    });

    setSavingProfile(false);
    if (res.success) {
      toast.success("Profil berhasil diperbarui");
      const updatedUrl = res.data.avatarUrl ?? finalAvatarUrl;
      setAvatarFile(null);
      setAvatarPreview(null);
      setProfileForm((prev) => ({
        ...prev,
        fullName: res.data.fullName,
        nickname: res.data.nickname ?? "",
        birthday: res.data.birthday ?? "",
        avatarUrl: updatedUrl ?? "",
      }));
      await refresh();
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
      toast.success("Pengaturan ruang berhasil disimpan");
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
      toast.success("Kamu telah keluar dari ruang couple ini");
      await refresh();
      router.push("/onboarding/create-couple");
    } else {
      toast.error(res.error);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error("Silakan masukkan kata sandi untuk mengonfirmasi.");
      return;
    }

    setDeletingAccount(true);
    try {
      const { error } = await authClient.deleteUser({
        password: deletePassword,
      });
      
      if (error) {
        toast.error(error.message ?? "Gagal menghapus akun. Pastikan kata sandimu benar.");
        setDeletingAccount(false);
        return;
      }

      toast.success("Akun berhasil dihapus permanen.");
      await logout();
    } catch (e) {
      toast.error("Terjadi kesalahan sistem saat menghapus akun.");
      setDeletingAccount(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-5 py-6 lg:py-10 lg:pr-8 text-[#2B1B22]">
      <header className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#6B2D39]">
          Profile & Settings
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight md:text-4xl">
          Pengaturan
        </h1>
        <p className="mt-2 text-sm text-[#2B1B22]/70">
          Atur identitasmu, detail ruang Yugma, dan preferensi akun.
        </p>
      </header>

      {/* SECTION 1: PROFIL */}
      <section className="mb-8">
        <SectionHeader icon={User} title="Profil Personal" />
        <Card className="rounded-3xl border border-[#EFE6DD] bg-[#FDFBF7] shadow-sm">
          <CardContent className="space-y-6 pt-6">
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="relative">
                <Avatar className="h-20 w-20 ring-4 ring-[#F8F4EE] bg-[#D4A5A5]/20">
                  <AvatarImage 
                    src={avatarPreview || profileForm.avatarUrl || profile?.avatarUrl || undefined} 
                    alt={profileForm.fullName} 
                    className="object-cover" 
                  />
                  <AvatarFallback className="text-xl font-serif text-[#6B2D39]">
                    {initials(profileForm.fullName || user.name)}
                  </AvatarFallback>
                </Avatar>
                
                {savingProfile && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-[2px]">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </div>
                )}
              </div>

              <div className="flex-1 text-center sm:text-left">
                <p className="font-serif text-xl font-semibold text-[#2B1B22]">{profileForm.fullName || user.name}</p>
                <p className="text-sm text-[#2B1B22]/60">{user.email}</p>
                {avatarFile && (
                  <p className="text-xs text-[#6B2D39] font-medium mt-1">
                    *Foto baru dipilih (belum disimpan)
                  </p>
                )}
              </div>
              <label className="cursor-pointer">
                <Button variant="outline" size="sm" asChild className="rounded-full border-[#EFE6DD] hover:bg-[#F8F4EE] hover:text-[#6B2D39]">
                  <span>Pilih Foto</span>
                </Button>
                <input type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
              </label>
            </div>

            <Separator className="bg-[#EFE6DD]" />

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-[#2B1B22]/70">Nama Lengkap</Label>
                <Input
                  className="h-11 rounded-xl border-[#EFE6DD] bg-[#FDFBF7] focus:border-[#6B2D39] focus:ring-[#6B2D39]/20"
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-[#2B1B22]/70">Panggilan Sayang</Label>
                <Input
                  className="h-11 rounded-xl border-[#EFE6DD] bg-[#FDFBF7] focus:border-[#6B2D39] focus:ring-[#6B2D39]/20"
                  value={profileForm.nickname}
                  placeholder="Biasa dipanggil apa?"
                  onChange={(e) => setProfileForm({ ...profileForm, nickname: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-[#2B1B22]/70">Tanggal Lahir</Label>
                <Input
                  type="date"
                  className="h-11 rounded-xl border-[#EFE6DD] bg-[#FDFBF7] focus:border-[#6B2D39] focus:ring-[#6B2D39]/20"
                  value={profileForm.birthday}
                  onChange={(e) => setProfileForm({ ...profileForm, birthday: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-[#2B1B22]/70">Email Terdaftar</Label>
                <Input type="email" value={user.email} disabled className="h-11 rounded-xl border-[#EFE6DD] bg-[#F8F4EE] text-[#2B1B22]/75" />
              </div>
            </div>
            <Button onClick={saveProfile} disabled={savingProfile} className="rounded-full bg-[#6B2D39] hover:bg-[#54232C] text-[#FDFBF7]">
              {savingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Perubahan
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* SECTION 2: PENGATURAN RUANG (COUPLE) */}
      <section className="mb-8">
        <SectionHeader icon={Heart} title="Pengaturan Ruang" />
        <Card className="rounded-3xl border border-[#EFE6DD] bg-[#FDFBF7] shadow-sm">
          <CardContent className="space-y-6 pt-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-[#2B1B22]/70">Nama Ruangan</Label>
                <Input
                  className="h-11 rounded-xl border-[#EFE6DD] bg-[#FDFBF7] focus:border-[#6B2D39] focus:ring-[#6B2D39]/20"
                  value={coupleForm.coupleName}
                  placeholder="Misal: Alvin & Manda"
                  onChange={(e) => setCoupleForm({ ...coupleForm, coupleName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-[#2B1B22]/70">Tanggal Jadian</Label>
                <Input
                  type="date"
                  className="h-11 rounded-xl border-[#EFE6DD] bg-[#F8F4EE] text-[#2B1B22]/60"
                  value={coupleForm.relationshipStartDate}
                  disabled
                />
              </div>
            </div>

            <Separator className="bg-[#EFE6DD]" />

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#2B1B22]/60">
                Partner Kamu
              </p>
              <div className="mt-3 flex items-center gap-4 rounded-2xl border border-[#EFE6DD] bg-[#F8F4EE]/50 p-4">
                <Avatar className="h-12 w-12 bg-[#D4A5A5]/20 text-[#6B2D39]">
                  <AvatarFallback className="font-serif font-semibold">{initials("Pasangan")}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-[#2B1B22]">Pasanganmu</p>
                  <p className="text-xs text-[#2B1B22]/60 mt-0.5">
                    Bergabung sejak{" "}
                    {couple.createdAt ? formatDate(couple.createdAt, { day: "numeric", month: "long", year: "numeric" }) : "-"}
                  </p>
                </div>
                <Badge className="bg-[#6B2D39]/10 text-[#6B2D39] hover:bg-[#6B2D39]/20 border-none shadow-none">Aktif</Badge>
              </div>
            </div>

            <Separator className="bg-[#EFE6DD]" />

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#2B1B22]/60">
                Kode Undangan
              </p>
              <p className="mt-1 text-xs text-[#2B1B22]/60">
                Gunakan ini untuk mengundang pasangan baru (hanya jika pasanganmu saat ini keluar).
              </p>
              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-dashed border-[#D4A5A5]/60 bg-[#D4A5A5]/5 p-3">
                <code className="flex-1 px-2 font-mono text-xl font-bold tracking-[0.25em] text-[#6B2D39]">
                  {couple.inviteCode}
                </code>
                <Button size="icon" variant="outline" onClick={copyInvite} className="rounded-xl border-[#D4A5A5]/40 text-[#6B2D39] hover:bg-[#6B2D39]/10 hover:border-[#6B2D39]/30">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={regenerateCode}
                  disabled={regenerating}
                  className="rounded-xl border-[#D4A5A5]/40 text-[#6B2D39] hover:bg-[#6B2D39]/10 hover:border-[#6B2D39]/30"
                >
                  {regenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCw className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button onClick={saveCouple} disabled={savingCouple} className="rounded-full bg-[#6B2D39] hover:bg-[#54232C] text-[#FDFBF7]">
              {savingCouple && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Ruang
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* SECTION 3: KELUAR RUANGAN */}
      <section className="mb-8">
        <SectionHeader icon={UserMinus} title="Keluar dari Ruang" />
        <Card className="rounded-3xl border border-[#EFE6DD] bg-[#FDFBF7] shadow-sm">
          <CardContent className="space-y-4 pt-6">
            <p className="text-sm leading-relaxed text-[#2B1B22]/70">
              Keluar dari ruang Yugma ini. Pasanganmu yang tersisa akan tetap memegang kendali atas kenangan. Lakukan ini jika kamu ingin membuat ruang baru.
            </p>
            <Button
              variant="outline"
              className="w-full justify-between rounded-xl border-[#EFE6DD] text-[#2B1B22] hover:bg-[#F8F4EE] hover:text-[#6B2D39]"
              onClick={() => setShowLeave(true)}
            >
              <span className="font-medium">Keluar dari ruang ini</span>
              <UserMinus className="h-4 w-4 text-[#6B2D39]" />
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* SECTION 4: NOTIFIKASI */}
      <section className="mb-8">
        <SectionHeader icon={Bell} title="Notifikasi" />
        <Card className="rounded-3xl border border-[#EFE6DD] bg-[#FDFBF7] shadow-sm">
          <CardContent className="divide-y divide-[#EFE6DD] pt-2">
            <ToggleRow
              title="Mood Harian Pasangan"
              description="Tampilkan emoji mood terbaru pasangan di dashboard"
              defaultChecked
            />
            <ToggleRow
              title="Notifikasi Milestone"
              description="Pemberitahuan saat melewati hari bersejarah kalian"
              defaultChecked
            />
            <ToggleRow
              title="Pengingat Anniversary"
              description="Kirim notifikasi email 7 hari sebelum perayaan"
              defaultChecked
            />
          </CardContent>
        </Card>
      </section>

      {/* SECTION 5: KEAMANAN & HAPUS AKUN */}
      <section className="mb-12">
        <SectionHeader icon={KeyRound} title="Keamanan Akun" />
        <div className="space-y-4">
          <Card className="rounded-3xl border border-[#EFE6DD] bg-[#FDFBF7] shadow-sm">
            <CardContent className="space-y-3 pt-6">
              <Link
                href="/forgot-password"
                className="group flex items-center justify-between rounded-2xl border border-[#EFE6DD] bg-[#F8F4EE]/50 p-4 transition hover:border-[#D4A5A5]/60 hover:bg-[#D4A5A5]/5"
              >
                <div>
                  <p className="text-sm font-semibold text-[#2B1B22]">Ubah Kata Sandi</p>
                  <p className="text-xs text-[#2B1B22]/60 mt-0.5">Kami akan kirim tautan reset ke email kamu</p>
                </div>
                <span className="text-xs font-medium text-[#6B2D39] transition-transform group-hover:translate-x-1">Ubah →</span>
              </Link>
              <Button
                variant="outline"
                className="w-full justify-between rounded-xl border-[#EFE6DD] hover:bg-[#F8F4EE]"
                onClick={logout}
              >
                <span className="font-medium text-[#2B1B22]">Keluar (Logout)</span>
                <LogOut className="h-4 w-4 text-[#2B1B22]/70" />
              </Button>
            </CardContent>
          </Card>

          {/* DANGER ZONE - HAPUS AKUN PERMANEN */}
          <Card className="rounded-3xl border border-red-200 bg-red-50/50 shadow-sm">
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-full bg-red-100 p-1.5">
                  <Trash2 className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="font-serif text-lg font-bold text-red-700">Hapus Akun Permanen</p>
                  <p className="mt-1 text-xs leading-relaxed text-red-600/80">
                    Menghapus akun akan memusnahkan seluruh aksesmu secara permanen. Jika tidak ada siapapun di dalam ruang setelah kamu pergi, sistem akan menghapus seluruh data dalam 30 hari.
                  </p>
                </div>
              </div>
              <Button
                variant="destructive"
                onClick={() => setShowDelete(true)}
                className="w-full rounded-full bg-red-600 hover:bg-red-700 shadow-sm"
              >
                Hapus Akun Saya Permanen
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* DIALOG HAPUS AKUN */}
      <Dialog open={showDelete} onOpenChange={(open) => { setShowDelete(open); if (!open) setDeletePassword(""); }}>
        <DialogContent className="sm:rounded-3xl border-[#EFE6DD] bg-[#FDFBF7]">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-[#2B1B22]">Hapus Akun Permanen?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm leading-relaxed text-[#2B1B22]/70">
              Tindakan ini tidak bisa dibatalkan. Kamu akan kehilangan seluruh akses ke Yugma, dan data personalmu akan dihapus dari server.
            </p>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-[#2B1B22]/80">
                Kata Sandi Konfirmasi
              </Label>
              <Input 
                type="password" 
                placeholder="Masukkan kata sandi kamu"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="h-11 rounded-xl border-[#EFE6DD] bg-[#FDFBF7] focus:border-red-500 focus:ring-red-500/20"
              />
            </div>
          </div>
          <DialogFooter className="mt-2 flex-col sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" className="rounded-full border-[#EFE6DD]" onClick={() => { setShowDelete(false); setDeletePassword(""); }} disabled={deletingAccount}>
              Batalkan
            </Button>
            <Button
              variant="destructive"
              className="rounded-full bg-red-600 hover:bg-red-700"
              onClick={handleDeleteAccount}
              disabled={deletingAccount || !deletePassword}
            >
              {deletingAccount ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Ya, Hapus Akun
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG KELUAR RUANGAN */}
      <Dialog open={showLeave} onOpenChange={setShowLeave}>
        <DialogContent className="sm:rounded-3xl border-[#EFE6DD] bg-[#FDFBF7]">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-[#2B1B22]">Keluar dari Ruang?</DialogTitle>
          </DialogHeader>
          <p className="text-sm leading-relaxed text-[#2B1B22]/70">
            Kamu akan meninggalkan ruang <strong className="text-[#6B2D39]">{couple.coupleName ?? "saat ini"}</strong>. Pasanganmu tetap bisa melihat kenangan yang sudah ada.
          </p>
          <DialogFooter className="mt-2 flex-col sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" className="rounded-full border-[#EFE6DD]" onClick={() => setShowLeave(false)} disabled={leaving}>
              Batal
            </Button>
            <Button variant="destructive" className="rounded-full bg-[#6B2D39] text-[#FDFBF7] hover:bg-[#54232C]" onClick={leaveCouple} disabled={leaving}>
              {leaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Ya, Keluar Ruangan
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
    <div className="mb-4 flex items-center gap-2.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#6B2D39]/10">
        <Icon className="h-4 w-4 text-[#6B2D39]" />
      </div>
      <h2 className="font-serif text-xl font-semibold text-[#2B1B22]">{title}</h2>
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
    <div className="flex items-center justify-between gap-4 py-4">
      <div>
        <p className="text-sm font-semibold text-[#2B1B22]">{title}</p>
        <p className="text-xs text-[#2B1B22]/60 mt-0.5">{description}</p>
      </div>
      <Switch 
        checked={checked} 
        onCheckedChange={setChecked} 
        className="data-[state=checked]:bg-[#6B2D39] data-[state=unchecked]:bg-[#EFE6DD]"
      />
    </div>
  );
}