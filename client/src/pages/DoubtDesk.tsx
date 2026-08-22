import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { AlertCircle, ArrowUpRight, BrainCircuit, CheckCircle2, ChevronDown, Clock3, MessageCircle, Send, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const SUBJECTS = ["Physics", "Chemistry", "Mathematics"];

export default function DoubtDesk() {
  const [subject, setSubject] = useState("Physics");
  const [topic, setTopic] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [followUpMessages, setFollowUpMessages] = useState<Record<number, string>>({});
  const utils = trpc.useUtils();
  const { data: doubts, isLoading } = trpc.doubts.list.useQuery();
  const ask = trpc.doubts.ask.useMutation({
    onSuccess: () => {
      setQuestionText("");
      setTopic("");
      utils.doubts.list.invalidate();
      toast.success("SahAI resolved your doubt successfully!");
    },
    onError: (error) => toast.error(error.message),
  });
  const escalate = trpc.doubts.escalate.useMutation({
    onSuccess: () => {
      utils.doubts.list.invalidate();
      toast.success("Doubt queued for human mentor review.");
    },
    onError: (error) => toast.error(error.message),
  });
  const followUp = trpc.doubts.followUp.useMutation({
    onSuccess: async () => {
      await utils.doubts.list.invalidate();
      toast.success("SahAI answered your follow-up.");
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <section className="rounded-[2rem] border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="ink-kicker flex items-center gap-2"><Sparkles className="h-3.5 w-3.5" /> AI-Powered Doubt Resolution</p>
            <h1 className="display-serif mt-3 text-4xl font-bold sm:text-5xl">Master PYQs and Formula Tricks with SahAI</h1>
            <p className="mt-4 text-base leading-7 text-muted-foreground">Ask any complex JEE Main, Advanced, or board question. SahAI breaks down derivations, highlights common trap options, and chats with you step-by-step until the concept clicks.</p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-xs font-black text-emerald-800 dark:bg-emerald-950/35 dark:text-emerald-200">
            <ShieldCheck className="h-4 w-4" /> Instant AI Explanations & Follow-ups
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
        <Card className="elevated-card rounded-[1.75rem] p-6 sm:p-7">
          <div className="mb-6 flex items-center gap-3">
            <span className="rounded-xl bg-primary/10 p-2.5 text-primary"><BrainCircuit className="h-5 w-5" /></span>
            <div>
              <p className="ink-kicker">Ask the AI tutor</p>
              <h2 className="text-xl font-black">Submit Doubt or PYQ</h2>
            </div>
          </div>
          <div className="space-y-4">
            <label className="block text-sm font-black">Subject
              <select value={subject} onChange={(event) => setSubject(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-border bg-background px-3 text-sm font-semibold outline-none focus:border-primary">
                {SUBJECTS.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label className="block text-sm font-black">Topic or Formula Tag
              <Input value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="e.g. Rotational Inertia, Aldol Condensation" className="mt-2 h-12 rounded-xl bg-background/70" />
            </label>
            <label className="block text-sm font-black">Paste PYQ or Doubt Text
              <Textarea value={questionText} onChange={(event) => setQuestionText(event.target.value)} placeholder="Include the exact question statement, options, or formula derivation that needs clarification…" className="mt-2 min-h-40 resize-none rounded-xl bg-background/70 leading-6" />
            </label>
            <Button disabled={questionText.trim().length < 5 || ask.isPending} onClick={() => ask.mutate({ subject, topic: topic.trim() || undefined, questionText: questionText.trim() })} className="h-12 w-full rounded-full">
              <Send className="mr-2 h-4 w-4" /> {ask.isPending ? "SahAI is analyzing..." : "Ask SahAI Tutor"}
            </Button>
            <p className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" /> Responses are saved to your personal doubt vault for spaced revision before exams.
            </p>
          </div>
        </Card>

        <Card className="elevated-card rounded-[1.75rem] p-6 sm:p-7">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="ink-kicker">Interactive conversation</p>
              <h2 className="text-xl font-black">Doubt Resolution History</h2>
            </div>
            <span className="rounded-full bg-accent/45 px-3 py-1 text-xs font-black">{doubts?.length ?? 0} saved</span>
          </div>
          <div className="space-y-6">
            {isLoading && <p className="text-sm font-bold text-muted-foreground">Loading your doubts...</p>}
            {!isLoading && !doubts?.length && (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center">
                <MessageCircle className="mx-auto h-8 w-8 text-primary" />
                <p className="mt-3 text-sm font-black">No doubts asked yet.</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">Type a doubt or PYQ on the left to start learning with SahAI.</p>
              </div>
            )}
            {doubts?.map((doubt) => {
              const msg = followUpMessages[doubt.id] ?? "";
              return (
                <article key={doubt.id} className="rounded-2xl border border-border/70 bg-background/50 p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="rounded-xl bg-primary/10 p-2.5 text-primary"><MessageCircle className="h-5 w-5" /></span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-[0.12em] text-primary">{doubt.subject}</span>
                        {doubt.topic && <span className="text-xs font-semibold text-muted-foreground">· {doubt.topic}</span>}
                        <span className="ml-auto flex items-center gap-1 text-[0.68rem] font-bold text-muted-foreground"><Clock3 className="h-3 w-3" /> {new Date(doubt.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="mt-2 text-base font-black leading-6 text-foreground">{doubt.questionText}</p>
                    </div>
                  </div>

                  {doubt.aiResponse && (
                    <div className="rounded-2xl bg-card p-4 space-y-3 border border-border/60">
                      <div className="flex items-center gap-2 text-xs font-black text-foreground">
                        <BrainCircuit className="h-4 w-4 text-primary" /> SahAI Tutor Breakdown
                        <span className={`ml-auto rounded-full px-2 py-0.5 text-[0.65rem] font-bold ${doubt.status === "needsMentor" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>
                          {doubt.status === "needsMentor" ? "Mentor Review" : "AI Resolved"}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">{doubt.aiResponse}</p>
                    </div>
                  )}

                  <div className="flex flex-col gap-3 rounded-xl bg-muted/40 p-4">
                    <p className="text-xs font-bold text-foreground">Ask a follow-up question to SahAI:</p>
                    <div className="flex gap-2">
                      <Input
                        value={msg}
                        onChange={(event) => setFollowUpMessages({ ...followUpMessages, [doubt.id]: event.target.value })}
                        placeholder="e.g. Why did we integrate from 0 to R instead of 0 to infinity?"
                        className="h-10 text-xs bg-background"
                      />
                      <Button
                        size="sm"
                        disabled={!msg.trim() || followUp.isPending}
                        onClick={() => {
                          followUp.mutate({ id: doubt.id, message: msg.trim() });
                          setFollowUpMessages({ ...followUpMessages, [doubt.id]: "" });
                        }}
                        className="rounded-xl"
                      >
                        {followUp.isPending ? "Sending..." : "Reply"}
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between border-t border-border/60 pt-3">
                    {doubt.status !== "needsMentor" && doubt.status !== "resolved" ? (
                      <Button variant="outline" size="sm" onClick={() => escalate.mutate({ id: doubt.id })} className="rounded-full text-xs font-black">
                        <AlertCircle className="mr-1.5 h-3.5 w-3.5" /> Request Human Mentor
                      </Button>
                    ) : (
                      <span className="text-xs font-bold text-amber-600">Escalated to human mentor team</span>
                    )}
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Persistent Session
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </Card>
      </div>

      <section className="flex items-center gap-3 rounded-2xl border border-border bg-card/70 p-5 text-sm text-muted-foreground">
        <ArrowUpRight className="h-5 w-5 shrink-0 text-primary" />
        <p>Pro tip: SahAI retains context across follow-ups so you can drill down into any algebraic step or conceptual shortcut.</p>
      </section>
    </div>
  );
}
