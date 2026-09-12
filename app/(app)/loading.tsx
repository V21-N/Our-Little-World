import { Loader2 } from "lucide-react";

export default function AppLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="relative">
        <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20 blur-sm"></div>
        <Loader2 className="relative h-6 w-6 animate-spin text-primary" />
      </div>
    </div>
  );
}