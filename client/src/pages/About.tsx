import { Card } from "@/components/ui/card";
import { Heart, Target, Zap, BookOpen, Users, Trophy, Sparkles, ArrowRight } from "lucide-react";

const journey = [
  { icon: BookOpen, label: "Map the syllabus", copy: "Follow Physics, Chemistry, and Mathematics through a connected chapter and topic map." },
  { icon: Zap, label: "Build a rhythm", copy: "Use daily plans, streaks, and short practice loops to make progress visible and repeatable." },
  { icon: Target, label: "Practice with intent", copy: "Move from formulas and PYQs to timed drills, CBT review, and targeted revision." },
  { icon: Users, label: "Learn together", copy: "Join focused squads and community spaces that make accountability feel human." },
  { icon: Heart, label: "Ask without friction", copy: "Bring difficult formulas and PYQs to SahAI for structured explanations and follow-up questions." },
];

const principles = [
  { icon: Trophy, title: "Progress over pressure", copy: "The goal is not to make preparation louder. It is to make the next useful action easier to see." },
  { icon: Sparkles, title: "Clarity by design", copy: "Every tool is organized around the same syllabus, the same mastery signals, and the same study story." },
  { icon: Target, title: "Practice that remembers", copy: "Your review queue, drill history, and performance patterns help shape what you do next." },
  { icon: Users, title: "A desk, not a dump", copy: "Resources, coaching, community, and analytics come together in one calm preparation workspace." },
];

export default function About() {
  return (
    <div className="mx-auto max-w-[1200px] space-y-8 pb-12">
      <section className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-sm sm:p-10 lg:p-14">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-accent/35 blur-3xl pointer-events-none" />
        <div className="relative grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary p-3 shadow-lg shadow-primary/15">
                <img src="/manus-storage/cognitarium-hub-logo_2e4f180f.svg" alt="The Cognitarium Hub logo" className="h-full w-full object-contain" />
              </span>
              <div>
                <p className="text-sm font-black tracking-tight">The Cognitarium Hub</p>
                <p className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">adaptive learning</p>
              </div>
            </div>
            <p className="ink-kicker flex items-center gap-2"><Sparkles className="h-3.5 w-3.5" /> A calmer way to prepare</p>
            <h1 className="display-serif mt-4 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-6xl">A study desk that remembers what matters next.</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">The Cognitarium Hub is an adaptive preparation workspace for students balancing board exams with JEE Main and JEE Advanced. It turns a large syllabus into a sequence of focused decisions.</p>
          </div>
          <div className="rounded-[1.5rem] bg-primary p-6 text-primary-foreground shadow-xl shadow-primary/15 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-primary-foreground/65">The promise</p>
            <p className="mt-4 text-2xl font-black leading-tight">Less guesswork. Better practice. A clearer next session.</p>
            <div className="mt-7 flex items-center gap-2 text-sm font-bold text-primary-foreground/75"><ArrowRight className="h-4 w-4" /> Built around how you learn</div>
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="elevated-card rounded-[1.75rem] p-6 sm:p-8">
          <p className="ink-kicker">Why it exists</p>
          <h2 className="display-serif mt-3 text-3xl font-bold sm:text-4xl">Preparation is a system of small decisions.</h2>
          <div className="mt-6 space-y-4 text-base leading-7 text-muted-foreground">
            <p>Students are often asked to manage a syllabus, a timetable, a question bank, revision, doubts, and motivation all at once. The Cognitarium Hub brings those pieces closer together.</p>
            <p>Instead of treating every student as a blank slate, the platform uses your selected syllabus, practice activity, mastery signals, and revision history to make the workspace more useful over time.</p>
            <p>It is designed for steady progress: one topic, one explanation, one timed set, and one better decision at a time.</p>
          </div>
        </Card>

        <Card className="elevated-card rounded-[1.75rem] p-6 sm:p-8">
          <p className="ink-kicker">Your preparation loop</p>
          <h2 className="display-serif mt-3 text-3xl font-bold sm:text-4xl">From syllabus map to confident recall.</h2>
          <div className="mt-7 space-y-5">
            {journey.map(({ icon: Icon, label, copy }, index) => (
              <div key={label} className="flex gap-4">
                <div className="flex shrink-0 flex-col items-center gap-2">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/60 text-primary"><Icon className="h-5 w-5" /></span>
                  {index < journey.length - 1 && <span className="h-full min-h-5 w-px bg-border" />}
                </div>
                <div className="pb-3"><h3 className="font-black">{label}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{copy}</p></div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section>
        <div className="max-w-2xl"><p className="ink-kicker">What we believe</p><h2 className="display-serif mt-3 text-3xl font-bold sm:text-4xl">A serious tool can still feel human.</h2></div>
        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          {principles.map(({ icon: Icon, title, copy }) => (
            <Card key={title} className="elevated-card rounded-[1.5rem] p-6 sm:p-7">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/60 text-primary"><Icon className="h-5 w-5" /></span>
              <h3 className="mt-6 text-xl font-black">{title}</h3>
              <p className="mt-3 leading-7 text-muted-foreground">{copy}</p>
            </Card>
          ))}
        </div>
      </section>

      <footer className="border-t border-border/70 pt-7 text-center text-sm text-muted-foreground">
        <p className="font-black text-foreground">The Cognitarium Hub</p>
        <p className="mt-1">Adaptive preparation for students who want the data and the momentum.</p>
        <p className="mt-2 text-xs">© 2026 The Cognitarium Hub. All rights reserved.</p>
      </footer>
    </div>
  );
}
