"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { initials } from "@/lib/utils";
import { useAuth } from "@/lib/hooks/use-auth";
import { primaryNav, secondaryNav } from "@/lib/nav";
import { usePathname } from "next/navigation";

export function AppSidebar() {
  const pathname = usePathname();
  const { profile, user } = useAuth();
  const displayName = profile?.fullName || user?.name || "User";
  const avatarUrl = profile?.avatarUrl || undefined;

  return (
    <aside className="relative hidden h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/8 to-transparent"
      />
      <div className="relative flex items-center gap-2 px-6 py-6 font-serif text-lg font-semibold">
        <span className="heartbeat flex h-8 w-8 overflow-hidden rounded-full bg-sidebar-primary/15">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.webp" alt="Our Little World" className="h-full w-full object-cover" />
        </span>
        Our Little World
      </div>

      <nav className="relative flex-1 overflow-y-auto px-3">
        <ul className="space-y-0.5">
          {primaryNav.map((item, i) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <li
                key={item.href}
                style={{
                  animation: `fade-in 0.4s ease-out ${i * 60}ms both`,
                }}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                    active
                      ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4 transition-transform group-hover:scale-110",
                      active ? "text-sidebar-primary heartbeat" : "text-muted-foreground",
                    )}
                  />
                  {item.title}
                  {active && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary heartbeat" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <Separator className="my-4 bg-sidebar-border" />

        <p className="px-3 pb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Lainnya
        </p>
        <ul className="space-y-0.5">
          {secondaryNav.map((item, i) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <li
                key={item.href}
                style={{
                  animation: `fade-in 0.4s ease-out ${(i + 5) * 60}ms both`,
                }}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4 transition-transform group-hover:scale-110",
                      active ? "text-sidebar-primary heartbeat" : "text-muted-foreground",
                    )}
                  />
                  {item.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="relative border-t border-sidebar-border p-4">
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-sidebar-accent"
        >
          <Avatar className="h-9 w-9 ring-2 ring-primary/20">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback>{initials(displayName)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{displayName}</p>
            <p className="truncate text-xs text-muted-foreground">
              dengan sayang
            </p>
          </div>
          <Heart
            className="h-3.5 w-3.5 text-primary heartbeat"
            fill="currentColor"
          />
        </Link>
      </div>
    </aside>
  );
}