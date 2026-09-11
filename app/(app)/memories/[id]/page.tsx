"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Heart,
  MapPin,
  MoreVertical,
  Star,
  Tag,
  Trash2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatDate, initials } from "@/lib/utils";
import { categoryIcon, categoryLabel, categoryAccent } from "@/lib/category-icons";
import { useAuth } from "@/lib/hooks/use-auth";
import type { Memory } from "@/lib/types";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function MemoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { profile } = useAuth();
  const [memory, setMemory] = useState<Memory | null>(null);
  const [loading, setLoading] = useState(true);
  const [openDelete, setOpenDelete] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    fetch(`/api/memories/${id}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setMemory(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  //Foto akan berganti setiap 3 detik jika ada lebih dari 1 foto
  useEffect(() => {
    if (!memory || memory.images.length <= 1) return;
    const timer = setInterval(() => {
      setActiveImage((prev) => (prev + 1) % memory.images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [memory, activeImage]);

  const toggleFavorite = async () => {
    if (!memory) return;
    const res = await fetch(`/api/memories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFavorite: !memory.isFavorite }),
    });
    const json = await res.json();
    if (json.success) {
      setMemory(json.data);
      toast.success(json.data.isFavorite ? "Ditandai favorit" : "Dihapus dari favorit");
    }
  };

  const handleDelete = async () => {
    const res = await fetch(`/api/memories/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) {
      toast.success("Memori dihapus");
      router.push("/memories");
    } else {
      toast.error(json.error);
    }
    setOpenDelete(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!memory) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-10 text-center">
        <p className="text-muted-foreground">Memori tidak ditemukan</p>
        <Button asChild className="mt-4" variant="outline">
          <Link href="/memories">Kembali</Link>
        </Button>
      </div>
    );
  }

  const Icon = categoryIcon[memory.category];
  const canEdit = memory.createdBy === profile?.id;

  return (
    <div className="mx-auto max-w-5xl px-5 py-6 lg:py-10 lg:pr-8">
      <div className="mb-6 flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link href="/memories">
            <ArrowLeft className="h-4 w-4" />
            Memories
          </Link>
        </Button>
        {canEdit && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  toggleFavorite();
                }}
              >
                <Star className="h-4 w-4" />
                {memory.isFavorite ? "Hapus dari favorit" : "Tandai favorit"}
              </DropdownMenuItem>
              <Dialog open={openDelete} onOpenChange={setOpenDelete}>
                <DialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      setOpenDelete(true);
                    }}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    Hapus
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Hapus memori ini?</DialogTitle>
                  </DialogHeader>
                  <p className="text-sm text-muted-foreground">
                    Tindakan ini tidak dapat dibatalkan. Memori akan dihapus dari dunia kalian
                    berdua.
                  </p>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setOpenDelete(false)}>
                      Batal
                    </Button>
                    <Button variant="destructive" onClick={handleDelete}>
                      Hapus
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-3">
          {memory.images.length > 0 && (
            <>
              <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={activeImage}
                  src={memory.images[activeImage]?.url}
                  alt={memory.caption ?? "Memory"}
                  className="animate-in fade-in slide-in-from-right-3 duration-700 fill-mode-both aspect-[4/5] w-full object-cover sm:aspect-[4/3]"
                />
              </div>
              {memory.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {memory.images.map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => setActiveImage(i)}
                      className={`h-2 shrink-0 rounded-full transition-all ${
                        i === activeImage ? "w-6 bg-primary" : "w-2 bg-border"
                      }`}
                      aria-label={`Image ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="space-y-5">
          <div className="space-y-3">
            <Badge variant="soft" className={`gap-1 ${categoryAccent[memory.category]}`}>
              <Icon className="h-3 w-3" />
              {categoryLabel[memory.category]}
            </Badge>
            <h1 className="font-serif text-3xl leading-tight tracking-tight md:text-4xl">
              {memory.caption ?? "Tanpa judul"}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" />
                {formatDate(memory.memoryDate, {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              {memory.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {memory.location}
                </span>
              )}
            </div>
          </div>

          <Separator />

          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={undefined} />
              <AvatarFallback>
                {initials(memory.createdBy === profile?.id ? profile.fullName : "Partner")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">
                {memory.createdBy === profile?.id ? "Kamu" : "Pasanganmu"}
              </p>
              <p className="text-xs text-muted-foreground">
                Ditambahkan {formatDate(memory.createdAt, { day: "numeric", month: "short" })}
              </p>
            </div>
          </div>

          {memory.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              {memory.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          <Card className="border-border/60 bg-secondary/30">
            <CardContent className="p-4">
              <p className="font-serif text-base italic leading-relaxed">
                &ldquo;{memory.caption}&rdquo;
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}