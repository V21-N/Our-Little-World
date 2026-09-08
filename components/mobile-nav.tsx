"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { mobileNav, secondaryNav } from "@/lib/nav";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function MobileNav() {
  const pathname = usePathname();
  const secondaryActive = secondaryNav.some(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/"),
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg lg:hidden">
      <ul className="flex items-stretch justify-around">
        {mobileNav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                {active && (
                  <span className="absolute -top-px left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-primary">
                    <span className="absolute inset-0 rounded-full bg-primary breathe" />
                  </span>
                )}
                <item.icon
                  className={cn(
                    "h-5 w-5 transition-transform",
                    active && "scale-110 heartbeat",
                  )}
                />
                {item.title}
              </Link>
            </li>
          );
        })}
        <li className="flex-1">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "relative flex h-auto w-full flex-col items-center gap-1 rounded-none py-3 text-[10px] font-medium transition-colors",
                  secondaryActive ? "text-primary" : "text-muted-foreground",
                )}
              >
                {secondaryActive && (
                  <span className="absolute -top-px left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-primary">
                    <span className="absolute inset-0 rounded-full bg-primary breathe" />
                  </span>
                )}
                <MoreHorizontal
                  className={cn("h-5 w-5", secondaryActive && "scale-110 heartbeat")}
                />
                More
              </Button>
            </DialogTrigger>
            <DialogContent className="bottom-0 top-auto translate-y-0 rounded-t-3xl rounded-b-none pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
              <DialogHeader>
                <DialogTitle>Menu lainnya</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-2">
                {secondaryNav.map((item) => {
                  const active =
                    pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <DialogClose key={item.href} asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-xl border border-border/60 px-4 py-3 text-sm transition-colors",
                          active
                            ? "border-primary/30 bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground",
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.title}
                      </Link>
                    </DialogClose>
                  );
                })}
              </div>
            </DialogContent>
          </Dialog>
        </li>
      </ul>
    </nav>
  );
}