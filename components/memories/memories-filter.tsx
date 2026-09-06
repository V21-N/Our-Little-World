"use client";

import { useState } from "react";
import { Search, Filter, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CATEGORIES } from "@/lib/constants";
import { categoryLabel } from "@/lib/category-icons";

interface Props {
  query: string;
  onQueryChange: (q: string) => void;
  activeCategory: string | null;
  onCategoryChange: (c: string | null) => void;
  showFavoritesOnly: boolean;
  onToggleFavorites: () => void;
  resultCount?: number;
}

export function MemoriesFilterBar({
  query,
  onQueryChange,
  activeCategory,
  onCategoryChange,
  showFavoritesOnly,
  onToggleFavorites,
  resultCount,
}: Props) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari di caption atau tag..."
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="pl-9"
          />
          {query && (
            <button
              onClick={() => onQueryChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button
          variant={showFavoritesOnly ? "default" : "outline"}
          size="icon"
          onClick={onToggleFavorites}
          aria-label="Toggle favorites"
        >
          <Star className={cn("h-4 w-4", showFavoritesOnly && "fill-current")} />
        </Button>
        <Button
          variant={showFilters ? "default" : "outline"}
          size="icon"
          onClick={() => setShowFilters((v) => !v)}
          className="lg:hidden"
          aria-label="Toggle filters"
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <div
        className={cn(
          "flex flex-wrap gap-2",
          !showFilters && "hidden lg:flex",
        )}
      >
        <Badge
          variant={activeCategory === null ? "default" : "soft"}
          className="cursor-pointer px-3 py-1.5 text-xs"
          onClick={() => onCategoryChange(null)}
        >
          Semua
          {resultCount !== undefined && (
            <span className="ml-1.5 opacity-70">({resultCount})</span>
          )}
        </Badge>
        {CATEGORIES.memory.map((cat) => (
          <Badge
            key={cat.value}
            variant={activeCategory === cat.value ? "default" : "soft"}
            className="cursor-pointer px-3 py-1.5 text-xs"
            onClick={() => onCategoryChange(cat.value)}
          >
            {categoryLabel[cat.value as keyof typeof categoryLabel] ?? cat.label}
          </Badge>
        ))}
      </div>
    </div>
  );
}