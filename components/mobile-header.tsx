"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, Loader2, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { initials } from "@/lib/utils";
import { useAuth } from "@/lib/hooks/use-auth";
import { useNotifications } from "@/lib/hooks/use-notifications";
import { TapButton, ChatButton } from "@/components/couple-activities";
import { allNav } from "@/lib/nav";
import type { Achievement, LoveLetter, Memory } from "@/lib/types";

interface SearchResults {
  memories: Memory[];
  letters: LoveLetter[];
}

export function MobileHeader() {
  const pathname = usePathname();
  const { profile, user } = useAuth();
  const { summary, markSeen } = useNotifications();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>({ memories: [], letters: [] });
  const [unreadLetters, setUnreadLetters] = useState<LoveLetter[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const displayName = profile?.fullName || user?.name || "User";
  const avatarUrl = profile?.avatarUrl || undefined;

  const matched = allNav.find(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/"),
  );
  const title = matched?.title ?? "Yugma";

  useEffect(() => {
    if (!searchOpen) return;
    const trimmed = query.trim();
    if (!trimmed) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      const [memoriesResponse, lettersResponse] = await Promise.all([
        fetch(`/api/memories?search=${encodeURIComponent(trimmed)}&limit=5`, {
          signal: controller.signal,
        }),
        fetch("/api/letters", { signal: controller.signal }),
      ]);
      const memoriesJson = await memoriesResponse.json();
      const lettersJson = await lettersResponse.json();
      setResults({
        memories: memoriesJson.success ? memoriesJson.data.items : [],
        letters: lettersJson.success
          ? lettersJson.data
              .filter((letter: LoveLetter) =>
                `${letter.title} ${letter.content ?? ""}`
                  .toLowerCase()
                  .includes(trimmed.toLowerCase()),
              )
              .slice(0, 5)
          : [],
      });
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, searchOpen]);

  const loadNotifications = async () => {
    setNotificationsLoading(true);
    const [lettersResponse, achievementsResponse] = await Promise.all([
      fetch("/api/letters?filter=unread"),
      fetch("/api/achievements"),
    ]);
    const lettersJson = await lettersResponse.json();
    const achievementsJson = await achievementsResponse.json();
    setUnreadLetters(lettersJson.success ? lettersJson.data.slice(0, 5) : []);
    setUnlockedAchievements(
      achievementsJson.success ? achievementsJson.data.unlocked.slice(0, 5) : [],
    );
    setNotificationsLoading(false);
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/60 bg-background/85 px-5 py-3 backdrop-blur lg:hidden">
      <Link href="/dashboard" className="flex items-center gap-2">
        <span className="heartbeat flex h-7 w-7 overflow-hidden rounded-full bg-primary/15">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Yugma-Icon.svg" alt="Yugma" className="h-full w-full object-cover" />
        </span>
        <span className="font-serif text-base font-semibold">{title}</span>
      </Link>
      <div className="flex items-center gap-2">
        <TapButton />
        <ChatButton />
        <Popover open={searchOpen} onOpenChange={setSearchOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Search">
              <Search className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[min(22rem,calc(100vw-2rem))]">
            <Input
              autoFocus
              placeholder="Cari kenangan atau surat..."
              value={query}
              onChange={(event) => {
                const value = event.target.value;
                setQuery(value);
                if (!value.trim()) setResults({ memories: [], letters: [] });
              }}
            />
            {query.trim() && (
              <div className="mt-3 max-h-64 space-y-3 overflow-y-auto">
                {results.memories.map((memory) => (
                  <Link
                    key={memory.id}
                    href={`/memories/${memory.id}`}
                    onClick={() => setSearchOpen(false)}
                    className="block rounded-lg p-2 hover:bg-accent"
                  >
                    <p className="text-sm font-medium">{memory.caption || "Memory"}</p>
                    <p className="text-xs text-muted-foreground">Memories</p>
                  </Link>
                ))}
                {results.letters.map((letter) => (
                  <Link
                    key={letter.id}
                    href={`/letters/${letter.id}`}
                    onClick={() => setSearchOpen(false)}
                    className="block rounded-lg p-2 hover:bg-accent"
                  >
                    <p className="text-sm font-medium">{letter.title}</p>
                    <p className="text-xs text-muted-foreground">Letters</p>
                  </Link>
                ))}
                {results.memories.length === 0 && results.letters.length === 0 && (
                  <p className="p-2 text-sm text-muted-foreground">Tidak ada hasil.</p>
                )}
              </div>
            )}
          </PopoverContent>
        </Popover>
        <Popover
          open={notificationsOpen}
          onOpenChange={(open) => {
            setNotificationsOpen(open);
            if (open) {
              void loadNotifications();
              markSeen();
            }
          }}
        >
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="relative" aria-label="Notifications">
              <Bell className="h-4 w-4" />
              {summary.total > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-semibold text-primary-foreground">
                  {summary.total > 99 ? "99+" : summary.total}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[min(22rem,calc(100vw-2rem))]">
            <h2 className="font-serif text-lg">Notifikasi</h2>
            {notificationsLoading ? (
              <Loader2 className="mx-auto mt-4 h-5 w-5 animate-spin text-primary" />
            ) : unreadLetters.length === 0 && unlockedAchievements.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">Belum ada notifikasi baru.</p>
            ) : (
              <div className="mt-3 space-y-2">
                {unreadLetters.map((letter) => (
                  <Link
                    key={letter.id}
                    href={`/letters/${letter.id}`}
                    onClick={() => setNotificationsOpen(false)}
                    className="block rounded-lg p-2 hover:bg-accent"
                  >
                    <p className="text-sm font-medium">Surat baru: {letter.title}</p>
                    <p className="text-xs text-muted-foreground">Buka surat dari pasanganmu</p>
                  </Link>
                ))}
                {unlockedAchievements.map((achievement) => (
                  <Link
                    key={achievement.id}
                    href="/achievements"
                    onClick={() => setNotificationsOpen(false)}
                    className="block rounded-lg p-2 hover:bg-accent"
                  >
                    <p className="text-sm font-medium">{achievement.icon} {achievement.title}</p>
                    <p className="text-xs text-muted-foreground">Lencana terbuka</p>
                  </Link>
                ))}
              </div>
            )}
          </PopoverContent>
        </Popover>
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