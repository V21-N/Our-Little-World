import * as React from "react";
import { cn } from "@/lib/utils";

const CardGridSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="aspect-square rounded-2xl bg-muted/60 shimmer"
        aria-hidden
      />
    ))}
  </div>
);

const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("shimmer rounded-md bg-muted", className)} {...props} />
);

export { Skeleton, CardGridSkeleton };