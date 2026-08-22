import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Award, CheckCircle2, Clock, Flame, RotateCcw, Timer, Trophy, Zap, BarChart2, TrendingUp, Activity } from "lucide-react";
import { toast } from "sonner";

const DRILL_MODES = [
  { id: "lightning15", title: "Lightning 15", subtitle: "15 questions · Fast reflexes", count: 15, seconds: 300 },
  { id: "sprint30", title: "Topic Sprint", subtitle: "30 questions · Balanced pace", count: 30, seconds: 720 },
  { id: "marathon60", title: "Full Marathon", subtitle: "60 questions · Exam simulation", count: 60, seconds: 1800 },
] as const;

export default function SpeedDrillsPage() {
  const [activeTab, setActiveTab] = useState<"train" | "analytics">("train");
  const [activeMode, setActiveMode] = useState<"lightning15" | "sprint30" | "marathon60" | null>(null);
  const [selectedSubject, setSelectedSubject] = useState("Physics");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const { data: history, isLoading: historyLoading } = trpc.speedDrills.history.useQuery();
  const { data: analytics, isLoading: analyticsLoading } = trpc.speedDrills.analytics.useQuery();
  const recordMutation = trpc.speedDrills.record.useMutation({
    onSuccess: async () => {
      toast.success("Speed drill score recorded & analyzed!");
      await utils.speedDrills.history.invalidate();
      await utils.speedDrills.analytics.invalidate();
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
    let correctCount = 0;
    mockQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correct) correctCount++;
    });
    const score = Math.round((correctCount / mockQuestions.length) * 100);
    const modeObj = DRILL_MODES.find((m) => m.id === activeMode) || DRILL_MODES[0];
    const timeSpent = modeObj.seconds - timeLeft;

    recordMutation.mutate({
      mode: activeMode || "lightning15",
      subject: selectedSubject,
      questionsAttempted: mockQuestions.length,
      correctCount,
      timeTakenSeconds: timeSpent > 0 ? timeSpent : 30,
      accuracyPercent: score,
    });
  };

  const currentQ = mockQuestions[currentIndex];

  if (activeMode && !isCompleted) {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return (
      <div className="mx-auto max-w-4xl space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between rounded-2xl bg-card border border-border p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-primary/10 p-2.5 text-primary"><Zap className="h-5 w-5" /></span>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">{selectedSubject} Drill</p>
              <h2 className="text-lg font-bold">Question {currentIndex + 1} of {mockQuestions.length}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-muted px-4 py-2 font-mono text-sm font-bold text-foreground">
            <Clock className="h-4 w-4 text-primary animate-pulse" />
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </div>
        </div>

        <Card className="elevated-card rounded-[2rem] p-8 space-y-6">
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">{currentQ.text}</h3>

          <div className="grid gap-3">
            {["A", "B", "C", "D"].map((optKey, idx) => {
              const optText = currentQ.options[idx];
              const isSelected = selectedAnswers[currentIndex] === optKey;
              return (
                <button
                  key={optKey}
                  onClick={() => setSelectedAnswers((prev) => ({ ...prev, [currentIndex]: optKey }))}
                  className={`flex items-center gap-4 rounded-2xl border p-4 text-left font-semibold transition-all ${isSelected ? "border-primary bg-primary/10 text-primary shadow-xs" : "border-border/80 bg-background/50 hover:bg-muted/50"}`}
                >
                  <span className={`flex h-8 w-8 items-center justify-center rounded-xl font-bold text-xs ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{optKey}</span>
                  <span className="flex-1">{optText}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border/60">
            <Button
              variant="outline"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              className="rounded-full font-bold"
            >
              Previous
            </Button>
            {currentIndex < mockQuestions.length - 1 ? (
              <Button
                onClick={() => setCurrentIndex((prev) => prev + 1)}
                className="rounded-full font-bold px-6"
              >
                Next Question <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={finishDrill}
                className="rounded-full font-bold px-8 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Submit Drill <CheckCircle2 className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  if (isCompleted) {
    let correctCount = 0;
    mockQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correct) correctCount++;
    });
    const score = Math.round((correctCount / mockQuestions.length) * 100);
    return (
      <div className="mx-auto max-w-xl space-y-6 animate-in fade-in duration-300 py-12 text-center">
        <Card className="elevated-card rounded-[2.5rem] p-8 sm:p-10 space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary shadow-sm">
            <Trophy className="h-10 w-10" />
          </div>
          <div>
            <p className="ink-kicker">Drill Completed</p>
            <h2 className="text-3xl font-bold mt-1">Great Reflex Sprints!</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 rounded-2xl bg-muted/50 p-6 text-left">
            <div>
              <p className="text-xs font-black uppercase text-muted-foreground">Accuracy Score</p>
              <p className="text-3xl font-bold text-primary mt-1">{score}%</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase text-muted-foreground">Correct Answers</p>
              <p className="text-3xl font-bold text-foreground mt-1">{correctCount} / {mockQuestions.length}</p>
            </div>
          </div>
          <Button
            onClick={() => {
              setActiveMode(null);
              setIsCompleted(false);
              setCurrentIndex(0);
              setSelectedAnswers({});
            }}
            className="w-full h-12 rounded-full font-bold"
          >
            <RotateCcw className="mr-2 h-4 w-4" /> Back to Speed Drills
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] space-y-8 animate-in fade-in duration-300">
      <section className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-accent/30 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="ink-kicker mb-3">Reflex training</p>
            <h1 className="display-serif text-3xl font-bold tracking-tight sm:text-5xl">Speed Sprints & Analytics</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">Train your mental agility under high-pressure simulated exam countdowns and track your performance trends over time.</p>
          </div>
          <div className="flex items-center gap-2 bg-muted/70 p-1.5 rounded-full border border-border">
            <button
              onClick={() => setActiveTab("train")}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-all ${activeTab === "train" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Zap className="h-4 w-4" /> Training Sprints
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-all ${activeTab === "analytics" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
            >
              <BarChart2 className="h-4 w-4" /> Performance Analytics
            </button>
          </div>
        </div>
      </section>

      {activeTab === "train" ? (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-muted-foreground">Select Subject:</span>
            <div className="flex flex-wrap gap-2">
              {["Physics", "Chemistry", "Mathematics"].map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubject(sub)}
                  className={`rounded-full px-5 py-2 text-sm font-bold transition-all ${selectedSubject === sub ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted/60 text-muted-foreground hover:bg-muted"}`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {DRILL_MODES.map((mode) => (
              <Card key={mode.id} className="elevated-card rounded-[1.75rem] p-6 sm:p-8 space-y-6 flex flex-col justify-between group hover:border-primary/50 transition-all">
                <div className="space-y-3">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Zap className="h-6 w-6" />
                  </span>
                  <h3 className="text-2xl font-bold tracking-tight">{mode.title}</h3>
                  <p className="text-sm font-semibold text-muted-foreground">{mode.subtitle}</p>
                </div>
                <Button
                  onClick={() => setActiveMode(mode.id)}
                  className="w-full h-12 rounded-full font-bold shadow-sm"
                >
                  Start Sprint <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Card>
            ))}
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">Recent Drill History</h2>
            {historyLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((n) => (
                  <Card key={n} className="p-6 rounded-[1.75rem] border border-border/60 space-y-3 animate-pulse">
                    <div className="h-5 w-28 bg-muted rounded-full" />
                    <div className="h-8 w-20 bg-muted rounded-xl" />
                    <div className="h-4 w-36 bg-muted rounded-full" />
                  </Card>
                ))}
              </div>
            ) : !history || history.length === 0 ? (
              <Card className="rounded-[1.75rem] p-8 text-center space-y-2">
                <p className="text-sm font-bold text-muted-foreground">No speed drills recorded yet. Start your first sprint above!</p>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {history.map((record) => (
                  <Card key={record.id} className="rounded-[1.75rem] p-6 space-y-3 border border-border/80 bg-card">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black uppercase text-primary">{record.subject}</span>
                      <span className="text-xs font-bold text-muted-foreground">{new Date(record.completedAt).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{record.accuracyPercent}% Accuracy</p>
                      <p className="text-xs font-semibold text-muted-foreground mt-0.5">{record.correctCount} / {record.questionsAttempted} correct answers</p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-200">
          {analyticsLoading ? (
            <div className="grid gap-6 md:grid-cols-3 animate-pulse">
              {[1, 2, 3].map((n) => (
                <Card key={n} className="p-6 rounded-[1.75rem] h-36 bg-muted/40" />
              ))}
            </div>
          ) : !analytics || analytics.totalDrills === 0 ? (
            <Card className="rounded-[2rem] p-12 text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <BarChart2 className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold">No Analytics Data Yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto">Complete a few Speed Sprints in the training tab to generate your speed, accuracy, and subject breakdown analytics.</p>
              <Button onClick={() => setActiveTab("train")} className="rounded-full px-6 font-bold">Start First Sprint</Button>
            </Card>
          ) : (
            <>
              {/* Summary Metrics */}
              <div className="grid gap-6 sm:grid-cols-3">
                <Card className="elevated-card rounded-[1.75rem] p-6 space-y-2 border border-border bg-card">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">Total Sprints</p>
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-4xl font-black">{analytics.totalDrills}</p>
                  <p className="text-xs font-semibold text-muted-foreground">Recorded reflex drills</p>
                </Card>

                <Card className="elevated-card rounded-[1.75rem] p-6 space-y-2 border border-border bg-card">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">Average Accuracy</p>
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                  </div>
                  <p className="text-4xl font-black text-emerald-600">{analytics.avgAccuracy}%</p>
                  <p className="text-xs font-semibold text-muted-foreground">Across all completed sprints</p>
                </Card>

                <Card className="elevated-card rounded-[1.75rem] p-6 space-y-2 border border-border bg-card">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">Avg Speed / Question</p>
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-4xl font-black">{analytics.avgSpeedSecPerQ}s</p>
                  <p className="text-xs font-semibold text-muted-foreground">Pacing benchmark</p>
                </Card>
              </div>

              {/* Subject Breakdown & Trends */}
              <div className="grid gap-8 lg:grid-cols-2">
                <Card className="elevated-card rounded-[2rem] p-6 sm:p-8 space-y-6">
                  <div>
                    <h3 className="text-xl font-bold tracking-tight">Subject Breakdown</h3>
                    <p className="text-xs font-semibold text-muted-foreground mt-1">Accuracy and pace performance grouped by subject</p>
                  </div>
                  <div className="space-y-4">
                    {analytics.subjectBreakdown.map((sub) => (
                      <div key={sub.subject} className="rounded-2xl border border-border/80 bg-muted/40 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground">{sub.subject}</span>
                          <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-black text-primary">{sub.drillsCount} sprints</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-xs font-bold text-muted-foreground">Accuracy</p>
                            <p className="text-lg font-black text-emerald-600">{sub.avgAccuracy}%</p>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-muted-foreground">Pace</p>
                            <p className="text-lg font-black">{sub.avgSpeedSecPerQ}s / q</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="elevated-card rounded-[2rem] p-6 sm:p-8 space-y-6">
                  <div>
                    <h3 className="text-xl font-bold tracking-tight">Recent Accuracy Trend</h3>
                    <p className="text-xs font-semibold text-muted-foreground mt-1">Your latest sprint scores in chronological order</p>
                  </div>
                  <div className="space-y-3">
                    {analytics.recentTrend.map((t, idx) => (
                      <div key={t.id} className="flex items-center gap-4 rounded-2xl border border-border/70 bg-card p-4">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted text-xs font-bold text-muted-foreground">#{idx + 1}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                            <span>{t.subject}</span>
                            <span>{t.date}</span>
                          </div>
                          <div className="mt-2 flex items-center gap-3">
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                              <div className="h-full rounded-full bg-primary" style={{ width: `${t.accuracy}%` }} />
                            </div>
                            <span className="font-mono text-sm font-bold">{t.accuracy}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
