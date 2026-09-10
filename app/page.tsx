import Link from "next/link";
import Image from "next/image";
import {
  BookHeart,
  CalendarDays,
  Heart,
  Lock,
  Mail,
  MessageCircleHeart,
  Star,
  Trophy,
  ShieldCheck,
  EyeOff,
  BellOff,
  ArrowRight,
  Music,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FloatingHearts } from "@/components/floating-hearts";

// Logo SVG Kustom Yugma
function YugmaLogo({ className = "h-8 w-auto" }: { className?: string; color?: string }) {
  return (
    <div className="flex items-center gap-3">
      <img
        src="/Yugma-Icon.svg"
        alt="Yugma Logo"
        className={`${className} object-contain shrink-0 mix-blend-multiply scale-150`}
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
    </div>
  );
}

const features = [
  {
    icon: BookHeart,
    title: "Memories",
    description: "Simpan foto, lokasi, dan cerita di balik setiap kenangan manis kalian.",
    tag: "Foto & Tempat",
  },
  {
    icon: MessageCircleHeart,
    title: "Love Letters",
    description: "Surat digital dengan jadwal buka — untuk dibaca di saat yang tepat berdua.",
    tag: "Pesan Waktu",
  },
  {
    icon: Music,
    title: "Playlist",
    description: "Kumpulkan lagu-lagu kenangan yang bermakna dan sering kalian dengarkan bersama.",
    tag: "Musik Berdua",
  },
  {
    icon: HelpCircle,
    title: "Couple Quiz",
    description: "Uji seberapa dalam pengetahuan kalian satu sama lain lewat kuis interaktif yang seru.",
    tag: "Permainan Seru",
  },
  {
    icon: Star,
    title: "Bucket List",
    description: "Daftar hal yang ingin kalian lakukan bersama dengan progres yang tumbuh berdua.",
    tag: "Impian Bersama",
  },
  {
    icon: CalendarDays,
    title: "Our Story",
    description: "Susun perjalanan hubungan kalian secara kronologis, satu milestone di satu waktu.",
    tag: "Garis Waktu",
  },
  {
    icon: Heart,
    title: "Daily Mood",
    description: "Tahapan perasaan harian yang ringan, untuk saling memahami tanpa harus banyak kata.",
    tag: "Koneksi Harian",
  },
  {
    icon: Trophy,
    title: "Achievements",
    description: "Buka lencana kecil dari aktivitas kalian — pengingat manis dari setiap langkah bersama.",
    tag: "Pencapaian",
  },
];

const privacyPoints = [
  {
    icon: ShieldCheck,
    title: "Hanya Dua Akun",
    description: "Bukan aplikasi publik — khusus satu ruang eksklusif untuk satu pasangan.",
  },
  {
    icon: EyeOff,
    title: "Terenkripsi di Perjalanan",
    description: "Foto, surat, dan cerita tersimpan dengan perlindungan data tingkat tinggi.",
  },
  {
    icon: BellOff,
    title: "Bebas Distraksi",
    description: "Tidak ada feed, tidak ada follower, dan tidak ada algoritma yang mengganggu.",
  },
];

export default function Home() {
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[#FDFBF7] text-[#2B1B22] selection:bg-[#D4A5A5]/30 selection:text-[#6B2D39]">
      <FloatingHearts />

      {/* Ambient Blur Gradient */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#6B2D39]/20 via-[#D4A5A5]/20 to-[#F8F4EE] opacity-70 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#EFE6DD]/80 bg-[#FDFBF7]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center transition hover:opacity-90">
            <YugmaLogo className="h-8 w-auto" color="#6B2D39" />
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-[#2B1B22]/70 md:flex">
            <a href="#fitur" className="transition hover:text-[#6B2D39]">
              Fitur
            </a>
            <a href="#privasi" className="transition hover:text-[#6B2D39]">
              Privasi
            </a>
            <a href="#cerita" className="transition hover:text-[#6B2D39]">
              Cerita
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild size="sm" className="rounded-full text-[#6B2D39] hover:bg-[#D4A5A5]/15 hover:text-[#6B2D39]">
              <Link href="/login" className="flex items-center gap-1.5 font-medium">
                <Heart className="h-4 w-4 fill-[#6B2D39] text-[#6B2D39]" />
                Masuk
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-24">
        {/* Hero Section */}
        <section className="flex flex-col items-center pt-16 text-center md:pt-28">
          <Badge variant="outline" className="mb-6 gap-2 rounded-full border-[#D4A5A5]/60 bg-[#6B2D39]/5 px-4 py-1.5 text-xs font-medium tracking-wide uppercase text-[#6B2D39] shadow-sm backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 animate-pulse text-[#6B2D39]" />
            <span>A private space for two</span>
          </Badge>

          <h1 className="max-w-4xl font-serif text-4xl leading-[1.1] tracking-tight text-[#2B1B22] sm:text-5xl md:text-6xl lg:text-7xl">
            Tempat privat kita berdua. <br />
            <span className="bg-gradient-to-r from-[#6B2D39] via-[#8C4351] to-[#D4A5A5] bg-clip-text text-transparent">
              Bukan medsos. Bukan galeri.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-balance text-base text-[#2B1B22]/70 sm:text-lg md:text-xl font-normal leading-relaxed">
            Sebuah dunia kecil yang hanya milik kalian — untuk menyimpan kenangan, menulis surat,
            merencanakan mimpi, dan mengingat hal-hal yang terasa penting.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <Button asChild size="xl" className="rounded-full bg-[#6B2D39] px-8 text-[#FDFBF7] shadow-lg shadow-[#6B2D39]/20 transition-all hover:bg-[#54232C] hover:scale-[1.02]">
              <Link href="/login" className="flex items-center gap-2 font-medium">
                <Heart className="h-4 w-4 heartbeat fill-current" />
                Masuk ke ruang Yugma
              </Link>
            </Button>
            <Button asChild size="xl" variant="outline" className="rounded-full border-[#EFE6DD] bg-[#FDFBF7]/60 px-8 text-[#2B1B22] backdrop-blur hover:bg-[#F8F4EE] hover:text-[#6B2D39]">
              <Link href="/join" className="flex items-center gap-2 font-medium">
                <Sparkles className="h-4 w-4 text-[#6B2D39]" />
                Punya kode undangan?
              </Link>
            </Button>
          </div>

          <p className="mt-5 flex items-center gap-2 text-xs text-[#2B1B22]/60">
            <Lock className="h-3.5 w-3.5 text-[#6B2D39]" />
            Undangan melalui tautan privat. Tanpa publik. Tanpa like. Tanpa algoritma.
          </p>

          {/* Screenshot App Mockup Wrapper */}
          <div className="mt-16 w-full max-w-5xl rounded-3xl border border-[#EFE6DD] bg-[#F8F4EE]/80 p-2 shadow-2xl backdrop-blur-xl md:p-4">
            {/* Header Bingkai Window */}
            <div className="mb-3 flex items-center justify-between px-3 pt-1">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-[#6B2D39]/20" />
                <div className="h-3 w-3 rounded-full bg-[#D4A5A5]/40" />
                <div className="h-3 w-3 rounded-full bg-[#EFE6DD]" />
              </div>
              <span className="text-[11px] font-medium tracking-wide text-[#2B1B22]/50">
                yugma.app/dashboard
              </span>
              <div className="w-12" />
            </div>

            {/* Container Gambar */}
            <div className="relative aspect-[16/7.7] w-full overflow-hidden rounded-2xl border border-[#EFE6DD] bg-[#FDFBF7] shadow-inner">
              <Image
                src="/app-preview.png"
                alt="Yugma App Preview"
                fill
                className="object-contain object-center transition-transform duration-700 hover:scale-[1.01]"
                priority
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="fitur" className="mt-32">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="soft" className="mb-3 rounded-full bg-[#D4A5A5]/20 text-[#6B2D39] border border-[#D4A5A5]/40">
              Ruang Kebersamaan
            </Badge>
            <h2 className="font-serif text-3xl font-bold tracking-tight text-[#2B1B22] md:text-5xl">
              Satu tempat untuk semuanya.
            </h2>
            <p className="mt-4 text-[#2B1B22]/70 leading-relaxed">
              Berhenti mencatat kenangan di chat yang hilang. Pindahkan ke tempat yang hangat,
              terstruktur, dan hanya kalian yang bisa membukanya.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[#EFE6DD] bg-[#F8F4EE]/60 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-[#D4A5A5] hover:shadow-xl hover:shadow-[#6B2D39]/5 backdrop-blur-sm"
                style={{
                  animationDelay: `${i * 80}ms`,
                  animation: "fade-in 0.6s ease-out both",
                }}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#6B2D39]/10 text-[#6B2D39] transition-colors group-hover:bg-[#6B2D39] group-hover:text-[#FDFBF7]">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-semibold tracking-wider uppercase text-[#2B1B22]/60 bg-[#EFE6DD]/60 px-2 py-0.5 rounded-full border border-[#EFE6DD]">
                      {feature.tag}
                    </span>
                  </div>
                  <h3 className="mt-5 font-serif text-xl font-semibold tracking-tight text-[#2B1B22]">{feature.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#2B1B22]/70">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Privacy Section */}
        <section id="privasi" className="mt-32 rounded-3xl border border-[#EFE6DD] bg-gradient-to-b from-[#F8F4EE] via-[#F8F4EE]/50 to-[#FDFBF7] p-8 md:p-14 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#6B2D39]/10 blur-3xl pointer-events-none" />

          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-6">
              <Badge variant="default" className="gap-1.5 rounded-full bg-[#6B2D39] text-[#FDFBF7] px-3.5 py-1">
                <Lock className="h-3.5 w-3.5" />
                Private by Default
              </Badge>
              <h2 className="mt-5 font-serif text-3xl font-bold tracking-tight text-[#2B1B22] md:text-5xl leading-tight">
                Privat sampai ke akarnya.
              </h2>
              <p className="mt-4 text-base text-[#2B1B22]/70 leading-relaxed">
                Data pribadi kalian dilindungi dengan Row Level Security, sehingga akses data dibatasi hanya untuk anggota couple space.
              </p>

              <div className="mt-8 space-y-4">
                {privacyPoints.map((point, i) => (
                  <div
                    key={point.title}
                    className="flex items-start gap-4 rounded-2xl border border-[#EFE6DD] bg-[#FDFBF7]/80 p-4 transition hover:border-[#D4A5A5]"
                    style={{
                      animationDelay: `${i * 120}ms`,
                      animation: "fade-in 0.6s ease-out both",
                    }}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#6B2D39]/10 text-[#6B2D39]">
                      <point.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-[#2B1B22]">{point.title}</h4>
                      <p className="text-xs text-[#2B1B22]/70 mt-0.5">{point.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Grid Art Display */}
            <div className="lg:col-span-6">
              <div className="relative aspect-square overflow-hidden rounded-3xl bg-gradient-to-br from-[#6B2D39]/20 via-[#D4A5A5]/20 to-[#EFE6DD] p-2 shadow-inner">
                <div className="grid h-full w-full grid-cols-3 gap-3 rounded-[1.3rem] bg-[#FDFBF7]/90 p-5 backdrop-blur">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div
                      key={i}
                      className={`relative overflow-hidden rounded-2xl transition-all duration-500 ${
                        i % 2 === 0 ? "bg-[#6B2D39]/10" : "bg-[#D4A5A5]/20"
                      } ${i === 4 ? "ring-2 ring-[#6B2D39]/50 shadow-lg shadow-[#6B2D39]/15" : "hover:scale-95"}`}
                    >
                      {i === 4 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-[#6B2D39]/10">
                          <Heart className="h-10 w-10 text-[#6B2D39] heartbeat fill-[#6B2D39]" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quote Section */}
        <section id="cerita" className="mt-32 text-center">
          <div className="mx-auto max-w-3xl rounded-3xl border border-[#D4A5A5]/40 bg-[#6B2D39]/5 px-6 py-16 backdrop-blur">
            <p className="font-serif text-2xl font-medium italic text-[#2B1B22] md:text-4xl leading-snug">
              &ldquo;Bukan soal fitur. Ini soal{" "}
              <span className="text-[#6B2D39] font-bold inline-flex items-center gap-1">
                tempat <Heart className="h-6 w-6 heartbeat fill-[#6B2D39] text-[#6B2D39]" />
              </span>{" "}
              pulang.&rdquo;
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
<footer className="relative border-t border-[#EFE6DD] bg-[#F8F4EE]/60 backdrop-blur-md">
  <div className="mx-auto max-w-6xl px-6 py-12">
    <div className="grid gap-8 md:grid-cols-12 md:gap-12">
      {/* Brand & Tagline */}
      <div className="space-y-3 md:col-span-6">
        <div className="flex items-center gap-2">
          <YugmaLogo className="h-7 w-auto" color="#6B2D39" />
        </div>
        <p className="max-w-sm text-xs leading-relaxed text-[#2B1B22]/70">
          Ruang privat eksklusif untuk dua orang. Dirancang untuk menyimpan kenangan, surat, dan cerita bersama tanpa distraksi dunia luar.
        </p>
      </div>

      {/* Navigasi Cepat */}
      <div className="grid grid-cols-2 gap-8 md:col-span-6 md:justify-items-end">
        <div className="space-y-2.5">
          <p className="text-[11px] font-semibold tracking-wider text-[#6B2D39] uppercase">
            Jelajahi
          </p>
          <ul className="space-y-2 text-xs font-medium text-[#2B1B22]/70">
            <li>
              <a href="#fitur" className="transition hover:text-[#6B2D39]">
                Fitur Utama
              </a>
            </li>
            <li>
              <a href="#privasi" className="transition hover:text-[#6B2D39]">
                Keamanan & Privasi
              </a>
            </li>
            <li>
              <a href="#cerita" className="transition hover:text-[#6B2D39]">
                Filosofi
              </a>
            </li>
          </ul>
        </div>

        <div className="space-y-2.5">
          <p className="text-[11px] font-semibold tracking-wider text-[#6B2D39] uppercase">
            Bantuan & Akses
          </p>
          <ul className="space-y-2 text-xs font-medium text-[#2B1B22]/70">
            <li>
              <Link href="/login" className="transition hover:text-[#6B2D39]">
                Masuk ke Ruang
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="transition hover:text-[#6B2D39]">
                Kebijakan Privasi
              </Link>
            </li>
            <li>
              <a
                href="mailto:hi@yugma.web.id"
                className="inline-flex items-center gap-1.5 transition hover:text-[#6B2D39]"
              >
                <Mail className="h-3.5 w-3.5" />
                Kontak Kami
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    {/* Bottom Bar */}
    <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#EFE6DD] pt-6 text-xs text-[#2B1B22]/60 sm:flex-row">
      <p>&copy; {new Date().getFullYear()} Yugma. All rights reserved.</p>
      <p className="flex items-center gap-1.5 text-[11px]">
        Designed for two, built with care <Heart className="h-3 w-3 fill-[#6B2D39] text-[#6B2D39]" />
      </p>
    </div>
  </div>
</footer>
    </div>
  );
}