import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, CheckCircle2, ChevronRight, Filter, Search, ShieldAlert, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function PyqArchivePage() {
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const [revealedSolutions, setRevealedSolutions] = useState<Record<number, boolean>>({});
  
  const { data: pyqs, isLoading } = trpc.pyqArchive.list.useQuery({
    subject: selectedSubject === "all" ? undefined : selectedSubject,
    examYear: selectedYear,
  });

  const toggleSolution = (id: number) => {
    setRevealedSolutions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="mx-auto max-w-[1440px] space-y-7 animate-in fade-in duration-300">
      <section className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-accent/30 blur-3xl pointer-events-none" />
        <div className="relative">
          <p className="ink-kicker mb-3">Authentic question bank</p>
          <h1 className="display-serif text-3xl font-bold tracking-tight sm:text-5xl">Previous Year Question (PYQ) Archive</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">Master exam patterns with authentic JEE Main and Advanced questions paired with verified step-by-step solutions.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {["all", "Physics", "Chemistry", "Mathematics"].map((sub) => (
              <button key={sub} onClick={() => setSelectedSubject(sub)} className={`rounded-full px-5 py-2 text-sm font-bold capitalize transition-all ${selectedSubject === sub ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted/60 text-muted-foreground hover:bg-muted"}`}>
                {sub}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-bold text-muted-foreground">Filter by Year:</span>
        {[undefined, 2025, 2024, 2023].map((yr) => (
          <button key={String(yr)} onClick={() => setSelectedYear(yr)} className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${selectedYear === yr ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted"}`}>
            {yr ? yr : "All Years"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid gap-6">
          {[1, 2, 3].map((n) => (
            <Card key={n} className="rounded-[1.75rem] p-6 sm:p-8 border border-border/60 space-y-4 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="h-6 w-32 bg-muted rounded-full" />
                <div className="h-6 w-24 bg-muted rounded-full" />
              </div>
              <div className="h-7 w-3/4 bg-muted rounded-xl" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="h-12 bg-muted/70 rounded-xl" />
                <div className="h-12 bg-muted/70 rounded-xl" />
              </div>
            </Card>
          ))}
        </div>
      ) : !pyqs || pyqs.length === 0 ? (
        <Card className="rounded-[1.75rem] p-12 text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <BookOpen className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold">No PYQs found</h3>
          <p className="text-sm text-muted-foreground">Try selecting a different subject or year filter above.</p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {pyqs.map((q) => {
            const isRevealed = revealedSolutions[q.id];
            return (
              <Card key={q.id} className="elevated-card rounded-[1.75rem] p-6 sm:p-8 space-y-5 transition-all">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-3.5 py-1 text-xs font-black uppercase text-primary">{q.subject}</span>
                    <span className="rounded-full bg-accent/30 px-3.5 py-1 text-xs font-bold text-foreground">JEE Main ({q.examYear} - {q.examSession})</span>
                  </div>
                  <span className="text-xs font-bold text-muted-foreground">Weightage: {q.weightageTags || "High Yield"}</span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">{q.questionText}</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { key: "A", text: q.optionA },
                    { key: "B", text: q.optionB },
                    { key: "C", text: q.optionC },
                    { key: "D", text: q.optionD },
                  ].map((opt) => (
                    <div key={opt.key} className={`rounded-xl border p-3.5 text-sm font-semibold flex items-center gap-3 ${q.correctOption === opt.key && isRevealed ? "border-emerald-500 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200" : "border-border/80 bg-muted/30"}`}>
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-background font-bold shadow-xs text-xs">{opt.key}</span>
                      <span>{opt.text}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <Button variant="outline" size="sm" onClick={() => toggleSolution(q.id)} className="rounded-full font-bold gap-2">
                    {isRevealed ? "Hide Solution" : "View Step-by-Step Solution"}
                  </Button>
                  <span className="text-xs font-semibold text-muted-foreground">Correct Option: <strong className="text-primary">{q.correctOption}</strong></span>
                </div>

                {isRevealed && (
                  <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 space-y-2 animate-in fade-in duration-200">
                    <p className="text-xs font-black uppercase tracking-wider text-primary">Verified Solution</p>
                    <p className="text-sm leading-relaxed text-foreground">{q.solutionMarkdown}</p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
