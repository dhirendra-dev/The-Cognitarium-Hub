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
  const { data: pyqs, isLoading } = pyqArchiveQuery();

  function pyqArchiveQuery() {
    return trpc.pyqArchive.list.useQuery({
      subject: selectedSubject === "all" ? undefined : selectedSubject,
      examYear: selectedYear,
    });
  }

  const toggleSolution = (id: number) => {
    setRevealedSolutions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="mx-auto max-w-[1440px] space-y-7">
      <section className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-accent/30 blur-3xl" />
        <div className="relative">
          <p className="ink-kicker mb-3">Authentic question bank</p>
          <h1 className="display-serif text-3xl font-bold tracking-tight sm:text-5xl">Previous Year Question (PYQ) Archive</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">Master exam patterns with authentic JEE Main and Advanced questions paired with verified step-by-step solutions.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {["all", "Physics", "Chemistry", "Mathematics"].map((sub) => (
              <button key={sub} onClick={() => setSelectedSubject(sub)} className={`rounded-full px-5 py-2 text-sm font-bold capitalize transition-colors ${selectedSubject === sub ? "bg-primary text-primary-foreground" : "bg-muted/60 text-muted-foreground hover:bg-muted"}`}>
                {sub}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-bold text-muted-foreground">Filter by Year:</span>
        {[undefined, 2025, 2024, 2023].map((yr) => (
          <button key={String(yr)} onClick={() => setSelectedYear(yr)} className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${selectedYear === yr ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted"}`}>
            {yr ? yr : "All Years"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-muted-foreground">Loading PYQ archive...</div>
      ) : pyqs?.length === 0 ? (
        <Card className="rounded-2xl border border-dashed border-border p-12 text-center">
          <BookOpen className="mx-auto h-10 w-10 text-primary opacity-60" />
          <h3 className="mt-4 text-lg font-bold">No PYQs found in archive</h3>
          <p className="mt-1 text-sm text-muted-foreground">Try selecting a different year or subject filter.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {(pyqs ?? []).map((pyq) => {
            const isRevealed = revealedSolutions[pyq.id];
            return (
              <Card key={pyq.id} className="elevated-card rounded-2xl p-6 sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="rounded-lg bg-primary/10 px-3 py-1 text-xs font-black text-primary">{pyq.subject}</span>
                    <span className="rounded-lg bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">{pyq.examYear} · {pyq.examSession}</span>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">Q.{pyq.questionNumber}</span>
                </div>
                <div className="mt-6 text-base font-semibold leading-relaxed text-foreground">
                  {pyq.questionText}
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {[
                    { key: "A", text: pyq.optionA },
                    { key: "B", text: pyq.optionB },
                    { key: "C", text: pyq.optionC },
                    { key: "D", text: pyq.optionD },
                  ].map((opt) => (
                    <div key={opt.key} className={`rounded-xl border p-4 text-sm font-semibold transition-colors ${isRevealed && pyq.correctOption === opt.key ? "border-emerald-500 bg-emerald-50 text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-200" : "border-border bg-background/50"}`}>
                      <span className="mr-2 font-black">{opt.key}.</span> {opt.text}
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border/60 pt-4">
                  <span className="text-xs font-bold text-muted-foreground">Weightage Tag: {pyq.weightageTags || "High Yield"}</span>
                  <Button variant={isRevealed ? "outline" : "default"} onClick={() => toggleSolution(pyq.id)} className="rounded-full">
                    {isRevealed ? "Hide Solution" : "View Step-by-Step Solution"}
                  </Button>
                </div>
                {isRevealed && (
                  <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-6 space-y-3">
                    <div className="flex items-center gap-2 font-bold text-primary">
                      <Sparkles className="h-4 w-4" />
                      <span>Verified Solution & Approach</span>
                    </div>
                    <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">{pyq.solutionMarkdown}</p>
                    <p className="text-xs font-black text-emerald-700 dark:text-emerald-300">Correct Option: ({pyq.correctOption})</p>
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
