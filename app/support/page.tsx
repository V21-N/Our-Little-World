import Link from "next/link";
import { ArrowLeft, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Dukungan",
  description:
    "Dukung Yugma untuk terus menjadi ruang privat yang aman dan bebas iklan bagi setiap pasangan.",
};

export default function SupportPage() {
  return (
    <div className="relative isolate flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#FDFBF7] px-6 py-20 text-[#2B1B22] selection:bg-[#D4A5A5]/30 selection:text-[#6B2D39]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
      >
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#6B2D39]/20 via-[#D4A5A5]/20 to-[#F8F4EE] opacity-70 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
      </div>

      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#2B1B22]/70 transition hover:text-[#6B2D39]"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke beranda
      </Link>

      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#6B2D39]/10 text-[#6B2D39]">
        <Coffee className="h-7 w-7 heartbeat" />
      </div>

      <h1 className="mt-6 text-center font-serif text-4xl leading-[1.1] tracking-tight text-[#2B1B22] sm:text-5xl md:text-6xl">
        Traktir Yugma
        <span className="mt-3 block font-sans text-sm font-normal uppercase tracking-[0.2em] text-[#6B2D39]">
          Segera hadir
        </span>
      </h1>

      <p className="mt-5 max-w-xl text-center text-base text-[#2B1B22]/70">
        Halaman dukungan untuk traktir akan segera hadir. Terima kasih sudah mau
        mendukung perjalanan Yugma.
      </p>

      <Button
        asChild
        size="xl"
        className="mt-8 rounded-full bg-[#6B2D39] px-8 text-[#FDFBF7] shadow-lg shadow-[#6B2D39]/20 transition-all hover:bg-[#54232C] hover:scale-[1.02]"
      >
        <Link href="/" className="flex items-center gap-2 font-medium">
          Kembali ke beranda
        </Link>
      </Button>
    </div>
  );
}