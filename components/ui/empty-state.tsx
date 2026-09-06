import * as React from "react";
import { cn } from "@/lib/utils";

const EmptyState = ({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/60 bg-card/40 p-10 text-center",
      className,
    )}
  >
    {icon && (
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
    )}
    <div className="space-y-1">
      <h3 className="font-serif text-xl tracking-tight">{title}</h3>
      {description && (
        <p className="mx-auto max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
    </div>
    {action && <div className="mt-2">{action}</div>}
  </div>
);

export { EmptyState };