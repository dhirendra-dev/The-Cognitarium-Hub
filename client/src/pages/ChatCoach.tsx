import { AlertCircle, ArrowUpRight, BookOpen, Loader, MessageCircle, RotateCcw, Send, Sparkles, Target } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Streamdown } from "streamdown";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface Message { id: string; sender: "user" | "anya"; text: string; timestamp: string; }
const SUBJECTS = ["Physics", "Chemistry", "Mathematics"] as const;
const PROMPTS = ["Explain this concept with a simple analogy", "Check where my solution goes wrong", "Give me a 15-minute revision plan"];
function formatTime(value: Date | string | number) { return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }
function introMessage(subject: string): Message { return { id: `intro-${subject}`, sender: "anya", text: `I’m Anya, your ${subject} study coach. Ask for a concept explanation, a solution debug, a comparison of methods, or a short revision plan. I’ll prioritise reasoning over memorisation.`, timestamp: formatTime(new Date()) }; }

export default function ChatCoach() {
  const [selectedSubject, setSelectedSubject] = useState<(typeof SUBJECTS)[number]>("Physics");
  const [messages, setMessages] = useState<Message[]>([introMessage("Physics")]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const utils = trpc.useUtils();
  const historyQuery = trpc.ai.getChatHistory.useQuery({ subject: selectedSubject });
  const askQuestionMutation = trpc.ai.askQuestion.useMutation();

  useEffect(() => {
    const persisted: Message[] = (historyQuery.data ?? []).flatMap((entry: any, index: number) => {
      const timestamp = formatTime(entry.createdAt ?? new Date());
      return [{ id: `history-user-${entry.id ?? index}`, sender: "user" as const, text: entry.question, timestamp }, ...(entry.answer ? [{ id: `history-anya-${entry.id ?? index}`, sender: "anya" as const, text: entry.answer, timestamp }] : [])];
    });
    setMessages([introMessage(selectedSubject), ...persisted]);
  }, [historyQuery.data, selectedSubject]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isLoading]);

  const handleSendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    const question = input.trim();
    if (!question || isLoading) return;
    const now = new Date(); setInput(""); setMessages((previous) => [...previous, { id: `user-${now.getTime()}`, sender: "user", text: question, timestamp: formatTime(now) }]); setIsLoading(true);
    try {
      const answer = await askQuestionMutation.mutateAsync({ subject: selectedSubject, question });
      setMessages((previous) => [...previous, { id: `anya-${Date.now()}`, sender: "anya", text: answer || "I could not produce an answer this time. Please try rephrasing the question.", timestamp: formatTime(new Date()) }]);
      await utils.ai.getChatHistory.invalidate({ subject: selectedSubject });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Chat Coach is temporarily unavailable.");
      setMessages((previous) => [...previous, { id: `error-${Date.now()}`, sender: "anya", text: "I couldn’t reach the coaching service. Please try again in a moment.", timestamp: formatTime(new Date()) }]);
    } finally { setIsLoading(false); }
  };

  const clearChat = () => { setMessages([introMessage(selectedSubject)]); setInput(""); };

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <section className="rounded-[2rem] border border-border bg-card p-6 shadow-sm sm:p-8"><div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><p className="ink-kicker flex items-center gap-2"><Sparkles className="h-3.5 w-3.5" /> AI-first, human-aware</p><h1 className="display-serif mt-3 text-4xl font-bold sm:text-5xl">Think out loud.</h1><p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">Chat Coach is here for the step where your notes stop being enough. Ask a real question, keep the answer in history, and escalate when the confusion deserves a human.</p></div><button onClick={clearChat} className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background/60 px-4 py-2.5 text-sm font-black transition-colors hover:bg-accent/35"><RotateCcw className="h-4 w-4" /> Clear view</button></div></section>

      <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
        <aside className="space-y-4"><div className="elevated-card rounded-[1.5rem] p-5"><div className="mb-5 flex items-center gap-3"><span className="rounded-xl bg-primary/10 p-2 text-primary"><Target className="h-5 w-5" /></span><div><p className="ink-kicker">Choose context</p><h2 className="text-lg font-black">Subject lens</h2></div></div><div className="space-y-2" role="tablist" aria-label="Select a subject">{SUBJECTS.map((subject) => <button key={subject} type="button" role="tab" aria-selected={selectedSubject === subject} onClick={() => setSelectedSubject(subject)} className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-black transition-colors focus-ring ${selectedSubject === subject ? "bg-primary text-primary-foreground shadow-md" : "bg-background/60 text-muted-foreground hover:bg-accent/30 hover:text-foreground"}`}><span>{subject}</span><ArrowUpRight className="h-4 w-4" /></button>)}</div></div><div className="elevated-card rounded-[1.5rem] p-5"><p className="ink-kicker">Try asking</p><div className="mt-4 space-y-2">{PROMPTS.map((prompt) => <button key={prompt} onClick={() => setInput(prompt)} className="flex w-full items-start gap-2 rounded-xl border border-border/70 bg-background/50 p-3 text-left text-xs font-bold leading-5 text-muted-foreground transition-colors hover:bg-accent/25 hover:text-foreground"><Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />{prompt}</button>)}</div></div><div className="rounded-[1.5rem] bg-accent/35 p-5"><BookOpen className="h-5 w-5 text-primary" /><p className="mt-3 text-sm font-black">Keep the loop short.</p><p className="mt-1 text-xs leading-5 text-muted-foreground">After a useful explanation, take one question in the Practice Lab so your mastery graph can learn from it.</p></div></aside>

        <section className="elevated-card flex min-h-[640px] flex-col overflow-hidden rounded-[1.75rem]"><div className="flex items-center justify-between border-b border-border/70 bg-card/70 px-5 py-4 sm:px-6"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><MessageCircle className="h-5 w-5" /></span><div><p className="text-sm font-black">{selectedSubject} coaching session</p><p className="text-xs font-semibold text-muted-foreground">{historyQuery.isLoading ? "Loading history…" : "Saved to your chat history"}</p></div></div>{historyQuery.isLoading && <Loader className="h-4 w-4 animate-spin text-primary" />}</div><div className="min-h-0 flex-1 space-y-5 overflow-y-auto bg-background/30 p-5 sm:p-7">{messages.map((message) => <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}><div className={`max-w-[92%] rounded-2xl px-4 py-3 sm:max-w-[78%] ${message.sender === "user" ? "bg-primary text-primary-foreground" : "border border-border bg-card"}`}><div className="prose prose-sm max-w-none dark:prose-invert"><Streamdown>{message.text}</Streamdown></div><p className="mt-2 text-[0.68rem] font-bold opacity-55">{message.sender === "user" ? "You" : "Anya"} · {message.timestamp}</p></div></div>)}{isLoading && <div className="flex justify-start"><div className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-bold text-muted-foreground"><Loader className="h-4 w-4 animate-spin text-primary" /> Anya is thinking…</div></div>}<div ref={messagesEndRef} /></div><div className="border-t border-border/70 bg-card/80 p-4 sm:p-5"><form onSubmit={handleSendMessage} className="flex gap-2"><label htmlFor="coach-question" className="sr-only">Ask Chat Coach</label><input id="coach-question" value={input} onChange={(event) => setInput(event.target.value)} placeholder={`Ask about ${selectedSubject}…`} className="min-w-0 flex-1 rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold outline-none placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/15" /><button type="submit" disabled={isLoading || !input.trim()} className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-black text-primary-foreground transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"><Send className="h-4 w-4" /><span className="hidden sm:inline">Ask</span></button></form>{historyQuery.isError && <p className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-amber-700"><AlertCircle className="h-3.5 w-3.5" /> Previous history could not be loaded; new answers can still be requested.</p>}</div></section>
      </div>
    </div>
  );
}
