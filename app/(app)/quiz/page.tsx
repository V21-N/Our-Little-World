"use client";

import { useState, useEffect } from "react";
import {
  HelpCircle,
  Loader2,
  Plus,
  Quote,
  Sparkles,
  Trophy,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup } from "@/components/ui/radio-group";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import type { QuizQuestion, QuizSession } from "@/lib/types";

interface PlayQuestion {
  id: string;
  questionText: string;
  options: string[];
}

interface HistoryAnswer {
  id: string;
  questionId: string;
  selectedOptionIndex: number;
  isCorrect: boolean;
  answeredAt: string;
  question: { questionText: string; options: string[] } | null;
}

interface HistorySession extends Omit<QuizSession, "answers"> {
  player?: { id: string; fullName: string; nickname: string | null };
  answers?: HistoryAnswer[];
}

export default function QuizPage() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [sessions, setSessions] = useState<HistorySession[]>([]);
  const [detailSession, setDetailSession] = useState<HistorySession | null>(null);
  const [loading, setLoading] = useState(true);
  const [openAdd, setOpenAdd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [addForm, setAddForm] = useState({
    questionText: "",
    options: ["", "", "", ""],
    correctOptionIndex: 0,
  });

  // Play state
  const [playQuestions, setPlayQuestions] = useState<PlayQuestion[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [results, setResults] = useState<{ question: string; options: string[]; correct: number; chosen: number }[]>([]);
  const [playDone, setPlayDone] = useState(false);

  const reload = () => {
    Promise.all([
      fetch("/api/quiz/questions").then((r) => r.json()),
      fetch("/api/quiz/sessions").then((r) => r.json()),
    ]).then(([qres, sres]) => {
      if (qres.success) setQuestions(qres.data);
      if (sres.success) setSessions(sres.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    reload();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const options = addForm.options.filter((o) => o.trim() !== "");
    if (options.length < 2) {
      toast.error("Minimal 2 pilihan jawaban");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/quiz/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questionText: addForm.questionText,
        options,
        correctOptionIndex: Math.min(addForm.correctOptionIndex, options.length - 1),
      }),
    });
    const json = await res.json();
    setSubmitting(false);
    if (json.success) {
      toast.success("Soal ditambahkan");
      setOpenAdd(false);
      setAddForm({ questionText: "", options: ["", "", "", ""], correctOptionIndex: 0 });
      reload();
    } else {
      toast.error(json.error);
    }
  };

  const startPlay = async () => {
    const res = await fetch("/api/quiz/sessions", { method: "POST" });
    const json = await res.json();
    if (!json.success) {
      toast.error(json.error);
      return;
    }
    setSessionId(json.data.session.id);
    setPlayQuestions(json.data.questions);
    setCurrent(0);
    setSelected(null);
    setCorrectCount(0);
    setResults([]);
    setPlayDone(false);
  };

  const submitAnswer = async (questionId: string, selectedOptionIndex: number) => {
    if (!sessionId) return;
    const res = await fetch(`/api/quiz/sessions/${sessionId}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId, selectedOptionIndex }),
    });
    const json = await res.json();
    if (!json.success) {
      toast.error(json.error);
      return null;
    }
    return json.data;
  };

  const answer = async (index: number) => {
    if (selected !== null) return;
    setSelected(index);
    const q = playQuestions[current];
    const result = await submitAnswer(q.id, index);
    const isCorrect = result?.isCorrect ?? false;
    const correctIdx = result?.correctOptionIndex ?? index;
    const newResults = [...results, { question: q.questionText, options: q.options, correct: correctIdx, chosen: index }];
    setResults(newResults);
    if (isCorrect) setCorrectCount((c) => c + 1);

    setTimeout(async () => {
      if (current + 1 >= playQuestions.length) {
        const finish = await fetch(`/api/quiz/sessions/${sessionId}/finish`, { method: "POST" });
        const fj = await finish.json();
        if (!fj.success) toast.error(fj.error);
        setPlayDone(true);
        reload();
      } else {
        setCurrent((c) => c + 1);
        setSelected(null);
      }
    }, 700);
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-6 lg:py-10 lg:pr-8">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Couple Quiz
          </p>
          <h1 className="mt-1 font-serif text-3xl tracking-tight md:text-4xl">
            Seberapa kenal kamu?
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {questions.length} soal · {sessions.length} sesi selesai
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setOpenAdd(true)}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Soal Baru</span>
          </Button>
          <Button onClick={startPlay} disabled={questions.length === 0}>
            <Sparkles className="h-4 w-4" />
            Mainkan
          </Button>
        </div>
      </header>

      {/* Play flow */}
      {sessionId && !playDone && playQuestions.length > 0 && (
        <Card className="mb-8 border-primary/30 bg-gradient-to-br from-primary/10 via-card to-secondary/30">
          <CardContent className="space-y-5 pt-6">
            <div className="flex items-center justify-between">
              <Badge variant="soft" className="gap-1">
                <HelpCircle className="h-3 w-3" />
                Soal {current + 1} dari {playQuestions.length}
              </Badge>
              <Badge variant="outline">{correctCount} benar</Badge>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${((current + (selected !== null ? 1 : 0)) / playQuestions.length) * 100}%` }}
              />
            </div>
            <p className="font-serif text-xl leading-snug">{playQuestions[current].questionText}</p>
            <RadioGroup value={selected !== null ? String(selected) : undefined}>
              <div className="grid gap-2">
                {playQuestions[current].options.map((opt, i) => {
                  const isCorrectReveal = selected !== null && i === results[current]?.correct;
                  const isWrongReveal = selected !== null && i === selected && i !== results[current]?.correct;
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={selected !== null}
                      onClick={() => answer(i)}
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${
                        isCorrectReveal
                          ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                          : isWrongReveal
                            ? "border-rose-400 bg-rose-50 text-rose-700"
                            : selected === i
                              ? "border-primary bg-primary/10"
                              : "border-border/60 hover:border-primary/40"
                      }`}
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-[10px]">
                        {String.fromCharCode(65 + i)}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {sessionId && playDone && (
        <Card className="mb-8 border-border/60">
          <CardContent className="space-y-4 pt-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-rose-100 text-primary">
              <Trophy className="h-7 w-7" />
            </div>
            <div>
              <p className="font-serif text-3xl">
                Kamu menjawab benar {correctCount} dari {playQuestions.length} soal!
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Skor {Math.round((correctCount / playQuestions.length) * 100)}%
              </p>
            </div>
            <div className="grid gap-2 text-left">
              {results.map((r, i) => (
                <div key={i} className="rounded-xl border border-border/60 p-3 text-sm">
                  <p className="font-medium">{r.question}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Jawabanmu: {r.options[r.chosen]}{" "}
                    {r.chosen === r.correct ? "✅" : `seharusnya: ${r.options[r.correct]} ❌`}
                  </p>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSessionId(null);
                setPlayDone(false);
              }}
            >
              Tutup
            </Button>
          </CardContent>
        </Card>
      )}

      {questions.length === 0 ? (
        <EmptyState
          icon={<Quote className="h-6 w-6" />}
          title="Belum ada soal"
          description="Buat soal yang menantang pasanganmu!"
          action={
            <Button onClick={() => setOpenAdd(true)}>
              <Plus className="h-4 w-4" />
              Buat Soal Pertama
            </Button>
          }
        />
      ) : (
        <>
          <section className="mb-8">
            <h2 className="mb-3 font-serif text-xl">Bank Soal</h2>
            <ul className="space-y-2">
              {questions.map((q, i) => (
                <li key={q.id}>
                  <Card className="border-border/60">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                          {i + 1}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium leading-snug">
                            {q.questionText}
                          </p>
                          <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
                            {q.options.map((opt, optI) => (
                              <li
                                key={opt}
                                className="flex items-center gap-2 rounded-lg border border-border/60 bg-card px-3 py-2 text-sm text-foreground/70"
                              >
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px]">
                                  {String.fromCharCode(65 + optI)}
                                </span>
                                <span>{opt}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="mb-3 font-serif text-xl">Histori Sesi</h2>
            <ul className="space-y-2">
              {sessions.map((session) => {
                const total = session.answers?.length ?? 0;
                const correct = session.score ?? 0;
                const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
                return (
                  <li key={session.id}>
                    <Card className="border-border/60">
                      <CardContent className="flex items-center gap-4 p-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-rose-100 text-primary">
                          <Trophy className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">
                            {session.status === "completed"
                              ? `${correct}/${total} benar`
                              : session.status}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {session.player?.nickname || session.player?.fullName || "Pemain"} · {session.status === "completed" ? "Selesai" : "Sedang berlangsung"} ·{" "}
                            {formatDate(session.startedAt, {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })} · {pct}%
                          </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setDetailSession(session)}>
                          Detail
                        </Button>
                      </CardContent>
                    </Card>
                  </li>
                );
              })}
            </ul>
          </section>
        </>
      )}

      <Dialog open={Boolean(detailSession)} onOpenChange={(open) => !open && setDetailSession(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail sesi kuis</DialogTitle>
          </DialogHeader>
          {detailSession && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Pemain</p>
                  <p className="mt-1 font-medium">
                    {detailSession.player?.nickname || detailSession.player?.fullName || "Pemain"}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Skor</p>
                  <p className="mt-1 font-medium">
                    {detailSession.score ?? 0}/{detailSession.answers?.length ?? 0}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Dimulai</p>
                  <p className="mt-1 font-medium">{formatDate(detailSession.startedAt, { dateStyle: "medium", timeStyle: "short" })}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Selesai</p>
                  <p className="mt-1 font-medium">
                    {detailSession.completedAt
                      ? formatDate(detailSession.completedAt, { dateStyle: "medium", timeStyle: "short" })
                      : "Belum selesai"}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {detailSession.answers?.map((answer, index) => (
                  <div key={answer.id} className="rounded-xl border border-border/60 p-3 text-sm">
                    <p className="font-medium">{index + 1}. {answer.question?.questionText ?? "Pertanyaan"}</p>
                    <p className={answer.isCorrect ? "mt-1 text-emerald-700" : "mt-1 text-rose-700"}>
                      Jawaban: {answer.question?.options[answer.selectedOptionIndex] ?? "Tidak tersedia"} {answer.isCorrect ? "✓ Benar" : "✕ Salah"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Dijawab {formatDate(answer.answeredAt, { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Question Dialog */}
      <Dialog open={openAdd} onOpenChange={setOpenAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buat soal baru</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleAdd}>
            <div className="space-y-2">
              <Label>Pertanyaan</Label>
              <Textarea
                required
                placeholder="Apa makanan favoritku yang..."
                rows={2}
                value={addForm.questionText}
                onChange={(e) => setAddForm({ ...addForm, questionText: e.target.value })}
              />
            </div>
            <div className="space-y-3">
              <Label>Pilihan Jawaban (pilih yang benar)</Label>
              {addForm.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correctOpt"
                    className="h-4 w-4 shrink-0"
                    checked={addForm.correctOptionIndex === i}
                    onChange={() => setAddForm({ ...addForm, correctOptionIndex: i })}
                  />
                  <Input
                    placeholder={`Pilihan ${i + 1}`}
                    className="flex-1"
                    value={opt}
                    onChange={(e) => {
                      const options = [...addForm.options];
                      options[i] = e.target.value;
                      setAddForm({ ...addForm, options });
                    }}
                  />
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenAdd(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Simpan soal
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}