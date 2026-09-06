import Link from "next/link";
import {
  BookHeart,
  CalendarDays,
  Heart,
  Lock,
  Mail,
  MessageCircleHeart,
  Sparkles,
  Star,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FloatingHearts } from "@/components/floating-hearts";

const features = [
  {
    icon: BookHeart,
    title: "Memories",
    description: "Simpan foto, lokasi, dan cerita di balik setiap kenangan manis kalian.",
  },
  {
    icon: MessageCircleHeart,
    title: "Love Letters",
    description:
      "Surat digital dengan jadwal buka — untuk dibaca di saat yang tepat, berdua atau untuk masing-masing.",
  },
  {
    icon: Star,
    title: "Bucket List",
    description: "Daftar hal yang ingin kalian lakukan bersama, dengan progres yang tumbuh bersama kalian.",
  },
  {
    icon: CalendarDays,
    title: "Our Story",
    description: "Susun perjalanan hubungan kalian secara kronologis, satu milestone di satu waktu.",
  },
  {
    icon: Heart,
    title: "Daily Mood",
    description: "Tahapan perasaan harian yang ringan, untuk saling memahami tanpa harus banyak kata.",
  },
  {
    icon: Trophy,
    title: "Achievements",
    description: "Buka lencana kecil dari aktivitas kalian — pengingat manis dari setiap langkah bersama.",
  },
];

export default function Home() {
  return (
    <div className="relative isolate overflow-hidden">
      <FloatingHearts />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-32 -z-10 transform-gpu overflow-hidden blur-3xl"
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary/25 to-accent/30 opacity-50 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        />
      </div>

      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-serif font-semibold">
          <span className="heartbeat flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Heart className="h-4 w-4" fill="currentColor" />
          </span>
          Our Little World
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <a href="#fitur" className="transition hover:text-foreground">
            Fitur
          </a>
          <a href="#privasi" className="transition hover:text-foreground">
            Privasi
          </a>
          <a href="#cerita" className="transition hover:text-foreground">
            Cerita
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild size="sm">
            <Link href="/login">
              <Heart className="h-3.5 w-3.5" fill="currentColor" />
              Masuk
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-24">
        <section className="flex flex-col items-center pt-16 text-center md:pt-24">
          <Badge variant="soft" className="mb-6 gap-1.5 rounded-full px-3 py-1">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            Private couple space
          </Badge>
          <h1 className="max-w-3xl text-balance font-serif text-4xl leading-[1.05] tracking-tight md:text-6xl md:leading-[1.05]">
            Tempat privat kita berdua.
            <span className="block text-primary/90">
              <span className="inline-block animate-pulse">Bukan</span>{" "}
              <span className="inline-block">medsos. Bukan galeri.</span>
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-balance text-lg text-muted-foreground md:text-xl">
            Sebuah dunia kecil yang hanya milik kalian — untuk menyimpan kenangan, menulis surat,
            merencanakan mimpi, dan mengingat hal-hal yang terasa penting.
          </p>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
            <Button asChild size="xl" className="heart-glow px-8">
              <Link href="/login">
                <Heart className="h-4 w-4 heartbeat" fill="currentColor" />
                Masuk ke dunia kita
              </Link>
            </Button>
            <Button asChild size="xl" variant="ghost" className="px-8">
              <Link href="/join">
                <Sparkles className="h-4 w-4" />
                Punya kode undangan?
              </Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Undangan melalui tautan privat. Tanpa publik. Tanpa like. Tanpa algoritma.
          </p>
        </section>

        <section
          id="fitur"
          className="mt-28 rounded-3xl border border-border/60 bg-card/60 p-8 backdrop-blur md:p-12"
        >
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl tracking-tight md:text-4xl">
              Satu tempat untuk semuanya.
            </h2>
            <p className="mt-3 text-muted-foreground">
              Berhenti mencatat kenangan di chat yang hilang. Pindahkan ke tempat yang hangat,
              terstruktur, dan hanya kalian yang bisa membukanya.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-2xl border border-border/60 bg-background p-6 transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
                style={{
                  animationDelay: `${i * 80}ms`,
                  animation: "fade-in 0.6s ease-out both",
                }}
              >
                <span className="pointer-events-none absolute -right-4 -top-4 text-7xl text-primary/5 transition group-hover:text-primary/10">
                  ❤
                </span>
                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="relative mt-4 font-serif text-xl">{feature.title}</h3>
                <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section
          id="privasi"
          className="mt-24 grid items-center gap-12 md:grid-cols-2 md:gap-16"
        >
          <div>
            <Badge variant="default" className="gap-1.5">
              <Lock className="h-3 w-3" />
              Private by default
            </Badge>
            <h2 className="mt-4 font-serif text-3xl tracking-tight md:text-4xl">
              Privat sampai ke akarnya.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Data kalian disimpan dengan Row Level Security — teknologi database yang menjamin
              hanya kalian berdua yang dapat membaca satu byte pun dari kenangan kalian. Bahkan
              kami pun tidak bisa.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                "Bukan aplikasi publik — hanya dua akun, satu couple space.",
                "Foto, surat, dan cerita tersimpan terenkripsi di perjalanan.",
                "Tidak ada feed, tidak ada follow, tidak ada notifikasi yang mengganggu.",
              ].map((line, i) => (
                <li
                  key={line}
                  className="flex items-start gap-3"
                  style={{
                    animationDelay: `${i * 120}ms`,
                    animation: "fade-in 0.6s ease-out both",
                  }}
                >
                  <span className="heartbeat mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-accent/40 to-secondary/60 p-1">
            <div className="grid h-full w-full grid-cols-3 gap-2 rounded-[1.4rem] bg-card p-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className={`relative overflow-hidden rounded-xl ${i % 2 === 0 ? "bg-primary/15" : "bg-accent/40"} ${i === 4 ? "ring-2 ring-primary/40" : ""}`}
                  style={{
                    animation: i === 4 ? "breathe 3s ease-in-out infinite" : undefined,
                  }}
                >
                  {i === 4 && (
                    <Heart
                      className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-primary heartbeat"
                      fill="currentColor"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="cerita" className="mt-24 text-center">
          <p className="font-serif text-2xl italic text-muted-foreground md:text-3xl">
            &ldquo;Bukan soal fitur. Ini soal{" "}
            <span className="text-primary">
              tempat
              <span className="heartbeat inline-block text-primary"> ❤</span>
            </span>{" "}
            pulang.&rdquo;
          </p>
        </section>
      </main>

      <footer className="relative border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground md:flex-row">
          <p>
            &copy; {new Date().getFullYear()} Our Little World. Made with love for two.
          </p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="transition hover:text-foreground">
              Privasi
            </Link>
            <a
              href="mailto:hi@ourlittleworld.app"
              className="flex items-center gap-1.5 transition hover:text-foreground"
            >
              <Mail className="h-3.5 w-3.5" />
              Kontak
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}