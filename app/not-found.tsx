import Link from "next/link";
import { Home, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#FDFBF7] px-6 text-[#2B1B22] selection:bg-[#D4A5A5]/30 selection:text-[#6B2D39]">
      {/* Ambient Decorative Blur */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden"
      >
        <div className="h-[28rem] w-[28rem] rounded-full bg-gradient-to-tr from-[#6B2D39]/15 via-[#D4A5A5]/20 to-[#F8F4EE] blur-3xl" />
      </div>

      <div className="mx-auto max-w-md text-center">
        {/* Yugma Icon with Ambient Ring */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-[#EFE6DD] bg-[#F8F4EE]/80 p-3 shadow-xl backdrop-blur-md">
          <img
            src="/Yugma-Icon.svg"
            alt="Yugma Logo"
            className="heartbeat h-full w-full object-contain mix-blend-multiply"
          />
        </div>

        {/* 404 Badge */}
        <div className="inline-flex items-center gap-1.5 rounded-full border border-[#D4A5A5]/40 bg-[#6B2D39]/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-[#6B2D39]">
          <Sparkles className="h-3 w-3 text-[#6B2D39]" />
          <span>Error 404</span>
        </div>

        {/* Heading & Text */}
        <h1 className="mt-4 font-serif text-3xl font-bold tracking-tight text-[#2B1B22] sm:text-4xl">
          Ruang tidak ditemukan
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[#2B1B22]/70">
          Mungkin langkahmu tersesat. Halaman ini telah berpindah, atau memang tidak pernah ada di dunia kita.
        </p>

        {/* Home Action Button */}
        <div className="mt-8 flex justify-center">
          <Button
            asChild
            size="lg"
            className="h-11 rounded-full bg-[#6B2D39] px-7 text-[#FDFBF7] shadow-lg shadow-[#6B2D39]/15 transition-all hover:bg-[#54232C] hover:scale-[1.02]"
          >
            <Link href="/" className="flex items-center gap-2 font-medium">
              <Home className="h-4 w-4" />
              Kembali ke Beranda
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}