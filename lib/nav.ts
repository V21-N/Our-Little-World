import {
  BookHeart,
  CalendarDays,
  Heart,
  Home,
  ListChecks,
  MessageCircleHeart,
  MoreHorizontal,
  Music,
  Quote,
  Sparkles,
  Trophy,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

export const primaryNav: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: Home, description: "Ringkasan dunia kita" },
  { title: "Memories", href: "/memories", icon: BookHeart, description: "Foto & kenangan" },
  { title: "Our Story", href: "/story", icon: CalendarDays, description: "Timeline perjalanan" },
  { title: "Letters", href: "/letters", icon: MessageCircleHeart, description: "Surat & Open When" },
];

export const secondaryNav: NavItem[] = [
  { title: "Bucket List", href: "/bucket-list", icon: ListChecks },
  { title: "Playlist", href: "/playlist", icon: Music },
  { title: "Quiz", href: "/quiz", icon: Quote },
  { title: "Mood", href: "/mood", icon: Heart },
  { title: "Future Us", href: "/future", icon: Sparkles },
  { title: "Achievements", href: "/achievements", icon: Trophy },
  { title: "More", href: "/settings", icon: MoreHorizontal },
];

export const mobileNav = primaryNav;

export const allNav: NavItem[] = [...primaryNav, ...secondaryNav];