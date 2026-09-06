import Link from "next/link";
import { Heart } from "lucide-react";
import { FloatingHearts } from "@/components/floating-hearts";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-primary/20 via-accent/40 to-secondary p-12 lg:flex">
        <FloatingHearts count={10} />

        <Link href="/" className="relative flex items-center gap-2 font-serif text-lg font-semibold">
          <span className="heartbeat flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary">
            <Heart className="h-4 w-4" fill="currentColor" />
          </span>
          Our Little World
        </Link>

        <div className="relative space-y-6">
          <p className="font-serif text-3xl leading-tight italic text-foreground/90 md:text-4xl">
            &ldquo;Tempat pulang yang paling tenang adalah sisi{" "}
            <span className="text-primary">kamu</span>.&rdquo;
          </p>
          <p className="text-sm text-muted-foreground">
            Satu couple, satu dunia kecil. Tanpa distraksi, tanpa orang lain.
          </p>
        </div>

        <p className="relative text-xs text-muted-foreground/80">
          &copy; {new Date().getFullYear()} Our Little World
        </p>

        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-primary/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 top-20 h-72 w-72 rounded-full bg-secondary/40 blur-3xl"
          style={{ animation: "breathe 8s ease-in-out infinite" }}
        />
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <div className="relative w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}