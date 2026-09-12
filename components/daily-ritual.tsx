"use client";

import { useState } from "react";
import { Loader2, Sparkles, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCoupleActivity } from "@/lib/hooks/use-couple-activities";

export function DailyRitual() {
  const { ritual, submitRitual } = useCoupleActivity();
  const [answer, setAnswer] = useState("");
  const [saving, setSaving] = useState(false);

  if (!ritual) return null;

  const done = Boolean(ritual.myAnswer);

  const submit = async () => {
    setSaving(true);
    await submitRitual(answer);
    setAnswer("");
    setSaving(false);
  };

  return (
    <Card className="mb-8 border-primary/15 bg-gradient-to-br from-primary/8 via-card to-secondary/30">
      <CardContent className="space-y-4 pt-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary/80">
            Ritual Hari Ini
          </p>
        </div>
        <p className="font-serif text-lg">{ritual.prompt.text}</p>

        {done && ritual.partnerAnswer && (
          <div className="rounded-xl bg-secondary/40 p-3 text-sm">
            <p className="font-medium text-muted-foreground">Jawaban pasanganmu:</p>
            <p className="mt-1 whitespace-pre-line">{ritual.partnerAnswer}</p>
          </div>
        )}
        {done && !ritual.partnerAnswer && (
          <p className="text-sm text-muted-foreground">
            Terjawab ✓ · menunggu jawaban pasanganmu.
          </p>
        )}

        {!done && (
          <div className="space-y-2">
            <Textarea
              rows={3}
              placeholder="Jawab bareng pasanganmu di sini..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value.slice(0, 500))}
            />
            <Button onClick={submit} disabled={saving || !answer.trim()} className="w-full sm:w-auto">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {saving ? "Menyimpan..." : "Kirim jawaban"}
            </Button>
          </div>
        )}

        {ritual.allDone && (
          <p className="text-xs text-muted-foreground">
            Kalian berdua sudah menjawab hari ini 💕
          </p>
        )}
      </CardContent>
    </Card>
  );
}