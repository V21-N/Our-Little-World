import { Loader2 } from "lucide-react";

export function FullPageSkeleton() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="relative">
        <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20 blur-sm"></div>
        <Loader2 className="relative h-6 w-6 animate-spin text-primary" />
      </div>
    </div>
  );
}

export function CompactSkeleton() {
  return (
    <div className="h-6 w-32 animate-pulse rounded bg-muted" />
  );
}

export function SmallSkeleton() {
  return (
    <div className="h-3 w-24 animate-pulse rounded bg-muted" />
  );
}