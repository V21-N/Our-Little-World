import { BookHeart, Heart, Plane, Sparkles, Utensils, CalendarDays } from "lucide-react";
import type { Category } from "./types";

export const categoryIcon: Record<Category, React.ComponentType<{ className?: string }>> = {
  date: Heart,
  trip: Plane,
  food: Utensils,
  random: Sparkles,
  celebration: Sparkles,
  special_moment: BookHeart,
};

export const categoryLabel: Record<Category, string> = {
  date: "Date",
  trip: "Trip",
  food: "Food",
  random: "Random",
  celebration: "Celebration",
  special_moment: "Special Moment",
};

export const categoryGradients: Record<Category, string> = {
  date: "from-rose-200/70 via-rose-100/40 to-amber-100/50",
  trip: "from-sky-200/70 via-blue-100/40 to-emerald-100/50",
  food: "from-amber-200/70 via-orange-100/40 to-rose-100/50",
  random: "from-violet-200/70 via-fuchsia-100/40 to-rose-100/50",
  celebration: "from-amber-200/70 via-yellow-100/40 to-rose-100/50",
  special_moment: "from-rose-300/70 via-pink-100/40 to-amber-100/50",
};

export const categoryAccent: Record<Category, string> = {
  date: "bg-rose-100 text-rose-700",
  trip: "bg-sky-100 text-sky-700",
  food: "bg-amber-100 text-amber-700",
  random: "bg-violet-100 text-violet-700",
  celebration: "bg-amber-100 text-amber-700",
  special_moment: "bg-rose-100 text-rose-700",
};

// Re-export CalendarDays icon for special moment
export { CalendarDays };