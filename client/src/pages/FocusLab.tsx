import { useEffect, useMemo, useState } from "react";
import {
  BellRing,
  Brain,
  CalendarClock,
  CalendarPlus,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Coffee,
  Expand,
  Flame,
  Leaf,
  Minimize,
  Pause,
  Pencil,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  TimerReset,
  TriangleAlert,
  Waves,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type FocusPhase = "focus" | "shortBreak" | "longBreak";
type TimerMode = "pomodoro" | "custom" | "stopwatch";

const PHASES: Record<FocusPhase, { label: string; minutes: number; accent: string; description: string }> = {
  focus: {
    label: "Deep focus",
    minutes: 25,
    accent: "bg-[#7C443A] text-white",
    description: "One clear study block. Keep the next move small and specific.",
  },
  shortBreak: {
    label: "Short reset",
    minutes: 5,
    accent: "bg-[#E7F1E4] text-[#34523C]",
    description: "Stand up, look away, and give your attention a soft reset.",
  },
  longBreak: {
    label: "Long reset",
    minutes: 15,
    accent: "bg-[#F5E6C8] text-[#6B4918]",
    description: "Four focus blocks deserve a deliberate recovery break.",
  },
};

const RESET_ROUTINES = [
  {
    icon: Waves,
    title: "One-minute breathing",
    detail: "Slow inhale for four, gentle exhale for six. Repeat five times.",
  },
  {
    icon: Coffee,
    title: "Water + movement",
    detail: "Refill water, roll your shoulders, and take ten slow steps.",
  },
  {
    icon: Leaf,
    title: "Eye reset",
    detail: "Look at something distant for 20 seconds before returning to the desk.",
  },
];

const DISTRACTIONS = ["Phone", "Social feed", "Noise", "Worry loop"];

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

function toLocalDateTimeInput(date: Date) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function formatPlannedDate(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default function FocusLab() {
  const [today] = useState(() => new Date());
  const [phase, setPhase] = useState<FocusPhase>("focus");
  const [timerMode, setTimerMode] = useState<TimerMode>("pomodoro");
  const [customMinutes, setCustomMinutes] = useState(45);
  const [remaining, setRemaining] = useState(PHASES.focus.minutes * 60);
  const [stopwatchElapsed, setStopwatchElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [subject, setSubject] = useState("Physics");
  const [intention, setIntention] = useState("");
  const [distractions, setDistractions] = useState<string[]>([]);
  const [activeRoutine, setActiveRoutine] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [readiness, setReadiness] = useState({ desk: false, device: false, material: false });
  const [planScheduledFor, setPlanScheduledFor] = useState(() => toLocalDateTimeInput(new Date(Date.now() + 30 * 60_000)));
  const [editingPlanId, setEditingPlanId] = useState<number | null>(null);

  const utils = trpc.useUtils();
  const insightsQuery = trpc.studyTimer.getInsights.useQuery({ daysBack: 7 });
  const sessionsQuery = trpc.studyTimer.getSessions.useQuery({ date: today });
  const createSession = trpc.studyTimer.create.useMutation();
  const completeSession = trpc.studyTimer.complete.useMutation({
    onSuccess: () => {
      utils.studyTimer.getInsights.invalidate();
      utils.studyTimer.getSessions.invalidate();
      utils.studyTimer.getDailyTime.invalidate();
    },
  });
  const cancelSession = trpc.studyTimer.cancel.useMutation();
  const plansQuery = trpc.focusPlans.list.useQuery();
  const createPlan = trpc.focusPlans.create.useMutation({ onSuccess: () => utils.focusPlans.list.invalidate() });
  const updatePlan = trpc.focusPlans.update.useMutation({ onSuccess: () => utils.focusPlans.list.invalidate() });
  const dismissPlan = trpc.focusPlans.dismiss.useMutation({ onSuccess: () => utils.focusPlans.list.invalidate() });

  const basePhase = PHASES[phase];
  const focusMinutes = timerMode === "custom" ? customMinutes : PHASES.focus.minutes;
  const activeMinutes = phase === "focus" ? focusMinutes : basePhase.minutes;
  const current = phase === "focus" && timerMode === "stopwatch"
    ? { ...basePhase, label: "Study stopwatch", description: "Track an open-ended study sprint, then stop when the concept feels complete." }
    : { ...basePhase, minutes: activeMinutes };
  const totalSeconds = activeMinutes * 60;
  const displaySeconds = phase === "focus" && timerMode === "stopwatch" ? stopwatchElapsed : remaining;
  const elapsedPercent = phase === "focus" && timerMode === "stopwatch"
    ? Math.min(100, (stopwatchElapsed / Math.max(1, customMinutes * 60)) * 100)
    : Math.min(100, Math.max(0, ((totalSeconds - remaining) / totalSeconds) * 100));
  const todayCompleted = useMemo(
    () => (sessionsQuery.data ?? []).filter((session) => session.isCompleted).length,
    [sessionsQuery.data],
  );

  const sessionNotes = () =>
    JSON.stringify({
      kind: "focus",
      mode: timerMode,
      intention: intention.trim() || "Focused study block",
      distractions,
    });

  const switchPhase = (nextPhase: FocusPhase) => {
    if (isRunning || sessionId) return;
    setPhase(nextPhase);
    setRemaining(PHASES[nextPhase].minutes * 60);
    setStopwatchElapsed(0);
    setDistractions([]);
  };

  const switchTimerMode = (nextMode: TimerMode) => {
    if (isRunning || sessionId) return;
    setTimerMode(nextMode);
    setPhase("focus");
    setStopwatchElapsed(0);
    setRemaining((nextMode === "custom" ? customMinutes : PHASES.focus.minutes) * 60);
    setDistractions([]);
  };

  const completeFocusPhase = async () => {
    setIsRunning(false);

    if (phase === "focus" && sessionId) {
      try {
        await completeSession.mutateAsync({
          id: sessionId,
          notes: sessionNotes(),
          ...(timerMode === "stopwatch" ? { duration: Math.max(1, Math.ceil(stopwatchElapsed / 60)) } : {}),
        });
        toast.success("Focus block logged. Your attention earned a real recovery break.");
      } catch {
        toast.error("We could not save this focus block. Please retry your next session.");
      }
      setSessionId(null);
      const nextCycle = completedCycles + 1;
      setCompletedCycles(nextCycle);
      const nextPhase = nextCycle % 4 === 0 ? "longBreak" : "shortBreak";
      setPhase(nextPhase);
      setRemaining(PHASES[nextPhase].minutes * 60);
      setStopwatchElapsed(0);
      setDistractions([]);
      return;
    }

    if (phase !== "focus") {
      toast.success("Reset complete. Pick the next focused task when you are ready.");
      setPhase("focus");
      setRemaining((timerMode === "custom" ? customMinutes : PHASES.focus.minutes) * 60);
    }
  };

  useEffect(() => {
    if (!isRunning) return;
    const interval = window.setInterval(() => {
      if (phase === "focus" && timerMode === "stopwatch") {
        setStopwatchElapsed((value) => value + 1);
      } else {
        setRemaining((value) => Math.max(0, value - 1));
      }
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isRunning, phase, timerMode]);

  useEffect(() => {
    if (isRunning && timerMode !== "stopwatch" && remaining === 0) {
      void completeFocusPhase();
    }
  }, [isRunning, remaining, timerMode]);

  const start = async () => {
    if (phase !== "focus") {
      setIsRunning(true);
      return;
    }

    if (sessionId) {
      setIsRunning(true);
      return;
    }

    try {
      const result = await createSession.mutateAsync({
        date: new Date(),
        subject: subject.trim() || "General study",
        duration: timerMode === "stopwatch" ? 1 : activeMinutes,
        notes: sessionNotes(),
      });
      setSessionId(result.id);
      setIsRunning(true);
    } catch {
      toast.error("Focus session could not start. Check your connection and retry.");
    }
  };

  const reset = async () => {
    setIsRunning(false);
    if (sessionId) {
      try {
        await cancelSession.mutateAsync({ id: sessionId });
      } catch {
        toast.error("The unfinished session could not be cleared. Please retry.");
        return;
      }
    }
    setSessionId(null);
    setRemaining(totalSeconds);
    setStopwatchElapsed(0);
    setDistractions([]);
  };

  const plannerDuration = timerMode === "stopwatch" ? customMinutes : focusMinutes;

  const savePlan = async () => {
    const scheduledFor = new Date(planScheduledFor);
    if (!subject.trim() || !intention.trim() || Number.isNaN(scheduledFor.getTime())) {
      toast.error("Add a subject, one intention, and a valid start time before saving your plan.");
      return;
    }
    const input = {
      subject: subject.trim(),
      intention: intention.trim(),
      scheduledFor,
      duration: plannerDuration,
      timerMode,
    };
    try {
      if (editingPlanId) {
        await updatePlan.mutateAsync({ id: editingPlanId, ...input });
        toast.success("Upcoming focus block updated.");
      } else {
        await createPlan.mutateAsync(input);
        toast.success("Your next focus block is saved in Focus Lab.");
      }
      setEditingPlanId(null);
    } catch {
      toast.error("We could not save that plan. Please retry.");
    }
  };

  const editPlan = (plan: NonNullable<typeof plansQuery.data>[number]) => {
    setEditingPlanId(plan.id);
    setSubject(plan.subject);
    setIntention(plan.intention);
    setPlanScheduledFor(toLocalDateTimeInput(new Date(plan.scheduledFor)));
    setTimerMode(plan.timerMode);
    setCustomMinutes(plan.duration);
    setPhase("focus");
    setRemaining(plan.duration * 60);
    setStopwatchElapsed(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const startPlannedBlock = async (plan: NonNullable<typeof plansQuery.data>[number]) => {
    try {
      await updatePlan.mutateAsync({ id: plan.id, status: "started" });
      setSubject(plan.subject);
      setIntention(plan.intention);
      setTimerMode(plan.timerMode);
      setCustomMinutes(plan.duration);
      setPhase("focus");
      setRemaining(plan.duration * 60);
      setStopwatchElapsed(0);
      toast.success("Plan loaded. Start your focus block when you are ready.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      toast.error("We could not load that planned block. Please retry.");
    }
  };

  const dismissPlannedBlock = async (id: number) => {
    try {
      await dismissPlan.mutateAsync({ id });
      toast.success("Planned block dismissed.");
    } catch {
      toast.error("We could not dismiss that plan. Please retry.");
    }
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      toast.info("Fullscreen is not available in this browser. Your focus timer will continue here.");
    }
  };

  const toggleDistraction = (label: string) => {
    setDistractions((currentItems) =>
      currentItems.includes(label)
        ? currentItems.filter((item) => item !== label)
        : [...currentItems, label],
    );
  };

  const insight = insightsQuery.data;

  return (
    <div className="mx-auto max-w-7xl space-y-7 pb-12">
      <section className="relative overflow-hidden rounded-[2rem] border border-border bg-[#2D2420] p-6 text-[#FDFBF7] shadow-sm sm:p-8 lg:p-10">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#D99755]/15 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="ink-kicker text-amber-200"><Flame className="h-3.5 w-3.5" /> Focus Lab</p>
            <h1 className="display-serif mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Protect your next 25 minutes.</h1>
            <p className="mt-4 text-sm leading-7 text-stone-300 sm:text-base">Run intentional study blocks, recover with an actual reset, and notice the distractions that keep returning. This is your study desk—not a device blocker.</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-bold">
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-2"><Clock3 className="mr-1.5 inline h-3.5 w-3.5 text-amber-300" /> {todayCompleted} cycles today</span>
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-2"><Sparkles className="mr-1.5 inline h-3.5 w-3.5 text-amber-300" /> {insight?.focusMinutes ?? 0} focused min / 7d</span>
          </div>
        </div>
      </section>

      <div className="grid gap-7 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="elevated-card rounded-[2rem] p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="ink-kicker">Timer mode</p>
              <h2 className="mt-1 text-xl font-black">{current.label}</h2>
            </div>
            <Button variant="outline" size="sm" onClick={toggleFullscreen} className="rounded-full bg-background/65">
              {isFullscreen ? <Minimize className="mr-2 h-4 w-4" /> : <Expand className="mr-2 h-4 w-4" />}
              {isFullscreen ? "Exit focus view" : "Focus view"}
            </Button>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2 rounded-2xl bg-muted/40 p-1.5">
            {([
              ["pomodoro", "Pomodoro"],
              ["custom", "Custom"],
              ["stopwatch", "Stopwatch"],
            ] as Array<[TimerMode, string]>).map(([mode, label]) => (
              <button
                key={mode}
                type="button"
                aria-pressed={timerMode === mode}
                disabled={isRunning || sessionId !== null}
                onClick={() => switchTimerMode(mode)}
                className={`rounded-xl px-2 py-2.5 text-xs font-black transition-all disabled:cursor-not-allowed disabled:opacity-55 ${timerMode === mode && phase === "focus" ? "bg-[#2D2420] text-white" : "text-muted-foreground hover:bg-background/70"}`}
              >
                {label}
              </button>
            ))}
          </div>

          {timerMode === "custom" && phase === "focus" && (
            <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-background/45 p-4">
              <div><p className="text-sm font-black">Custom focus length</p><p className="mt-1 text-xs text-muted-foreground">Choose a realistic block between 10 and 180 minutes.</p></div>
              <Input type="number" min={10} max={180} disabled={isRunning || sessionId !== null} value={customMinutes} onChange={(event) => { const next = Math.min(180, Math.max(10, Number(event.target.value) || 10)); setCustomMinutes(next); setRemaining(next * 60); }} className="h-10 w-24 rounded-xl bg-background text-center font-black" />
            </div>
          )}

          <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-muted/40 p-1.5">
            {(Object.keys(PHASES) as FocusPhase[]).map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={phase === item}
                disabled={isRunning || sessionId !== null}
                onClick={() => switchPhase(item)}
                className={`rounded-xl px-2 py-2.5 text-xs font-black transition-all disabled:cursor-not-allowed disabled:opacity-55 ${phase === item ? PHASES[item].accent : "text-muted-foreground hover:bg-background/70"}`}
              >
                {PHASES[item].label}
              </button>
            ))}
          </div>

          <div className="relative mx-auto mt-8 flex h-64 w-64 items-center justify-center rounded-full border-[14px] border-muted bg-background shadow-inner sm:h-72 sm:w-72">
            <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
              <circle cx="50" cy="50" r="43" fill="none" stroke="currentColor" strokeWidth="5" className="text-muted" />
              <circle cx="50" cy="50" r="43" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" className="text-primary transition-all duration-500" strokeDasharray={`${elapsedPercent * 2.7} 270`} />
            </svg>
            <div className="relative text-center">
              <p className="text-5xl font-black tabular-nums tracking-tight text-foreground sm:text-6xl">{formatTime(displaySeconds)}</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">{isRunning ? "attention protected" : "ready when you are"}</p>
            </div>
          </div>

          <p className="mx-auto mt-6 max-w-lg text-center text-sm leading-6 text-muted-foreground">{current.description}</p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button onClick={() => void start()} disabled={isRunning || createSession.isPending} className="h-11 rounded-full px-5 font-black">
              <Play className="mr-2 h-4 w-4" /> {createSession.isPending ? "Starting…" : "Start block"}
            </Button>
            <Button onClick={() => setIsRunning(false)} disabled={!isRunning} variant="outline" className="h-11 rounded-full bg-background/60 px-5 font-black"><Pause className="mr-2 h-4 w-4" /> Pause</Button>
            <Button onClick={() => void reset()} disabled={cancelSession.isPending} variant="outline" className="h-11 rounded-full bg-background/60 px-5 font-black"><RotateCcw className="mr-2 h-4 w-4" /> Reset</Button>
          </div>

          <div className="mt-8 grid gap-4 border-t border-border/70 pt-6 md:grid-cols-2">
            <div>
              <label htmlFor="focus-subject" className="text-xs font-black uppercase tracking-wider text-muted-foreground">Study subject</label>
              <Input id="focus-subject" value={subject} onChange={(event) => setSubject(event.target.value)} disabled={isRunning || sessionId !== null} className="mt-2 h-11 rounded-xl bg-background/60 font-semibold" placeholder="Physics, Biology, Maths…" />
            </div>
            <div>
              <label htmlFor="focus-intention" className="text-xs font-black uppercase tracking-wider text-muted-foreground">One intention</label>
              <Input id="focus-intention" value={intention} onChange={(event) => setIntention(event.target.value)} disabled={isRunning || sessionId !== null} className="mt-2 h-11 rounded-xl bg-background/60 font-semibold" placeholder="e.g. finish electrostatics notes" />
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900/30 dark:bg-emerald-950/20">
            <div className="flex items-start gap-3"><span className="rounded-xl bg-white/80 p-2 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"><ShieldCheck className="h-4 w-4" /></span><div><p className="text-sm font-black">Before you begin</p><p className="mt-1 text-xs leading-5 text-muted-foreground">This check is for your own intention. The website will not access, block, or inspect your device apps.</p></div></div>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {([
                ["desk", "Desk clear"],
                ["device", "Device focus mode on"],
                ["material", "Materials open"],
              ] as Array<[keyof typeof readiness, string]>).map(([key, label]) => <button key={key} type="button" onClick={() => setReadiness((items) => ({ ...items, [key]: !items[key] }))} className={`rounded-xl border px-3 py-2 text-left text-xs font-black transition-all ${readiness[key] ? "border-emerald-300 bg-emerald-100 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100" : "border-border bg-background/60 text-muted-foreground"}`}>{readiness[key] && <CheckCircle2 className="mr-1 inline h-3.5 w-3.5" />}{label}</button>)}
            </div>
          </div>
        </Card>

        <div className="space-y-7">
          <Card className="elevated-card rounded-[2rem] p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="ink-kicker">Focus planner</p>
                <h2 className="mt-1 text-lg font-black">Make the next block visible.</h2>
              </div>
              <CalendarPlus className="h-5 w-5 text-primary" />
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Save your next intentional block here. It stays in your study desk, with no automatic device notification or background reminder.</p>
            <label htmlFor="focus-planned-for" className="mt-5 block text-xs font-black uppercase tracking-wider text-muted-foreground">Start time</label>
            <Input id="focus-planned-for" type="datetime-local" value={planScheduledFor} onChange={(event) => setPlanScheduledFor(event.target.value)} className="mt-2 h-11 rounded-xl bg-background/60 font-semibold" />
            <div className="mt-3 flex flex-wrap gap-2">
              <Button onClick={() => void savePlan()} disabled={createPlan.isPending || updatePlan.isPending} className="rounded-full px-4 font-black"><CalendarPlus className="mr-2 h-4 w-4" />{editingPlanId ? "Save changes" : "Save next block"}</Button>
              {editingPlanId && <Button variant="outline" onClick={() => setEditingPlanId(null)} className="rounded-full bg-background/60 px-4 font-black"><X className="mr-2 h-4 w-4" />Cancel edit</Button>}
            </div>
            <div className="mt-5 space-y-2">
              {(plansQuery.data ?? []).slice(0, 3).map((plan) => (
                <div key={plan.id} className="rounded-2xl border border-border/70 bg-background/50 p-3">
                  <div className="flex gap-3">
                    <span className="rounded-xl bg-accent/50 p-2 text-primary"><CalendarClock className="h-4 w-4" /></span>
                    <div className="min-w-0 flex-1"><p className="truncate text-sm font-black">{plan.subject} · {plan.intention}</p><p className="mt-1 text-xs font-semibold text-muted-foreground">{formatPlannedDate(new Date(plan.scheduledFor))} · {plan.duration} min · {plan.timerMode}</p></div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => void startPlannedBlock(plan)} className="rounded-full bg-primary px-3 py-1.5 text-xs font-black text-primary-foreground">Load</button><button type="button" onClick={() => editPlan(plan)} className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-black text-foreground"><Pencil className="mr-1 inline h-3 w-3" />Edit</button><button type="button" onClick={() => void dismissPlannedBlock(plan.id)} disabled={dismissPlan.isPending} className="rounded-full px-3 py-1.5 text-xs font-black text-muted-foreground hover:text-foreground disabled:opacity-50">Dismiss</button></div>
                </div>
              ))}
              {!plansQuery.isLoading && !(plansQuery.data ?? []).length && <div className="rounded-2xl border border-dashed border-border p-4 text-center text-xs leading-5 text-muted-foreground">No upcoming focus block yet. Keep the next start small and specific.</div>}
            </div>
          </Card>

          <Card className="elevated-card rounded-[2rem] p-6">
            <div className="flex items-start gap-3">
              <span className="rounded-2xl bg-rose-100 p-3 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300"><TriangleAlert className="h-5 w-5" /></span>
              <div>
                <p className="ink-kicker">Distraction check</p>
                <h2 className="mt-1 text-lg font-black">Name it; don’t fight it silently.</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Tap any interruption that showed up during this block. Your private weekly pattern helps you prepare a better study environment.</p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {DISTRACTIONS.map((item) => {
                const active = distractions.includes(item);
                return <button key={item} type="button" onClick={() => toggleDistraction(item)} className={`rounded-full border px-3 py-2 text-xs font-black transition-all ${active ? "border-rose-300 bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-200" : "border-border bg-background/60 text-muted-foreground hover:border-primary/40"}`}>{active && <CheckCircle2 className="mr-1 inline h-3.5 w-3.5" />}{item}</button>;
              })}
            </div>
          </Card>

          <Card className="elevated-card rounded-[2rem] p-6">
            <div className="flex items-center justify-between gap-3"><div><p className="ink-kicker">Break menu</p><h2 className="mt-1 text-lg font-black">Recover on purpose.</h2></div><TimerReset className="h-5 w-5 text-primary" /></div>
            <div className="mt-5 space-y-3">
              {RESET_ROUTINES.map((routine, index) => {
                const Icon = routine.icon;
                const active = activeRoutine === index;
                return <button key={routine.title} type="button" onClick={() => setActiveRoutine(index)} className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-all ${active ? "border-primary/35 bg-accent/35" : "border-border bg-background/45 hover:bg-accent/20"}`}><span className="rounded-xl bg-background p-2 text-primary"><Icon className="h-4 w-4" /></span><span><span className="block text-sm font-black">{routine.title}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{routine.detail}</span></span><ChevronRight className="ml-auto mt-1 h-4 w-4 text-muted-foreground" /></button>;
              })}
            </div>
          </Card>

          <Card className="elevated-card rounded-[2rem] p-6">
            <div className="flex items-center justify-between"><div><p className="ink-kicker">Weekly attention</p><h2 className="mt-1 text-lg font-black">Your focus pattern</h2></div><Brain className="h-5 w-5 text-primary" /></div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-background/65 p-4"><p className="text-xs font-bold text-muted-foreground">Deep work</p><p className="mt-1 text-2xl font-black">{insight?.focusMinutes ?? 0}<span className="ml-1 text-xs text-muted-foreground">min</span></p></div>
              <div className="rounded-2xl bg-background/65 p-4"><p className="text-xs font-bold text-muted-foreground">Recovery</p><p className="mt-1 text-2xl font-black">{insight?.breakMinutes ?? 0}<span className="ml-1 text-xs text-muted-foreground">min</span></p></div>
              <div className="rounded-2xl bg-background/65 p-4"><p className="text-xs font-bold text-muted-foreground">Focus days</p><p className="mt-1 text-2xl font-black">{insight?.focusDays ?? 0}<span className="ml-1 text-xs text-muted-foreground">/ 7</span></p></div>
              <div className="rounded-2xl bg-background/65 p-4"><p className="text-xs font-bold text-muted-foreground">Top distraction</p><p className="mt-1 truncate text-sm font-black">{insight?.topDistraction ?? "None logged"}</p></div>
            </div>
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs leading-5 text-amber-900 dark:border-amber-900/30 dark:bg-amber-950/25 dark:text-amber-100"><BellRing className="mr-1.5 inline h-3.5 w-3.5" /> This web experience can guide focus habits, but it cannot block apps or websites on your device.</div>
          </Card>
        </div>
      </div>
    </div>
  );
}
