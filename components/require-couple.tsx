"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/hooks/use-auth";

export function RequireCouple({ children }: { children: React.ReactNode }) {
  const { user, couple, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isOnboarding = pathname.startsWith("/onboarding");

  useEffect(() => {
    if (loading) return;
    if (!user) {
      const next = pathname && pathname !== "/" ? `?next=${encodeURIComponent(pathname)}` : "";
      router.replace(`/login${next}`);
      return;
    }
    if (!couple && !isOnboarding) {
      router.replace("/onboarding/create-couple");
      return;
    }
    if (couple && isOnboarding) {
      router.replace("/dashboard");
    }
  }, [loading, user, couple, router, pathname, isOnboarding]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!couple && !isOnboarding) return null;
  if (couple && isOnboarding) return null;

  return <>{children}</>;
}

export function RequireUser({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      const next = pathname && pathname !== "/" ? `?next=${encodeURIComponent(pathname)}` : "";
      router.replace(`/login${next}`);
    }
  }, [loading, user, router, pathname]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}