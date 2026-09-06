import Link from "next/link";
import { Heart, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-background px-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Heart className="h-8 w-8" fill="currentColor" />
        </div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          404
        </p>
        <h1 className="mt-1 font-serif text-4xl tracking-tight">Halaman tidak ditemukan</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Mungkin halaman ini sudah pindah, atau tidak pernah ada.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">
            <Home className="h-4 w-4" />
            Kembali beranda
          </Link>
        </Button>
      </div>
    </div>
  );
}