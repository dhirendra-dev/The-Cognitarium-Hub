import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, BookOpen, BrainCircuit, CalendarClock, ChevronRight, Clock3, Flame, Gauge, Lightbulb, Medal, Play, Search, Sparkles, Target, TrendingDown, TrendingUp, Users, Zap } from "lucide-react";
import { useLocation } from "wouter";
import { useMemo, useState } from "react";

const JEE_MAIN_DATE = new Date("2028-01-22T09:00:00");
const SUBJECTS = [
  { name: "Physics", color: "bg-sky-500", soft: "bg-sky-50 text-sky-800 dark:bg-sky-950/40 dark:text-sky-200" },
  { name: "Chemistry", color: "bg-emerald-500", soft: "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200" },
  { name: "Mathematics", color: "bg-amber-500", soft: "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200" },
];

function daysUntil(date: Date) {
  return Math.max(0, Math.ceil((date.getTime() - Date.now()) / 86400000));
}

function percent(value: unknown) {
  return Math.max(0, Math.min(100, Number(value ?? 0)));
}

export default function Dashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [topicSearch, setTopicSearch] = useState("");
  const { data: adaptive, isLoading: adaptiveLoading } = trpc.adaptive.dashboard.useQuery();
  const { data: revisionQueue } = trpc.adaptive.revisionQueue.useQuery();
  const { data: studySessions } = trpc.studySessions.getByUser.useQuery({ daysBack: 7 });
  const { data: totalHours } = trpc.studySessions.getTotalHours.useQuery({ daysBack: 30 });
  const { data: streak } = trpc.streaks.getStreak.useQuery();
  const { data: xpProgress } = trpc.streaks.getXPProgress.useQuery();
  const { data: squads } = trpc.squads.mine.useQuery();

  const masteryByTopic = useMemo(() => new Map((adaptive?.mastery ?? []).map((item) => [item.topicId, item])), [adaptive?.mastery]);
  const subjectProgress = useMemo(() => SUBJECTS.map((subject) => {
    const topics = (adaptive?.topics ?? []).filter((topic) => topic.subject.toLowerCase() === subject.name.toLowerCase());
    const values = topics.map((topic) => Number(masteryByTopic.get(topic.id)?.masteryScore ?? 0));
    return { ...subject, count: topics.length, value: values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0 };
  }), [adaptive?.topics, masteryByTopic]);

  const overallMastery = useMemo(() => {
    const values = (adaptive?.mastery ?? []).map((item) => Number(item.masteryScore));
    return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;
  }, [adaptive?.mastery]);

  const weeklyBars = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 7 }, (_, index) => {
      const day = new Date(now);
      day.setHours(0, 0, 0, 0);
      day.setDate(now.getDate() - (6 - index));
      const total = (studySessions ?? []).filter((session) => new Date(session.date).toDateString() === day.toDateString()).reduce((sum, session) => sum + Number(session.hoursStudied ?? 0), 0);
      return { label: day.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 2), value: total };
    });
  }, [studySessions]);

  const maxBar = Math.max(1, ...weeklyBars.map((item) => item.value));
  const daysToExam = daysUntil(JEE_MAIN_DATE);
  const recommendedHours = overallMastery >= 80 ? 2 : overallMastery >= 50 ? 3 : 4;
  const latestRank = adaptive?.ranks?.[0];
  const trendImproving = (adaptive?.mastery ?? []).filter((item) => item.trend === "improving").length;
  const trendWorsening = (adaptive?.mastery ?? []).filter((item) => item.trend === "worsening").length;

  const matchingTopics = useMemo(() => {
    if (!topicSearch.trim()) return [];
    const query = topicSearch.toLowerCase();
    return (adaptive?.topics ?? []).filter((topic) => topic.topic.toLowerCase().includes(query) || topic.subject.toLowerCase().includes(query) || topic.unit.toLowerCase().includes(query)).slice(0, 5);
  }, [adaptive?.topics, topicSearch]);

  return (
    <div className="mx-auto max-w-[1440px] space-y-7">
      <section className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-accent/40 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
        <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="ink-kicker mb-3">Your adaptive study desk</p>
            <h2 className="display-serif text-4xl font-bold leading-[0.98] tracking-tight sm:text-6xl">Good morning, {user?.name?.split(" ")[0] || "learner"}.</h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">Your plan should respond to you. Today we are prioritising the topics that need the most recall, not the ones you already know.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={() => navigate("/daily-tasks")} className="rounded-full px-5"><Play className="mr-2 h-4 w-4" /> Start today’s plan</Button>
              <Button variant="outline" onClick={() => navigate("/dpp-generator")} className="rounded-full bg-background/50 px-5"><Sparkles className="mr-2 h-4 w-4" /> Generate a drill</Button>
            </div>
            <div className="relative mt-2 max-w-md">
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 h-4 w-4 text-muted-foreground" />
                <input value={topicSearch} onChange={(event) => setTopicSearch(event.target.value)} placeholder="Quick search any syllabus topic..." className="w-full rounded-full border border-border bg-background/80 py-2.5 pl-10 pr-4 text-sm font-semibold outline-none transition-colors focus:border-primary" />
              </div>
              {matchingTopics.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
                  {matchingTopics.map((topic) => (
                    <button key={topic.id} onClick={() => { setTopicSearch(""); navigate("/concept-vault"); }} className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-accent/30">
                      <div>
                        <p className="font-bold text-foreground">{topic.topic}</p>
                        <p className="text-xs text-muted-foreground">{topic.subject} · {topic.unit}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="grid min-w-[260px] grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border/80 bg-background/70 p-4"><p className="ink-kicker">JEE Main</p><p className="mt-2 text-3xl font-black">{daysToExam}</p><p className="text-xs font-semibold text-muted-foreground">days to target</p></div>
            <div className="rounded-2xl border border-border/80 bg-background/70 p-4"><p className="ink-kicker">Coverage</p><p className="mt-2 text-3xl font-black">{adaptiveLoading ? "—" : `${overallMastery}%`}</p><p className="text-xs font-semibold text-muted-foreground">mastery baseline</p></div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="elevated-card rounded-2xl p-5"><div className="mb-5 flex items-center justify-between"><span className="rounded-xl bg-primary/10 p-2.5 text-primary"><Gauge className="h-5 w-5" /></span><span className="text-xs font-bold text-muted-foreground">last 30 days</span></div><p className="text-sm font-bold text-muted-foreground">Focused hours</p><p className="mt-1 text-3xl font-black">{Number(totalHours ?? 0).toFixed(1)}<span className="ml-1 text-base font-bold text-muted-foreground">h</span></p><p className="mt-2 text-xs font-semibold text-muted-foreground">Goal: {recommendedHours}h/day</p></div>
        <div className="elevated-card rounded-2xl p-5"><div className="mb-5 flex items-center justify-between"><span className="rounded-xl bg-orange-100 p-2.5 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300"><Flame className="h-5 w-5" /></span><span className="text-xs font-bold text-muted-foreground">consistency</span></div><p className="text-sm font-bold text-muted-foreground">Study streak</p><p className="mt-1 text-3xl font-black">{streak?.streak ?? 0}<span className="ml-1 text-base font-bold text-muted-foreground">days</span></p><p className="mt-2 text-xs font-semibold text-muted-foreground">Small sessions compound.</p></div>
        <div className="elevated-card rounded-2xl p-5"><div className="mb-5 flex items-center justify-between"><span className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"><Zap className="h-5 w-5" /></span><span className="text-xs font-bold text-muted-foreground">effort weighted</span></div><p className="text-sm font-bold text-muted-foreground">XP to next level</p><p className="mt-1 text-3xl font-black">{xpProgress?.current ?? 0}<span className="ml-1 text-base font-bold text-muted-foreground">XP</span></p><Progress value={xpProgress?.percentage ?? 0} className="mt-3 h-1.5" /></div>
        <div className="elevated-card rounded-2xl p-5"><div className="mb-5 flex items-center justify-between"><span className="rounded-xl bg-violet-100 p-2.5 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300"><Target className="h-5 w-5" /></span><span className="text-xs font-bold text-muted-foreground">confidence band</span></div><p className="text-sm font-bold text-muted-foreground">Estimated rank</p><p className="mt-1 text-3xl font-black">{latestRank ? `#${latestRank.estimatedMin.toLocaleString()}` : "—"}</p><p className="mt-2 text-xs font-semibold text-muted-foreground">{latestRank ? `range to #${latestRank.estimatedMax.toLocaleString()}` : "Complete a mock to baseline"}</p></div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.45fr_0.8fr]">
        <Card className="elevated-card overflow-hidden rounded-[1.75rem]">
          <div className="flex flex-col justify-between gap-3 border-b border-border/70 p-6 sm:flex-row sm:items-center sm:p-7"><div><p className="ink-kicker">Mastery graph</p><h3 className="mt-1 text-xl font-black">Where your attention pays back</h3></div><button onClick={() => navigate("/syllabus")} className="flex items-center text-sm font-bold text-primary hover:underline">Open syllabus map <ArrowRight className="ml-1 h-4 w-4" /></button></div>
          <div className="grid gap-4 p-6 sm:grid-cols-3 sm:p-7">
            {subjectProgress.map((subject) => (
              <button key={subject.name} onClick={() => navigate("/syllabus")} className={`rounded-2xl p-4 text-left transition-transform hover:-translate-y-1 ${subject.soft}`}>
                <div className="mb-6 flex items-start justify-between"><span className="text-sm font-black">{subject.name}</span><ChevronRight className="h-4 w-4 opacity-60" /></div>
                <p className="text-3xl font-black">{subject.count ? `${subject.value}%` : "—"}</p>
                <p className="mt-1 text-xs font-semibold opacity-70">{subject.count ? `${subject.count} live topics mapped` : "No topics mapped yet"}</p>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-black/10"><div className={`h-full rounded-full ${subject.color}`} style={{ width: `${subject.value}%` }} /></div>
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4 border-t border-border/70 bg-background/40 p-6 sm:grid-cols-4 sm:px-7"><div><p className="text-xs font-bold text-muted-foreground">Improving</p><p className="mt-1 text-2xl font-black text-emerald-600">{trendImproving}</p></div><div><p className="text-xs font-bold text-muted-foreground">Needs review</p><p className="mt-1 text-2xl font-black text-orange-600">{revisionQueue?.length ?? 0}</p></div><div><p className="text-xs font-bold text-muted-foreground">Worsening</p><p className="mt-1 text-2xl font-black text-rose-600">{trendWorsening}</p></div><div><p className="text-xs font-bold text-muted-foreground">Topics tracked</p><p className="mt-1 text-2xl font-black">{adaptive?.topics?.length ?? 0}</p></div></div>
        </Card>

        <Card className="elevated-card rounded-[1.75rem] p-6 sm:p-7"><div className="mb-6 flex items-start justify-between"><div><p className="ink-kicker">Revise today</p><h3 className="mt-1 text-xl font-black">Your recall queue</h3></div><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">{revisionQueue?.length ?? 0} due</span></div><div className="space-y-3">{(revisionQueue ?? []).slice(0, 4).map((item) => <button key={item.id} onClick={() => navigate("/concept-vault")} className="group flex w-full items-center gap-3 rounded-2xl border border-border/70 bg-background/45 p-3 text-left transition-colors hover:bg-accent/30"><span className="rounded-xl bg-accent/60 p-2 text-primary"><Lightbulb className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-black">{item.topic?.topic}</span><span className="block text-xs font-semibold text-muted-foreground">{item.topic?.subject} · {Math.round(Number(item.masteryScore))}% mastery</span></span><ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" /></button>)}{!revisionQueue?.length && <div className="rounded-2xl border border-dashed border-border p-6 text-center"><CalendarClock className="mx-auto h-7 w-7 text-primary" /><p className="mt-3 text-sm font-black">Your revision queue is clear.</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Complete a drill to build your next spaced-repetition loop.</p></div>}</div><Button variant="outline" onClick={() => navigate("/daily-tasks")} className="mt-5 w-full rounded-full bg-background/50">Open daily plan <ArrowRight className="ml-2 h-4 w-4" /></Button></Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.82fr_0.82fr]">
        <Card className="elevated-card rounded-[1.75rem] p-6 sm:p-7"><div className="mb-7 flex items-start justify-between"><div><p className="ink-kicker">Study rhythm</p><h3 className="mt-1 text-xl font-black">Your last seven days</h3></div><Clock3 className="h-5 w-5 text-primary" /></div><div className="flex h-40 items-end gap-2">{weeklyBars.map((bar) => <div key={bar.label} className="flex flex-1 flex-col items-center gap-2"><div className="flex h-32 w-full items-end justify-center rounded-t-xl bg-accent/25"><div className="w-3/5 min-h-1 rounded-t-lg bg-primary transition-all" style={{ height: `${Math.max(3, (bar.value / maxBar) * 100)}%` }} title={`${bar.value.toFixed(1)} hours`} /></div><span className="text-[0.68rem] font-black text-muted-foreground">{bar.label}</span></div>)}</div><div className="mt-5 flex items-center justify-between text-xs font-semibold text-muted-foreground"><span>Hours are pulled from your logged sessions.</span><button onClick={() => navigate("/daily-tasks")} className="font-black text-primary hover:underline">Log focus time</button></div></Card>
        <Card className="elevated-card rounded-[1.75rem] p-6 sm:p-7"><div className="mb-5 flex items-center gap-3"><div className="rounded-xl bg-violet-100 p-2.5 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300"><Medal className="h-5 w-5" /></div><div><p className="ink-kicker">Transparency</p><h3 className="text-xl font-black">Rank signal</h3></div></div>{latestRank ? <><p className="text-4xl font-black">#{latestRank.estimatedMin.toLocaleString()}–{latestRank.estimatedMax.toLocaleString()}</p><p className="mt-2 text-sm leading-6 text-muted-foreground">Based on your latest full mock and current syllabus coverage. Confidence: {Number(latestRank.confidence).toFixed(0)}%.</p><Button onClick={() => navigate("/analytics")} variant="outline" className="mt-5 w-full rounded-full bg-background/50">See trend <ArrowRight className="ml-2 h-4 w-4" /></Button></> : <div className="rounded-2xl border border-dashed border-border p-5"><p className="text-sm font-black">No rank estimate yet.</p><p className="mt-2 text-xs leading-5 text-muted-foreground">Finish a full mock to create a transparent confidence band instead of a guess.</p><Button onClick={() => navigate("/dpp-generator")} className="mt-4 w-full rounded-full">Start practice</Button></div>}</Card>
        <Card className="elevated-card rounded-[1.75rem] p-6 sm:p-7"><div className="mb-5 flex items-center gap-3"><div className="rounded-xl bg-sky-100 p-2.5 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300"><Users className="h-5 w-5" /></div><div><p className="ink-kicker">Social accountability</p><h3 className="text-xl font-black">Squad pulse</h3></div></div>{squads?.length ? <><p className="text-4xl font-black">{squads[0].members?.length ?? 0}<span className="ml-1 text-base text-muted-foreground">active peers</span></p><p className="mt-2 text-sm leading-6 text-muted-foreground">Your squad is a smaller, kinder leaderboard built around consistency.</p><Button onClick={() => navigate("/squads")} variant="outline" className="mt-5 w-full rounded-full bg-background/50">Open squad <ArrowRight className="ml-2 h-4 w-4" /></Button></> : <div className="rounded-2xl border border-dashed border-border p-5"><p className="text-sm font-black">Study with people who get it.</p><p className="mt-2 text-xs leading-5 text-muted-foreground">Create a squad or join one with an invite code to turn effort into momentum.</p><Button onClick={() => navigate("/squads")} className="mt-4 w-full rounded-full">Find your squad</Button></div>}</Card>
      </section>

      <section className="flex flex-col items-start justify-between gap-4 rounded-[1.75rem] border border-primary/20 bg-primary p-6 text-primary-foreground shadow-xl shadow-primary/10 sm:flex-row sm:items-center sm:p-7"><div className="flex items-start gap-4"><div className="rounded-2xl bg-white/15 p-3"><BrainCircuit className="h-6 w-6" /></div><div><p className="text-xs font-black uppercase tracking-[0.18em] text-primary-foreground/65">Personalized next move</p><p className="mt-1 text-xl font-black">{revisionQueue?.length ? `Revise ${revisionQueue[0]?.topic?.topic} before you add new load.` : "Take a focused drill and let the graph learn from you."}</p></div></div><Button onClick={() => navigate(revisionQueue?.length ? "/concept-vault" : "/dpp-generator")} variant="secondary" className="w-full rounded-full sm:w-auto">{revisionQueue?.length ? "Open concept" : "Open practice lab"}<ArrowRight className="ml-2 h-4 w-4" /></Button></section>
    </div>
  );
}
