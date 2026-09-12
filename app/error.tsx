"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center">
      <h2 className="font-serif text-2xl font-bold tracking-tight">Ups, ada kendala.</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Maaf, terjadi kesalahan tak terduga. Kami sedang memperbaikinya.
      </p>
      <div className="mt-6 flex gap-3">
        <Button variant="outline" onClick={() => (window.location.href = "/dashboard")}>
          Kembali ke Dashboard
        </Button>
        <Button onClick={() => reset()}>Coba lagi</Button>
      </div>
    </div>
  );
}