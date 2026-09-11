"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Lock,
  Loader2,
  Mail,
  MailOpen,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { LoveLetter } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { OPEN_WHEN_TAGS } from "@/lib/constants";
import { useAuth } from "@/lib/hooks/use-auth";
import { toast } from "sonner";

interface LetterDTO extends LoveLetter {
  isLocked?: boolean;
}

export default function LetterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { profile } = useAuth();
  const [letter, setLetter] = useState<LetterDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [opened, setOpened] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    fetch(`/api/letters/${id}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setLetter(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!letter) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-10 text-center">
        <p className="text-muted-foreground">Surat tidak ditemukan</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/letters">Kembali</Link>
        </Button>
      </div>
    );
  }

  const isLocked = letter.isLocked ?? (letter.unlockAt && new Date(letter.unlockAt) > new Date());
  const tag = letter.openWhenTag
    ? OPEN_WHEN_TAGS.find((t) => t.value === letter.openWhenTag)
    : null;
  const isSender = letter.senderId === profile?.id;

  const handleOpen = async () => {
    const res = await fetch(`/api/letters/${id}/read`, { method: "POST" });
    const json = await res.json();
    if (json.success) {
      setOpened(true);
      setLetter(json.data);
      toast.success("Surat dibuka. Semoga harimu lebih baik 💌");
    } else {
      toast.error(json.error);
    }
  };

  const handleDelete = async () => {
    const res = await fetch(`/api/letters/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) {
      toast.success("Surat dihapus");
      router.push("/letters");
    } else {
      toast.error(json.error);
    }
    setShowDelete(false);
  };

  return (
    <div className="mx-auto max-w-3xl px-5 py-6 lg:py-10 lg:pr-8">
      <div className="mb-6 flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link href="/letters">
            <ArrowLeft className="h-4 w-4" />
            Letters
          </Link>
        </Button>
        {isSender && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowDelete(true)}
            aria-label="Hapus surat"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        )}
      </div>

      <Card
        className={`overflow-hidden border-border/60 ${
          isLocked
            ? "bg-gradient-to-br from-muted/60 via-secondary/40 to-accent/30"
            : "bg-gradient-to-br from-primary/10 via-card to-secondary/30"
        }`}
      >
        <CardContent className="space-y-6 p-8 md:p-12">
          <div className="flex items-center gap-3 border-b border-border/40 pb-5">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Dari</p>
              <p className="font-serif text-lg">{isSender ? "Kamu" : "Pasanganmu"}</p>
            </div>
            {tag && (
              <Badge variant="soft" className="hidden gap-1 text-xs sm:inline-flex">
                <Sparkles className="h-3 w-3" />
                {tag.label}
              </Badge>
            )}
          </div>

          <h1 className="font-serif text-3xl leading-tight tracking-tight md:text-4xl">
            {letter.title}
          </h1>

          {isLocked ? (
            <div className="flex flex-col items-center gap-4 py-12 text-center">
              <div className="relative">
                <div className="absolute inset-0 -m-2 rounded-full bg-primary/20 blur-xl breathe" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-foreground/10 text-foreground/60">
                  <Lock className="h-10 w-10" />
                </div>
              </div>
              <div>
                <p className="font-serif text-xl italic text-foreground/80">
                  &ldquo;Surat ini belum siap untuk dibuka...&rdquo;
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Akan terbuka pada{" "}
                  {formatDate(letter.unlockAt!, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          ) : opened || isSender ? (
            <article className="animate-fade-in whitespace-pre-line font-serif text-lg leading-relaxed text-foreground/90">
              {letter.content}
            </article>
          ) : (
            <div className="flex flex-col items-center gap-5 py-8 text-center">
              <div className="relative">
                <span className="absolute -left-3 -top-3 text-2xl text-primary sparkle">
                  ✨
                </span>
                <span className="absolute -right-3 -bottom-3 text-2xl text-primary sparkle" style={{ animationDelay: "0.8s" }}>
                  ✨
                </span>
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 text-primary ring-pulse">
                  <Mail className="h-10 w-10" />
                </div>
              </div>
              <div>
                <p className="font-serif text-xl italic text-foreground/80">
                  &ldquo;Sini, duduk sebentar. Ada pesan untukmu.&rdquo;
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Dibuat {formatDate(letter.createdAt, { day: "numeric", month: "long" })}
                </p>
              </div>
              <Button size="lg" onClick={handleOpen} className="heart-glow">
                <MailOpen className="h-4 w-4" />
                Buka suratnya
              </Button>
            </div>
          )}

          {opened && (
            <div className="border-t border-border/40 pt-4 text-right text-xs text-muted-foreground">
              Dibuka pada{" "}
              {formatDate(new Date().toISOString(), {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus surat ini?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Surat yang sudah dihapus tidak dapat dipulihkan. Hati-hati, kadang kita ingin
            membaca ulang di kemudian hari.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDelete(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}