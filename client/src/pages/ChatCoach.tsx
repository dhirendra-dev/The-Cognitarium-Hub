import { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Loader, MessageSquare, RotateCcw, Send, Sparkles } from "lucide-react";
import { Streamdown } from "streamdown";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface Message {
  id: string;
  sender: "user" | "anya";
  text: string;
  timestamp: string;
}

const SUBJECTS = ["Physics", "Chemistry", "Mathematics"] as const;

const MOTIVATIONAL_QUOTES = [
  "Consistency beats intensity. One well-understood problem is progress.",
  "Explain the idea in your own words before memorising the formula.",
  "When a solution feels difficult, identify the exact step where your model breaks.",
  "A short daily revision loop is more reliable than a last-minute marathon.",
];

function formatTime(value: Date | string | number) {
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function introMessage(subject: string): Message {
  return {
    id: `intro-${subject}`,
    sender: "anya",
    text: `Namaste! I’m Anya, your study coach for ${subject}. Ask me to explain a concept, debug a solution, compare methods, or create a short revision plan. I’ll prioritise clear reasoning and point out common exam traps.`,
    timestamp: formatTime(new Date()),
  };
}

export default function ChatCoach() {
  const [selectedSubject, setSelectedSubject] = useState<(typeof SUBJECTS)[number]>("Physics");
  const [messages, setMessages] = useState<Message[]>([introMessage("Physics")]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const utils = trpc.useUtils();

  const historyQuery = trpc.ai.getChatHistory.useQuery({ subject: selectedSubject });
  const askQuestionMutation = trpc.ai.askQuestion.useMutation();

  const quote = useMemo(
    () => MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)],
    []
  );

  useEffect(() => {
    const history = historyQuery.data ?? [];
    const persistedMessages: Message[] = history.flatMap((entry: any, index: number) => {
      const timestamp = formatTime(entry.createdAt ?? new Date());
      const pair: Message[] = [
        { id: `history-user-${entry.id ?? index}`, sender: "user", text: entry.question, timestamp },
      ];
      if (entry.answer) {
        pair.push({
          id: `history-anya-${entry.id ?? index}`,
          sender: "anya",
          text: entry.answer,
          timestamp,
        });
      }
      return pair;
    });
    setMessages([introMessage(selectedSubject), ...persistedMessages]);
  }, [historyQuery.data, selectedSubject]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    const question = input.trim();
    if (!question || isLoading) return;

    const now = new Date();
    setInput("");
    setMessages((previous) => [
      ...previous,
      { id: `user-${now.getTime()}`, sender: "user", text: question, timestamp: formatTime(now) },
    ]);
    setIsLoading(true);

    try {
      const answer = await askQuestionMutation.mutateAsync({
        subject: selectedSubject,
        question,
      });
      setMessages((previous) => [
        ...previous,
        {
          id: `anya-${Date.now()}`,
          sender: "anya",
          text: answer || "I could not produce an answer this time. Please try rephrasing the question.",
          timestamp: formatTime(new Date()),
        },
      ]);
      await utils.ai.getChatHistory.invalidate({ subject: selectedSubject });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Chat Coach is temporarily unavailable.";
      toast.error(message);
      setMessages((previous) => [
        ...previous,
        {
          id: `error-${Date.now()}`,
          sender: "anya",
          text: "I couldn’t reach the coaching service. Please try again in a moment.",
          timestamp: formatTime(new Date()),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([introMessage(selectedSubject)]);
    setInput("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-4 md:p-6">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-4xl flex-col">
        <header className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-purple-300" aria-hidden="true" />
              <h1 className="text-3xl font-bold text-white">Chat Coach</h1>
            </div>
            <p className="text-slate-300">Ask focused questions and receive step-by-step academic guidance.</p>
          </div>
          <button
            type="button"
            onClick={clearChat}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-400 hover:bg-slate-800"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Clear view
          </button>
        </header>

        <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="Select a subject">
          {SUBJECTS.map((subject) => (
            <button
              key={subject}
              type="button"
              role="tab"
              aria-selected={selectedSubject === subject}
              onClick={() => setSelectedSubject(subject)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                selectedSubject === subject
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-950/40"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {subject}
            </button>
          ))}
        </div>

        <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-700 bg-slate-900/80 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3 text-sm">
            <span className="font-semibold text-white">{selectedSubject} coaching session</span>
            {historyQuery.isLoading ? (
              <span className="inline-flex items-center gap-2 text-slate-400"><Loader className="h-4 w-4 animate-spin" />Loading history</span>
            ) : (
              <span className="text-slate-400">Saved to your chat history</span>
            )}
          </div>

          <div className="min-h-[22rem] flex-1 space-y-4 overflow-y-auto p-4 md:p-6">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[90%] rounded-xl px-4 py-3 md:max-w-[75%] ${message.sender === "user" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-100"}`}>
                  <div className="prose prose-invert prose-sm max-w-none"><Streamdown>{message.text}</Streamdown></div>
                  <p className="mt-2 text-xs opacity-60">{message.timestamp}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-3 text-sm text-slate-300">
                  <Loader className="h-4 w-4 animate-spin" /> Anya is thinking…
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-slate-700 bg-slate-950/40 p-4">
            <p className="mb-3 flex items-start gap-2 text-xs italic text-slate-400">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" />
              {quote}
            </p>
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <label htmlFor="coach-question" className="sr-only">Ask Chat Coach</label>
              <input
                id="coach-question"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={`Ask about ${selectedSubject}…`}
                className="min-w-0 flex-1 rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-3 font-semibold text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:bg-slate-700"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Ask</span>
              </button>
            </form>
            {historyQuery.isError && (
              <p className="mt-2 inline-flex items-center gap-2 text-xs text-amber-300"><AlertCircle className="h-3.5 w-3.5" /> Previous history could not be loaded; new answers can still be requested.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
