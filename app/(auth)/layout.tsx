import Link from "next/link";
import { FloatingHearts } from "@/components/floating-hearts";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2 bg-[#FDFBF7] text-[#2B1B22]">
      {/* Sisi Kiri (Hero Panel) */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#D4A5A5]/25 via-[#F8F4EE] to-[#EFE6DD] p-12 lg:flex">
        <FloatingHearts count={10} />

        {/* Brand Logo Header (Disamakan ukurannya dengan Landing Page) */}
        <Link href="/" className="relative flex items-center gap-3 transition hover:opacity-90">
          <img
            src="/Yugma-Icon.svg"
            alt="Yugma Logo"
            className="heartbeat h-8 w-8 shrink-0 object-contain mix-blend-multiply"
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
        </Link>

        {/* Quote Section */}
        <div className="relative space-y-4">
          <p className="font-serif text-3xl font-medium italic leading-snug text-[#2B1B22] md:text-4xl">
            &ldquo;Tempat pulang yang paling tenang adalah sisi{" "}
            <span className="text-[#6B2D39] font-semibold">kamu</span>.&rdquo;
          </p>
          <p className="text-sm text-[#2B1B22]/70">
            Satu couple, satu dunia kecil. Tanpa distraksi, tanpa orang lain.
          </p>
        </div>

        {/* Footer Copyright */}
        <p className="relative text-xs text-[#2B1B22]/50">
          &copy; {new Date().getFullYear()} Yugma. A private space for two
        </p>

        {/* Ambient Decorative Blurs */}
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-[#6B2D39]/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 top-20 h-72 w-72 rounded-full bg-[#D4A5A5]/30 blur-3xl"
          style={{ animation: "breathe 8s ease-in-out infinite" }}
        />
      </div>

      {/* Sisi Kanan (Form Content) */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="relative w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}