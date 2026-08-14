import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Award, CheckCircle2, Clock, Flame, RotateCcw, Timer, Trophy, Zap } from "lucide-react";
import { toast } from "sonner";

const DRILL_MODES = [
  { id: "lightning15", title: "Lightning 15", subtitle: "15 questions · Fast reflexes", count: 15, seconds: 300 },
  { id: "sprint30", title: "Topic Sprint", subtitle: "30 questions · Balanced pace", count: 30, seconds: 720 },
  { id: "marathon60", title: "Full Marathon", subtitle: "60 questions · Exam simulation", count: 60, seconds: 1800 },
] as const;

export default function SpeedDrillsPage() {
  const [activeMode, setActiveMode] = useState<"lightning15" | "sprint30" | "marathon60" | null>(null);
  const [selectedSubject, setSelectedSubject] = useState("Physics");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const { data: history } = trpc.speedDrills.history.useQuery();
  const recordMutation = trpc.speedDrills.record.useMutation({
    onSuccess: async () => {
      toast.success("Speed drill score recorded!");
      await utils.speedDrills.history.invalidate();
    },
  });
  const utils = trpc.useUtils();

  const mockQuestions = [
    { id: 1, text: "What is the dimensional formula of universal gravitational constant G?", options: ["[M^-1 L^3 T^-2]", "[M L^2 T^-2]", "[M^0 L^2 T^-2]", "[M^-1 L^2 T^-1]"], correct: "A" },
    { id: 2, text: "The root mean square velocity of gas molecules is proportional to:", options: ["T", "sqrt(T)", "T^2", "1/sqrt(T)"], correct: "B" },
    { id: 3, text: "Which of the following has highest electronegativity?", options: ["F", "Cl", "Br", "I"], correct: "A" },
    { id: 4, text: "The oxidation state of Cr in K2Cr2O7 is:", options: ["+3", "+6", "+7", "+4"], correct: "B" },
    { id: 5, text: "Derivative of x^x with respect to x is:", options: ["x^x (1 + ln x)", "x^x ln x", "x * x^(x-1)", "x^x"], correct: "A" },
    { id: 6, text: "Integration of tan x dx equals:", options: ["ln |sec x| + C", "-ln |cos x| + C", "Both A and B", "sec^2 x + C"], correct: "C" },
    { id: 7, text: "Escape velocity from Earth's surface is approximately:", options: ["8 km/s", "11.2 km/s", "15 km/s", "3 × 10^8 m/s"], correct: "B" },
    { id: 8, text: "Faraday's law of induction is consequence of conservation of:", options: ["Charge", "Momentum", "Energy", "Mass"], correct: "C" },
  ];

  useEffect(() => {
    if (!activeMode || isCompleted) return;
    const modeObj = DRILL_MODES.find((m) => m.id === activeMode);
    if (!modeObj) return;
    setTimeLeft(modeObj.seconds);
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishDrill();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeMode]);

  const finishDrill = () => {
    setIsCompleted(true);
    const modeObj = DRILL_MODES.find((m) => m.id === activeMode)!;
    const questions = mockQuestions.slice(0, modeObj.count > mockQuestions.length ? mockQuestions.length : modeObj.count);
    let correct = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correct) correct++;
    });
    const accuracy = Math.round((correct / questions.length) * 100);
    recordMutation.mutate({
      subject: selectedSubject,
      mode: activeMode!,
      questionsAttempted: questions.length,
      correctCount: correct,
      timeTakenSeconds: modeObj.seconds - timeLeft,
      accuracyPercent: accuracy,
    });
  };

  if (activeMode && !isCompleted) {
    const modeObj = DRILL_MODES.find((m) => m.id === activeMode)!;
    const questions = mockQuestions.slice(0, modeObj.count > mockQuestions.length ? mockQuestions.length : modeObj.count);
    const q = questions[currentIndex];
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
      <div className="mx-auto max-w-4xl space-y-7">
        <div className="flex items-center justify-between rounded-2xl bg-card p-6 shadow-sm border border-border">
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase">{selectedSubject} · {modeObj.title}</p>
            <h2 className="text-xl font-bold">Question {currentIndex + 1} of {questions.length}</h2>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 font-black text-primary">
            <Clock className="h-4 w-4 animate-pulse" />
            <span>{minutes}:{seconds < 10 ? "0" : ""}{seconds}</span>
          </div>
        </div>

        <Card className="rounded-2xl p-8 border border-border shadow-sm">
          <p className="text-lg font-bold leading-relaxed">{q.text}</p>
          <div className="mt-6 grid gap-3">
            {[
              { key: "A", text: q.options[0] },
              { key: "B", text: q.options[1] },
              { key: "C", text: q.options[2] },
              { key: "D", text: q.options[3] },
            ].map((opt) => {
              const isSelected = selectedAnswers[currentIndex] === opt.key;
              return (
                <button key={opt.key} onClick={() => setSelectedAnswers({ ...selectedAnswers, [currentIndex]: opt.key })} className={`flex items-center gap-3 rounded-xl border p-4 text-left font-semibold transition-all ${isSelected ? "border-primary bg-primary/10 text-primary font-black" : "border-border bg-background hover:bg-muted/50"}`}>
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-card border border-border text-xs font-black">{opt.key}</span>
                  <span>{opt.text}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-8 flex justify-between border-t border-border/60 pt-6">
            <Button variant="outline" disabled={currentIndex === 0} onClick={() => setCurrentIndex((prev) => prev - 1)} className="rounded-full">Previous</Button>
            {currentIndex < questions.length - 1 ? (
              <Button onClick={() => setCurrentIndex((prev) => prev + 1)} className="rounded-full">Next Question <ArrowRight className="ml-2 h-4 w-4" /></Button>
            ) : (
              <Button onClick={finishDrill} className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white">Submit Drill</Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="mx-auto max-w-2xl space-y-7 py-12 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
          <Award className="h-10 w-10" />
        </div>
        <h1 className="display-serif text-4xl font-bold">Drill Completed!</h1>
        <p className="text-muted-foreground">Your speed and accuracy have been recorded to your adaptive progress profile.</p>
        <div className="flex justify-center gap-4 pt-4">
          <Button onClick={() => { setActiveMode(null); setIsCompleted(false); setCurrentIndex(0); setSelectedAnswers({}); }} className="rounded-full">Back to Speed Drills</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] space-y-7">
      <section className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-accent/30 blur-3xl" />
        <div className="relative">
          <p className="ink-kicker mb-3">High-intensity practice</p>
          <h1 className="display-serif text-3xl font-bold tracking-tight sm:text-5xl">Speed Drills & Reflex Sprints</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">Sharpen your time management and calculation reflexes under strict countdown conditions.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {["Physics", "Chemistry", "Mathematics"].map((sub) => (
              <button key={sub} onClick={() => setSelectedSubject(sub)} className={`rounded-full px-5 py-2 text-sm font-bold transition-colors ${selectedSubject === sub ? "bg-primary text-primary-foreground" : "bg-muted/60 text-muted-foreground hover:bg-muted"}`}>
                {sub}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-3">
        {DRILL_MODES.map((mode) => (
          <Card key={mode.id} className="elevated-card flex flex-col justify-between rounded-2xl p-6">
            <div>
              <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3 text-primary">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-black">{mode.title}</h3>
              <p className="mt-1 text-sm font-semibold text-muted-foreground">{mode.subtitle}</p>
            </div>
            <div className="mt-8">
              <Button onClick={() => setActiveMode(mode.id)} className="w-full rounded-full">Start {mode.title}</Button>
            </div>
          </Card>
        ))}
      </div>

      <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <h3 className="text-xl font-bold">Recent Drill History</h3>
        <div className="mt-4 divide-y divide-border/60">
          {(history ?? []).map((drill) => (
            <div key={drill.id} className="flex items-center justify-between py-4">
              <div>
                <p className="font-bold">{drill.subject} · {drill.mode}</p>
                <p className="text-xs text-muted-foreground">{new Date(drill.completedAt).toLocaleDateString()} · {Math.round(drill.timeTakenSeconds / 60)} mins</p>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-emerald-600">{Number(drill.accuracyPercent)}%</span>
                <p className="text-xs text-muted-foreground">{drill.correctCount}/{drill.questionsAttempted} correct</p>
              </div>
            </div>
          ))}
          {!history?.length && <p className="py-6 text-center text-sm text-muted-foreground">No speed drills recorded yet. Start your first sprint above!</p>}
        </div>
      </section>
    </div>
  );
}
