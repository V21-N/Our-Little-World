"use client";

import Link from "next/link";
import { Heart, Search, Bell } from "lucide-react";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { initials } from "@/lib/utils";
import { useAuth } from "@/lib/hooks/use-auth";
import { allNav } from "@/lib/nav";

export function MobileHeader() {
  const pathname = usePathname();
  const { profile, user } = useAuth();
  const displayName = profile?.fullName || user?.name || "User";
  const avatarUrl = profile?.avatarUrl || undefined;

  const matched = allNav.find(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/"),
  );
  const title = matched?.title ?? "Our Little World";

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/60 bg-background/85 px-5 py-3 backdrop-blur lg:hidden">
      <Link href="/dashboard" className="flex items-center gap-2">
        <span className="heartbeat flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Heart className="h-3.5 w-3.5" fill="currentColor" />
        </span>
        <span className="font-serif text-base font-semibold">{title}</span>
      </Link>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-sm">
          <Search className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon-sm" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary heartbeat" />
        </Button>
        <Link href="/settings">
          <Avatar className="h-8 w-8 ring-2 ring-primary/20 transition hover:ring-primary/40">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback>{initials(displayName)}</AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  );
}